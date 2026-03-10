'use client'

import { ArrowLeft, Clock, MessageCircle } from "lucide-react";
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

export default function EventClient({ event, initialStories, me, paramsResolved, videos }: EventClientProps) {

    const router = useRouter();
    const [ stories, setStories ] = useState(initialStories);
    const [ myStory, setMyStory ] = useState(initialStories[0]);
    const [theirStories, setTheirStories] = useState(initialStories.slice(1))
    const { setIsLoading } = useLoading();

    const handleStory = (user_id: string) => {
        router.replace(`/event/${event.id}/story/details/${user_id}`);
    }

    const updateScreen = async () => {
        setIsLoading(true);

        try {
            const storiesRequest = await axios.get(`/api/story/status?eventId=${paramsResolved.id}`)
            setStories(storiesRequest.data);
        } catch(e) {
            console.log('error')
        } finally {

            setIsLoading(false);
        }
    }

    useEffect(() => {
        setMyStory(stories[0]);
        setTheirStories(stories.slice(1));
    }, [stories])


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
                        {videos.map((_, index) => {
                            const pattern = index % 6;
                            const tileClass =
                                pattern === 0
                                    ? 'col-span-2 row-span-2'
                                    : pattern === 1
                                        ? 'col-span-2 row-span-1'
                                        : pattern === 2
                                            ? 'col-span-1 row-span-2'
                                            : pattern === 3
                                                ? 'col-span-1 row-span-1'
                                                : pattern === 4
                                                    ? 'col-span-1 row-span-1'
                                                    : 'col-span-2 row-span-1';

                            return (
                                <Link
                                    href={`/event/${paramsResolved.id}/story/post`}
                                    key={index}
                                    className={`${tileClass} relative group`}
                                >
                                    <div className="w-full h-full relative overflow-hidden bg-zinc-900 rounded-xl border border-zinc-800">
                                        <img
                                            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c"
                                            className="w-full h-full object-cover opacity-80"
                                            alt="Video thumbnail"
                                        />

                                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent flex items-end justify-between p-2">
                                            <div className="flex items-center gap-1.5 min-w-0">
                                                <img
                                                    src="https://github.com/shadcn.png"
                                                    className="w-5 h-5 rounded-full border border-white/80 shrink-0"
                                                    alt="Convidado"
                                                />
                                                <span className="text-[10px] text-zinc-100 font-medium truncate">Convidado</span>
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

        </div >
    )
}


export interface EventClientProps {
    event: EventModel,
    me: UserResponse,
    initialStories: StoryResponse[],
    paramsResolved: { id: string },
    videos: any[]
}