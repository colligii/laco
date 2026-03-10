import { ArrowLeft, MessageCircle, Clock } from 'lucide-react';
import makeBackendRequest from '@/app/lib/makeBackendRequest';
import Link from 'next/link';
import { StoryResponse } from '@/app/api/story/status/route';
import { randomUUID } from 'crypto';
import TheirStoriesVirtualList from './their-stories-virtual-list';
import EventClient from './client';

interface PageProps {
  params: { id: string }
}

export default async function EventPage({ params }: PageProps) {

  const paramsResolved = await params;

  const event = await makeBackendRequest(`/api/event/${paramsResolved.id}`);
  const me = await makeBackendRequest('/api/user/me');
  const stories: StoryResponse[] = await makeBackendRequest(`/api/story/status?eventId=${paramsResolved.id}`);

  const videos = Array(8).fill(null);

  return (
    <EventClient
      initialStories={stories}
      event={event}
      me={me}
      paramsResolved={paramsResolved}
      videos={videos}
    ></EventClient>
  );
}
