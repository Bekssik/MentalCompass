import { prisma } from "@/lib/prisma";
import { BlogCard } from "@/components/blog/BlogCard";
import Link from "next/link";
import { BlogPostWithRelations } from "@/types/prisma";

export default async function BlogPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  let posts: BlogPostWithRelations[] = [];
  
  try {
    posts = await prisma.blogPost.findMany({
      where: { published: true },
      include: {
        specialist: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        publishedAt: "desc",
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
        <h1 className="text-3xl font-bold text-text">Блог специалистов</h1>
        <Link href={`/${locale}/experiences`} className="text-primary hover:underline">
          Анонимные истории →
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <BlogCard key={post.id} post={post} locale={locale} />
        ))}
      </div>
      {posts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-text-light">Пока нет опубликованных статей.</p>
        </div>
      )}
    </div>
  );
}

