import { Merchant } from "@/db/schema";
import { getMerchantsByIds, searchProductsByText } from "@/lib/db/queries";
import { SearchContent } from "@/components/search-content";

export const dynamic = "force-dynamic";

export default async function ProductSearchingPage({
  params,
}: {
  params: Promise<{ query: string }>;
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
    <SearchContent
      query={query}
      products={products}
      merchantMap={merchantMap}
    />
  );
}
