import { formatKRW } from "@shared/lib/format";
export function MobileResult({ amount, label, targetId }) {
  return <div className="sticky bottom-3 z-20 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-lg lg:hidden print:hidden">
    <div className="min-w-0"><p className="text-xs text-slate-600">{label}</p><p className="text-lg font-bold tabular-nums">{formatKRW(amount)}</p></div>
    <button type="button" onClick={() => document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" })} className="shrink-0 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white">결과 보기</button>
  </div>;
}
