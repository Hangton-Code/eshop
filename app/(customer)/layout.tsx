import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { LanguageProvider } from "@/lib/i18n/language-context";

export default async function CustomerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <LanguageProvider>
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <div className="w-full">
          <SiteHeader />
          {children}
        </div>
      </SidebarProvider>
    </LanguageProvider>
  );
}
