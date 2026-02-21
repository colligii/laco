import { ReactNode } from "react"

export default function ButtonIcon({ iconComponent, text, color, background, borderColor }: Button) {
    return (
        <button style={{background, color, borderColor}} className="w-full flex items-center justify-center gap-3 border border-white rounded-full p-2 hover:bg-white/10 transition-colors">
          { iconComponent }
          <span className="text-lg">{ text }</span>
        </button>

    )
}

export interface Button {
    iconComponent: ReactNode
    text: string
    background?: string
    color?: string
    borderColor?: string
}
