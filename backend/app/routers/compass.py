from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Artist
from app.models.enums import PhilosophicalCategory
from app.schemas import CompassQuadrant, LineageNode

router = APIRouter(prefix="/api/compass", tags=["compass"])

CATEGORY_META: dict[PhilosophicalCategory, tuple[str, str]] = {
    PhilosophicalCategory.epistemology_mysticism: (
        "Epistemology & Mysticism",
        "Knowledge of self, Supreme Mathematics, spiritual cipher — the path inward.",
    ),
    PhilosophicalCategory.street_stoicism: (
        "Street Stoicism",
        "Endurance under pressure, criminal discipline, measured narrative over luxury loops.",
    ),
    PhilosophicalCategory.social_ethics: (
        "Social Ethics",
        "Community consciousness, Afrocentric humanism, the cipher as democratic space.",
    ),
    PhilosophicalCategory.revolutionary_geopolitics: (
        "Revolutionary Geopolitics",
        "Class analysis, guerrilla rhetoric, uncompromising critique of power structures.",
    ),
}


@router.get("", response_model=list[CompassQuadrant])
async def get_compass(db: Annotated[AsyncSession, Depends(get_db)]):
    result = await db.execute(select(Artist).order_by(Artist.name))
    artists = result.scalars().all()

    quadrants: list[CompassQuadrant] = []
    for category in PhilosophicalCategory:
        label, description = CATEGORY_META[category]
        category_artists = [a for a in artists if a.primary_category == category]
        quadrants.append(
            CompassQuadrant(
                category=category,
                label=label,
                description=description,
                artists=[
                    LineageNode(
                        id=str(a.id),
                        name=a.name,
                        era=a.era,
                        primary_category=a.primary_category,
                        image_url=a.image_url,
                    )
                    for a in category_artists
                ],
            )
        )
    return quadrants
