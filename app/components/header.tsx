import icon from '@/app/img/png/icon.jpeg'
import Image from 'next/image'

export default function Header() {
    return (
        <div className="w-full absolute h-30 gradient flex items-end justify-center pb-4">
            <Image src={icon} alt="icon" width={80} height={80} className="rounded-[50%]" />
        </div>
    )
}