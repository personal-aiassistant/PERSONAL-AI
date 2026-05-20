"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, FolderKanban, Search, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ProjectCard } from "./project-card";
import { CreateProjectDialog } from "./create-project-dialog";
import { useAuthStore } from "@/store/auth-store";
import type { Project } from "@codeforge/types";

async function fetchProjects(): Promise<Project[]> {
  const res = await fetch("/api/projects");
  if (!res.ok) throw new Error("Failed to fetch projects");
  const { data } = await res.json();
  return data ?? [];
}

async function fetchWorkspaceId(): Promise<string | null> {
  const res = await fetch("/api/workspaces/default");
  if (!res.ok) return null;
  const { data } = await res.json();
  return data?.id ?? null;
}

export function ProjectsContent() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects", user?.id],
    queryFn: fetchProjects,
    enabled: !!user,
  });

  const { data: workspaceId } = useQuery({
    queryKey: ["workspace-default", user?.id],
    queryFn: fetchWorkspaceId,
    enabled: !!user,
  });

  const filtered = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const handleArchive = async (id: string) => {
    toast.promise(
      fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "archived" }),
      }).then(() => queryClient.invalidateQueries({ queryKey: ["projects"] })),
      { loading: "Archiving...", success: "Project archived", error: "Failed to archive" }
    );
  };

  const handleDelete = async (id: string) => {
    toast.promise(
      fetch(`/api/projects/${id}`, { method: "DELETE" }).then(() =>
        queryClient.invalidateQueries({ queryKey: ["projects"] })
      ),
      { loading: "Deleting...", success: "Project deleted", error: "Failed to delete" }
    );
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };
  const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Projects</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {projects.length} project{projects.length !== 1 ? "s" : ""} in your workspace
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4" />
          New project
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="icon">
          <SlidersHorizontal className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-[108px] rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-lg p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <FolderKanban className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="font-medium">
            {search ? "No projects match your search" : "No projects yet"}
          </p>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            {search
              ? "Try a different search term"
              : "Create your first project to get started"}
          </p>
          {!search && (
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="w-4 h-4" />
              Create project
            </Button>
          )}
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filtered.map((project) => (
            <motion.div key={project.id} variants={item}>
              <ProjectCard
                project={project}
                onArchive={handleArchive}
                onDelete={handleDelete}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      <CreateProjectDialog
        open={createOpen}
        workspaceId={workspaceId ?? ""}
        onOpenChange={setCreateOpen}
        onCreated={() => queryClient.invalidateQueries({ queryKey: ["projects"] })}
      />
    </motion.div>
  );
}
