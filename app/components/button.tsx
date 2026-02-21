import { ReactNode } from "react"

export default function Button({ children, color, background, borderColor }: Button) {
    return (
        <button style={{background, color, borderColor}} className="w-full flex items-center justify-center gap-3 border border-white rounded-full p-2 hover:bg-white/10 transition-colors">
          <span className="text-lg">{ children }</span>
        </button>

    )
}

export interface Button {
    children: string;
    background?: string
    color?: string
    borderColor?: string
}
