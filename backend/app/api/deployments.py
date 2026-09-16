import time

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
ROLLOUT_TIMEOUT_SECONDS = 60
ROLLOUT_CHECK_INTERVAL_SECONDS = 3


def get_kubernetes_apps_api():
    try:
        config.load_incluster_config()
    except config.ConfigException:
        config.load_kube_config()

    return client.AppsV1Api()

def get_kubernetes_core_api():
    try:
        config.load_incluster_config()
    except config.ConfigException:
        config.load_kube_config()

    return client.CoreV1Api()

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

    container_name = (
        service.name
        .lower()
        .replace("_", "-")
        .replace(" ", "-")
    )

    container = client.V1Container(
        name=container_name,
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
        # If the Deployment already exists, update it instead of failing.
        try:
            apps_api.read_namespaced_deployment(
                name=deployment_name,
                namespace=KUBERNETES_NAMESPACE,
            )

            return apps_api.replace_namespaced_deployment(
                name=deployment_name,
                namespace=KUBERNETES_NAMESPACE,
                body=kubernetes_deployment,
            )

        except ApiException as error:
            if error.status != 404:
                raise error

            return apps_api.create_namespaced_deployment(
                namespace=KUBERNETES_NAMESPACE,
                body=kubernetes_deployment,
            )

    except ApiException as error:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Kubernetes API error: {error.reason}",
        )


def wait_for_deployment_ready(deployment_name: str):
    apps_api = get_kubernetes_apps_api()
    start_time = time.time()

    while time.time() - start_time < ROLLOUT_TIMEOUT_SECONDS:
        try:
            kubernetes_deployment = (
                apps_api.read_namespaced_deployment_status(
                    name=deployment_name,
                    namespace=KUBERNETES_NAMESPACE,
                )
            )

            status_data = kubernetes_deployment.status

            replicas = status_data.replicas or 0
            ready_replicas = status_data.ready_replicas or 0
            available_replicas = status_data.available_replicas or 0
            updated_replicas = status_data.updated_replicas or 0

            if (
                replicas >= 1
                and ready_replicas >= 1
                and available_replicas >= 1
                and updated_replicas >= 1
            ):
                return True

        except ApiException as error:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Kubernetes rollout check error: {error.reason}",
            )

        time.sleep(ROLLOUT_CHECK_INTERVAL_SECONDS)

    return False


def get_deployment_name(service: Service, deployment: Deployment):
    return (
        f"{service.name}-{deployment.environment}"
        .lower()
        .replace("_", "-")
        .replace(" ", "-")
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

    deployment_name = get_deployment_name(service, deployment)

    try:
        deployment.status = "in_progress"
        deployment.logs = "Creating Kubernetes Deployment..."
        db.commit()

        create_kubernetes_deployment(service, deployment)

        deployment.logs = (
            "Kubernetes Deployment created. "
            "Waiting for pod readiness..."
        )
        db.commit()

        is_ready = wait_for_deployment_ready(deployment_name)

        if is_ready:
            deployment.status = "successful"
            deployment.logs = (
                "Kubernetes Deployment created successfully. "
                "Pod is ready and available."
            )
        else:
            deployment.status = "failed"
            deployment.logs = (
                "Kubernetes Deployment was created, "
                "but the pod did not become ready within "
                f"{ROLLOUT_TIMEOUT_SECONDS} seconds."
            )

    except HTTPException as error:
        deployment.status = "failed"
        deployment.logs = str(error.detail)
        db.commit()
        raise error

    except Exception as error:
        deployment.status = "failed"
        deployment.logs = f"Deployment error: {str(error)}"
        db.commit()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Deployment failed",
        )

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
    "/{deployment_id}/details",
)
def get_deployment_details(
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

    service = (
        db.query(Service)
        .filter(Service.id == deployment.service_id)
        .first()
    )

    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found",
        )

    deployment_name = get_deployment_name(service, deployment)

    apps_api = get_kubernetes_apps_api()
    core_api = get_kubernetes_core_api()

    try:
        kubernetes_deployment = (
            apps_api.read_namespaced_deployment(
                name=deployment_name,
                namespace=KUBERNETES_NAMESPACE,
            )
        )

        pod_list = core_api.list_namespaced_pod(
            namespace=KUBERNETES_NAMESPACE,
            label_selector=f"app={deployment_name}",
        )

        deployment_status = kubernetes_deployment.status
        deployment_spec = kubernetes_deployment.spec

        pods = []

        for pod in pod_list.items:
            container_statuses = pod.status.container_statuses or []

            ready_containers = sum(
                1
                for container in container_statuses
                if container.ready
            )

            total_containers = len(container_statuses)

            pods.append(
                {
                    "name": pod.metadata.name,
                    "status": pod.status.phase,
                    "pod_ip": pod.status.pod_ip,
                    "node_name": pod.spec.node_name,
                    "ready_containers": ready_containers,
                    "total_containers": total_containers,
                    "created_at": (
                        pod.metadata.creation_timestamp.isoformat()
                        if pod.metadata.creation_timestamp
                        else None
                    ),
                    "containers": [
                        {
                            "name": container.name,
                            "image": container.image,
                            "ready": next(
                                (
                                    item.ready
                                    for item in container_statuses
                                    if item.name == container.name
                                ),
                                False,
                            ),
                            "restart_count": next(
                                (
                                    item.restart_count
                                    for item in container_statuses
                                    if item.name == container.name
                                ),
                                0,
                            ),
                        }
                        for container in pod.spec.containers
                    ],
                }
            )

        return {
            "deployment_id": deployment.id,
            "deployment_name": deployment_name,
            "service_name": service.name,
            "version": deployment.version,
            "environment": deployment.environment,
            "database_status": deployment.status,
            "image_tag": deployment.image_tag,
            "deployed_by": deployment.deployed_by,
            "logs": deployment.logs,
            "kubernetes": {
                "namespace": KUBERNETES_NAMESPACE,
                "replicas": deployment_spec.replicas or 0,
                "available_replicas": (
                    deployment_status.available_replicas or 0
                ),
                "ready_replicas": (
                    deployment_status.ready_replicas or 0
                ),
                "updated_replicas": (
                    deployment_status.updated_replicas or 0
                ),
                "pods": pods,
            },
        }

    except ApiException as error:
        if error.status == 404:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=(
                    "Kubernetes Deployment not found: "
                    f"{deployment_name}"
                ),
            )

        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Kubernetes API error: {error.reason}",
        )
        
        
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