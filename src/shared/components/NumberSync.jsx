import { useEffect, useId, useState } from "react";
import { cn } from "@shared/lib/format";

export function NumberSync({ value, onChange, min, max, step = 1, suffix, label = "값 직접 입력", presets }) {
  const [draft, setDraft] = useState(value.toLocaleString("ko-KR"));
  const [error, setError] = useState("");
  const id = useId();
  useEffect(() => { setDraft(value.toLocaleString("ko-KR")); }, [value]);
  const commit = () => {
    const parsed = Number(draft.replaceAll(",", ""));
    if (!draft.trim() || !Number.isFinite(parsed)) {
      setDraft(value.toLocaleString("ko-KR")); setError("숫자를 입력해 주세요. 이전 값을 유지했습니다."); return;
    }
    const bounded = Math.max(min, Math.min(max, parsed));
    const precision = String(step).split(".")[1]?.length ?? 0;
    const next = Number(Math.max(min, Math.min(max, min + Math.round((bounded - min) / step) * step)).toFixed(precision));
    onChange(next); setDraft(next.toLocaleString("ko-KR", { maximumFractionDigits: 10 }));
    setError(next !== parsed ? `입력 범위와 간격에 맞춰 ${next.toLocaleString("ko-KR")}로 조정했습니다.` : "");
  };
  const choices = presets ?? (suffix === "원" && max <= 1500000 ? [100000, 300000, 500000, 1000000] : []);
  return <div className="mt-2 space-y-2">
    <div className="flex items-center gap-2">
      <input type="text" inputMode={step < 1 ? "decimal" : "numeric"} aria-label={label} aria-describedby={error ? id : undefined}
        value={draft}
        onChange={(e) => { setDraft(e.target.value.replaceAll(",", "")); setError(""); }}
        onBlur={commit} onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
        className="min-w-0 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base tabular-nums focus:outline-none focus:ring-2 focus:ring-slate-400" />
      {suffix && <span className="shrink-0 text-sm text-slate-600">{suffix}</span>}
    </div>
    {error && <p id={id} role="status" className="text-sm text-slate-600">{error}</p>}
    {choices.length > 0 && <div className="flex flex-wrap gap-2">{choices.filter(n => n >= min && n <= max).map(n => <button type="button" key={n} aria-pressed={value === n} onClick={() => { onChange(n); setDraft(n.toLocaleString("ko-KR")); setError(""); }} className={cn("rounded-lg border px-3 py-2 text-sm", value === n ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50")}>{n >= 10000 ? `${n / 10000}만` : n.toLocaleString()}원</button>)}</div>}
  </div>;
}
