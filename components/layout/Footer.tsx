"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Heart } from "lucide-react";

export function Footer() {
  const t = useTranslations("nav");
  const locale = useLocale();

  return (
    <footer className="bg-white border-t border-gray-200 mt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Heart className="w-5 h-5 text-primary fill-primary" />
            <span className="text-lg font-semibold text-text">MentalCompass</span>
          </div>
          <nav className="flex flex-wrap justify-center gap-6">
            <Link
              href={`/${locale}`}
              className="text-text-light hover:text-primary transition-colors"
            >
              {t("home")}
            </Link>
            <Link
              href={`/${locale}/ai-assistant`}
              className="text-text-light hover:text-primary transition-colors"
            >
              {t("aiAssistant")}
            </Link>
            <Link
              href={`/${locale}/specialists`}
              className="text-text-light hover:text-primary transition-colors"
            >
              {t("specialists")}
            </Link>
            <Link
              href={`/${locale}/blog`}
              className="text-text-light hover:text-primary transition-colors"
            >
              {t("blog")}
            </Link>
          </nav>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 text-center text-text-light text-sm">
          <p>© {new Date().getFullYear()} MentalCompass. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
}

