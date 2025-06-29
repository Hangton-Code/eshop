import { PageContent } from "./content";

export default async function OrderManagementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PageContent id={id} />;
}
