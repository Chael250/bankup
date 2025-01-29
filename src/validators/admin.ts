import { z, ZodError } from "zod"

export const paginationSchema = z.object({
    page: z.coerce.number().positive().optional(),
    limit: z.coerce.number().positive().optional()
})

export type paginationSchemaType = z.infer<typeof paginationSchema>

export const userStatusSchema = z.object({
    status: z.boolean(),
});

export const loanIdSchema = z.object({
    loanId: z.coerce.number().positive(),
});

export const loanStatusUpdateSchema = z.object({
    status: z.enum(["approved", "rejected", "pending"]),
    comment: z.string().optional(),
});

export const loanTermsUpdateSchema = z.object({
    newAmount: z.coerce.number().positive(),
    newTerm: z.coerce.number().positive(),
});

export const dateRangeSchema = z.object({
    startDate: z.string().refine(date => !isNaN(Date.parse(date)), {
      message: "Invalid start date",
    }),
    endDate: z.string().refine(date => !isNaN(Date.parse(date)), {
      message: "Invalid end date",
    }),
});
  