import { db } from "@/lib/db";
import { users, projects, tasks, subtasks } from "@/db/schema";
import bcrypt from "bcryptjs";

async function seed() {
  try {
    console.log("🌱 Starting database seed...");

    // Create sample users with hashed passwords
    const adminPassword = await bcrypt.hash("admin", 12);
    const ceoPassword = await bcrypt.hash("ceo123", 12);
    const managerPassword = await bcrypt.hash("manager123", 12);
    const employeePassword = await bcrypt.hash("employee123", 12);

    const userValues = [
      {
        email: "admin@rohanbuilders.com",
        name: "Admin User",
        password: adminPassword,
        role: "admin" as const,
      },
      {
        email: "ceo@rohanbuilders.com",
        name: "CEO",
        password: ceoPassword,
        role: "ceo" as const,
      },
      {
        email: "manager@rohanbuilders.com",
        name: "Project Manager",
        password: managerPassword,
        role: "manager" as const,
      },
      {
        email: "employee1@rohanbuilders.com",
        name: "Employee One",
        password: employeePassword,
        role: "employee" as const,
      },
      {
        email: "employee2@rohanbuilders.com",
        name: "Employee Two",
        password: employeePassword,
        role: "employee" as const,
      },
    ];

    // Clear existing data (optional - remove if you want to keep data)
    // await db.delete(users);

    // Insert users
    const insertedUsers = await db
      .insert(users)
      .values(userValues)
      .onConflictDoNothing()
      .returning();

    console.log(`✓ Created ${insertedUsers.length} users`);

    // Get user IDs for references
    const adminUser = insertedUsers.find((u) => u.role === "admin");
    const managerUser = insertedUsers.find((u) => u.role === "manager");
    const employeeUser = insertedUsers.find((u) => u.role === "employee");

    if (!adminUser || !managerUser || !employeeUser) {
      console.error("Failed to retrieve created users");
      return;
    }

    // Create sample projects
    const projectValues = [
      {
        name: "IT Infrastructure Upgrade",
        description: "Upgrade company servers and network infrastructure",
        status: "active" as const,
        ownerId: managerUser.id,
        priority: "high" as const,
        startDate: new Date("2025-02-01"),
        endDate: new Date("2025-03-31"),
      },
      {
        name: "Cloud Migration",
        description: "Migrate on-premise applications to AWS",
        status: "pending_approval" as const,
        ownerId: managerUser.id,
        priority: "critical" as const,
        startDate: new Date("2025-03-15"),
        endDate: new Date("2025-05-31"),
      },
      {
        name: "CRM Implementation",
        description: "Implement Salesforce CRM for sales team",
        status: "draft" as const,
        ownerId: managerUser.id,
        priority: "medium" as const,
        startDate: new Date("2025-04-01"),
        endDate: new Date("2025-06-30"),
      },
    ];

    const insertedProjects = await db
      .insert(projects)
      .values(projectValues)
      .onConflictDoNothing()
      .returning();

    console.log(`✓ Created ${insertedProjects.length} projects`);

    // Create sample tasks for first project
    if (insertedProjects.length > 0) {
      const project = insertedProjects[0];

      const taskValues = [
        {
          projectId: project.id,
          title: "Assess current infrastructure",
          description: "Document current server and network setup",
          status: "completed" as const,
          priority: "high" as const,
          assigneeId: employeeUser.id,
          deadline: new Date("2025-02-10"),
          progress: 100,
          order: 1,
        },
        {
          projectId: project.id,
          title: "Procure new hardware",
          description: "Purchase and receive new servers",
          status: "in_progress" as const,
          priority: "high" as const,
          assigneeId: employeeUser.id,
          deadline: new Date("2025-02-28"),
          progress: 60,
          order: 2,
        },
        {
          projectId: project.id,
          title: "Install and configure servers",
          description: "Set up and configure new hardware",
          status: "todo" as const,
          priority: "high" as const,
          assigneeId: null,
          deadline: new Date("2025-03-15"),
          progress: 0,
          order: 3,
        },
      ];

      const insertedTasks = await db
        .insert(tasks)
        .values(taskValues)
        .onConflictDoNothing()
        .returning();

      console.log(`✓ Created ${insertedTasks.length} tasks`);

      // Create sample subtasks for first task
      if (insertedTasks.length > 0) {
        const task = insertedTasks[0];

        const subtaskValues = [
          {
            taskId: task.id,
            title: "Document server specifications",
            status: "completed" as const,
            priority: "medium" as const,
            assigneeId: employeeUser.id,
            deadline: new Date("2025-02-08"),
            order: 1,
          },
          {
            taskId: task.id,
            title: "Create network diagram",
            status: "completed" as const,
            priority: "medium" as const,
            assigneeId: employeeUser.id,
            deadline: new Date("2025-02-09"),
            order: 2,
          },
        ];

        const insertedSubtasks = await db
          .insert(subtasks)
          .values(subtaskValues)
          .onConflictDoNothing()
          .returning();

        console.log(`✓ Created ${insertedSubtasks.length} subtasks`);
      }
    }

    console.log("\n✅ Database seed completed successfully!");
    console.log("\n📝 Demo Credentials:");
    console.log("  Admin:    admin@rohanbuilders.com / admin");
    console.log("  CEO:      ceo@rohanbuilders.com / ceo123");
    console.log("  Manager:  manager@rohanbuilders.com / manager123");
    console.log("  Employee: employee1@rohanbuilders.com / employee123");
  } catch (error) {
    console.error("❌ Seed error:", error);
    process.exit(1);
  }
}

seed();
