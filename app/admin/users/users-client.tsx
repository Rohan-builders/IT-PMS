"use client";

import { useState } from "react";
import { Plus, MoreHorizontal, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { CreateUserDialog } from "@/components/dialogs/create-user-dialog";
import { cn, formatDate, getInitials } from "@/lib/utils";
import { toast } from "sonner";

type User = {
  id: string; name: string; email: string; role: string; createdAt: string; avatar: string | null;
};

const ROLE_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  admin: { label: "Admin", bg: "bg-purple-50", text: "text-purple-600" },
  ceo: { label: "CEO", bg: "bg-blue-50", text: "text-blue-600" },
  manager: { label: "Manager", bg: "bg-amber-50", text: "text-amber-600" },
  employee: { label: "Employee", bg: "bg-gray-50", text: "text-gray-600" },
};

export function UsersClient({ initialUsers, session }: { initialUsers: User[]; session: any }) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [showCreate, setShowCreate] = useState(false);

  function handleCreated(user: User) {
    setUsers((prev) => [user, ...prev]);
    setShowCreate(false);
  }

  async function handleRoleChange(userId: string, role: string) {
    const res = await fetch(`/api/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (res.ok) {
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
      toast.success("Role updated");
    } else {
      toast.error("Failed to update role");
    }
  }

  async function handleDelete(userId: string) {
    if (userId === session?.user?.id) { toast.error("Cannot delete yourself"); return; }
    if (!confirm("Delete this user?")) return;
    const res = await fetch(`/api/users/${userId}`, { method: "DELETE" });
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      toast.success("User deleted");
    } else {
      toast.error("Failed to delete user");
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground">Manage team members and access roles</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(ROLE_CONFIG).map(([role, cfg]) => (
          <div key={role} className="rounded-lg border p-4">
            <p className="text-2xl font-bold">{users.filter((u) => u.role === role).length}</p>
            <p className="text-xs text-muted-foreground">{cfg.label}s</p>
          </div>
        ))}
      </div>

      {/* Table */}
      {users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No users yet</h3>
        </div>
      ) : (
        <div className="rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="text-left font-medium px-4 py-3 text-muted-foreground">User</th>
                <th className="text-left font-medium px-4 py-3 text-muted-foreground">Role</th>
                <th className="text-left font-medium px-4 py-3 text-muted-foreground hidden md:table-cell">Joined</th>
                <th className="w-10 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((user) => {
                const cfg = ROLE_CONFIG[user.role] || ROLE_CONFIG.employee;
                const isSelf = user.id === session?.user?.id;
                return (
                  <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold shrink-0">
                          {getInitials(user.name)}
                        </div>
                        <div>
                          <p className="font-medium">{user.name} {isSelf && <span className="text-xs text-muted-foreground">(you)</span>}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {isSelf ? (
                        <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", cfg.bg, cfg.text)}>
                          {cfg.label}
                        </span>
                      ) : (
                        <Select value={user.role} onValueChange={(v) => handleRoleChange(user.id, v)}>
                          <SelectTrigger className="h-7 w-32 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin" className="text-xs">Admin</SelectItem>
                            <SelectItem value="ceo" className="text-xs">CEO</SelectItem>
                            <SelectItem value="manager" className="text-xs">Manager</SelectItem>
                            <SelectItem value="employee" className="text-xs">Employee</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      {formatDate(new Date(user.createdAt))}
                    </td>
                    <td className="px-4 py-3">
                      {!isSelf && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDelete(user.id)}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <CreateUserDialog open={showCreate} onClose={() => setShowCreate(false)} onCreated={handleCreated} />
    </div>
  );
}
