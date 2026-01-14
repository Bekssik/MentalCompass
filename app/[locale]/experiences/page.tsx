import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-helpers";
import { ExperiencePost } from "@/components/blog/ExperiencePost";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ExperiencePostAnonymous } from "@/types/prisma";

export default async function ExperiencesPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const session = await getSession();
  let posts: ExperiencePostAnonymous[] = [];
  
  try {
    // Don't include user data for privacy - experience posts are anonymous
    posts = await prisma.experiencePost.findMany({
      where: { published: true },
      select: {
        id: true,
        title: true,
        content: true,
        published: true,
        createdAt: true,
        updatedAt: true,
        userId: true, // Keep userId for ownership checks, but don't expose user object
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (error) {
    // Handle database connection errors gracefully
    console.error("Database connection error:", error);
    posts = [];
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-text">
          Анонимные истории опыта
        </h1>
        <div className="flex gap-4">
          <Link href={`/${locale}/blog`} className="text-primary hover:underline">
            Блог специалистов →
          </Link>
          {session && (
            <Link href={`/${locale}/experiences/new`}>
              <Button>Поделиться историей</Button>
            </Link>
          )}
        </div>
      </div>
      <div className="space-y-6 max-w-4xl">
        {posts.map((post) => (
          <ExperiencePost key={post.id} post={post} locale={locale} />
        ))}
      </div>
      {posts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-text-light">Пока нет опубликованных историй.</p>
        </div>
      )}
    </div>
  );
}

