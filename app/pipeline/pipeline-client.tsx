"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Clock, ClipboardList, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SubmitPipelineDialog } from "@/components/dialogs/submit-pipeline-dialog";
import { PipelineDetailModal } from "@/components/dialogs/pipeline-detail-modal";
import { cn, formatDate } from "@/lib/utils";
import { toast } from "sonner";

type Person = { id: string; name: string; email: string };
type PipelineItem = {
  id: string; projectName: string; description: string | null;
  scope: string; impact: string; estimatedTimeline: string | null;
  status: string; notes: string | null; createdAt: string;
  submitter: Person; approver: Person | null;
};

const STATUS_TABS = ["pending", "approved", "rejected"] as const;
const STATUS_CONFIG = {
  pending: { label: "Pending", icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
  approved: { label: "Approved", icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
  rejected: { label: "Rejected", icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
};

export function PipelineClient({
  initialItems,
  session,
}: {
  initialItems: PipelineItem[];
  session: any;
}) {
  const [items, setItems] = useState<PipelineItem[]>(initialItems);
  const [tab, setTab] = useState<"pending" | "approved" | "rejected">("pending");
  const [selected, setSelected] = useState<PipelineItem | null>(null);
  const [showSubmit, setShowSubmit] = useState(false);

  const filtered = items.filter((i) => i.status === tab);
  const counts = {
    pending: items.filter((i) => i.status === "pending").length,
    approved: items.filter((i) => i.status === "approved").length,
    rejected: items.filter((i) => i.status === "rejected").length,
  };

  function handleSubmitted(item: PipelineItem) {
    setItems((prev) => [item, ...prev]);
    setShowSubmit(false);
    toast.success("Project submitted for approval");
  }

  function handleProcessed(id: string, status: "approved" | "rejected", notes?: string) {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, status, notes: notes || null, approver: { id: session.user?.id, name: session.user?.name!, email: session.user?.email! } }
          : i
      )
    );
    setSelected(null);
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Pipeline</h1>
          <p className="text-sm text-muted-foreground">Review and approve new project submissions</p>
        </div>
        <Button onClick={() => setShowSubmit(true)}>
          <Plus className="h-4 w-4 mr-2" /> Submit Project
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {STATUS_TABS.map((s) => {
          const cfg = STATUS_CONFIG[s];
          return (
            <div key={s} className="rounded-lg border p-4 flex items-center gap-3">
              <div className={cn("rounded-md p-2 shrink-0", cfg.bg)}>
                <cfg.icon className={cn("h-5 w-5", cfg.color)} />
              </div>
              <div>
                <p className="text-2xl font-bold">{counts[s]}</p>
                <p className="text-xs text-muted-foreground">{cfg.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {STATUS_TABS.map((s) => (
          <button
            key={s}
            onClick={() => setTab(s)}
            className={cn(
              "pb-2 px-1 text-sm font-medium border-b-2 transition-colors",
              tab === s
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {STATUS_CONFIG[s].label}
            {counts[s] > 0 && (
              <span className="ml-1.5 text-xs bg-muted px-1.5 py-0.5 rounded-full">{counts[s]}</span>
            )}
          </button>
        ))}
      </div>

      {/* Items */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No {tab} projects</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {tab === "pending" ? "New submissions will appear here for review" : `No ${tab} projects yet`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const cfg = STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG];
            return (
              <div
                key={item.id}
                onClick={() => setSelected(item)}
                className="rounded-lg border p-5 flex items-start gap-4 hover:bg-accent/50 transition-colors cursor-pointer"
              >
                <div className={cn("rounded-md p-2 shrink-0 mt-0.5", cfg.bg)}>
                  <cfg.icon className={cn("h-4 w-4", cfg.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold">{item.projectName}</h3>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatDate(new Date(item.createdAt))}
                    </span>
                  </div>
                  {item.description && (
                    <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{item.description}</p>
                  )}
                  <div className="flex gap-4 mt-2">
                    {item.estimatedTimeline && (
                      <span className="text-xs text-muted-foreground">
                        Timeline: {item.estimatedTimeline}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      By: {item.submitter.name}
                    </span>
                    {item.approver && (
                      <span className="text-xs text-muted-foreground">
                        {item.status === "approved" ? "Approved" : "Rejected"} by {item.approver.name}
                      </span>
                    )}
                  </div>
                </div>
                {item.status === "pending" && (
                  <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setSelected(item); }}>
                    Review
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <SubmitPipelineDialog
        open={showSubmit}
        onClose={() => setShowSubmit(false)}
        onSubmitted={handleSubmitted}
      />

      {selected && (
        <PipelineDetailModal
          item={selected}
          onClose={() => setSelected(null)}
          onProcessed={handleProcessed}
        />
      )}
    </div>
  );
}
