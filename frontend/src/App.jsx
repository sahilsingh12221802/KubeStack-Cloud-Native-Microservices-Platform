import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Boxes,
  CheckCircle2,
  Cloud,
  GitBranch,
  LayoutDashboard,
  RefreshCw,
  Server,
  Settings,
  TerminalSquare,
  XCircle,
} from "lucide-react";

import { getDeployments, getProjects, getServices } from "./services/api";

import Projects from "./pages/Projects";
import Services from "./pages/Services";
import Deployments from "./pages/Deployments";

function App() {
  const [projects, setProjects] = useState([]);
  const [services, setServices] = useState([]);
  const [deployments, setDeployments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activePage, setActivePage] = useState("dashboard");

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [projectsData, servicesData, deploymentsData] = await Promise.all([
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
        "Unable to load dashboard data. Make sure the FastAPI backend is running.",
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
      deployments.filter((deployment) => deployment.status === "successful")
        .length,
    [deployments],
  );

  const activeServices = useMemo(
    () => services.filter((service) => service.status === "active").length,
    [services],
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

  const pageTitles = {
    dashboard: "Platform Dashboard",
    projects: "Projects",
    services: "Services",
    deployments: "Deployments",
    monitoring: "Monitoring",
    settings: "Settings",
    logs: "System Logs",
  };

  const isDashboard = activePage === "dashboard";
  const isProjects = activePage === "projects";
  const isServices = activePage === "services";
  const isDeployments = activePage === "deployments";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-64 border-r border-slate-800 bg-slate-900/80 p-5 lg:block">
          <div className="mb-10 flex items-center gap-3">
            <div className="rounded-xl bg-cyan-500/15 p-2 text-cyan-400">
              <Cloud size={22} />
            </div>

            <div>
              <h1 className="text-lg font-bold">KubeStack</h1>
              <p className="text-xs text-slate-400">Cloud-Native Platform</p>
            </div>
          </div>

          <nav className="space-y-2">
            {/* Dashboard */}
            <button
              onClick={() => setActivePage("dashboard")}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition ${
                activePage === "dashboard"
                  ? "bg-cyan-500/10 text-cyan-400"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <LayoutDashboard size={18} />
              Dashboard
            </button>

            {/* Projects */}
            <button
              onClick={() => setActivePage("projects")}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition ${
                activePage === "projects"
                  ? "bg-cyan-500/10 text-cyan-400"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <Boxes size={18} />
              Projects
            </button>

            {/* Services */}
            <button
              onClick={() => setActivePage("services")}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition ${
                activePage === "services"
                  ? "bg-cyan-500/10 text-cyan-400"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <Server size={18} />
              Services
            </button>

            {/* Deployments */}
            <button
              onClick={() => setActivePage("deployments")}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition ${
                activePage === "deployments"
                  ? "bg-cyan-500/10 text-cyan-400"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <GitBranch size={18} />
              Deployments
            </button>

            {/* Monitoring */}
            <button
              onClick={() => setActivePage("monitoring")}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition ${
                activePage === "monitoring"
                  ? "bg-cyan-500/10 text-cyan-400"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <Activity size={18} />
              Monitoring
            </button>
          </nav>

          <div className="mt-10 border-t border-slate-800 pt-5">
            {/* Settings */}
            <button
              onClick={() => setActivePage("settings")}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition ${
                activePage === "settings"
                  ? "bg-cyan-500/10 text-cyan-400"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <Settings size={18} />
              Settings
            </button>

            {/* System Logs */}
            <button
              onClick={() => setActivePage("logs")}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition ${
                activePage === "logs"
                  ? "bg-cyan-500/10 text-cyan-400"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <TerminalSquare size={18} />
              System Logs
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="min-w-0 flex-1">
          {/* Header */}
          <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 bg-slate-950/80 px-6 py-5">
            <div>
              <p className="text-sm text-slate-400">Engineering Workspace</p>

              <h2 className="text-2xl font-bold">{pageTitles[activePage]}</h2>
            </div>

            {isDashboard && (
              <button
                onClick={loadDashboardData}
                disabled={loading}
                className="flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-cyan-400 hover:text-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
            )}
          </header>

          {/* Projects Page */}
          {isProjects ? (
            <section className="p-6">
              <Projects />
            </section>
          ) : isServices ? (
            <section className="p-6">
              <Services />
            </section>
          ) : isDeployments ? (
            <section className="p-6">
              <Deployments />
            </section>
          ) : (
            /* Dashboard and Placeholder Pages */
            <section className="space-y-6 p-6">
              {isDashboard ? (
                <>
                  {/* Error Message */}
                  {error && (
                    <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
                      <XCircle className="mt-0.5 shrink-0" size={20} />

                      <p>{error}</p>
                    </div>
                  )}

                  {/* Statistics */}
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {stats.map((stat) => {
                      const Icon = stat.icon;

                      return (
                        <div
                          key={stat.label}
                          className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"
                        >
                          <div className="mb-4 flex items-center justify-between">
                            <p className="text-sm text-slate-400">
                              {stat.label}
                            </p>

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

                  {/* Services and Deployments */}
                  <div className="grid gap-6 xl:grid-cols-2">
                    {/* Registered Services */}
                    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
                      <div className="mb-5 flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">
                            Registered Services
                          </h3>

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
                                  <h4 className="font-medium">
                                    {service.name}
                                  </h4>

                                  <p className="mt-1 text-sm text-slate-400">
                                    {service.description ||
                                      "No description provided"}
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

                    {/* Recent Deployments */}
                    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
                      <div className="mb-5">
                        <h3 className="text-lg font-semibold">
                          Recent Deployments
                        </h3>

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

                  {/* Platform Status */}
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
                        <p className="text-sm text-slate-400">
                          Active Services
                        </p>

                        <p className="mt-2 font-medium text-cyan-400">
                          {loading ? "—" : activeServices}
                        </p>
                      </div>
                    </div>
                  </section>
                </>
              ) : (
                /* Placeholder for future pages */
                <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 p-10 text-center">
                  <h3 className="text-xl font-semibold">
                    {pageTitles[activePage]}
                  </h3>

                  <p className="mt-2 text-sm text-slate-400">
                    This section will be implemented in a future KubeStack
                    milestone.
                  </p>

                  <button
                    onClick={() => setActivePage("dashboard")}
                    className="mt-5 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-400"
                  >
                    Back to Dashboard
                  </button>
                </div>
              )}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
