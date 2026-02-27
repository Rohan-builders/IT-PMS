import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { pipelineItems, projects } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = session.user?.role;
  if (role !== "admin" && role !== "ceo") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const item = await db.query.pipelineItems.findFirst({
    where: eq(pipelineItems.id, id),
  });

  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (item.status !== "pending") {
    return NextResponse.json({ error: "Already processed" }, { status: 400 });
  }

  // Create active project from pipeline item
  const [project] = await db.insert(projects).values({
    name: item.projectName,
    description: item.description,
    status: "active",
    priority: "medium",
    ownerId: item.submittedBy,
  }).returning();

  // Mark pipeline item as approved
  await db.update(pipelineItems)
    .set({ status: "approved", approvedBy: session.user!.id, updatedAt: new Date() })
    .where(eq(pipelineItems.id, id));

  return NextResponse.json({ success: true, project });
}
