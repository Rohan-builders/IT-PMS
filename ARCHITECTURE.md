# Architecture & System Design

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        BROWSER (Client)                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  React Components (UI Layer)                         │   │
│  │  - Pages (Dashboard, Projects, Pipeline)            │   │
│  │  - Components (Forms, Cards, Dialogs)               │   │
│  │  - Hooks (useSession, useForm)                       │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────┬────────────────────────────────────────┘
                       │ HTTP Requests
                       ▼
┌──────────────────────────────────────────────────────────────┐
│                    NEXT.JS SERVER (Backend)                   │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ API Routes (/api/...)                                 │  │
│  │ - Authentication (/api/auth)                          │  │
│  │ - Projects CRUD (Phase 2)                             │  │
│  │ - Tasks CRUD (Phase 3)                                │  │
│  │ - Pipeline (Phase 4)                                  │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ NextAuth.js (Authentication)                          │  │
│  │ - Session management                                  │  │
│  │ - Credentials provider                                │  │
│  │ - JWT tokens                                          │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Middleware (Route Protection)                         │  │
│  │ - Redirect to /login if not authenticated             │  │
│  │ - Pipeline access control (CEO only)                  │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────┬────────────────────────────────────────┘
                       │ SQL Queries
                       ▼
┌──────────────────────────────────────────────────────────────┐
│                  DRIZZLE ORM (Data Layer)                     │
│  - Schema definitions                                        │
│  - Type safety                                               │
│  - Query builder                                             │
└──────────────────────┬────────────────────────────────────────┘
                       │ PostgreSQL Protocol
                       ▼
┌──────────────────────────────────────────────────────────────┐
│            NEON POSTGRESQL DATABASE                           │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Tables:                                                │  │
│  │ - users                                                │  │
│  │ - projects                                             │  │
│  │ - tasks                                                │  │
│  │ - subtasks                                             │  │
│  │ - pipeline_items                                       │  │
│  │ - activity_logs                                        │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

### User Authentication Flow
```
User inputs credentials
        ↓
/api/auth/callback/credentials
        ↓
Check against database
        ↓
Compare hashed password (bcrypt)
        ↓
Generate JWT token
        ↓
Set session cookie
        ↓
Redirect to /dashboard
```

### Project Creation Flow (Manager/Admin)
```
Manager opens /projects
        ↓
Clicks "New Project"
        ↓
"Create Project" dialog opens
        ↓
Fills form + submits
        ↓
POST /api/projects
        ↓
Insert into projects table
        ↓
Log activity (activity_logs)
        ↓
Success toast notification
        ↓
Refresh projects list
```

### CEO Project Approval Flow
```
Manager submits project to pipeline
        ↓
Project status → "pending_approval"
        ↓
Entry in pipeline_items table
        ↓
CEO navigates to /pipeline
        ↓
CEO reviews project details
        ↓
CEO clicks Approve/Reject
        ↓
PUT /api/pipeline/[id]/approve or reject
        ↓
Update project status
        ↓
Update pipeline_items status
        ↓
If approved: Project moves to /projects
        ↓
Manager/Team notified (Phase 5)
```

---

## Database Relationship Diagram

```
┌─────────────────────┐
│     USERS           │
├─────────────────────┤
│ id (PK)             │
│ email               │
│ name                │
│ password_hash       │
│ role                │
│ avatar              │
│ created_at          │
│ updated_at          │
└─────────────────────┘
         ▲
         │ (owner, assignee)
         │
┌─────────────────────────────────────┐
│        PROJECTS                     │
├─────────────────────────────────────┤
│ id (PK)                             │
│ name                                │
│ description                         │
│ status                              │
│ owner_id (FK → users.id)            │
│ priority                            │
│ start_date                          │
│ end_date                            │
│ created_at                          │
│ updated_at                          │
└─────────────────────────────────────┘
         │
         │ (1 to many)
         ▼
┌─────────────────────────────────────┐
│         TASKS                       │
├─────────────────────────────────────┤
│ id (PK)                             │
│ project_id (FK → projects.id)       │
│ title                               │
│ description                         │
│ status                              │
│ priority                            │
│ assignee_id (FK → users.id)         │
│ deadline                            │
│ progress                            │
│ order                               │
│ created_at                          │
│ updated_at                          │
└─────────────────────────────────────┘
         │
         │ (1 to many)
         ▼
┌─────────────────────────────────────┐
│       SUBTASKS                      │
├─────────────────────────────────────┤
│ id (PK)                             │
│ task_id (FK → tasks.id)             │
│ title                               │
│ description                         │
│ status                              │
│ priority                            │
│ assignee_id (FK → users.id)         │
│ deadline                            │
│ order                               │
│ created_at                          │
│ updated_at                          │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│      PIPELINE_ITEMS                 │
├─────────────────────────────────────┤
│ id (PK)                             │
│ project_name                        │
│ description                         │
│ scope                               │
│ impact                              │
│ estimated_timeline                  │
│ submitted_by (FK → users.id)        │
│ status                              │
│ notes                               │
│ approved_by (FK → users.id)         │
│ created_at                          │
│ updated_at                          │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│       ACTIVITY_LOGS                 │
├─────────────────────────────────────┤
│ id (PK)                             │
│ user_id (FK → users.id)             │
│ action                              │
│ entity_type                         │
│ entity_id                           │
│ description                         │
│ changes (JSON)                      │
│ created_at                          │
└─────────────────────────────────────┘
```

---

## Request/Response Flow

### GET /dashboard
```
Browser sends GET request
        ↓
Middleware checks session
        ↓
If no session → redirect /login
        ↓
Server queries:
  - COUNT active projects
  - COUNT in-progress tasks
  - COUNT pending approvals
        ↓
Server renders dashboard component
        ↓
Pass metrics as props
        ↓
Return HTML to browser
        ↓
Browser renders dashboard
```

### POST /api/projects
```
Client sends POST with project data
        ↓
API route receives request
        ↓
Validate request body (Zod)
        ↓
Check user role (admin/manager)
        ↓
INSERT into projects table
        ↓
INSERT into activity_logs (audit trail)
        ↓
Return created project (201)
        ↓
Client shows success toast
        ↓
Refresh projects list
```

---

## Authentication & Authorization

### Session Flow
```
1. User logs in with credentials
   → NextAuth validates
   → Creates JWT token
   → Sets secure HTTP-only cookie

2. Subsequent requests include cookie
   → Middleware extracts session
   → Verifies JWT signature
   → Attaches user data to request

3. On page load (client)
   → useSession() hook fetches session
   → Renders UI based on user role
   → Protects routes from unauthorized access
```

### Role-Based Access Control (RBAC)
```
┌─────────────────────────────────────────────────┐
│  Session (contains user role)                   │
└─────────────────────────────────────────────────┘
         │
         ├─→ Check: Can user access /pipeline?
         │   → Only CEO/Admin allowed
         │
         ├─→ Check: Can user create projects?
         │   → Only Manager/Admin allowed
         │
         ├─→ Check: Can user see this task?
         │   → Owner/Assignee/Manager/Admin allowed
         │
         └─→ Check: Can user delete project?
             → Only Admin allowed
```

---

## Module Architecture

### Dashboard Module
```
/dashboard
    ├── Page loads (async)
    ├── Query database for metrics
    │   ├── Active projects count
    │   ├── In-progress tasks count
    │   └── Pending approvals count
    ├── Render stats cards
    ├── Show quick actions (role-based)
    └── Display navigation sidebar
```

### Projects Module (Phase 2-3)
```
/projects
    ├── List view
    │   ├── Fetch all projects
    │   ├── Apply filters
    │   ├── Pagination
    │   └── Display cards
    ├── Create dialog
    │   ├── Form validation
    │   ├── Submit to API
    │   └── Refresh list
    └── Detail view /projects/[id]
        ├── Fetch project + tasks
        ├── Display hierarchy
        ├── Task management
        └── Status tracking
```

### Pipeline Module (Phase 4)
```
/pipeline
    ├── List pending projects
    ├── Filter view (pending/approved/rejected)
    ├── Detail modal
    │   ├── Show project details
    │   ├── Review scope & impact
    │   ├── Add approval notes
    │   └── Approve/Reject
    └── On approval
        ├── Move to projects
        ├── Change status to "active"
        └── Log activity
```

---

## Component Hierarchy

```
AppShell
├── Sidebar
│   ├── Brand (logo)
│   ├── Navigation
│   │   ├── Dashboard link
│   │   ├── Projects link
│   │   └── Pipeline link (CEO only)
│   └── User menu
│       ├── Profile
│       └── Sign out
│
└── Main content
    ├── /dashboard
    │   ├── Header
    │   ├── Stats cards (3)
    │   └── Quick actions
    │
    ├── /projects
    │   ├── Header (with New Project button)
    │   ├── Filters
    │   └── Project cards/table
    │
    └── /pipeline
        ├── Header (with New Submission button)
        ├── Pipeline cards
        └── Detail modals
```

---

## API Structure

```
/api
├── /auth
│   └── /[...nextauth]
│       ├── POST /signin
│       ├── POST /signout
│       ├── GET /session
│       └── POST /callback/credentials
│
├── /projects                 (Phase 2)
│   ├── GET (list)
│   ├── POST (create)
│   └── /[id]
│       ├── GET (detail)
│       ├── PATCH (update)
│       ├── DELETE
│       └── /tasks
│           ├── GET (list tasks for project)
│           └── POST (create task)
│
├── /tasks                    (Phase 3)
│   ├── GET (list)
│   ├── POST (create)
│   └── /[id]
│       ├── GET
│       ├── PATCH
│       └── DELETE
│
├── /subtasks                 (Phase 3)
│   └── Same structure as /tasks
│
└── /pipeline                 (Phase 4)
    ├── GET (list pending)
    ├── POST (submit new)
    └── /[id]
        ├── /approve → PUT
        └── /reject → PUT
```

---

## State Management

### Authentication State
```typescript
// NextAuth session (server + client)
session = {
  user: {
    id: UUID
    email: string
    name: string
    role: 'admin' | 'ceo' | 'manager' | 'employee'
    image?: string
  }
  expires: ISO8601
}
```

### Client State (React Hooks)
```typescript
// Example: Projects page
const [projects, setProjects] = useState([])
const [filters, setFilters] = useState({ status: '', priority: '' })
const [loading, setLoading] = useState(false)
const [currentPage, setCurrentPage] = useState(1)
```

### Form State (React Hook Form)
```typescript
const form = useForm({
  defaultValues: { name: '', description: '', ... }
})

// Hooks handle: validation, errors, submission
```

---

## Error Handling Strategy

```
User Action
    ↓
Try/Catch block
    ├─→ Validation error
    │   └─→ Show inline errors
    │
    ├─→ Network error
    │   └─→ Toast notification + retry
    │
    ├─→ Authorization error (403)
    │   └─→ Redirect to dashboard
    │
    ├─→ Not found (404)
    │   └─→ Show empty state
    │
    └─→ Server error (500)
        └─→ Log to Sentry + user feedback
```

---

## Performance Optimization

### Current (v0.1.0)
- ✅ Server-side rendering (SSR)
- ✅ Static imports for components
- ✅ Optimized database queries
- ✅ Minimal CSS (Tailwind)

### Phase 5 (Planned)
- ⏳ Database indexing
- ⏳ Query result caching
- ⏳ Image optimization
- ⏳ Code splitting
- ⏳ Lazy loading components

---

## Deployment Architecture

```
Local Development
    ↓ git push
GitHub Repository
    ↓ Webhook
Vercel Build Pipeline
    ├── npm install
    ├── npm run build
    ├── Type checking
    └── Deploy to CDN
        ↓
    Production URL
    ├── Vercel Edge Functions (API routes)
    ├── Static assets (CDN)
    └── Environment variables (secrets)
        ↓
Database
    └── Neon PostgreSQL (connected via DATABASE_URL)
```

---

## Security Architecture

```
Browser
    │ HTTPS only
    ▼
Vercel (TLS encryption)
    │
    ├─ Middleware (auth check)
    ├─ CSRF protection (Next.js)
    └─ Rate limiting (future)
        │
        ▼
    API Routes
        │
        ├─ Input validation (Zod)
        ├─ SQL injection prevention (Drizzle ORM)
        ├─ Authorization check (roles)
        └─ Audit logging (activity_logs)
            │
            ▼
    Database (Neon)
        │
        ├─ SSL connection
        ├─ Password hashing (bcrypt)
        └─ Row-level security (future)
```

---

## Scalability Considerations

### Current Limitations
- Single Neon instance
- No caching layer
- No CDN for assets

### Future Improvements
- Redis caching for queries
- Database read replicas
- Cloudflare CDN
- Vertical/horizontal scaling on Vercel

---

## Monitoring & Logging

### Application Monitoring (Phase 6)
```
Vercel Logs
    ├── API request logs
    ├── Error stack traces
    └── Performance metrics

Database Monitoring
    ├── Query performance
    ├── Connection pool stats
    └── Storage usage

Error Tracking (Sentry - Phase 6)
    ├── Stack traces
    ├── User context
    ├── Breadcrumbs
    └── Release tracking
```

---

## Summary

This architecture provides:
- ✅ Scalable, modular structure
- ✅ Type-safe data flow
- ✅ Secure authentication
- ✅ Clear separation of concerns
- ✅ Extensible for future phases

See [IMPLEMENTATION.md](./IMPLEMENTATION.md) for development roadmap.

---

**Created:** February 27, 2025
**Version:** 1.0
