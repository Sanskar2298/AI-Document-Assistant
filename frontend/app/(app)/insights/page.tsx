"use client";

import { useDocuments } from "@/app/components/DocumentsContext";
import DocumentInsights from "@/app/components/DocumentInsights";
import EmptyState from "@/app/components/ui/EmptyState";

export default function InsightsPage() {
  const { documents, setPrefilledQuestion } = useDocuments();
  const latestDoc = documents[documents.length - 1];

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 sm:py-14">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Insights</h1>
        <p className="mt-1.5 text-sm text-slate-400">
          An instant overview of your most recently uploaded document.
        </p>
      </div>

      {latestDoc?.insights ? (
        <DocumentInsights insights={latestDoc.insights} onQuestionClick={setPrefilledQuestion} />
      ) : (
        <div className="glass-card">
          <EmptyState
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
              </svg>
            }
            title="No insights yet"
            description="Upload a document from the Documents page to see an AI-generated overview."
          />
        </div>
      )}
    </div>
  );
}