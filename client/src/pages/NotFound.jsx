import { Compass } from "lucide-react";
import { ButtonLink } from "../components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <p className="text-6xl font-bold text-slate-200">404</p>
      <div className="mt-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <Compass className="h-6 w-6" aria-hidden="true" />
      </div>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-2 max-w-md text-sm text-slate-500">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <ButtonLink to="/" className="mt-6">
        Go back home
      </ButtonLink>
    </div>
  );
}
