from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import PhilosophicalTradition
from app.schemas import TraditionOut

router = APIRouter(prefix="/api/traditions", tags=["traditions"])


@router.get("", response_model=list[TraditionOut])
async def list_traditions(db: Annotated[AsyncSession, Depends(get_db)]):
    result = await db.execute(select(PhilosophicalTradition).order_by(PhilosophicalTradition.name))
    return result.scalars().all()
