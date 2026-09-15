from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.deployment import Deployment
from app.models.service import Service
from app.schemas.deployment import (
    DeploymentCreate,
    DeploymentResponse,
    DeploymentUpdate,
)

router = APIRouter(
    prefix="/api/deployments",
    tags=["Deployments"],
)


@router.post(
    "",
    response_model=DeploymentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_deployment(
    deployment_data: DeploymentCreate,
    db: Session = Depends(get_db),
):
    service = (
        db.query(Service)
        .filter(Service.id == deployment_data.service_id)
        .first()
    )

    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found",
        )

    deployment = Deployment(**deployment_data.model_dump())

    db.add(deployment)
    db.commit()
    db.refresh(deployment)

    return deployment


@router.get(
    "",
    response_model=list[DeploymentResponse],
)
def get_deployments(
    service_id: int | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(Deployment)

    if service_id is not None:
        query = query.filter(Deployment.service_id == service_id)

    return query.order_by(Deployment.created_at.desc()).all()


@router.get(
    "/{deployment_id}",
    response_model=DeploymentResponse,
)
def get_deployment(
    deployment_id: int,
    db: Session = Depends(get_db),
):
    deployment = (
        db.query(Deployment)
        .filter(Deployment.id == deployment_id)
        .first()
    )

    if not deployment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deployment not found",
        )

    return deployment


@router.put(
    "/{deployment_id}",
    response_model=DeploymentResponse,
)
def update_deployment(
    deployment_id: int,
    deployment_data: DeploymentUpdate,
    db: Session = Depends(get_db),
):
    deployment = (
        db.query(Deployment)
        .filter(Deployment.id == deployment_id)
        .first()
    )

    if not deployment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deployment not found",
        )

    update_data = deployment_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(deployment, field, value)

    db.commit()
    db.refresh(deployment)

    return deployment


@router.delete(
    "/{deployment_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_deployment(
    deployment_id: int,
    db: Session = Depends(get_db),
):
    deployment = (
        db.query(Deployment)
        .filter(Deployment.id == deployment_id)
        .first()
    )

    if not deployment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deployment not found",
        )

    db.delete(deployment)
    db.commit()

    return None