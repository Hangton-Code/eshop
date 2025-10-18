import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { GoogleTranslateScript } from "@/components/google-translate";

export default async function CustomerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <div className="w-full">
        <SiteHeader />
        {children}
      </div>
      <GoogleTranslateScript />
    </SidebarProvider>
  );
}
