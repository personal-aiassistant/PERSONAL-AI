"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface WorkspaceData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  avatar_url: string | null;
  my_role: string;
}

interface FormValues {
  name: string;
  description: string;
}

interface WorkspaceSettingsFormProps {
  workspace: WorkspaceData;
}

export function WorkspaceSettingsForm({ workspace }: WorkspaceSettingsFormProps) {
  const queryClient = useQueryClient();
  const canEdit = ["owner", "admin"].includes(workspace.my_role);
  const [isDirty, setIsDirty] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
    defaultValues: { name: workspace.name, description: workspace.description ?? "" },
  });

  const nameValue = watch("name");

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await fetch(`/api/workspaces/${workspace.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update workspace");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace", workspace.id] });
      queryClient.invalidateQueries({ queryKey: ["workspace-default"] });
      toast.success("Workspace updated");
      setIsDirty(false);
    },
    onError: () => toast.error("Failed to update workspace"),
  });

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))} onChange={() => setIsDirty(true)} className="space-y-6">
      {/* Avatar */}
      <div className="flex items-center gap-4">
        <Avatar className="w-14 h-14">
          <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
            {nameValue?.slice(0, 2).toUpperCase() ?? "WS"}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">{nameValue || "Workspace"}</p>
          <p className="text-xs text-muted-foreground">/{workspace.slug}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Workspace name *</Label>
          <Input
            id="name"
            disabled={!canEdit}
            {...register("name", { required: "Name is required", minLength: { value: 2, message: "Min 2 characters" } })}
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="What is this workspace for?"
            rows={3}
            disabled={!canEdit}
            {...register("description")}
          />
        </div>
      </div>

      {canEdit && (
        <div className="flex justify-end">
          <Button type="submit" disabled={mutation.isPending || !isDirty} size="sm">
            {mutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : "Save changes"}
          </Button>
        </div>
      )}
    </form>
  );
}
