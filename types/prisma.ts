import { Prisma } from "@prisma/client";

// Blog Post with relations
export type BlogPostWithRelations = Prisma.BlogPostGetPayload<{
  include: {
    specialist: {
      include: {
        user: true;
      };
    };
  };
}>;

// Experience Post with relations (may include user for owner checks)
export type ExperiencePostWithRelations = Prisma.ExperiencePostGetPayload<{
  include: {
    user: true;
  };
}>;

// Experience Post without user data (for anonymous display)
export type ExperiencePostAnonymous = Prisma.ExperiencePostGetPayload<{
  select: {
    id: true;
    title: true;
    content: true;
    published: true;
    createdAt: true;
    updatedAt: true;
    userId: true;
  };
}>;

// Specialist with relations
export type SpecialistWithRelations = Prisma.SpecialistGetPayload<{
  include: {
    user: true;
    certifications: true;
    reviews: {
      include: {
        user: true;
      };
    };
    _count: {
      select: {
        reviews: true;
      };
    };
  };
}>;

// Specialist with minimal relations (for recommendations)
export type SpecialistMinimal = {
  id: string;
  name: string;
  specialization: string | null;
};

// Certification with relations
export type CertificationWithRelations = Prisma.CertificationGetPayload<{
  include: {
    specialist: {
      include: {
        user: true;
      };
    };
  };
}>;

// Chat message type
export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

// Assessment data type
export interface AssessmentData {
  messages?: ChatMessage[];
  [key: string]: unknown;
}

// Specialist for chat (can be null)
export type SpecialistForChat = Prisma.SpecialistGetPayload<{
  include: {
    user: true;
  };
}> | null;

