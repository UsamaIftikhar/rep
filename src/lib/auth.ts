import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { UserRole } from "@prisma/client";
import { db } from "./db";
import { SessionUser } from "./permissions";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "rep1_secret_jwt_key_super_secure_production_change_me_32char"
);

const SESSION_COOKIE = "rep1_session";
const SESSION_DURATION = 60 * 60 * 24 * 7; // 7 days in seconds

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    sub: user.id,
    email: user.email,
    name: user.name,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (!payload.sub || typeof payload.sub !== "string") return null;

    return {
      id: payload.sub,
      email: (payload.email as string) || "",
      name: (payload.name as string) || null,
      firstName: (payload.firstName as string) || null,
      lastName: (payload.lastName as string) || null,
      role: (payload.role as UserRole) || UserRole.ATHLETE,
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (!token) return null;
    return verifySessionToken(token);
  } catch {
    return null;
  }
}

export async function getAuthenticatedUser(): Promise<(SessionUser & { id: string }) | null> {
  const sessionUser = await getSession();
  if (!sessionUser) return null;

  const dbUser = await db.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      id: true,
      email: true,
      name: true,
      firstName: true,
      lastName: true,
      role: true,
      status: true,
      image: true,
    },
  });

  if (!dbUser || dbUser.status !== "ACTIVE") {
    return null;
  }

  return {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name ?? `${dbUser.firstName ?? ""} ${dbUser.lastName ?? ""}`.trim(),
    firstName: dbUser.firstName,
    lastName: dbUser.lastName,
    role: dbUser.role,
    image: dbUser.image,
  };
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION,
    path: "/",
  });
}

export async function removeSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}
