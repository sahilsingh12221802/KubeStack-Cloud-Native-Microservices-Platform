from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ServiceCreate(BaseModel):
    project_id: int
    name: str = Field(min_length=2, max_length=100)
    description: str | None = None
    technology: str = Field(min_length=2, max_length=100)
    repository_url: str | None = None
    environment: str = "development"
    status: str = "active"
    version: str = "v0.1.0"


class ServiceUpdate(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=2,
        max_length=100,
    )
    description: str | None = None
    technology: str | None = None
    repository_url: str | None = None
    environment: str | None = None
    status: str | None = None
    version: str | None = None


class ServiceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    project_id: int
    name: str
    description: str | None
    technology: str
    repository_url: str | None
    environment: str
    status: str
    version: str
    created_at: datetime