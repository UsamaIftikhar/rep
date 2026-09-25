import { z } from "zod";

export const signUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: z.enum(["ATHLETE", "RECRUITER", "ADMIN"]).default("ATHLETE"),
  schoolClub: z.string().optional(),
  graduationYear: z.number().int().optional(),
  location: z.string().optional(),
  sport: z.string().optional(),
  position: z.string().optional(),
});

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const profileUpdateSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  schoolClub: z.string().nullable().optional(),
  graduationYear: z.number().int().nullable().optional(),
  location: z.string().nullable().optional(),
  sport: z.string().nullable().optional(),
  position: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  profilePhoto: z.string().nullable().optional(),
  xUrl: z.string().nullable().optional(),
  height: z.string().nullable().optional(),
  weight: z.string().nullable().optional(),
  benchPress: z.string().nullable().optional(),
  squat: z.string().nullable().optional(),
  powerClean: z.string().nullable().optional(),
  fortyTime: z.string().nullable().optional(),
  vertical: z.string().nullable().optional(),
  shuttleTime: z.string().nullable().optional(),
  broadJump: z.string().nullable().optional(),
  gpa: z.string().nullable().optional(),
  actSat: z.string().nullable().optional(),
  highlightVideoUrl: z.string().nullable().optional(),
  profileVisibility: z.boolean().optional(),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
