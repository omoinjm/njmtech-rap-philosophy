from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import async_session, engine
from app.d1 import d1
from app.routers import artists, auth, breakdowns, compass, lineage, tapedeck, traditions, tracks
from app.seed import seed_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    await d1.init_schema()

    async with async_session() as session:
        await seed_database(session)

    yield

    await engine.dispose()


app = FastAPI(
    title="The 37th Chamber API",
    description="Rap Philosophy exploration platform",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(artists.router)
app.include_router(lineage.router)
app.include_router(compass.router)
app.include_router(tracks.router)
app.include_router(breakdowns.router)
app.include_router(traditions.router)
app.include_router(tapedeck.router)


@app.get("/")
async def root():
    return {"message": "The 37th Chamber API", "status": "online"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
