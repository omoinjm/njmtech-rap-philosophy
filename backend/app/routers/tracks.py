import uuid
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Track
from app.schemas import TrackOut

router = APIRouter(prefix="/api/tracks", tags=["tracks"])


@router.get("/{artist_id}", response_model=list[TrackOut])
async def get_tracks_for_artist(artist_id: uuid.UUID, db: Annotated[AsyncSession, Depends(get_db)]):
    result = await db.execute(select(Track).where(Track.artist_id == artist_id).order_by(Track.year))
    return result.scalars().all()
