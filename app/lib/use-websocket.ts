'use client'

import { useEffect, useRef } from "react"

export const useWebSocket = (sessionId: string) => {

    const ws = useRef<WebSocket | null>(null)
    const messageHandler = useRef<((event: MessageEvent) => void) | null>(null)
    const canReconnect = useRef<boolean>(true);
    const messagePing = useRef<NodeJS.Timeout | null>(null);


    const connect = () => {
        if (ws.current && ws.current.readyState <= WebSocket.OPEN) {
            return
        }

        const socket = new WebSocket(process.env.NEXT_PUBLIC_WEBSOCKET_URL!+'?session='+sessionId)

        socket.onopen = () => {
            console.log("connected")
        }

        socket.onmessage = (event) => {
            if(event.data) {
                try {
                    messageHandler.current?.(JSON.parse(event.data))

                } catch(e) {

                    messageHandler.current?.(event.data)
                }
            }
        }

        socket.onclose = () => {
            if (canReconnect.current) {
                console.log("reconnecting...")
                setTimeout(connect, 1000)
            }
        }

        ws.current = socket
    }

    useEffect(() => {
        if (!ws.current) {
            connect()
        }

        messagePing.current = setInterval(() => {
            if (ws.current?.readyState === WebSocket.OPEN) {
                ws.current.send(JSON.stringify({ type: "ping" }))
            }
        }, 30000)

        return () => {
            if(messagePing.current)
                clearInterval(messagePing.current)
            canReconnect.current = false
            ws.current?.close()
        }
    }, [])

    return {
        ws,
        stopReconnect: () => {
            canReconnect.current = false;
        },
        registerMessage: (cb: (event: MessageEvent) => void) => {
            messageHandler.current = cb
        }
    }
}