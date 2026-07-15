"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, MoreVertical, Star, Pencil, Trash2, Check, X } from "lucide-react";

export interface DocumentCardData {
  documentId: string;
  fileName: string;
  pages: number;
}

interface DocumentCardProps {
  doc: DocumentCardData;
  favorite: boolean;
  onToggleFavorite: (documentId: string) => void;
  onRename: (documentId: string, newName: string) => void;
  onRemove: (documentId: string) => void;
}

export default function DocumentCard({ doc, favorite, onToggleFavorite, onRename, onRemove }: DocumentCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [nameInput, setNameInput] = useState(doc.fileName);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function confirmRename() {
    if (nameInput.trim()) onRename(doc.documentId, nameInput.trim());
    setRenaming(false);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="group relative flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition-colors hover:border-white/[0.12] hover:bg-white/[0.03]"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-400">
        <FileText className="h-5 w-5" strokeWidth={1.5} />
      </div>

      <div className="min-w-0 flex-1">
        {renaming ? (
          <div className="flex items-center gap-1.5">
            <input
              autoFocus
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && confirmRename()}
              className="w-full rounded-md border border-violet-500/40 bg-white/[0.04] px-2 py-1 text-sm text-slate-200 outline-none"
            />
            <button onClick={confirmRename} className="text-emerald-400 hover:text-emerald-300">
              <Check className="h-4 w-4" />
            </button>
            <button onClick={() => { setRenaming(false); setNameInput(doc.fileName); }} className="text-slate-500 hover:text-slate-300">
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <Link href={`/documents/${doc.documentId}`} className="truncate text-sm font-medium text-slate-200 hover:text-violet-300 hover:underline">
              {doc.fileName}
            </Link>
            <p className="text-xs text-slate-500">{doc.pages} pages</p>
          </>
        )}
      </div>

      <button onClick={() => onToggleFavorite(doc.documentId)} className="shrink-0 text-slate-500 transition hover:text-amber-400">
        <Star className={`h-4 w-4 ${favorite ? "fill-amber-400 text-amber-400" : ""}`} strokeWidth={1.75} />
      </button>

      <div className="relative shrink-0" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white/[0.06] hover:text-slate-300"
        >
          <MoreVertical className="h-4 w-4" strokeWidth={1.75} />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-9 z-10 w-40 overflow-hidden rounded-lg border border-white/10 bg-[#111111] shadow-xl">
            <button
              onClick={() => { setRenaming(true); setMenuOpen(false); }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-slate-300 transition hover:bg-white/[0.06]"
            >
              <Pencil className="h-3.5 w-3.5" /> Rename
            </button>
            <button
              onClick={() => { onRemove(doc.documentId); setMenuOpen(false); }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-red-400 transition hover:bg-red-500/[0.08]"
            >
              <Trash2 className="h-3.5 w-3.5" /> Remove from session
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}