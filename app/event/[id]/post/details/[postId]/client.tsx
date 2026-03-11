'use client'

import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, MessageCircle, Clock, Download, Send } from 'lucide-react';
import { EventModel, PostModel } from '@/prisma/app/generated/prisma/models';
import { PostIdResponse } from '@/app/api/post/getData/[id]/route';
import Link from 'next/link';
import { useLoading } from '@/app/zustand/store';
import Loading from '@/app/components/loading';
import { CommentByIdResponse } from '@/app/api/post/comments/[id]/route';
import axios from 'axios';

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

const EventDetail = ({ event, post, initialComments }: EventDetailProps) => {
  const reactions = [
    { emoji: "👍", count: 12 },
    { emoji: "😁", count: 12 },
    { emoji: "👏", count: 12 },
    { emoji: "❤️", count: 12 },
  ];

  const [ comments, setComments ] = useState(initialComments);
  const { setIsLoading } = useLoading();
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  const downloadPost = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(post.post_path)
      const blob = await response.blob()
      
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement("a")
      a.href = url
      
      const extension = post.type === "Video" ? "mp4" : "jpg"
      a.download = `post-${post.id}.${extension}`
      
      document.body.appendChild(a)
      a.click()
      
      a.remove()
      URL.revokeObjectURL(url)
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
    }
  }

  useEffect(() => {

    timeoutRef.current = setTimeout(async () => {
      try {
        const { data: requestComments } = await axios.get('/api/post/comments/'+post.id);

        setComments(requestComments);
      } catch(e) {
        setComments(JSON.parse(JSON.stringify(comments)))
      }
    }, 3000)

    return () => {
      if(timeoutRef.current)
        clearTimeout(timeoutRef.current)
    }
  }, [comments])

  return (
    <div className="h-dvh flex flex-col bg-zinc-950 text-white font-sans">
      <Loading/>
      <header className="relative flex items-center justify-center px-4 py-5 border-b border-white/5">
        <Link href={`/event/${event.id}`}>
          <button className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
            <ArrowLeft size={24} />
          </button>
        </Link>

        <div style={{ padding: '30px 0px' }} className="text-center">
          <h1 className="text-xl font-semibold tracking-tight">{event.name}</h1>
        </div>

        <button className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
          <MessageCircle size={24} />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        <section className="mx-auto w-full max-w-3xl">
          <div className="relative rounded-3xl border border-white/5 bg-gradient-to-b from-white/5 to-transparent p-1">
            <div className="relative aspect-[9/16] w-full overflow-hidden rounded-3xl bg-black">
              {post.type === 'Photo' && <img
                src={post.post_path}
                alt="Event Content"
                className="h-full w-full object-contain"
              />}

              {post.type === 'Video' && (
                <div className="relative w-full h-full">

                  <video
                    src={post.post_path}
                    playsInline
                    controls
                    className="w-full h-full object-contain bg-black"
                  />


                </div>
              )}

              <div className="absolute bottom-5 left-5 flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-[12px] backdrop-blur">
                {reactions.map((reaction, index) => (
                  <span key={index} className="flex items-center gap-1 rounded-full border border-white/20 bg-black/40 px-2 py-1">
                    <span className="text-base leading-none">{reaction.emoji}</span>
                    <span className="opacity-80 text-[11px]">{reaction.count}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/5 bg-white/5 px-5 py-4 text-sm text-white/80">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={post.avatar_path}
                  alt="Avatar"
                  className="h-12 w-12 rounded-full border border-white/20"
                />
              </div>
              <div>
                <p className="text-base font-bold">{post.firstName} {post.lastName}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-zinc-300">
              <button
                onClick={downloadPost}
                className="hover:text-white transition-colors">
                <Download size={20} />
              </button>

              <div className="flex items-center gap-1 text-xs">
                <Clock size={18} />
                <span>{formatElapsedTime(post.created_at)}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-3xl space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Comentários</h2>
          </div>
          <div className="space-y-3">
            {comments.map((comment) => (
              <article
                key={comment.id}
                className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <div className="relative">
                  <img
                      src={comment.user.avatar_path}
                    alt="User"
                    className="h-10 w-10 rounded-full border border-white/20"
                  />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-zinc-500">{comment.user.firstName} {comment.user.lastName}</p>
                  <p className="text-sm text-white/80 leading-relaxed">{comment.comment}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 bg-zinc-950/80 px-4 py-5">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Deixe seu comentário"
              className="w-full rounded-full border border-white/40 bg-transparent py-3 px-5 text-sm text-white placeholder:text-white/50 focus:border-white focus:outline-none"
            />
          </div>
          <button className="rounded-full bg-white/90 p-3 text-sm font-semibold text-black transition hover:bg-white">
            <Send size={20} />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default EventDetail;

export interface EventDetailProps {
  event: EventModel,
  post: PostIdResponse,
  initialComments: CommentByIdResponse[]
}