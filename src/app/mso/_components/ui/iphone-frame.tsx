'use client';

import { ReactNode } from 'react';
import { IoCellularSharp, IoBatteryHalfOutline } from "react-icons/io5";
import { IoIosWifi } from "react-icons/io";
import { useTimezone } from '@/app/mso/_hooks/use-timezone';

interface IPhoneFrameProps {
    children: ReactNode;
    className?: string;
}

export default function IPhoneFrame({ children, className = '' }: IPhoneFrameProps) {
    const currentTime = useTimezone();

    return (
        <div className={`relative w-[390px] h-[844px] bg-black rounded-[60px] p-2 shadow-2xl ${className}`}>
            {/* iPhone 외곽선 */}
            <div className="w-full h-full bg-white rounded-[52px] overflow-hidden relative">
                {/* 노치 영역 */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[126px] h-[30px] bg-black rounded-b-[20px] z-10"></div>
                
                {/* 상태바 영역 */}
                <div className="pt-10 px-6 pb-3">
                    <div className="flex justify-between items-center text-black text-sm font-semibold">
                        <span>{currentTime}</span>
                        <div className="flex items-center space-x-1.5">
                            <IoCellularSharp  className="w-4 h-4 text-black" />
                            <IoIosWifi className="w-5 h-5 text-black" />
                            <IoBatteryHalfOutline className="w-6 h-6 text-black" />
                        </div>
                    </div>
                </div>
                
                {/* 메인 콘텐츠 영역 */}
                <div className="h-[calc(100%-95px)] overflow-y-auto mt-4">
                    {children}
                </div>
                
                {/* 홈 인디케이터 */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-[134px] h-1 bg-black rounded-full"></div>
            </div>
        </div>
    );
}
