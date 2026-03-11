import { MessageCircle } from "lucide-react"
import Link from "next/link";
import { Ref, RefObject, useEffect, useState } from "react"

export default function ButtonComponent({ chatButtonRef, eventId }: { chatButtonRef: RefObject<((event: any) => void) | null>, eventId: string }) {
    
    const [showRedCircle, setShowRedCircle] = useState(false);

    useEffect(() => {
        chatButtonRef.current = (event: any) => {
            if(event.type === 'receive-message') {
                if(!showRedCircle) {
                    setShowRedCircle(true);
                }
            }
        }

        return () => {chatButtonRef.current = null}
    }, [])

    return (
        <Link href={`/event/${eventId}/chat`}>
            <button className="p-2 relative bg-zinc-900/70 hover:bg-zinc-800 transition-colors rounded-full border border-zinc-800">
                <MessageCircle size={20} />
                {
                    showRedCircle && <div style={{ background: 'red', bottom: '5px' }} className="h-2 w-2 rounded-full absolute"></div>
                }
            </button>
        </Link>
    )
}