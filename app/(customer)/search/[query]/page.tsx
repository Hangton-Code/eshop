import ProductCard from "@/components/product-card";
import { Merchant } from "@/db/schema";
import { getMerchantsByIds, searchProductsByText } from "@/lib/db/queries";

export default async function ProductSearchingPage({
  params,
}: {
  params: { query: string };
}) {
  const { query } = await params;

  const products = await searchProductsByText(query);

  const merchantIds = [
    ...new Set(products.map((product) => product.merchantId)),
  ];
  const merchants = await getMerchantsByIds(merchantIds);
  const merchantMap = merchants.reduce((acc, merchant) => {
    acc[merchant.id] = merchant;
    return acc;
  }, {} as Record<string, Merchant>);

  return (
    <div className="flex h-screen pt-25 flex-col w-full max-w-[1000px] space-y-8 mx-auto px-10 max-md:pt-20 max-md:px-5">
      <h1 className="text-3xl font-bold">
        Result of searching "{decodeURIComponent(query)}"
      </h1>
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            merchantMap={merchantMap}
            query={query}
          />
        ))}
      </div>
    </div>
  );
}
