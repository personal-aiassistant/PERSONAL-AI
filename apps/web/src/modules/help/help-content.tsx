"use client";

import { motion } from "framer-motion";
import {
  MessageSquareCode, Server, FileText, PlugZap, Database,
  Container, GitBranch, BookOpen, ExternalLink, ChevronRight,
  Zap, Users, CreditCard,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const TOOLS = [
  {
    icon: MessageSquareCode,
    name: "AI Chat",
    href: "/ai-chat",
    description: "Chat with GPT-4o and other models. Get coding help, reviews, explanations, and more.",
    tips: ["Use starter prompts to get started quickly", "Select a model in the top bar", "Chat history is auto-saved"],
    badge: "Core",
    color: "text-purple-500 bg-purple-500/10",
  },
  {
    icon: Server,
    name: "Architecture Generator",
    href: "/architecture",
    description: "Generate complete system architecture for your project including tech stack, data flow, and infrastructure.",
    tips: ["Be specific about scale requirements", "Mention compliance needs (GDPR, HIPAA)", "Add tech preferences for tailored output"],
    badge: "Generator",
    color: "text-blue-500 bg-blue-500/10",
  },
  {
    icon: FileText,
    name: "PRD Generator",
    href: "/prd",
    description: "Create comprehensive Product Requirements Documents with user stories and acceptance criteria.",
    tips: ["Define target users clearly", "List must-have vs nice-to-have features", "Include success metrics"],
    badge: "Generator",
    color: "text-green-500 bg-green-500/10",
  },
  {
    icon: PlugZap,
    name: "API Builder",
    href: "/api-builder",
    description: "Generate REST API specifications with endpoints, request/response schemas, and curl examples.",
    tips: ["List all your data entities", "Specify auth type (JWT, OAuth)", "Mention rate limiting requirements"],
    badge: "Generator",
    color: "text-amber-500 bg-amber-500/10",
  },
  {
    icon: Database,
    name: "Schema Generator",
    href: "/schema",
    description: "Generate SQL database schemas with TypeScript types, indexes, and sample data.",
    tips: ["List all main entities", "Mention special features like soft delete", "Specify your database type"],
    badge: "Generator",
    color: "text-indigo-500 bg-indigo-500/10",
  },
  {
    icon: Container,
    name: "Docker Generator",
    href: "/docker",
    description: "Generate Dockerfiles and docker-compose configurations for your entire stack.",
    tips: ["List all services to containerize", "Specify target environment", "Include any volume or networking needs"],
    badge: "Generator",
    color: "text-cyan-500 bg-cyan-500/10",
  },
  {
    icon: GitBranch,
    name: "CI/CD Generator",
    href: "/cicd",
    description: "Generate complete CI/CD pipeline configurations for GitHub Actions and more.",
    tips: ["Specify your deployment target", "Mention testing frameworks", "Include notification preferences"],
    badge: "Generator",
    color: "text-orange-500 bg-orange-500/10",
  },
  {
    icon: BookOpen,
    name: "Docs Generator",
    href: "/documentation",
    description: "Generate comprehensive README and project documentation with installation guides.",
    tips: ["Describe your target audience", "List key features to document", "Include contributing guidelines"],
    badge: "Generator",
    color: "text-rose-500 bg-rose-500/10",
  },
];

const FAQS = [
  {
    q: "What AI models are available?",
    a: "GPT-4o (most capable), GPT-4o Mini (faster, cheaper), GPT-4 Turbo, and GPT-3.5 Turbo. Switch models in the AI Chat page.",
  },
  {
    q: "Is my data private?",
    a: "Your data is stored securely in your workspace. Prompts are sent to OpenAI's API — review their privacy policy for details.",
  },
  {
    q: "How do I invite team members?",
    a: "Go to Workspace → Members tab → click 'Invite member'. Enter their email and role, then share the generated invite link.",
  },
  {
    q: "Can I regenerate output?",
    a: "Yes! After any generation completes, click the 'Regenerate' button in the output toolbar to get a fresh response.",
  },
  {
    q: "How do I download generated content?",
    a: "Every generated output has a download button (↓) in the toolbar. It downloads as a Markdown file.",
  },
  {
    q: "What are the token limits?",
    a: "Free plan: 100,000 tokens/month. Pro plan: 2,000,000 tokens/month. Track usage in the Billing page.",
  },
];

const QUICK_LINKS = [
  { icon: Users, label: "Manage workspace", href: "/workspace" },
  { icon: CreditCard, label: "View billing & usage", href: "/billing" },
  { icon: Zap, label: "Start AI chat", href: "/ai-chat" },
  { icon: Server, label: "Generate architecture", href: "/architecture" },
];

export function HelpContent() {
  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
  const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="max-w-5xl mx-auto space-y-10">
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-semibold">Help & Resources</h1>
        <p className="text-sm text-muted-foreground mt-1">Everything you need to get the most out of CodeForge AI</p>
      </motion.div>

      {/* Quick Links */}
      <motion.div variants={item}>
        <h2 className="text-base font-semibold mb-3">Quick links</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_LINKS.map((link) => (
            <Link key={link.href} href={link.href}>
              <div className="glass rounded-lg p-4 flex items-center gap-3 hover:border-primary/40 transition-colors group cursor-pointer">
                <link.icon className="w-4 h-4 text-primary shrink-0" />
                <span className="text-xs font-medium">{link.label}</span>
                <ChevronRight className="w-3 h-3 text-muted-foreground ml-auto group-hover:text-foreground" />
              </div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* AI Tools Guide */}
      <motion.div variants={item}>
        <h2 className="text-base font-semibold mb-3">AI tools guide</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {TOOLS.map((tool) => (
            <Link key={tool.href} href={tool.href}>
              <Card className="glass h-full hover:border-primary/40 transition-colors cursor-pointer group">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${tool.color}`}>
                      <tool.icon className="w-4 h-4" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="secondary" className="text-[10px]">{tool.badge}</Badge>
                      <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <CardTitle className="text-sm mt-2">{tool.name}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground mb-3">{tool.description}</p>
                  <div className="space-y-1">
                    {tool.tips.map((tip, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-primary/60 mt-1.5 shrink-0" />
                        <p className="text-xs text-muted-foreground">{tip}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* FAQ */}
      <motion.div variants={item}>
        <h2 className="text-base font-semibold mb-3">Frequently asked questions</h2>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="glass rounded-lg p-4">
              <h3 className="text-sm font-medium mb-1.5">{faq.q}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Contact */}
      <motion.div variants={item}>
        <div className="glass rounded-lg p-6 text-center">
          <Zap className="w-8 h-8 text-primary mx-auto mb-3" />
          <h3 className="text-base font-semibold mb-1">Need more help?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Can&apos;t find what you&apos;re looking for? Our AI assistant is always ready to help.
          </p>
          <Link href="/ai-chat">
            <button className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
              <MessageSquareCode className="w-4 h-4" />
              Ask AI Chat
            </button>
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}
