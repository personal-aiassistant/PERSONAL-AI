"use client";

import { useForm } from "react-hook-form";
import { Loader2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface FormField {
  name: string;
  label: string;
  placeholder: string;
  type: "text" | "textarea";
  required?: boolean;
  rows?: number;
}

interface GeneratorFormProps {
  fields: FormField[];
  onSubmit: (data: Record<string, string>) => void;
  isGenerating: boolean;
  submitLabel?: string;
}

export function GeneratorForm({ fields, onSubmit, isGenerating, submitLabel = "Generate" }: GeneratorFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<Record<string, string>>();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {fields.map((field) => (
        <div key={field.name} className="space-y-1.5">
          <Label htmlFor={field.name}>{field.label}{field.required && " *"}</Label>
          {field.type === "textarea" ? (
            <Textarea
              id={field.name}
              placeholder={field.placeholder}
              rows={field.rows ?? 4}
              {...register(field.name, { required: field.required ? `${field.label} is required` : false })}
            />
          ) : (
            <Input
              id={field.name}
              placeholder={field.placeholder}
              {...register(field.name, { required: field.required ? `${field.label} is required` : false })}
            />
          )}
          {errors[field.name] && (
            <p className="text-xs text-destructive">{errors[field.name]?.message as string}</p>
          )}
        </div>
      ))}
      <Button type="submit" disabled={isGenerating} className="w-full">
        {isGenerating ? (
          <><Loader2 className="w-4 h-4 animate-spin" />Generating...</>
        ) : (
          <><Wand2 className="w-4 h-4" />{submitLabel}</>
        )}
      </Button>
    </form>
  );
}
