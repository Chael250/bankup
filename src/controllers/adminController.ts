import { Request, Response } from "express";
import * as adminService from "../services/adminService";
import { z, ZodError } from "zod";
import { LoanStatus } from "@prisma/client";

const paginationSchema = z.object({
  page: z.coerce.number().positive().optional(),
  limit: z.coerce.number().positive().optional(),
});

const userStatusSchema = z.object({
  status: z.boolean(),
});

const loanIdSchema = z.object({
  loanId: z.coerce.number().positive(),
});

const loanStatusUpdateSchema = z.object({
  status: z.enum(["approved", "rejected", "pending"]),
  comment: z.string().optional(),
});

const loanTermsUpdateSchema = z.object({
  newAmount: z.coerce.number().positive(),
  newTerm: z.coerce.number().positive(),
});

const dateRangeSchema = z.object({
  startDate: z.string().refine(date => !isNaN(Date.parse(date)), {
    message: "Invalid start date",
  }),
  endDate: z.string().refine(date => !isNaN(Date.parse(date)), {
    message: "Invalid end date",
  }),
});

const handleValidationError = (res: Response, error: ZodError) => {
  res.status(400).json({ message: "Validation error", errors: error.errors });
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const query = paginationSchema.parse(req.query);
    const users = await adminService.getAllUsers(query.page || 1, query.limit || 10);
    res.status(200).json(users);
  } catch (error) {
    if (error instanceof ZodError) return handleValidationError(res, error);
    res.status(500).json({ message: "Error fetching users", error });
  }
};

export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const { status } = userStatusSchema.parse(req.body);
    await adminService.updateUserStatus(Number(req.params.id), status);
    res.status(200).json({ message: "User status updated" });
  } catch (error) {
    if (error instanceof ZodError) return handleValidationError(res, error);
    res.status(500).json({ message: "Error updating user status", error });
  }
};

export const approveLoan = async (req: Request, res: Response) => {
  try {
    const params = loanIdSchema.parse(req.params);
    const updatedLoan = await adminService.updateLoanStatus(params.loanId, "approved", "");
    if (updatedLoan) {
      res.status(200).json({ message: "Loan approved successfully" });
    } else {
      res.status(404).json({ message: "Loan not found" });
    }
  } catch (error) {
    if (error instanceof ZodError) return handleValidationError(res, error);
    res.status(500).json({ message: "Error approving loan", error });
  }
};

export const updateLoanStatus = async (req: Request, res: Response) => {
  try {
    const params = loanIdSchema.parse(req.params);
    const body = loanStatusUpdateSchema.parse(req.body);
    const updateLoanStatus = await adminService.updateLoanStatus(params.loanId, body.status, body.comment || "");
    if (updateLoanStatus !== undefined) {
      res.status(200).json({ message: "Loan status updated successfully", loan: updateLoanStatus });
    } else {
      res.status(404).json({ message: "Loan not found" });
    }
  } catch (error) {
    if (error instanceof ZodError) return handleValidationError(res, error);
    res.status(500).json({ message: "Error updating loan status", error });
  }
};

export const getLoanReports = async (req: Request, res: Response) => {
  try {
    const query = dateRangeSchema.parse(req.query);
    const report = await adminService.getLoanReports(new Date(query.startDate), new Date(query.endDate));
    res.status(200).json(report);
  } catch (error) {
    if (error instanceof ZodError) return handleValidationError(res, error);
    res.status(500).json({ message: "Error fetching loan reports", error });
  }
};
