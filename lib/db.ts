// import { PrismaClient } from "@prisma/client";
// import { withAccelerate } from "@prisma/extension-accelerate";

// const globalForPrisma = global as unknown as {
//   prisma: ReturnType<typeof createPrismaClient>;
// };

// function createPrismaClient() {
//   const accelerateUrl = process.env.DATABASE_URL;

//   if (!accelerateUrl) {
//     throw new Error("DATABASE_URL is not defined");
//   }

//   if (
//     !accelerateUrl.startsWith("prisma://") &&
//     !accelerateUrl.startsWith("prisma+postgres://")
//   ) {
//     throw new Error("DATABASE_URL must be a Prisma Accelerate URL");
//   }

//   return new PrismaClient({
//     accelerateUrl,
//   }).$extends(withAccelerate());
// }

// export const db = globalForPrisma.prisma || createPrismaClient();

// if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;


import { PrismaClient } from "@prisma/client"
 
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
 
export const db = globalForPrisma.prisma || new PrismaClient()
 
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db