import { CategoryContent } from "./content";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;

  return <CategoryContent category={category} />;
}
