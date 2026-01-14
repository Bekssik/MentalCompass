"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import {
  MessageCircle,
  Users,
  BookOpen,
  Brain,
  Shield,
  Globe,
} from "lucide-react";

const features = [
  {
    key: "aiAssistant",
    icon: MessageCircle,
    link: "/ai-assistant",
  },
  {
    key: "licensedSpecialists",
    icon: Users,
    link: "/specialists",
  },
  {
    key: "community",
    icon: BookOpen,
    link: "/experiences",
  },
  {
    key: "smartMatching",
    icon: Brain,
    link: "/dashboard",
  },
  {
    key: "anonymity",
    icon: Shield,
    link: null,
  },
  {
    key: "multilingualism",
    icon: Globe,
    link: null,
  },
];

export function FeatureCards() {
  const t = useTranslations("features");
  const locale = useLocale();

  return (
    <section className="py-16 px-4 bg-background-subtle">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            const content = (
              <Card className="h-full hover:shadow-lg transition-shadow">
                <div className="flex flex-col h-full">
                  <Icon className="w-12 h-12 text-primary mb-4" />
                  <h3 className="text-xl font-bold text-text mb-2">
                    {t(`${feature.key}.title`)}
                  </h3>
                  <p className="text-text-secondary flex-grow">
                    {t(`${feature.key}.description`)}
                  </p>
                </div>
              </Card>
            );

            return feature.link ? (
              <Link key={feature.key} href={`/${locale}${feature.link}`}>
                {content}
              </Link>
            ) : (
              <div key={feature.key}>{content}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
}











