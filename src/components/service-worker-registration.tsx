'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // 기존 Service Worker들 제거
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (let registration of registrations) {
          registration.unregister();
        }
      });

      // 새 Service Worker 등록
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          // Service Worker 등록 성공
        })
        .catch((registrationError) => {
          // Service Worker 등록 실패 시 조용히 처리
        });
    }
  }, []);

  return null;
}
