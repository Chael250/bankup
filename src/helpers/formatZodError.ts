import { z } from 'zod';

export const formatZodError = (error: z.ZodError) => {
  error.errors.map(err => err.message).join(', ');
};
