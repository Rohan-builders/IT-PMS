# Rohan Builders Project Tracker - Setup Guide

## Quick Start

### 1. **Install Dependencies**
```bash
npm install
```

### 2. **Setup Environment Variables**
Create a `.env.local` file based on `.env.example`:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual values:

```env
# Neon PostgreSQL Connection String
DATABASE_URL="postgresql://user:password@host:5432/rohan_pms"

# NextAuth Configuration
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="http://localhost:3000"

# Admin Email (for seeding)
ADMIN_EMAIL="admin@rohanbuilders.com"
```

### 3. **Get Neon Database Connection**
1. Create account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the PostgreSQL connection string
4. Paste into `DATABASE_URL` in `.env.local`

### 4. **Initialize Database**
```bash
# Push schema to database
npm run db:push

# (Optional) View database in Studio
npm run db:studio
```

### 5. **Seed Initial Data**
Create `db/seed.ts`:

```typescript
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import bcrypt from "bcryptjs";

async function seed() {
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash("admin", 12);

    // Seed admin user
    await db.insert(users).values({
      email: "admin@rohanbuilders.com",
      name: "Admin User",
      password: hashedPassword,
      role: "admin",
    });

    console.log("✓ Database seeded successfully");
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
}

seed();
```

Run seed:
```bash
npx ts-node db/seed.ts
```

### 6. **Run Development Server**
```bash
npm run dev
```

Visit: `http://localhost:3000/login`

**Demo Credentials:**
- Email: `admin@rohanbuilders.com`
- Password: `admin`

---

## Project Structure

```
rohan-pms/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   └── auth/
│   ├── dashboard/            # Dashboard module
│   ├── projects/             # Projects module
│   ├── pipeline/             # Pipeline/Approval module
│   ├── login/                # Login page
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
│
├── components/               # React components
│   ├── ui/                   # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── badge.tsx
│   │   ├── dialog.tsx
│   │   └── dropdown-menu.tsx
│   └── layout/               # Layout components
│       ├── app-shell.tsx
│       └── sidebar.tsx
│
├── db/                       # Database
│   ├── schema.ts             # Drizzle ORM schema
│   ├── migrations/           # Auto-generated migrations
│   └── seed.ts               # Seed script
│
├── lib/                      # Utilities
│   ├── db.ts                 # Database client
│   ├── auth.ts               # NextAuth config
│   └── utils.ts              # Helper functions
│
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
├── drizzle.config.ts
└── skill.md                  # Design system reference
```

---

## Development Features

### Database Management

**Push schema changes:**
```bash
npm run db:push
```

**View database in Drizzle Studio:**
```bash
npm run db:studio
```

### Build & Deploy to Vercel

```bash
npm run build
```

Then push to GitHub and deploy via Vercel dashboard.

---

## Modules Overview

### 1. Dashboard
- **Location:** `app/dashboard/page.tsx`
- **Features:**
  - KPI stats (Active Projects, In-Progress Tasks, Pending Approvals)
  - Quick actions based on user role
  - Overview of system health

### 2. Projects
- **Location:** `app/projects/page.tsx`
- **Features:**
  - Project > Task > SubTask hierarchy
  - Status tracking (draft, pending_approval, active, completed, archived)
  - Priority levels (critical, high, medium, low)
  - Assignee management
  - Deadline tracking
  - Role-based access control

### 3. Pipeline (CEO Approval)
- **Location:** `app/pipeline/page.tsx`
- **Features:**
  - CEO/Admin approval workflow
  - Project details (scope, impact, estimated timeline)
  - Approve/Reject functionality
  - Auto-move approved projects to Projects module
  - Pending items queue

---

## Role-Based Access Control

| Role     | Dashboard | Projects | Pipeline |
|----------|-----------|----------|----------|
| Admin    | ✓         | ✓        | ✓        |
| CEO      | ✓         | ✓        | ✓        |
| Manager  | ✓         | ✓        | ✗        |
| Employee | ✓         | ✓ (view) | ✗        |

---

## Database Schema

### Users Table
```typescript
{
  id: UUID (primary)
  email: VARCHAR (unique)
  name: VARCHAR
  password: VARCHAR
  role: ENUM (admin, ceo, manager, employee)
  avatar: VARCHAR (optional)
  createdAt: TIMESTAMP
  updatedAt: TIMESTAMP
}
```

### Projects Table
```typescript
{
  id: UUID (primary)
  name: VARCHAR
  description: TEXT
  status: ENUM (draft, pending_approval, active, completed, archived)
  ownerId: UUID (foreign key → users)
  priority: ENUM (critical, high, medium, low)
  startDate: TIMESTAMP
  endDate: TIMESTAMP
  createdAt: TIMESTAMP
  updatedAt: TIMESTAMP
}
```

### Tasks Table
```typescript
{
  id: UUID (primary)
  projectId: UUID (foreign key → projects)
  title: VARCHAR
  description: TEXT
  status: ENUM (todo, in_progress, review, completed)
  priority: ENUM (critical, high, medium, low)
  assigneeId: UUID (foreign key → users)
  deadline: TIMESTAMP
  progress: INTEGER (0-100)
  order: INTEGER
  createdAt: TIMESTAMP
  updatedAt: TIMESTAMP
}
```

### SubTasks Table
```typescript
{
  id: UUID (primary)
  taskId: UUID (foreign key → tasks)
  title: VARCHAR
  description: TEXT
  status: ENUM (todo, in_progress, review, completed)
  priority: ENUM (critical, high, medium, low)
  assigneeId: UUID (foreign key → users)
  deadline: TIMESTAMP
  order: INTEGER
  createdAt: TIMESTAMP
  updatedAt: TIMESTAMP
}
```

### Pipeline Items Table
```typescript
{
  id: UUID (primary)
  projectName: VARCHAR
  description: TEXT
  scope: TEXT
  impact: TEXT
  estimatedTimeline: VARCHAR
  submittedBy: UUID (foreign key → users)
  status: ENUM (pending, approved, rejected)
  notes: TEXT
  approvedBy: UUID (foreign key → users)
  createdAt: TIMESTAMP
  updatedAt: TIMESTAMP
}
```

### Activity Logs Table
```typescript
{
  id: UUID (primary)
  userId: UUID (foreign key → users)
  action: VARCHAR
  entityType: VARCHAR
  entityId: UUID
  description: TEXT
  changes: TEXT (JSON)
  createdAt: TIMESTAMP
}
```

---

## Next Steps: Implementation Checklist

### Phase 1: Core Features (Current)
- [x] Project structure setup
- [x] Database schema
- [x] UI components
- [x] Authentication/Login
- [ ] **TODO:** Implement Projects CRUD
- [ ] **TODO:** Implement Tasks CRUD
- [ ] **TODO:** Implement Pipeline approval workflow

### Phase 2: Advanced Features
- [ ] **TODO:** Activity logging
- [ ] **TODO:** Notifications
- [ ] **TODO:** File attachments
- [ ] **TODO:** Comments/discussions
- [ ] **TODO:** Export to PDF/CSV

### Phase 3: Optimization & Deploy
- [ ] **TODO:** Performance optimization
- [ ] **TODO:** Error handling
- [ ] **TODO:** Testing
- [ ] **TODO:** Deploy to Vercel
- [ ] **TODO:** Setup CI/CD

---

## Deployment to Vercel

1. **Push code to GitHub:**
   ```bash
   git add .
   git commit -m "Initial project tracker setup"
   git push origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import GitHub repository
   - Add environment variables:
     - `DATABASE_URL`
     - `NEXTAUTH_SECRET`
     - `NEXTAUTH_URL` (your Vercel domain)

3. **Deploy:**
   - Click deploy
   - Vercel automatically builds and deploys on every push

---

## Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED
```
- Check `DATABASE_URL` is correct
- Ensure Neon database is accessible
- Check IP whitelist in Neon console

### Authentication Issues
```
Invalid email or password
```
- Verify user exists in database
- Check password hashing (bcrypt)
- Ensure `NEXTAUTH_SECRET` is set

### Build Errors
```
Module not found
```
- Run `npm install` again
- Delete `node_modules` and `.next`
- Restart development server

---

## Support & Resources

- **Next.js Docs:** https://nextjs.org/docs
- **NextAuth.js Docs:** https://next-auth.js.org
- **Drizzle ORM:** https://orm.drizzle.team
- **Tailwind CSS:** https://tailwindcss.com
- **shadcn/ui:** https://ui.shadcn.com
- **Neon Docs:** https://neon.tech/docs

---

**Last Updated:** February 27, 2025
