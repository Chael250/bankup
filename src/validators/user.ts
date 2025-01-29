import { z } from "zod"
import { getUserById } from "../models/User";

export const userIdSchema = z.object({
    id: z.string().min(1, "User ID is required").refine(val => !isNaN(Number(val)), {
      message: "User ID must be a valid number",
    }),
});

export const updateProfileSchema = z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
});

export const updateSecuritySchema = z.object({
    emailVerified: z.boolean().optional(),
    phoneVerified: z.boolean().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, "Current password is required"),
  newPassword: z.string().min(6, "New password is required"),
});