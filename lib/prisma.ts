import { PrismaClient } from "@prisma/client";
import { PrismaClientInitializationError } from "@prisma/client/runtime/library";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Validate DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error(
    "DATABASE_URL environment variable is not set. Please configure your database connection."
  );
}

// Create Prisma client with error handling
function createPrismaClient(): PrismaClient {
  try {
    const client = new PrismaClient({
      log:
        process.env.NODE_ENV === "development"
          ? ["query", "error", "warn"]
          : ["error"],
    });

    // Test connection on initialization in development
    if (process.env.NODE_ENV === "development") {
      client.$connect().catch((error) => {
        console.error("Failed to connect to database:", error);
        if (error instanceof PrismaClientInitializationError) {
          console.error("Prisma initialization error:", {
            errorCode: error.errorCode,
            message: error.message,
          });
        }
      });
    }

    return client;
  } catch (error) {
    console.error("Failed to create Prisma client:", error);
    if (error instanceof PrismaClientInitializationError) {
      console.error("Prisma initialization error:", {
        errorCode: error.errorCode,
        message: error.message,
      });
    }
    throw error;
  }
}

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Connection health check helper (optional, for diagnostics)
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error("Database connection check failed:", error);
    return false;
  }
}





