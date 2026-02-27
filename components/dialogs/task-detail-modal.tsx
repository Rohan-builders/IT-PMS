"use client";

import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { CheckSquare, Square, Plus, Trash2 } from "lucide-react";
import { cn, formatDate, getPriorityColor, getStatusColor } from "@/lib/utils";
import { toast } from "sonner";

type Assignee = { id: string; name: string; email: string };
type Subtask = { id: string; title: string; status: string; priority: string; assignee: Assignee | null; deadline: string | null };
type Task = { id: string; title: string; description: string | null; status: string; priority: string; assignee: Assignee | null; deadline: string | null; progress: number; subtasks: Subtask[] };
type User = { id: string; name: string; email: string };

const STATUSES = ["todo", "in_progress", "review", "completed"];
const STATUS_LABELS: Record<string, string> = { todo: "To Do", in_progress: "In Progress", review: "Review", completed: "Completed" };

export function TaskDetailModal({
  task: initialTask,
  users,
  canManage,
  onClose,
  onUpdated,
}: {
  task: Task;
  users: User[];
  canManage: boolean;
  onClose: () => void;
  onUpdated: (task: Task) => void;
}) {
  const [task, setTask] = useState<Task>(initialTask);
  const [newSubtask, setNewSubtask] = useState("");
  const [addingSubtask, setAddingSubtask] = useState(false);
  const [savingSubtask, setSavingSubtask] = useState(false);

  async function updateField(field: string, value: string) {
    const res = await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value || null }),
    });
    if (res.ok) {
      const updated = await res.json();
      const newTask = { ...task, ...updated };
      setTask(newTask);
      onUpdated(newTask);
    } else {
      toast.error("Failed to update");
    }
  }

  async function toggleSubtask(subtaskId: string, current: string) {
    const newStatus = current === "completed" ? "todo" : "completed";
    const res = await fetch(`/api/subtasks/${subtaskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      const updatedSubtasks = task.subtasks.map((s) =>
        s.id === subtaskId ? { ...s, status: newStatus } : s
      );
      const newTask = { ...task, subtasks: updatedSubtasks };
      setTask(newTask);
      onUpdated(newTask);
    }
  }

  async function addSubtask() {
    if (!newSubtask.trim()) return;
    setSavingSubtask(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}/subtasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newSubtask }),
      });
      if (res.ok) {
        const subtask = await res.json();
        const newTask = { ...task, subtasks: [...task.subtasks, { ...subtask, assignee: null }] };
        setTask(newTask);
        onUpdated(newTask);
        setNewSubtask("");
        setAddingSubtask(false);
        toast.success("Subtask added");
      } else {
        toast.error("Failed to add subtask");
      }
    } finally {
      setSavingSubtask(false);
    }
  }

  async function deleteSubtask(subtaskId: string) {
    const res = await fetch(`/api/subtasks/${subtaskId}`, { method: "DELETE" });
    if (res.ok) {
      const newTask = { ...task, subtasks: task.subtasks.filter((s) => s.id !== subtaskId) };
      setTask(newTask);
      onUpdated(newTask);
    } else {
      toast.error("Failed to delete subtask");
    }
  }

  const statusCfg = getStatusColor(task.status);
  const priCfg = getPriorityColor(task.priority);
  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== "completed";
  const subtaskDone = task.subtasks.filter((s) => s.status === "completed").length;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold pr-6">{task.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Status & Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Status</Label>
              {canManage ? (
                <Select value={task.status} onValueChange={(v) => updateField("status", v)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s} className="text-xs">{STATUS_LABELS[s]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <span className={cn("text-xs px-2 py-1 rounded-full inline-block", statusCfg.bg, statusCfg.text)}>
                  {STATUS_LABELS[task.status]}
                </span>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Priority</Label>
              {canManage ? (
                <Select value={task.priority} onValueChange={(v) => updateField("priority", v)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical" className="text-xs">Critical</SelectItem>
                    <SelectItem value="high" className="text-xs">High</SelectItem>
                    <SelectItem value="medium" className="text-xs">Medium</SelectItem>
                    <SelectItem value="low" className="text-xs">Low</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <span className={cn("text-xs px-2 py-1 rounded-full inline-block", priCfg.bg, priCfg.text)}>
                  {task.priority}
                </span>
              )}
            </div>
          </div>

          {/* Assignee & Deadline */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Assignee</Label>
              {canManage ? (
                <Select value={task.assignee?.id || "none"} onValueChange={(v) => updateField("assigneeId", v === "none" ? "" : v)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none" className="text-xs">Unassigned</SelectItem>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id} className="text-xs">{u.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm">{task.assignee?.name || "Unassigned"}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Deadline</Label>
              {canManage ? (
                <Input
                  type="date"
                  className="h-8 text-xs"
                  value={task.deadline ? new Date(task.deadline).toISOString().split("T")[0] : ""}
                  onChange={(e) => updateField("deadline", e.target.value)}
                />
              ) : (
                <p className={cn("text-sm", isOverdue && "text-red-600")}>
                  {task.deadline ? formatDate(new Date(task.deadline)) : "None"}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Description</Label>
              <p className="text-sm text-muted-foreground">{task.description}</p>
            </div>
          )}

          {/* Subtasks */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">
                Subtasks {task.subtasks.length > 0 && `(${subtaskDone}/${task.subtasks.length})`}
              </Label>
              {canManage && (
                <button
                  onClick={() => setAddingSubtask(true)}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" /> Add
                </button>
              )}
            </div>

            {task.subtasks.length > 0 && (
              <div className="space-y-1">
                {task.subtasks.map((sub) => (
                  <div key={sub.id} className="flex items-center gap-2 group/sub py-1">
                    <button onClick={() => toggleSubtask(sub.id, sub.status)} className="shrink-0">
                      {sub.status === "completed" ? (
                        <CheckSquare className="h-4 w-4 text-green-600" />
                      ) : (
                        <Square className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                    <span className={cn("text-sm flex-1", sub.status === "completed" && "line-through text-muted-foreground")}>
                      {sub.title}
                    </span>
                    {canManage && (
                      <button
                        onClick={() => deleteSubtask(sub.id)}
                        className="opacity-0 group-hover/sub:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {addingSubtask && (
              <div className="flex gap-2">
                <Input
                  autoFocus
                  placeholder="Subtask title..."
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") addSubtask(); if (e.key === "Escape") { setAddingSubtask(false); setNewSubtask(""); } }}
                  className="h-8 text-sm"
                />
                <Button size="sm" onClick={addSubtask} disabled={savingSubtask}>Add</Button>
                <Button size="sm" variant="outline" onClick={() => { setAddingSubtask(false); setNewSubtask(""); }}>Cancel</Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
