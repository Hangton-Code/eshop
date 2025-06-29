import { PageContent } from "./content";

export default async function OrderManagementPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  return <PageContent id={id} />;
}
