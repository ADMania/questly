import FeedClient from "./feed-client";
import { FeedPost } from "@/components/feed/PostCard";
import { normalizeFeedPost } from "./normalize";

export const dynamic = 'force-dynamic';

const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
};

async function fetchFeedPosts() {
  try {
    const baseUrl = getBaseUrl().replace(/\/+$/, "");
    const res = await fetch(`${baseUrl}/api/posts`, { cache: "no-store" });
    if (!res.ok) {
      console.error("Failed to fetch feed posts:", res.status);
      return [];
    }

    const payload = await res.json();
    if (!Array.isArray(payload?.data)) {
      return [];
    }

    return payload.data.map((entry: any) => normalizeFeedPost(entry));
  } catch (error) {
    console.error("Feed load error:", error);
    return [];
  }
}

export default async function FeedPage() {
  const posts = await fetchFeedPosts();
  return <FeedClient initialPosts={posts} />;
}
