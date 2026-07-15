import { ReactNode } from "react";

interface EmptyStateProps {
    icon: ReactNode;
    title: string;
    description: string;
    action?: ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.06] text-slate-400">
                {icon}
            </div>
            <h3 className="text-[15px] font-medium text-slate-200">{title}</h3>
            <p className="mt-1.5 max-w-sm text-[13px] text-slate-500">{description}</p>
            {action && <div className="mt-5">{action}</div>}
        </div>
    );
}