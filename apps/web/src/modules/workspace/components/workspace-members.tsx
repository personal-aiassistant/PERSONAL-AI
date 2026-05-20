"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Crown, Shield, User, MoreHorizontal, UserMinus, Copy, Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

interface Member {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  role: "owner" | "admin" | "member" | "viewer";
  created_at: string;
}

interface PendingInvite {
  id: string;
  email: string;
  role: string;
  token: string;
  expires_at: string;
  invited_by_name: string;
  created_at: string;
}

const roleIcons = {
  owner: Crown,
  admin: Shield,
  member: User,
  viewer: User,
};

const roleColors = {
  owner: "text-amber-500",
  admin: "text-blue-500",
  member: "text-muted-foreground",
  viewer: "text-muted-foreground",
};

interface WorkspaceMembersProps {
  workspaceId: string;
  myRole: string;
}

export function WorkspaceMembers({ workspaceId, myRole }: WorkspaceMembersProps) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [inviteLink, setInviteLink] = useState("");
  const [copied, setCopied] = useState(false);

  const canManage = ["owner", "admin"].includes(myRole);

  const { data: members = [], isLoading } = useQuery<Member[]>({
    queryKey: ["workspace-members", workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${workspaceId}/members`);
      if (!res.ok) throw new Error("Failed to fetch members");
      const { data } = await res.json();
      return data ?? [];
    },
    enabled: !!workspaceId,
  });

  const { data: invites = [] } = useQuery<PendingInvite[]>({
    queryKey: ["workspace-invites", workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${workspaceId}/invite`);
      if (!res.ok) return [];
      const { data } = await res.json();
      return data ?? [];
    },
    enabled: !!workspaceId && canManage,
  });

  const removeMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const res = await fetch(`/api/workspaces/${workspaceId}/members/${memberId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to remove member");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace-members", workspaceId] });
      toast.success("Member removed");
    },
    onError: () => toast.error("Failed to remove member"),
  });

  const roleChangeMutation = useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string; role: string }) => {
      const res = await fetch(`/api/workspaces/${workspaceId}/members/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error("Failed to update role");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace-members", workspaceId] });
      toast.success("Role updated");
    },
    onError: () => toast.error("Failed to update role"),
  });

  const handleInvite = async () => {
    if (!inviteEmail) return;
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to send invite");
      setInviteLink(data.data.invite_link);
      queryClient.invalidateQueries({ queryKey: ["workspace-invites", workspaceId] });
      toast.success("Invitation created");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send invite");
    }
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">{members.length} member{members.length !== 1 ? "s" : ""}</h3>
          {invites.length > 0 && (
            <p className="text-xs text-muted-foreground">{invites.length} pending invitation{invites.length !== 1 ? "s" : ""}</p>
          )}
        </div>
        {canManage && (
          <Dialog open={inviteOpen} onOpenChange={(o) => { setInviteOpen(o); if (!o) { setInviteLink(""); setInviteEmail(""); } }}>
            <DialogTrigger asChild>
              <Button size="sm" className="text-xs">Invite member</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite a team member</DialogTitle>
                <DialogDescription>Send an invitation link to add someone to this workspace.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label>Email address</Label>
                  <Input
                    type="email"
                    placeholder="colleague@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Role</Label>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin — full access</SelectItem>
                      <SelectItem value="member">Member — can create & edit</SelectItem>
                      <SelectItem value="viewer">Viewer — read only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {inviteLink && (
                  <div className="space-y-1.5">
                    <Label>Invite link</Label>
                    <div className="flex gap-2">
                      <Input readOnly value={inviteLink} className="text-xs font-mono" />
                      <Button size="sm" variant="outline" onClick={handleCopyLink}>
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Link expires in 7 days. Share it with your team member.</p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setInviteOpen(false)}>Close</Button>
                <Button onClick={handleInvite} disabled={!inviteEmail}>
                  {inviteLink ? "Resend" : "Generate invite link"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="space-y-2">
        {members.map((member) => {
          const RoleIcon = roleIcons[member.role] ?? User;
          const isMe = member.user_id === user?.id;
          const canEdit = canManage && member.role !== "owner" && !isMe;

          return (
            <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card">
              <Avatar className="w-9 h-9 shrink-0">
                <AvatarImage src={member.avatar_url ?? ""} alt={member.full_name} />
                <AvatarFallback className="text-xs">
                  {(member.full_name || member.email).slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{member.full_name || member.email}</p>
                  {isMe && <Badge variant="secondary" className="text-[10px] py-0 px-1">You</Badge>}
                </div>
                <p className="text-xs text-muted-foreground truncate">{member.email}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className={cn("flex items-center gap-1", roleColors[member.role])}>
                  <RoleIcon className="w-3.5 h-3.5" />
                  <span className="text-xs capitalize">{member.role}</span>
                </div>
                {canEdit && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => roleChangeMutation.mutate({ memberId: member.id, role: "admin" })}>
                        Make admin
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => roleChangeMutation.mutate({ memberId: member.id, role: "member" })}>
                        Make member
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => roleChangeMutation.mutate({ memberId: member.id, role: "viewer" })}>
                        Make viewer
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => removeMutation.mutate(member.id)}
                      >
                        <UserMinus className="w-4 h-4 mr-2" /> Remove member
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {invites.length > 0 && canManage && (
        <div>
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Pending invitations</h4>
          <div className="space-y-2">
            {invites.map((invite) => (
              <div key={invite.id} className="flex items-center gap-3 p-3 rounded-lg border border-dashed border-border/50 bg-muted/30">
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{invite.email}</p>
                  <p className="text-xs text-muted-foreground">Invited by {invite.invited_by_name} · expires {new Date(invite.expires_at).toLocaleDateString()}</p>
                </div>
                <Badge variant="outline" className="text-[10px] py-0 capitalize shrink-0">{invite.role}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
