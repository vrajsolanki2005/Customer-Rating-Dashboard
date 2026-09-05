import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "../ui/Button";
import { getApiErrorMessage } from "../../utils/apiError";

export function ErrorState({ error, onRetry, message }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
        <AlertTriangle className="h-6 w-6" aria-hidden="true" />
      </div>
      <h3 className="text-sm font-semibold text-slate-900">Something went wrong</h3>
      <p className="max-w-sm text-sm text-slate-500">{message || getApiErrorMessage(error)}</p>
      {onRetry && (
        <Button variant="secondary" icon={RefreshCw} onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
