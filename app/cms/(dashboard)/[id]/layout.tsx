import { DashboardSidebar } from "@/components/cms/dashboard-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getMerchantsByUserId } from "@/lib/db/queries";
import { auth, currentUser } from "@clerk/nextjs/server";

export default async function CMSDashboardLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return <></>;

  const merchants = await getMerchantsByUserId(userId);

  if (merchants.filter((merchant) => merchant.id === id).length === 0) {
    throw new Error("Merchant not found");
  }

  const shops = merchants.map((merchant) => ({
    name: merchant.name,
    profilePictureUrl: merchant.pictureUrl,
    id: merchant.id,
  }));

  const user = await currentUser();
  if (!user) return <></>;
  const userObj = {
    name: user.fullName,
    email: user?.emailAddresses[0].emailAddress,
    imageUrl: user?.imageUrl,
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <DashboardSidebar merchantId={id} shops={shops} user={userObj} />
      <SidebarInset>
        <div className="w-full">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
