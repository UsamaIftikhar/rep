export interface CoachesUpcomingSession {
  id: string;
  title: string;
  date: string; // e.g. "10/12/2026"
  isoDate: string;
  department: "DEFENSE" | "OFFENSE" | "SPECIAL_TEAMS" | "OPERATIONS" | "BASKETBALL" | "FLAG_FOOTBALL";
  subfolder?: string;
  description: string;
  presenter?: string;
}

export const UPCOMING_COACHES_SESSIONS: CoachesUpcomingSession[] = [
  {
    id: "def-secondary-20261012",
    title: "Defense-Secondary",
    date: "10/12/2026",
    isoDate: "2026-10-12T19:00:00.000Z",
    department: "DEFENSE",
    subfolder: "SECONDARY",
    description: "Boundary safety reads, match-quarters rules, and deep third communication.",
    presenter: "Coaching Staff",
  },
  {
    id: "off-wrte-20261026",
    title: "Offense-WR/TE",
    date: "10/26/2026",
    isoDate: "2026-10-26T19:00:00.000Z",
    department: "OFFENSE",
    subfolder: "WR_TE",
    description: "Stem leverage, route conversions vs press man, and red zone spacing.",
    presenter: "Coaching Staff",
  },
  {
    id: "rules-game-20261101",
    title: "Rules of the Game-referee led rules instruction",
    date: "11/1/2026",
    isoDate: "2026-11-01T18:00:00.000Z",
    department: "OPERATIONS",
    subfolder: "RULES_OF_THE_GAME",
    description: "Official rulebook review, point of emphasis changes, and clock management led by certified officials.",
    presenter: "Guest Certified Official & Staff",
  },
  {
    id: "def-lbedge-20261109",
    title: "Defense-LB/Edge",
    date: "11/9/2026",
    isoDate: "2026-11-09T19:00:00.000Z",
    department: "DEFENSE",
    subfolder: "LB",
    description: "Gap cancellation, scraping technique, and edge contain discipline in run/pass option reads.",
    presenter: "Coaching Staff",
  },
  {
    id: "spec-teams-20261123",
    title: "Special Teams",
    date: "11/23/2026",
    isoDate: "2026-11-23T19:00:00.000Z",
    department: "SPECIAL_TEAMS",
    subfolder: "ALL",
    description: "Punt, punt return, kickoff coverage, kickoff return, and extra point/field goal execution.",
    presenter: "Coaching Staff",
  },
  {
    id: "off-rbhback-20261207",
    title: "Offense-RB/H Back",
    date: "12/7/2026",
    isoDate: "2026-12-07T19:00:00.000Z",
    department: "OFFENSE",
    subfolder: "RB",
    description: "Zone mesh points, counter footwork, blitz pickup pickup paths, and receiving out of the backfield.",
    presenter: "Coaching Staff",
  },
  {
    id: "def-dl-20261221",
    title: "Defense-DL",
    date: "12/21/2026",
    isoDate: "2026-12-21T19:00:00.000Z",
    department: "DEFENSE",
    subfolder: "DL",
    description: "Interior shade leverage, pass rush games, stunt timing, and defeating double-teams.",
    presenter: "Coaching Staff",
  },
  {
    id: "off-ol-20270104",
    title: "Offense-OL",
    date: "1/4/2027",
    isoDate: "2027-01-04T19:00:00.000Z",
    department: "OFFENSE",
    subfolder: "OL",
    description: "Five-man slide protection, duo and outside zone reach blocks, and pre-snap defensive ID.",
    presenter: "Coaching Staff",
  },
];

export type CoachSport = "FOOTBALL" | "FLAG_FOOTBALL" | "BASKETBALL";

export interface SubfolderItem {
  key: string;
  label: string;
}

// 1. FOOTBALL DEPARTMENTS & SUBFOLDERS
export const FOOTBALL_OFFENSE_SUBFOLDERS: SubfolderItem[] = [
  { key: "ALL", label: "All Offense" },
  { key: "QB", label: "Quarterback (QB)" },
  { key: "RB", label: "Running Back (RB / H Back)" },
  { key: "WR_TE", label: "Wide Receiver & Tight End (WR/TE)" },
  { key: "OL", label: "Offensive Line (OL)" },
];

export const FOOTBALL_DEFENSE_SUBFOLDERS: SubfolderItem[] = [
  { key: "ALL", label: "All Defense" },
  { key: "DL", label: "Defensive Line (DL)" },
  { key: "EDGE", label: "Edge Rushers" },
  { key: "LB", label: "Linebackers (LB)" },
  { key: "SECONDARY", label: "Secondary / DBs" },
];

export const FOOTBALL_SPECIAL_TEAMS_SUBFOLDERS: SubfolderItem[] = [
  { key: "ALL", label: "All Special Teams" },
  { key: "PUNT", label: "Punt" },
  { key: "PUNT_RETURN", label: "Punt Return" },
  { key: "KICKOFF", label: "Kickoff" },
  { key: "KICKOFF_RETURN", label: "Kickoff Return" },
  { key: "EX_POINT_FG", label: "Ex Point/FG" },
  { key: "EX_POINT_FG_BLOCK", label: "Ex Point/FG Block" },
];

export const FOOTBALL_OPERATIONS_SUBFOLDERS: SubfolderItem[] = [
  { key: "ALL", label: "All Operations" },
  { key: "RULES_OF_THE_GAME", label: "Rules of the Game (Referee Led)" },
  { key: "GAME_MANAGEMENT", label: "Game Management" },
  { key: "SCOUTING", label: "Scouting & Film Breakdown" },
];

// 2. FLAG FOOTBALL DEPARTMENTS & SUBFOLDERS
export const FLAG_OFFENSE_SUBFOLDERS: SubfolderItem[] = [
  { key: "ALL", label: "All Flag Offense" },
  { key: "QB_CENTER", label: "QB/Center" },
  { key: "WR_RB", label: "WR/RB" },
];

export const FLAG_DEFENSE_SUBFOLDERS: SubfolderItem[] = [
  { key: "ALL", label: "All Flag Defense" },
  { key: "RUSHER_LB", label: "Rusher/LB" },
  { key: "SECONDARY", label: "Secondary" },
];

// 3. BASKETBALL SUBFOLDERS
export const BASKETBALL_SUBFOLDERS: SubfolderItem[] = [
  { key: "ALL", label: "All Basketball" },
  { key: "POINT_GUARD", label: "Point Guard" },
  { key: "SHOOTING_GUARD", label: "Shooting Guard" },
  { key: "FORWARD", label: "Forward" },
  { key: "POWER_FORWARD", label: "Power Forward" },
  { key: "CENTER", label: "Center" },
];
