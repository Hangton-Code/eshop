"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import ProductCard from "./product-card";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { Merchant } from "@/db/schema";

interface ExploreProduct {
  id: string;
  name: string;
  price: number;
  brand: string;
  covers: any[];
  merchantId: string;
  merchantName: string;
}

export function ExploreSection() {
  const [products, setProducts] = useState<ExploreProduct[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [merchants, setMerchants] = useState<{ [key: string]: Merchant }>({});
  const loadingRef = useRef(false);

  const PRODUCTS_PER_PAGE = 20;

  const loadProducts = useCallback(
    async (pageNum: number = 0, append: boolean = false) => {
      if (loadingRef.current) return;

      loadingRef.current = true;
      try {
        const response = await fetch(
          `/api/products/explore?page=${pageNum}&limit=${PRODUCTS_PER_PAGE}`
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
    []
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
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Explore Products</h2>
        <p className="text-muted-foreground">
          Discover amazing products from our merchants
        </p>
      </div>

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
          <p>You've seen all available products!</p>
        </div>
      )}
    </div>
  );
}
