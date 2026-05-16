import { Request, Response, NextFunction } from "express";
import {prisma} from "../lib/db";

// Create Tag
export const createTag = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { userId, name } = req.body;

  try {
    const tag = await prisma.tag.create({
      data: {
        userId,
        name,
      },
    });

    res.status(201).json(tag);
  } catch (error) {
    next(error);
  }
};

// Edit Tag
export const editTag = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { id } = req.body;
  const { name } = req.body;

  try {
    const tag = await prisma.tag.update({
      where: {
        id,
      },
      data: {
        name,
      },
    });

    res.status(200).json(tag);
  } catch (error) {
    next(error);
  }
};

// Delete Tag
export const deleteTag = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { id } = req.body;

  try {
    const tag = await prisma.tag.delete({
      where: {
        id,
      },
    });

    res.status(200).json(tag);
  } catch (error) {
    next(error);
  }
};

// List Tags
export const listTags = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { userId } = req.body;

  if (!userId) {
    res.status(400).json({
      error: "userId is required",
    });
    return;
  }

  try {
    const tags = await prisma.tag.findMany({
      where: {
        userId,
      },
    });

    res.status(200).json({
      success: true,
      count: tags.length,
      data: tags,
    });
  } catch (error) {
    next(error);
  }
};