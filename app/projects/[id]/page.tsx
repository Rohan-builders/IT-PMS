import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { AppShell } from "@/components/layout/app-shell";
import { ProjectDetailClient } from "./project-detail-client";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;

  const project = await db.query.projects.findFirst({
    where: eq(projects.id, id),
    with: {
      owner: { columns: { id: true, name: true, email: true } },
      tasks: {
        with: {
          assignee: { columns: { id: true, name: true, email: true } },
          subtasks: {
            with: { assignee: { columns: { id: true, name: true, email: true } } },
            orderBy: (s, { asc }) => [asc(s.order)],
          },
        },
        orderBy: (t, { asc }) => [asc(t.order)],
      },
    },
  });

  if (!project) notFound();

  const users = await db.query.users.findMany({
    columns: { id: true, name: true, email: true, role: true },
  });

  return (
    <AppShell>
      <ProjectDetailClient project={project as any} users={users} session={session} />
    </AppShell>
  );
}
