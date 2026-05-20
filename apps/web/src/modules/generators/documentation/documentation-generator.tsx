"use client";

import { BookOpen } from "lucide-react";
import { GeneratorPageShell } from "../components/generator-page-shell";
import type { FormField } from "../components/generator-form";

const FIELDS: FormField[] = [
  {
    name: "projectName",
    label: "Project name",
    placeholder: "e.g., TaskFlow SaaS App",
    type: "text",
    required: true,
  },
  {
    name: "description",
    label: "Project description",
    placeholder: "What does this project do? What problem does it solve?",
    type: "textarea",
    rows: 3,
    required: true,
  },
  {
    name: "techStack",
    label: "Tech stack",
    placeholder: "e.g., Next.js, Node.js, PostgreSQL, Redis, Docker",
    type: "text",
  },
  {
    name: "targetAudience",
    label: "Target audience",
    placeholder: "e.g., developers integrating the API, end users, team members",
    type: "text",
  },
  {
    name: "features",
    label: "Key features",
    placeholder: "List the main features to document (one per line)...",
    type: "textarea",
    rows: 4,
  },
  {
    name: "extras",
    label: "Extra sections needed",
    placeholder: "e.g., contributing guide, deployment, API reference, troubleshooting",
    type: "text",
  },
];

export function DocumentationGenerator() {
  return (
    <GeneratorPageShell
      type="documentation"
      title="Documentation Generator"
      description="Generate comprehensive project documentation and README"
      icon={<BookOpen className="w-4 h-4" />}
      fields={FIELDS}
      getTitleFromInput={(input) => `${input.projectName || "Docs"} — Documentation`}
      model="gpt-4o"
    />
  );
}
