# Implementation Guide

## Current Status

✅ **Phase 1 Complete** — Core infrastructure, auth, DB schema, UI components, page shells

---

## Phase 2: Projects CRUD

### API Routes

**`app/api/projects/route.ts`** — List & Create
```
GET  /api/projects        → list projects (filter by status, priority)
POST /api/projects        → create project
```

**`app/api/projects/[id]/route.ts`** — Read, Update, Delete
```
GET    /api/projects/:id  → fetch project with tasks
PATCH  /api/projects/:id  → update project
DELETE /api/projects/:id  → delete project
```

### Pages & Components

- `app/projects/page.tsx` — project cards grid with status filter
- `app/projects/[id]/page.tsx` — project detail with tasks tab
- `components/dialogs/create-project-dialog.tsx` — form: name, description, priority, dates
- `components/dialogs/edit-project-dialog.tsx` — pre-filled update form

### Checklist
- [ ] Projects list page with filter (status, priority)
- [ ] Create project dialog (name, description, priority, start/end date)
- [ ] Project detail page
- [ ] Edit & delete project (manager/admin only)

---

## Phase 3: Tasks & SubTasks CRUD

### API Routes

```
GET  /api/projects/:id/tasks    → list tasks for a project
POST /api/projects/:id/tasks    → create task

GET    /api/tasks/:id           → task detail with subtasks
PATCH  /api/tasks/:id           → update task
DELETE /api/tasks/:id           → delete task

POST   /api/tasks/:id/subtasks  → create subtask
PATCH  /api/subtasks/:id        → update subtask
DELETE /api/subtasks/:id        → delete subtask
```

### Pages & Components

- `components/tasks/task-card.tsx` — title, status badge, priority, assignee, deadline
- `components/tasks/task-form.tsx` — form: title, assignee, deadline, priority
- `components/tasks/subtask-list.tsx` — inline subtask management
- `components/dialogs/task-detail-modal.tsx` — full task view + subtasks

### Status Workflow
```
todo → in_progress → review → completed
```

### Checklist
- [ ] Task list inside project detail page
- [ ] Create task dialog (title, assignee, deadline, priority)
- [ ] Update task status (inline)
- [ ] SubTask list per task (add, complete, delete)
- [ ] Progress auto-calculated from task completion
- [ ] Deadline visual indicator (overdue = red, due soon = amber)

---

## Phase 4: Pipeline (CEO Approval)

### API Routes

```
GET  /api/pipeline              → list all (pending/approved/rejected)
POST /api/pipeline              → submit new project for approval

POST /api/pipeline/:id/approve  → approve → move to active projects
POST /api/pipeline/:id/reject   → reject with reason notes
```

### Pages & Components

- `app/pipeline/page.tsx` — cards for each submission with Approve/Reject buttons
- `components/dialogs/submit-pipeline-dialog.tsx` — form: project name, scope, impact, estimated timeline
- `components/dialogs/pipeline-detail-modal.tsx` — full detail view for CEO review

### Workflow
```
Manager submits → status: pending_approval
CEO approves    → project created with status: active, pipeline: approved
CEO rejects     → pipeline: rejected (with notes), manager can resubmit
```

### Checklist
- [ ] Pipeline list page with status tabs (Pending / Approved / Rejected)
- [ ] Submit project dialog (name, scope, impact, timeline)
- [ ] CEO approve action (creates project, moves to Projects)
- [ ] CEO reject action (with notes field)
- [ ] Role guard: only CEO/Admin can approve/reject

---

## Phase 5: User Management (Admin Only)

```
GET  /api/users         → list all users (admin only)
POST /api/users         → create new user with role
PATCH /api/users/:id    → update user role or info
```

- `app/admin/users/page.tsx` — user list with role badges
- `components/dialogs/create-user-dialog.tsx` — name, email, password, role

### Checklist
- [ ] User list page (admin only)
- [ ] Create user dialog
- [ ] Change user role

---

## Simplified File Structure (End State)

```
app/
├── api/
│   ├── auth/[...nextauth]/route.ts
│   ├── projects/
│   │   ├── route.ts
│   │   └── [id]/
│   │       ├── route.ts
│   │       └── tasks/route.ts
│   ├── tasks/
│   │   └── [id]/
│   │       ├── route.ts
│   │       └── subtasks/route.ts
│   ├── subtasks/[id]/route.ts
│   ├── pipeline/
│   │   ├── route.ts
│   │   └── [id]/
│   │       ├── approve/route.ts
│   │       └── reject/route.ts
│   └── users/
│       ├── route.ts
│       └── [id]/route.ts
├── dashboard/page.tsx
├── projects/
│   ├── page.tsx
│   └── [id]/page.tsx
├── pipeline/page.tsx
├── admin/users/page.tsx
└── login/page.tsx

components/
├── ui/                     (done)
├── layout/                 (done)
├── dialogs/
│   ├── create-project-dialog.tsx
│   ├── edit-project-dialog.tsx
│   ├── task-detail-modal.tsx
│   ├── submit-pipeline-dialog.tsx
│   ├── pipeline-detail-modal.tsx
│   └── create-user-dialog.tsx
├── tasks/
│   ├── task-card.tsx
│   ├── task-form.tsx
│   └── subtask-list.tsx
└── pipeline/
    └── pipeline-card.tsx
```

---

## Role Permissions Summary

| Action | Admin | CEO | Manager | Employee |
|--------|-------|-----|---------|----------|
| View dashboard | ✓ | ✓ | ✓ | ✓ |
| View projects | ✓ | ✓ | ✓ | ✓ (assigned only) |
| Create project | ✓ | ✗ | ✓ | ✗ |
| Edit/delete project | ✓ | ✗ | ✓ (own) | ✗ |
| Create/edit tasks | ✓ | ✗ | ✓ | ✗ |
| Update task status | ✓ | ✗ | ✓ | ✓ (assigned) |
| Submit to pipeline | ✓ | ✗ | ✓ | ✗ |
| Approve/reject pipeline | ✓ | ✓ | ✗ | ✗ |
| Manage users | ✓ | ✗ | ✗ | ✗ |

---

**Last Updated:** February 27, 2025
