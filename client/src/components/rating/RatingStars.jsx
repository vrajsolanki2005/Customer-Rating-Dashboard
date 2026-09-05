import { Star } from "lucide-react";

const SIZES = { sm: "h-4 w-4", md: "h-5 w-5", lg: "h-7 w-7" };

function StarRow({ size, className = "" }) {
  const sizeClass = SIZES[size] ?? SIZES.md;
  return (
    <div className={`flex w-max gap-0.5 ${className}`} aria-hidden="true">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star key={index} className={`${sizeClass} fill-current`} strokeWidth={1.5} />
      ))}
    </div>
  );
}

export function RatingStars({ value = 0, size = "md", className = "" }) {
  const clamped = Math.max(0, Math.min(5, Number(value) || 0));
  const percent = (clamped / 5) * 100;

  return (
    <span className={`relative inline-flex ${className}`} role="img" aria-label={`Rated ${clamped.toFixed(1)} out of 5`}>
      <StarRow size={size} className="text-slate-200" />
      <span className="absolute left-0 top-0 h-full overflow-hidden" style={{ width: `${percent}%` }}>
        <StarRow size={size} className="text-amber-400" />
      </span>
    </span>
  );
}
