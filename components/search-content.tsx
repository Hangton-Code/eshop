"use client";

import ProductCard from "@/components/product-card";
import { Merchant } from "@/db/schema";
import { useLanguage } from "@/lib/i18n/language-context";

interface SearchProduct {
  id: string;
  name: string;
  price: number;
  brand: string;
  covers: any[];
  merchantId: string;
}

interface SearchContentProps {
  query: string;
  products: SearchProduct[];
  merchantMap: Record<string, Merchant>;
}

export function SearchContent({
  query,
  products,
  merchantMap,
}: SearchContentProps) {
  const { t } = useLanguage();

  return (
    <div className="flex h-screen pt-25 flex-col w-full max-w-[1000px] space-y-8 mx-auto px-10 max-md:pt-20 max-md:px-5">
      <h1 className="text-3xl font-bold">
        {t("searchResultPrefix")}
        {t("searchResultPrefix") && " "}
        &quot;{decodeURIComponent(query)}&quot;
        {t("searchResultSuffix") && " "}
        {t("searchResultSuffix")}
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
