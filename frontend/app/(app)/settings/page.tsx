import { Settings } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="mx-auto max-w-3xl px-6 py-10 sm:py-14">
            <h1 className="text-2xl font-bold text-white">Settings</h1>
            <p className="mt-1.5 text-sm text-slate-400">Preferences and account settings.</p>

            <div className="glass-card mt-8 flex flex-col items-center justify-center px-6 py-16 text-center">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.06] text-slate-400">
                    <Settings className="h-6 w-6" strokeWidth={1.5} />
                </div>
                <h3 className="text-[15px] font-medium text-slate-200">Coming soon</h3>
                <p className="mt-1.5 max-w-sm text-[13px] text-slate-500">
                    Preferences, theme, and account settings will live here.
                </p>
            </div>
        </div>
    );
}