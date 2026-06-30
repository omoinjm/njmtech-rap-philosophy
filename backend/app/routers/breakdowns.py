import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.auth import require_auth
from app.database import get_db
from app.models import LyricBreakdown, Track
from app.schemas import BreakdownCreate, BreakdownOut

router = APIRouter(prefix="/api/breakdowns", tags=["breakdowns"])


def _to_breakdown_out(b: LyricBreakdown) -> BreakdownOut:
    return BreakdownOut(
        id=b.id,
        track_id=b.track_id,
        track_title=b.track.title,
        artist_name=b.track.artist.name,
        lyric_excerpt=b.lyric_excerpt,
        philosophical_analysis=b.philosophical_analysis,
        tradition_id=b.tradition_id,
        tradition_name=b.tradition.name if b.tradition else None,
        is_curated=b.is_curated,
    )


@router.get("", response_model=list[BreakdownOut])
async def list_breakdowns(
    db: Annotated[AsyncSession, Depends(get_db)],
    tradition_id: uuid.UUID | None = Query(None),
):
    query = (
        select(LyricBreakdown)
        .options(
            selectinload(LyricBreakdown.track).selectinload(Track.artist),
            selectinload(LyricBreakdown.tradition),
        )
        .order_by(LyricBreakdown.is_curated.desc())
    )
    if tradition_id:
        query = query.where(LyricBreakdown.tradition_id == tradition_id)
    result = await db.execute(query)
    return [_to_breakdown_out(b) for b in result.scalars().all()]


@router.get("/track/{track_id}", response_model=list[BreakdownOut])
async def get_breakdowns_for_track(track_id: uuid.UUID, db: Annotated[AsyncSession, Depends(get_db)]):
    result = await db.execute(
        select(LyricBreakdown)
        .where(LyricBreakdown.track_id == track_id)
        .options(
            selectinload(LyricBreakdown.track).selectinload(Track.artist),
            selectinload(LyricBreakdown.tradition),
        )
    )
    return [_to_breakdown_out(b) for b in result.scalars().all()]


@router.post("", response_model=BreakdownOut, status_code=201)
async def create_breakdown(
    payload: BreakdownCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user_id: Annotated[str, Depends(require_auth)],
):
    track_result = await db.execute(select(Track).where(Track.id == payload.track_id))
    if not track_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Track not found")

    breakdown = LyricBreakdown(
        track_id=payload.track_id,
        lyric_excerpt=payload.lyric_excerpt,
        philosophical_analysis=payload.philosophical_analysis,
        tradition_id=payload.tradition_id,
        submitted_by=uuid.UUID(user_id),
        is_curated=False,
    )
    db.add(breakdown)
    await db.commit()
    await db.refresh(breakdown, attribute_names=["track", "tradition"])
    result = await db.execute(
        select(LyricBreakdown)
        .where(LyricBreakdown.id == breakdown.id)
        .options(
            selectinload(LyricBreakdown.track).selectinload(Track.artist),
            selectinload(LyricBreakdown.tradition),
        )
    )
    return _to_breakdown_out(result.scalar_one())
