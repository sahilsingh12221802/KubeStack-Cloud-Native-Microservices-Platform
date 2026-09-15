from contextlib import asynccontextmanager

from fastapi import FastAPI
from sqlalchemy import text

from app.database import Base, engine
from app.models.project import Project
from app.api.projects import router as projects_router
from app.api.services import router as services_router
from app.models.service import Service


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="KubeStack API",
    description="Cloud-Native Developer Platform",
    version="0.2.0",
    lifespan=lifespan,
)

app.include_router(projects_router)
app.include_router(services_router)

@app.get("/")
def root():
    return {
        "message": "Welcome to KubeStack API",
        "version": "0.2.0",
        "status": "running",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "kubestack-api",
    }


@app.get("/health/database")
def database_health():
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))

    return {
        "status": "healthy",
        "database": "postgresql",
    }