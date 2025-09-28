import { NextRequest } from "next/server";
import { getProductsForExplore, getTotalProductCount } from "@/lib/db/queries";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "0");
    const limit = parseInt(searchParams.get("limit") || "20");

    const offset = page * limit;

    // Get products and merchants data
    const products = await getProductsForExplore(limit, offset);

    // Get total count for pagination
    const totalCount = await getTotalProductCount();

    // Create merchants map for the ProductCard component
    const merchantsMap: { [key: string]: any } = {};
    products.forEach((product) => {
      if (!merchantsMap[product.merchantId]) {
        merchantsMap[product.merchantId] = {
          id: product.merchantId,
          name: product.merchantName,
          // Add other merchant fields as needed
        };
      }
    });

    return Response.json({
      products,
      merchants: merchantsMap,
      totalCount,
      hasMore: (page + 1) * limit < totalCount,
    });
  } catch (error) {
    console.error("Error fetching products for explore:", error);
    return Response.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
