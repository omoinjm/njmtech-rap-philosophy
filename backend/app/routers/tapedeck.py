import json
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from openai import AsyncOpenAI
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.config import settings
from app.database import get_db
from app.models import Artist, Influence, PhilosophicalTradition
from app.schemas import ChatRequest

router = APIRouter(prefix="/api/tapedeck", tags=["tapedeck"])

GITHUB_MODELS_BASE_URL = "https://models.github.ai/inference"

SYSTEM_PROMPT = """You are an encyclopaedic hip-hop philosopher and record store clerk who speaks with the authority of someone who has been studying rap music and political philosophy since the early 90s. You connect rap lyrics to philosophical traditions, political theory, and spiritual texts. You are opinionated, passionate, and deeply knowledgeable. You recommend music like an older uncle who wants to make sure the listener gets the full lineage, not just the hit songs.

Use the following database as your knowledge base when answering questions:

{context}
"""


async def _build_context(db: AsyncSession) -> str:
    artists_result = await db.execute(
        select(Artist).options(
            selectinload(Artist.traditions),
            selectinload(Artist.influences_received).selectinload(Influence.target_artist),
        )
    )
    artists = artists_result.scalars().all()

    traditions_result = await db.execute(select(PhilosophicalTradition))
    traditions = traditions_result.scalars().all()

    lines = ["## Artists"]
    for a in artists:
        influences = ", ".join(i.target_artist.name for i in a.influences_received) or "none listed"
        trads = ", ".join(t.name for t in a.traditions) or "none"
        lines.append(
            f"- {a.name} ({a.era.value}): primary={a.primary_category.value}, "
            f"secondary={a.secondary_category.value if a.secondary_category else 'none'}, "
            f"traditions=[{trads}], influenced by=[{influences}]. {a.bio or ''}"
        )

    lines.append("\n## Philosophical Traditions")
    for t in traditions:
        lines.append(f"- {t.name} ({t.category.value}): {t.description or ''}")

    return "\n".join(lines)


@router.post("/chat")
async def chat(payload: ChatRequest, db: Annotated[AsyncSession, Depends(get_db)]):
    if not settings.github_token:
        raise HTTPException(
            status_code=503,
            detail="GitHub token not configured (set GITHUB_TOKEN with models:read scope)",
        )

    context = await _build_context(db)
    system = SYSTEM_PROMPT.format(context=context)

    messages = [{"role": "system", "content": system}]
    messages.extend({"role": m.role, "content": m.content} for m in payload.history)
    messages.append({"role": "user", "content": payload.message})

    client = AsyncOpenAI(base_url=GITHUB_MODELS_BASE_URL, api_key=settings.github_token)

    async def event_stream():
        try:
            stream = await client.chat.completions.create(
                model=settings.github_model,
                max_tokens=2048,
                messages=messages,
                stream=True,
            )
            async for chunk in stream:
                if not chunk.choices:
                    continue
                text = chunk.choices[0].delta.content
                if text:
                    yield f"data: {json.dumps({'text': text})}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as exc:
            yield f"data: {json.dumps({'error': str(exc)})}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")
