import prisma from "./prisma/client.js";

async function run() {
  try {
    const u = await prisma.user.findFirst();
    const p = await prisma.person.findFirst();
    if (!u || !p) {
      console.log("No user or person");
      return;
    }
    await prisma.interaction.create({
      data: {
        userId: u.id,
        personId: p.id,
        type: "Test",
        notes: "Test notes"
      }
    });
    console.log("Success");
  } catch (err) {
    console.error("PRISMA ERROR CODE:", err.code);
    console.error(err.message);
  }
}
run();
