import { Request, Response } from 'express';
import { z } from 'zod';
import PaymentModel from '../models/Payment';
import LoanModel from '../models/Loan';

// Define schemas for validation
const paymentSchema = z.object({
  loanId: z.string().min(1, 'Loan ID is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  paymentMethod: z.string().min(1, 'Payment method is required'),
});

const loanIdParamSchema = z.object({
  loanId: z.string().min(1, 'Loan ID is required'),
});

const generatePaymentStatementSchema = z.object({
  loanId: z.string().min(1, 'Loan ID is required'),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid start date',
  }),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid end date',
  }),
});

export const makePayment = async (req: Request, res: Response) => {
  try {
    // Validate request body using Zod
    const validatedData = paymentSchema.parse(req.body);

    const { loanId, amount, paymentMethod } = validatedData;

    const loan = await LoanModel.findById(loanId);
    if (!loan) {
      res.status(404).json({ message: 'Loan not found' });
    }

    const payment = await PaymentModel.create({
      loanId,
      amount,
      paymentMethod,
    });

    res.status(201).json({ message: 'Payment successful', paymentId: payment.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    res.status(500).json({ message: 'Error processing payment', error });
  }
};

export const getPaymentHistory = async (req: Request, res: Response) => {
  try {
    // Validate URL parameters using Zod
    const validatedParams = loanIdParamSchema.parse(req.params);

    const { loanId } = validatedParams;

    const payments = await PaymentModel.findByLoanId(parseInt(loanId));

    res.status(200).json(payments);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    res.status(500).json({ message: 'Error fetching payment history', error });
  }
};

export const generatePaymentStatement = async (req: Request, res: Response) => {
  try {
    // Validate query parameters using Zod
    const validatedQuery = generatePaymentStatementSchema.parse(req.query);

    const { loanId, startDate, endDate } = validatedQuery;

    const payments = await PaymentModel.getPaymentsBetweenDates(
      parseInt(loanId),
      new Date(startDate),
      new Date(endDate)
    );

    // Generate PDF statement (implementation depends on your PDF generation library)
    // const pdfBuffer = generatePDFStatement(payments);

    res.status(200).json({
      message: 'Payment statement generated successfully',
      // statement: pdfBuffer.toString('base64')
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    res.status(500).json({ message: 'Error generating payment statement', error });
  }
};
