import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { EmailService } from '../services/emailService';
import { generateOTP, storeOTP, verifyOTP } from '../services/otpService';
import { jwtSecret, salt_round } from '../config';
import { AuthService } from '../services/authService';
import { UserService } from '../services/userService';
import { uploadService } from '../services/uploadService';
import { generateToken } from '../helpers/jwtToken';

// Define validation schemas using Zod
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  fullName: z.string().min(1, "Full name is required"),
  nationalIdNumber: z.string(),  
  phoneNumber: z.string(),
  address: z.string(),
  dateOfBirth: z.date(),
  gender: z.enum(["male","female","other"])
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const verifyEmailSchema = z.object({
  email: z.string().email(),
  verificationCode: z.string().length(6, "Verification code must be 6 characters"),
});

const resetPasswordSchema = z.object({
  email: z.string().email(),
});

const setNewPasswordSchema = z.object({
  resetToken: z.string(),
  newPassword: z.string().min(8, "Password must be at least 8 characters long"),
});

export class AuthController {
  static async register(req: Request, res: Response) {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    try {
      const body = registerSchema.parse(req.body);

      const existingUser = await UserService.getUserByEmail(body.email);
      if (existingUser) {
        res.status(409).json({ message: 'User already exists' });
        return;
      }

      const hashedPassword = await bcrypt.hash(body.password, salt_round);
      body.password = hashedPassword;

      const uploadResults = await uploadService.uploadFilesByFields(files);
      const idImageUpload = uploadResults["idImage"][0];
      const profileImageUpload = uploadResults["profileImage"][0];

      const newUser = await AuthService.registerWithEmail(body, idImageUpload, profileImageUpload);

      const verificationCode = generateOTP();
      await storeOTP(newUser.id, verificationCode);
      await EmailService.sendVerificationEmail(newUser.email, verificationCode);

      res.status(201).json({ message: 'User registered successfully' });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ errors: error.errors });
      } else {
        console.error(error.message);
        res.status(500).json({ message: 'Server error, please try again later' });
      }
    }
  }

  static async loginWithEmail(req: Request, res: Response) {
    try {
      const { email, password } = loginSchema.parse(req.body);

      const user = await UserService.getUserByEmail(email);
      if (!user) {
        res.status(400).json({ message: 'Invalid credentials' });
        return;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        res.status(400).json({ message: 'Invalid credentials' });
        return;
      }

      const verificationCode = generateOTP();
      await storeOTP(user.id, verificationCode);
      await EmailService.sendVerificationEmail(user.email, verificationCode);

      res.status(200).json({ message: 'Verification code sent to email' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ errors: error.errors });
      } else {
        console.error(error);
        res.status(500).json({ message: 'Server error, please try again later' });
      }
    }
  }

  static async verifyEmailCode(req: Request, res: Response) {
    try {
      const { email, verificationCode } = verifyEmailSchema.parse(req.body);

      const user = await UserService.getUserByEmail(email);
      if (!user) {
        res.status(400).json({ message: 'User not found' });
        return;
      }

      const isValid = await verifyOTP(user.id, verificationCode.toString());
      if (!isValid) {
        res.status(400).json({ message: 'Invalid or expired verification code' });
        return;
      }

      const token = generateToken({ userId: user.id });

      res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ errors: error.errors });
      } else {
        console.error(error);
        res.status(500).json({ message: 'Server error, please try again later' });
      }
    }
  }

  static async resetPassword(req: Request, res: Response) {
    try {
      const { email } = resetPasswordSchema.parse(req.body);

      const user = await UserService.getUserByEmail(email);
      if (!user) {
        res.status(400).json({ message: 'User not found' });
        return;
      }

      const resetToken = generateToken({ userId: user.id }, '10m');
      const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

      await EmailService.sendPasswordResetEmail(user.email, resetLink);

      res.status(200).json({ message: 'Password reset link sent to email' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ errors: error.errors });
      } else {
        console.error(error);
        res.status(500).json({ message: 'Server error, please try again later' });
      }
    }
  }

  static async setNewPassword(req: Request, res: Response) {
    try {
      const { resetToken, newPassword } = setNewPasswordSchema.parse(req.body);
      const decoded = jwt.verify(resetToken, jwtSecret) as { userId: number };
      const userId = decoded.userId;

      const user = await UserService.getUserById(userId);
      if (!user) {
        res.status(400).json({ message: 'Invalid or expired token' });
        return;
      }
      if (await bcrypt.compare(newPassword, user.password)) {
        res.status(400).json({ message: 'New password must be different from the old password' });
        return;
      }

      const hashedPassword = await bcrypt.hash(newPassword, salt_round);
      await UserService.updateUser(userId, { password: hashedPassword });

      res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ errors: error.errors });
      } else {
        console.error(error);
        res.status(500).json({ message: 'Server error, please try again later' });
      }
    }
  }
}
