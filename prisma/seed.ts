import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

interface CourseDefinition {
  slug: string;
  file: string;
  title: string;
  description: string;
  category: string;
  order: number;
  isRequiredForAcademy: boolean;
  includedWithMembership: boolean;
  standalonePurchasable: boolean;
  priceInCents: number;
}

const COURSES_CONFIG: CourseDefinition[] = [
  {
    slug: "financial-literacy",
    file: "rep1FinancialLiteracy-curriculum.md",
    title: "Financial Literacy (12-Week Program)",
    description: "A 12-week comprehensive financial literacy course for Rep1 student-athletes built with Wealthi. Covers saving, budgeting, investing, credit, NIL taxes, and financial decision-making.",
    category: "Financial Literacy",
    order: 1,
    isRequiredForAcademy: true,
    includedWithMembership: true,
    standalonePurchasable: true,
    priceInCents: 999,
  },
  {
    slug: "australia-to-america",
    file: "rep1Australia-curriculum.md",
    title: "Australia to America Pathway",
    description: "This course provides information vital to athletes transitioning from Australia to America to make the transition as smooth as possible.",
    category: "Recruiting Pathway",
    order: 2,
    isRequiredForAcademy: true,
    includedWithMembership: true,
    standalonePurchasable: true,
    priceInCents: 999,
  },
  {
    slug: "athletes-for-impact",
    file: "rosaAthletesForImpact-curriculum.md",
    title: "Athletes for Impact",
    description: "Learn how to build your community foundation, launch non-profit initiatives, manage fundraising, and establish lasting social leadership.",
    category: "Leadership",
    order: 3,
    isRequiredForAcademy: true,
    includedWithMembership: true,
    standalonePurchasable: true,
    priceInCents: 999,
  },
  {
    slug: "behavioral-analysis",
    file: "rosaBehavAnalysis-curriculum.md",
    title: "Behavioral Analytics & Decision-Making",
    description: "Master recruiter evaluation frameworks, body language under pressure, emotional intelligence, triggers, and executive interview poise.",
    category: "Behavioral Analytics",
    order: 4,
    isRequiredForAcademy: true,
    includedWithMembership: true,
    standalonePurchasable: true,
    priceInCents: 999,
  },
  {
    slug: "conflict-resolution",
    file: "rosaConflictResolution-curriculum.md",
    title: "Conflict Resolution & Locker Room Leadership",
    description: "Navigating team dynamics, tough coaching feedback, depth chart conversations, and de-escalation under competitive pressure.",
    category: "Community Engagement",
    order: 5,
    isRequiredForAcademy: true,
    includedWithMembership: true,
    standalonePurchasable: true,
    priceInCents: 999,
  },
  {
    slug: "marketing-playbook",
    file: "rosaMarketingp-curriculum.md",
    title: "The Marketing Playbook",
    description: "Strategic athlete branding, sponsor pitching, deal pricing, deliverables, FTC compliance, and personal marketing systems.",
    category: "Marketing Playbook",
    order: 6,
    isRequiredForAcademy: true,
    includedWithMembership: true,
    standalonePurchasable: true,
    priceInCents: 999,
  },
  {
    slug: "personal-branding",
    file: "rosaPersonalBranding-curriculum.md",
    title: "Personal Branding & Identity",
    description: "Develop your digital identity, reputation, content pillars, audience mapping, usage rights, and long-term brand strategy.",
    category: "Personal Branding",
    order: 7,
    isRequiredForAcademy: false,
    includedWithMembership: true,
    standalonePurchasable: true,
    priceInCents: 999,
  },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  console.log("Seeding full REP 1 Student Academy courses from markdown files...");

  // Delete unwanted diagnostic report course if exists
  await prisma.course.deleteMany({ where: { slug: "diagnostic-report" } });

  const coursesDir = path.join(process.cwd(), "public", "courses");

  for (const config of COURSES_CONFIG) {
    const filePath = path.join(coursesDir, config.file);
    if (!fs.existsSync(filePath)) {
      console.warn(`File not found: ${filePath}`);
      continue;
    }

    const rawContent = fs.readFileSync(filePath, "utf-8");

    // Upsert Course
    const course = await prisma.course.upsert({
      where: { slug: config.slug },
      update: {
        title: config.title,
        description: config.description,
        category: config.category,
        order: config.order,
        isRequiredForAcademy: config.isRequiredForAcademy,
        includedWithMembership: config.includedWithMembership,
        standalonePurchasable: config.standalonePurchasable,
        priceInCents: config.priceInCents,
        isPublished: true,
      },
      create: {
        slug: config.slug,
        title: config.title,
        description: config.description,
        category: config.category,
        order: config.order,
        isRequiredForAcademy: config.isRequiredForAcademy,
        includedWithMembership: config.includedWithMembership,
        standalonePurchasable: config.standalonePurchasable,
        priceInCents: config.priceInCents,
        isPublished: true,
      },
    });

    // Parse sections split by ## headings
    const rawSections = rawContent.split(/^##\s+/m);
    const parsedLessons: { title: string; slug: string; content: string; order: number; estimatedMins: number }[] = [];

    let lessonIndex = 1;
    for (let i = 0; i < rawSections.length; i++) {
      const section = rawSections[i].trim();
      if (!section) continue;

      if (i === 0) {
        // Preamble / Overview section
        const firstH1 = section.split("\n").find((l) => l.startsWith("# ")) || `# ${config.title}`;
        parsedLessons.push({
          title: "Course Overview & Objectives",
          slug: "overview-and-objectives",
          content: section.startsWith("# ") ? section : `${firstH1}\n\n${section}`,
          order: lessonIndex++,
          estimatedMins: Math.max(5, Math.ceil(section.split(/\s+/).length / 150)),
        });
      } else {
        const lines = section.split("\n");
        const headingLine = lines[0].trim();
        const bodyContent = lines.slice(1).join("\n").trim();
        const lessonTitle = headingLine.replace(/[\*\#]/g, "").trim();
        const lessonSlug = slugify(lessonTitle) || `lesson-${lessonIndex}`;
        const wordCount = section.split(/\s+/).length;
        const estimatedMins = Math.max(5, Math.ceil(wordCount / 180));

        parsedLessons.push({
          title: lessonTitle,
          slug: lessonSlug,
          content: `## ${headingLine}\n\n${bodyContent}`,
          order: lessonIndex++,
          estimatedMins,
        });
      }
    }

    console.log(`Course [${course.title}]: Seeding ${parsedLessons.length} full-fidelity lessons...`);

    for (const pLesson of parsedLessons) {
      await prisma.lesson.upsert({
        where: {
          courseId_slug: {
            courseId: course.id,
            slug: pLesson.slug,
          },
        },
        update: {
          title: pLesson.title,
          content: pLesson.content,
          order: pLesson.order,
          estimatedMinutes: pLesson.estimatedMins,
          isPublished: true,
        },
        create: {
          courseId: course.id,
          title: pLesson.title,
          slug: pLesson.slug,
          content: pLesson.content,
          order: pLesson.order,
          estimatedMinutes: pLesson.estimatedMins,
          isPublished: true,
        },
      });
    }
  }

  // Seed default Academy Badge definition
  await prisma.badge.upsert({
    where: { key: "ACADEMY_GRADUATE" },
    update: {
      title: "REP 1 Academy Graduate",
      description: "Awarded for completing all required Student Academy classes.",
      icon: "Trophy",
    },
    create: {
      key: "ACADEMY_GRADUATE",
      title: "REP 1 Academy Graduate",
      description: "Awarded for completing all required Student Academy classes.",
      icon: "Trophy",
    },
  });

  // Seed default Admin User for development & testing
  const adminPasswordHash = await import("bcryptjs").then((b) => b.hash("password123", 10));
  await prisma.user.upsert({
    where: { email: "admin@rep1recruiting.com" },
    update: {
      role: "ADMIN",
      passwordHash: adminPasswordHash,
    },
    create: {
      email: "admin@rep1recruiting.com",
      passwordHash: adminPasswordHash,
      firstName: "Admin",
      lastName: "User",
      name: "Admin User",
      role: "ADMIN",
      athleteProfile: {
        create: {
          slug: "admin-user",
          schoolClub: "REP 1 HQ",
          sport: "football",
          position: "Director",
        },
      },
    },
  });

  console.log("Full course curriculum seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
