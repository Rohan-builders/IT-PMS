import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { tasks } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const rows = await db.query.tasks.findMany({
    where: eq(tasks.projectId, id),
    with: {
      assignee: { columns: { id: true, name: true, email: true } },
      subtasks: {
        with: { assignee: { columns: { id: true, name: true, email: true } } },
        orderBy: (s, { asc }) => [asc(s.order)],
      },
    },
    orderBy: (t, { asc }) => [asc(t.order)],
  });

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = session.user?.role;
  if (role !== "admin" && role !== "manager") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { title, description, priority, assigneeId, deadline } = body;

  if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

  const [task] = await db.insert(tasks).values({
    projectId: id,
    title,
    description: description || null,
    priority: priority || "medium",
    assigneeId: assigneeId || null,
    deadline: deadline ? new Date(deadline) : null,
  }).returning();

  return NextResponse.json(task, { status: 201 });
}
