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
import { List, RowComponentProps } from 'react-window';
import { time } from 'console';

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

const COMMENT_ITEM_HEIGHT = 100;
const MAX_VISIBLE_COMMENTS = 4;

const EventDetail = ({ event, post, initialComments }: EventDetailProps) => {

  const [comments, setComments] = useState(initialComments);
  const [reaction, setReaction] = useState(post.post_reaction);
  const { setIsLoading } = useLoading();
  const timeoutRef = useRef<NodeJS.Timeout>(null);
  const reactionTimeoutRef = useRef<NodeJS.Timeout>(null);
  const commentElem = useRef<HTMLInputElement>(null);

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
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        commentOnPost();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const commentOnPost = async () => {
    setIsLoading(true);
    try {

      if (commentElem.current?.value?.length) {
        await axios.post('/api/post/comments/' + post.id, { comment: commentElem.current.value });

        commentElem.current.value = '';

        const { data: requestComments } = await axios.get('/api/post/comments/' + post.id);

        if (timeoutRef.current)
          clearTimeout(timeoutRef.current)

        setComments(requestComments);
      }

    } catch (e) {

    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {

    timeoutRef.current = setTimeout(async () => {
      try {
        const { data: requestComments } = await axios.get('/api/post/comments/' + post.id);

        setComments(requestComments);
      } catch (e) {
        setComments(JSON.parse(JSON.stringify(comments)))
      }
    }, 1000 * 30)

    return () => {
      if (timeoutRef.current)
        clearTimeout(timeoutRef.current)
    }
  }, [comments])

  useEffect(() => {

    reactionTimeoutRef.current = setTimeout(async () => {
      try {
        const { data: requestReaction } = await axios.get('/api/post/reaction/' + post.id);

        setReaction(requestReaction);
      } catch (e) {
        setReaction(JSON.parse(JSON.stringify(reaction)))
      }
    }, 1000 * 30)

    return () => {
      if (reactionTimeoutRef.current)
        clearTimeout(reactionTimeoutRef.current)
    }
  }, [reaction])

  const commentsListHeight = Math.min(
    comments.length * COMMENT_ITEM_HEIGHT,
    COMMENT_ITEM_HEIGHT * MAX_VISIBLE_COMMENTS
  );

  const CommentRow = ({ index, style, ariaAttributes }: RowComponentProps) => {
    const comment = comments[index];

    if (!comment) return null;

    return (
      <div
        {...ariaAttributes}
        style={{
          ...style,
          boxSizing: 'border-box',
          height: '100px'
        }}
      >
        <article
          style={{ height: '100px' }}
          className="flex items-center px-2 gap-4 rounded-2xl border border-white/5 bg-white/5 p-5 shadow-[0_15px_30px_rgba(0,0,0,0.35)]"
        >
          <div className="relative">
            <img
              src={comment.user.avatar_path}
              alt="User"
              className="h-12 w-12 rounded-full border border-white/20"
            />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
              {comment.user.firstName} {comment.user.lastName}
            </p>
            <p className="text-base text-white/80 leading-relaxed">
              {comment.comment}
            </p>
          </div>
        </article>
      </div>
    );
  };

  async function patchReaction(reaction: string) {
    setIsLoading(true);
    try {

        await axios.patch('/api/post/reaction/' + post.id, { reaction });

        const { data: requestReaction } = await axios.get('/api/post/reaction/' + post.id);

        if (reactionTimeoutRef.current)
          clearTimeout(reactionTimeoutRef.current)

        setReaction(requestReaction);
      

    } catch (e) {

    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="h-dvh flex flex-col bg-zinc-950 text-white font-sans">
      <Loading />
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
            <div
              className="relative aspect-[9/16] w-full overflow-hidden rounded-3xl bg-black">
              {post.type === 'Photo' && <img
                src={post.post_path}
                alt="Event Content"
                className="h-full absolute w-full object-contain"
              />}

              {post.type === 'Video' && (
                <div className="relative w-full h-full">

                  <video
                    src={post.post_path}
                    playsInline
                    controls
                    className="w-full absolute h-full object-contain bg-black"
                  />


                </div>
              )}

            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/5 bg-white/5 px-5 py-2 text-sm text-white/80">

            <div
              style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}
              className="grid p-2 items-center gap-2 w-full px-3 text-[12px]">
              <div
                onClick={() => patchReaction('Like')}
                className="flex justify-center h-12 rounded-full items-center gap-0.5 px-1"
                style={{ background: reaction.my_reaction === 'Like' ? 'rgba(255, 255, 255, 0.6)' : undefined }}
              >
                <span className="text-sm">👍</span>
                <span className="text-[10px] opacity-80">{reaction.like}</span>
              </div>
              <div
                onClick={() => patchReaction('Smile')}
                className="flex justify-center h-12 rounded-full items-center gap-0.5 px-1"
                style={{ background: reaction.my_reaction === 'Smile' ? 'rgba(255, 255, 255, 0.6)' : undefined }}
              >
                <span className="text-sm">😁</span>
                <span className="text-[10px] opacity-80">{reaction.smile}</span>
              </div>
              <div
                onClick={() => patchReaction('Clap')}
                className="flex justify-center h-12 rounded-full items-center gap-0.5 px-1"
                style={{ background: reaction.my_reaction === 'Clap' ? 'rgba(255, 255, 255, 0.6)' : undefined }}
              >
                <span className="text-sm">👏</span>
                <span className="text-[10px] opacity-80">{reaction.clap}</span>
              </div>
              <div
                onClick={() => patchReaction('Heart')}
                className="flex justify-center h-12 rounded-full items-center gap-0.5 px-1"
                style={{ background: reaction.my_reaction === 'Heart' ? 'rgba(255, 255, 255, 0.6)' : undefined }}
              >
                <span className="text-sm">❤️</span>
                <span className="text-[10px] opacity-80">{reaction.heart}</span>
              </div>
            </div>
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
          <div className="rounded-2xl pb-4border border-white/10 bg-white/5">
            <List
              rowCount={comments.length}
              rowHeight={COMMENT_ITEM_HEIGHT}
              width="100%"
              className="overflow-y-auto"
              style={{ height: commentsListHeight || COMMENT_ITEM_HEIGHT }}
              rowComponent={CommentRow}
              rowProps={{}}
              overscanCount={2}
            />
          </div>
        </section>
      </main>

      <footer className="border-t p-4 border-white/5 bg-zinc-950/80 px-4 py-5">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <input
              ref={commentElem}
              type="text"
              placeholder="Deixe seu comentário"
              className="w-full rounded-full border border-white/40 bg-transparent py-3 px-5 text-sm text-white placeholder:text-white/50 focus:border-white focus:outline-none"
            />
          </div>
          <button
            onClick={commentOnPost}
            className="rounded-full bg-white/90 p-3 text-sm font-semibold text-black transition hover:bg-white"
          >
            <Send color="white" size={20} />
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
