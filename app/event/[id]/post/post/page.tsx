import makeBackendRequest from '@/app/lib/makeBackendRequest';
import CameraScreen from './client';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {

  const paramsResolved = await params;

  const event = await makeBackendRequest(`/api/event/${paramsResolved.id}`);

  return <CameraScreen
    selectedEventName={event.name}
    eventId={paramsResolved.id}
  ></CameraScreen>
}
