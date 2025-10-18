import { Separator } from "@/components/ui/separator";
import { getMerchantById, getProductsByMerchantId } from "@/lib/db/queries";
import { Building2 } from "lucide-react";
import { notFound } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductCard from "@/components/product-card";
import { Attachment } from "ai";

export const dynamic = "force-dynamic";

export default async function MerchantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const merchant = await getMerchantById(id);
  if (!merchant) return notFound();

  const products = await getProductsByMerchantId(id);

  return (
    <div className="flex  pb-25  pt-25 flex-col w-full max-w-[1000px] space-y-8 mx-auto px-10 max-md:pt-20 max-md:px-5">
      {merchant.bannerUrl ? (
        <img
          className="w-full aspect-[1235/338] object-cover rounded-md border"
          src={merchant.bannerUrl}
          alt={"banner"}
        />
      ) : (
        <div className="w-full h-64 bg-gray-100 rounded-md"></div>
      )}

      <div className="flex gap-10 max-xl:flex-col">
        <div className="xl:space-y-4 space-y-8">
          {merchant.pictureUrl ? (
            <img
              className="w-40 h-40 rounded-full mx-auto"
              src={merchant.pictureUrl}
              alt={"profilePicture"}
            />
          ) : (
            <div className="w-40 h-40 rounded-full">
              <Building2 />
            </div>
          )}

          <p className="text-center text-xl font-bold">{merchant.name}</p>
          <Separator />
        </div>
        <div className="space-y-8 xl:flex-1">
          <p>{merchant.description}</p>
          <Tabs defaultValue="products">
            <TabsList>
              <TabsTrigger value="products">Products</TabsTrigger>
            </TabsList>
            <TabsContent value="products">
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-2">
                {products.map((product) => {
                  return (
                    <ProductCard
                      key={product.id}
                      product={
                        product as {
                          id: string;
                          name: string;
                          price: number;
                          covers: Attachment[];
                          brand: string;
                          merchantId: string;
                        }
                      }
                      merchantMap={{ [merchant.id]: merchant }}
                    />
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
