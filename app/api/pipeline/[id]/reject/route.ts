import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { pipelineItems } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = session.user?.role;
  if (role !== "admin" && role !== "ceo") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { notes } = body;

  const item = await db.query.pipelineItems.findFirst({
    where: eq(pipelineItems.id, id),
  });

  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (item.status !== "pending") {
    return NextResponse.json({ error: "Already processed" }, { status: 400 });
  }

  await db.update(pipelineItems)
    .set({
      status: "rejected",
      approvedBy: session.user!.id,
      notes: notes || null,
      updatedAt: new Date(),
    })
    .where(eq(pipelineItems.id, id));

  return NextResponse.json({ success: true });
}
