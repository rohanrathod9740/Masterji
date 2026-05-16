import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/db";

// GET ALL PERSONS
export const getAllPersons = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.body;
    if(!userId){
      res.status(400).json({
        message:"userId is required",
      });
      return;
    }

    const persons = await prisma.person.findMany({
      where: {
        userId:userId,
      },
    });

    res.status(200).json(persons);
  } catch (error) {
    next(error);
  }
};

// GET PERSON BY ID
export const getPersonById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id, userId } = req.body;

    const person = await prisma.person.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!person) {
      res.status(404).json({
        message: "Person not found or unauthorized",
      });
      return;
    }

    res.status(200).json(person);
  } catch (error) {
    next(error);
  }
};

// CREATE PERSON
export const createPerson = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId, name, contact, type, notes } = req.body;

    const person = await prisma.person.create({
      data: {
        userId,
        name,
        contact,
        type,
        notes,
      },
    });

    res.status(201).json(person);
  } catch (error) {
    next(error);
  }
};

// DELETE PERSON
export const deletePersonById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id, userId } = req.body;

    // First verify ownership
    const existingPerson = await prisma.person.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingPerson) {
      res.status(404).json({
        message: "Person not found or unauthorized",
      });
      return;
    }

    await prisma.person.delete({
      where: {
        id, 
      },
    });

    res.status(200).json({
      message: "Person deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// EDIT PERSON
export const editPersonById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId, id } = req.params;
    const { name, contact, type, notes } = req.body;

    // Check ownership
    const existingPerson = await prisma.person.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingPerson) {
      res.status(404).json({
        message: "Person not found or unauthorized",
      });
      return;
    }

    const updatedPerson = await prisma.person.update({
      where: {
        id, // must be unique
      },
      data: {
        name,
        contact,
        type,
        notes,
      },
    });

    res.status(200).json(updatedPerson);
  } catch (error) {
    next(error);
  }
};

// ADD TAG TO PERSON
export const addTagToPerson = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { personId, tagId } = req.body;

    if (!tagId) {
      res.status(400).json({
        error: "tagId is required",
      });
      return;
    }

    if (!personId) {
      res.status(400).json({
        error: "personId is required",
      });
      return;
    }

    const personTag = await prisma.personTag.create({
      data: {
        personId,
        tagId,
      },
    });

    res.status(201).json(personTag);
  } catch (error: any) {
    // Prisma unique constraint error
    if (error.code === "P2002") {
      res.status(400).json({
        error: "Tag is already added to this person",
      });
      return;
    }

    next(error);
  }
};