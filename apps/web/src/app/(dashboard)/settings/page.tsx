import type { Metadata } from "next";
import { SettingsContent } from "@/modules/settings/components/settings-content";

export const metadata: Metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return <SettingsContent />;
}
