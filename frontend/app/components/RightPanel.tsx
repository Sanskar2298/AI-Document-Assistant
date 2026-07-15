"use client";

/**
 * RightPanel.tsx
 *
 * The "intelligence panel" — but only showing data that genuinely exists.
 * No invented word counts, reading time, or topic extraction — none of
 * that is computed anywhere in the current pipeline, and fabricating UI
 * for data that doesn't exist would just be a different kind of fake.
 *
 * Shows: which documents are active this session, and the sources behind
 * the most recent answer (if any) — both are real state already tracked
 * in the parent workspace page.
 */

type UploadedDoc = { documentId: string; fileName: string; pages: number };

type Source = {
  documentName: string;
  pageNumber: number | null;
  chunkIndex: number;
};

interface RightPanelProps {
  documents: UploadedDoc[];
  recentSources: Source[];
}

export default function RightPanel({ documents, recentSources }: RightPanelProps) {
  return (
    <aside className="hidden w-72 shrink-0 flex-col gap-6 border-l border-white/[0.06] bg-[#050816] px-5 py-6 lg:flex">
      <Section title="Current Documents">
        {documents.length === 0 ? (
          <EmptyLine text="No documents uploaded yet" />
        ) : (
          <div className="flex flex-col gap-2">
            {documents.map((doc) => (
              <div
                key={doc.documentId}
                className="flex items-center gap-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2"
              >
                <DocIcon />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-slate-300">{doc.fileName}</p>
                  <p className="text-[10px] text-slate-500">{doc.pages} pages</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Recent Sources">
        {recentSources.length === 0 ? (
          <EmptyLine text="Sources from your last answer will appear here" />
        ) : (
          <div className="flex flex-col gap-2">
            {recentSources.map((s, i) => (
              <div
                key={`${s.documentName}-${s.chunkIndex}-${i}`}
                className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2"
              >
                <p className="truncate text-xs text-slate-300">{s.documentName}</p>
                {s.pageNumber != null && (
                  <p className="text-[10px] text-slate-500">Page {s.pageNumber}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Session">
        <p className="text-xs text-slate-500">
          {documents.length} document{documents.length !== 1 ? "s" : ""} active
        </p>
      </Section>
    </aside>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </p>
      {children}
    </div>
  );
}

function EmptyLine({ text }: { text: string }) {
  return <p className="text-xs text-slate-600">{text}</p>;
}

function DocIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  );
}