import Sidebar from "@/app/components/Sidebar";
import PageTransition from "@/app/components/PageTransition";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen bg-[#0a0a0a]">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
                <PageTransition>{children}</PageTransition>
            </main>
        </div>
    );
}