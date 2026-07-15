"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  FileText, MessageSquare, Sparkles, GraduationCap, Columns2, Settings,
  ChevronsLeft, ChevronsRight, Star,
} from "lucide-react";
import { useDocuments } from "./DocumentsContext";

const NAV_ITEMS = [
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/insights", label: "Insights", icon: Sparkles },
  { href: "/learn", label: "Learn", icon: GraduationCap },
  { href: "/compare", label: "Compare", icon: Columns2 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { documents, favorites } = useDocuments();
  const favoriteDocs = documents.filter((d) => favorites.has(d.documentId));
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen shrink-0">
      {/* Icon rail — always visible */}
      <div className="flex w-16 flex-col items-center gap-1 border-r border-white/[0.06] bg-[#050505] py-5">
        <div className="mb-6 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-600/20">
          <FileText className="h-4.5 w-4.5 text-white" strokeWidth={2} />
        </div>

        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${active ? "bg-violet-500/15 text-violet-300" : "text-slate-500 hover:bg-white/[0.06] hover:text-slate-300"
                }`}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </Link>
          );
        })}

        <div className="mt-auto flex flex-col items-center gap-1">
          {collapsed && (
            <button
              onClick={() => setCollapsed(false)}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-white/[0.06] hover:text-slate-300"
              title="Expand"
            >
              <ChevronsRight className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </button>
          )}
          <Link
            href="/settings"
            title="Settings"
            className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${pathname === "/settings" ? "bg-violet-500/15 text-violet-300" : "text-slate-500 hover:bg-white/[0.06] hover:text-slate-300"
              }`}
          >
            <Settings className="h-[18px] w-[18px]" strokeWidth={1.75} />
          </Link>
        </div>
      </div>

      {/* Labeled panel — real nav labels + your actual documents/favorites */}
      <motion.div
        animate={{ width: collapsed ? 0 : 240 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="overflow-hidden border-r border-white/[0.06] bg-[#0a0a0a]"
      >
        <div className="flex h-full w-60 flex-col py-5">
          <div className="mb-5 flex items-center justify-between px-4">
            <span className="text-sm font-semibold text-white">Lexora</span>
            <button onClick={() => setCollapsed(true)} className="text-slate-500 transition hover:text-slate-300">
              <ChevronsLeft className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>

          <nav className="flex flex-col gap-0.5 px-2">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-2.5 py-2 text-sm font-medium transition ${active ? "bg-violet-500/10 text-violet-300" : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                    }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {favoriteDocs.length > 0 && (
            <div className="mt-6 px-4">
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                <Star className="h-3 w-3" /> Favorites
              </p>
              <div className="flex flex-col gap-0.5">
                {favoriteDocs.map((d) => (
                  <Link
                    key={d.documentId}
                    href={`/documents/${d.documentId}`}
                    className="truncate rounded-lg px-2.5 py-1.5 text-[13px] text-slate-400 transition hover:bg-white/[0.04] hover:text-white"
                  >
                    {d.fileName}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {documents.length > 0 && (
            <div className="mt-6 flex-1 overflow-y-auto px-4">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Documents ({documents.length})
              </p>
              <div className="flex flex-col gap-0.5">
                {documents.map((d) => (
                  <Link
                    key={d.documentId}
                    href={`/documents/${d.documentId}`}
                    className="truncate rounded-lg px-2.5 py-1.5 text-[13px] text-slate-500 transition hover:bg-white/[0.04] hover:text-white"
                  >
                    {d.fileName}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
