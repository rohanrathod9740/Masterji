import prisma from "../prisma/client.js";

export const getAllPersons = async (req, res) => {
    try {
        const persons = await prisma.person.findMany();
        res.status(200).json(persons);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getPersonById = async (req, res) => {
    const { id } = req.params;
    try {
        const person = await prisma.person.findUnique({ where: { id } });
        res.status(200).json(person);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createPerson = async (req, res) => {
    const { userId,name,contact,type,notes } = req.body;
    try {
        const person = await prisma.person.create({ data: {userId,name,contact,type,notes} });
        res.status(200).json(person);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deletePersonById = async (req, res) => {
    const { id } = req.params;
    try {
        const person = await prisma.person.delete({ where: { id } });
        res.status(200).json(person);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const editPersonById = async (req, res) => {
    const { id } = req.params;
    const { name, age, gender } = req.body;
    try {
        const person = await prisma.person.update({ where: { id }, data: { name, age, gender } });
        res.status(200).json(person);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const addTagToPerson = async (req, res) => {
    const {personId} = req.body;
    const {tagId} = req.body;

    if (!tagId) {
        return res.status(400).json({ error: "tagId is required" });
    }

    try {
        const personTag = await prisma.personTag.create({
            data: { personId, tagId }
        });
        res.status(200).json(personTag);
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ error: "Tag is already added to this person" });
        }
        res.status(500).json({ error: error.message });
    }
};
