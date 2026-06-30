import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models import Artist, Influence
from app.models.enums import Era, PhilosophicalCategory
from app.schemas import ArtistDetail, ArtistListItem, InfluenceBrief, TraditionBrief

router = APIRouter(prefix="/api/artists", tags=["artists"])


@router.get("", response_model=list[ArtistListItem])
async def list_artists(
    db: Annotated[AsyncSession, Depends(get_db)],
    era: Era | None = None,
    category: PhilosophicalCategory | None = None,
):
    query = select(Artist).order_by(Artist.name)
    if era:
        query = query.where(Artist.era == era)
    if category:
        query = query.where(Artist.primary_category == category)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{artist_id}", response_model=ArtistDetail)
async def get_artist(artist_id: uuid.UUID, db: Annotated[AsyncSession, Depends(get_db)]):
    result = await db.execute(
        select(Artist)
        .where(Artist.id == artist_id)
        .options(
            selectinload(Artist.traditions),
            selectinload(Artist.influences_received).selectinload(Influence.target_artist),
        )
    )
    artist = result.scalar_one_or_none()
    if not artist:
        raise HTTPException(status_code=404, detail="Artist not found")

    influences = [
        InfluenceBrief(
            id=inf.id,
            target_artist_id=inf.target_artist_id,
            target_artist_name=inf.target_artist.name,
            connection_label=inf.connection_label,
            strength=inf.strength,
        )
        for inf in artist.influences_received
    ]

    return ArtistDetail(
        id=artist.id,
        name=artist.name,
        era=artist.era,
        primary_category=artist.primary_category,
        secondary_category=artist.secondary_category,
        bio=artist.bio,
        spotify_artist_id=artist.spotify_artist_id,
        image_url=artist.image_url,
        created_at=artist.created_at,
        traditions=[TraditionBrief.model_validate(t) for t in artist.traditions],
        influences=influences,
    )
