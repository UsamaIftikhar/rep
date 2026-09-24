import { db } from "./db";
import { SessionUser } from "./permissions";

/**
 * Gets or creates the tenant Organization for an authenticated user.
 * Ensures every user query is strictly scoped to an orgId.
 */
export async function getAuthenticatedOrgId(user: SessionUser & { id: string }): Promise<string> {
  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    select: { organizationId: true, email: true },
  });

  if (dbUser?.organizationId) {
    return dbUser.organizationId;
  }

  // Fallback: derive or assign organization based on email domain or default school org
  const domain = dbUser?.email.split("@")[1] || "default.school";
  const slug = domain.replace(/[^a-z0-9]+/g, "-");

  const org = await db.organization.upsert({
    where: { slug },
    update: {},
    create: {
      name: `${domain.split(".")[0].toUpperCase()} School Portal`,
      slug,
      domain,
    },
  });

  // Assign user to org
  await db.user.update({
    where: { id: user.id },
    data: { organizationId: org.id },
  });

  return org.id;
}
