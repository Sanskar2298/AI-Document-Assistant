"use client";

import { useDocuments } from "@/app/components/DocumentsContext";
import StudyMode from "@/app/components/StudyMode";
import EmptyState from "@/app/components/ui/EmptyState";

export default function LearnPage() {
  const { documents } = useDocuments();
  const latestDoc = documents[documents.length - 1];

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 sm:py-14">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Learn</h1>
        <p className="mt-1.5 text-sm text-slate-400">
          Flashcards, quizzes, interview prep, and revision material generated from your document.
        </p>
      </div>

      {latestDoc ? (
        <StudyMode documentId={latestDoc.documentId} />
      ) : (
        <div className="glass-card">
          <EmptyState
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
              </svg>
            }
            title="No study material yet"
            description="Upload a document from the Documents page to generate flashcards, quizzes, and more."
          />
        </div>
      )}
    </div>
  );
}