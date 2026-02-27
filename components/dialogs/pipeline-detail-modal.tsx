"use client";

import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

type PipelineItem = {
  id: string; projectName: string; description: string | null;
  scope: string; impact: string; estimatedTimeline: string | null;
  status: string; notes: string | null; createdAt: string;
  submitter: { id: string; name: string; email: string };
  approver: { id: string; name: string; email: string } | null;
};

export function PipelineDetailModal({
  item,
  onClose,
  onProcessed,
}: {
  item: PipelineItem;
  onClose: () => void;
  onProcessed: (id: string, status: "approved" | "rejected", notes?: string) => void;
}) {
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const isPending = item.status === "pending";

  async function handleApprove() {
    setLoading("approve");
    try {
      const res = await fetch(`/api/pipeline/${item.id}/approve`, { method: "POST" });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success("Project approved and moved to Projects");
      onProcessed(item.id, "approved");
    } catch (err: any) {
      toast.error(err.message || "Failed to approve");
    } finally {
      setLoading(null);
    }
  }

  async function handleReject() {
    if (!notes.trim()) { toast.error("Please provide rejection notes"); return; }
    setLoading("reject");
    try {
      const res = await fetch(`/api/pipeline/${item.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success("Project rejected");
      onProcessed(item.id, "rejected", notes);
    } catch (err: any) {
      toast.error(err.message || "Failed to reject");
    } finally {
      setLoading(null);
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item.projectName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Meta */}
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span>Submitted by <strong>{item.submitter.name}</strong></span>
            <span>{formatDate(new Date(item.createdAt))}</span>
            {item.estimatedTimeline && <span>Timeline: <strong>{item.estimatedTimeline}</strong></span>}
          </div>

          {/* Description */}
          {item.description && (
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Description</Label>
              <p className="text-sm">{item.description}</p>
            </div>
          )}

          {/* Scope */}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Scope</Label>
            <p className="text-sm bg-muted/40 rounded-md p-3">{item.scope}</p>
          </div>

          {/* Impact */}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Expected Impact</Label>
            <p className="text-sm bg-muted/40 rounded-md p-3">{item.impact}</p>
          </div>

          {/* Existing notes on processed items */}
          {!isPending && item.notes && (
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                {item.status === "rejected" ? "Rejection Notes" : "Notes"}
              </Label>
              <p className="text-sm bg-muted/40 rounded-md p-3">{item.notes}</p>
            </div>
          )}

          {/* Rejection notes input for pending */}
          {isPending && (
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-xs text-muted-foreground">
                Rejection Notes <span className="text-xs">(required to reject)</span>
              </Label>
              <Textarea
                id="notes"
                placeholder="Explain why the project is being rejected..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          )}
        </div>

        {isPending && (
          <DialogFooter className="flex gap-2 sm:justify-between">
            <Button
              variant="outline"
              className="text-destructive border-destructive hover:bg-destructive/10"
              onClick={handleReject}
              disabled={loading !== null}
            >
              <XCircle className="h-4 w-4 mr-2" />
              {loading === "reject" ? "Rejecting..." : "Reject"}
            </Button>
            <Button
              onClick={handleApprove}
              disabled={loading !== null}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {loading === "approve" ? "Approving..." : "Approve"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
