import { Request, Response, NextFunction } from "express";
import {prisma} from "../lib/db";

export const createInteraction = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { userId, personId, type, notes, audioUrl } = req.body;

  if (!userId || !personId) {
    res.status(400).json({
      error: "userId and personId are required",
    });
    return;
  }

  try {
    const interaction = await prisma.interaction.create({
      data: {
        userId,
        personId,
        ...(type && { type }),
        ...(notes && { notes }),
        ...(audioUrl && { audioUrl }),
      },
    });

    res.status(201).json(interaction);
  } catch (error) {
    next(error);
  }
};

export const editInteraction = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { id } = req.body;
  const { type, notes, audioUrl, transcript, interactionDate } = req.body;

  try {
    const updateData: {
      type?: string;
      notes?: string;
      audioUrl?: string;
      transcript?: string;
      interactionDate?: Date;
    } = {};

    if (type !== undefined) updateData.type = type;
    if (notes !== undefined) updateData.notes = notes;
    if (audioUrl !== undefined) updateData.audioUrl = audioUrl;
    if (transcript !== undefined) updateData.transcript = transcript;

    if (interactionDate !== undefined) {
      updateData.interactionDate = new Date(interactionDate);
    }

    const interaction = await prisma.interaction.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json(interaction);
  } catch (error) {
    next(error);
  }
};

export const deleteInteraction = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { id } = req.body;

  try {
    const interaction = await prisma.interaction.delete({
      where: { id },
    });

    res.status(200).json(interaction);
  } catch (error) {
    next(error);
  }
};