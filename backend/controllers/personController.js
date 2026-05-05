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
    const { name, age, gender } = req.body;
    try {
        const person = await prisma.person.create({ data: { name, phone, email,} });
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
