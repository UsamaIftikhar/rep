import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding REP 1 Student Academy courses...");

  const academyCourses = [
    {
      title: "Financial Literacy",
      slug: "financial-literacy",
      description: "Master budgeting, tax fundamentals, banking, and wealth management tailored specifically for student athletes.",
      category: "Financial Literacy",
      order: 1,
      isRequiredForAcademy: true,
      includedWithMembership: true,
      standalonePurchasable: true,
      priceInCents: 4900,
      lessons: [
        {
          title: "Introduction to Athlete Banking & Budgeting",
          slug: "intro-banking-budgeting",
          order: 1,
          estimatedMinutes: 15,
          content: `# Introduction to Athlete Banking & Budgeting

Welcome to **Financial Literacy Class 1**. As a student athlete, managing your cash flow is just as critical as managing your training schedule.

## Key Objectives
1. Setting up a dedicated high-yield savings account.
2. The 50/30/20 budget rule applied to stipends and NIL income.
3. Tracking fixed expenses vs athletic gear & travel costs.

> "Financial discipline on day one guarantees freedom when your playing career transitions."

### Recommended Action Items
- Download a budget tracking app.
- Separate personal spending money from tax reserves if earning NIL compensation.
`,
        },
        {
          title: "Understanding NIL Taxes & W-9 Requirements",
          slug: "nil-taxes-w9",
          order: 2,
          estimatedMinutes: 20,
          content: `# Understanding NIL Taxes & W-9 Requirements

NIL deals are classified as self-employment income by the IRS. In this lesson, you will learn how to estimate quarterly tax payments.

## What You Need to Know
- **Self-Employment Tax**: Federal and state taxes apply to gross NIL payments.
- **Form 1099-NEC**: Issued by brands if paid over $600 annually.
- **Tax Reserve Rule**: Save 25–30% of every deal in a separate tax account immediately.
`,
        },
      ],
    },
    {
      title: "Athletes for Impact",
      slug: "athletes-for-impact",
      description: "Learn how to leverage your athletic platform for community leadership, philanthropy, and lasting social impact.",
      category: "Leadership",
      order: 2,
      isRequiredForAcademy: true,
      includedWithMembership: true,
      standalonePurchasable: true,
      priceInCents: 4900,
      lessons: [
        {
          title: "Building Your Community Foundation",
          slug: "building-community-foundation",
          order: 1,
          estimatedMinutes: 15,
          content: `# Building Your Community Foundation

Leadership extends beyond the field. Discover how elite athletes launch youth clinics, charity partnerships, and community initiatives.

## Core Pillars
- Identifying causes aligned with your personal story.
- Partnering with verified 501(c)(3) non-profits.
- Measuring real community outcomes.
`,
        },
      ],
    },
    {
      title: "Marketing Playbook",
      slug: "marketing-playbook",
      description: "Strategic brand partnerships, contract negotiations, sponsorship pitching, and agency alignment for athletes.",
      category: "Marketing Playbook",
      order: 3,
      isRequiredForAcademy: true,
      includedWithMembership: true,
      standalonePurchasable: true,
      priceInCents: 4900,
      lessons: [
        {
          title: "Pitching Brands & Deal Structuring",
          slug: "pitching-brands-deal-structuring",
          order: 1,
          estimatedMinutes: 20,
          content: `# Pitching Brands & Deal Structuring

Learn how to craft professional pitch decks and negotiate deliverables with local and national sponsors.

## Key Concepts
- Defining your engagement rate vs follower count.
- Exclusivity clauses and category restrictions.
- Delivering high-ROI content for sponsor brands.
`,
        },
      ],
    },
    {
      title: "Personal Branding",
      slug: "personal-branding",
      description: "Develop your digital identity, storytelling, media presence, and professional athletic posture.",
      category: "Personal Branding",
      order: 4,
      isRequiredForAcademy: true,
      includedWithMembership: true,
      standalonePurchasable: true,
      priceInCents: 4900,
      lessons: [
        {
          title: "Crafting Your Authentic Athlete Brand Story",
          slug: "authentic-brand-story",
          order: 1,
          estimatedMinutes: 15,
          content: `# Crafting Your Authentic Athlete Brand Story

Your brand is what recruiters and coaches say about you when you leave the room.

## Brand Audit Checklist
1. High-resolution athletic profile headshot.
2. Clean, professional social media bios across Instagram & X.
3. Consistently highlighted athletic reel links.
`,
        },
      ],
    },
    {
      title: "Conflict Resolution",
      slug: "conflict-resolution",
      description: "Navigating team dynamics, tough coaching feedback, locker room tension, and high-pressure adversity.",
      category: "Community Engagement",
      order: 5,
      isRequiredForAcademy: true,
      includedWithMembership: true,
      standalonePurchasable: true,
      priceInCents: 4900,
      lessons: [
        {
          title: "De-escalation & Productive Coach Dialogue",
          slug: "deescalation-coach-dialogue",
          order: 1,
          estimatedMinutes: 15,
          content: `# De-escalation & Productive Coach Dialogue

How to handle tough coaching, playing time discussions, and constructive criticism with executive maturity.

## Practical Steps
- Focus on performance facts rather than emotion.
- Request explicit measurable milestones for depth chart progression.
- Practice active listening in film breakdown sessions.
`,
        },
      ],
    },
    {
      title: "Behavioral Analysis",
      slug: "behavioral-analysis",
      description: "Understanding recruiter evaluation frameworks, body language, emotional intelligence, and interview performance.",
      category: "Behavioral Analytics",
      order: 6,
      isRequiredForAcademy: true,
      includedWithMembership: true,
      standalonePurchasable: true,
      priceInCents: 4900,
      lessons: [
        {
          title: "Recruiter Evaluation Frameworks & Executive Poise",
          slug: "recruiter-evaluation-frameworks",
          order: 1,
          estimatedMinutes: 25,
          content: `# Recruiter Evaluation Frameworks & Executive Poise

Collegiate coaches evaluate how athletes respond to adversity, peer accountability, and media scrutiny.

## Evaluation Dimensions
1. Coachability under stress.
2. Communication clarity during interviews.
3. Teammate accountability and leadership presence.
`,
        },
      ],
    },
  ];

  for (const cData of academyCourses) {
    const { lessons, ...courseFields } = cData;

    const course = await prisma.course.upsert({
      where: { slug: courseFields.slug },
      update: {
        title: courseFields.title,
        description: courseFields.description,
        category: courseFields.category,
        order: courseFields.order,
        isRequiredForAcademy: courseFields.isRequiredForAcademy,
        includedWithMembership: courseFields.includedWithMembership,
        standalonePurchasable: courseFields.standalonePurchasable,
        priceInCents: courseFields.priceInCents,
      },
      create: courseFields,
    });

    for (const lData of lessons) {
      await prisma.lesson.upsert({
        where: {
          courseId_slug: {
            courseId: course.id,
            slug: lData.slug,
          },
        },
        update: {
          title: lData.title,
          content: lData.content,
          order: lData.order,
          estimatedMinutes: lData.estimatedMinutes,
        },
        create: {
          courseId: course.id,
          title: lData.title,
          slug: lData.slug,
          content: lData.content,
          order: lData.order,
          estimatedMinutes: lData.estimatedMinutes,
        },
      });
    }
  }

  // Seed default Academy Badge definition
  await prisma.badge.upsert({
    where: { key: "ACADEMY_GRADUATE" },
    update: {
      title: "REP 1 Academy Graduate",
      description: "Awarded for completing all 6 required Student Academy classes.",
      icon: "Trophy",
    },
    create: {
      key: "ACADEMY_GRADUATE",
      title: "REP 1 Academy Graduate",
      description: "Awarded for completing all 6 required Student Academy classes.",
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

  console.log("Academy seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
