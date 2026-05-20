import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects",
};

export default function ProjectsPage() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center space-y-2">
        <p className="text-lg font-medium">Projects</p>
        <p className="text-sm text-muted-foreground">Coming in Phase 1</p>
      </div>
    </div>
  );
}
