'use client';

import icon from '@/app/img/png/icon.jpeg'
import Image from 'next/image'
import Back from '../img/svg/back';
import Link from 'next/link';

export default function Header({ disableIcon, disableBackBtn, href, onBackClick }: Header) {
    const handleBackClick = (e: React.MouseEvent) => {
        if (onBackClick && typeof href === 'string') {
            e.preventDefault();
            onBackClick(href);
        }
    };

    return (
        <div className="relative w-full absolute h-30 gradient flex items-end justify-center pb-4">
            {
                !disableIcon &&
                <Image src={icon} alt="icon" width={80} height={80} className="rounded-[50%]" />
            }
            {
                !disableBackBtn &&
                <div className="absolute top-10 left-4 bg-white p-2 rounded-full">
                    {
                        typeof href === 'string' ? (
                            onBackClick ? (
                                <button type="button" onClick={handleBackClick} className="cursor-pointer block">
                                    <Back squareSize={18} />
                                </button>
                            ) : (
                                <Link href={href}>
                                    <Back squareSize={18} />
                                </Link>
                            )
                        ) : (
                            <Back squareSize={18} />
                        )
                    }
                </div>
            }
        </div>
    )
}

export interface Header {
    disableIcon?: boolean;
    href?: string;
    disableBackBtn?: boolean;
    onBackClick?: (href: string) => void;
}