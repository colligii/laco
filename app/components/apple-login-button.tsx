'use client'
import { ReactNode } from "react"
import { createClient } from '@supabase/supabase-js';
import ButtonIcon from "./button-icon";

export default function AppleLoginButton({ ...props }: AppleLoginButton) {
    
    const handleLoginWithGoogle = async () => {
        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'apple',
            options: {
                redirectTo: window.location.origin + '/otp_code',
            },
        });;
    }

    return (
        <div onClick={handleLoginWithGoogle}>
            <ButtonIcon {...props}></ButtonIcon>
        </div>

    )
}

export interface AppleLoginButton {
    iconComponent: ReactNode
    text: string
    background?: string
    color?: string
    borderColor?: string
}
