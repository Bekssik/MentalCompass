import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

export default async function BlogPostPage({
  params: { slug, locale },
}: {
  params: { slug: string; locale: string };
}) {
  const post = await prisma.blogPost.findUnique({
    where: { slug },
    include: {
      specialist: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!post || !post.published) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <article className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-text mb-4">{post.title}</h1>
        <div className="flex items-center gap-4 text-text-light mb-8">
          <span>{post.specialist.user.name}</span>
          {post.publishedAt && (
            <span>
              {format(new Date(post.publishedAt), "dd MMMM yyyy", {
                locale: ru,
              })}
            </span>
          )}
        </div>
        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full h-96 object-cover rounded-lg mb-8"
          />
        )}
        <div
          className="prose prose-lg max-w-none text-text"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </div>
  );
}











