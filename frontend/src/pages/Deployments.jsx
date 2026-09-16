import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Code2,
  Loader2,
  Plus,
  Server,
  X,
} from "lucide-react";

import {
  createDeployment,
  getDeployments,
  getServices,
} from "../services/api";

function Deployments() {
  const [deployments, setDeployments] = useState([]);
  const [services, setServices] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    service_id: "",
    version: "v0.1.0",
    environment: "development",
    status: "pending",
    image_tag: "",
    deployed_by: "",
    logs: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [deploymentsData, servicesData] = await Promise.all([
        getDeployments(),
        getServices(),
      ]);

      setDeployments(deploymentsData);
      setServices(servicesData);
    } catch (err) {
      console.error(err);
      setError("Unable to load deployments and services.");
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

      await createDeployment({
        ...formData,
        service_id: Number(formData.service_id),
      });

      setFormData({
        service_id: "",
        version: "v0.1.0",
        environment: "development",
        status: "pending",
        image_tag: "",
        deployed_by: "",
        logs: "",
      });

      setShowForm(false);
      await loadData();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Unable to create the deployment."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getServiceName = (serviceId) => {
    const service = services.find(
      (item) => item.id === serviceId
    );

    return service?.name || `Service #${serviceId}`;
  };

  const getStatusStyle = (status) => {
    const styles = {
      pending:
        "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",

      in_progress:
        "bg-blue-500/10 text-blue-400 border-blue-500/20",

      successful:
        "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",

      failed:
        "bg-red-500/10 text-red-400 border-red-500/20",

      rolled_back:
        "bg-purple-500/10 text-purple-400 border-purple-500/20",
    };

    return (
      styles[status] ||
      "bg-slate-500/10 text-slate-400 border-slate-500/20"
    );
  };

  const formatStatus = (status) => {
    return status.replace("_", " ");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">
            Deployments
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Manage application deployments across environments.
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-400"
        >
          <Plus size={17} />
          Create Deployment
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Deployment List */}
      {loading ? (
        <div className="flex items-center gap-2 text-slate-400">
          <Loader2
            size={18}
            className="animate-spin"
          />
          Loading deployments...
        </div>
      ) : deployments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 p-10 text-center">
          <Code2
            size={40}
            className="mx-auto mb-4 text-slate-600"
          />

          <h3 className="font-semibold">
            No deployments found
          </h3>

          <p className="mt-2 text-sm text-slate-400">
            Create your first deployment to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {deployments.map((deployment) => (
            <div
              key={deployment.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-cyan-500/10 p-2 text-cyan-400">
                    <Code2 size={20} />
                  </div>

                  <div>
                    <h3 className="font-semibold">
                      {getServiceName(deployment.service_id)}
                    </h3>

                    <p className="text-xs text-slate-500">
                      Deployment #{deployment.id}
                    </p>
                  </div>
                </div>

                <span
                  className={`rounded-full border px-2.5 py-1 text-xs capitalize ${getStatusStyle(
                    deployment.status
                  )}`}
                >
                  {formatStatus(deployment.status)}
                </span>
              </div>

              {/* Deployment Details */}
              <div className="mt-5 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-500">
                    Version
                  </span>

                  <span className="text-slate-200">
                    {deployment.version || "—"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-500">
                    Environment
                  </span>

                  <span className="capitalize text-slate-200">
                    {deployment.environment || "—"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-500">
                    Deployed By
                  </span>

                  <span className="text-slate-200">
                    {deployment.deployed_by || "—"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-500">
                    Image Tag
                  </span>

                  <span className="max-w-[190px] truncate text-right text-slate-200">
                    {deployment.image_tag || "—"}
                  </span>
                </div>
              </div>

              {/* Logs */}
              {deployment.logs && (
                <div className="mt-5 rounded-lg border border-slate-800 bg-slate-950/70 p-3">
                  <p className="mb-1 text-xs font-medium text-slate-500">
                    Deployment Logs
                  </p>

                  <p className="line-clamp-3 whitespace-pre-wrap text-xs text-slate-400">
                    {deployment.logs}
                  </p>
                </div>
              )}

              {/* Footer */}
              <div className="mt-5 flex items-center gap-2 border-t border-slate-800 pt-4 text-xs text-slate-500">
                <CheckCircle2 size={14} className="text-cyan-400" />
                Deployment record #{deployment.id}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Deployment Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            {/* Modal Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">
                  Create Deployment
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  Create a deployment record for a service.
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
              {/* Service */}
              <div>
                <label className="mb-1.5 block text-sm text-slate-300">
                  Service
                </label>

                <select
                  required
                  name="service_id"
                  value={formData.service_id}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm outline-none transition focus:border-cyan-400"
                >
                  <option value="">
                    Select a service
                  </option>

                  {services.map((service) => (
                    <option
                      key={service.id}
                      value={service.id}
                    >
                      {service.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Version */}
              <div>
                <label className="mb-1.5 block text-sm text-slate-300">
                  Version
                </label>

                <input
                  required
                  name="version"
                  value={formData.version}
                  onChange={handleChange}
                  placeholder="e.g. v1.0.0"
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
                  <option value="pending">
                    Pending
                  </option>

                  <option value="in_progress">
                    In Progress
                  </option>

                  <option value="successful">
                    Successful
                  </option>

                  <option value="failed">
                    Failed
                  </option>

                  <option value="rolled_back">
                    Rolled Back
                  </option>
                </select>
              </div>

              {/* Docker Image Tag */}
              <div>
                <label className="mb-1.5 block text-sm text-slate-300">
                  Docker Image Tag
                </label>

                <input
                  name="image_tag"
                  value={formData.image_tag}
                  onChange={handleChange}
                  placeholder="e.g. kubestack-api:v1.0.0"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm outline-none transition focus:border-cyan-400"
                />
              </div>

              {/* Deployed By */}
              <div>
                <label className="mb-1.5 block text-sm text-slate-300">
                  Deployed By
                </label>

                <input
                  name="deployed_by"
                  value={formData.deployed_by}
                  onChange={handleChange}
                  placeholder="e.g. Sahil"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm outline-none transition focus:border-cyan-400"
                />
              </div>

              {/* Logs */}
              <div>
                <label className="mb-1.5 block text-sm text-slate-300">
                  Deployment Logs
                </label>

                <textarea
                  name="logs"
                  value={formData.logs}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Add deployment logs..."
                  className="w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm outline-none transition focus:border-cyan-400"
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
                    ? "Creating..."
                    : "Create Deployment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Deployments;