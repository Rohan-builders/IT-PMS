"use client";

import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function SubmitPipelineDialog({
  open,
  onClose,
  onSubmitted,
}: {
  open: boolean;
  onClose: () => void;
  onSubmitted: (item: any) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    projectName: "", description: "", scope: "", impact: "", estimatedTimeline: "",
  });

  function set(key: string, val: string) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.projectName.trim() || !form.scope.trim() || !form.impact.trim()) {
      toast.error("Project name, scope, and impact are required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const item = await res.json();
      onSubmitted(item);
      setForm({ projectName: "", description: "", scope: "", impact: "", estimatedTimeline: "" });
    } catch (err: any) {
      toast.error(err.message || "Failed to submit");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submit Project for Approval</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pname">Project Name *</Label>
            <Input id="pname" placeholder="e.g. ERP System Upgrade" value={form.projectName} onChange={(e) => set("projectName", e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pdesc">Description</Label>
            <Textarea id="pdesc" placeholder="Brief overview..." value={form.description} onChange={(e) => set("description", e.target.value)} rows={2} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="scope">Scope *</Label>
            <Textarea id="scope" placeholder="What will be included in this project? What are the boundaries?" value={form.scope} onChange={(e) => set("scope", e.target.value)} rows={3} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="impact">Expected Impact *</Label>
            <Textarea id="impact" placeholder="What business value will this deliver? What problems does it solve?" value={form.impact} onChange={(e) => set("impact", e.target.value)} rows={3} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="timeline">Estimated Timeline</Label>
            <Input id="timeline" placeholder="e.g. 3 months, Q2 2025" value={form.estimatedTimeline} onChange={(e) => set("estimatedTimeline", e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Submitting..." : "Submit for Approval"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
