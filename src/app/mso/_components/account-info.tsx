import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import Image from 'next/image';
import { useAuthStore } from '@/app/auth/_store/auth-store';
import { SideBarProps } from '@/app/mso/_types/side-bar';
import { useState } from 'react';
import LogoutConfirmModal from '@/components/modals/logout-confirm';

export default function AccountInfo({ folded }: SideBarProps) {
    const { user } = useAuthStore();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    
    return (
        <div className="w-full p-4">
            <div className={`flex items-center ${folded ? 'justify-center' : 'justify-between'}`}>
                <div className="flex items-center">
                    <div className="w-8 h-8 flex items-center justify-center">
                        <Image 
                            src="/logo.svg" 
                            alt="FaceFilter" 
                            width={32} 
                            height={32}
                            className="w-8 h-8"
                        />
                    </div>
                    
                    {!folded && (
                        <div className="ml-3 animate-in fade-in slide-in-from-left-2 duration-300 delay-100">
                            <p className="text-sm font-medium text-gray-900">{user?.username || '사용자'}</p>
                            <p className="text-xs text-gray-500">{user?.role || '역할'}</p>
                        </div>
                    )}
                </div>
                
                {!folded && (
                    <Button 
                        variant="ghost" 
                        size="sm"
                        className="animate-in fade-in slide-in-from-left-2 duration-300 delay-100"
                        onClick={() => setShowLogoutModal(true)}
                    >
                        <LogOut className="w-4 h-4" />
                    </Button>
                )}
            </div>
            
            {/* 로그아웃 확인 모달 */}
            <LogoutConfirmModal 
                open={showLogoutModal} 
                onOpenChange={setShowLogoutModal} 
            />
        </div>
    );
}