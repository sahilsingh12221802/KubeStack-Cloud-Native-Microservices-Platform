import { useEffect, useState } from "react";
import {
  Activity,
  CheckCircle2,
  Code2,
  Loader2,
  Server,
  ShieldAlert,
  XCircle,
} from "lucide-react";

import {
  getDeployments,
  getInfrastructureMetrics,
  getServices,
} from "../services/api";

function Monitoring() {
  const [services, setServices] = useState([]);
  const [deployments, setDeployments] = useState([]);
  const [metrics, setMetrics] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [metricsError, setMetricsError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [servicesData, deploymentsData, metricsData] = await Promise.all([
        getServices(),
        getDeployments(),
        getInfrastructureMetrics(),
      ]);

      setServices(servicesData);
      setDeployments(deploymentsData);
      setMetrics(metricsData);
    } catch (err) {
      console.error(err);
      setError("Unable to load monitoring data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeServices = services.filter(
    (service) => service.status === "active",
  ).length;

  const successfulDeployments = deployments.filter(
    (deployment) => deployment.status === "successful",
  ).length;

  const failedDeployments = deployments.filter(
    (deployment) => deployment.status === "failed",
  ).length;

  const inProgressDeployments = deployments.filter(
    (deployment) => deployment.status === "in_progress",
  ).length;

  const getServiceName = (serviceId) => {
    const service = services.find((item) => item.id === serviceId);

    return service?.name || `Service #${serviceId}`;
  };

  const getServiceStatusStyle = (status) => {
    if (status === "active") {
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
    }

    if (status === "maintenance") {
      return "border-yellow-500/20 bg-yellow-500/10 text-yellow-400";
    }

    return "border-red-500/20 bg-red-500/10 text-red-400";
  };

  const getDeploymentStatusStyle = (status) => {
    const styles = {
      pending: "border-yellow-500/20 bg-yellow-500/10 text-yellow-400",

      in_progress: "border-blue-500/20 bg-blue-500/10 text-blue-400",

      successful: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",

      failed: "border-red-500/20 bg-red-500/10 text-red-400",

      rolled_back: "border-purple-500/20 bg-purple-500/10 text-purple-400",
    };

    return (
      styles[status] || "border-slate-500/20 bg-slate-500/10 text-slate-400"
    );
  };

  const formatStatus = (status) => {
    return status.replace("_", " ");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3">
          <Activity className="text-cyan-400" size={25} />

          <h2 className="text-2xl font-bold">Monitoring</h2>
        </div>

        <p className="mt-1 text-sm text-slate-400">
          Monitor service health and deployment activity across KubeStack.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-slate-400">
          <Loader2 size={18} className="animate-spin" />
          Loading monitoring data...
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-cyan-500/10 p-2 text-cyan-400">
                  <Server size={21} />
                </div>

                <span className="text-xs text-slate-500">Services</span>
              </div>

              <p className="mt-5 text-3xl font-bold">{services.length}</p>

              <p className="mt-1 text-sm text-slate-400">
                Total registered services
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-400">
                  <CheckCircle2 size={21} />
                </div>

                <span className="text-xs text-slate-500">Healthy</span>
              </div>

              <p className="mt-5 text-3xl font-bold">{activeServices}</p>

              <p className="mt-1 text-sm text-slate-400">Active services</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-blue-500/10 p-2 text-blue-400">
                  <Code2 size={21} />
                </div>

                <span className="text-xs text-slate-500">Deployments</span>
              </div>

              <p className="mt-5 text-3xl font-bold">{deployments.length}</p>

              <p className="mt-1 text-sm text-slate-400">
                Total deployment records
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-red-500/10 p-2 text-red-400">
                  <ShieldAlert size={21} />
                </div>

                <span className="text-xs text-slate-500">Failed</span>
              </div>

              <p className="mt-5 text-3xl font-bold">{failedDeployments}</p>

              <p className="mt-1 text-sm text-slate-400">Failed deployments</p>
            </div>
          </div>

          {/* Service Health */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">Service Health</h3>

                <p className="mt-1 text-sm text-slate-400">
                  Current status of registered services.
                </p>
              </div>

              <Server size={22} className="text-cyan-400" />
            </div>

            {services.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-700 p-8 text-center text-sm text-slate-400">
                No services registered yet.
              </div>
            ) : (
              <div className="space-y-3">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-cyan-500/10 p-2 text-cyan-400">
                        <Server size={18} />
                      </div>

                      <div>
                        <p className="font-medium">{service.name}</p>

                        <p className="text-xs text-slate-500">
                          {service.technology || "Technology not specified"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm capitalize text-slate-400">
                        {service.environment}
                      </span>

                      <span
                        className={`rounded-full border px-3 py-1 text-xs capitalize ${getServiceStatusStyle(
                          service.status,
                        )}`}
                      >
                        {service.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Deployment Activity */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">Deployment Activity</h3>

                <p className="mt-1 text-sm text-slate-400">
                  Recent deployment status across services.
                </p>
              </div>

              <Activity size={22} className="text-cyan-400" />
            </div>

            <div className="mb-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                <p className="text-sm text-slate-400">Successful</p>

                <p className="mt-1 text-2xl font-bold text-emerald-400">
                  {successfulDeployments}
                </p>
              </div>

              <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                <p className="text-sm text-slate-400">In Progress</p>

                <p className="mt-1 text-2xl font-bold text-blue-400">
                  {inProgressDeployments}
                </p>
              </div>

              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                <p className="text-sm text-slate-400">Failed</p>

                <p className="mt-1 text-2xl font-bold text-red-400">
                  {failedDeployments}
                </p>
              </div>
            </div>

            {deployments.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-700 p-8 text-center text-sm text-slate-400">
                No deployment activity available.
              </div>
            ) : (
              <div className="space-y-3">
                {deployments.map((deployment) => (
                  <div
                    key={deployment.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-cyan-500/10 p-2 text-cyan-400">
                        <Code2 size={18} />
                      </div>

                      <div>
                        <p className="font-medium">
                          {getServiceName(deployment.service_id)}
                        </p>

                        <p className="text-xs text-slate-500">
                          {deployment.version} · {deployment.environment}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {deployment.status === "successful" && (
                        <CheckCircle2 size={17} className="text-emerald-400" />
                      )}

                      {deployment.status === "failed" && (
                        <XCircle size={17} className="text-red-400" />
                      )}

                      <span
                        className={`rounded-full border px-3 py-1 text-xs capitalize ${getDeploymentStatusStyle(
                          deployment.status,
                        )}`}
                      >
                        {formatStatus(deployment.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Infrastructure Metrics */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">CPU Usage</p>
                  <p className="mt-2 text-2xl font-bold text-white">
                    {metrics ? `${metrics.cpu.millicores}m` : "--"}
                  </p>
                </div>
                <Activity size={22} className="text-cyan-400" />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Kubernetes workload CPU consumption
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Memory Usage</p>
                  <p className="mt-2 text-2xl font-bold text-white">
                    {metrics ? `${metrics.memory.mib} MiB` : "--"}
                  </p>
                </div>
                <Server size={22} className="text-violet-400" />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Kubernetes workload memory consumption
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Pod Restarts</p>
                  <p className="mt-2 text-2xl font-bold text-white">
                    {metrics ? metrics.pods.restarts : "--"}
                  </p>
                </div>
                <ShieldAlert size={22} className="text-amber-400" />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Total container restarts in KubeStack
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Replica Availability</p>
                  <p className="mt-2 text-2xl font-bold text-white">
                    {metrics
                      ? `${metrics.pods.available_replicas}/${metrics.pods.desired_replicas}`
                      : "--"}
                  </p>
                </div>

                {metrics &&
                metrics.pods.available_replicas ===
                  metrics.pods.desired_replicas ? (
                  <CheckCircle2 size={22} className="text-emerald-400" />
                ) : (
                  <XCircle size={22} className="text-red-400" />
                )}
              </div>

              <p className="mt-2 text-xs text-slate-500">
                Available versus desired deployment replicas
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Monitoring;
