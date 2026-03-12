"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Mail, Crown, MoreVertical, UserMinus, Shield, Eye, Edit2, X, Clock, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface TeamMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  isOwner: boolean;
  joinedAt: string;
}

interface PendingInvite {
  id: string;
  email: string;
  role: string;
  expiresAt: string;
  createdAt: string;
}

interface TeamData {
  id: string;
  name: string;
  ownerId: string;
}

const ROLE_OPTIONS = [
  { value: "ADMIN", label: "Admin", description: "Can manage team members and settings" },
  { value: "MEMBER", label: "Member", description: "Can manage reviews and businesses" },
  { value: "VIEWER", label: "Viewer", description: "Can only view data" },
];

export default function TeamPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState<TeamData | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("MEMBER");
  const [inviting, setInviting] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const fetchTeamData = useCallback(async () => {
    try {
      const response = await fetch('/api/team');
      if (response.ok) {
        const data = await response.json();
        setTeam(data.team);
        setMembers(data.members);
        setPendingInvites(data.pendingInvites || []);
      }
    } catch (error) {
      console.error('Error fetching team data:', error);
      toast.error('Failed to load team data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeamData();
  }, [fetchTeamData]);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    setInviting(true);
    try {
      const response = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      });

      if (response.ok) {
        toast.success("Invitation sent successfully!");
        setInviteEmail("");
        setInviteRole("MEMBER");
        setInviteDialogOpen(false);
        fetchTeamData();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to send invitation");
      }
    } catch (error) {
      console.error('Error sending invite:', error);
      toast.error("Failed to send invitation");
    } finally {
      setInviting(false);
    }
  };

  const handleCancelInvite = async (inviteId: string) => {
    try {
      const response = await fetch(`/api/team/invite?id=${inviteId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success("Invitation cancelled");
        fetchTeamData();
      } else {
        toast.error("Failed to cancel invitation");
      }
    } catch (error) {
      console.error('Error cancelling invite:', error);
      toast.error("Failed to cancel invitation");
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    try {
      const response = await fetch('/api/team/member', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, role: newRole }),
      });

      if (response.ok) {
        toast.success("Member role updated");
        fetchTeamData();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to update role");
      }
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error("Failed to update role");
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Are you sure you want to remove ${memberName} from the team?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/team/member?id=${memberId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success("Member removed from team");
        fetchTeamData();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to remove member");
      }
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error("Failed to remove member");
    }
  };

  const copyInviteLink = (inviteId: string) => {
    // In a real implementation, you'd have an invite acceptance URL
    const url = `${window.location.origin}/invite/${inviteId}`;
    navigator.clipboard.writeText(url);
    setCopied(inviteId);
    toast.success("Invite link copied!");
    setTimeout(() => setCopied(null), 2000);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "OWNER": return <Crown className="w-4 h-4 text-amber-500" />;
      case "ADMIN": return <Shield className="w-4 h-4 text-indigo-500" />;
      case "VIEWER": return <Eye className="w-4 h-4 text-gray-500" />;
      default: return <Edit2 className="w-4 h-4 text-emerald-500" />;
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case "OWNER": return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      case "ADMIN": return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400";
      case "VIEWER": return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
      default: return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
    }
  };

  const isOwnerOrAdmin = members.some(
    m => m.userId === session?.user?.id && (m.role === "OWNER" || m.role === "ADMIN")
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[40vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Team Members */}
      <Card className="border-0 shadow-soft bg-white dark:bg-[#1a1a1f]">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              {team?.name || "Team Members"}
            </CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              {members.length} member{members.length !== 1 ? 's' : ''} in your team
            </CardDescription>
          </div>
          {isOwnerOrAdmin && (
            <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
              <DialogTrigger
                render={
                  <Button className="rounded-xl gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                    <Plus className="w-4 h-4" />
                    Invite Member
                  </Button>
                }
              />
              <DialogContent className="bg-white dark:bg-[#0f0f14] border border-gray-200 dark:border-gray-800 sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                    Invite Team Member
                  </DialogTitle>
                  <DialogDescription className="text-gray-500 dark:text-gray-400">
                    Send an invitation to join your team
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="colleague@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select value={inviteRole} onValueChange={(v) => v && setInviteRole(v)}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div>
                              <div className="font-medium">{option.label}</div>
                              <div className="text-xs text-gray-500">{option.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setInviteDialogOpen(false)}
                    className="rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleInvite}
                    disabled={inviting}
                    className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  >
                    {inviting ? "Sending..." : "Send Invitation"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 text-indigo-600 dark:text-indigo-400 font-medium">
                      {member.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 dark:text-white">{member.name}</p>
                      {getRoleIcon(member.role)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Mail className="w-3.5 h-3.5" />
                      {member.email}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className={`border-0 ${getRoleBadgeClass(member.role)}`}>
                    {member.role}
                  </Badge>
                  {isOwnerOrAdmin && member.role !== "OWNER" && (
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onClick={() => handleUpdateRole(member.id, "ADMIN")}
                          disabled={member.role === "ADMIN"}
                        >
                          <Shield className="w-4 h-4 mr-2" />
                          Make Admin
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleUpdateRole(member.id, "MEMBER")}
                          disabled={member.role === "MEMBER"}
                        >
                          <Edit2 className="w-4 h-4 mr-2" />
                          Make Member
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleUpdateRole(member.id, "VIEWER")}
                          disabled={member.role === "VIEWER"}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Make Viewer
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleRemoveMember(member.id, member.name)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <UserMinus className="w-4 h-4 mr-2" />
                          Remove from Team
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {pendingInvites.length > 0 && (
        <Card className="border-0 shadow-soft bg-white dark:bg-[#1a1a1f]">
          <CardHeader className="pb-4 border-b border-gray-100 dark:border-gray-800">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              Pending Invitations
            </CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              {pendingInvites.length} invitation{pendingInvites.length !== 1 ? 's' : ''} awaiting response
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {pendingInvites.map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-800"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                        {invite.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{invite.email}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Expires {new Date(invite.expiresAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400">
                      {invite.role}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyInviteLink(invite.id)}
                      className="rounded-lg"
                    >
                      {copied === invite.id ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                    {isOwnerOrAdmin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancelInvite(invite.id)}
                        className="rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team Roles Explanation */}
      <Card className="border-0 shadow-soft bg-gradient-to-br from-indigo-500/5 to-purple-500/5 dark:from-indigo-500/10 dark:to-purple-500/10">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Team Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="p-4 bg-white dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-indigo-500" />
                <h4 className="font-semibold text-gray-900 dark:text-white">Admin</h4>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Can invite/remove members, manage settings, and access all features
              </p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <Edit2 className="w-5 h-5 text-emerald-500" />
                <h4 className="font-semibold text-gray-900 dark:text-white">Member</h4>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Can manage reviews, businesses, and generate AI replies
              </p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-5 h-5 text-gray-500" />
                <h4 className="font-semibold text-gray-900 dark:text-white">Viewer</h4>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Read-only access to view reviews and analytics
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
