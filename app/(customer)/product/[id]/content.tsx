"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Merchant, Product } from "@/db/schema";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useRouter, useSearchParams } from "next/navigation";
import { Attachment } from "ai";
import Link from "next/link";
import { ShoppingCart, SquareChartGantt } from "lucide-react";
import { RainbowButton } from "@/components/magicui/rainbow-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Markdown } from "@/components/markdown";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { categories } from "@/components/cms/category-combobox";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { addItemToCart } from "@/actions/cart";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";
import { TranslationKey } from "@/lib/i18n/translations";

export function ProductPageContent({
  product,
  merchant,
}: {
  id: string;
  product: Product;
  merchant: Merchant;
}) {
  const searchParams = useSearchParams();
  const query = searchParams.get("query");
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const { t } = useLanguage();

  // Map category values to translation keys
  const getCategoryTranslationKey = (value: string): TranslationKey => {
    const keyMap: Record<string, TranslationKey> = {
      electronics: "electronics",
      apparel: "apparel",
      "home_&_kitchen": "homeKitchen",
      "books_&_media": "booksMedia",
      "sports_&_outdoors": "sportsOutdoors",
      "health_&_household": "healthHousehold",
      "beauty_&_personal_care": "beautyPersonalCare",
      "toys_&_games": "toysGames",
      automotive: "automotive",
      pet_supplies: "petSupplies",
      groceries: "groceries",
      jewelry: "jewelry",
      handmade: "handmade",
      "industrial_&_scientific": "industrialScientific",
      other: "other",
    };
    return keyMap[value] || ("other" as TranslationKey);
  };

  const covers = product.covers as Attachment[];

  const [cartQuantity, setCartQuantity] = useState(1);
  const handleAddToCart = async () => {
    await addItemToCart(product.id, cartQuantity);
    toast.success(t("addedToCart"));
    mutate("cart");
  };

  return (
    <div className="space-y-8">
      {query && (
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                className="hover:cursor-pointer"
                onClick={() => router.back()}
              >
                {t("resultsOf")} &quot;{decodeURIComponent(query)}&quot;
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{product.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )}
      <div className="flex max-lg:flex-col">
        <Carousel className="w-full h-fit lg:max-w-[260px] xl:max-w-xs">
          <CarouselContent>
            {covers.length === 0 && (
              <CarouselItem>
                <div className="aspect-square w-full bg-background flex justify-center items-center rounded-xl border overflow-hidden">
                  <SquareChartGantt width={80} height={80} />
                </div>
              </CarouselItem>
            )}
            {covers.map((cover, index) => (
              <CarouselItem key={index}>
                <div className="rounded-xl border overflow-hidden">
                  <img
                    className="w-full aspect-square object-contain"
                    src={cover.url}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {covers.length > 1 && (
            <>
              <CarouselPrevious />
              <CarouselNext />
            </>
          )}
        </Carousel>

        <div
          className={cn(
            "flex-1 pt-6 lg:pt-4",
            covers.length > 1 ? "lg:pl-20" : "lg:pl-6 xl:pl-10"
          )}
        >
          <p className="text-3xl font-medium">{product.name}</p>
          <p className="text-sm text-muted-foreground leading-loose group">
            {t("from")}{" "}
            <Link
              href={`/merchant/${merchant.id}`}
              className="group-hover:underline"
            >
              {merchant.name}
            </Link>
          </p>
          <p className="text-2xl font-extrabold mt-2">
            {product.price.toLocaleString("en-US", {
              style: "currency",
              currency: "HKD",
            })}
          </p>
          <div className="flex items-center gap-2 mt-6">
            <Input
              value={cartQuantity}
              onChange={(e) => setCartQuantity(Number(e.target.value))}
              min={1}
              className="w-13"
              type="number"
            />
            <RainbowButton onClick={handleAddToCart}>
              {t("addToCart")} <ShoppingCart />
            </RainbowButton>
          </div>

          <Tabs defaultValue="description" className="w-full mt-16">
            <TabsList>
              <TabsTrigger value="description">{t("description")}</TabsTrigger>
              <TabsTrigger value="details">{t("otherDetails")}</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-4">
              <Markdown>{product.description}</Markdown>
            </TabsContent>
            <TabsContent value="details" className="mt-4">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">
                      {t("category")}
                    </TableCell>
                    <TableCell>
                      {t(getCategoryTranslationKey(product.category))}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">{t("brand")}</TableCell>
                    <TableCell>{product.brand}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      {t("manufacturingCountry")}
                    </TableCell>
                    <TableCell>{product.mfgCountry}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      {t("shopInventory")}
                    </TableCell>
                    <TableCell>{product.inventory}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Product Presentation (PPT) Placeholder */}
      <div className="mt-8">
        <p className="text-xl font-semibold mb-3">{t("productPresentation")}</p>
        <div className="w-full rounded-xl border bg-muted/30 p-6 text-muted-foreground">
          <div className="h-56 w-full bg-background/60 rounded-lg border flex items-center justify-center">
            <span className="text-sm">{t("pptPlaceholder")}</span>
          </div>
          <p className="text-xs mt-3">{t("pptTip")}</p>
        </div>
      </div>

      {/* Static Comments Section */}
      <div className="mt-6">
        <p className="text-xl font-semibold mb-3">{t("recentComments")}</p>
        <div className="space-y-6">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage alt="Mia K." />
                  <AvatarFallback>MK</AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <div className="font-medium">Mia K.</div>
                  <div>2 {t("daysAgo")}</div>
                </div>
              </div>
              <div className="text-sm">★★★★★</div>
            </div>
            <p className="mt-3 text-base">
              Matches the photos and feels well‑made. Been using it daily and no
              issues so far. Shipping came a bit earlier than expected.
            </p>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage alt="Daniel C." />
                  <AvatarFallback>DC</AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <div className="font-medium">Daniel C.</div>
                  <div>{t("lastWeek")}</div>
                </div>
              </div>
              <div className="text-sm">★★★★☆</div>
            </div>
            <p className="mt-3 text-base">
              Exactly as described. Good value for money. Packaging was okay —
              nothing fancy, but everything arrived safe.
            </p>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage alt="Aria W." />
                  <AvatarFallback>AW</AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <div className="font-medium">Aria W.</div>
                  <div>3 {t("weeksAgo")}</div>
                </div>
              </div>
              <div className="text-sm">★★★★☆</div>
            </div>
            <p className="mt-3 text-base">
              Setup was straightforward and it worked out of the box. Wish the
              instructions were a bit clearer, but it’s easy enough to figure
              out.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
