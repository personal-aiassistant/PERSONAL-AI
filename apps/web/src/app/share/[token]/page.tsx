import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ShareView } from "./share-view";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface ShareData {
  id: string;
  token: string;
  title: string;
  content: string;
  generator_type: string;
  view_count: number;
  expires_at: string | null;
  created_at: string;
}

async function getShareData(token: string): Promise<ShareData | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/share/${token}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const share = await getShareData(token);
  if (!share) return { title: "Share Not Found — CodeForge AI" };
  return {
    title: `${share.title} — CodeForge AI`,
    description: `AI-generated ${share.generator_type} output shared via CodeForge AI`,
    openGraph: {
      title: share.title,
      description: `AI-generated ${share.generator_type} output`,
      siteName: "CodeForge AI",
    },
  };
}

export default async function SharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const share = await getShareData(token);
  if (!share) notFound();
  return <ShareView share={share} />;
}
