"use client";

import { Database } from "lucide-react";
import { GeneratorPageShell } from "../components/generator-page-shell";
import type { FormField } from "../components/generator-form";

const FIELDS: FormField[] = [
  {
    name: "projectName",
    label: "Project name",
    placeholder: "e.g., E-commerce Platform",
    type: "text",
    required: true,
  },
  {
    name: "entities",
    label: "Main entities / tables",
    placeholder: "e.g., Users, Products, Orders, Reviews, Categories",
    type: "text",
    required: true,
  },
  {
    name: "description",
    label: "Project description",
    placeholder: "Describe the business domain and relationships between entities...",
    type: "textarea",
    rows: 3,
  },
  {
    name: "dbType",
    label: "Database type",
    placeholder: "e.g., PostgreSQL (default), MySQL, MongoDB",
    type: "text",
  },
  {
    name: "features",
    label: "Special features",
    placeholder: "e.g., soft delete, multi-tenancy, audit logs, full-text search",
    type: "text",
  },
];

export function SchemaGenerator() {
  return (
    <GeneratorPageShell
      type="schema"
      title="Schema Generator"
      description="Generate a complete database schema with TypeScript types"
      icon={<Database className="w-4 h-4" />}
      fields={FIELDS}
      getTitleFromInput={(input) => `${input.projectName || "Schema"} — Database Design`}
      model="gpt-4o"
    />
  );
}
