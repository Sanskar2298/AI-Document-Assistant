"use client";

import { motion } from "framer-motion";
import { FileText, Clock, Hash, Tag, Lightbulb, MessageCircleQuestion, Gauge, Users, CalendarClock } from "lucide-react";
import Card from "./ui/Card";
import Badge from "./ui/Badge";

type Concept = { concept: string; explanation: string };

type ReadingStats = {
  pages: number;
  wordCount: number;
  estimatedReadingTimeMinutes: number;
};

export type Insights = {
  executiveSummary: string;
  keyTopics: string[];
  importantConcepts: Concept[];
  suggestedQuestions: string[];
  difficultyLevel: "Beginner" | "Intermediate" | "Advanced";
  readingStats: ReadingStats;
  namedEntities?: { name: string; type: string }[];
  timeline?: { period: string; event: string }[];
};

interface DocumentInsightsProps {
  insights: Insights;
  onQuestionClick?: (question: string) => void;
}

const DIFFICULTY_CONFIG: Record<string, { tone: "success" | "warning" | "danger"; fill: number }> = {
  Beginner: { tone: "success", fill: 33 },
  Intermediate: { tone: "warning", fill: 66 },
  Advanced: { tone: "danger", fill: 100 },
};

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.3, ease: [0.16, 1, 0.3, 1] as const },
});

export default function DocumentInsights({ insights, onQuestionClick }: DocumentInsightsProps) {
  const { executiveSummary, keyTopics, importantConcepts, suggestedQuestions, difficultyLevel, readingStats, namedEntities, timeline } = insights;
  const difficulty = DIFFICULTY_CONFIG[difficultyLevel] || DIFFICULTY_CONFIG.Beginner;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <motion.div {...fadeUp(0)}>
          <StatCard icon={FileText} label="Pages" value={readingStats.pages} />
        </motion.div>
        <motion.div {...fadeUp(0.05)}>
          <StatCard icon={Hash} label="Words" value={readingStats.wordCount.toLocaleString()} />
        </motion.div>
        <motion.div {...fadeUp(0.1)}>
          <StatCard icon={Clock} label="Read time" value={`${readingStats.estimatedReadingTimeMinutes}m`} />
        </motion.div>
        <motion.div {...fadeUp(0.15)}>
          <Card className="!p-4">
            <div className="mb-1.5 flex items-center gap-1.5 text-slate-500">
              <Gauge className="h-3.5 w-3.5" strokeWidth={1.75} />
              <span className="text-[10px] uppercase tracking-wide">Difficulty</span>
            </div>
            <Badge tone={difficulty.tone}>{difficultyLevel}</Badge>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className={`h-full rounded-full ${
                  difficulty.tone === "success" ? "bg-emerald-500" : difficulty.tone === "warning" ? "bg-amber-500" : "bg-red-500"
                }`}
                style={{ width: `${difficulty.fill}%` }}
              />
            </div>
          </Card>
        </motion.div>
      </div>

      <motion.div {...fadeUp(0.2)}>
        <Card>
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/15 text-violet-400">
              <FileText className="h-3.5 w-3.5" strokeWidth={1.75} />
            </div>
            <h3 className="text-sm font-semibold text-white">Executive Summary</h3>
          </div>
          <p className="text-sm leading-relaxed text-slate-300">{executiveSummary}</p>
        </Card>
      </motion.div>

      {keyTopics.length > 0 && (
        <motion.div {...fadeUp(0.25)}>
          <Card>
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/15 text-violet-400">
                <Tag className="h-3.5 w-3.5" strokeWidth={1.75} />
              </div>
              <h3 className="text-sm font-semibold text-white">Key Topics</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {keyTopics.map((topic) => (
                <Badge key={topic} tone="accent">{topic}</Badge>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {importantConcepts.length > 0 && (
        <motion.div {...fadeUp(0.3)}>
          <Card>
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/15 text-violet-400">
                <Lightbulb className="h-3.5 w-3.5" strokeWidth={1.75} />
              </div>
              <h3 className="text-sm font-semibold text-white">Important Concepts</h3>
            </div>
            <div className="flex flex-col gap-3">
              {importantConcepts.map((c) => (
                <div key={c.concept} className="rounded-lg border border-white/[0.06] bg-white/[0.015] p-3">
                  <p className="text-sm font-medium text-slate-200">{c.concept}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-400">{c.explanation}</p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {suggestedQuestions.length > 0 && (
        <motion.div {...fadeUp(0.35)}>
          <Card>
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/15 text-violet-400">
                <MessageCircleQuestion className="h-3.5 w-3.5" strokeWidth={1.75} />
              </div>
              <h3 className="text-sm font-semibold text-white">Suggested Questions</h3>
            </div>
            <div className="flex flex-col gap-2">
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => onQuestionClick?.(q)}
                  className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 text-left text-sm text-slate-300 transition hover:border-violet-500/30 hover:bg-violet-500/[0.06] hover:text-white"
                >
                  {q}
                </button>
              ))}
            </div>
          </Card>
        </motion.div>
      )}
      {/* Named Entities — only if the document actually named real entities */}
      {namedEntities && namedEntities.length > 0 && (
        <motion.div {...fadeUp(0.4)}>
          <Card>
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/15 text-violet-400">
                <Users className="h-3.5 w-3.5" strokeWidth={1.75} />
              </div>
              <h3 className="text-sm font-semibold text-white">Named Entities</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {namedEntities.map((e, i) => (
                <span key={`${e.name}-${i}`} className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] px-2.5 py-1 text-[11px] text-slate-300">
                  {e.name}
                  <span className="text-slate-500">{e.type}</span>
                </span>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Timeline — only if the document actually describes chronological events */}
      {timeline && timeline.length > 0 && (
        <motion.div {...fadeUp(0.45)}>
          <Card>
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/15 text-violet-400">
                <CalendarClock className="h-3.5 w-3.5" strokeWidth={1.75} />
              </div>
              <h3 className="text-sm font-semibold text-white">Timeline</h3>
            </div>
            <div className="flex flex-col gap-3 border-l border-white/10 pl-4">
              {timeline.map((t, i) => (
                <div key={i} className="relative">
                  <span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-violet-500" />
                  <p className="text-xs font-medium text-violet-300">{t.period}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{t.event}</p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: typeof FileText; label: string; value: string | number }) {
  return (
    <Card className="!p-4">
      <div className="mb-1.5 flex items-center gap-1.5 text-slate-500">
        <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
        <span className="text-[10px] uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-lg font-semibold text-slate-200">{value}</p>
    </Card>
  );
}