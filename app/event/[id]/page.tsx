import { ArrowLeft, MessageCircle, Clock } from 'lucide-react';
import makeBackendRequest from '@/app/lib/makeBackendRequest';
import Link from 'next/link';
import { StoryResponse } from '@/app/api/story/status/route';
import { randomUUID } from 'crypto';
import TheirStoriesVirtualList from './their-stories-virtual-list';
import EventClient from './client';
import { SqlResponse } from '@/app/api/post/status/next/route';

interface PageProps {
  params: { id: string }
}

export default async function EventPage({ params }: PageProps) {

  const paramsResolved = await params;

  const event = await makeBackendRequest(`/api/event/${paramsResolved.id}`);
  const me = await makeBackendRequest('/api/user/me');
  const stories: StoryResponse[] = await makeBackendRequest(`/api/story/status?eventId=${paramsResolved.id}`);
  const session: { id: string } = await makeBackendRequest(`/api/session/get-session`);
  const postsResponse = await makeBackendRequest(`/api/post/status/next?eventId=${paramsResolved.id}`);
  const posts: SqlResponse[] = Array.isArray(postsResponse)
    ? postsResponse
    : postsResponse?.posts ?? [];

  return (
    <EventClient
      sessionId={session.id}
      initialStories={stories}
      event={event}
      me={me}
      paramsResolved={paramsResolved}
      initialPosts={posts}
    ></EventClient>
  );
}
