import { Link, useLocation } from "react-router-dom";
import { LogOut, Store, X } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { roleHome } from "../../utils/auth";
import { initials } from "../../utils/format";
import { RoleBadge } from "../common/RoleBadge";

function activeItem(items, pathname) {
  const matches = items.filter((item) => pathname === item.to || pathname.startsWith(`${item.to}/`));
  return matches.sort((a, b) => b.to.length - a.to.length)[0]?.to ?? null;
}

export function Sidebar({ navItems, mobileOpen, onClose, onLogout }) {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const activeTo = activeItem(navItems, pathname);

  const content = (
    <div className="flex h-full flex-col bg-slate-900 text-slate-100">
      <div className="flex h-16 items-center justify-between border-b border-slate-800 px-5">
        <Link to={roleHome(user?.role)} onClick={onClose} className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
            <Store className="h-4 w-4 text-white" aria-hidden="true" />
          </span>
          <span className="text-lg font-semibold text-white">StoreRate</span>
        </Link>
        {mobileOpen && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTo === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onClose}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? "bg-indigo-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-sm font-semibold text-indigo-300">
            {initials(user?.name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{user?.name}</p>
            <RoleBadge role={user?.role} />
          </div>
          <button
            type="button"
            onClick={onLogout}
            title="Log out"
            aria-label="Log out"
            className="rounded-md p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">{content}</aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/60 animate-fade-in" onClick={onClose} aria-hidden="true" />
          <div className="absolute inset-y-0 left-0 w-64 shadow-xl animate-slide-in-left">{content}</div>
        </div>
      )}
    </>
  );
}
