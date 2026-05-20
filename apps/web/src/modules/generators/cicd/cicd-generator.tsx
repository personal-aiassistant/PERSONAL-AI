"use client";

import { GitBranch } from "lucide-react";
import { GeneratorPageShell } from "../components/generator-page-shell";
import type { FormField } from "../components/generator-form";

const FIELDS: FormField[] = [
  {
    name: "projectName",
    label: "Project name",
    placeholder: "e.g., TaskFlow App",
    type: "text",
    required: true,
  },
  {
    name: "techStack",
    label: "Tech stack",
    placeholder: "e.g., Next.js 15, Node.js API, PostgreSQL",
    type: "text",
    required: true,
  },
  {
    name: "deployTarget",
    label: "Deployment target",
    placeholder: "e.g., Vercel + Railway, AWS ECS, DigitalOcean, Fly.io",
    type: "text",
    required: true,
  },
  {
    name: "ciProvider",
    label: "CI/CD provider",
    placeholder: "e.g., GitHub Actions (default), GitLab CI, Bitbucket",
    type: "text",
  },
  {
    name: "testingFramework",
    label: "Testing framework",
    placeholder: "e.g., Jest, Vitest, Playwright, Cypress",
    type: "text",
  },
  {
    name: "extras",
    label: "Extra requirements",
    placeholder: "e.g., preview deployments, Slack notifications, staging environment",
    type: "textarea",
    rows: 2,
  },
];

export function CicdGenerator() {
  return (
    <GeneratorPageShell
      type="cicd"
      title="CI/CD Generator"
      description="Generate complete CI/CD pipeline configurations"
      icon={<GitBranch className="w-4 h-4" />}
      fields={FIELDS}
      getTitleFromInput={(input) => `${input.projectName || "CI/CD"} — Pipeline Config`}
      model="gpt-4o-mini"
    />
  );
}
