import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

export const getProjects = async () => {
  const response = await api.get("/api/projects");
  return response.data;
};

export const getServices = async () => {
  const response = await api.get("/api/services");
  return response.data;
};

export const getDeployments = async () => {
  const response = await api.get("/api/deployments");
  return response.data;
};

export default api;