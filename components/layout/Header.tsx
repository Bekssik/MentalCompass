"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Heart, Globe } from "lucide-react";
import { LanguageSelector } from "./LanguageSelector";
import { useSession, signOut } from "next-auth/react";

export function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const { data: session } = useSession();

  const localeLabels: Record<string, string> = {
    kz: "KZ",
    ru: "RU",
    en: "EN",
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center space-x-2">
            <Heart className="w-6 h-6 text-primary fill-primary" />
            <span className="text-xl font-semibold text-text">MentalCompass</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href={`/${locale}`}
              className="text-text hover:text-primary transition-colors"
            >
              {t("home")}
            </Link>
            <Link
              href={`/${locale}/ai-assistant`}
              className="text-text hover:text-primary transition-colors"
            >
              {t("aiAssistant")}
            </Link>
            <Link
              href={`/${locale}/specialists`}
              className="text-text hover:text-primary transition-colors"
            >
              {t("specialists")}
            </Link>
            <Link
              href={`/${locale}/blog`}
              className="text-text hover:text-primary transition-colors"
            >
              {t("blog")}
            </Link>
            <LanguageSelector />
            {session ? (
              <>
                <Link
                  href={`/${locale}/dashboard`}
                  className="text-text hover:text-primary transition-colors"
                >
                  {t("dashboard")}
                </Link>
                <Button
                  variant="outline"
                  onClick={() => signOut({ callbackUrl: `/${locale}` })}
                >
                  {t("logout")}
                </Button>
              </>
            ) : (
              <Link href={`/${locale}/login`}>
                <Button>{t("login")}</Button>
              </Link>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <LanguageSelector />
            {session ? (
              <Link href={`/${locale}/dashboard`}>
                <Button variant="outline" className="text-sm px-4 py-2">
                  {t("dashboard")}
                </Button>
              </Link>
            ) : (
              <Link href={`/${locale}/login`}>
                <Button className="text-sm px-4 py-2">{t("login")}</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}











