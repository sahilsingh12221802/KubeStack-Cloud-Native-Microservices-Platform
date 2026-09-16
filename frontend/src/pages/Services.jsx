import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Code2,
  ExternalLink,
  Loader2,
  Plus,
  Server,
  X,
} from "lucide-react";

import {
  createService,
  getProjects,
  getServices,
} from "../services/api";

function Services() {
  const [services, setServices] = useState([]);
  const [projects, setProjects] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    project_id: "",
    name: "",
    description: "",
    technology: "",
    repository_url: "",
    environment: "development",
    status: "active",
    version: "v0.1.0",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [servicesData, projectsData] = await Promise.all([
        getServices(),
        getProjects(),
      ]);

      setServices(servicesData);
      setProjects(projectsData);
    } catch (err) {
      console.error(err);
      setError("Unable to load services and projects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      await createService({
        ...formData,
        project_id: Number(formData.project_id),
      });

      setFormData({
        project_id: "",
        name: "",
        description: "",
        technology: "",
        repository_url: "",
        environment: "development",
        status: "active",
        version: "v0.1.0",
      });

      setShowForm(false);
      await loadData();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Unable to register the service."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getProjectName = (projectId) => {
    const project = projects.find(
      (item) => item.id === projectId
    );

    return project?.name || `Project #${projectId}`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">
            Services
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Register and manage services connected to KubeStack.
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-400"
        >
          <Plus size={17} />
          Register Service
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Services List */}
      {loading ? (
        <div className="flex items-center gap-2 text-slate-400">
          <Loader2
            size={18}
            className="animate-spin"
          />
          Loading services...
        </div>
      ) : services.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 p-10 text-center">
          <Server
            size={40}
            className="mx-auto mb-4 text-slate-600"
          />

          <h3 className="font-semibold">
            No services registered
          </h3>

          <p className="mt-2 text-sm text-slate-400">
            Register your first service to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-cyan-500/10 p-2 text-cyan-400">
                    <Server size={20} />
                  </div>

                  <div>
                    <h3 className="font-semibold">
                      {service.name}
                    </h3>

                    <p className="text-xs text-slate-500">
                      Service #{service.id}
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-400">
                  {service.status}
                </span>
              </div>

              <p className="mt-4 min-h-10 text-sm text-slate-400">
                {service.description ||
                  "No description provided."}
              </p>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-500">
                    Project
                  </span>

                  <span className="text-right text-slate-200">
                    {getProjectName(service.project_id)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-500">
                    Technology
                  </span>

                  <span className="text-slate-200">
                    {service.technology || "—"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-500">
                    Environment
                  </span>

                  <span className="capitalize text-slate-200">
                    {service.environment}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-500">
                    Version
                  </span>

                  <span className="text-slate-200">
                    {service.version || "—"}
                  </span>
                </div>
              </div>

              {service.repository_url && (
                <a
                  href={service.repository_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 flex items-center gap-2 text-sm text-cyan-400 transition hover:text-cyan-300"
                >
                  <ExternalLink size={15} />
                  View Repository
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Register Service Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">
                  Register Service
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  Add a service to a KubeStack project.
                </p>
              </div>

              <button
                onClick={() => setShowForm(false)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {/* Project */}
              <div>
                <label className="mb-1.5 block text-sm text-slate-300">
                  Project
                </label>

                <select
                  required
                  name="project_id"
                  value={formData.project_id}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm outline-none transition focus:border-cyan-400"
                >
                  <option value="">
                    Select a project
                  </option>

                  {projects.map((project) => (
                    <option
                      key={project.id}
                      value={project.id}
                    >
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Service Name */}
              <div>
                <label className="mb-1.5 block text-sm text-slate-300">
                  Service Name
                </label>

                <input
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Authentication API"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm outline-none transition focus:border-cyan-400"
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-1.5 block text-sm text-slate-300">
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the service"
                  rows="3"
                  className="w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm outline-none transition focus:border-cyan-400"
                />
              </div>

              {/* Technology */}
              <div>
                <label className="mb-1.5 block text-sm text-slate-300">
                  Technology
                </label>

                <input
                  name="technology"
                  value={formData.technology}
                  onChange={handleChange}
                  placeholder="e.g. FastAPI, React, Node.js"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm outline-none transition focus:border-cyan-400"
                />
              </div>

              {/* Repository URL */}
              <div>
                <label className="mb-1.5 block text-sm text-slate-300">
                  Repository URL
                </label>

                <input
                  type="url"
                  name="repository_url"
                  value={formData.repository_url}
                  onChange={handleChange}
                  placeholder="https://github.com/username/repository"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm outline-none transition focus:border-cyan-400"
                />
              </div>

              {/* Environment */}
              <div>
                <label className="mb-1.5 block text-sm text-slate-300">
                  Environment
                </label>

                <select
                  name="environment"
                  value={formData.environment}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm outline-none transition focus:border-cyan-400"
                >
                  <option value="development">
                    Development
                  </option>

                  <option value="staging">
                    Staging
                  </option>

                  <option value="production">
                    Production
                  </option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="mb-1.5 block text-sm text-slate-300">
                  Status
                </label>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm outline-none transition focus:border-cyan-400"
                >
                  <option value="active">
                    Active
                  </option>

                  <option value="inactive">
                    Inactive
                  </option>

                  <option value="maintenance">
                    Maintenance
                  </option>
                </select>
              </div>

              {/* Version */}
              <div>
                <label className="mb-1.5 block text-sm text-slate-300">
                  Version
                </label>

                <input
                  name="version"
                  value={formData.version}
                  onChange={handleChange}
                  placeholder="e.g. v1.0.0"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm outline-none transition focus:border-cyan-400"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting && (
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                  )}

                  {submitting
                    ? "Registering..."
                    : "Register Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Services;