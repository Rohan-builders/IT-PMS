import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { projects } from "@/db/schema";
import { desc } from "drizzle-orm";
import { AppShell } from "@/components/layout/app-shell";
import { ProjectsClient } from "./projects-client";

export default async function ProjectsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const allProjects = await db.query.projects.findMany({
    with: {
      owner: { columns: { id: true, name: true, email: true } },
      tasks: { columns: { id: true, status: true } },
    },
    orderBy: [desc(projects.createdAt)],
  });

  const users = await db.query.users.findMany({
    columns: { id: true, name: true, email: true, role: true },
  });

  return (
    <AppShell>
      <ProjectsClient
        initialProjects={allProjects as any}
        users={users}
        session={session}
      />
    </AppShell>
  );
}
