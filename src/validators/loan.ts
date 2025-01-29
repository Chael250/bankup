import { z } from "zod";

export const applyForLoanSchema = z.object({
    userId: z.string().nonempty('User ID is required'),
    amount: z.number().positive('Amount must be a positive number'),
    purpose: z.string().nonempty('Purpose is required'),
    term: z.number().positive('Term must be a positive number'),
    paymentFrequency: z.enum(['weekly', 'monthly']),
    guarantorName: z.string().nonempty('Guarantor name is required'),
    guarantorRelationship: z.string().nonempty('Guarantor relationship is required'),
    guarantorIdUrl: z.string().url('Invalid URL for guarantor ID'),
});

export type applyForLoanSchemaType = z.infer<typeof applyForLoanSchema>

export const topUpLoanSchema = z.object({
    loanId: z.string().nonempty('Loan ID is required'),
    additionalAmount: z.number().positive('Additional amount must be a positive number'),
    newTerm: z.number().positive('New term must be a positive number'),
});
  