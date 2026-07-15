import EmptyState from "@/app/components/ui/EmptyState";

export default function ComparePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10 sm:py-14">
      <h1 className="text-2xl font-bold text-white">Compare</h1>
      <p className="mt-1.5 text-sm text-slate-400">Side-by-side document comparison.</p>

      <div className="glass-card mt-8">
        <EmptyState
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          }
          title="Coming soon"
          description="Compare will let you view two documents side by side with a shared AI analysis."
        />
      </div>
    </div>
  );
}