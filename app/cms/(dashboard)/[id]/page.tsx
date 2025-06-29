import {
  getNumberOfCustomersByMerchantId,
  getTotalRevenueByMerchantId,
} from "@/lib/db/queries";
import { OverviewPageContent } from "./content";

export default async function OverviewPage({
  params,
}: {
  params: {
    id: string;
  };
}) {
  const { id } = await params;

  // count revenue figure
  const revenue = (await getTotalRevenueByMerchantId(id))[0];
  const customerCount = await getNumberOfCustomersByMerchantId(id);

  return (
    <OverviewPageContent
      id={id}
      revenue={{
        grossTotal: revenue ? revenue.grossTotal : 0,
        netTotal: revenue ? revenue.netTotal : 0,
      }}
      customerCount={customerCount}
    />
  );
}
