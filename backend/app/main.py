
from fastapi import FastAPI

app = FastAPI(
    title="KubeStack API",
    description="Cloud-Native Developer Platform",
    version="0.1.0",
)


@app.get("/")
def root():
    return {
        "message": "Welcome to KubeStack API",
        "version": "0.1.0",
        "status": "running",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "kubestack-api",
    }