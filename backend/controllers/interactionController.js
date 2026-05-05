import prisma from "../prisma/client.js";

export const createInteraction = async (req, res, next) => {
    const { userId, personId, type, notes, audioUrl, transcript } = req.body;

    if (!userId || !personId) {
        return res.status(400).json({
            error: "userId and personId are required"
        });
    }

    try {
        const interaction = await prisma.interaction.create({
            data: {
                userId,
                personId,
                type,
                notes,
                audioUrl,
                transcript,
            }
        });

        res.status(201).json(interaction);
    } catch (error) {
        next(error);
    }
};

export const editInteraction = async (req, res, next) => {
    const { id } = req.params;
    const { type, notes, audioUrl, transcript, interactionDate } = req.body;
    
    try {
        const updateData = {};
        if (type !== undefined) updateData.type = type;
        if (notes !== undefined) updateData.notes = notes;
        if (audioUrl !== undefined) updateData.audioUrl = audioUrl;
        if (transcript !== undefined) updateData.transcript = transcript;
        if (interactionDate !== undefined) updateData.interactionDate = new Date(interactionDate);

        const interaction = await prisma.interaction.update({
            where: { id },
            data: updateData
        });
        res.status(200).json(interaction);
    } catch (error) {
        next(error);
    }
};

export const deleteInteraction = async (req, res, next) => {
    const { id } = req.params;
    try {
        const interaction = await prisma.interaction.delete({
            where: { id }
        });
        res.status(200).json(interaction);
    } catch (error) {
        next(error);
    }
};

export const listInteractions = async (req, res, next) => {
    try {
        const interactions = await prisma.interaction.findMany();
        res.status(200).json(interactions);
    } catch (error) {
        next(error);
    }
};

export const getInteractionById = async (req, res, next) => {
    const { id } = req.params;
    try {
        const interaction = await prisma.interaction.findUnique({
            where: { id }
        });
        res.status(200).json(interaction);
    } catch (error) {
        next(error);
    }
};
