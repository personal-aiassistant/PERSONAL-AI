"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FolderKanban,
  MessageSquareCode,
  Settings,
  CreditCard,
  HelpCircle,
  Zap,
  ChevronLeft,
  ChevronRight,
  Server,
  FileText,
  PlugZap,
  Database,
  Container,
  GitBranch,
  ChevronDown,
  Users,
  BookOpen,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserMenu } from "@/components/layout/user-menu";
import { useState } from "react";

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface NavItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  const pathname = usePathname();
  const t = useTranslations("navigation");
  const [toolsOpen, setToolsOpen] = useState(true);

  const mainNav: NavItem[] = [
    { href: "/dashboard", icon: LayoutDashboard, label: t("dashboard") },
    { href: "/projects", icon: FolderKanban, label: t("projects") },
    { href: "/ai-chat", icon: MessageSquareCode, label: t("aiChat") },
    { href: "/workspace", icon: Users, label: t("workspace") },
    { href: "/analytics", icon: BarChart3, label: t("analytics") },
  ];

  const aiTools: NavItem[] = [
    { href: "/architecture", icon: Server, label: t("architecture") },
    { href: "/prd", icon: FileText, label: t("prd") },
    { href: "/api-builder", icon: PlugZap, label: t("apiBuilder") },
    { href: "/schema", icon: Database, label: t("schema") },
    { href: "/docker", icon: Container, label: t("docker") },
    { href: "/cicd", icon: GitBranch, label: t("cicd") },
    { href: "/documentation", icon: BookOpen, label: t("documentation") },
  ];

  const bottomNav: NavItem[] = [
    { href: "/settings", icon: Settings, label: t("settings") },
    { href: "/billing", icon: CreditCard, label: t("billing") },
  ];

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const isAnyToolActive = aiTools.some((item) => isActive(item.href));

  const NavLink = ({ item }: { item: NavItem }) => (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 px-2 py-2 rounded-md text-sm transition-colors",
        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        isActive(item.href)
          ? "bg-sidebar-accent text-sidebar-primary font-medium"
          : "text-sidebar-foreground"
      )}
    >
      <item.icon className="w-4 h-4 shrink-0" />
      <AnimatePresence mode="wait">
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="whitespace-nowrap overflow-hidden text-sm"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="relative flex flex-col h-full bg-sidebar border-r border-sidebar-border shrink-0 overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center h-14 px-3 border-b border-sidebar-border shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary shrink-0">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -4 }}
                transition={{ duration: 0.15 }}
                className="font-semibold text-sm text-sidebar-foreground whitespace-nowrap"
              >
                CodeForge AI
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 overflow-y-auto">
        {/* Main nav */}
        <div className="space-y-1 mb-3">
          {mainNav.map((item) => <NavLink key={item.href} item={item} />)}
        </div>

        {/* AI Tools group */}
        <div className="mb-1">
          {!collapsed ? (
            <button
              onClick={() => setToolsOpen((o) => !o)}
              className={cn(
                "w-full flex items-center justify-between px-2 py-1.5 rounded-md text-xs font-medium uppercase tracking-wider transition-colors",
                isAnyToolActive
                  ? "text-sidebar-primary"
                  : "text-muted-foreground hover:text-sidebar-foreground"
              )}
            >
              <span>AI Tools</span>
              <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", toolsOpen ? "" : "-rotate-90")} />
            </button>
          ) : (
            <div className="h-px bg-sidebar-border my-2 mx-2" />
          )}

          <AnimatePresence initial={false}>
            {(toolsOpen || collapsed) && (
              <motion.div
                initial={collapsed ? false : { height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <div className={cn("space-y-1", !collapsed && "mt-1 pl-1")}>
                  {aiTools.map((item) => <NavLink key={item.href} item={item} />)}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Divider */}
        <div className="h-px bg-sidebar-border my-2 mx-1" />

        {/* Bottom items in nav */}
        <div className="space-y-1">
          {bottomNav.map((item) => <NavLink key={item.href} item={item} />)}
        </div>
      </nav>

      {/* User + Help */}
      <div className="border-t border-sidebar-border p-2 shrink-0">
        <Link
          href="/help"
          className="flex items-center gap-3 px-2 py-2 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors mb-2"
        >
          <HelpCircle className="w-4 h-4 shrink-0" />
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
              >
                {t("help")}
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
        <UserMenu collapsed={collapsed} />
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className={cn(
          "absolute top-1/2 -translate-y-1/2 -right-3 z-10",
          "flex items-center justify-center w-6 h-6 rounded-full",
          "bg-sidebar-border text-sidebar-foreground hover:bg-border",
          "transition-colors shadow-sm"
        )}
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>
    </motion.aside>
  );
}
