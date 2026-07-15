"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Document, Page, pdfjs } from "react-pdf";

import { ChevronLeft, ChevronRight, Send, FileWarning } from "lucide-react";
import { useDocuments } from "@/app/components/DocumentsContext";

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type Source = { documentName: string; pageNumber: number | null; chunkIndex: number; preview?: string };
type Message = { id: string; role: "user" | "assistant"; content: string; sources?: Source[] };

export default function DocumentViewerPage() {
    const params = useParams();
    const documentId = params.documentId as string;
    const { documents } = useDocuments();
    const doc = documents.find((d) => d.documentId === documentId);

    const [numPages, setNumPages] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [fileError, setFileError] = useState(false);

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleAsk() {
        const question = input.trim();
        if (!question || loading) return;

        const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: question };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/api/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question, selectedDocumentIds: [documentId], searchScope: "selected" }),
            });
            const data = await res.json();
            setMessages((prev) => [
                ...prev,
                { id: crypto.randomUUID(), role: "assistant", content: data.answer, sources: data.sources },
            ]);
        } catch {
            setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "assistant", content: "Something went wrong." }]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex h-full">
            <div className="flex flex-1 flex-col border-r border-white/[0.06] bg-[#050505]">
                <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
                    <p className="truncate text-sm font-medium text-slate-300">{doc?.fileName || "Document"}</p>
                    {numPages && (
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage <= 1} className="rounded p-1 hover:bg-white/[0.06] disabled:opacity-30">
                                <ChevronLeft className="h-3.5 w-3.5" />
                            </button>
                            <span>{currentPage} / {numPages}</span>
                            <button onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))} disabled={currentPage >= numPages} className="rounded p-1 hover:bg-white/[0.06] disabled:opacity-30">
                                <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {fileError ? (
                        <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-slate-500">
                            <FileWarning className="h-8 w-8" strokeWidth={1.5} />
                            <p className="text-sm">Original file not available</p>
                            <p className="max-w-xs text-xs">
                                This can happen after a server restart, since the file isn't persisted to a database yet.
                            </p>
                        </div>
                    ) : (
                        <div className="flex justify-center">
                            <Document
                                file={`${API_URL}/api/documents/${documentId}/file`}
                                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                                onLoadError={() => setFileError(true)}
                                loading={<p className="text-sm text-slate-500">Loading PDF...</p>}
                            >
                                <Page pageNumber={currentPage} width={560} />
                            </Document>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex w-[420px] flex-col">
                <div className="border-b border-white/[0.06] px-4 py-3">
                    <p className="text-sm font-semibold text-white">Ask about this document</p>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-4">
                    <div className="flex flex-col gap-4">
                        {messages.map((msg) => (
                            <div key={msg.id} className={msg.role === "user" ? "flex justify-end" : ""}>
                                <div className={`max-w-[90%] rounded-xl px-3.5 py-2.5 text-[13px] leading-relaxed ${msg.role === "user" ? "bg-violet-600 text-white" : "border border-white/10 bg-white/[0.02] text-slate-200"
                                    }`}>
                                    {msg.content}
                                    {msg.sources && msg.sources.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-1.5">
                                            {msg.sources.map((s, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => s.pageNumber && setCurrentPage(s.pageNumber)}
                                                    disabled={!s.pageNumber}
                                                    className="rounded-md bg-white/[0.06] px-2 py-0.5 text-[10px] text-violet-300 transition hover:bg-violet-500/20 disabled:opacity-40"
                                                >
                                                    p.{s.pageNumber ?? "?"}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {loading && <p className="text-xs text-slate-500">Thinking...</p>}
                    </div>
                </div>

                <div className="border-t border-white/[0.06] p-3">
                    <div className="flex items-end gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-2">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAsk(); } }}
                            placeholder="Ask about this document..."
                            rows={1}
                            className="max-h-24 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-white placeholder:text-slate-500 outline-none"
                        />
                        <button onClick={handleAsk} disabled={!input.trim() || loading} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-600 text-white transition hover:bg-violet-500 disabled:opacity-40">
                            <Send className="h-4 w-4" strokeWidth={2} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}