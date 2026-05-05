import prisma from "./prisma/client.js";

async function main() {
    try {
        const user = await prisma.user.findFirst();
        const person = await prisma.person.findFirst();
        console.log("User:", user?.id, "Person:", person?.id);
        
        const interaction = await prisma.interaction.create({
            data: {
                userId: user.id,
                personId: person.id,
                type: "test",
                notes: "testing"
            }
        });
        console.log("Created:", interaction);
    } catch (e) {
        console.error(e.message);
    }
}
main();
