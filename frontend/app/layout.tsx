import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { DocumentsProvider } from "./components/DocumentsContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk", display: "swap" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono", display: "swap" });

export const metadata: Metadata = {
    title: "Lexora — Chat with your documents",
    description:
        "Upload PDFs and get clear, source-backed answers to your questions. Save hours of reading with AI-powered document understanding.",
    keywords: ["AI", "document assistant", "PDF", "chat with documents"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className="scroll-smooth">
            <body className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans`}>
                <DocumentsProvider>{children}</DocumentsProvider>
            </body>
        </html>
    );
}