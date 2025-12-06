import { getFeedPosts } from '@/app/actions/posts';
import FeedClient from './feed-client';

export const dynamic = 'force-dynamic';

export default async function FeedPage() {
  const posts = await getFeedPosts();
  return <FeedClient initialPosts={posts} />;
}
