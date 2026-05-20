-- ============================================================
-- CodeForge AI — Row Level Security Policies
-- Migration: 002_rls_policies
-- Created: 2026-05-20
-- ============================================================

-- ============================================================
-- ENABLE RLS ON ALL TABLES (security is never optional)
-- ============================================================
ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages          ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PROFILES POLICIES
-- ============================================================

-- Users can view their own profile
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can view profiles of workspace members (needed for collaboration)
CREATE POLICY "profiles_select_workspace_members"
  ON public.profiles FOR SELECT
  USING (
    id IN (
      SELECT wm.user_id
      FROM public.workspace_members wm
      WHERE wm.workspace_id IN (
        SELECT workspace_id
        FROM public.workspace_members
        WHERE user_id = auth.uid()
      )
    )
  );

-- ============================================================
-- WORKSPACES POLICIES
-- ============================================================

-- Members can view workspaces they belong to
CREATE POLICY "workspaces_select_members"
  ON public.workspaces FOR SELECT
  USING (
    id IN (
      SELECT workspace_id
      FROM public.workspace_members
      WHERE user_id = auth.uid()
    )
  );

-- Only owner can update workspace
CREATE POLICY "workspaces_update_owner"
  ON public.workspaces FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Authenticated users can create workspaces
CREATE POLICY "workspaces_insert_authenticated"
  ON public.workspaces FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Only owner can delete workspace
CREATE POLICY "workspaces_delete_owner"
  ON public.workspaces FOR DELETE
  USING (owner_id = auth.uid());

-- ============================================================
-- WORKSPACE_MEMBERS POLICIES
-- ============================================================

-- Members can view other members of same workspace
CREATE POLICY "workspace_members_select"
  ON public.workspace_members FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id
      FROM public.workspace_members
      WHERE user_id = auth.uid()
    )
  );

-- Workspace owner/admin can add members
CREATE POLICY "workspace_members_insert_admin"
  ON public.workspace_members FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id
      FROM public.workspace_members
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );

-- Workspace owner/admin can update member roles
CREATE POLICY "workspace_members_update_admin"
  ON public.workspace_members FOR UPDATE
  USING (
    workspace_id IN (
      SELECT workspace_id
      FROM public.workspace_members
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );

-- Owner/admin can remove members; members can remove themselves
CREATE POLICY "workspace_members_delete"
  ON public.workspace_members FOR DELETE
  USING (
    user_id = auth.uid()
    OR workspace_id IN (
      SELECT workspace_id
      FROM public.workspace_members
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );

-- ============================================================
-- PROJECTS POLICIES
-- ============================================================

-- Workspace members can view projects
CREATE POLICY "projects_select_members"
  ON public.projects FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id
      FROM public.workspace_members
      WHERE user_id = auth.uid()
    )
  );

-- Workspace members (not viewer) can create projects
CREATE POLICY "projects_insert_members"
  ON public.projects FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id
      FROM public.workspace_members
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin', 'member')
    )
    AND auth.uid() = created_by
  );

-- Project creator or workspace admin can update
CREATE POLICY "projects_update"
  ON public.projects FOR UPDATE
  USING (
    created_by = auth.uid()
    OR workspace_id IN (
      SELECT workspace_id
      FROM public.workspace_members
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );

-- Project creator or workspace admin can delete
CREATE POLICY "projects_delete"
  ON public.projects FOR DELETE
  USING (
    created_by = auth.uid()
    OR workspace_id IN (
      SELECT workspace_id
      FROM public.workspace_members
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );

-- ============================================================
-- MESSAGES POLICIES
-- ============================================================

-- Users can view their own messages
CREATE POLICY "messages_select_own"
  ON public.messages FOR SELECT
  USING (user_id = auth.uid());

-- Users can create their own messages
CREATE POLICY "messages_insert_own"
  ON public.messages FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own messages
CREATE POLICY "messages_delete_own"
  ON public.messages FOR DELETE
  USING (user_id = auth.uid());
