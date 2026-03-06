'use client'
import { ReactNode } from "react"
import { createClient } from '@supabase/supabase-js';
import ButtonIcon from "./button-icon";

export default function GoogleLoginButton({ ...props }: GoogleLoginButton) {
    
    const handleLoginWithGoogle = async () => {
        alert(window.location.origin)
        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
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

export interface GoogleLoginButton {
    iconComponent: ReactNode
    text: string
    background?: string
    color?: string
    borderColor?: string
}
