import { Request, Response } from "express";
import * as supportService from "../services/supportService";
import { randomBytes } from "crypto";
import { z } from "zod";

// Define Zod schema for sendContactMessage validation
const sendContactMessageSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(1, "Message is required"),
});

// Define Zod schema for getting chat messages (ID is required)
const getChatMessagesSchema = z.object({
  id: z.string().min(1, "Chat ID is required").refine(val => !isNaN(Number(val)), {
    message: "Chat ID must be a valid number",
  }),
});

// Define Zod schema for deleting chat (ID is required)
const deleteChatSchema = z.object({
  id: z.string().min(1, "Chat ID is required").refine(val => !isNaN(Number(val)), {
    message: "Chat ID must be a valid number",
  }),
});

// Send contact message
export const sendContactMessage = async (req: Request, res: Response) => {
  try {
    // Validate request body using Zod
    sendContactMessageSchema.parse(req.body);

    if (!req.user) {
      return res.status(400).json({ message: "User not authenticated" });
    }

    const userId = Number(req.user.id);
    const chatId = Number(randomBytes(4).toString("hex"));
    const response = await supportService.sendContactMessage(req.body.subject, req.body.message, chatId, userId);
    return res.status(201).json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.errors });
    }
    return res.status(500).json({ message: "Error sending message", error });
  }
};

// Start live chat
export const startLiveChat = async (req: Request, res: Response) => {
  try {
    const chat = await supportService.startLiveChat();
    return res.status(201).json({ chatId: chat.id });
  } catch (error) {
    return res.status(500).json({ message: "Error starting chat", error });
  }
};

// Get chat messages
export const getChatMessages = async (req: Request, res: Response) => {
  try {
    // Validate the chat ID in params using Zod
    const { id } = getChatMessagesSchema.parse(req.params);

    const chatId = Number(id);
    const messages = await supportService.getChatMessages(chatId);

    if (!messages.length) {
      return res.status(404).json({ message: "No messages found" });
    }
    return res.status(200).json(messages);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.errors });
    }
    return res.status(500).json({ message: "Error fetching messages", error });
  }
};

// Delete chat
export const deleteChat = async (req: Request, res: Response) => {
  try {
    // Validate the chat ID in params using Zod
    const { id } = deleteChatSchema.parse(req.params);

    const chatId = Number(id);
    await supportService.deleteChat(chatId);

    return res.status(200).json({ message: "Chat deleted successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.errors });
    }
    return res.status(500).json({ message: "Error deleting chat", error });
  }
};
