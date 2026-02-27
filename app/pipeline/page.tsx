import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { pipelineItems } from "@/db/schema";
import { desc } from "drizzle-orm";
import { AppShell } from "@/components/layout/app-shell";
import { PipelineClient } from "./pipeline-client";

export default async function PipelinePage() {
  const session = await auth();
  if (!session) redirect("/login");

  if (session.user?.role !== "ceo" && session.user?.role !== "admin") {
    redirect("/dashboard");
  }

  const items = await db.query.pipelineItems.findMany({
    with: {
      submitter: { columns: { id: true, name: true, email: true } },
      approver: { columns: { id: true, name: true, email: true } },
    },
    orderBy: [desc(pipelineItems.createdAt)],
  });

  return (
    <AppShell>
      <PipelineClient initialItems={items as any} session={session} />
    </AppShell>
  );
}
