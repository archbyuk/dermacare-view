'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Stethoscope, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';
import { NavigationMenu, NavigationMenuList } from '@/components/ui/navigation-menu';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import AccountInfo from './account-info';
import NavigationItem from './navigation-item';
import { SideBarItem } from '../_types/side-bar';

// 사이드바 애니메이션:
// animate-in fade-in slide-in-from-left-2 duration-300 delay-100: 페이드 인 및 왼쪽에서 슬라이드 인

export default function ConsoleSideBar() {
    const [folded, setFolded] = useState(false);
    const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
    const pathname = usePathname();
    const router = useRouter();

    // 사이드바 호버 시 미리 로드
    const handlePrefetch = (href: string) => {
        router.prefetch(href);
    };

    const sideBarItems: SideBarItem[] = [
        {
            id: 'treatments',
            title: '시술 관리',
            icon: Stethoscope,
            href: '/mso/treatments'
        },
        {
            id: 'consultations',
            title: '상담 관리',
            icon: MessageSquare,
            href: '/mso/consultations'
        },
    ];

    return (
        <div className="relative">

            {/* 사이드바 전체 영역 */}
            <div className={`h-full bg-white border-r border-gray-200 transition-all duration-300 ease-out flex flex-col
                ${folded ? 'w-14' : 'w-56'}
            `}>
                {/* 사이드바 헤더 */}
                <div className="flex items-center p-4">
                    
                    {/* 사이드바가 접힌 상태일 때 */}
                    {folded && 
                        <div className="flex items-center justify-center w-8 h-8 transition-all duration-300 ease-out">
                            <Image 
                                src="/logo.svg" 
                                alt="FaceFilter"
                                width={32} 
                                height={32}
                                className="w-8 h-8"
                            />
                        </div>
                    }
                    
                    {/* 사이드바가 펼쳐진 상태일 때 */}
                    {!folded && 
                        <h1 className="text-xl font-bold text-gray-900 animate-in fade-in slide-in-from-left-2 duration-300 delay-100">
                            FaceFilter
                        </h1>
                    }
                
                </div>

                {/* 헤더와 메뉴 사이 구분선 */}
                <div className="px-4">
                    <Separator className="bg-gray-200" />
                </div>

                {/* 사이드바 아이템들 */}
                <NavigationMenu className="mt-6 flex-1">
                    <NavigationMenuList className={`flex flex-col space-y-2 ${folded ? 'px-2' : 'px-6'}`}>
                        
                        {/* 사이드바 아이템들 렌더링 */}
                        {sideBarItems.map((item) => {
                            const isActive = pathname === item.href || (item.submenu && item.submenu.some(sub => pathname === sub.href)) || false;
                            const isExpanded = expandedMenu === item.id;
                            
                            return (
                                <NavigationItem
                                    key={item.id}
                                    id={item.id}
                                    title={item.title}
                                    icon={item.icon}
                                    href={item.href}
                                    hasSubmenu={item.hasSubmenu}
                                    submenu={item.submenu}
                                    folded={folded}
                                    isActive={isActive}
                                    isExpanded={isExpanded}
                                    pathname={pathname}
                                    onToggle={(id) => setExpandedMenu(expandedMenu === id ? null : id)}
                                    onPrefetch={handlePrefetch}
                                />
                            );
                        })}
                    </NavigationMenuList>
                </NavigationMenu>

                {/* 메뉴와 사용자 정보 사이 구분선 */}
                <div className="mt-auto px-4">
                    <Separator className="bg-gray-200" />
                </div>

                {/* 하단 사용자 정보 */}
                <AccountInfo folded={folded} />
            </div>

            {/* 사이드바 일체형 토글 버튼*/}
            <Toggle
                pressed={!folded}
                onPressedChange={(pressed) => setFolded(!pressed)}
                className={`
                    absolute top-11 -right-4 w-7 h-7 bg-white border border-gray-100 rounded-lg
                    flex items-center justify-center hover:bg-gray-50 transition-colors
                    shadow-sm z-10
                `}
            >
                {folded ? (
                    <ChevronRight className="w-3 h-3 text-gray-600" />
                ) : (
                    <ChevronLeft className="w-3 h-3 text-gray-600" />
                )}
            </Toggle>
        </div>
    );
}