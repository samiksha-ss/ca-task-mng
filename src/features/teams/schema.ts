import { z } from "zod";

export const createTeamSchema = z.object({
  name: z.string().trim().min(2, "Team name must be at least 2 characters."),
  description: z.string().trim().optional(),
});

export const assignManagerSchema = z.object({
  teamId: z.string().uuid("Select a valid team."),
  managerId: z.string().uuid("Select a valid manager.").nullable(),
});

export const updateMemberSchema = z.object({
  memberId: z.string().uuid("Select a valid member."),
  role: z.enum(["admin", "manager", "member"]),
  teamId: z.string().uuid("Select a valid team.").nullable(),
  jobTitle: z.string().trim().optional(),
  isActive: z.boolean(),
});

export const updateTeamSchema = z.object({
  teamId: z.string().uuid("Select a valid team."),
  name: z.string().trim().min(2, "Team name must be at least 2 characters."),
  description: z.string().trim().optional(),
});

export const deleteTeamSchema = z.object({
  teamId: z.string().uuid("Select a valid team."),
});
