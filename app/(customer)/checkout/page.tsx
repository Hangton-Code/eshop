// import Checkout from "@/components/checkout";

import { createStripeSession } from "@/actions/stripe";
import { redirect } from "next/navigation";

// export default function CheckoutPage() {
//   return (
//     <div id="checkout">
//       <Checkout />
//     </div>
//   );
// }

export default async function CheckoutPage() {
  const sessionUrl = await createStripeSession();
  if (!sessionUrl) redirect("/");

  redirect(sessionUrl);
}
