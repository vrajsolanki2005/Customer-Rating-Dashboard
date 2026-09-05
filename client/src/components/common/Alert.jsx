import { AlertCircle, AlertTriangle, CheckCircle2, Info } from "lucide-react";

const STYLES = {
  error: { icon: AlertCircle, container: "border-red-200 bg-red-50 text-red-700" },
  success: { icon: CheckCircle2, container: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  warning: { icon: AlertTriangle, container: "border-amber-200 bg-amber-50 text-amber-700" },
  info: { icon: Info, container: "border-sky-200 bg-sky-50 text-sky-700" },
};

export function Alert({ variant = "error", children }) {
  if (!children) return null;
  const { icon: Icon, container } = STYLES[variant] ?? STYLES.error;
  return (
    <div className={`flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-sm ${container}`} role="alert">
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div className="flex-1">{children}</div>
    </div>
  );
}
