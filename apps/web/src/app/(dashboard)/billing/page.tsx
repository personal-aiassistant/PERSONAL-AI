import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Billing",
};

export default function BillingPage() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center space-y-2">
        <p className="text-lg font-medium">Billing</p>
        <p className="text-sm text-muted-foreground">Coming in Phase 3</p>
      </div>
    </div>
  );
}
