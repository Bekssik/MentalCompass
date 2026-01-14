import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientInitializationError,
} from "@prisma/client/runtime/library";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
  role: z.enum(["USER", "SPECIALIST"]).default("USER"),
});

// Check if DATABASE_URL is configured
function checkDatabaseConfig() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
}

// Handle Prisma-specific errors
function handlePrismaError(error: unknown) {
  const isDevelopment = process.env.NODE_ENV === "development";

  // Prisma Client Known Request Error (e.g., unique constraint, foreign key)
  if (error instanceof PrismaClientKnownRequestError) {
    console.error("Prisma known error:", {
      code: error.code,
      meta: error.meta,
      message: error.message,
    });

    switch (error.code) {
      case "P2002":
        // Unique constraint violation
        const target = (error.meta?.target as string[]) || [];
        if (target.includes("email")) {
          return NextResponse.json(
            {
              error: "User already exists",
              code: error.code,
              ...(isDevelopment && { details: error.message }),
            },
            { status: 400 }
          );
        }
        return NextResponse.json(
          {
            error: "A record with this information already exists",
            code: error.code,
            ...(isDevelopment && { details: error.message }),
          },
          { status: 400 }
        );

      case "P2003":
        // Foreign key constraint violation
        return NextResponse.json(
          {
            error: "Invalid reference data",
            code: error.code,
            ...(isDevelopment && { details: error.message }),
          },
          { status: 400 }
        );

      case "P1001":
        // Database connection error
        return NextResponse.json(
          {
            error: "Database connection failed",
            code: error.code,
            message: "Unable to connect to the database. Please try again later.",
            ...(isDevelopment && { details: error.message }),
          },
          { status: 503 }
        );

      case "P1017":
        // Database server closed connection
        return NextResponse.json(
          {
            error: "Database connection lost",
            code: error.code,
            message: "The database connection was closed. Please try again.",
            ...(isDevelopment && { details: error.message }),
          },
          { status: 503 }
        );

      default:
        return NextResponse.json(
          {
            error: "Database error occurred",
            code: error.code,
            message: "An error occurred while processing your request.",
            ...(isDevelopment && { details: error.message }),
          },
          { status: 500 }
        );
    }
  }

  // Prisma Client Initialization Error (connection/configuration issues)
  if (error instanceof PrismaClientInitializationError) {
    console.error("Prisma initialization error:", {
      errorCode: error.errorCode,
      message: error.message,
    });

    return NextResponse.json(
      {
        error: "Database configuration error",
        message:
          "Unable to initialize database connection. Please check your database configuration.",
        ...(isDevelopment && {
          details: error.message,
          errorCode: error.errorCode,
        }),
      },
      { status: 503 }
    );
  }

  // Prisma Client Unknown Request Error
  if (error instanceof PrismaClientUnknownRequestError) {
    console.error("Prisma unknown error:", error.message);
    return NextResponse.json(
      {
        error: "Database error occurred",
        message: "An unexpected database error occurred.",
        ...(isDevelopment && { details: error.message }),
      },
      { status: 500 }
    );
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    // Check database configuration
    checkDatabaseConfig();

    const body = await request.json();
    const { email, password, name, role } = registerSchema.parse(body);

    // Check for existing user
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        role,
      },
    });

    // Create specialist record if needed
    if (role === "SPECIALIST") {
      await prisma.specialist.create({
        data: {
          userId: user.id,
        },
      });
    }

    return NextResponse.json(
      { message: "User created successfully", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid input",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    // Handle Prisma-specific errors
    const prismaErrorResponse = handlePrismaError(error);
    if (prismaErrorResponse) {
      return prismaErrorResponse;
    }

    // Handle generic errors
    const isDevelopment = process.env.NODE_ENV === "development";

    if (error instanceof Error) {
      console.error("Registration error:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });

      // Check for database schema mismatch errors
      if (
        error.message.includes("Unknown argument") ||
        error.message.includes("Unknown field") ||
        error.message.includes("column") ||
        error.message.includes("does not exist")
      ) {
        return NextResponse.json(
          {
            error: "Database schema error",
            message:
              "Please run database migration: npx prisma db push or npx prisma migrate dev",
            ...(isDevelopment && { details: error.message }),
          },
          { status: 500 }
        );
      }

      // Check for missing DATABASE_URL
      if (error.message.includes("DATABASE_URL")) {
        return NextResponse.json(
          {
            error: "Database configuration error",
            message: "Database connection is not configured properly.",
            ...(isDevelopment && { details: error.message }),
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          error: "Internal server error",
          message: "An unexpected error occurred. Please try again later.",
          ...(isDevelopment && { details: error.message }),
        },
        { status: 500 }
      );
    }

    // Fallback for unknown error types
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred. Please try again later.",
      },
      { status: 500 }
    );
  }
}



