import { CategoryContent } from "./content";

export default function CategoryPage({
  params,
}: {
  params: { category: string };
}) {
  return <CategoryContent category={params.category} />;
}
