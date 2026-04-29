import { z } from "zod";

export const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters."),
  jobTitle: z.string().trim().optional(),
});
