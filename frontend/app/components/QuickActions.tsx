"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MessageSquare, Sparkles, GraduationCap, Columns2 } from "lucide-react";

const ACTIONS = [
  { href: "/chat", label: "Chat with Documents", description: "Ask questions, get grounded answers", icon: MessageSquare },
  { href: "/insights", label: "AI Insights", description: "Instant summary and key concepts", icon: Sparkles },
  { href: "/learn", label: "Study Mode", description: "Flashcards, quizzes, and revision notes", icon: GraduationCap },
  { href: "/compare", label: "Compare Documents", description: "Side-by-side analysis", icon: Columns2 },
];

export default function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {ACTIONS.map((action, i) => {
        const Icon = action.icon;
        return (
          <motion.div
            key={action.href}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -3 }}
          >
            <Link
              href={action.href}
              className="flex h-full flex-col gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition-colors hover:border-violet-500/30 hover:bg-violet-500/[0.04]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/15 text-violet-400">
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200">{action.label}</p>
                <p className="mt-0.5 text-xs text-slate-500">{action.description}</p>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}