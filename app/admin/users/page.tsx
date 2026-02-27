import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { desc } from "drizzle-orm";
import { AppShell } from "@/components/layout/app-shell";
import { UsersClient } from "./users-client";

export default async function UsersPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user?.role !== "admin") redirect("/dashboard");

  const allUsers = await db.query.users.findMany({
    columns: { password: false },
    orderBy: [desc(users.createdAt)],
  });

  return (
    <AppShell>
      <UsersClient initialUsers={allUsers as any} session={session} />
    </AppShell>
  );
}
