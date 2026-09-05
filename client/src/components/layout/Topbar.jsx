import { useLocation } from "react-router-dom";
import { LogOut, Menu, Store } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { roleLabel } from "../common/RoleBadge";
import { initials } from "../../utils/format";

export function Topbar({ navItems, onMenuClick, onLogout }) {
  const { user } = useAuth();
  const { pathname } = useLocation();

  const current = navItems
    .filter((item) => pathname === item.to || pathname.startsWith(`${item.to}/`))
    .sort((a, b) => b.to.length - a.to.length)[0];

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-md p-2 text-slate-600 transition-colors hover:bg-slate-100 lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2 lg:hidden">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
            <Store className="h-3.5 w-3.5 text-white" aria-hidden="true" />
          </span>
          <span className="text-base font-semibold text-slate-900">StoreRate</span>
        </div>
        <h2 className="hidden text-sm font-medium text-slate-500 lg:block">
          {current?.label ?? navItems[0]?.label ?? "StoreRate"}
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="max-w-[12rem] truncate text-sm font-medium text-slate-800">{user?.name}</p>
          <p className="text-xs text-slate-400">{roleLabel(user?.role)}</p>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
          {initials(user?.name)}
        </span>
        <button
          type="button"
          onClick={onLogout}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
