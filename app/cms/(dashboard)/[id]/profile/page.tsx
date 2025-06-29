import { getMerchantById } from "@/lib/db/queries";
import ProfileManagementPageContent from "./content";
import { notFound } from "next/navigation";

export default async function ProfileManagementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const merchant = await getMerchantById(id);
  if (!merchant) return notFound();

  return <ProfileManagementPageContent merchant={merchant} id={id} />;
}
