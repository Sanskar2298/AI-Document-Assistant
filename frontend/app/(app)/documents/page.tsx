"use client";

import { useState } from "react";
import { useDocuments } from "@/app/components/DocumentsContext";
import PdfUploader from "@/app/components/PdfUploader";
import QuickActions from "@/app/components/QuickActions";
import DocumentCard from "@/app/components/DocumentCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function DocumentsPage() {
  const { documents, addDocument, clearDocuments, removeDocument, renameDocument, favorites, toggleFavorite } = useDocuments();
  const [clearing, setClearing] = useState(false);

  async function handleClearAll() {
    if (!confirm("This deletes ALL stored documents from the database, not just this session. Continue?")) return;
    setClearing(true);
    try {
      await fetch(`${API_URL}/api/documents`, { method: "DELETE" });
      clearDocuments();
    } catch {
      alert("Failed to clear documents. Check that the backend is running.");
    } finally {
      setClearing(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 sm:py-14">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="mt-1.5 text-sm text-slate-400">
            Upload a document to start chatting, exploring insights, or generating study material.
          </p>
        </div>
        {documents.length > 0 && (
          <button onClick={handleClearAll} disabled={clearing} className="shrink-0 rounded-lg border border-red-500/20 px-3 py-1.5 text-[12px] text-red-300 transition hover:border-red-500/40 hover:bg-red-500/[0.06] disabled:opacity-50">
            {clearing ? "Clearing..." : "Clear all"}
          </button>
        )}
      </div>

      <div className="mb-8">
        <PdfUploader onUploadSuccess={(fileName, documentId, pages, insights) => addDocument({ fileName, documentId, pages, insights: insights as never })} />
      </div>

      <div className="mb-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Quick Actions</p>
        <QuickActions />
      </div>

      {documents.length > 0 && (
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            {documents.length} document{documents.length > 1 ? "s" : ""} this session
          </p>
          <div className="flex flex-col gap-2">
            {documents.map((doc) => (
              <DocumentCard key={doc.documentId} doc={doc} favorite={favorites.has(doc.documentId)} onToggleFavorite={toggleFavorite} onRename={renameDocument} onRemove={removeDocument} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
