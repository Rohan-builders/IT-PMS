import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { db } from "@/lib/db";
import { projects, tasks, pipelineItems } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import Link from "next/link";
import { FolderKanban, CheckSquare, Clock, ArrowRight } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const role = session.user?.role;

  const [activeProjects, inProgressTasks, pendingApprovals, completedProjects] = await Promise.all([
    db.select({ count: count() }).from(projects).where(eq(projects.status, "active")),
    db.select({ count: count() }).from(tasks).where(eq(tasks.status, "in_progress")),
    db.select({ count: count() }).from(pipelineItems).where(eq(pipelineItems.status, "pending")),
    db.select({ count: count() }).from(projects).where(eq(projects.status, "completed")),
  ]);

  const stats = [
    {
      label: "Active Projects",
      value: activeProjects[0]?.count ?? 0,
      icon: FolderKanban,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      href: "/projects",
      hidden: false,
    },
    {
      label: "Tasks In Progress",
      value: inProgressTasks[0]?.count ?? 0,
      icon: CheckSquare,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
      href: "/projects",
      hidden: false,
    },
    {
      label: "Pending Approvals",
      value: pendingApprovals[0]?.count ?? 0,
      icon: Clock,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      href: "/pipeline",
      hidden: role !== "ceo" && role !== "admin",
    },
    {
      label: "Completed Projects",
      value: completedProjects[0]?.count ?? 0,
      icon: FolderKanban,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      href: "/projects",
      hidden: false,
    },
  ];

  const recentProjects = await db.query.projects.findMany({
    with: {
      owner: { columns: { id: true, name: true } },
      tasks: { columns: { id: true, status: true } },
    },
    limit: 5,
    orderBy: (p, { desc }) => [desc(p.updatedAt)],
  });

  const statusColors: Record<string, string> = {
    active: "text-green-600",
    draft: "text-gray-500",
    pending_approval: "text-yellow-600",
    completed: "text-blue-600",
    archived: "text-gray-400",
  };

  return (
    <AppShell>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back, {session.user?.name} &middot; <span className="capitalize">{role}</span>
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.filter((s) => !s.hidden).map((stat) => (
            <Link key={stat.label} href={stat.href}>
              <div className="rounded-lg border p-5 flex items-center gap-3 transition-colors hover:bg-accent/50 h-full">
                <div className={`rounded-md p-2 ${stat.iconBg} shrink-0`}>
                  <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Projects */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Recent Projects</h2>
            <Link href="/projects" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {recentProjects.length === 0 ? (
            <div className="rounded-lg border p-8 text-center">
              <p className="text-sm text-muted-foreground">No projects yet.</p>
              {(role === "admin" || role === "manager") && (
                <Link href="/projects" className="text-sm font-medium hover:underline mt-1 inline-block">
                  Create your first project →
                </Link>
              )}
            </div>
          ) : (
            <div className="rounded-lg border divide-y">
              {recentProjects.map((project) => {
                const done = project.tasks.filter((t) => t.status === "completed").length;
                const total = project.tasks.length;
                const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                return (
                  <Link key={project.id} href={`/projects/${project.id}`}>
                    <div className="flex items-center gap-4 px-4 py-3 hover:bg-muted/30 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{project.name}</p>
                        <p className="text-xs text-muted-foreground">{project.owner.name}</p>
                      </div>
                      {total > 0 && (
                        <div className="hidden md:flex items-center gap-2 w-32">
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-muted-foreground w-8 text-right">{pct}%</span>
                        </div>
                      )}
                      <span className={`text-xs font-medium capitalize ${statusColors[project.status] ?? "text-gray-500"}`}>
                        {project.status.replace("_", " ")}
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
          <div className="flex gap-3 flex-wrap">
            {(role === "admin" || role === "manager") && (
              <Link href="/projects" className="rounded-lg border px-4 py-3 text-sm font-medium hover:bg-accent/50 transition-colors">
                + New Project
              </Link>
            )}
            {(role === "admin" || role === "ceo") && (
              <Link href="/pipeline" className="rounded-lg border px-4 py-3 text-sm font-medium hover:bg-accent/50 transition-colors">
                Review Pipeline
              </Link>
            )}
            {role === "admin" && (
              <Link href="/admin/users" className="rounded-lg border px-4 py-3 text-sm font-medium hover:bg-accent/50 transition-colors">
                Manage Users
              </Link>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
