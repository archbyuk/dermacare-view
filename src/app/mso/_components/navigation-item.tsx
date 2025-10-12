'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { NavigationMenuItem, NavigationMenuLink } from '@/components/ui/navigation-menu';
import { NavigationItemProps } from '../_types/side-bar';

export default function NavigationItem({
    id,
    title,
    icon: Icon,
    href,
    hasSubmenu = false,
    submenu = [],
    folded,
    isActive,
    isExpanded,
    pathname,
    onToggle,
    onPrefetch
}: NavigationItemProps) {
    const router = useRouter();
    
    return (
        <NavigationMenuItem>
            {/* 메인 메뉴 아이템 */}
            <NavigationMenuLink asChild>
                <div
                    className={`flex items-center p-3 rounded-lg transition-colors cursor-pointer ${
                        isActive 
                            ? 'bg-gray-100 text-gray-900' 
                            : 'text-gray-600 hover:bg-gray-50'
                    }`}
                    onClick={() => {
                        if (hasSubmenu) {
                            onToggle(id);
                        } else {
                            router.push(href);
                        }
                    }}
                    onMouseEnter={() => onPrefetch(href)}
                >
                    <div className="relative">
                        <Icon className={`w-5 h-5 flex-shrink-0 transition-colors duration-200 ${
                            isActive ? 'text-gray-900' : 'text-gray-600'
                        }`} />
                    </div>
                    
                    {!folded && (
                        <>
                            <span className="ml-3 font-medium w-30 whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-200 delay-300">
                                {title}
                            </span>
                            {hasSubmenu && (
                                <div className="ml-auto">
                                    {isExpanded ? (
                                        <ChevronUp className="w-4 h-4 text-gray-500" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4 text-gray-500" />
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </NavigationMenuLink>

            {/* 하위 메뉴 */}
            {!folded && hasSubmenu && (
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isExpanded ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                    <div className="ml-6 mt-1 space-y-1">
                        {submenu.map((subItem, index) => (
                            <Link
                                key={index}
                                href={subItem.href}
                                onMouseEnter={() => onPrefetch(subItem.href)}
                                className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                                    pathname === subItem.href
                                        ? 'bg-gray-200 text-gray-900'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                {subItem.title}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </NavigationMenuItem>
    );
}
