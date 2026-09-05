import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export const ToastContext = createContext(null);

const STYLES = {
  success: { icon: CheckCircle2, iconClass: "text-emerald-500", border: "border-emerald-200" },
  error: { icon: AlertCircle, iconClass: "text-red-500", border: "border-red-200" },
  info: { icon: Info, iconClass: "text-sky-500", border: "border-sky-200" },
};

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (type, message) => {
      const id = ++toastId;
      setToasts((prev) => [...prev.slice(-4), { id, type, message }]);
      window.setTimeout(() => dismiss(id), type === "error" ? 6000 : 4000);
    },
    [dismiss]
  );

  const toast = useMemo(
    () => ({
      success: (message) => push("success", message),
      error: (message) => push("error", message),
      info: (message) => push("info", message),
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        className="fixed inset-x-0 bottom-0 z-[100] flex flex-col gap-2 px-4 pb-4 sm:inset-x-auto sm:bottom-4 sm:right-4 sm:w-full sm:max-w-sm sm:px-0"
        aria-live="polite"
      >
        {toasts.map(({ id, type, message }) => {
          const style = STYLES[type] ?? STYLES.info;
          const Icon = style.icon;
          return (
            <div
              key={id}
              role="status"
              className={`pointer-events-auto flex items-start gap-3 rounded-lg border ${style.border} bg-white p-4 shadow-lg animate-slide-in-right`}
            >
              <Icon className={`h-5 w-5 shrink-0 ${style.iconClass}`} />
              <p className="flex-1 text-sm text-slate-700">{message}</p>
              <button
                type="button"
                onClick={() => dismiss(id)}
                className="text-slate-400 transition-colors hover:text-slate-600"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
