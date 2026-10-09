// One‑off script to insert salespeople accounts
// Run with: npx ts-node scripts/create_salespeople.ts
import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);
  const salespeople = [
    { email: "kevenjackson1027@gmail.com", firstName: "Keven", lastName: "Jackson", name: "Keven Jackson" },
    { email: "justinriley7@gmail.com", firstName: "Justin", lastName: "Riley", name: "Justin Riley" },
    { email: "kmosley@prospectsportseg.com", firstName: "Kieth", lastName: "Mosley", name: "Kieth Mosley" },
    { email: "magruderpettey23@gmail.com", firstName: "Daniel", lastName: "Pettey", name: "Daniel Pettey" },
    { email: "doc20.tm@gmail.com", firstName: "Terrance", lastName: "Doc Martin", name: "Terrance Doc Martin" }
  ];

  for (const sp of salespeople) {
    const existing = await prisma.user.findFirst({
      where: { email: { equals: sp.email, mode: "insensitive" } },
    });

    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          email: sp.email.toLowerCase(),
          role: UserRole.SALESPERSON,
          passwordHash,
          firstName: sp.firstName,
          lastName: sp.lastName,
          name: sp.name,
          status: "ACTIVE",
        },
      });
      console.log(`Updated ${sp.email}`);
    } else {
      await prisma.user.create({
        data: {
          email: sp.email.toLowerCase(),
          passwordHash,
          firstName: sp.firstName,
          lastName: sp.lastName,
          name: sp.name,
          role: UserRole.SALESPERSON,
          status: "ACTIVE",
        },
      });
      console.log(`Created ${sp.email}`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
