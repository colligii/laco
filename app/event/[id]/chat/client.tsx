'use client'

import { ChatResponse, ChatResponseUnique, SqlResponse } from "@/app/api/chat/previous/route";
import { UserResponse } from "@/app/api/user/me/route";
import Loading from "@/app/components/loading"
import { useWebSocket } from "@/app/lib/use-websocket";
import { useLoading } from "@/app/zustand/store";
import { EventModel } from "@/prisma/app/generated/prisma/models";
import axios from "axios";
import { ArrowLeft, Send } from "lucide-react"
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { UIEvent } from "react";
import { v4 as uuidv4 } from "uuid";


const SCROLL_THRESHOLD = 300;
const MAX_CHATS_IN_MEMORY = 40;


export const ChatScreenClient = ({ event, session, chat: initialChat, me }: ChatScreenClient) => {
    
    const { ws, registerMessage, sendMessage: sendMessageWs } = useWebSocket(session.id);
    const listRef = useRef<HTMLDivElement | null>(null);
    const isFetching = useRef(false);
    const stopFetchBottom = useRef(false);
    const stopFetchTop = useRef(false);
    const scrollHeightBeforeUpdate = useRef<number>(0); // Add this
    const [chat, setChat] = useState(initialChat);
    const render = useRef(true);
    const isBottom = useRef(true);
    const messageInput = useRef<HTMLDivElement | null>(null);
    const scrollElement = useRef<HTMLDivElement | null>(null);
    const { setIsLoading } = useLoading();
    const [initialLoading, setInitialLoading] = useState(true);
    const idempotentKey = useRef<string | null>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            stopFetchBottom.current = false;
            stopFetchTop.current = false;
        }, 5000)

        return () => clearInterval(interval);
    }, [])

    useEffect(() => {
        registerMessage((event) => {
            if(event.type === 'receive-message') {
                if(isBottom.current) {
                    const message: ChatResponseUnique = event.data;
                    
                    if(message.id === idempotentKey.current) {
                        idempotentKey.current = null;
                        setIsLoading(false);
                    }

                    setChat((oldChats) => {
                        const slicedOldChats = oldChats.slice(1, oldChats.length);

                        return [...slicedOldChats, message];
                    })
                }
            }
        })
    }, [])

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

    const handlePreviousFetch = async () => {
        try {
            const firstChat = chat[0];
            isFetching.current = true;

            // 1. Capture the height BEFORE the state changes
            if (listRef.current) {
                scrollHeightBeforeUpdate.current = listRef.current.scrollHeight;
            }

            const chatFetch = await axios.get('/api/chat/previous', {
                params: {
                    eventId: event.id,
                    postId: firstChat.id,
                    createdAt: firstChat.created_at
                }
            });

            if (!chatFetch.data.length) {
                stopFetchTop.current = true;
                isFetching.current = false;
                return;
            }

            isBottom.current = false;

            setChat((prevChat) => {
                const oldChat = prevChat.slice(0, 20);

                const uniqueChat = new Map<string, ChatResponseUnique>([
                    ...chatFetch.data.map((p: ChatResponseUnique) => [p.id, p] as const),
                    ...oldChat.map(p => [p.id, p] as const)
                ]).values();
            
                return Array.from(uniqueChat)
            });


            stopFetchTop.current = false;
            
            isFetching.current = false;
            
        } catch (e) {
            stopFetchTop.current = false;
            isFetching.current = false;
        }
    }

    const handleNextFetch = async () => {
        try {
            const lastChat = chat[chat.length - 1];
            isFetching.current = true;

            const chatFetch = await axios.get('/api/chat/next', {
                params: {
                    eventId: event.id,
                    chatId: lastChat.id,
                    createdAt: lastChat.created_at
                }
            })

            if (!chatFetch.data?.length) {
                stopFetchBottom.current = true;
                isFetching.current = false;
                isBottom.current = true;
                return;
            }

            stopFetchTop.current = false;
            setChat((chats) => {
                const oldChatArray = chats.slice(chats.length - 20, chats.length)
                
                const uniqueChat = new Map<string, SqlResponse>([
                    ...oldChatArray.map(p => [p.id, p] as const),
                    ...chatFetch.data.map((p: SqlResponse) => [p.id, p] as const)
                ]).values();
            
                return Array.from(uniqueChat)
            })
            isFetching.current = false;

        } catch (e) {
            isFetching.current = false;
        }
    }

    const scroll = (el?: HTMLDivElement) => {
        if(render.current && el) {
            el.scrollTo?.(0, el?.scrollHeight)
            scrollElement.current = el ?? scrollElement.current;
            setInitialLoading(false);
            render.current = false;
        }
    }

    useEffect(() => {
        if(isBottom.current && scrollElement.current) {
            scrollElement.current.scrollTo?.(0, scrollElement.current.scrollHeight)
        }
    }, chat)

    const sendMessage = () => {
        if(!idempotentKey.current) {
            setIsLoading(true);
            const input = messageInput.current as HTMLInputElement | null;

            if(!input || typeof input.value !== 'string' || !input.value.length)
                return;

            const message = input.value;

            input.value = '';

            idempotentKey.current = idempotentKey.current ?? uuidv4();

            sendMessageWs({ type: 'send-message', data: { message, uuid: idempotentKey.current, eventId: event.id }})
        }
    }

    return (
        <>
            <Loading firstLoading={initialLoading} />
            <div className="h-dvh flex flex-col overflow-hidden bg-zinc-950 text-white">
                

                <div className="flex flex-col flex-1 min-h-0">
                    <header 
                        style={{ paddingTop: '30px', paddingBottom: '30px' }}
                    className="relative flex flex-col items-center border-b border-white/10 px-5">
                        <Link href={`/event/${event.id}`}>
                            <button
                                aria-label="Voltar"
                                style={{ left: '20px', top: '50%', transform: 'translateY(-50%)' }}
                                className=" h-10 w-10 absolute flex items-center justify-center rounded-full border border-white/10 bg-zinc-900/70 text-white transition hover:border-white/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60"
                            >
                                <ArrowLeft size={20} />
                            </button>

                        </Link>
                        <h1 className="text-xl font-semibold tracking-tight">{event.name}</h1>



                    </header>

                    <main className="flex-1 min-h-0 px-5 py-6">
                        <div className="mx-auto flex h-full max-w-3xl flex-col gap-5">
                            <div 
                                ref={el => scroll(el as unknown as HTMLDivElement)}
                                onScroll={handleScroll}
                        
                            className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-4">
                                {chat.map((msg) => (
                                    <div key={msg.id} className={`flex ${msg.user_id === me.id ? 'justify-end' : 'justify-start'}`}>
                                        <div
                                            style={{ background: msg.user_id === me.id ? '#1656AD' : undefined }}
                                            className={`flex rounded-md items-center gap-3 rounded-2xl p-3 shadow-[0_10px_30px_rgba(0,0,0,0.15)] max-w-[80%] ${msg.user_id === me.id
                                                ? 'bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 text-white'
                                                : 'bg-white/5 border border-white/10 text-white'
                                                }`}
                                        >
                                            {msg.user_id !== me.id && (
                                                <div className="relative shrink-0">
                                                    <img src={msg.avatar_path} alt="User" className="w-8 h-8 rounded-full" />
                                                </div>
                                            )}

                                            <div className="flex-1 min-w-0">
                                                <p className="text-[11px] uppercase tracking-[0.3em] text-zinc-400 mb-1">
                                                    {msg.firstName} {msg.lastName}
                                                </p>
                                                <p className="text-sm leading-relaxed">{msg.message}</p>
                                            </div>

                                            {msg.user_id === me.id && (
                                                <div className="relative shrink-0">
                                                    <img src={msg.avatar_path} alt="Eu" className="w-8 h-8 rounded-full border border-white/30" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </main>

                    <footer className="border-t border-white/10 px-5 py-4">
                        <div className="mx-auto flex max-w-3xl gap-3">
                            <input
                                ref={messageInput}
                                type="text"
                                placeholder="Digite sua mensagem"
                                className="flex-1 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white placeholder:text-white/60 focus:border-white focus:outline-none"
                            />
                            <button
                                onClick={sendMessage}
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black transition hover:scale-[1.02] active:scale-95"
                                aria-label="Enviar mensagem"
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </footer>
                </div>
            </div>
        </>
    )
}

export interface ChatScreenClient {
    event: EventModel,
    me: UserResponse,
    session: { id: string },
    chat: ChatResponse
}