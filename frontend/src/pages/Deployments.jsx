import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Code2,
  Loader2,
  Plus,
  RefreshCw,
  Server,
  X,
} from "lucide-react";

import {
  createDeployment,
  getDeployments,
  getServices,
  scaleDeployment,
  rollbackDeployment,
} from "../services/api";

function Deployments() {
  const [deployments, setDeployments] = useState([]);
  const [services, setServices] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedDeployment, setSelectedDeployment] = useState(null);
  const [liveDetails, setLiveDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showScaleModal, setShowScaleModal] = useState(false);
  const [scaleDeploymentTarget, setScaleDeploymentTarget] = useState(null);
  const [scaleReplicas, setScaleReplicas] = useState(1);
  const [scaling, setScaling] = useState(false);
  const [rollingBack, setRollingBack] = useState(false);
  const [rollbackTarget, setRollbackTarget] = useState(null);

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

    const interval = setInterval(() => {
      loadData();
    }, 5000);

    return () => clearInterval(interval);
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
        err.response?.data?.detail || "Unable to create the deployment.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleScale = async (event) => {
    event.preventDefault();

    if (!scaleDeploymentTarget) {
      return;
    }

    try {
      setScaling(true);
      setError("");

      await scaleDeployment(scaleDeploymentTarget.id, Number(scaleReplicas));

      setShowScaleModal(false);
      setScaleDeploymentTarget(null);

      await loadData();

      if (selectedDeployment?.id === scaleDeploymentTarget.id) {
        await loadLiveDetails(scaleDeploymentTarget.id);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Unable to scale the deployment.");
    } finally {
      setScaling(false);
    }
  };

  const handleRollback = async (deployment) => {
    const confirmed = window.confirm(
      `Are you sure you want to rollback Deployment #${deployment.id} (${getServiceName(
        deployment.service_id,
      )})?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setRollingBack(true);
      setRollbackTarget(deployment.id);
      setError("");

      await rollbackDeployment(deployment.id);

      await loadData();

      if (selectedDeployment?.id === deployment.id) {
        await loadLiveDetails(deployment.id);
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail || "Unable to rollback the deployment.",
      );
    } finally {
      setRollingBack(false);
      setRollbackTarget(null);
    }
  };

  const getServiceName = (serviceId) => {
    const service = services.find((item) => item.id === serviceId);

    return service?.name || `Service #${serviceId}`;
  };

  const getStatusStyle = (status) => {
    const styles = {
      pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",

      in_progress: "bg-blue-500/10 text-blue-400 border-blue-500/20",

      successful: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",

      failed: "bg-red-500/10 text-red-400 border-red-500/20",

      rolled_back: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    };

    return (
      styles[status] || "bg-slate-500/10 text-slate-400 border-slate-500/20"
    );
  };

  const formatStatus = (status) => {
    return status.replace("_", " ");
  };

  const loadLiveDetails = async (deploymentId) => {
    try {
      setLoadingDetails(true);
      setDetailsError("");

      const response = await fetch(`/api/deployments/${deploymentId}/details`);

      if (!response.ok) {
        throw new Error("Failed to load live Kubernetes details");
      }

      const data = await response.json();
      setLiveDetails(data);
    } catch (error) {
      console.error("Live details error:", error);
      setDetailsError(error.message);
    } finally {
      setLoadingDetails(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Deployments</h2>

          <p className="mt-1 text-sm text-slate-400">
            Manage application deployments across environments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={loadData}
            className="flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
          >
            <RefreshCw size={17} />
            Refresh
          </button>

          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-400"
          >
            <Plus size={17} />
            Create Deployment
          </button>
        </div>
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
          <Loader2 size={18} className="animate-spin" />
          Loading deployments...
        </div>
      ) : deployments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 p-10 text-center">
          <Code2 size={40} className="mx-auto mb-4 text-slate-600" />

          <h3 className="font-semibold">No deployments found</h3>

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
                    deployment.status,
                  )}`}
                >
                  {formatStatus(deployment.status)}
                </span>
              </div>

              {/* Deployment Details */}
              <div className="mt-5 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-500">Version</span>

                  <span className="text-slate-200">
                    {deployment.version || "—"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-500">Environment</span>

                  <span className="capitalize text-slate-200">
                    {deployment.environment || "—"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-500">Deployed By</span>

                  <span className="text-slate-200">
                    {deployment.deployed_by || "—"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-500">Image Tag</span>

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
              <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-800 pt-4">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <CheckCircle2 size={14} className="text-cyan-400" />
                  Deployment #{deployment.id}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRollback(deployment)}
                    disabled={rollingBack}
                    className="flex items-center gap-1.5 rounded-lg border border-red-500/30 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {rollingBack && rollbackTarget === deployment.id ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Rolling Back...
                      </>
                    ) : (
                      "Rollback"
                    )}
                  </button>
                  <button
                    onClick={async () => {
                      setScaleDeploymentTarget(deployment);
                      setScaleReplicas(1);
                      setShowScaleModal(true);

                      try {
                        const response = await fetch(
                          `/api/deployments/${deployment.id}/details`,
                        );
                        if (response.ok) {
                          const data = await response.json();

                          setScaleReplicas(data.kubernetes?.replicas ?? 1);
                        }
                      } catch (error) {
                        console.error(
                          "Error fetching deployment details:",
                          error,
                        );
                      }
                    }}
                    className="rounded-lg border border-purple-500/30 px-3 py-1.5 text-xs font-medium text-purple-400 transition hover:bg-purple-500/10"
                  >
                    Scale
                  </button>
                </div>
                <button
                  onClick={() => {
                    setSelectedDeployment(deployment);
                    loadLiveDetails(deployment.id);
                  }}
                  className="rounded-lg border border-cyan-500/30 px-3 py-1.5 text-xs font-medium text-cyan-400 transition hover:bg-cyan-500/10"
                >
                  View Details
                </button>
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
                <h3 className="text-xl font-semibold">Create Deployment</h3>

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

            <form onSubmit={handleSubmit} className="space-y-4">
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
                  <option value="">Select a service</option>

                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
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
                  <option value="development">Development</option>

                  <option value="staging">Staging</option>

                  <option value="production">Production</option>
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
                  <option value="pending">Pending</option>

                  <option value="in_progress">In Progress</option>

                  <option value="successful">Successful</option>

                  <option value="failed">Failed</option>

                  <option value="rolled_back">Rolled Back</option>
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
                  {submitting && <Loader2 size={16} className="animate-spin" />}

                  {submitting ? "Creating..." : "Create Deployment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Deployment Details Modal */}
      {selectedDeployment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            {/* Modal Header */}
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-cyan-400">
                  Deployment Details
                </p>

                <h3 className="mt-1 text-xl font-semibold">
                  {getServiceName(selectedDeployment.service_id)}
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  Deployment #{selectedDeployment.id}
                </p>
              </div>

              <button
                onClick={() => setSelectedDeployment(null)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Status */}
            <div className="mb-6 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <span className="text-sm text-slate-400">Current Status</span>

              <span
                className={`rounded-full border px-3 py-1 text-sm capitalize ${getStatusStyle(
                  selectedDeployment.status,
                )}`}
              >
                {formatStatus(selectedDeployment.status)}
              </span>
            </div>

            {/* Deployment Information */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                <p className="text-xs text-slate-500">Version</p>
                <p className="mt-1 font-medium text-slate-200">
                  {selectedDeployment.version || "—"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                <p className="text-xs text-slate-500">Environment</p>
                <p className="mt-1 font-medium capitalize text-slate-200">
                  {selectedDeployment.environment || "—"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                <p className="text-xs text-slate-500">Service ID</p>
                <p className="mt-1 font-medium text-slate-200">
                  {selectedDeployment.service_id || "—"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                <p className="text-xs text-slate-500">Deployed By</p>
                <p className="mt-1 font-medium text-slate-200">
                  {selectedDeployment.deployed_by || "—"}
                </p>
              </div>
            </div>

            {/* Image */}
            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/50 p-4">
              <p className="text-xs text-slate-500">Docker Image</p>
              <p className="mt-1 break-all font-mono text-sm text-cyan-300">
                {selectedDeployment.image_tag || "—"}
              </p>
            </div>

            {/* Logs */}
            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">
                Deployment Logs
              </p>

              <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-5 text-slate-300">
                {selectedDeployment.logs || "No deployment logs available."}
              </pre>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">
                Live Kubernetes Details
              </h3>

              {loadingDetails && (
                <p className="text-sm text-gray-500">
                  Loading live Kubernetes information...
                </p>
              )}

              {detailsError && (
                <p className="text-sm text-red-500">{detailsError}</p>
              )}

              {liveDetails && !loadingDetails && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm text-gray-500">
                        Kubernetes Deployment
                      </p>
                      <p className="font-medium">
                        {liveDetails.deployment_name || "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Namespace</p>
                      <p className="font-medium">
                        {liveDetails.kubernetes?.namespace || "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Desired Replicas</p>
                      <p className="font-medium">
                        {liveDetails.kubernetes?.replicas ?? 0}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Ready Replicas</p>
                      <p className="font-medium">
                        {liveDetails.kubernetes?.ready_replicas ?? 0}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">
                        Available Replicas
                      </p>
                      <p className="font-medium">
                        {liveDetails.kubernetes?.available_replicas ?? 0}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Updated Replicas</p>
                      <p className="font-medium">
                        {liveDetails.kubernetes?.updated_replicas ?? 0}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Pods</h4>

                    {liveDetails.kubernetes?.pods?.length > 0 ? (
                      <div className="space-y-3">
                        {liveDetails.kubernetes.pods.map((pod) => (
                          <div key={pod.name} className="rounded-lg border p-3">
                            <p className="font-medium">{pod.name}</p>

                            <div className="text-sm text-gray-500 mt-2 space-y-1">
                              <p>
                                Phase:{" "}
                                <span className="text-gray-300">
                                  {pod.status || "N/A"}
                                </span>
                              </p>

                              <p>
                                Pod IP:{" "}
                                <span className="text-gray-300">
                                  {pod.pod_ip || "N/A"}
                                </span>
                              </p>

                              <p>
                                Node:{" "}
                                <span className="text-gray-300">
                                  {pod.node_name || "N/A"}
                                </span>
                              </p>
                            </div>

                            {pod.containers?.length > 0 && (
                              <div className="mt-3">
                                <p className="text-sm font-medium mb-1">
                                  Containers
                                </p>

                                {pod.containers.map((container) => (
                                  <div
                                    key={container.name}
                                    className="text-sm border-t pt-2 mt-2"
                                  >
                                    <p>
                                      <span className="font-medium">Name:</span>{" "}
                                      {container.name}
                                    </p>

                                    <p>
                                      <span className="font-medium">
                                        Image:
                                      </span>{" "}
                                      {container.image || "N/A"}
                                    </p>

                                    <p>
                                      <span className="font-medium">
                                        Ready:
                                      </span>{" "}
                                      {container.ready ? "Yes" : "No"}
                                    </p>

                                    <p>
                                      <span className="font-medium">
                                        Restarts:
                                      </span>{" "}
                                      {container.restart_count ?? 0}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        No pods found for this deployment.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Close */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedDeployment(null)}
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Scale Deployment Modal */}
      {showScaleModal && scaleDeploymentTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            {/* Modal Header */}
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-purple-400">
                  Scale Deployment
                </p>

                <h3 className="mt-1 text-xl font-semibold">
                  {getServiceName(scaleDeploymentTarget.service_id)}
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  Deployment #{scaleDeploymentTarget.id}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowScaleModal(false);
                  setScaleDeploymentTarget(null);
                }}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleScale} className="space-y-5">
              {/* Replica Count */}
              <div>
                <label className="mb-1.5 block text-sm text-slate-300">
                  Number of Replicas
                </label>

                <input
                  type="number"
                  min="1"
                  max="10"
                  required
                  value={scaleReplicas}
                  onChange={(event) => setScaleReplicas(event.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm outline-none transition focus:border-purple-400"
                />

                <p className="mt-2 text-xs text-slate-500">
                  Choose between 1 and 10 replicas.
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowScaleModal(false);
                    setScaleDeploymentTarget(null);
                  }}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={scaling}
                  className="flex items-center gap-2 rounded-lg bg-purple-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {scaling && <Loader2 size={16} className="animate-spin" />}

                  {scaling ? "Scaling..." : "Scale Deployment"}
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
