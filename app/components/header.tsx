import icon from '@/app/img/png/icon.jpeg'
import Image from 'next/image'
import Back from '../img/svg/back';

export default function Header({ disableIcon, disableBackBtn }: Header) {
    return (
        <div className="relative w-full absolute h-30 gradient flex items-end justify-center pb-4">
            {
                !disableIcon && 
                <Image src={icon} alt="icon" width={80} height={80} className="rounded-[50%]" />
            }
            {
                !disableBackBtn && 
                <div className="absolute top-10 left-4 bg-white p-2 rounded-full">
                    <Back squareSize={18}/>
                </div>    
            }
        </div>
    )
}

export interface Header {
    disableIcon?: boolean;
    disableBackBtn?: boolean;
}