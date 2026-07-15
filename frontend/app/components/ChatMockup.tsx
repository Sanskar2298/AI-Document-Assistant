"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send } from "lucide-react";
import { useTypewriter } from "../hooks/useTypewriter";

const QUESTION = "Compare the two research papers' conclusions";
const ANSWER = "Paper A concludes that transformer attention scales predictably, while Paper B argues scaling breaks down past a certain context length...";
const SOURCES = ["paper-a.pdf p.4", "paper-b.pdf p.9"];

type Stage = "typing-question" | "thinking" | "typing-answer" | "showing-sources" | "pausing";

export default function ChatMockup() {
  const [stage, setStage] = useState<Stage>("typing-question");
  const [cycle, setCycle] = useState(0);

  const { displayed: questionText, done: questionDone } = useTypewriter(QUESTION, {
    speed: 30,
    active: stage === "typing-question",
  });

  const { displayed: answerText, done: answerDone } = useTypewriter(ANSWER, {
    speed: 12,
    active: stage === "typing-answer",
  });

  useEffect(() => {
    if (stage === "typing-question" && questionDone) {
      const t = setTimeout(() => setStage("thinking"), 400);
      return () => clearTimeout(t);
    }
  }, [stage, questionDone]);

  useEffect(() => {
    if (stage === "thinking") {
      const t = setTimeout(() => setStage("typing-answer"), 1100);
      return () => clearTimeout(t);
    }
  }, [stage]);

  useEffect(() => {
    if (stage === "typing-answer" && answerDone) {
      const t = setTimeout(() => setStage("showing-sources"), 300);
      return () => clearTimeout(t);
    }
  }, [stage, answerDone]);

  useEffect(() => {
    if (stage === "showing-sources") {
      const t = setTimeout(() => setStage("pausing"), 2600);
      return () => clearTimeout(t);
    }
  }, [stage]);

  useEffect(() => {
    if (stage === "pausing") {
      const t = setTimeout(() => {
        setCycle((c) => c + 1);
        setStage("typing-question");
      }, 1200);
      return () => clearTimeout(t);
    }
  }, [stage]);

  const showQuestion = stage !== "typing-question" || questionText.length > 0;
  const showAnswerBubble = stage === "thinking" || stage === "typing-answer" || stage === "showing-sources" || stage === "pausing";
  const showSources = stage === "showing-sources" || stage === "pausing";

  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d10] shadow-2xl shadow-black/50"
      animate={{
        borderColor: ["rgba(255,255,255,0.10)", "rgba(139,92,246,0.32)", "rgba(255,255,255,0.10)"],
        boxShadow: ["0 25px 50px -12px rgba(0,0,0,0.50)", "0 25px 60px -12px rgba(109,40,217,0.28)", "0 25px 50px -12px rgba(0,0,0,0.50)"],
      }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 -left-1/3 z-20 w-1/3 bg-gradient-to-r from-transparent via-white/[0.045] to-transparent blur-sm"
        animate={{ x: ["0%", "500%"] }}
        transition={{ duration: 4.5, repeat: Infinity, repeatDelay: 2.5, ease: "easeInOut" }}
      />
      <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
        {["bg-red-500/70", "bg-amber-500/70", "bg-emerald-500/70"].map((color, i) => (
          <motion.div key={color} className={`h-2.5 w-2.5 rounded-full ${color}`} animate={{ scale: [1, 1.18, 1] }} transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.22, ease: "easeInOut" }} />
        ))}
        <span className="ml-2 text-[11px] text-slate-500">Lexora — Chat</span>
      </div>

      <div className="flex min-h-[190px] flex-col gap-3 p-5">
        <AnimatePresence>
          {showQuestion && (
            <motion.div key={`q-${cycle}`} initial={{ opacity: 0, x: 18, scale: 0.96 }} animate={{ opacity: 1, x: 0, scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 22 }} className="flex justify-end">
              <div className="max-w-[75%] rounded-2xl bg-violet-600 px-3.5 py-2 text-[12px] text-white">
                {questionText}
                {stage === "typing-question" && !questionDone && <Cursor />}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showAnswerBubble && (
            <motion.div
              key={`a-${cycle}`}
              initial={{ opacity: 0, x: -18, y: 6, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 240, damping: 22 }}
              className="max-w-[85%] rounded-2xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-[12px] leading-relaxed text-slate-300"
            >
              {stage === "thinking" ? (
                <ThinkingDots />
              ) : (
                <>
                  {answerText}
                  {stage === "typing-answer" && !answerDone && <Cursor />}
                </>
              )}

              <AnimatePresence>
                {showSources && (
                  <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mt-2 flex gap-1.5">
                    {SOURCES.map((s) => (
                      <span key={s} className="rounded-md bg-white/[0.06] px-2 py-0.5 text-[10px] text-slate-500">{s}</span>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="border-t border-white/[0.06] p-3">
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2">
          <span className="flex-1 text-[12px] text-slate-500">Ask about your documents...</span>
          <motion.div animate={{ x: [0, 2, 0], scale: [1, 1.08, 1] }} transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}>
            <Send className="h-3.5 w-3.5 text-violet-400" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

function Cursor() {
  return <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }} className="ml-0.5 inline-block h-3 w-[2px] translate-y-0.5 bg-current" />;
}

function ThinkingDots() {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.span key={i} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} className="h-1.5 w-1.5 rounded-full bg-violet-400" />
      ))}
    </div>
  );
}
