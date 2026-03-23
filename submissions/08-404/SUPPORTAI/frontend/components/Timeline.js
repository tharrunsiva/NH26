"use client";

export default function Timeline({ timeline = [] }) {
  if (!timeline.length) return null;

  return (
    <div className="rounded-3xl bg-white/70 p-4">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
        Incident Timeline
      </p>
      <div className="space-y-3">
        {timeline.map((item) => (
          <div key={`${item.label}-${item.date}`} className="flex items-center gap-3">
            <div
              className={`h-3 w-3 rounded-full ${
                item.status === "issue"
                  ? "bg-red-500"
                  : item.status === "current"
                    ? "bg-amber-500"
                    : item.status === "done"
                      ? "bg-emerald-500"
                      : "bg-slate-300"
              }`}
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-ink">{item.label}</p>
              <p className="text-xs text-slate-500">{item.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
