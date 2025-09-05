// configs/prisma.conf.js
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function connect() {
  try {
    await prisma.$connect();
    console.log("✅ Prisma connected to DB");
  } catch (error) {
    console.error("❌ Prisma connection error:", error);
    process.exit(1);
  }
}

module.exports = { prisma, connect };
