# Rohan Builders Project Tracker

A lightweight, role-based project management system for Rohan Builders IT initiatives. Built with modern web technologies and designed for efficiency.

## Features

### 🎯 Three Core Modules

#### 1. **Dashboard**
- Real-time KPI metrics
- Active projects count
- In-progress tasks overview
- Pending approvals indicator
- Role-based quick actions

#### 2. **Projects**
- Full project hierarchy: **Project → Task → SubTask**
- Rich project metadata:
  - Status tracking (Draft → Active → Completed)
  - Priority levels (Critical, High, Medium, Low)
  - Assignee management
  - Deadline tracking
  - Progress visualization

#### 3. **Pipeline** (CEO Approval)
- Centralized approval workflow
- Project details submission:
  - Scope definition
  - Impact assessment
  - Estimated timeline
- Approve/Reject actions
- Auto-migration to Projects on approval
- Audit trail of approvals

### 🔐 Role-Based Access Control

| Role     | Permissions |
|----------|------------|
| **Admin**    | Full access to all modules, user management |
| **CEO**      | Dashboard, Projects view, Pipeline approval |
| **Manager**  | Dashboard, Projects management, Create tasks |
| **Employee** | Dashboard, View assigned tasks only |

### 🎨 Design System

- **Clean, minimal UI** inspired by modern dashboards
- **Neutral color palette** with functional status colors
- **OKLch color space** for perceptually uniform styling
- **Responsive layout** with 256px sidebar
- **Built with:** Tailwind CSS v4 + shadcn/ui

### 📱 Technical Stack

- **Frontend:** Next.js 16 + TypeScript + React 19
- **Styling:** Tailwind CSS v4 + OKLch colors
- **Database:** PostgreSQL (Neon)
- **ORM:** Drizzle ORM
- **Authentication:** NextAuth.js v5
- **UI Components:** shadcn/ui (new-york-v4)
- **Hosting:** Vercel
- **Icons:** Lucide React

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Neon PostgreSQL account (free)

### Installation

1. **Clone and install:**
   ```bash
   npm install
   ```

2. **Setup environment:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Neon database URL and secrets
   ```

3. **Initialize database:**
   ```bash
   npm run db:push
   ```

4. **Seed demo data:**
   ```bash
   npx ts-node db/seed.ts
   ```

5. **Run development server:**
   ```bash
   npm run dev
   ```

6. **Login:**
   - URL: http://localhost:3000/login
   - Email: `admin@rohanbuilders.com`
   - Password: `admin`

---

## Project Structure

```
app/                          # Next.js App Router
├── api/auth/[...nextauth]   # Authentication endpoints
├── dashboard/               # Dashboard module
├── projects/                # Projects management
├── pipeline/                # CEO approval pipeline
└── login/                   # Login page

components/
├── ui/                      # shadcn/ui components
│   ├── button, card, input
│   ├── label, badge, dialog
│   └── dropdown-menu
└── layout/
    ├── app-shell.tsx        # Main layout wrapper
    └── sidebar.tsx          # Navigation sidebar

db/
├── schema.ts                # Drizzle ORM models
├── migrations/              # Auto-generated
└── seed.ts                  # Sample data

lib/
├── db.ts                    # Database client
├── auth.ts                  # NextAuth configuration
└── utils.ts                 # Helper functions
```

---

## Database Schema

### Core Tables
- **users** - User profiles and roles
- **projects** - IT initiatives with metadata
- **tasks** - Project tasks with hierarchy
- **subtasks** - Task breakdowns
- **pipeline_items** - Approval queue
- **activity_logs** - Audit trail

See [SETUP.md](./SETUP.md#database-schema) for detailed schema.

---

## API Reference

### Authentication Endpoints
- `POST /api/auth/callback/credentials` - Login
- `POST /api/auth/signin` - Initiate sign-in
- `POST /api/auth/signout` - Logout
- `GET /api/auth/session` - Get current session

### Future Endpoints (To be implemented)
- `GET/POST /api/projects` - Projects CRUD
- `GET/POST /api/tasks` - Tasks CRUD
- `GET/POST /api/subtasks` - SubTasks CRUD
- `GET/POST /api/pipeline` - Pipeline management
- `PUT /api/pipeline/:id/approve` - Approve project
- `PUT /api/pipeline/:id/reject` - Reject project

---

## Development

### Database Commands
```bash
# Push schema to database
npm run db:push

# View database in Studio
npm run db:studio
```

### Build & Deploy
```bash
npm run build      # Production build
npm run start      # Run production server
```

### Type Checking
```bash
npm run type-check # Run TypeScript compiler
```

---

## Deployment

### Deploy to Vercel

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Init: Project Tracker"
   git push origin main
   ```

2. **Connect to Vercel:**
   - Import your GitHub repo at vercel.com
   - Add environment variables:
     - `DATABASE_URL` - Your Neon connection string
     - `NEXTAUTH_SECRET` - Generated secret key
     - `NEXTAUTH_URL` - Your Vercel domain URL

3. **Deploy:**
   - Click "Deploy" in Vercel dashboard
   - Automatic builds on every push

---

## User Workflows

### Creating a Project (Manager/Admin)
1. Navigate to Projects
2. Click "New Project"
3. Fill project details
4. Submit for pipeline approval
5. Status changes to "pending_approval"

### CEO Approving Projects
1. Navigate to Pipeline
2. Review pending projects
3. Check scope, impact, timeline
4. Click "Approve" or "Reject"
5. Approved projects move to Projects module

### Creating Tasks
1. Open a project
2. Click "Add Task"
3. Fill task details and assign to employee
4. Set deadline and priority
5. Create subtasks as needed

### Employee Updating Tasks
1. Navigate to Dashboard
2. View assigned tasks
3. Update status (To Do → In Progress → Review → Completed)
4. Mark subtasks complete
5. Add comments/notes

---

## Customization

### Add Custom Roles
Edit `db/schema.ts`:
```typescript
export const roleEnum = pgEnum("role", [
  "admin",
  "ceo",
  "manager",
  "employee",
  "your_custom_role"  // Add here
]);
```

### Modify Color Scheme
Edit `app/globals.css` - Change OKLch color values:
```css
:root {
  --primary: oklch(0.205 0 0);  /* Modify values */
  --accent: oklch(0.97 0 0);
  /* ... */
}
```

### Add New Fields
1. Edit schema in `db/schema.ts`
2. Run `npm run db:push` to migrate
3. Update UI components accordingly

---

## Security Considerations

- ✅ Passwords hashed with bcrypt
- ✅ Role-based route protection
- ✅ NextAuth session management
- ✅ CSRF protection via Next.js
- ✅ SQL injection prevention via Drizzle ORM
- ⚠️ **TODO:** Rate limiting
- ⚠️ **TODO:** Input validation
- ⚠️ **TODO:** Audit logging

---

## Performance

- **Optimized database queries** with Drizzle
- **Server-side rendering** for SEO & speed
- **Code splitting** with Next.js
- **Image optimization** with next/image
- **Minimal CSS** with Tailwind

---

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

---

## Troubleshooting

**Issue:** Database connection error
- Verify `DATABASE_URL` in `.env.local`
- Check Neon console for IP whitelist

**Issue:** Login fails
- Ensure user exists in database
- Check password hash with bcrypt

**Issue:** Build fails
- Delete `node_modules` and `.next`
- Run `npm install` again
- Clear npm cache: `npm cache clean --force`

---

## Contributing

This is an internal project for Rohan Builders. For changes:
1. Create a feature branch
2. Make changes
3. Test thoroughly
4. Create a pull request for review

---

## License

Internal use only. © 2025 Rohan Builders.

---

## Support

For issues or questions, contact the development team.

---

**Last Updated:** February 27, 2025
**Current Version:** 0.1.0 (Beta)
**Status:** Core modules setup complete, CRUD operations pending
