import Link from 'next/link';
import { ArrowLeft, Send } from 'lucide-react';
import useMakeBackendRequest from '@/app/lib/makeBackendRequest';
import { UserIdStoryResponse } from '@/app/api/story/getData/[userId]/route';
import { StoryClient } from './client';

interface StoryDetailsPageProps {
  params: Promise<{ id: string, userId: string }>;
}

export default async function StoryDetailsPage({ params }: StoryDetailsPageProps) {
  const { id, userId } = await params;

  const stories: UserIdStoryResponse = await useMakeBackendRequest(`/api/story/getData/${userId}?eventId=${id}`)

  let actualStoryIndex = stories.stories.findIndex((story) => story.not_viewed);
  actualStoryIndex = actualStoryIndex === -1 ? 0 : actualStoryIndex;

  console.log(stories)

  return (
    <StoryClient
      initialStoryIndex={actualStoryIndex}
      initialStories={stories}
      id={id}
    ></StoryClient>
  );
}
