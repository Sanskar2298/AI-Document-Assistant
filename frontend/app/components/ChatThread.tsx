"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Send, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type Source = { documentName: string; pageNumber: number | null; chunkIndex: number; preview?: string };

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  documentsUsed?: string[];
  timestamp: Date;
};

interface ChatThreadProps {
  selectedDocumentIds: string[];
  suggestedPrompts?: string[];
  initialQuestion?: string | null;
  onSourcesUpdate?: (sources: Source[]) => void;
}

export default function ChatThread({ selectedDocumentIds, suggestedPrompts = [], initialQuestion, onSourcesUpdate }: ChatThreadProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState(initialQuestion || "");
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialQuestion) setInput(initialQuestion);
  }, [initialQuestion]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend() {
    const question = input.trim();
    if (!question || loading) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: question, timestamp: new Date() };
    // Pair up completed user/assistant turns from before this new message.
    // This array is what actually gets sent to the backend — real context,
    // not just a visual thread.
    const priorTurns: { question: string; answer: string }[] = [];
    for (let i = 0; i < messages.length - 1; i++) {
      if (messages[i].role === "user" && messages[i + 1]?.role === "assistant" && messages[i + 1].content) {
        priorTurns.push({ question: messages[i].content, answer: messages[i + 1].content });
      }
    }

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setStatusMessage("Searching documents...");

    const assistantId = crypto.randomUUID();
    setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "", timestamp: new Date() }]);

    try {
      const res = await fetch(`${API_URL}/api/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          selectedDocumentIds,
          searchScope: selectedDocumentIds.length > 0 ? "selected" : "all",
          history: priorTurns,
        }),
      });

      if (!res.body) throw new Error("Streaming not supported.");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const events = buffer.split("\n\n");
        buffer = events.pop() || "";

        for (const rawEvent of events) {
          const eventTypeMatch = rawEvent.match(/^event: (.+)$/m);
          const dataMatch = rawEvent.match(/^data: (.+)$/m);
          if (!eventTypeMatch || !dataMatch) continue;

          const eventType = eventTypeMatch[1];
          const data = JSON.parse(dataMatch[1]);

          if (eventType === "status") {
            setStatusMessage(data.message);
          } else if (eventType === "token") {
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + data.text } : m))
            );
          } else if (eventType === "sources") {
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantId ? { ...m, sources: data.sources, documentsUsed: data.documentsUsed } : m))
            );
            onSourcesUpdate?.(data.sources || []);
          } else if (eventType === "error") {
            throw new Error(data.message);
          } else if (eventType === "done") {
            setStatusMessage(null);
          }
        }
      }
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: err instanceof Error ? `⚠️ ${err.message}` : "⚠️ Something went wrong." }
            : m
        )
      );
    } finally {
      setLoading(false);
      setStatusMessage(null);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-1">
        {messages.length === 0 ? (
          <EmptyThread onPromptClick={setInput} suggestedPrompts={suggestedPrompts} />
        ) : (
          <div className="flex flex-col gap-5 py-4">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
            </AnimatePresence>
            {loading && statusMessage && (
              <div className="flex items-center gap-2 pl-1 text-xs text-slate-500">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400" />
                {statusMessage}
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div className="sticky bottom-0 border-t border-white/[0.06] bg-[#0a0a0a] pt-3">
        <div className="flex items-end gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-2 transition focus-within:border-violet-500/40">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your documents..."
            rows={1}
            className="max-h-32 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-white placeholder:text-slate-500 outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-600 text-white transition hover:bg-violet-500 disabled:opacity-40"
          >
            <Send className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyThread({ onPromptClick, suggestedPrompts }: { onPromptClick: (p: string) => void; suggestedPrompts: string[] }) {
  const prompts = suggestedPrompts.length > 0
    ? suggestedPrompts
    : ["Summarize this document", "What are the key takeaways?", "List the most important facts"];

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-400">
        <Sparkles className="h-6 w-6" strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-200">Ask anything about your documents</p>
        <p className="mt-1 text-xs text-slate-500">Answers are grounded only in what you've uploaded</p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {prompts.slice(0, 4).map((p) => (
          <button
            key={p}
            onClick={() => onPromptClick(p)}
            className="rounded-full border border-white/10 px-3.5 py-1.5 text-xs text-slate-400 transition hover:border-violet-500/30 hover:bg-violet-500/[0.06] hover:text-white"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  const sourcesByDoc = (message.sources || []).reduce<Record<string, Source[]>>((acc, s) => {
    acc[s.documentName] = acc[s.documentName] || [];
    acc[s.documentName].push(s);
    return acc;
  }, {});

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div className={`max-w-[85%] ${isUser ? "" : "w-full"}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser ? "bg-violet-600 text-white" : "border border-white/10 bg-white/[0.02] text-slate-200"
          }`}
        >
          {isUser ? (
            message.content
          ) : message.content ? (
            <div className="prose-sm prose-invert [&_p]:my-1.5 [&_ul]:my-1.5 [&_li]:my-0.5">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          ) : (
            <span className="inline-block h-4 w-1.5 animate-pulse bg-violet-400" />
          )}
        </div>

        <p className={`mt-1 text-[10px] text-slate-600 ${isUser ? "text-right" : ""}`}>
          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>

        {message.sources && message.sources.length > 0 && (
          <div className="mt-2 flex flex-col gap-1.5">
            {Object.entries(sourcesByDoc).map(([docName, srcs]) => (
              <div key={docName} className="rounded-lg border border-white/[0.06] bg-white/[0.015] px-3 py-2">
                <p className="text-[11px] font-medium text-slate-400">{docName}</p>
                <p className="mt-0.5 text-[10px] text-slate-600">
                  {srcs.map((s) => s.pageNumber != null ? `p.${s.pageNumber}` : null).filter(Boolean).join(", ")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}