'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLogout } from '@/app/mso/_hooks/use-logout';

interface LogoutConfirmModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function LogoutConfirmModal({ open, onOpenChange }: LogoutConfirmModalProps) {
    const { handleLogout } = useLogout();
    const [isLoading, setIsLoading] = useState(false);

    const handleConfirmLogout = async () => {
        setIsLoading(true);
        try {
            await handleLogout();
            onOpenChange(false);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>로그아웃 확인</DialogTitle>
                    <DialogDescription>
                        정말로 로그아웃하시겠습니까? 현재 작업 중인 내용이 저장되지 않을 수 있습니다.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button 
                        variant="outline" 
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                    >
                        취소
                    </Button>
                    <Button 
                        variant="destructive" 
                        onClick={handleConfirmLogout}
                        disabled={isLoading}
                    >
                        {isLoading ? '로그아웃 중...' : '로그아웃'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
