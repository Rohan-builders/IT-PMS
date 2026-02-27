# Sanskriti Dashboard — Front-End Design System

A minimal, neutral design system optimized for data dashboards and project management interfaces. Built with Next.js, Tailwind CSS v4, shadcn/ui (new-york-v4), and OKLch color space.

---

## 🎨 Color Palette

### System Colors (OKLch)
All colors use OKLch color space for perceptually uniform styling. No vibrant accents—strictly neutral grays with functional reds for destructive actions.

**Light Mode (Root)**
```
--background: oklch(1 0 0)           /* White */
--foreground: oklch(0.145 0 0)       /* Near black */
--card: oklch(1 0 0)                 /* White */
--card-foreground: oklch(0.145 0 0)  /* Near black */
--primary: oklch(0.205 0 0)          /* Dark gray #333 */
--primary-foreground: oklch(0.985 0 0) /* Off-white */
--secondary: oklch(0.97 0 0)         /* Very light gray */
--muted: oklch(0.97 0 0)             /* Very light gray */
--muted-foreground: oklch(0.556 0 0) /* Medium gray */
--accent: oklch(0.97 0 0)            /* Very light gray */
--border: oklch(0.922 0 0)           /* Light gray */
--input: oklch(0.922 0 0)            /* Light gray */
--destructive: oklch(0.577 0.245 27.325) /* Red */
```

**Dark Mode (.dark class)**
```
--background: oklch(0.145 0 0)       /* Near black */
--foreground: oklch(0.985 0 0)       /* Off-white */
--card: oklch(0.205 0 0)             /* Dark gray */
--primary: oklch(0.922 0 0)          /* Light gray */
--muted: oklch(0.269 0 0)            /* Charcoal */
--muted-foreground: oklch(0.708 0 0) /* Medium gray */
--destructive: oklch(0.704 0.191 22.216) /* Red */
```

**Usage Pattern**
- Use `text-muted-foreground` for secondary text, labels, hints
- Use `bg-accent/50` for subtle hover states on cards
- Use `border` for all borders
- Use `bg-muted/40` or `bg-muted/50` for light backgrounds
- Destructive red reserved for delete/error states only

---

## 📐 Typography

```
--font-sans: var(--font-inter), system-ui, sans-serif
--font-mono: ui-monospace, monospace

Text Styles:
- Headlines (h1/h2): 2xl bold tracking-tight
- Subheadings (h3): font-semibold
- Body text: default (no class needed)
- Labels/Secondary: text-xs or text-sm, text-muted-foreground
- Stats values: text-2xl font-bold
- Captions: text-xs text-muted-foreground
```

**Pattern Examples**
```tsx
// Page header
<div className="space-y-1">
  <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
  <p className="text-sm text-muted-foreground">Welcome back</p>
</div>

// Label
<span className="text-xs font-medium text-muted-foreground">Status</span>

// Value
<p className="text-2xl font-bold">42</p>
```

---

## 🎯 Spacing & Radius

```
--radius: 0.625rem (10px)
--radius-sm: calc(var(--radius) - 4px)   /* 6px */
--radius-md: calc(var(--radius) - 2px)   /* 8px */
--radius-lg: var(--radius)               /* 10px */
--radius-xl: calc(var(--radius) + 4px)   /* 14px */

Spacing Scale (Tailwind defaults):
- Gap/padding: 0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12, 16
- Use consistent gaps in flexbox layouts
- Card padding: p-5 (20px) standard
- Component padding: p-2, p-3 (internal elements)
```

---

## 🏗️ Layout Structure

### App Shell (Root Layout)
```tsx
<div className="flex h-screen overflow-hidden">
  {/* Sidebar: 256px fixed width */}
  <Sidebar />

  {/* Main content: fills remaining space */}
  <main className="flex-1 overflow-y-auto">
    {children}
  </main>
</div>
```

### Sidebar (256px / w-64)
```tsx
<aside className="flex h-screen w-64 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground">
  {/* Brand: h-14 (56px) */}
  <div className="flex h-14 items-center border-b px-4 gap-2.5">
    {/* Icon + text */}
  </div>

  {/* Section label */}
  <div className="px-3 pt-4 pb-1">
    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
      Navigation
    </p>
  </div>

  {/* Nav items */}
  <nav className="flex-1 space-y-0.5 px-2 py-1">
    <Link className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors">
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </Link>
  </nav>

  {/* Footer */}
  <div className="border-t px-3 py-3">
    <p className="text-xs text-muted-foreground">Footer content</p>
  </div>
</aside>
```

### Page Content
```tsx
{/* Page header with optional actions */}
<div className="space-y-6">
  <div className="flex items-start justify-between">
    <div className="space-y-1">
      <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
      <p className="text-sm text-muted-foreground">View and manage all projects</p>
    </div>
    {/* Actions (right aligned) */}
  </div>

  {/* Content grid or section */}
</div>
```

---

## 🎨 Component Patterns

### Card (Default)
**Used for:** Project cards, stat cards, content containers
```tsx
<div className="rounded-lg border p-5 transition-colors hover:bg-accent/50">
  {children}
</div>
```

**Variations**
- **With group hover effect:** Add `group` to parent, use `group-hover:opacity-100` on children
- **With shadow:** ⚠️ Not used in this design system
- **Interactive (link):** Use `cursor-pointer` or wrap in `<Link>`

### Stats Card
**Used for:** KPI displays, metrics, dashboards
```tsx
<div className="rounded-lg border p-5 flex items-center gap-3 transition-colors hover:bg-accent/50">
  {/* Icon background (accent) */}
  <div className="rounded-md p-2 bg-blue-50 shrink-0">
    <Icon className="h-5 w-5 text-blue-600" />
  </div>

  {/* Value + label */}
  <div>
    <p className="text-2xl font-bold">42</p>
    <p className="text-xs text-muted-foreground">Label</p>
  </div>
</div>
```

**Pattern**
- Icon background uses colored utility (e.g., `bg-blue-50`, `bg-purple-50`)
- Icon uses matching color (e.g., `text-blue-600`)
- Layout: icon left, value + label right
- Always use `shrink-0` on icon container

### Table
**Used for:** Milestone lists, data rows, detailed views
```tsx
<table className="w-full caption-bottom text-sm">
  <thead>
    <tr className="border-b">
      <th className="text-left font-medium">Column</th>
    </tr>
  </thead>
  <tbody className="[&_tr]:border-b">
    <tr className="hover:bg-muted/50">
      <td className="py-2">Data</td>
    </tr>
    <tr className="[&_tr:last-child]:border-0">
      <td className="py-2">Last row</td>
    </tr>
  </tbody>
</table>
```

### Progress Bar
**Used for:** Project progress, milestone completion
```tsx
<div>
  <div className="flex justify-between items-center mb-1.5">
    <span className="text-xs text-muted-foreground">Progress</span>
    <span className="text-xs font-medium">75%</span>
  </div>
  <Progress value={75} className="h-1.5" />
</div>
```

### Badge
**Used for:** Status labels, categories, tags
```tsx
<Badge variant="secondary" className="text-xs">
  Active
</Badge>
```

**Variants**
- `variant="secondary"` — Default, uses secondary colors (light gray bg)
- Custom status badges use `className` overrides for color

### Empty State
**Used for:** No data, empty lists, initial state
```tsx
<div className="flex flex-col items-center justify-center py-16 text-center">
  <Icon className="h-12 w-12 text-muted-foreground mb-4" />
  <h3 className="text-lg font-semibold">No projects yet</h3>
  <p className="text-sm text-muted-foreground mt-1">Create your first project to get started</p>
  <Button className="mt-4">Create Project</Button>
</div>
```

---

## 🎭 Interactive Elements

### Buttons
```tsx
{/* Primary action */}
<Button>Create</Button>

{/* Secondary/subtle */}
<Button variant="outline">Cancel</Button>

{/* Icon button (compact) */}
<Button variant="ghost" size="icon" className="h-7 w-7">
  <Icon className="h-4 w-4" />
</Button>

{/* With hover effect */}
<Button className="opacity-0 group-hover:opacity-100 transition-opacity">
  Edit
</Button>
```

### Links
**Styled as text links (not buttons)**
```tsx
<Link href="/projects/1" className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
  Details <ArrowRight className="h-3 w-3" />
</Link>
```

### Dropdowns & Menus
```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon">
      <MoreHorizontal className="h-4 w-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuItem>Edit</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem className="text-destructive focus:text-destructive">
      Delete
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Dialogs/Modals
```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Create Project</DialogTitle>
    </DialogHeader>
    {/* Form content */}
    <DialogFooter>
      <Button variant="outline">Cancel</Button>
      <Button>Create</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Form Inputs
```tsx
<div className="space-y-2">
  <Label htmlFor="name">Project Name</Label>
  <Input id="name" placeholder="Enter project name" />
</div>
```

---

## 🔄 Common Patterns

### Card with Header Actions
```tsx
<div className="group rounded-lg border p-5 transition-colors hover:bg-accent/50 flex flex-col gap-4">
  {/* Header */}
  <div className="flex items-start justify-between gap-2">
    <div className="flex-1 min-w-0">
      <h3 className="font-semibold truncate">Title</h3>
      <p className="text-sm text-muted-foreground mt-0.5">Description</p>
    </div>

    {/* Action menu (hidden by default) */}
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>Edit</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>

  {/* Content sections */}
  <div className="space-y-3">
    {/* Section 1 */}
    {/* Section 2 */}
  </div>

  {/* Footer with border separator */}
  <div className="flex items-center justify-between pt-1 border-t">
    <div>Left content</div>
    <div>Right content</div>
  </div>
</div>
```

### Status Badge with Color
```tsx
const statusConfig = {
  active: { label: 'Active', bg: 'bg-green-50', color: 'text-green-600' },
  delayed: { label: 'Delayed', bg: 'bg-red-50', color: 'text-red-600' },
  completed: { label: 'Done', bg: 'bg-blue-50', color: 'text-blue-600' },
}

<span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
  {cfg.label}
</span>
```

### Hover States
```
Default:     transition-colors
On cards:    hover:bg-accent/50
On text:     hover:text-foreground (from muted-foreground)
On buttons:  Built-in to shadcn button variants
On links:    transition-colors
```

### Responsive Grid
```tsx
{/* 2 columns on mobile, 4 on desktop */}
<div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
  {items.map(item => <Card key={item.id} />)}
</div>

{/* Sidebar responsive behavior */}
<aside className="
  w-64 shrink-0 border-r bg-sidebar
  fixed inset-y-0 left-0 z-50 md:relative md:z-auto
  -translate-x-full md:translate-x-0 transition-transform
">
```

---

## 🎨 Icon Usage

**Library:** lucide-react

**Sizes**
- Navigation icons: `h-4 w-4`
- Card icons: `h-3.5 w-3.5` (small), `h-5 w-5` (stats)
- Page header icons: `h-5 w-5` or `h-6 w-6`

**Colors**
- Inherit from context: `text-muted-foreground`, `text-foreground`
- Status colors: `text-green-600`, `text-red-600`, etc.

---

## 💾 Implementation Checklist

When creating a new dashboard:

- [ ] Set up Next.js 16 with TypeScript
- [ ] Install `tailwindcss@next`, `shadcn-ui@latest`
- [ ] Add theme from `new-york-v4` style
- [ ] Copy `globals.css` with OKLch color definitions
- [ ] Create `lib/utils.ts` with `cn()` utility
- [ ] Build `AppShell` component (flex layout with sidebar)
- [ ] Create `Sidebar` component with nav items
- [ ] Build page layouts using common patterns above
- [ ] Use sonner for toasts (not shadcn toast for v4)

---

## 📝 Notes

- **No shadows:** This design uses borders and color changes only
- **No vibrancy:** All accent colors are from the neutral gray scale
- **Status colors:** Reserve colored utilities (blue, green, red, purple) for stats and status badges only
- **Dark mode:** Use `.dark` class on root, all colors auto-switch
- **Spacing:** Use Tailwind's default scale, prefer `gap-` over `margin-`
- **Truncation:** Always use `truncate` or `line-clamp-N` on titles that may overflow
- **Shrink:** Use `shrink-0` on fixed-width elements (icons, avatars) in flex containers
