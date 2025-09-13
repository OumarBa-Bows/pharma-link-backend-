import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export const connect = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Prisma connected to DB');
  } catch (error) {
    console.error('❌ Prisma connection error:', error);
    process.exit(1);
  }
};

