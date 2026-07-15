"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import type { Insights } from "./DocumentInsights";

export type UploadedDoc = {
  documentId: string;
  fileName: string;
  pages: number;
  insights: Insights | null;
};

export type Source = { documentName: string; pageNumber: number | null; chunkIndex: number };

interface DocumentsContextValue {
  documents: UploadedDoc[];
  addDocument: (doc: UploadedDoc) => void;
  clearDocuments: () => void;
  removeDocument: (documentId: string) => void;
  renameDocument: (documentId: string, newName: string) => void;
  favorites: Set<string>;
  toggleFavorite: (documentId: string) => void;
  recentSources: Source[];
  setRecentSources: (sources: Source[]) => void;
  prefilledQuestion: string | null;
  setPrefilledQuestion: (q: string | null) => void;
}

const DocumentsContext = createContext<DocumentsContextValue | null>(null);

export function DocumentsProvider({ children }: { children: ReactNode }) {
  const [documents, setDocuments] = useState<UploadedDoc[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [recentSources, setRecentSources] = useState<Source[]>([]);
  const [prefilledQuestion, setPrefilledQuestion] = useState<string | null>(null);

  function addDocument(doc: UploadedDoc) {
    setDocuments((prev) => [...prev, doc]);
  }

  function clearDocuments() {
    setDocuments([]);
    setRecentSources([]);
    setFavorites(new Set());
  }

  // Removes a document from the current session's list only. This does
  // NOT delete it from Qdrant — there's no per-document delete endpoint
  // on the backend yet, only "clear everything." Being explicit about
  // that here rather than pretending this is a real delete.
  function removeDocument(documentId: string) {
    setDocuments((prev) => prev.filter((d) => d.documentId !== documentId));
    setFavorites((prev) => {
      const next = new Set(prev);
      next.delete(documentId);
      return next;
    });
  }

  // Renames the document's DISPLAY name only, in local state. The backend
  // has no rename endpoint, so this doesn't change what's stored in
  // Qdrant or what chat/search will cite — it's purely a UI label change
  // for this session.
  function renameDocument(documentId: string, newName: string) {
    setDocuments((prev) => prev.map((d) => (d.documentId === documentId ? { ...d, fileName: newName } : d)));
  }

  function toggleFavorite(documentId: string) {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(documentId)) next.delete(documentId);
      else next.add(documentId);
      return next;
    });
  }

  return (
    <DocumentsContext.Provider
      value={{
        documents,
        addDocument,
        clearDocuments,
        removeDocument,
        renameDocument,
        favorites,
        toggleFavorite,
        recentSources,
        setRecentSources,
        prefilledQuestion,
        setPrefilledQuestion,
      }}
    >
      {children}
    </DocumentsContext.Provider>
  );
}

export function useDocuments() {
  const ctx = useContext(DocumentsContext);
  if (!ctx) throw new Error("useDocuments must be used within DocumentsProvider");
  return ctx;
}