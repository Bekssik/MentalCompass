"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function Hero() {
  const t = useTranslations("hero");
  const locale = useLocale();

  return (
    <section className="relative bg-gradient-to-b from-primary/5 to-white py-20 px-4">
      <div className="container mx-auto max-w-4xl text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text mb-6">
          {t("title")}
        </h1>
        <p className="text-lg md:text-xl text-text-secondary mb-10 max-w-2xl mx-auto">
          {t("subtitle")}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href={`/${locale}/register`}>
            <Button>{t("startButton")}</Button>
          </Link>
          <Link href={`/${locale}/ai-assistant`}>
            <Button variant="outline">{t("aiAssistantButton")}</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}











