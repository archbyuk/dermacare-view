'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export function useTimezone() {
    
    const [currentTime, setCurrentTime] = useState('');
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // useCallback으로 함수 메모이제이션
    const updateTime = useCallback(() => {
        const now = new Date();
        const koreanTime = now.toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            
        });
        setCurrentTime(koreanTime);
    }, []);

    useEffect(() => {
        // 초기 시간 설정
        updateTime();
        
        // 1초마다 시간 업데이트
        intervalRef.current = setInterval(updateTime, 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [updateTime]);

    return currentTime;
}
