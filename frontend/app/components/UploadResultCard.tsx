import { CheckCircle2, FileText } from "lucide-react";

type UploadResult = {
  success: boolean;
  fileName: string;
  pages: number;
};

export default function UploadResultCard({ result }: { result: UploadResult }) {
  if (!result?.success) return null;

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-5">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
        <CheckCircle2 className="h-5 w-5" strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <FileText className="h-3.5 w-3.5 shrink-0 text-slate-500" />
          <p className="truncate text-sm font-medium text-slate-200">{result.fileName}</p>
        </div>
        <p className="mt-0.5 text-xs text-slate-500">
          {result.pages} page{result.pages !== 1 ? "s" : ""} · Ready to chat
        </p>
      </div>
    </div>
  );
}