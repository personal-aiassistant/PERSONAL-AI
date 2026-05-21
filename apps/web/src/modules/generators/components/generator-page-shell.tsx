"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useCompletion } from "ai/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { GeneratorForm, type FormField } from "./generator-form";
import { GeneratorOutput } from "./generator-output";
import { GeneratorHistory } from "./generator-history";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthStore } from "@/store/auth-store";

type GeneratorType = "architecture" | "prd" | "api" | "documentation" | "schema" | "docker" | "cicd" | "code-review";

interface GeneratorRecord {
  id: string;
  title: string;
  status: string;
  tokens_used: number | null;
  created_at: string;
  type: string;
  output?: string;
  input?: Record<string, string>;
}

interface GeneratorPageShellProps {
  type: GeneratorType;
  title: string;
  description: string;
  icon: React.ReactNode;
  fields: FormField[];
  getTitleFromInput: (input: Record<string, string>) => string;
  model?: string;
}

export function GeneratorPageShell({
  type,
  title,
  description,
  icon,
  fields,
  getTitleFromInput,
  model = "gpt-4o",
}: GeneratorPageShellProps) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeRecord, setActiveRecord] = useState<GeneratorRecord | null>(null);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);

  const { data: history = [], isLoading: historyLoading } = useQuery<GeneratorRecord[]>({
    queryKey: ["generators", type, user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/generators?type=${type}&limit=20`);
      if (!res.ok) throw new Error("Failed to fetch history");
      const { data } = await res.json();
      return data ?? [];
    },
    enabled: !!user,
  });

  const { completion, complete, isLoading, stop } = useCompletion({
    api: "/api/generators/generate",
    onError: (err) => {
      if (err.message.includes("OPENAI_API_KEY")) {
        setApiKeyMissing(true);
      } else {
        toast.error(err.message ?? "Generation failed");
      }
    },
    onFinish: () => {
      queryClient.invalidateQueries({ queryKey: ["generators", type, user?.id] });
    },
  });

  const handleGenerate = async (formData: Record<string, string>) => {
    if (!user) { toast.error("Please sign in"); return; }
    setApiKeyMissing(false);

    const generatorTitle = getTitleFromInput(formData);

    // Create record in DB
    let generatorId: string | undefined;
    try {
      const res = await fetch("/api/generators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, title: generatorTitle, input: formData }),
      });
      if (res.ok) {
        const { data } = await res.json();
        generatorId = data.id;
        setActiveRecord({ ...data, output: "" });
      }
    } catch {
      // Non-critical — still generate
    }

    await complete("", {
      body: { type, input: formData, generator_id: generatorId, model },
    });
  };

  const handleSelectHistory = (item: GeneratorRecord) => {
    setActiveRecord(item);
  };

  const handleDeleteHistory = async (id: string) => {
    await fetch(`/api/generators/${id}`, { method: "DELETE" });
    queryClient.invalidateQueries({ queryKey: ["generators", type, user?.id] });
    if (activeRecord?.id === id) setActiveRecord(null);
    toast.success("Deleted");
  };

  const outputContent = activeRecord?.id && !isLoading
    ? (activeRecord.output ?? completion)
    : completion;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col h-full -m-6">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border shrink-0">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
        <div>
          <h1 className="text-base font-semibold">{title}</h1>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left: Form + History */}
        <div className="w-72 border-r border-border flex flex-col shrink-0">
          <div className="p-4 border-b border-border">
            {apiKeyMissing && (
              <Alert variant="warning" className="mb-3">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription className="text-xs">
                  <strong>OPENAI_API_KEY</strong> is not configured.
                </AlertDescription>
              </Alert>
            )}
            <GeneratorForm
              fields={fields}
              onSubmit={handleGenerate}
              isGenerating={isLoading}
              submitLabel={`Generate ${title}`}
            />
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            <p className="text-xs font-medium text-muted-foreground mb-2 px-1">Recent generations</p>
            <GeneratorHistory
              items={history}
              activeId={activeRecord?.id ?? null}
              onSelect={handleSelectHistory}
              onDelete={handleDeleteHistory}
              isLoading={historyLoading}
            />
          </div>
        </div>

        {/* Right: Output */}
        <div className="flex-1 min-w-0 p-4 overflow-hidden flex flex-col">
          {outputContent || isLoading ? (
            <GeneratorOutput
              content={outputContent}
              isStreaming={isLoading}
              onRegenerate={() => setActiveRecord(null)}
              className="flex-1"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-2xl mb-4">
                {icon}
              </div>
              <h3 className="text-base font-semibold mb-1">Ready to generate</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Fill in the form and click generate to create your {title.toLowerCase()}.
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
