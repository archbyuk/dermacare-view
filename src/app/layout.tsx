import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegistration } from "@/components/service-worker-registration";
import ModalManager from "@/components/modals/modal-manager";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

// 메타데이터 설정: manifest, icons, etc
export const metadata: Metadata = {
    title: "FaceFilter",
    description: "페이스필터 시술 관리 프로그램",
    manifest: "/manifest.json",
    icons: {
        icon: [
            { url: "/favicon.ico", sizes: "any" },
            { url: "/app-icon-192x192.png", sizes: "192x192", type: "image/png" },
            { url: "/app-icon-512x512.png", sizes: "512x512", type: "image/png" }
        ],
        apple: [
            { url: "/apple-icon.png", sizes: "180x180", type: "image/png" }
        ]
    }
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: true,
    themeColor: '#000000'
};

export default function RootLayout({ children }: Readonly<{children: React.ReactNode;}>) {
    return (
        <html lang="ko">
            
            <head>
                <meta 
                    name="viewport" 
                    content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no upgrade-insecure-requests" 
                    httpEquiv="Content-Security-Policy"
                />
            </head>
            
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                {children}
                <ServiceWorkerRegistration />
                <ModalManager />
            </body>

        </html>
    );
}
