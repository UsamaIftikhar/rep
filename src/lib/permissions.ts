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

// New helper to check for a sales person role
export function isSalesperson(user: SessionUser | null | undefined): boolean {
  if (!user) return false;
  return user.role === UserRole.SALESPERSON;
}

// Permission to access sales‑person‑specific sections
export function canAccessSalesSection(user: SessionUser | null | undefined): boolean {
  // Salespeople may access their own dashboard; admins can also view it
  return isSalesperson(user) || isAdmin(user);
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

/**
 * Access control for the Recruit Database:
 * Only verified College Recruiters, Scouts, and Admins can access.
 * Recruits (Athletes) and Coaches are strictly barred.
 */
export function canAccessRecruitDatabase(user: SessionUser | null | undefined): boolean {
  if (!user) return false;
  return user.role === UserRole.RECRUITER || isAdmin(user);
}

/**
 * Role-level check for Coaches Academy:
 * Recruits and Recruiters are strictly barred.
 * Only Admins, Presenters, and Coaches Academy members are permitted.
 */
export function canAccessCoachesAcademySection(user: SessionUser | null | undefined): boolean {
  if (!user) return false;
  if (user.role === UserRole.ATHLETE || user.role === UserRole.RECRUITER) {
    return false;
  }
  return (
    isAdmin(user) ||
    isCoachesAcademyPresenter(user) ||
    user.role === UserRole.COACHES_ACADEMY_MEMBER
  );
}
