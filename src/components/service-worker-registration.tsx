'use client';

import { useEffect } from 'react';

// Tauri 타입 정의
declare global {
    interface Window {
        __TAURI__?: {
            invoke: (command: string, args?: Record<string, unknown>) => Promise<unknown>;
            event: {
                listen: (event: string, handler: (event: unknown) => void) => Promise<() => void>;
                emit: (event: string, payload?: unknown) => Promise<void>;
            };
            os: {
                platform: () => Promise<string>;
                arch: () => Promise<string>;
            };
        };
    }
}

export function ServiceWorkerRegistration() {

    useEffect(() => {
        
        // Tauri 환경에서는 Service Worker 비활성화
        if (window.__TAURI__) {
            console.log('Running in Tauri, Service Worker disabled');
            return;
        }

        if ('serviceWorker' in navigator) {
            // 기존 Service Worker들 제거
            navigator.serviceWorker.getRegistrations().then((registrations) => {
                for (const registration of registrations) {
                    registration.unregister();
                }
            });

            // 새 Service Worker 등록
            navigator.serviceWorker.register('/sw.js')
                .then(() => {
                    // Service Worker 등록 성공
                    console.log('Service Worker registered successfully');
                })
                
                .catch(() => {
                    // Service Worker 등록 실패 시 조용히 처리
                    console.warn('Service Worker registration failed');
                });
        }
    }, []);

    return null;
}
