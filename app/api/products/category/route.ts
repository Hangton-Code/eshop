import { categories } from "@/components/cms/category-combobox";
import {
  getProductsByCategory,
  getTotalProductCountByCategory,
} from "@/lib/db/queries";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const categoriesAvailable = [
  "electronics",
  "apparel",
  "home_&_kitchen",
  "books_&_media",
  "sports_&_outdoors",
  "health_&_household",
  "beauty_&_personal_care",
  "toys_&_games",
  "automotive",
  "pet_supplies",
  "groceries",
  "jewelry",
  "handmade",
  "industrial_&_scientific",
  "other",
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const category = searchParams.get("category");
    if (!category || !categoriesAvailable.includes(category)) throw new Error();

    const page = parseInt(searchParams.get("page") || "0");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = page * limit;

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
