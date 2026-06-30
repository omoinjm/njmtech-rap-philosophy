import uuid

from pydantic import BaseModel, ConfigDict, Field


class BreakdownOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    track_id: uuid.UUID
    track_title: str
    artist_name: str
    lyric_excerpt: str
    philosophical_analysis: str
    tradition_id: uuid.UUID | None
    tradition_name: str | None
    is_curated: bool


class BreakdownCreate(BaseModel):
    track_id: uuid.UUID
    lyric_excerpt: str = Field(min_length=10, max_length=2000)
    philosophical_analysis: str = Field(min_length=20, max_length=10000)
    tradition_id: uuid.UUID | None = None
