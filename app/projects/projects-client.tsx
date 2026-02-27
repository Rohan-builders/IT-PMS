"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, ArrowRight, MoreHorizontal, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateProjectDialog } from "@/components/dialogs/create-project-dialog";
import { cn, formatDate, getPriorityColor, getStatusColor } from "@/lib/utils";
import { toast } from "sonner";

type Project = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  priority: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  owner: { id: string; name: string; email: string };
  tasks: { id: string; status: string }[];
};

type User = { id: string; name: string; email: string; role: string };

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  pending_approval: "Pending Approval",
  active: "Active",
  completed: "Completed",
  archived: "Archived",
};

const STATUSES = ["all", "draft", "active", "pending_approval", "completed", "archived"];

export function ProjectsClient({
  initialProjects,
  users,
  session,
}: {
  initialProjects: Project[];
  users: User[];
  session: any;
}) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreate, setShowCreate] = useState(false);

  const role = session?.user?.role;
  const canCreate = role === "admin" || role === "manager";

  const filtered = statusFilter === "all"
    ? projects
    : projects.filter((p) => p.status === statusFilter);

  function handleCreated(project: Project) {
    setProjects((prev) => [project, ...prev]);
    setShowCreate(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this project? All tasks will be removed.")) return;
    const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
    if (res.ok) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
      toast.success("Project deleted");
    } else {
      toast.error("Failed to delete project");
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground">View and manage all projects</p>
        </div>
        {canCreate && (
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        )}
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 flex-wrap">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={cn(
              "text-xs px-3 py-1.5 rounded-full border transition-colors",
              statusFilter === s
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {s === "all" ? "All" : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Folder className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No projects found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {canCreate ? "Create your first project to get started" : "No projects yet"}
          </p>
          {canCreate && (
            <Button className="mt-4" onClick={() => setShowCreate(true)}>
              Create Project
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((project) => {
            const done = project.tasks.filter((t) => t.status === "completed").length;
            const total = project.tasks.length;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            const statusCfg = getStatusColor(project.status);
            const priCfg = getPriorityColor(project.priority);

            return (
              <div
                key={project.id}
                className="group rounded-lg border p-5 flex flex-col gap-4 transition-colors hover:bg-accent/50"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{project.name}</h3>
                    {project.description && (
                      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                        {project.description}
                      </p>
                    )}
                  </div>
                  {canCreate && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/projects/${project.id}`}>Open</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDelete(project.id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                {/* Badges */}
                <div className="flex gap-2 flex-wrap">
                  <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", statusCfg.bg, statusCfg.text)}>
                    {STATUS_LABELS[project.status]}
                  </span>
                  <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", priCfg.bg, priCfg.text)}>
                    {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}
                  </span>
                </div>

                {/* Progress */}
                {total > 0 && (
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>{done}/{total} tasks</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-1 border-t">
                  <span className="text-xs text-muted-foreground">
                    {project.owner.name}
                  </span>
                  {project.endDate && (
                    <span className="text-xs text-muted-foreground">
                      Due {formatDate(new Date(project.endDate))}
                    </span>
                  )}
                  <Link
                    href={`/projects/${project.id}`}
                    className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Open <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CreateProjectDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={handleCreated}
      />
    </div>
  );
}
