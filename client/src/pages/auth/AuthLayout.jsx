import { MapPin, ShieldCheck, Star, Store } from "lucide-react";

export function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="relative hidden w-1/2 flex-col justify-between bg-slate-900 p-10 lg:flex xl:w-3/5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600">
            <Store className="h-5 w-5 text-white" aria-hidden="true" />
          </span>
          <span className="text-xl font-semibold text-white">StoreRate</span>
        </div>

        <div className="max-w-md">
          <h2 className="text-3xl font-bold leading-tight text-white">
            Honest ratings for the stores around you.
          </h2>
          <p className="mt-4 text-slate-400">
            Browse stores, share your experience with a 1–5 star rating, and help your community find the
            best places to shop.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-slate-300">
            <li className="flex items-center gap-2.5">
              <Star className="h-4 w-4 text-amber-400" aria-hidden="true" />
              Rate stores and update your rating anytime
            </li>
            <li className="flex items-center gap-2.5">
              <MapPin className="h-4 w-4 text-indigo-400" aria-hidden="true" />
              Discover stores by name, address or rating
            </li>
            <li className="flex items-center gap-2.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" aria-hidden="true" />
              Your ratings are tied to your verified account
            </li>
          </ul>
        </div>

        <p className="text-xs text-slate-500">© {new Date().getFullYear()} StoreRate. All rights reserved.</p>
      </div>

      <div className="flex w-full flex-col justify-center px-4 py-10 sm:px-8 lg:w-1/2 xl:w-2/5">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600">
              <Store className="h-5 w-5 text-white" aria-hidden="true" />
            </span>
            <span className="text-xl font-semibold text-slate-900">StoreRate</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <p className="mt-2 text-sm text-slate-500">{subtitle}</p>

          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
