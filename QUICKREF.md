# Quick Reference Guide

## Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm run start            # Run production server

# Database
npm run db:push          # Push schema changes
npm run db:studio        # Open Drizzle Studio GUI

# Seeding
npx ts-node db/seed.ts   # Seed demo data

# Type checking
npm run lint             # Run ESLint
```

## Project Structure Cheat Sheet

```
app/              → Routes & pages (Next.js App Router)
components/       → React components
db/               → Database & ORM
lib/              → Utilities & helpers
public/           → Static assets
```

## File Naming Conventions

- **Components:** PascalCase (e.g., `ProjectCard.tsx`)
- **Pages:** kebab-case in routes (e.g., `/projects/[id]`)
- **Functions:** camelCase (e.g., `formatDate()`)
- **Types/Interfaces:** PascalCase (e.g., `ProjectProps`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `MAX_FILE_SIZE`)

## Common Imports

```typescript
// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";

// Icons
import { Plus, Edit, Delete, ChevronRight } from "lucide-react";

// Utilities
import { cn, formatDate, getPriorityColor } from "@/lib/utils";

// Database
import { db } from "@/lib/db";
import { projects, tasks } from "@/db/schema";

// Authentication
import { auth } from "@/lib/auth";
import { signIn, signOut, useSession } from "next-auth/react";

// Validation
import { z } from "zod";
import { useForm } from "react-hook-form";

// Notifications
import { toast } from "sonner";
```

## Common Patterns

### Protected Page (Server Component)
```typescript
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Component code...
}
```

### Role-Based UI (Client Component)
```typescript
"use client";

import { useSession } from "next-auth/react";

export function MyComponent() {
  const { data: session } = useSession();

  if (session?.user?.role === "ceo") {
    return <div>CEO Only Content</div>;
  }

  return <div>General Content</div>;
}
```

### Database Query
```typescript
import { db } from "@/lib/db";
import { projects } from "@/db/schema";
import { eq } from "drizzle-orm";

// Single query
const project = await db.query.projects.findFirst({
  where: eq(projects.id, "123"),
});

// Multiple with filter
const activeProjects = await db.query.projects.findMany({
  where: eq(projects.status, "active"),
});

// With relationships
const projectWithTasks = await db.query.projects.findFirst({
  where: eq(projects.id, "123"),
  with: {
    tasks: true,
  },
});
```

### API Route (POST)
```typescript
import { db } from "@/lib/db";
import { projects } from "@/db/schema";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const result = await db
      .insert(projects)
      .values(body)
      .returning();

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create" },
      { status: 500 }
    );
  }
}
```

### Form Component
```typescript
"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function MyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm();

  async function onSubmit(data) {
    try {
      const res = await fetch("/api/endpoint", {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed");

      toast.success("Success!");
    } catch (error) {
      toast.error("Error occurred");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input {...register("name", { required: true })} />
      {errors.name && <span>Required</span>}
      <Button type="submit">Submit</Button>
    </form>
  );
}
```

### Dialog Component
```typescript
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function MyDialog() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open</Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
          </DialogHeader>
          {/* Content */}
        </DialogContent>
      </Dialog>
    </>
  );
}
```

## Color/Status Reference

### Priority Colors
```typescript
{
  critical: { bg: 'bg-red-50', text: 'text-red-600' },
  high: { bg: 'bg-orange-50', text: 'text-orange-600' },
  medium: { bg: 'bg-amber-50', text: 'text-amber-600' },
  low: { bg: 'bg-blue-50', text: 'text-blue-600' },
}
```

### Status Colors
```typescript
{
  todo: { bg: 'bg-gray-50', text: 'text-gray-600' },
  in_progress: { bg: 'bg-blue-50', text: 'text-blue-600' },
  review: { bg: 'bg-purple-50', text: 'text-purple-600' },
  completed: { bg: 'bg-green-50', text: 'text-green-600' },
}
```

## Tailwind Utilities

```typescript
// Layout
className="flex items-center justify-between"
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"

// Spacing
className="space-y-4"     // vertical gaps
className="gap-3"         // grid/flex gaps
className="p-4 m-2"       // padding/margin

// Sizing
className="w-full h-10"   // width/height
className="max-w-md"      // max width

// Responsive
className="hidden md:block"  // hide on mobile
className="px-4 md:px-6"     // responsive padding

// States
className="hover:bg-accent/50"
className="disabled:opacity-50"
className="group-hover:opacity-100"
```

## Debugging Tips

### Check Session
```typescript
const session = await auth();
console.log(session?.user?.role); // Log user role
```

### Check Database Connection
```typescript
// In a route handler
try {
  const count = await db.query.projects.findMany();
  console.log("DB OK:", count.length);
} catch (e) {
  console.error("DB Error:", e);
}
```

### Browser Console (Client)
```typescript
// Check current URL
console.log(window.location.href);

// Check session from hook
const { data: session } = useSession();
console.log(session);
```

## Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `DATABASE_URL not set` | Missing env var | Add to `.env.local` |
| `Module not found` | Wrong import path | Check `@/` alias |
| `Auth session null` | Not logged in | Add redirect to `/login` |
| `Database connection error` | Wrong connection string | Verify Neon credentials |
| `Role not authorized` | Permission denied | Check role in middleware |

## Deployment Checklist

- [ ] All secrets in `.env` (not `.env.local`)
- [ ] Database migrations applied
- [ ] Tests passing
- [ ] No console errors
- [ ] NEXTAUTH_URL set to production domain
- [ ] Database backups configured
- [ ] Error logging configured (Sentry)

## Resources

- **Next.js Docs:** https://nextjs.org/docs
- **Drizzle Docs:** https://orm.drizzle.team/docs
- **Tailwind Docs:** https://tailwindcss.com/docs
- **shadcn/ui:** https://ui.shadcn.com
- **NextAuth.js:** https://next-auth.js.org/docs

---

**Tip:** Bookmark this file for quick reference!

Last Updated: February 27, 2025
