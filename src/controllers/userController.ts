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
import { changePasswordSchema, updateProfileSchema, updateSecuritySchema, userIdSchema } from "../validators/user";
import { formatZodError } from "../helpers";

export default async function getUserProfile(req: Request, res: Response): Promise<void> {
  try {
    const { id } = userIdSchema.parse(req.params);
    
    const user = await getUserById(Number(id));

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json({ user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: `Validation error: ${formatZodError(error)}` });
    }
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export const updateProfile = async (req: Request, res: Response) => {
  try {
    updateProfileSchema.parse(req.body);

    const { id } = userIdSchema.parse(req.params);
    const updatedUser = await updateUserProfile(Number(id), req.body);

    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: `Validation error: ${formatZodError(error)}` });
    }
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateSecurity = async (req: Request, res: Response) => {
  try {
    updateSecuritySchema.parse(req.body);

    const { id } = userIdSchema.parse(req.params);
    const { emailVerified, phoneVerified } = req.body;
    await updateUserSecurity(Number(id), { emailVerified, phoneVerified });

    res.json({ message: "Security settings updated successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: `Validation error: ${formatZodError(error)}` });
    }
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const { id } = userIdSchema.parse(req.params);
    
    const notifications = await getUserNotifications(Number(id));

    res.json({ notifications });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: `Validation error: ${formatZodError(error)}` });
    }
    const errorMessage = (error instanceof Error) ? error.message : "Unknown error";
    res.status(500).json({ message: errorMessage });
  }
};

export const changeUserPassword = async (req: Request, res: Response) => {
  try {
    changePasswordSchema.parse(req.body);

    const { id } = userIdSchema.parse(req.params);
    const { currentPassword, newPassword } = req.body;
    await changePassword(Number(id), currentPassword, newPassword);

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: `Validation error: ${formatZodError(error)}` });
    }
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteProfile = async (req: Request, res: Response) => {
  try {
    const { id } = userIdSchema.parse(req.params);
    
    await deleteUserProfile(Number(id));

    res.json({ message: "User profile deleted successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: `Validation error: ${formatZodError(error)}` });
    }
    res.status(500).json({ message: "Internal Server Error" });
  }
};
