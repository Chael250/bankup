import { Request, Response } from "express";
import * as supportService from "../services/supportService";
import { randomBytes } from "crypto";
import { deleteChatSchema, getChatMessagesSchema, sendContactMessageSchema } from "../validators/support";
import { z } from "zod";
import { formatZodError } from "../helpers";

export const sendContactMessage = async (req: Request, res: Response) => {
  try {
    sendContactMessageSchema.parse(req.body);

    if (!req.user) {
      res.status(400).json({ message: "User not authenticated" });
    }

    const userId = Number(req.user?.id);
    const chatId = Number(randomBytes(4).toString("hex"));
    const response = await supportService.sendContactMessage(req.body.subject, req.body.message, chatId, userId);
    res.status(201).json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({message: `Validation error: ${formatZodError(error)}`})
    }
    res.status(500).json({ message: "Error sending message", error });
  }
};

export const startLiveChat = async (req: Request, res: Response) => {
  try {
    const chat = await supportService.startLiveChat();
    res.status(201).json({ chatId: chat.id });
  } catch (error) {
    res.status(500).json({ message: "Error starting chat", error });
  }
};

export const getChatMessages = async (req: Request, res: Response) => {
  try {
    const { id } = getChatMessagesSchema.parse(req.params);

    const chatId = Number(id);
    const messages = await supportService.getChatMessages(chatId);

    if (!messages.length) {
      res.status(404).json({ message: "No messages found" });
    }
    res.status(200).json(messages);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).send({message: `Validation error: ${formatZodError(error)}`})
    }
    res.status(500).json({ message: "Error fetching messages", error });
  }
};

export const deleteChat = async (req: Request, res: Response) => {
  try {
    const { id } = deleteChatSchema.parse(req.params);

    const chatId = Number(id);
    await supportService.deleteChat(chatId);

    res.status(200).json({ message: "Chat deleted successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: `Validation error: ${formatZodError(error)}` });
    }
    res.status(500).json({ message: "Error deleting chat", error });
  }
};
