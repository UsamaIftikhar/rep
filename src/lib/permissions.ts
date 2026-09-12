import { UserRole } from "@prisma/client";

export interface SessionUser {
  id: string;
  email: string;
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  role: UserRole;
  image?: string | null;
}

export function isAdmin(user: SessionUser | null | undefined): boolean {
  if (!user) return false;
  return user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN;
}

export function isAthlete(user: SessionUser | null | undefined): boolean {
  if (!user) return false;
  return user.role === UserRole.ATHLETE;
}

export function isRecruiter(user: SessionUser | null | undefined): boolean {
  if (!user) return false;
  return user.role === UserRole.RECRUITER || isAdmin(user);
}

export function canManageUsers(user: SessionUser | null | undefined): boolean {
  return isAdmin(user);
}

export function canManageCurriculum(user: SessionUser | null | undefined): boolean {
  return isAdmin(user);
}

export function canAccessAdminPanel(user: SessionUser | null | undefined): boolean {
  return isAdmin(user);
}
