from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ProjectCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    description: str | None = None
    owner: str = Field(min_length=2, max_length=100)
    environment: str = "development"


class ProjectUpdate(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=2,
        max_length=100,
    )
    description: str | None = None
    owner: str | None = Field(
        default=None,
        min_length=2,
        max_length=100,
    )
    environment: str | None = None


class ProjectResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str | None
    owner: str
    environment: str
    created_at: datetime