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

export const COACHES_ACADEMY_PRESENTER_EMAILS = [
  "marvin@rep1recruiting.com",
  "terry@rep1recruiting.com",
  "darius@rep1recruiting.com",
  "usama@rep1recruiting.com",
];

export function isCoachesAcademyPresenter(user: SessionUser | null | undefined): boolean {
  if (!user) return false;
  if (
    user.role === UserRole.SUPER_ADMIN ||
    user.role === UserRole.ADMIN ||
    user.role === UserRole.COACHES_ACADEMY_PRESENTER
  ) {
    return true;
  }
  if (user.email && COACHES_ACADEMY_PRESENTER_EMAILS.includes(user.email.toLowerCase())) {
    return true;
  }
  return false;
}

export function isCoachesAcademyMember(user: SessionUser | null | undefined): boolean {
  if (!user) return false;
  if (isCoachesAcademyPresenter(user)) return true;
  return user.role === UserRole.COACHES_ACADEMY_MEMBER;
}
