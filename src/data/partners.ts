export type PartnerTier = "Founding" | "Strategic" | "Official";

export interface Partner {
  id: string;
  name: string;
  tier: PartnerTier;
  region: string;
  category: string;
  tagline: string;
  description: string;
  logo: string | null;
  brandColor: string | null;
  profileImage: string | null;
  imageFit?: "contain" | "cover";
  imageBg?: string;
  highlights: string[];
  websiteUrl: string;
  buttonText: string;
}

export function getPartnerInitials(name: string): string {
  if (!name) return "P";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export const partners: Partner[] = [
  {
    id: "sac-showcase",
    name: "SAC Showcase",
    tier: "Strategic",
    region: "Charlotte, NC",
    category: "Football Combines & Athlete Exposure",
    tagline: "Connecting emerging football talent with exposure, competition, and recruiting opportunities.",
    description: "SAC Showcase gives middle school, high school, and girls flag football athletes opportunities to compete, showcase their skills, and receive evaluations. Its football showcases and combines focus on athlete exposure and opportunities to qualify for the AEX All-American Bowl.",
    logo: "/images/partners/sac-showcase.webp",
    brandColor: "#F21717",
    profileImage: "/images/partners/sac-showcase.webp",
    imageFit: "contain",
    imageBg: "#F2F2F2",
    highlights: ["Football Combines", "Girls Flag Football", "AEX Bowl Qualifier"],
    websiteUrl: "https://sacshowcase.com",
    buttonText: "Explore SAC Showcase",
  },
  {
    id: "aex-showcase",
    name: "AEX Showcase",
    tier: "Founding",
    region: "United States",
    category: "Athlete Development & All-American Competition",
    tagline: "Empowering student-athletes through elite competition, mentorship, and leadership development.",
    description: "AEX combines All-American football events with mentorship, leadership development, and mental wellness education. Its programs help student-athletes grow as competitors and individuals, building confidence and purpose on the field, in the classroom, and beyond sports.",
    logo: "/images/partners/aex-showcase.png",
    brandColor: "#F59E0B",
    profileImage: "/images/partners/aex-showcase.png",
    imageFit: "contain",
    imageBg: "#FFFFFF",
    highlights: ["All-American Bowl", "Mentorship & Leadership", "Mental Wellness"],
    websiteUrl: "http://aexshowcase.org/",
    buttonText: "Explore AEX",
  },
  {
    id: "coaches-inc",
    name: "Coaches Inc.",
    tier: "Strategic",
    region: "United States",
    category: "Coaching Representation & Career Development",
    tagline: "Advancing coaching careers through professional representation, strategic guidance, and industry connections.",
    description: "Advancing coaching careers through professional representation, strategic guidance, contract advisory, and industry connections across collegiate and professional athletic networks.",
    logo: null,
    brandColor: null,
    profileImage: "/images/coaches_trio.jpeg",
    imageFit: "cover",
    imageBg: "#0D0D0D",
    highlights: ["Career Representation", "Contract Advisory", "Industry Network"],
    websiteUrl: "https://coachesinc.com",
    buttonText: "Explore Coaches Inc.",
  },
];
