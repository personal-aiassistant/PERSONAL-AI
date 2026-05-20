import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center space-y-2">
        <p className="text-lg font-medium">Settings</p>
        <p className="text-sm text-muted-foreground">Coming soon</p>
      </div>
    </div>
  );
}
