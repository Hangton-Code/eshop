import { getMerchantsByUserId } from "@/lib/db/queries";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CreateShopInHome } from "@/components/cms/create-shop-sheet";
import { myDayJS } from "@/lib/dayjs";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CMSHomePage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  // getMerchantByUserId
  const merchants = await getMerchantsByUserId(userId);

  const user = await currentUser();

  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="w-[500px]">
        <CardHeader>
          <CardTitle>Welcome Back, {user?.firstName}</CardTitle>
          <CardDescription>Select your shop to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-36 overflow-y-scroll pr-2">
            {merchants.map((merchant) => (
              <Link key={merchant.id} href={`/cms/${merchant.id}`}>
                <div className="group border relative border-border transition-colors w-full p-3 bg-gradient-to-br from-neutral-50  to-neutral-100 hover:to-neutral-200 rounded">
                  <h1 className="text-lg font-medium">{merchant.name}</h1>
                  <p className="text-xs text-muted-foreground">
                    Created {myDayJS().from(myDayJS(merchant.createdAt))}
                  </p>
                  <div className="transition-opacity h-full absolute right-3 top-0 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <ChevronRight className=" " />
                  </div>
                </div>
              </Link>
            ))}

            {merchants.length === 0 && (
              <p className="text-center">
                You have no shop yet. Create one now.
              </p>
            )}
          </ScrollArea>
        </CardContent>
        <CardFooter>
          <CreateShopInHome />
        </CardFooter>
      </Card>
    </div>
  );
}
