"use client";

import { Container } from "lucide-react";
import { GeneratorPageShell } from "../components/generator-page-shell";
import type { FormField } from "../components/generator-form";

const FIELDS: FormField[] = [
  {
    name: "projectName",
    label: "Project name",
    placeholder: "e.g., my-saas-app",
    type: "text",
    required: true,
  },
  {
    name: "services",
    label: "Services to containerize",
    placeholder: "e.g., Next.js frontend, Node.js API, PostgreSQL, Redis, Nginx",
    type: "text",
    required: true,
  },
  {
    name: "techStack",
    label: "Tech stack details",
    placeholder: "e.g., Node.js 20, Next.js 15, PostgreSQL 16",
    type: "text",
  },
  {
    name: "environment",
    label: "Target environment",
    placeholder: "e.g., production on AWS ECS, local development, VPS",
    type: "text",
  },
  {
    name: "extras",
    label: "Extra requirements",
    placeholder: "e.g., SSL termination, health checks, volumes for uploads",
    type: "textarea",
    rows: 2,
  },
];

export function DockerGenerator() {
  return (
    <GeneratorPageShell
      type="docker"
      title="Docker Generator"
      description="Generate Dockerfile and docker-compose configs"
      icon={<Container className="w-4 h-4" />}
      fields={FIELDS}
      getTitleFromInput={(input) => `${input.projectName || "Docker"} — Container Config`}
      model="gpt-4o-mini"
    />
  );
}
