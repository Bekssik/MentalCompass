"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { BlogPostWithRelations } from "@/types/prisma";

interface BlogCardProps {
  post: BlogPostWithRelations;
  locale: string;
}

export function BlogCard({ post, locale }: BlogCardProps) {
  return (
    <Link href={`/${locale}/blog/${post.slug}`}>
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full h-48 object-cover rounded-t-lg mb-4"
          />
        )}
        <h3 className="text-xl font-bold text-text mb-2">{post.title}</h3>
        {post.excerpt && (
          <p className="text-text-light mb-4 line-clamp-3">{post.excerpt}</p>
        )}
        <div className="flex justify-between items-center text-sm text-text-light">
          <span>{post.specialist.user.name}</span>
          {post.publishedAt && (
            <span>
              {format(new Date(post.publishedAt), "dd MMM yyyy", {
                locale: ru,
              })}
            </span>
          )}
        </div>
      </Card>
    </Link>
  );
}

