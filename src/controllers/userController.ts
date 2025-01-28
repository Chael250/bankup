import { Request, Response } from "express";
import { z } from "zod";
import {
  getUserById,
  updateUserProfile,
  updateUserSecurity,
  getUserNotifications,
  changePassword,
  deleteUserProfile,
} from "../models/User";

// Zod schema to validate the user ID in request parameters
const userIdSchema = z.object({
  id: z.string().min(1, "User ID is required").refine(val => !isNaN(Number(val)), {
    message: "User ID must be a valid number",
  }),
});

// Zod schema for updating the user profile
const updateProfileSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
});

// Zod schema for updating security settings
const updateSecuritySchema = z.object({
  emailVerified: z.boolean().optional(),
  phoneVerified: z.boolean().optional(),
});

// Zod schema for changing the password
const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, "Current password is required"),
  newPassword: z.string().min(6, "New password is required"),
});

// Get user profile
export default async function getUserProfile(req: Request, res: Response): Promise<void> {
  try {
    // Validate user ID in request parameters
    const { id } = userIdSchema.parse(req.params);
    
    const user = await getUserById(Number(id));

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json({ user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Validation error", errors: error.errors });
    }
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Update user profile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    // Validate request body using Zod
    updateProfileSchema.parse(req.body);

    const { id } = userIdSchema.parse(req.params);
    const updatedUser = await updateUserProfile(Number(id), req.body);

    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Validation error", errors: error.errors });
    }
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update security settings
export const updateSecurity = async (req: Request, res: Response) => {
  try {
    // Validate request body using Zod
    updateSecuritySchema.parse(req.body);

    const { id } = userIdSchema.parse(req.params);
    const { emailVerified, phoneVerified } = req.body;
    await updateUserSecurity(Number(id), { emailVerified, phoneVerified });

    res.json({ message: "Security settings updated successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Validation error", errors: error.errors });
    }
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get user notifications
export const getNotifications = async (req: Request, res: Response) => {
  try {
    // Validate user ID in request parameters
    const { id } = userIdSchema.parse(req.params);
    
    const notifications = await getUserNotifications(Number(id));

    res.json({ notifications });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Validation error", errors: error.errors });
    }
    const errorMessage = (error instanceof Error) ? error.message : "Unknown error";
    res.status(500).json({ message: errorMessage });
  }
};

// Change user password
export const changeUserPassword = async (req: Request, res: Response) => {
  try {
    // Validate request body using Zod
    changePasswordSchema.parse(req.body);

    const { id } = userIdSchema.parse(req.params);
    const { currentPassword, newPassword } = req.body;
    await changePassword(Number(id), currentPassword, newPassword);

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Validation error", errors: error.errors });
    }
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete user profile
export const deleteProfile = async (req: Request, res: Response) => {
  try {
    // Validate user ID in request parameters
    const { id } = userIdSchema.parse(req.params);
    
    await deleteUserProfile(Number(id));

    res.json({ message: "User profile deleted successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Validation error", errors: error.errors });
    }
    res.status(500).json({ message: "Internal Server Error" });
  }
};
