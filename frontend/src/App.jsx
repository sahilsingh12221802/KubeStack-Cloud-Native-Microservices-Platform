import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Boxes,
  CheckCircle2,
  Cloud,
  GitBranch,
  Layers3,
  LayoutDashboard,
  RefreshCw,
  Server,
  Settings,
  TerminalSquare,
  XCircle,
} from "lucide-react";

import {
  getDeployments,
  getProjects,
  getServices,
} from "./services/api";

function App() {
  const [projects, setProjects] = useState([]);
  const [services, setServices] = useState([]);
  const [deployments, setDeployments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [projectsData, servicesData, deploymentsData] =
        await Promise.all([
          getProjects(),
          getServices(),
          getDeployments(),
        ]);

      setProjects(projectsData);
      setServices(servicesData);
      setDeployments(deploymentsData);
    } catch (err) {
      console.error(err);
      setError(
        "Unable to load dashboard data. Make sure the FastAPI backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const successfulDeployments = useMemo(
    () =>
      deployments.filter(
        (deployment) => deployment.status === "successful"
      ).length,
    [deployments]
  );

  const activeServices = useMemo(
    () => services.filter((service) => service.status === "active").length,
    [services]
  );

  const stats = [
    {
      label: "Total Projects",
      value: projects.length,
      icon: Boxes,
      description: "Registered projects",
    },
    {
      label: "Total Services",
      value: services.length,
      icon: Server,
      description: "Registered services",
    },
    {
      label: "Deployments",
      value: deployments.length,
      icon: GitBranch,
      description: "Recorded deployments",
    },
    {
      label: "Successful",
      value: successfulDeployments,
      icon: CheckCircle2,
      description: "Successful deployments",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 border-r border-slate-800 bg-slate-900/80 p-5 lg:block">
          <div className="mb-10 flex items-center gap-3">
            <div className="rounded-xl bg-cyan-500/15 p-2 text-cyan-400">
              <Cloud size={22} />
            </div>

            <div>
              <h1 className="text-lg font-bold">KubeStack</h1>
              <p className="text-xs text-slate-400">
                Cloud-Native Platform
              </p>
            </div>
          </div>

          <nav className="space-y-2">
            <div className="flex items-center gap-3 rounded-lg bg-cyan-500/10 px-3 py-2 text-cyan-400">
              <LayoutDashboard size={18} />
              Dashboard
            </div>

            <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-400">
              <Boxes size={18} />
              Projects
            </div>

            <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-400">
              <Server size={18} />
              Services
            </div>

            <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-400">
              <GitBranch size={18} />
              Deployments
            </div>

            <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-400">
              <Activity size={18} />
              Monitoring
            </div>
          </nav>

          <div className="mt-10 border-t border-slate-800 pt-5">
            <div className="flex items-center gap-3 px-3 py-2 text-slate-400">
              <Settings size={18} />
              Settings
            </div>

            <div className="flex items-center gap-3 px-3 py-2 text-slate-400">
              <TerminalSquare size={18} />
              System Logs
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 bg-slate-950/80 px-6 py-5">
            <div>
              <p className="text-sm text-slate-400">Engineering Workspace</p>
              <h2 className="text-2xl font-bold">Platform Dashboard</h2>
            </div>

            <button
              onClick={loadDashboardData}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-cyan-400 hover:text-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </header>

          <section className="space-y-6 p-6">
            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
                <XCircle className="mt-0.5 shrink-0" size={20} />
                <p>{error}</p>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-sm text-slate-400">{stat.label}</p>
                      <Icon className="text-cyan-400" size={20} />
                    </div>

                    <p className="text-3xl font-bold">
                      {loading ? "—" : stat.value}
                    </p>

                    <p className="mt-2 text-xs text-slate-500">
                      {stat.description}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Registered Services</h3>
                    <p className="text-sm text-slate-400">
                      Services connected to KubeStack
                    </p>
                  </div>

                  <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs text-cyan-400">
                    {activeServices} active
                  </span>
                </div>

                {loading ? (
                  <p className="text-sm text-slate-400">
                    Loading services...
                  </p>
                ) : services.length === 0 ? (
                  <p className="text-sm text-slate-400">
                    No services registered yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {services.map((service) => (
                      <div
                        key={service.id}
                        className="rounded-xl border border-slate-800 bg-slate-950/60 p-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h4 className="font-medium">{service.name}</h4>
                            <p className="mt-1 text-sm text-slate-400">
                              {service.description || "No description provided"}
                            </p>
                          </div>

                          <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-400">
                            {service.status}
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
                          <span className="rounded-md bg-slate-800 px-2 py-1">
                            {service.technology}
                          </span>
                          <span className="rounded-md bg-slate-800 px-2 py-1">
                            {service.environment}
                          </span>
                          <span className="rounded-md bg-slate-800 px-2 py-1">
                            {service.version}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
                <div className="mb-5">
                  <h3 className="text-lg font-semibold">Recent Deployments</h3>
                  <p className="text-sm text-slate-400">
                    Latest deployment activity
                  </p>
                </div>

                {loading ? (
                  <p className="text-sm text-slate-400">
                    Loading deployments...
                  </p>
                ) : deployments.length === 0 ? (
                  <p className="text-sm text-slate-400">
                    No deployments recorded yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {deployments.slice(0, 5).map((deployment) => (
                      <div
                        key={deployment.id}
                        className="rounded-xl border border-slate-800 bg-slate-950/60 p-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h4 className="font-medium">
                              Deployment #{deployment.id}
                            </h4>
                            <p className="mt-1 text-sm text-slate-400">
                              Service #{deployment.service_id}
                            </p>
                          </div>

                          <span
                            className={`rounded-full px-2.5 py-1 text-xs ${
                              deployment.status === "successful"
                                ? "bg-emerald-500/10 text-emerald-400"
                                : deployment.status === "failed"
                                ? "bg-red-500/10 text-red-400"
                                : "bg-amber-500/10 text-amber-400"
                            }`}
                          >
                            {deployment.status}
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
                          <span className="rounded-md bg-slate-800 px-2 py-1">
                            {deployment.version}
                          </span>
                          <span className="rounded-md bg-slate-800 px-2 py-1">
                            {deployment.environment}
                          </span>
                          {deployment.image_tag && (
                            <span className="rounded-md bg-slate-800 px-2 py-1">
                              {deployment.image_tag}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <h3 className="text-lg font-semibold">Platform Status</h3>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-slate-950/60 p-4">
                  <p className="text-sm text-slate-400">Backend API</p>
                  <p className="mt-2 flex items-center gap-2 font-medium text-emerald-400">
                    <CheckCircle2 size={16} />
                    Connected
                  </p>
                </div>

                <div className="rounded-xl bg-slate-950/60 p-4">
                  <p className="text-sm text-slate-400">Database</p>
                  <p className="mt-2 flex items-center gap-2 font-medium text-emerald-400">
                    <CheckCircle2 size={16} />
                    PostgreSQL
                  </p>
                </div>

                <div className="rounded-xl bg-slate-950/60 p-4">
                  <p className="text-sm text-slate-400">Active Services</p>
                  <p className="mt-2 font-medium text-cyan-400">
                    {loading ? "—" : activeServices}
                  </p>
                </div>
              </div>
            </section>
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;