"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useScroll, useTransform } from "framer-motion";
import {
  FileText,
  MessageSquare,
  Sparkles,
  GraduationCap,
  Layers,
  ArrowRight,
  ChevronDown,
  Search,
  Brain,
  Zap,
  Send,
  CheckCircle2,
  BookOpen
} from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import ChatMockup from "@/app/components/ChatMockup";

const blurReveal = (delay = 0) => ({
  initial: { opacity: 0, y: 16, filter: "blur(8px)" },
  whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
  viewport: { once: true, margin: "-80px" },
  transition: { delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
});

const stagger = (i: number, base = 0.08) => blurReveal(i * base);

function MouseGlow() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const glowX = useSpring(x, { damping: 30, stiffness: 60 });
  const glowY = useSpring(y, { damping: 30, stiffness: 60 });

  useEffect(() => {
    function handleMove(e: MouseEvent) {
      x.set(e.clientX);
      y.set(e.clientY);
    }
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [x, y]);

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-0 opacity-40"
      style={{ background: `radial-gradient(600px circle at ${glowX}px ${glowY}px, rgba(139, 92, 246, 0.12), transparent 70%)` }}
    />
  );
}

function MagneticButton({ children, href, variant = "primary" }: { children: React.ReactNode; href: string; variant?: "primary" | "secondary" }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  function handleMouseMove(e: React.MouseEvent) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({ x: (e.clientX - rect.left - rect.width / 2) * 0.2, y: (e.clientY - rect.top - rect.height / 2) * 0.3 });
  }

  const base = "group relative inline-flex items-center gap-2 overflow-hidden rounded-full px-7 py-3.5 text-sm font-semibold transition-shadow";
  const styles = variant === "primary"
    ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/25 hover:shadow-violet-500/40"
    : "border border-white/15 text-slate-200 hover:border-white/30 hover:bg-white/[0.04]";

  return (
    <motion.a
      ref={ref}
      href={href}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setPos({ x: 0, y: 0 })}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15 }}
      className={`${base} ${styles}`}
    >
      {variant === "primary" && (
        <span className="absolute inset-0 -z-10 bg-gradient-to-r from-violet-500 to-indigo-500 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-60" />
      )}
      {children}
      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2} />
    </motion.a>
  );
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 8); }
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "Chat", href: "/chat" },
    { label: "Insights", href: "/insights" },
    { label: "Learn", href: "/learn" },
  ];

  return (
    <motion.nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "border-b border-white/[0.08] bg-[#0a0a0a]/70 backdrop-blur-xl" : "border-b border-transparent bg-transparent"}`}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/landing" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-600/20">
            <FileText className="h-4 w-4 text-white" strokeWidth={2} />
          </div>
          <span className="text-[15px] font-bold tracking-tight text-white">Lexora</span>
        </Link>

        <div className="hidden items-center gap-1 sm:flex" onMouseLeave={() => setHovered(null)}>
          {links.map((link) => (
            <Link key={link.href} href={link.href} onMouseEnter={() => setHovered(link.href)} className="relative px-4 py-2 text-[13px] font-medium text-slate-400 transition hover:text-white">
              {link.label}
              {hovered === link.href && (
                <motion.span layoutId="navUnderline" className="absolute inset-x-2 -bottom-px h-px bg-gradient-to-r from-violet-400 to-indigo-400" transition={{ duration: 0.2 }} />
              )}
            </Link>
          ))}
        </div>

        <Link href="/documents" className="rounded-full bg-white/[0.06] px-4 py-2 text-[13px] font-semibold text-white ring-1 ring-white/10 transition hover:bg-white/[0.1]">
          Open App
        </Link>
      </div>
    </motion.nav>
  );
}


function InsightsMockup() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d10] p-5 shadow-2xl shadow-black/50">
      <div className="mb-4 grid grid-cols-3 gap-2">
        {["Pages", "Words", "Read time"].map((label, i) => (
          <div key={label} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5">
            <p className="text-[9px] uppercase text-slate-500">{label}</p>
            <p className="mt-0.5 text-sm font-semibold text-slate-200">{[12, "3.4k", "9m"][i]}</p>
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
        <p className="text-[10px] font-semibold uppercase text-violet-400">Summary</p>
        <div className="mt-2 space-y-1.5">
          <div className="h-1.5 w-full rounded-full bg-white/[0.08]" />
          <div className="h-1.5 w-4/5 rounded-full bg-white/[0.08]" />
          <div className="h-1.5 w-3/5 rounded-full bg-white/[0.08]" />
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {["Transformers", "Attention", "Scaling laws"].map((t) => (
          <span key={t} className="rounded-full bg-violet-500/15 px-2 py-1 text-[10px] text-violet-300">{t}</span>
        ))}
      </div>
    </div>
  );
}

function FlashcardMockup() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d10] p-6 shadow-2xl shadow-black/50">
      <div className="flex min-h-[110px] items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/[0.05] p-5 text-center">
        <p className="text-[13px] text-slate-200">What is the core idea behind self-attention?</p>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-[10px] text-slate-500">3 / 14</span>
        <div className="flex gap-1.5">
          <div className="h-6 w-6 rounded-md border border-white/10" />
          <div className="h-6 w-6 rounded-md border border-white/10" />
        </div>
      </div>
    </div>
  );
}

const EXAMPLE_QUESTIONS = [
  "Compare the arguments in these two research papers",
  "What are the key risks mentioned in this contract?",
  "Summarize the methodology section in plain English",
  "Which sources disagree with each other, and why?",
];

const PLATFORM_SECTIONS = [
  {
    tag: "UPLOAD & UNDERSTAND",
    heading: "Turn any PDF into searchable, structured knowledge",
    description: "Documents are chunked, embedded, and indexed the moment you upload — so every question is answered from real content, not guesswork.",
    points: ["Works across multiple documents at once", "Every chunk keeps its source page number", "Re-indexes automatically as you upload more"],
    icon: Search,
    mockup: InsightsMockup,
  },
  {
    tag: "ASK ANYTHING",
    heading: "Answers grounded in your content, with sources attached",
    description: "Every answer cites the document and page it came from. If the answer isn't in your documents, Lexora says so instead of guessing.",
    points: ["Multi-document synthesis for comparisons", "Follow-up questions keep context", "Streaming responses, no spinner wait"],
    icon: Brain,
    mockup: ChatMockup,
  },
  {
    tag: "GO DEEPER",
    heading: "From reading to actually learning the material",
    description: "Flashcards, quizzes, interview prep, and cheat sheets generated directly from your document — not generic templates.",
    points: ["Auto-generated Q&A and quizzes", "Interview questions by difficulty", "One-page revision sheets"],
    icon: Zap,
    mockup: FlashcardMockup,
  },
];

const FEATURES = [
  { icon: MessageSquare, title: "Chat with your documents", description: "Ask natural-language questions, get grounded answers with sources." },
  { icon: Sparkles, title: "Instant AI insights", description: "Auto-generated summary, key topics, and concepts on every upload." },
  { icon: GraduationCap, title: "Study mode", description: "Flashcards, quizzes, and cheat sheets generated from your material." },
  { icon: Layers, title: "Multi-document reasoning", description: "Ask questions that synthesize across everything you've uploaded." },
];

const FAQS = [
  { q: "What is Lexora?", a: "Lexora is an AI-powered document intelligence platform. Upload PDFs and ask questions in plain English — answers come only from your documents, with sources attached, never from the model's general knowledge." },
  { q: "How is this different from just asking ChatGPT?", a: "General AI chat tools answer from broad training data and can hallucinate. Lexora retrieves the actual relevant passages from your specific documents first, then answers only from that retrieved content — and shows you exactly which document and page it came from." },
  { q: "Can I upload more than one document?", a: "Yes. Lexora supports multi-document reasoning — ask a comparison question and it retrieves relevant context across every document you've uploaded, citing which document each part of the answer came from." },
  { q: "What happens if the answer isn't in my documents?", a: "Lexora tells you directly rather than guessing, and describes what your document actually does contain so you know what to ask instead." },
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.08, 0.25], [0, -8, -40]);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0a0a0a] text-white">
      <MouseGlow />

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <motion.div animate={{ x: [0, 40, 0], y: [0, -30, 0] }} transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }} className="absolute -top-40 left-1/4 h-[500px] w-[600px] rounded-full bg-violet-600/[0.10] blur-[130px]" />
        <motion.div animate={{ x: [0, -30, 0], y: [0, 40, 0] }} transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }} className="absolute top-1/3 right-0 h-[400px] w-[500px] rounded-full bg-indigo-600/[0.08] blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
      </div>

      <Navbar />

      <div className="relative z-10 flex items-center justify-center gap-2 border-b border-white/[0.06] bg-violet-500/[0.06] px-4 py-2 text-center text-xs text-violet-200">
        <span className="font-medium">New: Study Mode with flashcards, quizzes & mind maps</span>
        <Link href="/learn" className="flex items-center gap-1 font-semibold text-violet-300 hover:text-violet-200">
          Try it <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <motion.section style={{ y: heroY }} className="relative z-10 mx-auto max-w-4xl px-6 pt-20 pb-16 text-center sm:pt-28">
        <motion.div {...blurReveal(0)} className="mb-7 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/[0.08] px-4 py-1.5">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400" />
          <span className="text-xs font-medium text-violet-300">DOCUMENT INTELLIGENCE PLATFORM</span>
        </motion.div>

        <motion.h1 {...blurReveal(0.08)} className="text-[2.75rem] font-bold leading-[1.05] tracking-tight sm:text-6xl">
          AI reads your documents.
          <br />
          <motion.span
            className="bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent"
            style={{ backgroundSize: "200% auto" }}
            animate={{ backgroundPosition: ["0% center", "200% center"] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            Knowing what to ask is still hard.
          </motion.span>
        </motion.h1>

        <motion.p {...blurReveal(0.16)} className="mx-auto mt-7 max-w-xl text-[17px] leading-relaxed text-slate-400">
          Lexora keeps every answer grounded in what you actually uploaded — with sources,
          across multiple documents, so you're never guessing whether it's right.
        </motion.p>

        <motion.div {...blurReveal(0.24)} className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <MagneticButton href="/documents">Start for free</MagneticButton>
          <MagneticButton href="/chat" variant="secondary">See it in action</MagneticButton>
        </motion.div>

        <motion.div {...blurReveal(0.35)} animate={{ y: [0, -7, 0], rotate: [0, 0.25, 0] }} transition={{ y: { duration: 6, repeat: Infinity, ease: "easeInOut" }, rotate: { duration: 8, repeat: Infinity, ease: "easeInOut" } }} className="relative mx-auto mt-16 max-w-md">
          <motion.div className="absolute -inset-5 rounded-3xl bg-gradient-to-r from-violet-600/25 to-indigo-600/25 blur-2xl" animate={{ scale: [0.94, 1.08, 0.94], opacity: [0.45, 0.8, 0.45] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }} />
          <ChatMockup />
        </motion.div>

        <motion.div {...blurReveal(0.5)} className="mt-14 flex justify-center">
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}>
            <ChevronDown className="h-5 w-5 text-slate-600" />
          </motion.div>
        </motion.div>
      </motion.section>

      <section className="relative z-10 mx-auto max-w-2xl px-6 pb-24">
        <div className="flex flex-wrap justify-center gap-2">
          {EXAMPLE_QUESTIONS.map((q, i) => (
            <motion.span key={q} {...stagger(i)} className="rounded-full border border-white/[0.08] bg-white/[0.02] px-3.5 py-1.5 text-xs text-slate-400 backdrop-blur-sm">
              {q}
            </motion.span>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-28">
        <motion.h2 {...blurReveal(0)} className="text-center text-3xl font-bold leading-tight sm:text-4xl">
          From scattered PDFs to a system<br className="hidden sm:block" /> you actually use
        </motion.h2>
        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {[
            { title: "Structure that holds", desc: "Every chunk keeps its source and page number, so answers stay verifiable, not just plausible.", icon: CheckCircle2 },
            { title: "Context that carries", desc: "Ask a follow-up and Lexora remembers what you just discussed — no repeating yourself.", icon: Brain },
            { title: "Study tools that stick", desc: "Turn any document into flashcards, quizzes, and revision notes in one click.", icon: BookOpen },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div key={item.title} {...stagger(i, 0.1)} whileHover={{ y: -6 }} className="group relative rounded-2xl border border-white/[0.08] bg-white/[0.02] p-7 transition-colors hover:border-violet-500/30">
                <Icon className="h-6 w-6 text-violet-400" strokeWidth={1.5} />
                <p className="mt-4 text-[15px] font-semibold text-white">{item.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-28">
        <div className="flex flex-col gap-24">
          {PLATFORM_SECTIONS.map((section, i) => {
            const Icon = section.icon;
            const Mockup = section.mockup;
            const reversed = i % 2 === 1;
            return (
              <div key={section.heading} className={`grid items-center gap-10 sm:grid-cols-2 ${reversed ? "sm:[direction:rtl]" : ""}`}>
                <motion.div {...blurReveal(0)} className="sm:[direction:ltr]">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-violet-400">{section.tag}</p>
                  <div className="mt-3 flex items-start gap-3.5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-violet-400">
                      <Icon className="h-5 w-5" strokeWidth={1.75} />
                    </div>
                    <h3 className="text-2xl font-bold leading-tight text-white">{section.heading}</h3>
                  </div>
                  <p className="mt-4 text-[15px] leading-relaxed text-slate-400">{section.description}</p>
                  <ul className="mt-5 flex flex-col gap-2.5">
                    {section.points.map((p) => (
                      <li key={p} className="flex items-start gap-2.5 text-sm text-slate-300">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-violet-400" strokeWidth={1.75} />
                        {p}
                      </li>
                    ))}
                  </ul>
                </motion.div>

                <motion.div {...blurReveal(0.15)} whileHover={{ scale: 1.02 }} className="relative sm:[direction:ltr]">
                  <div className="absolute -inset-6 -z-10 rounded-3xl bg-gradient-to-br from-violet-600/10 to-indigo-600/10 blur-2xl" />
                  <Mockup />
                </motion.div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-28">
        <motion.h2 {...blurReveal(0)} className="mb-14 text-center text-3xl font-bold sm:text-4xl">
          Everything you need to understand a document
        </motion.h2>
        <div className="grid gap-5 sm:grid-cols-2">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div key={f.title} {...stagger(i, 0.1)} whileHover={{ y: -4 }} className="group relative rounded-2xl p-[1px]" style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.15), rgba(255,255,255,0.03), rgba(99,102,241,0.1))" }}>
                <div className="h-full rounded-2xl bg-[#0d0d10] p-7 transition-colors group-hover:bg-[#111114]">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                    <Icon className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-[16px] font-semibold text-white">{f.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-slate-400">{f.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-2xl px-6 pb-28">
        <motion.h2 {...blurReveal(0)} className="mb-10 text-center text-3xl font-bold sm:text-4xl">
          Frequently Asked Questions
        </motion.h2>
        <div className="flex flex-col gap-3">
          {FAQS.map((faq, i) => (
            <motion.div key={faq.q} {...stagger(i, 0.06)} className="overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02]">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="flex w-full items-center justify-between px-5 py-4 text-left">
                <span className="text-[14px] font-medium text-slate-200">{faq.q}</span>
                <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
                </motion.div>
              </button>
              <motion.div initial={false} animate={{ height: openFaq === i ? "auto" : 0, opacity: openFaq === i ? 1 : 0 }} transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
                <p className="px-5 pb-5 text-[13.5px] leading-relaxed text-slate-400">{faq.a}</p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-3xl px-6 pb-28 text-center">
        <motion.div {...blurReveal(0)} className="relative overflow-hidden rounded-3xl border border-violet-500/15 bg-gradient-to-br from-violet-500/[0.06] to-indigo-500/[0.04] p-12">
          <div className="absolute -top-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-violet-600/20 blur-3xl" />
          <h2 className="relative text-3xl font-bold text-white">See it on your own documents</h2>
          <p className="relative mx-auto mt-3 max-w-md text-[15px] text-slate-400">
            Upload a PDF and get a grounded answer in seconds — no signup friction.
          </p>
          <div className="relative mt-8 flex justify-center">
            <MagneticButton href="/documents">Open Lexora</MagneticButton>
          </div>
        </motion.div>
      </section>

      <footer className="relative z-10 border-t border-white/[0.06] py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-start justify-between gap-8 sm:flex-row">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
                  <FileText className="h-3.5 w-3.5 text-white" strokeWidth={2} />
                </div>
                <span className="text-sm font-bold text-white">Lexora</span>
              </div>
              <p className="mt-3 max-w-xs text-xs leading-relaxed text-slate-500">
                AI-powered document intelligence — grounded answers, real sources, actual study tools.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-8 text-xs">
              <div>
                <p className="mb-3 font-semibold text-slate-300">Product</p>
                <div className="flex flex-col gap-2 text-slate-500">
                  <Link href="/chat" className="hover:text-slate-300">Chat</Link>
                  <Link href="/insights" className="hover:text-slate-300">Insights</Link>
                  <Link href="/learn" className="hover:text-slate-300">Study Mode</Link>
                </div>
              </div>
              <div>
                <p className="mb-3 font-semibold text-slate-300">Company</p>
                <div className="flex flex-col gap-2 text-slate-500">
                  <Link href="/documents" className="hover:text-slate-300">App</Link>
                  <Link href="/settings" className="hover:text-slate-300">Settings</Link>
                </div>
              </div>
              <div>
                <p className="mb-3 font-semibold text-slate-300">Connect</p>
                <div className="flex gap-3 text-slate-500">
  <FaGithub className="h-4 w-4 cursor-pointer transition hover:text-slate-300" />
<FaXTwitter className="h-4 w-4 cursor-pointer transition hover:text-slate-300" />
<FaLinkedin className="h-4 w-4 cursor-pointer transition hover:text-slate-300" />
</div>
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-white/[0.06] pt-6 text-center text-xs text-slate-600">
            © {new Date().getFullYear()} Lexora. Built as a personal AI engineering project.
          </div>
        </div>
      </footer>
    </div>
  );
}
