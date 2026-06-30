import uuid

from pydantic import BaseModel, ConfigDict

from app.models.enums import Era, PhilosophicalCategory


class LineageNode(BaseModel):
    id: str
    name: str
    era: Era
    primary_category: PhilosophicalCategory
    image_url: str | None


class LineageEdge(BaseModel):
    id: str
    source: str
    target: str
    label: str | None
    strength: int


class LineageGraph(BaseModel):
    nodes: list[LineageNode]
    edges: list[LineageEdge]


class CompassQuadrant(BaseModel):
    category: PhilosophicalCategory
    label: str
    description: str
    artists: list[LineageNode]
