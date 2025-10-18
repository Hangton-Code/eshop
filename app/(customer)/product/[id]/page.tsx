import { getProductById } from "@/lib/db/queries";
import { ProductPageContent } from "./content";
import { notFound } from "next/navigation";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await getProductById(id);
  if (!product) return notFound();

  return (
    <div className="flex h-screen pt-25 flex-col w-full max-w-[1000px] space-y-8 mx-auto px-10 max-md:pt-20 max-md:px-5">
      <ProductPageContent
        id={id}
        product={product.product}
        merchant={product.merchant}
      />
    </div>
  );
}
