import { db } from "./db";
import { profileUpdateSchema, ProfileUpdateInput } from "./validation";

export function calculateProfileCompleteness(user: { firstName?: string | null; email: string }, profile: {
  schoolClub?: string | null;
  graduationYear?: number | null;
  location?: string | null;
  sport?: string | null;
  position?: string | null;
  bio?: string | null;
  profilePhoto?: string | null;
}): number {
  let score = 0;

  if (user.firstName) score += 10;
  if (user.email) score += 10;
  if (profile.schoolClub) score += 15;
  if (profile.graduationYear) score += 10;
  if (profile.location) score += 15;
  if (profile.sport) score += 15;
  if (profile.position) score += 15;
  if (profile.bio || profile.profilePhoto) score += 10;

  return Math.min(100, score);
}

export async function getProfileByUserId(userId: string) {
  return db.athleteProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          name: true,
          image: true,
          role: true,
        },
      },
    },
  });
}

export async function getPublicProfileBySlug(slug: string) {
  const profile = await db.athleteProfile.findUnique({
    where: { slug },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          status: true,
          image: true,
          firstName: true,
          lastName: true,
          name: true,
          role: true,
          badges: {
            include: {
              badge: true,
            },
          },
          enrollments: {
            where: {
              status: "COMPLETED",
            },
            include: {
              course: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  category: true,
                  coverImage: true,
                },
              },
            },
            orderBy: {
              completedAt: "desc",
            },
          },
        },
      },
    },
  });

  if (!profile || !profile.profileVisibility) {
    return null;
  }

  return profile;
}

export async function updateAthleteProfile(userId: string, data: ProfileUpdateInput) {
  const validated = profileUpdateSchema.parse(data);

  const existingProfile = await db.athleteProfile.findUnique({
    where: { userId },
  });

  if (!existingProfile) {
    throw new Error("Athlete profile not found");
  }

  // Update User name fields
  const updatedUser = await db.user.update({
    where: { id: userId },
    data: {
      firstName: validated.firstName,
      lastName: validated.lastName,
      name: `${validated.firstName} ${validated.lastName}`.trim(),
    },
  });

  const completeness = calculateProfileCompleteness(updatedUser, {
    schoolClub: validated.schoolClub,
    graduationYear: validated.graduationYear,
    location: validated.location,
    sport: validated.sport,
    position: validated.position,
    bio: validated.bio,
    profilePhoto: validated.profilePhoto,
  });

  const updatedProfile = await db.athleteProfile.update({
    where: { userId },
    data: {
      schoolClub: validated.schoolClub,
      graduationYear: validated.graduationYear,
      location: validated.location,
      sport: validated.sport,
      position: validated.position,
      bio: validated.bio,
      profilePhoto: validated.profilePhoto,
      xUrl: validated.xUrl,
      benchPress: validated.benchPress,
      squat: validated.squat,
      powerClean: validated.powerClean,
      fortyTime: validated.fortyTime,
      vertical: validated.vertical,
      shuttleTime: validated.shuttleTime,
      broadJump: validated.broadJump,
      gpa: validated.gpa,
      highlightVideoUrl: validated.highlightVideoUrl,
      profileVisibility: validated.profileVisibility ?? existingProfile.profileVisibility,
      profileCompleteness: completeness,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          name: true,
          role: true,
        },
      },
    },
  });

  return updatedProfile;
}
