"use client";

import { ChevronDown, Sparkles, Zap } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export type AIModel = "gpt-4o" | "gpt-4o-mini" | "gpt-4-turbo" | "gpt-3.5-turbo";

const MODELS: { id: AIModel; label: string; description: string; badge?: string }[] = [
  {
    id: "gpt-4o",
    label: "GPT-4o",
    description: "Most capable, multimodal",
    badge: "Best",
  },
  {
    id: "gpt-4o-mini",
    label: "GPT-4o Mini",
    description: "Fast and affordable",
    badge: "Recommended",
  },
  {
    id: "gpt-4-turbo",
    label: "GPT-4 Turbo",
    description: "Powerful, large context",
  },
  {
    id: "gpt-3.5-turbo",
    label: "GPT-3.5 Turbo",
    description: "Fast, cost-effective",
  },
];

interface ModelSelectorProps {
  model: AIModel;
  onChange: (model: AIModel) => void;
}

export function ModelSelector({ model, onChange }: ModelSelectorProps) {
  const current = MODELS.find((m) => m.id === model) ?? MODELS[1];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          {current.label}
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel className="text-xs">Select model</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {MODELS.map((m) => (
          <DropdownMenuItem
            key={m.id}
            onClick={() => onChange(m.id)}
            className="flex items-start gap-2 py-2"
          >
            <Zap className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{m.label}</span>
                {m.badge && (
                  <Badge variant="secondary" className="text-xs py-0 px-1.5">
                    {m.badge}
                  </Badge>
                )}
                {m.id === model && (
                  <span className="text-xs text-primary ml-auto">✓</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{m.description}</p>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
