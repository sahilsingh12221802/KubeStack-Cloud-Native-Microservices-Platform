import { useEffect, useState } from "react";
import {
  Boxes,
  CheckCircle2,
  Loader2,
  Plus,
  X,
} from "lucide-react";

import {
  createProject,
  getProjects,
} from "../services/api";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    owner: "",
    environment: "development",
  });

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getProjects();
      setProjects(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load projects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
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
      setError("");

      await createProject(formData);

      setFormData({
        name: "",
        description: "",
        owner: "",
        environment: "development",
      });

      setShowForm(false);
      await loadProjects();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Unable to create project."
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Projects</h2>
          <p className="mt-1 text-sm text-slate-400">
            Manage projects registered with KubeStack.
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-400"
        >
          <Plus size={17} />
          Create Project
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-slate-400">
          <Loader2 className="animate-spin" size={18} />
          Loading projects...
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 p-10 text-center">
          <Boxes
            size={40}
            className="mx-auto mb-4 text-slate-600"
          />

          <h3 className="font-semibold">No projects yet</h3>

          <p className="mt-2 text-sm text-slate-400">
            Create your first KubeStack project.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-cyan-500/10 p-2 text-cyan-400">
                    <Boxes size={20} />
                  </div>

                  <div>
                    <h3 className="font-semibold">
                      {project.name}
                    </h3>

                    <p className="text-xs text-slate-500">
                      Project #{project.id}
                    </p>
                  </div>
                </div>

                <CheckCircle2
                  size={18}
                  className="text-emerald-400"
                />
              </div>

              <p className="mt-4 min-h-10 text-sm text-slate-400">
                {project.description || "No description provided."}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-slate-950/60 p-3">
                  <p className="text-xs text-slate-500">
                    Owner
                  </p>

                  <p className="mt-1 text-sm">
                    {project.owner || "—"}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-950/60 p-3">
                  <p className="text-xs text-slate-500">
                    Environment
                  </p>

                  <p className="mt-1 text-sm capitalize">
                    {project.environment}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">
                  Create Project
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  Register a new project in KubeStack.
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
              <div>
                <label className="mb-1.5 block text-sm text-slate-300">
                  Project Name
                </label>

                <input
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Payment Platform"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm outline-none transition focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm text-slate-300">
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the project"
                  rows="3"
                  className="w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm outline-none transition focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm text-slate-300">
                  Owner
                </label>

                <input
                  name="owner"
                  value={formData.owner}
                  onChange={handleChange}
                  placeholder="e.g. Sahil"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm outline-none transition focus:border-cyan-400"
                />
              </div>

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
                  className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-400"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Projects;