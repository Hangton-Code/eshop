"use client";

import * as React from "react";
import { WalletMinimal, Languages } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/language-context";
import { Language } from "@/lib/i18n/translations";

const languages = [
  { code: "en" as Language, name: "English", flag: "🇺🇸" },
  { code: "zh-CN" as Language, name: "简体中文", flag: "🇨🇳" },
  { code: "zh-TW" as Language, name: "繁體中文", flag: "🇭🇰" },
];

export function SidebarSecondary() {
  const { language, setLanguage, t } = useLanguage();

  const currentLanguage =
    languages.find((lang) => lang.code === language) || languages[0];

  return (
    <SidebarGroup className="mt-auto">
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <Languages />
                  <span>
                    {currentLanguage.flag} {currentLanguage.name}
                  </span>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="right"
                align="end"
                className="max-h-[400px] overflow-y-auto"
              >
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className="cursor-pointer"
                  >
                    <span className="mr-2">{lang.flag}</span>
                    {lang.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/orders">
                <WalletMinimal />
                <span>{t("myOrders")}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
