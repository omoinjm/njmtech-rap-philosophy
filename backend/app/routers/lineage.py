from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Artist, Influence
from app.schemas import LineageEdge, LineageGraph, LineageNode

router = APIRouter(prefix="/api/lineage", tags=["lineage"])


@router.get("", response_model=LineageGraph)
async def get_lineage(db: Annotated[AsyncSession, Depends(get_db)]):
    artists_result = await db.execute(select(Artist).order_by(Artist.name))
    artists = artists_result.scalars().all()

    influences_result = await db.execute(select(Influence))
    influences = influences_result.scalars().all()

    nodes = [
        LineageNode(
            id=str(a.id),
            name=a.name,
            era=a.era,
            primary_category=a.primary_category,
            image_url=a.image_url,
        )
        for a in artists
    ]

    edges = [
        LineageEdge(
            id=str(e.id),
            source=str(e.source_artist_id),
            target=str(e.target_artist_id),
            label=e.connection_label,
            strength=e.strength,
        )
        for e in influences
    ]

    return LineageGraph(nodes=nodes, edges=edges)
