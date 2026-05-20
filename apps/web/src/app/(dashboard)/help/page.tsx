import type { Metadata } from "next";
import { HelpContent } from "@/modules/help/help-content";

export const metadata: Metadata = { title: "Help & Resources — CodeForge AI" };

export default function HelpPage() {
  return <HelpContent />;
}
