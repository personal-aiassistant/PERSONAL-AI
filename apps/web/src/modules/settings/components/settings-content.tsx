"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { Loader2, User, Bell, Shield, Palette, Save } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/store/auth-store";
import { useUpdateProfile } from "@/hooks/use-profile";

interface ProfileForm {
  full_name: string;
}

export function SettingsContent() {
  const { user, profile } = useAuthStore();
  const updateProfile = useUpdateProfile();
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, formState: { errors, isDirty } } = useForm<ProfileForm>({
    defaultValues: {
      full_name: profile?.full_name ?? user?.user_metadata?.full_name ?? "",
    },
  });

  const onSaveProfile = async (data: ProfileForm) => {
    setSaving(true);
    try {
      await updateProfile.mutateAsync({ full_name: data.full_name });
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto space-y-6"
    >
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your account and preferences
        </p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="profile" className="gap-2">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="w-4 h-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-6">
          <div className="glass rounded-lg p-6 space-y-6">
            <div>
              <h3 className="text-base font-semibold">Profile Information</h3>
              <p className="text-sm text-muted-foreground">
                Update your display name and avatar.
              </p>
            </div>
            <Separator />
            <form onSubmit={handleSubmit(onSaveProfile)} className="space-y-4">
              <div className="flex items-center gap-4">
                {profile?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.avatar_url}
                    alt="Avatar"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-semibold">
                    {profile?.full_name?.[0]?.toUpperCase() ??
                      user?.email?.[0]?.toUpperCase() ??
                      "U"}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium">
                    {profile?.full_name ?? user?.email}
                  </p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="full_name">Display name</Label>
                <Input
                  id="full_name"
                  placeholder="Your name"
                  {...register("full_name", {
                    required: "Name is required",
                    minLength: { value: 2, message: "At least 2 characters" },
                  })}
                />
                {errors.full_name && (
                  <p className="text-xs text-destructive">{errors.full_name.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Email address</Label>
                <Input value={user?.email ?? ""} disabled />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed here. Use your auth provider.
                </p>
              </div>

              <Button type="submit" disabled={saving || !isDirty}>
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save changes
              </Button>
            </form>
          </div>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="mt-6">
          <div className="glass rounded-lg p-6 space-y-6">
            <div>
              <h3 className="text-base font-semibold">Appearance</h3>
              <p className="text-sm text-muted-foreground">
                Customize how CodeForge AI looks for you.
              </p>
            </div>
            <Separator />
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-3">Theme</p>
                <div className="grid grid-cols-3 gap-3 max-w-xs">
                  {["Light", "Dark", "System"].map((theme) => (
                    <button
                      key={theme}
                      className="border rounded-lg p-3 text-xs font-medium hover:border-primary transition-colors text-center"
                    >
                      {theme}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Use the theme toggle in the header to change your theme.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-6">
          <div className="glass rounded-lg p-6 space-y-6">
            <div>
              <h3 className="text-base font-semibold">Notifications</h3>
              <p className="text-sm text-muted-foreground">
                Notification preferences coming soon.
              </p>
            </div>
            <Separator />
            <p className="text-sm text-muted-foreground py-4">
              Notification settings will be available in a future update.
            </p>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="mt-6">
          <div className="glass rounded-lg p-6 space-y-6">
            <div>
              <h3 className="text-base font-semibold">Security</h3>
              <p className="text-sm text-muted-foreground">
                Manage your account security settings.
              </p>
            </div>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border/50">
                <div>
                  <p className="text-sm font-medium">Password</p>
                  <p className="text-xs text-muted-foreground">
                    Change your password via the forgot password flow.
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href="/forgot-password">Reset password</a>
                </Button>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium">Account ID</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {user?.id?.slice(0, 18)}...
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
