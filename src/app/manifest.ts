import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'FaceFilter',
        short_name: 'FFilter',
        description: '페이스필터 시술 관리 앱',
        start_url: '/',
        display: 'fullscreen',
        background_color: '#ffffff',
        theme_color: '#000000',
        orientation: 'portrait',
        scope: '/',
        lang: 'ko',
        icons: [
            {
                src: '/app-icon-192x192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any'
            },
            {
                src: '/app-icon-192x192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'maskable'
            },
            {
                src: '/app-icon-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any'
            },
            {
                src: '/app-icon-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable'
            }
        ]
    }
}