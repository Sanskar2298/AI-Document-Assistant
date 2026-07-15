"use client";

import { useDocuments } from "@/app/components/DocumentsContext";
import ChatThread from "@/app/components/ChatThread";
import RightPanel from "@/app/components/RightPanel";
import EmptyState from "@/app/components/ui/EmptyState";
import { MessageSquare } from "lucide-react";

export default function ChatPage() {
    const { documents, setRecentSources, recentSources, prefilledQuestion } = useDocuments();
    const documentIds = documents.map((d) => d.documentId);
    const latestDoc = documents[documents.length - 1];
    const suggestedPrompts = latestDoc?.insights?.suggestedQuestions || [];

    return (
        <div className="flex h-full">
            <div className="flex flex-1 flex-col overflow-hidden">
                <div className="border-b border-white/[0.06] px-6 py-4">
                    <h1 className="text-lg font-semibold text-white">Chat</h1>
                </div>

                <div className="flex-1 overflow-hidden px-6 py-4">
                    {documents.length > 0 ? (
                        <ChatThread
                            selectedDocumentIds={documentIds}
                            suggestedPrompts={suggestedPrompts}
                            initialQuestion={prefilledQuestion}
                            onSourcesUpdate={setRecentSources}
                        />
                    ) : (
                        <div className="glass-card h-full">
                            <EmptyState
                                icon={<MessageSquare className="h-6 w-6" strokeWidth={1.5} />}
                                title="No documents yet"
                                description="Upload a document from the Documents page to start chatting."
                            />
                        </div>
                    )}
                </div>
            </div>

            <RightPanel documents={documents} recentSources={recentSources} />
        </div>
    );
}