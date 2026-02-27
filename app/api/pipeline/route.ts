import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { pipelineItems } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = session.user?.role;
  if (role !== "admin" && role !== "ceo") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const rows = await db.query.pipelineItems.findMany({
    where: status ? eq(pipelineItems.status, status as any) : undefined,
    with: {
      submitter: { columns: { id: true, name: true, email: true } },
      approver: { columns: { id: true, name: true, email: true } },
    },
    orderBy: [desc(pipelineItems.createdAt)],
  });

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = session.user?.role;
  if (role !== "admin" && role !== "manager") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { projectName, description, scope, impact, estimatedTimeline } = body;

  if (!projectName || !scope || !impact) {
    return NextResponse.json({ error: "projectName, scope and impact are required" }, { status: 400 });
  }

  const [item] = await db.insert(pipelineItems).values({
    projectName,
    description: description || null,
    scope,
    impact,
    estimatedTimeline: estimatedTimeline || null,
    submittedBy: session.user!.id,
  }).returning();

  return NextResponse.json(item, { status: 201 });
}
