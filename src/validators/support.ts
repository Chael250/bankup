import { Request, Response } from "express";
import { z } from "zod";

export const sendContactMessageSchema = z.object({
    subject: z.string().min(1, "Subject is required"),
    message: z.string().min(1, "Message is required"),
});

export const getChatMessagesSchema = z.object({
    id: z.string().min(1, "Chat ID is required").refine(val => !isNaN(Number(val)), {
      message: "Chat ID must be a valid number",
    }),
});

export const deleteChatSchema = z.object({
  id: z.string().min(1, "Chat ID is required").refine(val => !isNaN(Number(val)), {
    message: "Chat ID must be a valid number",
  }),
});