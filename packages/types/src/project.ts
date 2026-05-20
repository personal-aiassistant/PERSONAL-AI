export type ProjectStatus = "active" | "archived" | "draft";

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  workspace_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}
