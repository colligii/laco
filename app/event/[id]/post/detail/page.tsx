import makeBackendRequest from '@/app/lib/makeBackendRequest';
import StoryDetailScreen from './client';
import Loading from '@/app/components/loading';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const paramsResolved = await params;
  const event = await makeBackendRequest(`/api/event/${paramsResolved.id}`);

  return (
    <>
      <Loading/>
      <StoryDetailScreen eventId={paramsResolved.id} eventName={event.name} >
        
      </StoryDetailScreen>;
    </>
  )
}
