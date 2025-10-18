import {
  getProductsByCategory,
  getTotalProductCountByCategory,
} from "@/lib/db/queries";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { category: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "0");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = page * limit;

    const { category } = params;

    const [products, totalCount] = await Promise.all([
      getProductsByCategory(category, limit, offset),
      getTotalProductCountByCategory(category),
    ]);

    // Create a map of merchants for easier lookup
    const merchantsMap: { [key: string]: any } = {};
    products.forEach((product) => {
      merchantsMap[product.merchantId] = {
        id: product.merchantId,
        name: product.merchantName,
      };
    });

    return NextResponse.json({
      products,
      merchants: merchantsMap,
      totalCount,
      page,
      limit,
    });
  } catch (error) {
    console.error("Error fetching products by category:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
