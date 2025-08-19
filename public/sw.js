// Service Worker for DermaCare View PWA
const CACHE_NAME = 'dermacare-v1';
const urlsToCache = [
  '/',
  '/auth',
  '/facefilter_logo.svg',
  '/symbol_facefilter.svg'
];

// Install event - 캐시 초기화
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // 각 파일을 개별적으로 캐시하여 오류 방지
        const cachePromises = urlsToCache.map(url => 
          cache.add(url).catch(err => {
            return null;
          })
        );
        return Promise.all(cachePromises);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activate event - 이전 캐시 정리
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch event - 캐싱 전략
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // API 요청은 네트워크 우선, 캐시 폴백
  if (request.url.includes('/api/') || request.url.includes('/read/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // 성공하면 캐시에 저장
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // 네트워크 실패 시 캐시에서 찾기
          return caches.match(request);
        })
    );
  } else {
    // 정적 파일은 캐시 우선, 네트워크 폴백
    event.respondWith(
      caches.match(request)
        .then((response) => {
          return response || fetch(request);
        })
    );
  }
});

// Background sync - 백그라운드 동작
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // 백그라운드에서 데이터 동기화
      syncData()
    );
  }
});

// 백그라운드 데이터 동기화 함수
async function syncData() {
  try {
    // 시술 데이터 동기화
    const response = await fetch('/api/treatments', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      // 캐시 업데이트
      const cache = await caches.open(CACHE_NAME);
      await cache.put('/api/treatments', new Response(JSON.stringify(data)));
    }
  } catch (error) {
    // 백그라운드 동기화 실패 시 조용히 처리
  }
}

// 메시지 처리 (메인 스레드와 통신)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'BACKGROUND_SYNC') {
    // 백그라운드 동기화 요청
    event.waitUntil(syncData());
  }
});
