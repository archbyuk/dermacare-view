import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegistration } from "@/components/service-worker-registration";
import ModalManager from "@/components/modals/modal-manager";
import { Toaster } from "react-hot-toast";
import { AlertCircle, CheckCircle } from "lucide-react";

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
                />
            </head>
            
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                {children}
                <ServiceWorkerRegistration />
                <ModalManager />
                <Toaster 
                    position="top-center"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: '#363636',
                            color: '#fff',
                            fontSize: '14px',
                            padding: '12px 16px',
                        },
                        success: {
                            duration: 4000,
                            icon: <CheckCircle className="w-5 h-5" />,
                            style: {
                                background: '#22c55e',
                                color: '#fff',
                                fontSize: '14px',
                                padding: '12px 16px',
                                fontWeight: '600',
                            },
                        },
                        error: {
                            duration: 8000,
                            icon: <AlertCircle className="w-8 h-8" />,
                            style: {
                                background: '#ef4444',
                                color: '#fff',
                                fontSize: '13px',
                                padding: '12px 16px',
                                fontWeight: '600',
                            },
                        },
                    }}
                />
            </body>

        </html>
    );
}
