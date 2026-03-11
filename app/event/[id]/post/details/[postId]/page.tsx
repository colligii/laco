import useMakeBackendRequest from '@/app/lib/makeBackendRequest';
import EventDetail from './client';

const EventPage = async  ({ params }: any) => {
  const promisedResolved = await params;
  
  const event = await useMakeBackendRequest(`/api/event/${promisedResolved.id}`)
  const post = await useMakeBackendRequest(`/api/post/getData/${promisedResolved.postId}?eventId=${promisedResolved.id}`)
  const comments = await useMakeBackendRequest(`/api/post/comments/${promisedResolved.postId}`)

  return <EventDetail
    event={event}
    post={post}
    initialComments={comments}
  />
};

export default EventPage;
