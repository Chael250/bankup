import { Request, Response } from 'express';
import { z } from 'zod';
import PaymentModel from '../models/Payment';
import LoanModel from '../models/Loan';
import { generatePaymentStatementSchema, loanIdParamSchema, paymentSchema, paymentSchemaType } from '../validators/payment';
import { formatZodError } from '../helpers';

export const makePayment = async (req: Request, res: Response) => {
  try {
    const validatedData:paymentSchemaType = paymentSchema.parse(req.body);

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
    if (error instanceof z.ZodError) return formatZodError(error)
    res.status(500).json({ message: 'Error processing payment', error });
  }
};

export const getPaymentHistory = async (req: Request, res: Response) => {
  try {
    const validatedParams = loanIdParamSchema.parse(req.params);

    const { loanId } = validatedParams;

    const payments = await PaymentModel.findByLoanId(parseInt(loanId));

    res.status(200).json(payments);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).send({message: `Validation error: ${formatZodError(error)}`})
    }
    res.status(500).json({ message: 'Error fetching payment history', error });
  }
};

export const generatePaymentStatement = async (req: Request, res: Response) => {
  try {
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
      res.status(400).send({message: `Validation error: ${formatZodError(error)}`})
    }
    res.status(500).json({ message: 'Error generating payment statement', error });
  }
};
