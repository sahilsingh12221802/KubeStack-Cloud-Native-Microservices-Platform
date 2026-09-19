from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


DeploymentStatus = Literal[
    "pending",
    "in_progress",
    "successful",
    "failed",
    "rolled_back",
]


class DeploymentBase(BaseModel):
    service_id: int
    version: str
    environment: str = "development"
    status: DeploymentStatus = "pending"
    image_tag: str | None = None
    deployed_by: str | None = None
    logs: str | None = None


class DeploymentCreate(DeploymentBase):
    pass


class DeploymentUpdate(BaseModel):
    version: str | None = None
    environment: str | None = None
    status: DeploymentStatus | None = None
    image_tag: str | None = None
    deployed_by: str | None = None
    logs: str | None = None


class DeploymentScale(BaseModel):
    replicas: int = Field(..., ge=1, le=10)

class DeploymentResponse(DeploymentBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)