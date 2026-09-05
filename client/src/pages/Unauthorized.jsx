import { ShieldAlert } from "lucide-react";
import { ButtonLink } from "../components/ui/Button";
import { useAuth } from "../hooks/useAuth";
import { roleHome } from "../utils/auth";
import { roleLabel } from "../components/common/RoleBadge";

export default function Unauthorized({ requiredRole }) {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
        <ShieldAlert className="h-8 w-8" aria-hidden="true" />
      </div>
      <h1 className="mt-5 text-2xl font-bold text-slate-900">Access denied</h1>
      <p className="mt-2 max-w-md text-sm text-slate-500">
        You don&apos;t have permission to view this area. This page is restricted to{" "}
        <span className="font-medium text-slate-700">{roleLabel(requiredRole)}</span> accounts.
      </p>
      <ButtonLink to={roleHome(user?.role)} className="mt-6">
        Go to my dashboard
      </ButtonLink>
    </div>
  );
}
