"use client";

import { useState, useRef, ChangeEvent } from "react";
import UploadResultCard from "./UploadResultCard";
import Button from "./ui/Button";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface UploadResult {
    success: boolean;
    documentId: string;
    fileName: string;
    pages: number;
    textLength: number;
    chunksCreated: number;
    embeddingsGenerated: number;
    preview: string;
    insights: unknown;
}

interface PdfUploaderProps {
    onUploadSuccess?: (fileName: string, documentId: string, pages: number, insights: unknown) => void;
}

export default function PdfUploader({ onUploadSuccess }: PdfUploaderProps = {}) {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [statusText, setStatusText] = useState("Uploading document...");
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<UploadResult | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const validateFile = (f: File): string | null => {
        if (f.type !== "application/pdf") return "Please select a PDF file.";
        if (f.size > 10 * 1024 * 1024) return "File size must be under 10 MB.";
        return null;
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        setError(null);
        setResult(null);
        const selected = e.target.files?.[0] ?? null;
        if (!selected) return;
        const err = validateFile(selected);
        if (err) { setError(err); setFile(null); return; }
        setFile(selected);
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
        else if (e.type === "dragleave") setDragActive(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        setError(null);
        setResult(null);
        const dropped = e.dataTransfer.files?.[0] ?? null;
        if (!dropped) return;
        const err = validateFile(dropped);
        if (err) { setError(err); return; }
        setFile(dropped);
    };

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);
        setError(null);
        setResult(null);

        // Cosmetic status progression while the single upload request is
        // in flight — the backend does extraction, chunking, embedding,
        // and insight generation all within one request, so this is just
        // client-side pacing to communicate the real stages happening
        // server-side, not a literal progress bar tied to actual events.
        setStatusText("📄 Uploading document...");
        const t1 = setTimeout(() => setStatusText("🧠 Understanding your document..."), 1200);
        const t2 = setTimeout(() => setStatusText("✨ Generating AI insights..."), 3500);

        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await fetch(`${API_URL}/api/documents/upload`, {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.message || "Upload failed.");
            setStatusText("✅ Ready");
            setResult(data as UploadResult);
            onUploadSuccess?.(data.fileName, data.documentId, data.pages, data.insights);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
        } finally {
            clearTimeout(t1);
            clearTimeout(t2);
            setLoading(false);
        }
    };

    const handleReset = () => {
        setFile(null);
        setResult(null);
        setError(null);
        if (inputRef.current) inputRef.current.value = "";
    };

    const formatBytes = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    if (!file && !result) {
        return (
            <div className="animate-fade-in-up">
                <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                    className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-16 text-center transition-all duration-300 ${dragActive
                            ? "border-violet-400 bg-violet-500/10"
                            : "border-white/10 bg-white/[0.02] hover:border-violet-500/30 hover:bg-white/[0.04]"
                        }`}
                >
                    <div className={`mb-5 flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300 ${dragActive ? "bg-violet-500/20 text-violet-300 scale-110" : "bg-white/[0.06] text-slate-400 group-hover:bg-violet-500/10 group-hover:text-violet-400"
                        }`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                        </svg>
                    </div>
                    <p className="text-[15px] font-medium text-slate-300">
                        Drop your PDF here, or{" "}
                        <span className="text-violet-400 underline decoration-violet-400/40 underline-offset-2">browse files</span>
                    </p>
                    <p className="mt-2 text-[13px] text-slate-500">PDF files up to 10 MB</p>
                    <input ref={inputRef} id="pdf-file-input" type="file" accept=".pdf,application/pdf" className="hidden" onChange={handleFileChange} />
                </div>
                {error && <ErrorBanner message={error} />}
            </div>
        );
    }

    return (
        <div className="space-y-5 animate-fade-in-up">
            {file && !result && (
                <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.03] px-5 py-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-violet-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                            </svg>
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-200">{file.name}</p>
                            <p className="text-xs text-slate-500">{formatBytes(file.size)}</p>
                        </div>
                    </div>
                    <button onClick={handleReset} className="ml-4 shrink-0 text-slate-500 transition hover:text-slate-300" aria-label="Remove file">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}

            {!result && (
                <div className="flex items-center gap-3">
                    <Button
                        id="upload-button"
                        onClick={handleUpload}
                        disabled={!file}
                        loading={loading}
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                            </svg>
                        }
                    >
                        {loading ? statusText : "Upload & Analyze"}
                    </Button>
                    <Button variant="secondary" onClick={handleReset}>
                        Cancel
                    </Button>
                </div>
            )}

            {error && <ErrorBanner message={error} />}

            {result && (
                <div className="space-y-4 animate-fade-in-up">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-white">Document analyzed</h3>
                                <p className="text-xs text-slate-500">Ready for further processing</p>
                            </div>
                        </div>
                        <Button id="reset-button" variant="secondary" onClick={handleReset}>
                            Upload another
                        </Button>
                    </div>

                    <UploadResultCard result={result} />
                </div>
            )}
        </div>
    );
}

function ErrorBanner({ message }: { message: string }) {
    return (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.07] px-4 py-3.5 text-[13px] text-red-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="mt-0.5 h-4 w-4 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            {message}
        </div>
    );
}