import { Request, Response } from "express";
import * as adminService from "../services/adminService";
import { z, ZodError } from "zod";
import { LoanStatus } from "@prisma/client";
import { dateRangeSchema, loanIdSchema, loanStatusUpdateSchema, paginationSchema, paginationSchemaType, userStatusSchema } from "../validators/admin";
import { formatZodError } from "../helpers";

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const query:paginationSchemaType = paginationSchema.parse(req.query);
    const users = await adminService.getAllUsers(query.page || 1, query.limit || 10);
    res.status(200).json(users);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).send({ message: `Validation error: ${formatZodError(error)}` })
    };
    res.status(500).json({ message: "Error fetching users", error });
  }
};

export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const { status } = userStatusSchema.parse(req.body);
    await adminService.updateUserStatus(Number(req.params.id), status);
    res.status(200).json({ message: "User status updated" });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).send({ message: `Validation error: ${formatZodError(error)}` })
    }
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
    if (error instanceof ZodError) {
      res.status(400).send({ message: `Validation error: ${formatZodError(error)}` })
    }
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
    if (error instanceof ZodError) {
      res.status(400).send({ message: `Validation error: ${formatZodError(error)}` })
    }
    res.status(500).json({ message: "Error updating loan status", error });
  }
};

export const getLoanReports = async (req: Request, res: Response) => {
  try {
    const query = dateRangeSchema.parse(req.query);
    const report = await adminService.getLoanReports(new Date(query.startDate), new Date(query.endDate));
    res.status(200).json(report);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).send({ message: `Validation error: ${formatZodError(error)}` })
    }
    res.status(500).json({ message: "Error fetching loan reports", error });
  }
};
