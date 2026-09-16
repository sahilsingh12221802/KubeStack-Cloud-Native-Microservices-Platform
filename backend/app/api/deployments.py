from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from kubernetes import client, config
from kubernetes.client.rest import ApiException

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

KUBERNETES_NAMESPACE = "kubestack"


def get_kubernetes_apps_api():
    try:
        config.load_incluster_config()
    except config.ConfigException:
        config.load_kube_config()

    return client.AppsV1Api()


def create_kubernetes_deployment(
    service: Service,
    deployment: Deployment,
):
    if not deployment.image_tag:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="image_tag is required to create a Kubernetes deployment",
        )

    apps_api = get_kubernetes_apps_api()

    deployment_name = (
        f"{service.name}-{deployment.environment}"
        .lower()
        .replace("_", "-")
        .replace(" ", "-")
    )

    container = client.V1Container(
        name=service.name.lower().replace("_", "-").replace(" ", "-"),
        image=deployment.image_tag,
        ports=[
            client.V1ContainerPort(container_port=8000),
        ],
    )

    pod_template = client.V1PodTemplateSpec(
        metadata=client.V1ObjectMeta(
            labels={
                "app": deployment_name,
                "managed-by": "kubestack",
            }
        ),
        spec=client.V1PodSpec(
            containers=[container]
        ),
    )

    deployment_spec = client.V1DeploymentSpec(
        replicas=1,
        selector=client.V1LabelSelector(
            match_labels={"app": deployment_name}
        ),
        template=pod_template,
    )

    kubernetes_deployment = client.V1Deployment(
        metadata=client.V1ObjectMeta(
            name=deployment_name,
            labels={"managed-by": "kubestack"},
        ),
        spec=deployment_spec,
    )

    try:
        return apps_api.create_namespaced_deployment(
            namespace=KUBERNETES_NAMESPACE,
            body=kubernetes_deployment,
        )
    except ApiException as error:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Kubernetes API error: {error.reason}",
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

    try:
        create_kubernetes_deployment(service, deployment)

        deployment.status = "successful"
        deployment.logs = "Kubernetes Deployment created successfully."

    except HTTPException as error:
        deployment.status = "failed"
        deployment.logs = str(error.detail)
        db.commit()
        raise error

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
