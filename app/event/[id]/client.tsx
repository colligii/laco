'use client'

import { ArrowLeft, Clock, MessageCircle, RefreshCw } from "lucide-react";
import TheirStoriesVirtualList from "./their-stories-virtual-list";
import { EventModel, UserModel } from "@/prisma/app/generated/prisma/models";
import { StoryResponse } from "@/app/api/story/status/route";
import { UserResponse } from "@/app/api/user/me/route";
import Link from 'next/link'
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Loading from "@/app/components/loading";
import axios from "axios";
import { useLoading } from "@/app/zustand/store";
import { PostResponse } from "@/app/api/post/status/route";

const REFRESH_PROMPT_INTERVAL_MS = 2 * 60 * 1000;

export default function EventClient({ event, initialStories, initialPosts, me, paramsResolved, videos }: EventClientProps) {

    const router = useRouter();
    const [ stories, setStories ] = useState(initialStories);
    const [ posts, setPosts ] = useState(initialPosts);
    const [ myStory, setMyStory ] = useState(initialStories[0]);
    const [theirStories, setTheirStories] = useState(initialStories.slice(1))
    const { setIsLoading } = useLoading();
    const [lastRefreshTime, setLastRefreshTime] = useState(() => Date.now());
    const [showRefreshPrompt, setShowRefreshPrompt] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleStory = (user_id: string) => {
        router.replace(`/event/${event.id}/story/details/${user_id}`);
    }

    const updateScreen = async () => {
        setIsLoading(true);
        setIsRefreshing(true);

        try {
            const storiesRequest = await axios.get(`/api/story/status?eventId=${paramsResolved.id}`)
            setStories(storiesRequest.data);
        } catch(e) {
            console.log('error')
        } finally {

            setIsRefreshing(false);
            setIsLoading(false);
            setLastRefreshTime(Date.now());
            setShowRefreshPrompt(false);
        }
    }

    const handleManualRefresh = () => {
        return updateScreen();
    }

    useEffect(() => {
        setMyStory(stories[0]);
        setTheirStories(stories.slice(1));
    }, [stories])

    useEffect(() => {
        const interval = setInterval(() => {
            const shouldShow = Date.now() - lastRefreshTime >= REFRESH_PROMPT_INTERVAL_MS;
                if(!showRefreshPrompt)
            setShowRefreshPrompt(shouldShow);
        }, 1000);

        return () => clearInterval(interval);
    }, [lastRefreshTime])


    return (
        <div className="h-dvh bg-zinc-950 text-white flex flex-col overflow-hidden">
            <Loading/>
            <div className="w-full max-w-md mx-auto flex flex-col flex-1 min-h-0">
                <header className="flex items-center justify-between px-5 sm:px-6 py-4 sticky top-0 bg-zinc-950/95 backdrop-blur z-10">
                    <button className="p-2 bg-zinc-900/70 hover:bg-zinc-800 transition-colors rounded-full border border-zinc-800">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-white text-center truncate px-3">
                        {event.name}
                    </h1>
                    <button className="p-2 bg-zinc-900/70 hover:bg-zinc-800 transition-colors rounded-full border border-zinc-800">
                        <MessageCircle size={20} />
                    </button>
                </header>

                <div className="flex gap-4 px-5 sm:px-6 py-4 items-start">
                    <div
                        style={{ minWidth: 'calc(var(--spacing) * 16)' }}
                        className="relative cursor-pointer w-16">
                        <img
                            onClick={() => handleStory(myStory.user_id)}
                            src={me.avatar_url}
                            style={{ "borderColor": myStory.not_viewed ? 'green' : undefined }}
                            className="w-16 h-16 min-w-16 rounded-full object-cover border-2 border-indigo-500/80 p-0.5"
                            alt="Foto sua"
                        />

                        {/* Plus badge */}
                        <Link href={`/event/${paramsResolved.id}/story/post`}>
                            <div className="absolute bg-black -bottom-1 -right-1 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center border-2 border-zinc-900">
                                <span className="text-sm font-bold leading-none">+</span>
                            </div>
                        </Link>
                    </div>


                    <TheirStoriesVirtualList 
                        stories={theirStories}
                        onClick={handleStory}
                    />
                </div>

                <main className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-5 pb-24">
                    <div className="grid grid-cols-4 auto-rows-[90px] sm:auto-rows-[100px] gap-2">
                        {posts.map((post, index) => {

                            return (
                                <Link
                                    href={`/event/${paramsResolved.id}/story/post`}
                                    key={index}
                                    className="relative group"
                                >
                                    <div className="w-full h-full relative overflow-hidden bg-zinc-900 rounded-xl border border-zinc-800">
                                        {post.type === 'Photo' && <img
                                            src={post.path}
                                            className="w-full h-full object-cover opacity-80"
                                            alt="Video thumbnail"
                                            />}

                                        {post.type === 'Video' && <video
                                                src={post.path}
                                                className="w-full h-full object-cover opacity-80"
                                            
                                        />}

                                        

                                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent flex items-end justify-between p-2">
                                            <div className="flex items-center gap-1.5 min-w-0">
                                                <img
                                                    src={post.avatar_path}
                                                    className="w-5 h-5 rounded-full border border-white/80 shrink-0"
                                                    alt={post.firstName+' '+post.lastName}
                                                />
                                                <span className="text-[10px] text-zinc-100 font-medium truncate">{post.firstName} {post.lastName}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-[10px] text-zinc-200 shrink-0">
                                                <Clock size={11} />
                                                <span>12s</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </main>
            </div>

            <div 
                style={{ bottom: '20px', left: '50%', transform: 'translateX(-50%)' }}
                className={`absolute inset-x-0 z-40 flex justify-center transition-all duration-300 ${showRefreshPrompt ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}>
                <button
                    type="button"
                    className="flex items-center gap-2 rounded-full border border-white/30 bg-black px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-black/40 backdrop-blur transition duration-300 hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 disabled:cursor-wait disabled:opacity-60"
                    onClick={handleManualRefresh}
                    disabled={isRefreshing}
                >
                    <RefreshCw size={18} />
                </button>
            </div>

        </div >
    )
}


export interface EventClientProps {
    event: EventModel,
    me: UserResponse,
    initialStories: StoryResponse[],
    paramsResolved: { id: string },
    initialPosts: PostResponse[]
}
