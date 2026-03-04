'use client'

import { RefObject, useRef } from "react"

export default function OtpCodeForm() {
    
    const firstCodeRef = useRef<HTMLInputElement>(null);
    const secondCodeRef = useRef<HTMLInputElement>(null);
    const thirdCodeRef = useRef<HTMLInputElement>(null);
    const fourthCodeRef = useRef<HTMLInputElement>(null);
    const fifthCodeRef = useRef<HTMLInputElement>(null);
    const sixthCodeRef = useRef<HTMLInputElement>(null);

    const setAllCode = (input: HTMLInputElement) => {
        const value = input.value;
        
        input.value = '';
        console.log(value.length)

        if(value.length !== 6)
            return;

        firstCodeRef.current!.value = value[0];
        secondCodeRef.current!.value = value[1];
        thirdCodeRef.current!.value = value[2];
        fourthCodeRef.current!.value = value[3];
        fifthCodeRef.current!.value = value[4];
        sixthCodeRef.current!.value = value[5];

        submitCode();
    }

    const validateField = (refElement: RefObject<HTMLInputElement | null>, nextRefElem?: RefObject<HTMLInputElement | null>, submit?: boolean) => {
        return () => {
            const input = refElement.current;
            const nextInput = nextRefElem?.current;

            if(!input)
                return;

            input.value = input.value.replace(/[^0-9]{1,}/ig, '');

            if(/^[0-9]{1,1}$/.test(input.value)) {
                if(nextInput)
                    nextInput.focus();

                if(submit)
                    submitCode();

                return;
            }

            if(/^[0-9]{6,6}$/.test(input.value)) {
                return setAllCode(input);
            }

            input.value = '';
        }
    }

    const submitCode = () => {
        //TODO implement submit code
    }
    
    return (
        <div className="flex gap-2 w-90 justify-center">

            <input ref={firstCodeRef} onInput={validateField(firstCodeRef, secondCodeRef)} className="w-10 h-10 border-1 rounded-full text-center"/>
            <input ref={secondCodeRef} onInput={validateField(secondCodeRef, thirdCodeRef)} className="w-10 h-10 border-1 rounded-full text-center"/>
            <input ref={thirdCodeRef} onInput={validateField(thirdCodeRef, fourthCodeRef)} className="w-10 h-10 border-1 rounded-full text-center"/>
            <input ref={fourthCodeRef} onInput={validateField(fourthCodeRef, fifthCodeRef)} className="w-10 h-10 border-1 rounded-full text-center"/>
            <input ref={fifthCodeRef} onInput={validateField(fifthCodeRef, sixthCodeRef)} className="w-10 h-10 border-1 rounded-full text-center"/>
            <input ref={sixthCodeRef} onInput={validateField(sixthCodeRef, undefined, true)} className="w-10 h-10 border-1 rounded-full text-center"/>

        </div>
    )
}