import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

export const getProjects = async () => {
  const response = await api.get("/api/projects");
  return response.data;
};

export const createProject = async (projectData) => {
  const response = await api.post("/api/projects", projectData);
  return response.data;
};

export const getServices = async () => {
  const response = await api.get("/api/services");
  return response.data;
};

export const createService = async (serviceData) => {
  const response = await api.post("/api/services", serviceData);
  return response.data;
};

export const getDeployments = async () => {
  const response = await api.get("/api/deployments");
  return response.data;
};

export const createDeployment = async (deploymentData) => {
  const response = await api.post("/api/deployments", deploymentData);
  return response.data;
};

export default api;