"use client";

import { useTranslations } from "next-intl";
import { LogOut } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { generateInitials } from "@/lib/utils";
import { toast } from "sonner";

interface UserMenuProps {
  collapsed: boolean;
}

export function UserMenu({ collapsed }: UserMenuProps) {
  const t = useTranslations("auth");
  const router = useRouter();
  const { user, profile } = useAuthStore();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    router.push("/login");
    router.refresh();
  };

  if (!user) return null;

  const displayName =
    profile?.full_name ??
    user.user_metadata?.full_name ??
    user.email ??
    "User";
  const email = user.email ?? "";
  const initials = generateInitials(displayName);

  return (
    <div className="flex items-center gap-2 px-2 py-2 rounded-md">
      {profile?.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={profile.avatar_url}
          alt={displayName}
          className="w-8 h-8 rounded-full shrink-0 object-cover"
        />
      ) : (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-semibold shrink-0">
          {initials}
        </div>
      )}
      <AnimatePresence mode="wait">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="flex items-center justify-between flex-1 min-w-0"
          >
            <div className="min-w-0">
              <p className="text-xs font-medium text-sidebar-foreground truncate">
                {displayName}
              </p>
              <p className="text-xs text-muted-foreground truncate">{email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="p-1 rounded hover:bg-sidebar-accent text-muted-foreground hover:text-sidebar-foreground transition-colors"
              aria-label={t("signOut")}
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
