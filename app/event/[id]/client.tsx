'use client'

import { ArrowLeft, Clock, MessageCircle, PlusCircle, RefreshCw } from "lucide-react";
import TheirStoriesVirtualList from "./their-stories-virtual-list";
import { EventModel } from "@/prisma/app/generated/prisma/models";
import { StoryResponse } from "@/app/api/story/status/route";
import { UserResponse } from "@/app/api/user/me/route";
import Link from 'next/link'
import { useRouter } from "next/navigation";
import { UIEvent, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { SqlResponse } from "@/app/api/post/status/next/route";
import { useWebSocket } from "@/app/lib/use-websocket";
import ButtonComponent from "@/app/chat/button/component";

const REFRESH_PROMPT_INTERVAL_MS = 2 * 60 * 1000;
const SCROLL_THRESHOLD = 300; // Aumentado para carregar antes de chegar no fim
const MAX_POSTS_IN_MEMORY = 40;


function getMyStory(initialStories: StoryResponse[], me: UserResponse): StoryResponse {
    const firstStory = initialStories[0];

    if(firstStory?.user_id === me.id) {
        return firstStory;
    }

    return {
        avatar_path: me.avatar_url,
        firstName: me.firstName ?? '',
        lastName: me.lastName ?? '',
        not_viewed: false,
        story_ids: [],
        user_id: me.id
    }
}


function getTheirStories(initialStories: StoryResponse[], me: UserResponse): StoryResponse[] {
    const firstStory = initialStories[0];
    let startIndex = 0;

    if(firstStory?.user_id === me.id) {
        startIndex = 1;
    }

    return initialStories.slice(startIndex)
}


export default function EventClient({ event, initialStories, initialPosts, me, paramsResolved, sessionId }: EventClientProps) {
    const router = useRouter();
    const [stories, setStories] = useState(initialStories);
    const [myStory, setMyStory] = useState(getMyStory(initialStories, me));
    const [theirStories, setTheirStories] = useState(getTheirStories(initialStories, me))
    const [lastRefreshTime, setLastRefreshTime] = useState(() => Date.now());
    const [showRefreshPrompt, setShowRefreshPrompt] = useState(false);
    const isFetching = useRef(false);
    const stopFetchBottom = useRef(false);
    const stopFetchTop = useRef(true);
    const { ws, registerMessage } = useWebSocket(sessionId);

    const [posts, setPosts] = useState(initialPosts);
    const scrollHeightBeforeUpdate = useRef<number>(0); // Add this
    const listRef = useRef<HTMLDivElement | null>(null);

    const chatButtonRef = useRef<((event: any) => void) | null>(null);

    const MIN_ROW_HEIGHT = 220;

    useEffect(() => {
        registerMessage((event) => {
            chatButtonRef.current?.(event);    
        })
    }, [])

    const handleStory = (user_id: string, storyIds: string[]) => {
        if(!Array.isArray(storyIds))
            router.replace(`/event/${event.id}/story/details/${user_id}`);
    }

    const updateScreen = async () => {
        try {
            const storiesRequest = await axios.get(`/api/story/status?eventId=${paramsResolved.id}`)
            const postRequest = await axios.get(`/api/post/status/next?eventId=${paramsResolved.id}`);
            setStories(storiesRequest.data);
            setPosts(postRequest.data);

            isFetching.current = false;
            stopFetchBottom.current = false;
            stopFetchBottom.current = false;
            scrollHeightBeforeUpdate.current = 0;
            listRef.current?.scrollTo(0, 0);
        } catch (e) {
            console.error('error refreshing stories');
        } finally {
            setLastRefreshTime(Date.now());
            setShowRefreshPrompt(false);
        }
    }

    const handleManualRefresh = () => updateScreen();

    useEffect(() => {
        const interval = setInterval(() => {
            stopFetchBottom.current = false;
            stopFetchTop.current = false;
        }, 5000)

        return () => clearInterval(interval);
    }, [])

    useEffect(() => {
        setMyStory(getMyStory(stories, me));
        setTheirStories(getTheirStories(stories, me));
    }, [stories]);

    useLayoutEffect(() => {
        if (listRef.current && scrollHeightBeforeUpdate.current > 0) {
            const container = listRef.current;
            // Calculate how much the height increased
            const heightDifference = container.scrollHeight - scrollHeightBeforeUpdate.current;

            // Manually "push" the scroll down by the height of the new items
            container.scrollTop = container.scrollTop + heightDifference;

            // Reset the tracker
            scrollHeightBeforeUpdate.current = 0;
        }
    }, [posts]); // Fires every time posts are updated

    useEffect(() => {
        const interval = setInterval(() => {
            if (!showRefreshPrompt && Date.now() - lastRefreshTime >= REFRESH_PROMPT_INTERVAL_MS) {
                setShowRefreshPrompt(true);
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [lastRefreshTime, showRefreshPrompt]);

    const handleNextFetch = async () => {
        try {
            const lastPost = posts[posts.length - 1];
            isFetching.current = true;

            const postFetch = await axios.get('/api/post/status/next', {
                params: {
                    event: paramsResolved.id,
                    postId: lastPost.id,
                    createdAt: lastPost.created_at
                }
            })

            if (!postFetch.data?.length) {
                stopFetchBottom.current = true;
                isFetching.current = false;

                return;
            }

            stopFetchTop.current = false;
            setPosts((posts) => {
                const oldPostArray = posts.slice(posts.length - 20, posts.length)
                
                const uniquePosts = new Map<string, SqlResponse>([
                    ...oldPostArray.map(p => [p.id, p] as const),
                    ...postFetch.data.map((p: SqlResponse) => [p.id, p] as const)
                ]).values();
            
                return Array.from(uniquePosts)
            })
            isFetching.current = false;

        } catch (e) {
            isFetching.current = false;
        }
    }

    const handlePreviousFetch = async () => {
        try {
            const firstPost = posts[0];
            isFetching.current = true;

            // 1. Capture the height BEFORE the state changes
            if (listRef.current) {
                scrollHeightBeforeUpdate.current = listRef.current.scrollHeight;
            }

            const postFetch = await axios.get('/api/post/status/previous', {
                params: {
                    event: paramsResolved.id,
                    postId: firstPost.id,
                    createdAt: firstPost.created_at
                }
            });

            if (!postFetch.data.length) {
                stopFetchTop.current = true;
                isFetching.current = false;
                return;
            }

            setPosts((prevPosts) => {
                const oldPostArray = posts.slice(0, 20);

                const uniquePosts = new Map<string, SqlResponse>([
                    ...postFetch.data.map((p: SqlResponse) => [p.id, p] as const),
                    ...prevPosts.map(p => [p.id, p] as const)
                ]).values();
            
                return Array.from(uniquePosts)
            });

            isFetching.current = false;

        } catch (e) {
            isFetching.current = false;
        }
    }




    const handleScroll = (e: UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

        // Rabbit hole: Chegou perto do topo
        if (scrollTop < SCROLL_THRESHOLD && !isFetching.current && !stopFetchTop.current) {
            handlePreviousFetch()
        }

        // Rabbit hole: Chegou perto do fundo
        if (scrollHeight - scrollTop - clientHeight < SCROLL_THRESHOLD && !isFetching.current && !stopFetchBottom.current) {
            handleNextFetch()
        }
    };

    return (
        <div className="h-dvh bg-zinc-950 text-white flex flex-col overflow-hidden">
            <div className="w-full max-w-md mx-auto flex flex-col flex-1 min-h-0">
                <header className="flex items-center justify-between px-5 py-4 sticky top-0 bg-zinc-950/95 backdrop-blur z-10">
                    <button className="p-2 bg-zinc-900/70 hover:bg-zinc-800 transition-colors rounded-full border border-zinc-800">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-lg font-semibold tracking-tight text-white text-center truncate px-3">
                        {event.name}
                    </h1>
                    <ButtonComponent
                        eventId={event.id}
                        chatButtonRef={chatButtonRef}
                    />
                </header>

                <div className="flex gap-4 px-5 py-4 items-start">
                    <div className="relative cursor-pointer w-16 shrink-0">
                        <img
                            onClick={() => handleStory(myStory.user_id, myStory.story_ids)}
                            src={me.avatar_url}
                            style={{ borderColor: myStory?.not_viewed ? 'green' : undefined }}
                            className="w-16 h-16 rounded-full object-cover border-2 p-0.5"
                            alt="Sua foto"
                        />
                        <Link href={`/event/${paramsResolved.id}/story/post`}>
                            <div className="absolute bg-indigo-500 bg-black -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-zinc-950">
                                <span className="text-sm font-bold">+</span>
                            </div>
                        </Link>
                    </div>

                    <TheirStoriesVirtualList stories={theirStories} onClick={handleStory} />
                </div>

                <main
                    ref={listRef}
                    onScroll={handleScroll}
                    className="flex-1 min-h-0 overflow-y-auto px-4 pb-24 scroll-smooth"
                >
                    {posts.length === 0 ? (
                        <div className="flex h-full items-center justify-center text-sm text-zinc-400">
                            Nenhum post ainda.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="sm:col-span-2 bg-zinc-900/70 border border-zinc-800 rounded-xl p-3 text-sm text-center text-zinc-100">
                                <Link
                                    href={`/event/${paramsResolved.id}/post/post`}
                                    className="flex items-center justify-center gap-2 font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                                >
                                    <PlusCircle size={18} />
                                    Clique aqui para criar seu post
                                </Link>
                            </div>
                            {posts.map((post) => (
                                <div key={post.id} data-key={post.id} style={{ minHeight: MIN_ROW_HEIGHT }}>
                                    <PostCard post={post} paramsResolved={paramsResolved} />
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>

            {/* Refresh Prompt Overlay */}
            <div
                style={{ bottom: '20px' }}
                className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${showRefreshPrompt ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}>
                <button
                    onClick={handleManualRefresh}
                    className="flex bg-black items-center gap-2 rounded-full border border-white/30 bg-black/80 px-6 py-3 text-sm font-semibold text-white shadow-2xl backdrop-blur-md hover:bg-zinc-800 disabled:opacity-50"
                >
                    <RefreshCw size={18} />
                    Novas atualizações
                </button>
            </div>
        </div>
    )
}

// Componente PostCard e Types permanecem os mesmos...

type PostCardProps = {
    post: SqlResponse;
    paramsResolved: { id: string };
};

const PostCard = ({ post, paramsResolved }: PostCardProps) => (
    <Link href={`/event/${paramsResolved.id}/post/details/${post.id}`} className="relative group">
        <div className="w-full h-full relative overflow-hidden bg-zinc-900 rounded-xl border border-zinc-800">
            <div className="w-full h-full flex items-center justify-center bg-black/40">
                {post.type === 'Photo' && (
                    <img
                        src={post.path}
                        className="max-w-full max-h-full object-contain"
                        alt={`${post.firstName} ${post.lastName}`}
                    />
                )}

                {post.type === 'Video' && (
                    <video
                        src={post.path}
                        className="max-w-full max-h-full object-contain"
                        muted
                        playsInline
                        preload="metadata"
                    />
                )}
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent flex items-end justify-between p-2">
                <div className="flex items-center gap-1.5 min-w-0">
                    <img
                        src={post.avatar_path}
                        className="w-5 h-5 rounded-full border border-white/80 shrink-0"
                        alt={`${post.firstName} ${post.lastName}`}
                    />
                    <span className="text-[10px] text-zinc-100 font-medium truncate">
                        {post.firstName} {post.lastName}
                    </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-zinc-200 shrink-0">
                    <Clock size={11} />
                    <span>12s</span>
                </div>
            </div>
        </div>
    </Link>
);


export interface EventClientProps {
    event: EventModel,
    sessionId: string,
    me: UserResponse,
    initialStories: StoryResponse[],
    paramsResolved: { id: string },
    initialPosts: SqlResponse[]
}
