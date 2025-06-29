import { PageContent } from "./content";

export default async function ProductManagementPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;

  return <PageContent id={id} />;
}
