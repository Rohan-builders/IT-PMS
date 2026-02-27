"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Plus, MoreHorizontal, CheckSquare, Square, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateTaskDialog } from "@/components/dialogs/create-task-dialog";
import { TaskDetailModal } from "@/components/dialogs/task-detail-modal";
import { cn, formatDate, getPriorityColor, getStatusColor, getInitials } from "@/lib/utils";
import { toast } from "sonner";

type Assignee = { id: string; name: string; email: string };
type Subtask = {
  id: string; title: string; status: string; priority: string;
  assignee: Assignee | null; deadline: string | null;
};
type Task = {
  id: string; title: string; description: string | null; status: string;
  priority: string; assignee: Assignee | null; deadline: string | null;
  progress: number; subtasks: Subtask[];
};
type Project = {
  id: string; name: string; description: string | null; status: string;
  priority: string; startDate: string | null; endDate: string | null;
  owner: Assignee; tasks: Task[];
};

const STATUS_LABELS: Record<string, string> = {
  todo: "To Do", in_progress: "In Progress", review: "Review", completed: "Completed",
};

export function ProjectDetailClient({
  project: initialProject,
  users,
  session,
}: {
  project: Project;
  users: { id: string; name: string; email: string; role: string }[];
  session: any;
}) {
  const [project, setProject] = useState<Project>(initialProject);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const role = session?.user?.role;
  const canManage = role === "admin" || role === "manager";
  const statusCfg = getStatusColor(project.status);
  const priCfg = getPriorityColor(project.priority);

  const done = project.tasks.filter((t) => t.status === "completed").length;
  const total = project.tasks.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  function handleTaskCreated(task: Task) {
    setProject((prev) => ({ ...prev, tasks: [...prev.tasks, task] }));
    setShowCreateTask(false);
  }

  function handleTaskUpdated(updated: Task) {
    setProject((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === updated.id ? updated : t)),
    }));
    setSelectedTask(updated);
  }

  async function handleStatusChange(taskId: string, status: string) {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const updated = await res.json();
      setProject((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, ...updated } : t)),
      }));
    } else {
      toast.error("Failed to update status");
    }
  }

  async function handleDeleteTask(taskId: string) {
    if (!confirm("Delete this task?")) return;
    const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
    if (res.ok) {
      setProject((prev) => ({ ...prev, tasks: prev.tasks.filter((t) => t.id !== taskId) }));
      toast.success("Task deleted");
    } else {
      toast.error("Failed to delete task");
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Back */}
      <Link
        href="/projects"
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ChevronLeft className="h-4 w-4" /> Projects
      </Link>

      {/* Project Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
          {project.description && (
            <p className="text-sm text-muted-foreground max-w-xl">{project.description}</p>
          )}
          <div className="flex gap-2 flex-wrap">
            <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", statusCfg.bg, statusCfg.text)}>
              {project.status.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </span>
            <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", priCfg.bg, priCfg.text)}>
              {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}
            </span>
            {project.endDate && (
              <span className="text-xs text-muted-foreground">
                Due {formatDate(new Date(project.endDate))}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Progress */}
      {total > 0 && (
        <div className="rounded-lg border p-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Progress</span>
            <span className="text-muted-foreground">{done}/{total} tasks completed</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-xs text-muted-foreground mt-1">{pct}%</p>
        </div>
      )}

      {/* Tasks Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Tasks</h2>
          {canManage && (
            <Button size="sm" onClick={() => setShowCreateTask(true)}>
              <Plus className="h-4 w-4 mr-1" /> Add Task
            </Button>
          )}
        </div>

        {project.tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg">
            <CheckSquare className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">No tasks yet</p>
            {canManage && (
              <Button size="sm" className="mt-3" onClick={() => setShowCreateTask(true)}>
                Add First Task
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {project.tasks.map((task) => {
              const taskPri = getPriorityColor(task.priority);
              const taskStatus = getStatusColor(task.status);
              const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== "completed";
              const subtaskDone = task.subtasks.filter((s) => s.status === "completed").length;

              return (
                <div
                  key={task.id}
                  className="group rounded-lg border p-4 flex items-start gap-3 hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedTask(task)}
                >
                  {/* Status toggle */}
                  <button
                    className="mt-0.5 shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      const next = task.status === "completed" ? "todo" : "completed";
                      handleStatusChange(task.id, next);
                    }}
                  >
                    {task.status === "completed" ? (
                      <CheckSquare className="h-5 w-5 text-green-600" />
                    ) : (
                      <Square className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn("font-medium text-sm", task.status === "completed" && "line-through text-muted-foreground")}>
                        {task.title}
                      </span>
                      <span className={cn("text-xs px-1.5 py-0.5 rounded-full", taskStatus.bg, taskStatus.text)}>
                        {STATUS_LABELS[task.status]}
                      </span>
                      <span className={cn("text-xs px-1.5 py-0.5 rounded-full", taskPri.bg, taskPri.text)}>
                        {task.priority}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-1">
                      {task.assignee && (
                        <span className="text-xs text-muted-foreground">{task.assignee.name}</span>
                      )}
                      {task.deadline && (
                        <span className={cn("text-xs", isOverdue ? "text-red-600" : "text-muted-foreground")}>
                          {isOverdue ? "Overdue · " : ""}{formatDate(new Date(task.deadline))}
                        </span>
                      )}
                      {task.subtasks.length > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {subtaskDone}/{task.subtasks.length} subtasks
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {canManage && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedTask(task); }}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <CreateTaskDialog
        open={showCreateTask}
        onClose={() => setShowCreateTask(false)}
        projectId={project.id}
        users={users}
        onCreated={handleTaskCreated as any}
      />

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          users={users}
          canManage={canManage}
          onClose={() => setSelectedTask(null)}
          onUpdated={handleTaskUpdated}
        />
      )}
    </div>
  );
}
