import { z } from "zod"

export const paymentSchema = z.object({
    loanId: z.string().min(1, 'Loan ID is required'),
    amount: z.number().min(0.01, 'Amount must be greater than 0'),
    paymentMethod: z.string().min(1, 'Payment method is required'),
});

export type paymentSchemaType = z.infer<typeof paymentSchema>

export const loanIdParamSchema = z.object({
    loanId: z.string().min(1, 'Loan ID is required'),
});

export const generatePaymentStatementSchema = z.object({
    loanId: z.string().min(1, 'Loan ID is required'),
    startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid start date',
    }),
    endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid end date',
    }),
});