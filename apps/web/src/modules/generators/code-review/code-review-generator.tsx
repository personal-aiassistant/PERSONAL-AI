"use client";

import { SearchCode } from "lucide-react";
import { GeneratorPageShell } from "../components/generator-page-shell";
import type { FormField } from "../components/generator-form";

const FIELDS: FormField[] = [
  {
    name: "language",
    label: "Programming language",
    placeholder: "e.g., TypeScript, Python, Go, Rust",
    type: "text",
    required: true,
  },
  {
    name: "code",
    label: "Code to review",
    placeholder: "Paste your code here...",
    type: "textarea",
    rows: 12,
    required: true,
  },
  {
    name: "context",
    label: "Context (optional)",
    placeholder: "e.g., This is a REST API handler, auth middleware, database query...",
    type: "textarea",
    rows: 3,
  },
  {
    name: "focusAreas",
    label: "Focus areas (optional)",
    placeholder: "e.g., security, performance, readability, type safety, error handling",
    type: "text",
  },
];

export function CodeReviewGenerator() {
  return (
    <GeneratorPageShell
      type="code-review"
      title="Code Review"
      description="Get a thorough AI-powered code review with actionable suggestions"
      icon={<SearchCode className="w-4 h-4" />}
      fields={FIELDS}
      getTitleFromInput={(input) =>
        `${input.language || "Code"} Review — ${new Date().toLocaleDateString()}`
      }
      model="gpt-4o"
    />
  );
}
