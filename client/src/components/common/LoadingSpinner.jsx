import { Loader2 } from "lucide-react";

export function LoadingSpinner({ label = "Loading…", className = "" }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-16 text-slate-500 ${className}`} role="status">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-600" aria-hidden="true" />
      {label && <p className="text-sm">{label}</p>}
    </div>
  );
}

export function FullScreenLoader() {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-50" role="status">
      <LoadingSpinner label="Loading your workspace…" />
    </div>
  );
}
