import ConsoleSideBar from "@/app/mso/_components/side-bar";

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* 사이드바 */}
            <ConsoleSideBar />
            
            {/* 메인 콘텐츠 영역 */}
            <div className="flex-1 flex h-screen">
                {/* 메인 콘텐츠 */}
                <main className="h-full w-full px-10">
                    {children}
                </main>
            </div>
        </div>
    );
}
