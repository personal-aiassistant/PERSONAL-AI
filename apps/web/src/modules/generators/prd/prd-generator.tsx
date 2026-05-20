"use client";

import { FileText } from "lucide-react";
import { GeneratorPageShell } from "../components/generator-page-shell";
import type { FormField } from "../components/generator-form";

const FIELDS: FormField[] = [
  {
    name: "productName",
    label: "Product name",
    placeholder: "e.g., TaskFlow — Team Productivity App",
    type: "text",
    required: true,
  },
  {
    name: "problemStatement",
    label: "Problem to solve",
    placeholder: "What problem does your product solve? Who has this problem?",
    type: "textarea",
    rows: 3,
    required: true,
  },
  {
    name: "targetUsers",
    label: "Target users",
    placeholder: "e.g., Remote teams, startup founders, freelance developers...",
    type: "text",
    required: true,
  },
  {
    name: "coreFeatures",
    label: "Core features",
    placeholder: "List the main features you want to build (one per line)...",
    type: "textarea",
    rows: 4,
  },
  {
    name: "successMetrics",
    label: "Success metrics",
    placeholder: "e.g., 1000 users in 3 months, 20% conversion rate...",
    type: "text",
  },
  {
    name: "timeline",
    label: "Timeline / launch date",
    placeholder: "e.g., MVP in 2 months, launch Q3 2026",
    type: "text",
  },
];

export function PrdGenerator() {
  return (
    <GeneratorPageShell
      type="prd"
      title="PRD Generator"
      description="Generate a comprehensive Product Requirements Document"
      icon={<FileText className="w-4 h-4" />}
      fields={FIELDS}
      getTitleFromInput={(input) => `${input.productName || "Product"} — PRD`}
      model="gpt-4o"
    />
  );
}
