# RAG plan — Tape Deck context + latency

This document plans how to replace the current **full-database system prompt** with **retrieval-augmented generation (RAG)**, and how to reduce end-to-end chat latency.

**Scope:** Tape Deck (`POST /api/tapedeck/chat`) only. Cipher breakdowns stay human-curated.

---

## Current behavior (baseline)

On every chat message the worker:

1. Runs **~11 D1 queries** (`buildChatContext`) — one per artist for traditions/influences, plus artists + traditions tables.
2. Serializes **all 9 artists + all traditions** into the system prompt (~3–8 KB text today; grows with catalog).
3. Sends the full prompt + conversation history to **GitHub Models** (`openai/gpt-4o` default).
4. Streams tokens back via SSE.

### Latency budget (typical)

| Stage | Estimate | Notes |
|---|---|---|
| D1 context build | 50–200 ms | N+1 query pattern; scales linearly with artist count |
| GitHub Models TTFB | 300 ms – 2 s | Network + model queue |
| Token streaming | 1–5 s | Depends on response length |
| **Total to first token** | **~0.5–2.5 s** | Dominated by LLM, but D1 adds fixed overhead |

### Problems at scale

- **Token cost** — entire catalog in every request even for “Who is Roc Marciano?”
- **Context window** — history + catalog + breakdowns will eventually hit limits
- **Latency** — D1 work happens on the critical path before the LLM call
- **Quality** — model may ignore or misread buried facts in a long static blob

---

## Target architecture

```
User message
    │
    ▼
┌─────────────────┐
│ Query analysis  │  optional: extract artist names, tradition, intent (cheap / rules)
└────────┬────────┘
         ▼
┌─────────────────┐
│ Retrieval       │  top-k chunks from Vectorize (or keyword fallback)
└────────┬────────┘
         ▼
┌─────────────────┐
│ Prompt assembly │  system persona + retrieved chunks + recent history (trimmed)
└────────┬────────┘
         ▼
┌─────────────────┐
│ LLM (stream)    │  GitHub Models / Workers AI / Claude
└─────────────────┘
```

**Principle:** Send only **relevant** artist bios, traditions, influences, and lyric breakdowns — not the full catalog.

---

## What to index (corpus design)

Chunk types (one chunk ≈ 200–600 tokens each):

| Source table | Chunk content | Metadata filters |
|---|---|---|
| `artists` | name, era, categories, bio | `artist_id`, `era`, `category` |
| `influences` | “X influenced by Y (label, strength)” | `source_artist_id`, `target_artist_id` |
| `philosophical_traditions` | name, category, description | `tradition_id`, `category` |
| `artist_traditions` | join rows as short statements | `artist_id`, `tradition_id` |
| `lyric_breakdowns` (curated) | excerpt + analysis | `artist_id`, `track_id`, `tradition_id` |

**Chunking rules:**

- One artist bio = 1 chunk (catalog is small today; split bios if they grow).
- One breakdown = 1 chunk (excerpt + analysis together).
- Traditions = 1 chunk each.
- Influence edges: batch per artist (“Influences of X: …”) to avoid tiny fragments.

**Estimated corpus size today:** ~30–40 chunks → well within Vectorize free tier for a hobby project.

---

## Cloudflare stack options

### Option A — **Vectorize + Workers AI embeddings** (recommended)

| Component | Role |
|---|---|
| **Workers AI** `@cf/baai/bge-base-en-v1.5` (or similar) | Embed query + documents at index time |
| **Vectorize** | Store vectors + metadata; `query()` with filters |
| **D1** | Source of truth; re-index on migration/seed |
| **Worker cron / manual script** | `npm run rag:reindex` after data changes |

**Pros:** Native to Cloudflare, low latency (same PoP), no external vector DB bill.  
**Cons:** One-time index pipeline to build; embedding model adds ~50–150 ms per query unless cached.

### Option B — **Keyword / SQL retrieval first** (fast MVP, no Vectorize)

Before investing in vectors:

1. Detect artist names in user message (fuzzy match against `artists.name`).
2. If match → fetch that artist + influences + traditions + breakdowns only.
3. If no match → fetch compass categories summary + top 3 artists by era keyword.

**Pros:** Zero new infra; huge latency win immediately; easy to ship.  
**Cons:** Misses semantic queries (“stoic rappers from Buffalo”); not true RAG.

**Recommendation:** Ship **Option B as Phase 1**, then **Option A as Phase 2**.

### Option C — **Cloudflare AI Search** (managed RAG)

Fully managed ingestion + retrieval if you want less custom code. Evaluate pricing and whether D1 → AI Search sync fits your deploy model.

---

## Retrieval strategy (Phase 2 detail)

### Indexing pipeline

```
migrations/seed change
       │
       ▼
rag/reindex.ts (wrangler script or worker route protected by admin)
       │
       ├── Read all rows from D1
       ├── Build chunks (see corpus table)
       ├── Batch embed via Workers AI
       └── Upsert into Vectorize index "chamber-knowledge"
```

Store in Vectorize metadata: `type`, `artist_id`, `tradition_id`, `title` for filtered search.

### Query-time retrieval

```typescript
// Pseudocode
const queryEmbedding = await embed(userMessage)
const results = await env.VECTORIZE.query(queryEmbedding, {
  topK: 8,
  returnMetadata: true,
  filter: detectedArtistId ? { artist_id: detectedArtistId } : undefined,
})
const context = results.matches.map(m => m.metadata.text).join('\n\n')
```

### Hybrid retrieval (best quality)

Combine:

- **Vector top-k** (semantic)
- **Keyword artist detection** (high precision when user names someone)
- **Always include** 1–2 “global” chunks (site mission, compass overview) for orientation

---

## Latency reduction (all phases)

### 1. Remove work from the critical path

| Technique | Impact |
|---|---|
| **Cache `buildChatContext` output** in Worker cache / KV (TTL 5–15 min) | Eliminates D1 on every message until data changes |
| **Parallel D1 queries** (Promise.all per artist batch) | Cuts context build from sequential to ~1 round-trip |
| **Single SQL view** instead of N+1 | One query for artist+traditions+influences JSON |

### 2. Smaller prompts = faster + cheaper

| Technique | Impact |
|---|---|
| RAG top-k (8 chunks vs full catalog) | Fewer input tokens → lower TTFB |
| **Trim history** — last 6 turns only, summarize older | Caps input size |
| **Shorter system prompt** — persona without repeating rules | Small but free win |

### 3. Model / provider

| Technique | Impact |
|---|---|
| **`GITHUB_MODEL=openai/gpt-4o-mini`** for simple Q&A | Lower cost, often faster TTFB |
| Route complex questions to `gpt-4o` (future classifier) | Balance quality vs speed |
| **Workers AI** `@cf/meta/llama-*` on same edge | Removes round-trip to GitHub; test quality for persona |

### 4. Streaming UX (perceived latency)

Already implemented (SSE). Additional wins:

- Send **`data: {"status":"thinking"}`** immediately after retrieval completes
- Show retrieved artist names in UI (“Drawing from: Roc Marciano, Stoicism…”)

### 5. Precompute at deploy

- Run reindex after `db:migrate:remote`
- Warm KV cache with compass + artist list JSON

---

## Suggested implementation phases

### Phase 1 — Smart SQL context (1–2 focused PRs)

- [ ] Replace `buildChatContext()` with `buildRelevantContext(db, userMessage)`
- [ ] Artist name detection + tradition keyword map
- [ ] Fallback: compact catalog summary (~500 tokens) instead of full dump
- [ ] Parallelize remaining D1 queries
- [ ] KV cache keyed by `context:v1` with invalidation on seed version

**Expected win:** D1 50–200 ms → 10–40 ms; prompt tokens −60–80%.

### Phase 2 — Vectorize RAG

- [ ] Add Vectorize binding + Workers AI embedding binding to `wrangler.jsonc`
- [ ] `worker/src/rag/reindex.ts` + `npm run rag:reindex`
- [ ] `worker/src/rag/retrieve.ts` used by `/api/tapedeck/chat`
- [ ] Include curated breakdowns in index
- [ ] Admin-only `POST /api/admin/rag/reindex` for production refresh

**Expected win:** Better answers on vague queries; further token reduction.

### Phase 3 — Model routing + observability

- [ ] Log: retrieval ms, embed ms, LLM TTFB, tokens in/out (Analytics Engine)
- [ ] Optional mini model for retrieval query expansion
- [ ] A/B: full context vs RAG on eval set of 20 canonical questions

---

## Evaluation set (use before/after each phase)

Keep 20 fixed prompts and score manually (1–5):

1. “Who influenced Roc Marciano?”
2. “Compare Wu-Tang to Griselda philosophically”
3. “Recommend a stoic rapper I might not know”
4. “What tradition is Kill Bill Radio?”
5. “Break down a Westside Gunn line about wrestling”
6. … (add 15 more covering each artist + each tradition)

Track: **accuracy**, **latency to first token**, **input tokens/request**.

---

## Open decisions

| Question | Options |
|---|---|
| Embed breakdowns only curated? | Yes initially — pending submissions are not canon |
| Reindex trigger | Manual script vs cron vs post-migrate hook |
| Vectorize index name | `chamber-knowledge-v1` |
| Keep GitHub Models? | Yes for now; evaluate Workers AI Llama for cost/latency |
| Auth on Tape Deck? | Optional — rate limits exist; login could enable higher tiers |

---

## Related files (today)

| File | Role |
|---|---|
| `worker/src/index.ts` | `buildChatContext`, `/api/tapedeck/chat` |
| `worker/src/rate-limit.ts` | Per-IP chat rate limit (20/min) |
| `worker/src/request-guards.ts` | Body size + history caps |
| `worker/src/seed.ts` | Source data for future index |

---

## Summary

**Short term:** Replace full-catalog injection with **keyword/SQL retrieval + caching** — biggest latency and cost win with minimal new infrastructure.

**Medium term:** Add **Vectorize + Workers AI embeddings** for semantic search over artists, traditions, influences, and curated breakdowns.

**Always:** Stream responses, trim history, measure TTFB, and keep the corpus small enough that retrieval stays under ~100 ms on the edge.
