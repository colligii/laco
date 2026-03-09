'use client'

import { UserIdStoryResponse } from "@/app/api/story/getData/[userId]/route"
import axios from "axios"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
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

export const StoryClient = ({ stories, id, initialStoryIndex }: StoryClient) => {

    const [storyIndex, setStoryIndex] = useState(initialStoryIndex)
    const [progress, setProgress] = useState(0)
    const [isPaused, setIsPaused] = useState(false)
    const [isVideoPlaying, setIsVideoPlaying] = useState(false)
    const [videoDuration, setVideoDuration] = useState<number | null>(null)
    const [showPlayButton, setShowPlayButton] = useState(false)

    const videoRef = useRef<HTMLVideoElement | null>(null)

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
        }
    }

    const goToNextStory = () => {
        if (storyIndex < stories.stories.length - 1) {
            setStoryIndex(prev => prev + 1)
        }
    }


    return (
        <div
            className="h-dvh bg-black text-white flex flex-col overflow-hidden"
            onMouseDown={() => setIsPaused(true)}
            onMouseUp={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
        >

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
                <div style={{ zIndex: '2000' }} className="absolute inset-x-0 z-20 w-full top-0 p-4 bg-gradient-to-b from-black/70 to-transparent">

                    {/* progress bar */}
                    <div className="flex items-center gap-2 mb-3">
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


                    <div className="flex items-center justify-between pt-4">

                        <div className="flex items-center gap-3">

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

                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold leading-none">
                                    {stories.firstName} {stories.lastName}
                                </span>
                                <span className="text-xs text-white/70">{convertDate}</span>
                            </div>

                        </div>

                    </div>

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
    stories: UserIdStoryResponse
}
