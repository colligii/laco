import { ChatScreenClient } from './client';
import makeBackendRequest from '@/app/lib/makeBackendRequest';

interface PageProps {
  params: { id: string }
}

const ChatScreen = async ({ params }: PageProps) => {

  const paramsResolved = await params;

  const event = await makeBackendRequest(`/api/event/${paramsResolved.id}`);
  const me = await makeBackendRequest('/api/user/me');
  const session: { id: string } = await makeBackendRequest(`/api/session/get-session`);
  const chat = await makeBackendRequest(`/api/chat/previous?eventId=${paramsResolved.id}&limit=40`)

  return (
    <ChatScreenClient
      me={me}
      session={session}
      event={event}  
      chat={chat}
    />
  );
};

export default ChatScreen;
