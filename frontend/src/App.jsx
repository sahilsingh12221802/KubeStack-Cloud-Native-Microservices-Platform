
import {
  Activity,
  Boxes,
  CheckCircle2,
  ChevronRight,
  Cloud,
  GitBranch,
  LayoutDashboard,
  Settings,
  Server,
  ShieldCheck,
  Terminal,
  Users,
} from "lucide-react";

const services = [
  {
    name: "Project API",
    description: "Project and team management",
    version: "v0.1.0",
    status: "Healthy",
    uptime: "99.99%",
  },
  {
    name: "Service Registry",
    description: "Service discovery and ownership",
    version: "v0.1.0",
    status: "Healthy",
    uptime: "99.98%",
  },
  {
    name: "Deployment API",
    description: "Deployment history and releases",
    version: "v0.1.0",
    status: "Healthy",
    uptime: "99.99%",
  },
];

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-slate-800 bg-slate-900/60 p-5 md:block">
          <div className="mb-10 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400">
              <Cloud size={22} />
            </div>
            <div>
              <h1 className="text-lg font-bold">KubeStack</h1>
              <p className="text-xs text-slate-500">Developer Platform</p>
            </div>
          </div>

          <nav className="space-y-2">
            <NavItem
              icon={<LayoutDashboard size={18} />}
              label="Overview"
              active
            />
            <NavItem
              icon={<Boxes size={18} />}
              label="Projects"
            />
            <NavItem
              icon={<Server size={18} />}
              label="Services"
            />
            <NavItem
              icon={<GitBranch size={18} />}
              label="Deployments"
            />
            <NavItem
              icon={<Activity size={18} />}
              label="Monitoring"
            />
          </nav>

          <div className="mt-10 border-t border-slate-800 pt-5">
            <NavItem
              icon={<Users size={18} />}
              label="Team"
            />
            <NavItem
              icon={<Settings size={18} />}
              label="Settings"
            />
          </div>

          <div className="mt-10 rounded-xl border border-slate-800 bg-slate-950 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              <ShieldCheck size={16} className="text-emerald-400" />
              Environment
            </div>
            <p className="text-sm text-slate-400">Development</p>
            <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              All systems operational
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1">
          <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 px-6 py-5 lg:px-10">
            <div>
              <p className="text-sm text-slate-500">Workspace / Overview</p>
              <h2 className="mt-1 text-2xl font-semibold">
                Good evening, Sahil
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-400 sm:flex">
                <Terminal size={15} />
                Local Environment
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/20 font-semibold text-cyan-300">
                SS
              </div>
            </div>
          </header>

          <div className="space-y-8 p-6 lg:p-10">
            {/* Welcome */}
            <section>
              <p className="mb-2 text-sm font-medium text-cyan-400">
                PLATFORM OVERVIEW
              </p>
              <h3 className="text-3xl font-bold tracking-tight">
                Your infrastructure, simplified.
              </h3>
              <p className="mt-2 max-w-2xl text-slate-400">
                Manage projects, services, deployments, and operational
                health from one developer platform.
              </p>
            </section>

            {/* Stats */}
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                icon={<Boxes size={20} />}
                label="Total Projects"
                value="1"
                note="Active workspace"
              />
              <StatCard
                icon={<Server size={20} />}
                label="Registered Services"
                value="3"
                note="Development environment"
              />
              <StatCard
                icon={<CheckCircle2 size={20} />}
                label="Healthy Services"
                value="3 / 3"
                note="100% availability"
                positive
              />
              <StatCard
                icon={<GitBranch size={20} />}
                label="Deployments"
                value="0"
                note="No deployments yet"
              />
            </section>

            {/* Project */}
            <section>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold">Your Projects</h3>
                <button className="flex items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300">
                  View all <ChevronRight size={16} />
                </button>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400">
                      <Cloud size={24} />
                    </div>
                    <div>
                      <h4 className="font-semibold">KubeStack Platform</h4>
                      <p className="text-sm text-slate-500">
                        Cloud-native developer platform
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
                    Active
                  </span>
                </div>

                <div className="mt-5 grid gap-4 border-t border-slate-800 pt-5 sm:grid-cols-3">
                  <Info label="Owner" value="Sahil Singh" />
                  <Info label="Environment" value="Development" />
                  <Info label="Version" value="v0.1.0" />
                </div>
              </div>
            </section>

            {/* Services */}
            <section>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold">Registered Services</h3>
                <button className="text-sm text-cyan-400 hover:text-cyan-300">
                  Manage services
                </button>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50">
                <div className="hidden grid-cols-4 gap-4 border-b border-slate-800 px-5 py-3 text-xs uppercase tracking-wider text-slate-500 sm:grid">
                  <span className="col-span-2">Service</span>
                  <span>Version</span>
                  <span>Status</span>
                </div>

                {services.map((service) => (
                  <div
                    key={service.name}
                    className="grid gap-3 border-b border-slate-800 px-5 py-4 last:border-b-0 sm:grid-cols-4 sm:items-center sm:gap-4"
                  >
                    <div className="flex items-center gap-3 sm:col-span-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-slate-300">
                        <Server size={17} />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{service.name}</p>
                        <p className="text-xs text-slate-500">
                          {service.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-slate-400">
                      {service.version}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-emerald-400">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      {service.status}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Footer status */}
            <footer className="flex flex-wrap items-center gap-2 border-t border-slate-800 pt-5 text-xs text-slate-500">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              KubeStack API connected locally
              <span className="mx-1">·</span>
              v0.1.0
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}

function NavItem({ icon, label, active = false }) {
  return (
    <div
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${
        active
          ? "bg-cyan-500/10 text-cyan-400"
          : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
      }`}
    >
      {icon}
      {label}
    </div>
  );
}

function StatCard({ icon, label, value, note, positive = false }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-slate-400">{icon}</div>
        {positive && (
          <span className="text-xs text-emerald-400">Healthy</span>
        )}
      </div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
      <p className="mt-2 text-xs text-slate-500">{note}</p>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-300">{value}</p>
    </div>
  );
}

export default App;