from pathlib import Path
from typing import Any

import aiosqlite
import httpx

from app.config import settings

def _migration_sql() -> str:
    candidates = [
        Path(__file__).resolve().parents[2] / "migrations/d1/0001_users.sql",
        Path("/migrations/d1/0001_users.sql"),
    ]
    for path in candidates:
        if path.exists():
            return path.read_text()
    raise FileNotFoundError("D1 migration SQL not found")


MIGRATION_SQL = _migration_sql()


class D1Client:
    """Cloudflare D1 in production; local SQLite (D1-compatible schema) for dev."""

    def __init__(self) -> None:
        self._use_remote = bool(
            settings.cloudflare_account_id
            and settings.d1_database_id
            and settings.cloudflare_api_token
        )

    async def init_schema(self) -> None:
        for statement in _split_sql(MIGRATION_SQL):
            await self.execute(statement)

    async def execute(self, sql: str, params: list[Any] | None = None) -> list[dict[str, Any]]:
        params = params or []
        if self._use_remote:
            return await self._remote_query(sql, params)
        return await self._local_query(sql, params)

    async def _remote_query(self, sql: str, params: list[Any]) -> list[dict[str, Any]]:
        url = (
            f"https://api.cloudflare.com/client/v4/accounts/{settings.cloudflare_account_id}"
            f"/d1/database/{settings.d1_database_id}/query"
        )
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                url,
                headers={"Authorization": f"Bearer {settings.cloudflare_api_token}"},
                json={"sql": sql, "params": params},
            )
        data = resp.json()
        if not resp.is_success or not data.get("success"):
            errors = data.get("errors", [{"message": resp.text}])
            raise RuntimeError(errors[0].get("message", "D1 query failed"))
        result = data.get("result", [{}])[0]
        return result.get("results", [])

    async def _local_query(self, sql: str, params: list[Any]) -> list[dict[str, Any]]:
        db_path = Path(settings.d1_local_path)
        db_path.parent.mkdir(parents=True, exist_ok=True)
        async with aiosqlite.connect(db_path) as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute(sql, params)
            if sql.strip().upper().startswith("SELECT"):
                rows = await cursor.fetchall()
                return [dict(row) for row in rows]
            await db.commit()
            return []


def _split_sql(sql: str) -> list[str]:
    return [s.strip() for s in sql.split(";") if s.strip()]


d1 = D1Client()
