import { useState } from "react";
import { Star } from "lucide-react";

export function RatingInput({ value = 0, onChange, starSize = 28 }) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="flex gap-1"
        role="radiogroup"
        aria-label="Select a rating from 1 to 5"
        onMouseLeave={() => setHovered(0)}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
            onMouseEnter={() => setHovered(star)}
            onClick={() => onChange(star)}
            className="rounded p-1 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <Star
              style={{ width: starSize, height: starSize }}
              className={active >= star ? "fill-amber-400 text-amber-400" : "text-slate-300"}
              strokeWidth={1.5}
            />
          </button>
        ))}
      </div>
      <p className="text-xs font-medium text-slate-500">{active ? `${active} / 5` : "Select a rating"}</p>
    </div>
  );
}
