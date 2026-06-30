"""JWT auth backed by Cloudflare D1 user store."""

from datetime import UTC, datetime, timedelta
from typing import Annotated
from uuid import uuid4

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.config import settings
from app.d1 import d1

security = HTTPBearer(auto_error=False)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)


def create_access_token(user_id: str, email: str) -> str:
    expire = datetime.now(UTC) + timedelta(hours=settings.jwt_expire_hours)
    payload = {"sub": user_id, "email": email, "exp": expire}
    return jwt.encode(payload, settings.jwt_secret, algorithm="HS256")


async def get_current_user_id(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security)],
) -> str | None:
    if credentials is None:
        return None
    try:
        payload = jwt.decode(credentials.credentials, settings.jwt_secret, algorithms=["HS256"])
        return payload.get("sub")
    except JWTError:
        return None


async def require_auth(user_id: Annotated[str | None, Depends(get_current_user_id)]) -> str:
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    return user_id


async def create_user(email: str, password: str) -> dict:
    user_id = str(uuid4())
    password_hash = hash_password(password)
    await d1.execute(
        "INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)",
        [user_id, email.lower(), password_hash],
    )
    return {"id": user_id, "email": email.lower()}


async def authenticate_user(email: str, password: str) -> dict | None:
    rows = await d1.execute(
        "SELECT id, email, password_hash FROM users WHERE email = ?",
        [email.lower()],
    )
    if not rows:
        return None
    user = rows[0]
    if not verify_password(password, user["password_hash"]):
        return None
    return {"id": user["id"], "email": user["email"]}


async def get_user_by_id(user_id: str) -> dict | None:
    rows = await d1.execute(
        "SELECT id, email, created_at FROM users WHERE id = ?",
        [user_id],
    )
    return rows[0] if rows else None
