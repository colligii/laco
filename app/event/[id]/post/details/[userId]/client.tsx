'use client'

import { UserIdStoryResponse } from "@/app/api/story/getData/[userId]/route"
import Loading from "@/app/components/loading"
import { useLoading } from "@/app/zustand/store"
import axios from "axios"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

const formatElapsedTime = (dateInput: string | Date) => {
    const date = new Date(dateInput)
    const timestamp = date.getTime()

    if (Number.isNaN(timestamp)) return "0s"

    const totalSeconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000))
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    if (hours)
        return `${hours}h`

    if (minutes)
        return `${minutes}m`

    return `${seconds}s`
}

export const StoryClient = ({ initialStories, id, initialStoryIndex }: StoryClient) => {
    
    const [stories, setStories] = useState(initialStories);
    const [storyIndex, setStoryIndex] = useState(initialStoryIndex)
    const [progress, setProgress] = useState(0)
    const [isPaused, setIsPaused] = useState(false)
    const [isVideoPlaying, setIsVideoPlaying] = useState(false)
    const [videoDuration, setVideoDuration] = useState<number | null>(null)
    const [showPlayButton, setShowPlayButton] = useState(false)

    const router = useRouter();
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const { setIsLoading } = useLoading();

    const actualStory = stories.stories[storyIndex]
    const convertDate = formatElapsedTime(actualStory.created_at)

    // marcar como visualizado
    useEffect(() => {
        const story = stories.stories[storyIndex]

        if (story.not_viewed) {
            axios.patch(`/api/story/setAsViewed/${story.id}`).catch(() => { })
        }

    }, [storyIndex])

    // preload próximo story
    useEffect(() => {
        const next = stories.stories[storyIndex + 1]
        if (!next) return

        if (next.type === "Photo") {
            const img = new Image()
            img.src = next.path
        }

        if (next.type === "Video") {
            const video = document.createElement("video")
            video.src = next.path
            video.preload = "metadata"
        }

    }, [storyIndex])


    // timer de progresso
    useEffect(() => {

        const story = stories.stories[storyIndex]

        let duration = 15000

        if (story.type === "Video" && videoDuration) {
            duration = videoDuration * 1000
        }

        if (isPaused) return
        if (story.type === "Video" && !isVideoPlaying) return

        const start = Date.now() - progress * duration

        const interval = setInterval(() => {

            const elapsed = Date.now() - start
            const percent = elapsed / duration

            if (percent >= 1) {

                clearInterval(interval)

                if (storyIndex < stories.stories.length - 1) {
                    setStoryIndex(prev => prev + 1)
                    setProgress(0)
                    setVideoDuration(null)
                } else {
                    setIsLoading(true);
                    if (stories.next_user_id)
                        window.location.href = (`/event/${id}/story/details/${stories.next_user_id}`)
                    else
                        window.location.href = '/event/' + id;
                }

                return
            }

            setProgress(percent)

        }, 50)

        return () => clearInterval(interval)

    }, [storyIndex, isPaused, isVideoPlaying, videoDuration])

    useEffect(() => {
        setProgress(0)
        setVideoDuration(null)
        setShowPlayButton(false)
        setIsVideoPlaying(false)
    }, [storyIndex])


    const onVideoLoaded = (e: React.SyntheticEvent<HTMLVideoElement>) => {
        const duration = e.currentTarget.duration
        setVideoDuration(duration)
    }


    const tryPlay = async (video: HTMLVideoElement) => {

        videoRef.current = video

        try {
            await video.play()
            setIsVideoPlaying(true)
        } catch {
            setIsVideoPlaying(false)
            setShowPlayButton(true)
        }
    }


    const playManually = () => {
        videoRef.current?.play()
        setIsVideoPlaying(true)
        setShowPlayButton(false)
    }

    const goToPreviousStory = () => {
        if (storyIndex > 0) {
            setStoryIndex(prev => prev - 1)
            return;
        }

        if (stories.previous_user_id)
            setIsLoading(true)
        window.location.href = (`/event/${id}/story/details/${stories.previous_user_id}`)
    }

    const goToNextStory = () => {
        if (storyIndex < stories.stories.length - 1) {
            setStoryIndex(prev => prev + 1)
        } else {
            setIsLoading(true);
            if (stories.next_user_id)
                window.location.href = (`/event/${id}/story/details/${stories.next_user_id}`)
            else
                window.location.href = '/event/' + id;
        }
    }

    const patchReaction = (reaction: string) => {
        setIsPaused(true);
        setIsLoading(true);

        axios.patch(`/api/story/reaction/${stories.stories[storyIndex].id}`, {
            reaction
        })
            .then(({ data }) => {
                setStories((storiesProp) => {
                    storiesProp.stories[storyIndex] = {
                        ...storiesProp.stories[storyIndex],
                        ...data
                    };

                    return storiesProp
                })  
            })
            .catch(() => {})
            .finally(() => {
                setIsPaused(false);
                setIsLoading(false);
            })

    }

    return (
        <div
            className="h-dvh bg-black text-white flex flex-col overflow-hidden"
            onMouseDown={() => setIsPaused(true)}
            onMouseUp={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
        >
            <Loading />

            <div className="relative flex-1">

                {actualStory.type === 'Photo' && (
                    <img
                        src={actualStory.path}
                        className="w-full h-full object-cover"
                    />
                )}

                {actualStory.type === 'Video' && (
                    <div className="relative w-full h-full">

                        <video
                            src={actualStory.path}
                            ref={(el) => {
                                if (el) tryPlay(el)
                            }}
                            playsInline
                            onLoadedMetadata={onVideoLoaded}
                            onPlay={() => setIsVideoPlaying(true)}
                            onPause={() => setIsVideoPlaying(false)}
                            onWaiting={() => setIsVideoPlaying(false)}
                            onEnded={() => setIsVideoPlaying(false)}
                            className="w-full h-full object-contain bg-black"
                        />

                        {showPlayButton && (
                            <button
                                onClick={playManually}
                                className="absolute inset-0 flex items-center justify-center text-white text-3xl"
                            >
                                ▶
                            </button>
                        )}

                    </div>
                )}


                {/* header */}
                <div
                    style={{ zIndex: '2000' }}
                    className="absolute inset-x-0 top-0 z-20 w-full bg-gradient-to-b from-black/80 to-transparent px-4 pt-4 pb-3"
                >
                    {/* progress bar */}
                    <div className="flex items-center gap-2 mb-3 overflow-hidden">
                        {stories.stories.map((_, index) => {
                            let width = "0%"

                            if (index < storyIndex) width = "100%"
                            if (index === storyIndex) width = `${progress * 100}%`

                            return (
                                <div key={index} className="h-1 flex-1 rounded-full bg-white/35 overflow-hidden">
                                    <div
                                        className="h-full bg-white transition-all"
                                        style={{ width }}
                                    />
                                </div>
                            )
                        })}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
                        <div className="flex items-center gap-3 min-w-0">

                            <Link
                                href={`/event/${id}`}
                                style={{ zIndex: '2000' }}
                                className="p-2 bg-black/40 relative rounded-full border border-white/20"
                            >
                                <ArrowLeft size={18} />
                            </Link>

                            <img
                                src={stories.avatar_path}
                                className="w-9 h-9 rounded-full border border-white/30"
                            />

                            <div className="flex min-w-0 flex-col gap-1">
                                <span className="text-sm font-semibold leading-none truncate">
                                    {stories.firstName} {stories.lastName}
                                </span>
                                <span className="text-xs text-white/70">
                                    {convertDate}
                                </span>
                            </div>

                        </div>
                    </div>
                </div>


            </div>

            <div style={{ zIndex: 3000, bottom: '70px' }} className="absolute left-4 z-20 flex gap-1 rounded-full border border-white/10 bg-black/40 py-1.5 px-4 backdrop-blur-sm">
                {/** react component */}
                <div 
                    onClick={() => patchReaction('Like')}
                    className="flex justify-center h-8 rounded-full items-center gap-0.5 px-1"
                    style={{ width: '50px', background: stories.stories[storyIndex].my_reaction === 'Like' ? 'rgba(255, 255, 255, 0.6)' : undefined }}
                    >
                    <span className="text-sm">👍</span>
                    <span className="text-[10px] opacity-80">{stories.stories[storyIndex].like}</span>
                </div>
                <div 
                    onClick={() => patchReaction('Smile')}
                    className="flex justify-center h-8 rounded-full items-center gap-0.5 px-1"
                    style={{ width: '50px', background: stories.stories[storyIndex].my_reaction === 'Smile' ? 'rgba(255, 255, 255, 0.6)' : undefined }}
                    >
                    <span className="text-sm">😁</span>
                    <span className="text-[10px] opacity-80">{stories.stories[storyIndex].smile}</span>
                </div>
                <div 
                    onClick={() => patchReaction('Clap')}
                    className="flex justify-center h-8 rounded-full items-center gap-0.5 px-1"
                    style={{ width: '50px', background: stories.stories[storyIndex].my_reaction === 'Clap' ? 'rgba(255, 255, 255, 0.6)' : undefined }}
                    >
                    <span className="text-sm">👏</span>
                    <span className="text-[10px] opacity-80">{stories.stories[storyIndex].clap}</span>
                </div>
                <div 
                    onClick={() => patchReaction('Heart')}
                    className="flex justify-center h-8 rounded-full items-center gap-0.5 px-1"
                    style={{ width: '50px', background: stories.stories[storyIndex].my_reaction === 'Heart' ? 'rgba(255, 255, 255, 0.6)' : undefined }}
                >
                    <span className="text-sm">❤️</span>
                    <span className="text-[10px] opacity-80">{stories.stories[storyIndex].heart}</span>
                </div>

            </div>

            <button
                type="button"
                aria-label="Previous story"
                onClick={goToPreviousStory}
                style={{ width: '22vw', zIndex: '1000' }}
                className="absolute left-0 top-0 h-full"
            />

            <button
                type="button"
                aria-label="Next story"
                onClick={goToNextStory}
                style={{ width: '22vw', zIndex: '1000' }}
                className="absolute right-0 top-0 h-full"
            />
        </div>
    )
}

export interface StoryClient {
    initialStoryIndex: number
    id: string
    initialStories: UserIdStoryResponse
}
