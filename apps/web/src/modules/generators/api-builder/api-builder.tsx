"use client";

import { PlugZap } from "lucide-react";
import { GeneratorPageShell } from "../components/generator-page-shell";
import type { FormField } from "../components/generator-form";

const FIELDS: FormField[] = [
  {
    name: "apiName",
    label: "API name",
    placeholder: "e.g., TaskFlow REST API",
    type: "text",
    required: true,
  },
  {
    name: "resources",
    label: "Main resources / entities",
    placeholder: "e.g., Users, Projects, Tasks, Comments, Notifications",
    type: "text",
    required: true,
  },
  {
    name: "description",
    label: "API description",
    placeholder: "What does this API do? What are the main use cases?",
    type: "textarea",
    rows: 3,
  },
  {
    name: "authType",
    label: "Authentication type",
    placeholder: "e.g., JWT Bearer tokens, OAuth 2.0, API keys",
    type: "text",
  },
  {
    name: "techStack",
    label: "Backend tech stack",
    placeholder: "e.g., Node.js + Express, NestJS, FastAPI, Django...",
    type: "text",
  },
  {
    name: "specialRequirements",
    label: "Special requirements",
    placeholder: "e.g., rate limiting, file uploads, webhooks, real-time...",
    type: "textarea",
    rows: 2,
  },
];

export function ApiBuilder() {
  return (
    <GeneratorPageShell
      type="api"
      title="API Builder"
      description="Generate a complete REST API specification with examples"
      icon={<PlugZap className="w-4 h-4" />}
      fields={FIELDS}
      getTitleFromInput={(input) => `${input.apiName || "API"} — Specification`}
      model="gpt-4o"
    />
  );
}
