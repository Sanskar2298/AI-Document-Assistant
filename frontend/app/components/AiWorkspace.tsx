"use client";

import { useState, useEffect } from "react";
import Card from "./ui/Card";
import Button from "./ui/Button";
import Input from "./ui/Input";
import Badge from "./ui/Badge";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type Source = {
  documentName: string;
  pageNumber: number | null;
  chunkIndex: number;
  preview?: string;
};

type ChatResponse = {
  success: boolean;
  answer: string;
  sources: Source[];
  documentsUsed: string[];
  message?: string;
};

interface AiWorkspaceProps {
  selectedDocumentIds?: string[];
  onSourcesUpdate?: (sources: Source[]) => void;
  initialQuestion?: string | null;
}

export default function AiWorkspace({ selectedDocumentIds = [], onSourcesUpdate, initialQuestion }: AiWorkspaceProps) {
  const [question, setQuestion] = useState(initialQuestion || "");

  useEffect(() => {
    if (initialQuestion) setQuestion(initialQuestion);
  }, [initialQuestion]);

  const [answer, setAnswer] = useState<string | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [documentsUsed, setDocumentsUsed] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [streamingMode, setStreamingMode] = useState(true);

  function resetState() {
    setError(null);
    setAnswer(null);
    setSources([]);
    setDocumentsUsed([]);
    setStatusMessage(null);
  }

  function buildRequestBody() {
    return {
      question,
      selectedDocumentIds,
      searchScope: selectedDocumentIds.length > 0 ? "selected" : "all",
    };
  }

  function applySources(newSources: Source[], newDocumentsUsed: string[]) {
    setSources(newSources);
    setDocumentsUsed(newDocumentsUsed);
    onSourcesUpdate?.(newSources);
  }

  async function handleAskNonStreaming() {
    setLoading(true);
    resetState();
    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildRequestBody()),
      });
      const data: ChatResponse = await res.json();
      if (!data.success) throw new Error(data.message || "Something went wrong. Please try again.");
      setAnswer(data.answer);
      applySources(data.sources, data.documentsUsed || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAskStreaming() {
    setLoading(true);
    resetState();
    setAnswer("");

    try {
      const res = await fetch(`${API_URL}/api/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildRequestBody()),
      });

      if (!res.body) throw new Error("Streaming not supported by this response.");

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
            setAnswer((prev) => (prev ?? "") + data.text);
          } else if (eventType === "sources") {
            applySources(data.sources, data.documentsUsed || []);
          } else if (eventType === "error") {
            throw new Error(data.message);
          } else if (eventType === "done") {
            setStatusMessage(null);
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleAsk() {
    if (!question.trim() || loading) return;
    if (streamingMode) handleAskStreaming();
    else handleAskNonStreaming();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleAsk();
  }

  const sourcesByDocument = sources.reduce<Record<string, Source[]>>((acc, s) => {
    acc[s.documentName] = acc[s.documentName] || [];
    acc[s.documentName].push(s);
    return acc;
  }, {});

  return (
    <Card>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Ask a question</h2>
          <p className="mt-1.5 text-sm text-slate-400">
            Answers are generated only from your uploaded documents, with sources shown below.
          </p>
        </div>
        <button
          onClick={() => setStreamingMode((v) => !v)}
          className="shrink-0 rounded-full border border-white/10 px-3 py-1 text-[11px] text-slate-400 transition hover:border-white/20 hover:text-white"
        >
          {streamingMode ? "Streaming: on" : "Streaming: off"}
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. Compare the two documents"
        />
        <Button onClick={handleAsk} disabled={!question.trim()} loading={loading}>
          {loading ? "Thinking..." : "Ask"}
        </Button>
      </div>

      {loading && statusMessage && (
        <div className="mt-6 flex items-center gap-2 text-sm text-slate-400">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400" />
          {statusMessage}
        </div>
      )}

      {error && !loading && (
        <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {answer !== null && (
        <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-violet-400">Answer</p>
            {sources.length === 0 && !loading && <Badge tone="warning">No match found</Badge>}
          </div>
          <p className="mt-2 text-sm leading-relaxed text-slate-200 whitespace-pre-wrap">
            {answer}
            {loading && <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-violet-400" />}
          </p>
        </div>
      )}

      {sources.length > 0 && !loading && (
        <div className="mt-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Sources</p>
            {documentsUsed.length > 1 && (
              <Badge tone="accent">
                {sources.length} sources across {documentsUsed.length} documents
              </Badge>
            )}
          </div>

          <div className="flex flex-col gap-4">
            {Object.entries(sourcesByDocument).map(([docName, docSources]) => (
              <div key={docName}>
                <p className="mb-2 text-xs font-medium text-slate-400">{docName}</p>
                <div className="flex flex-col gap-2">
                  {docSources.map((s, i) => (
                    <div
                      key={`${docName}-${s.chunkIndex}-${i}`}
                      className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-2.5"
                    >
                      <div className="flex items-center justify-between">
                        {s.pageNumber != null && <Badge tone="neutral">page {s.pageNumber}</Badge>}
                      </div>
                      {s.preview && (
                        <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{s.preview}...</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}