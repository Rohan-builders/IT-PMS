import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { projects } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");

  const conditions = [];
  if (status) conditions.push(eq(projects.status, status as any));
  if (priority) conditions.push(eq(projects.priority, priority as any));

  const rows = await db.query.projects.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    with: { owner: { columns: { id: true, name: true, email: true } } },
    orderBy: [desc(projects.createdAt)],
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
  const { name, description, priority, startDate, endDate, status } = body;

  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const [project] = await db.insert(projects).values({
    name,
    description: description || null,
    priority: priority || "medium",
    status: status || "active",
    ownerId: session.user!.id,
    startDate: startDate ? new Date(startDate) : null,
    endDate: endDate ? new Date(endDate) : null,
  }).returning();

  return NextResponse.json(project, { status: 201 });
}
