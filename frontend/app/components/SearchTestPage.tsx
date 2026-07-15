'use client';

/**
 * SearchTestPage.tsx
 *
 * A bare developer testing page for Day 4 retrieval. Deliberately NOT
 * styled like a chat interface — no message bubbles, no "AI is typing",
 * no conversational framing — because this endpoint does not generate
 * answers. It only returns matching chunks.
 */

import { useState } from "react";

type SearchResult = {
    documentName: string;
    pageNumber: number | null;
    score: number;
    text: string;
};

export default function SearchTestPage() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    async function handleSearch() {
        if (!query.trim()) return;

        setLoading(true);
        setError(null);
        setHasSearched(true);

        try {
            const res = await fetch("http://localhost:3001/api/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query }),
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Search failed");
            }

            setResults(data.results);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Search failed");
            setResults([]);
        } finally {
            setLoading(false);
        }
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter") handleSearch();
    }

    return (
        <div style={{ maxWidth: 720, margin: "40px auto", padding: "0 16px", fontFamily: "system-ui, sans-serif" }}>
            <h2 style={{ marginBottom: 4 }}>Lexora — Retrieval Test</h2>
            <p style={{ color: "#666", fontSize: 14, marginBottom: 24 }}>
                Developer tool. Returns matching chunks only — no generated answers.
            </p>

            <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="e.g. What are transformers?"
                    style={{
                        flex: 1,
                        padding: "10px 12px",
                        border: "1px solid #ccc",
                        borderRadius: 6,
                        fontSize: 14,
                    }}
                />
                <button
                    onClick={handleSearch}
                    disabled={loading || !query.trim()}
                    style={{
                        padding: "10px 20px",
                        border: "none",
                        borderRadius: 6,
                        background: loading ? "#999" : "#111",
                        color: "#fff",
                        fontSize: 14,
                        cursor: loading ? "default" : "pointer",
                    }}
                >
                    {loading ? "Searching..." : "Search"}
                </button>
            </div>

            {error && (
                <div style={{ color: "#c0392b", marginBottom: 16, fontSize: 14 }}>
                    Error: {error}
                </div>
            )}

            {loading && <div style={{ color: "#666", fontSize: 14 }}>Retrieving relevant chunks...</div>}

            {!loading && hasSearched && results.length === 0 && !error && (
                <div style={{ color: "#666", fontSize: 14 }}>No matching chunks found.</div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {results.map((r, i) => (
                    <div
                        key={i}
                        style={{
                            border: "1px solid #e0e0e0",
                            borderRadius: 8,
                            padding: 14,
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13, color: "#444" }}>
                            <span>
                                <strong>{r.documentName}</strong>
                                {r.pageNumber != null && ` — page ${r.pageNumber}`}
                            </span>
                            <span style={{ fontFamily: "monospace" }}>score: {r.score.toFixed(4)}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: "#222" }}>{r.text}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}