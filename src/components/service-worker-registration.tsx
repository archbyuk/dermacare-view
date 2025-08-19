'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegistration() {
  useEffect(() => {
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
