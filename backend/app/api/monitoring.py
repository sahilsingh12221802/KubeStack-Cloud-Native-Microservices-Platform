import os

import requests
from fastapi import APIRouter, HTTPException, status


router = APIRouter(
    prefix="/api/monitoring",
    tags=["Monitoring"],
)

PROMETHEUS_URL = os.getenv(
    "PROMETHEUS_URL",
    "http://127.0.0.1:9090",
)


def query_prometheus(query: str):
    try:
        response = requests.get(
            f"{PROMETHEUS_URL}/api/v1/query",
            params={"query": query},
            timeout=5,
        )

        response.raise_for_status()

        data = response.json()

        if data.get("status") != "success":
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Prometheus query failed.",
            )

        results = data.get("data", {}).get("result", [])

        if not results:
            return 0

        return float(results[0]["value"][1])

    except requests.RequestException as error:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Unable to connect to Prometheus: {error}",
        )


@router.get("/metrics")
def get_infrastructure_metrics():
    cpu_cores = query_prometheus(
        'sum(rate(container_cpu_usage_seconds_total{namespace="kubestack"}[5m]))'
    )

    memory_bytes = query_prometheus(
        'sum(container_memory_working_set_bytes{namespace="kubestack"})'
    )

    pod_restarts = query_prometheus(
        'sum(kube_pod_container_status_restarts_total{namespace="kubestack"})'
    )

    desired_replicas = query_prometheus(
        'sum(kube_deployment_spec_replicas{namespace="kubestack"})'
    )

    available_replicas = query_prometheus(
        'sum(kube_deployment_status_replicas_available{namespace="kubestack"})'
    )

    return {
        "cpu": {
            "cores": round(cpu_cores, 4),
            "millicores": round(cpu_cores * 1000, 1),
        },
        "memory": {
            "bytes": int(memory_bytes),
            "mib": round(memory_bytes / (1024 * 1024), 1),
        },
        "pods": {
            "restarts": int(pod_restarts),
            "desired_replicas": int(desired_replicas),
            "available_replicas": int(available_replicas),
        },
    }
