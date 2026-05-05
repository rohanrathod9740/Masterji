import prisma from "../prisma/client.js";

export const createTag = async (req, res) => {
    const { userId, name } = req.body;
    try {
        const tag = await prisma.tag.create({
            data: { userId, name }
        });
        res.status(201).json(tag);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const editTag = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    try {
        const tag = await prisma.tag.update({
            where: { id },
            data: { name }
        });
        res.status(200).json(tag);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteTag = async (req, res) => {
    const { id } = req.params;
    try {
        const tag = await prisma.tag.delete({
            where: { id }
        });
        res.status(200).json(tag);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const listTags = async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: "userId is required" });
    }

    try {
        const tags = await prisma.tag.findMany({
            where: { userId }
        });

        return res.status(200).json({
            success: true,
            count: tags.length,
            data: tags
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};