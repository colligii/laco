'use client'

import { UserIdStoryResponse } from "@/app/api/story/getData/[userId]/route"
import axios from "axios"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

export const StoryClient = ({ stories, id, initialStoryIndex }: StoryClient) => {
    const [storyIndex, setStoryIndex] = useState(initialStoryIndex);
    const [renderType, setRenderType] = useState('photo');    


    useEffect(() => {
        setRenderType('photo')
        const story = stories.stories[storyIndex];

        axios.patch(`/api/story/setAsViewed/${story.id}`)
            .then(() => {
                console.log('Marcado como visualizado com suceso')
            })
            .catch(() => {
                console.log('Erro ao marcar como visualizado');
            })

    }, [storyIndex])

    function onImageRenderError() {
        console.log('error');
    }

    const actualStory = stories.stories[storyIndex];

    return (
        <div className="h-dvh bg-black text-white flex flex-col overflow-hidden">
            <div className="relative flex-1">
                {renderType === 'photo' && <img
                    src={actualStory.path}
                    alt="Story content"
                    className="w-full h-full object-cover"
                    onError={onImageRenderError}
                />}

                {
                renderType === 'video' && 
                  <video src={actualStory.path}  className="w-full h-full object-contain bg-black" />
                }

                <div className="absolute inset-x-0 top-0 p-4 bg-gradient-to-b from-black/70 to-transparent">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="h-1 flex-1 rounded-full bg-white/35 overflow-hidden">
                            <div className="h-full w-1/2 bg-white" />
                        </div>
                        <div className="h-1 flex-1 rounded-full bg-white/35" />
                        <div className="h-1 flex-1 rounded-full bg-white/35" />
                    </div>

                    <div className="flex items-center justify-between pt-4">
                        <div className="flex items-center gap-3">
                            <Link
                                href={`/event/${id}`}
                                className="p-2 bg-black/40 rounded-full border border-white/20"
                                aria-label="Voltar"
                            >
                                <ArrowLeft size={18} />
                            </Link>
                            <img
                                src="https://github.com/shadcn.png"
                                className="w-9 h-9 rounded-full border border-white/30"
                                alt="Avatar"
                            />
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold leading-none">{stories.firstName} {stories.lastName}</span>
                                <span className="text-xs text-white/70">2h</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export interface StoryClient {
    initialStoryIndex: number,
    id: string,
    stories: UserIdStoryResponse
}