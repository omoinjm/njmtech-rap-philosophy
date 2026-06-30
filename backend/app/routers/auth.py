from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.auth import (
    authenticate_user,
    create_access_token,
    create_user,
    get_current_user_id,
    get_user_by_id,
)
from app.d1 import d1
from app.schemas.auth import AuthResponse, LoginRequest, RegisterRequest, UserOut

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=AuthResponse, status_code=201)
async def register(payload: RegisterRequest):
    rows = await d1.execute("SELECT id FROM users WHERE email = ?", [payload.email.lower()])
    if rows:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = await create_user(payload.email, payload.password)
    token = create_access_token(user["id"], user["email"])
    return AuthResponse(access_token=token, user=UserOut(**user))


@router.post("/login", response_model=AuthResponse)
async def login(payload: LoginRequest):
    user = await authenticate_user(payload.email, payload.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    token = create_access_token(user["id"], user["email"])
    return AuthResponse(access_token=token, user=UserOut(**user))


@router.get("/me", response_model=UserOut)
async def me(user_id: Annotated[str | None, Depends(get_current_user_id)]):
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    user = await get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return UserOut(id=user["id"], email=user["email"])
