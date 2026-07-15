"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, ListChecks, Mic, FileText, BookMarked, Share2, ArrowLeft, Baby } from "lucide-react";
import Card from "./ui/Card";
import Badge from "./ui/Badge";
import Skeleton from "./ui/Skeleton";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type SectionKey = "flashcards" | "quiz" | "interview" | "cheatsheet" | "glossary" | "eli5" | "mindmap";

const FEATURE_CARDS: { key: SectionKey; label: string; description: string; icon: typeof BookOpen }[] = [
  { key: "flashcards", label: "Flashcards", description: "Flip through key Q&A pairs", icon: BookOpen },
  { key: "quiz", label: "Quiz", description: "Test yourself, get a score", icon: ListChecks },
  { key: "interview", label: "Interview Prep", description: "Practice questions by difficulty", icon: Mic },
  { key: "cheatsheet", label: "Cheat Sheet", description: "One-page revision notes", icon: FileText },
  { key: "glossary", label: "Glossary", description: "Key terms, plain explanations", icon: BookMarked },
  { key: "eli5", label: "Explain Like I'm 5", description: "The simplest possible explanation", icon: Baby },
  { key: "mindmap", label: "Mind Map", description: "Visual concept structure", icon: Share2 },
];

interface StudyModeProps {
  documentId: string;
}

export default function StudyMode({ documentId }: StudyModeProps) {
  const [activeSection, setActiveSection] = useState<SectionKey | null>(null);
  const [cache, setCache] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState<SectionKey | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function openSection(section: SectionKey) {
    setActiveSection(section);
    if (cache[section]) return;

    setLoading(section);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/documents/${documentId}/study/${section}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to generate study material.");
      setCache((prev) => ({ ...prev, [section]: data.content }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate study material.");
    } finally {
      setLoading(null);
    }
  }

  if (activeSection) {
    const meta = FEATURE_CARDS.find((c) => c.key === activeSection)!;
    return (
      <Card>
        <button onClick={() => setActiveSection(null)} className="mb-4 flex items-center gap-1.5 text-xs text-slate-500 transition hover:text-slate-300">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Study Mode
        </button>

        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
          <meta.icon className="h-4 w-4 text-violet-400" strokeWidth={1.75} />
          {meta.label}
        </h3>

        {loading === activeSection && <SectionSkeleton section={activeSection} />}

        {error && loading !== activeSection && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-sm text-red-300">{error}</div>
        )}

        {!loading && !error && cache[activeSection] != null && (
          <SectionContent section={activeSection} content={cache[activeSection]} />
        )}
      </Card>
    );
  }

  return (
    <div>
      <h2 className="mb-4 text-sm font-semibold text-white">Study Mode</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {FEATURE_CARDS.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.button
              key={card.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -3 }}
              onClick={() => openSection(card.key)}
              className="flex flex-col gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-left transition-colors hover:border-violet-500/30 hover:bg-violet-500/[0.04]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/15 text-violet-400">
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200">{card.label}</p>
                <p className="mt-0.5 text-xs text-slate-500">{card.description}</p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function SectionSkeleton({ section }: { section: SectionKey }) {
  if (section === "flashcards") {
    return (
      <div>
        <Skeleton className="h-40 w-full rounded-xl" />
        <div className="mt-4 flex justify-between">
          <Skeleton className="h-7 w-20 rounded-lg" />
          <Skeleton className="h-7 w-16 rounded-lg" />
        </div>
      </div>
    );
  }

  if (section === "quiz") {
    return (
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <Skeleton className="h-4 w-3/4" />
            <div className="mt-3 flex flex-col gap-2">
              <Skeleton className="h-8 w-full rounded-lg" />
              <Skeleton className="h-8 w-full rounded-lg" />
              <Skeleton className="h-8 w-full rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (section === "eli5") {
    return (
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-5/6" />
        <Skeleton className="mt-2 h-4 w-4/6" />
      </div>
    );
  }

  if (section === "mindmap") {
    return (
      <div>
        <div className="mb-4 flex justify-center"><Skeleton className="h-11 w-48 rounded-xl" /></div>
        <div className="grid gap-3 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      </div>
    );
  }

  // interview / cheatsheet / glossary — generic card-list skeleton
  return (
    <div className="flex flex-col gap-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="mt-2 h-3 w-full" />
          <Skeleton className="mt-1.5 h-3 w-4/5" />
        </div>
      ))}
    </div>
  );
}

function SectionContent({ section, content }: { section: SectionKey; content: unknown }) {
  if (section === "flashcards") return <FlashcardsView data={content as { flashcards: { front: string; back: string }[] }} />;
  if (section === "quiz") return <QuizView data={content as { questions: QuizQuestion[] }} />;
  if (section === "interview") return <InterviewView data={content as InterviewContent} />;
  if (section === "cheatsheet") return <CheatSheetView data={content as CheatSheetContent} />;
  if (section === "glossary") return <GlossaryView data={content as { terms: { term: string; explanation: string }[] }} />;
  if (section === "eli5") return <Eli5View data={content as { explanation: string; analogies: string[] }} />;
  if (section === "mindmap") return <MindMapView data={content as { root: string; branches: { label: string; children: string[] }[] }} />;
  return null;
}

function Eli5View({ data }: { data: { explanation: string; analogies: string[] } }) {
  if (!data?.explanation) return <EmptyNote text="No explanation generated." />;
  return (
    <div>
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
        <p className="text-sm leading-relaxed text-slate-200">{data.explanation}</p>
      </div>
      {data.analogies?.length > 0 && (
        <div className="mt-4 flex flex-col gap-2">
          {data.analogies.map((a, i) => (
            <div key={i} className="rounded-lg border border-violet-500/20 bg-violet-500/[0.06] px-3.5 py-2.5 text-xs text-violet-200">
              💡 {a}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MindMapView({ data }: { data: { root: string; branches: { label: string; children: string[] }[] } }) {
  if (!data?.root) return <EmptyNote text="No mind map generated." />;
  return (
    <div>
      <div className="mb-4 flex justify-center">
        <div className="rounded-xl bg-violet-600 px-5 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-violet-600/20">
          {data.root}
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {data.branches?.map((branch, i) => (
          <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <p className="mb-2 text-sm font-medium text-violet-300">{branch.label}</p>
            <ul className="flex flex-col gap-1">
              {branch.children?.map((child, j) => (
                <li key={j} className="flex items-start gap-1.5 text-xs text-slate-400">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-600" />
                  {child}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function FlashcardsView({ data }: { data: { flashcards: { front: string; back: string }[] } }) {
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});
  const [index, setIndex] = useState(0);
  const cards = data.flashcards || [];
  if (!cards.length) return <EmptyNote text="No flashcards generated." />;

  const card = cards[index];
  const isFlipped = !!flipped[index];

  return (
    <div>
      <div
        onClick={() => setFlipped((prev) => ({ ...prev, [index]: !prev[index] }))}
        className="flex min-h-[160px] cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] p-6 text-center transition-all duration-300 hover:border-violet-500/30"
      >
        <p className="text-sm leading-relaxed text-slate-200">{isFlipped ? card.back : card.front}</p>
      </div>
      <p className="mt-2 text-center text-[11px] text-slate-500">Click card to flip</p>

      <div className="mt-4 flex items-center justify-between">
        <button onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-400 disabled:opacity-30">Previous</button>
        <span className="text-xs text-slate-500">{index + 1} / {cards.length}</span>
        <button onClick={() => setIndex((i) => Math.min(cards.length - 1, i + 1))} disabled={index === cards.length - 1} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-400 disabled:opacity-30">Next</button>
      </div>
    </div>
  );
}

type QuizQuestion = { question: string; options: string[]; correctAnswer: string; explanation: string };

function QuizView({ data }: { data: { questions: QuizQuestion[] } }) {
  const questions = data.questions || [];
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  if (!questions.length) return <EmptyNote text="No quiz questions generated." />;

  const score = questions.reduce((acc, q, i) => (answers[i] === q.correctAnswer ? acc + 1 : acc), 0);

  return (
    <div className="flex flex-col gap-5">
      {questions.map((q, i) => (
        <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <p className="mb-3 text-sm font-medium text-slate-200">{i + 1}. {q.question}</p>
          <div className="flex flex-col gap-2">
            {q.options.map((opt) => {
              const isSelected = answers[i] === opt;
              const isCorrect = submitted && opt === q.correctAnswer;
              const isWrongSelected = submitted && isSelected && opt !== q.correctAnswer;
              return (
                <button
                  key={opt}
                  disabled={submitted}
                  onClick={() => setAnswers((prev) => ({ ...prev, [i]: opt }))}
                  className={`rounded-lg border px-3 py-2 text-left text-xs transition ${
                    isCorrect ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                    : isWrongSelected ? "border-red-500/40 bg-red-500/10 text-red-300"
                    : isSelected ? "border-violet-500/40 bg-violet-500/10 text-violet-300"
                    : "border-white/[0.06] text-slate-400 hover:border-white/20"
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          {submitted && <p className="mt-2 text-xs italic text-slate-500">{q.explanation}</p>}
        </div>
      ))}

      {!submitted ? (
        <button onClick={() => setSubmitted(true)} disabled={Object.keys(answers).length < questions.length} className="self-start rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:opacity-40">
          Submit Quiz
        </button>
      ) : (
        <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.06] px-4 py-3 text-sm text-violet-300">
          Score: {score} / {questions.length}
        </div>
      )}
    </div>
  );
}

type InterviewContent = {
  beginner: { question: string; modelAnswer: string }[];
  intermediate: { question: string; modelAnswer: string }[];
  advanced: { question: string; modelAnswer: string }[];
};

function InterviewView({ data }: { data: InterviewContent }) {
  const levels: { key: keyof InterviewContent; label: string; tone: "success" | "warning" | "danger" }[] = [
    { key: "beginner", label: "Beginner", tone: "success" },
    { key: "intermediate", label: "Intermediate", tone: "warning" },
    { key: "advanced", label: "Advanced", tone: "danger" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {levels.map((level) => (
        <div key={level.key}>
          <div className="mb-3"><Badge tone={level.tone}>{level.label}</Badge></div>
          <div className="flex flex-col gap-3">
            {(data[level.key] || []).map((q, i) => (
              <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <p className="text-sm font-medium text-slate-200">{q.question}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{q.modelAnswer}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

type CheatSheetContent = {
  keyConcepts: string[];
  definitions: { term: string; definition: string }[];
  importantFacts: string[];
  formulas?: string[];
  bestPractices: string[];
};

function CheatSheetView({ data }: { data: CheatSheetContent }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <CheatBlock title="Key Concepts"><ul className="list-disc space-y-1 pl-4 text-xs text-slate-300">{data.keyConcepts?.map((c) => <li key={c}>{c}</li>)}</ul></CheatBlock>
      <CheatBlock title="Definitions">
        <div className="space-y-1.5">{data.definitions?.map((d) => <p key={d.term} className="text-xs text-slate-300"><span className="font-medium text-slate-200">{d.term}:</span> {d.definition}</p>)}</div>
      </CheatBlock>
      <CheatBlock title="Important Facts"><ul className="list-disc space-y-1 pl-4 text-xs text-slate-300">{data.importantFacts?.map((f) => <li key={f}>{f}</li>)}</ul></CheatBlock>
      {data.formulas && data.formulas.length > 0 && (
        <CheatBlock title="Formulas"><ul className="space-y-1 pl-0 font-mono text-xs text-violet-300">{data.formulas.map((f) => <li key={f}>{f}</li>)}</ul></CheatBlock>
      )}
      <CheatBlock title="Best Practices"><ul className="list-disc space-y-1 pl-4 text-xs text-slate-300">{data.bestPractices?.map((b) => <li key={b}>{b}</li>)}</ul></CheatBlock>
    </div>
  );
}

function CheatBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      {children}
    </div>
  );
}

function GlossaryView({ data }: { data: { terms: { term: string; explanation: string }[] } }) {
  const terms = data.terms || [];
  if (!terms.length) return <EmptyNote text="No glossary terms generated." />;
  return (
    <div className="flex flex-col gap-2">
      {terms.map((t) => (
        <div key={t.term} className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-2.5">
          <p className="text-sm font-medium text-slate-200">{t.term}</p>
          <p className="mt-0.5 text-xs text-slate-400">{t.explanation}</p>
        </div>
      ))}
    </div>
  );
}

function EmptyNote({ text }: { text: string }) {
  return <p className="py-6 text-center text-sm text-slate-500">{text}</p>;
}