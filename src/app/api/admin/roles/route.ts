import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";
import { db } from "@/lib/db";
import { z } from "zod";

const DEFAULT_SYSTEM_ROLES = [
  {
    name: "ATHLETE",
    displayName: "Student Athlete",
    description: "Standard athlete account with recruiting profile, academy access, and combine metrics.",
    permissions: ["view_own_profile", "edit_own_profile", "take_courses", "ai_interviews"],
    isSystem: true,
  },
  {
    name: "RECRUITER",
    displayName: "College Recruiter / Scout",
    description: "Verified collegiate scout or coach with access to search roster, filter metrics, and view contact info.",
    permissions: ["search_athletes", "view_contact_info", "view_scouting_reports", "filter_metrics"],
    isSystem: true,
  },
  {
    name: "ADMIN",
    displayName: "System Administrator",
    description: "Platform admin with evaluation editor powers, course management, and user detail editor.",
    permissions: ["manage_users", "edit_ratings", "manage_courses", "view_analytics"],
    isSystem: true,
  },
  {
    name: "SUPER_ADMIN",
    displayName: "Super Executive Admin",
    description: "Full system controller with role creation, database management, and complete authority.",
    permissions: ["all_permissions", "manage_roles", "manage_system"],
    isSystem: true,
  },
];

const createRoleSchema = z.object({
  name: z.string().min(2).max(50),
  displayName: z.string().min(2).max(100),
  description: z.string().optional().nullable(),
  permissions: z.array(z.string()).optional(),
});

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  try {
    let roles = await db.customRole.findMany({
      include: {
        _count: {
          select: { users: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Seed default system roles if empty
    if (roles.length === 0) {
      for (const sysRole of DEFAULT_SYSTEM_ROLES) {
        await db.customRole.upsert({
          where: { name: sysRole.name },
          update: {},
          create: {
            name: sysRole.name,
            displayName: sysRole.displayName,
            description: sysRole.description,
            permissions: sysRole.permissions,
            isSystem: sysRole.isSystem,
          },
        });
      }

      roles = await db.customRole.findMany({
        include: {
          _count: {
            select: { users: true },
          },
        },
        orderBy: { createdAt: "asc" },
      });
    }

    return NextResponse.json({ roles });
  } catch (error) {
    console.error("Fetch roles error:", error);
    return NextResponse.json({ error: "Failed to fetch database roles" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getAuthenticatedUser();
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const result = createRoleSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid role input", details: result.error.format() }, { status: 400 });
    }

    const { name, displayName, description, permissions } = result.data;
    const formattedName = name.toUpperCase().replace(/[^A-Z0-9_]/g, "_");

    const newRole = await db.customRole.upsert({
      where: { name: formattedName },
      create: {
        name: formattedName,
        displayName,
        description: description || null,
        permissions: permissions || ["view_roster"],
        isSystem: false,
      },
      update: {
        displayName,
        description: description || null,
        permissions: permissions || undefined,
      },
    });

    return NextResponse.json({ success: true, role: newRole });
  } catch (error) {
    console.error("Create role error:", error);
    return NextResponse.json({ error: "Failed to create database role" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const user = await getAuthenticatedUser();
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const roleId = searchParams.get("id");

    if (!roleId) {
      return NextResponse.json({ error: "Role ID required" }, { status: 400 });
    }

    const role = await db.customRole.findUnique({ where: { id: roleId } });
    if (!role) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    if (role.isSystem) {
      return NextResponse.json({ error: "System roles cannot be deleted" }, { status: 400 });
    }

    await db.customRole.delete({ where: { id: roleId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete role error:", error);
    return NextResponse.json({ error: "Failed to delete role" }, { status: 500 });
  }
}
