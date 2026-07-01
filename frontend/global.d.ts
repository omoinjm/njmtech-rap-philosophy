/** Minimal Cloudflare Workers types for local typechecking (CI). */
interface Fetcher {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>
}
