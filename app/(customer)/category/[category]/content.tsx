"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import ProductCard from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import { Merchant } from "@/db/schema";
import { useRouter } from "next/navigation";
import { categories } from "@/components/cms/category-combobox";

interface CategoryProduct {
  id: string;
  name: string;
  price: number;
  brand: string;
  covers: any[];
  merchantId: string;
  merchantName: string;
}

interface CategoryContentProps {
  category: string;
}

export function CategoryContent({ category }: CategoryContentProps) {
  const [products, setProducts] = useState<CategoryProduct[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [merchants, setMerchants] = useState<{ [key: string]: Merchant }>({});
  const loadingRef = useRef(false);
  const router = useRouter();

  const PRODUCTS_PER_PAGE = 20;

  const categoryLabel =
    categories.find((cat) => cat.value === category)?.label || category;

  const loadProducts = useCallback(
    async (pageNum: number = 0, append: boolean = false) => {
      if (loadingRef.current) return;

      loadingRef.current = true;
      try {
        const response = await fetch(
          `/api/products/category/${category}?page=${pageNum}&limit=${PRODUCTS_PER_PAGE}`
        );

        if (response.ok) {
          const data = await response.json();
          const {
            products: newProducts,
            merchants: merchantsMap,
            totalCount,
          } = data;

          if (append) {
            setProducts((prev) => [...prev, ...newProducts]);
          } else {
            setProducts(newProducts);
          }

          setMerchants(merchantsMap);
          setHasMore((pageNum + 1) * PRODUCTS_PER_PAGE < totalCount);
        } else {
          console.error("Failed to load products");
        }
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        loadingRef.current = false;
      }
    },
    [category]
  );

  const loadMore = () => {
    if (!loadingRef.current && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadProducts(nextPage, true);
    }
  };

  useEffect(() => {
    loadProducts(0, false);
  }, [loadProducts]);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => router.push("/")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
        <h1 className="text-4xl font-bold mb-2">{categoryLabel}</h1>
        <p className="text-muted-foreground">
          Browse all products in {categoryLabel}
        </p>
      </div>

      {products.length === 0 && !loadingRef.current && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            No products found in this category yet.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push("/")}
          >
            Explore Other Categories
          </Button>
        </div>
      )}

      {products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={{
                id: product.id,
                name: product.name,
                price: product.price,
                covers: product.covers,
                brand: product.brand,
                merchantId: product.merchantId,
              }}
              merchantMap={{
                [product.merchantId]: {
                  id: product.merchantId,
                  name: product.merchantName,
                  userId: "",
                  pictureUrl: null,
                  bannerUrl: null,
                  description: "",
                  createdAt: new Date(),
                } as Merchant,
              }}
            />
          ))}
        </div>
      )}

      {loadingRef.current && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2 text-muted-foreground">
            Loading products...
          </span>
        </div>
      )}

      {hasMore && !loadingRef.current && products.length > 0 && (
        <div className="flex justify-center py-8">
          <Button onClick={loadMore} size="lg">
            Load More Products
          </Button>
        </div>
      )}

      {!hasMore && products.length > 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>You've seen all products in this category!</p>
        </div>
      )}
    </div>
  );
}
