"use client";

import { Server } from "lucide-react";
import { GeneratorPageShell } from "../components/generator-page-shell";
import type { FormField } from "../components/generator-form";

const FIELDS: FormField[] = [
  {
    name: "projectName",
    label: "Project name",
    placeholder: "e.g., TaskFlow SaaS Platform",
    type: "text",
    required: true,
  },
  {
    name: "description",
    label: "Project description",
    placeholder: "Describe what your project does, main features, and goals...",
    type: "textarea",
    rows: 4,
    required: true,
  },
  {
    name: "techPreferences",
    label: "Tech preferences (optional)",
    placeholder: "e.g., Next.js, PostgreSQL, Redis, AWS...",
    type: "text",
  },
  {
    name: "scale",
    label: "Expected scale",
    placeholder: "e.g., 100 users, 100k users, enterprise",
    type: "text",
  },
  {
    name: "constraints",
    label: "Constraints or requirements",
    placeholder: "e.g., must be GDPR compliant, budget constraints, specific cloud provider...",
    type: "textarea",
    rows: 3,
  },
];

export function ArchitectureGenerator() {
  return (
    <GeneratorPageShell
      type="architecture"
      title="Architecture Generator"
      description="Generate a complete system architecture for your project"
      icon={<Server className="w-4 h-4" />}
      fields={FIELDS}
      getTitleFromInput={(input) => `${input.projectName || "Architecture"} — System Design`}
      model="gpt-4o"
    />
  );
}
