import type { Metadata } from "next";
import { BillingContent } from "@/modules/billing/components/billing-content";

export const metadata: Metadata = {
  title: "Billing",
};

export default function BillingPage() {
  return <BillingContent />;
}
