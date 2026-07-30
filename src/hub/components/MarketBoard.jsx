import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@shared/lib/format";

/* 마켓 보드 — 주요 지표를 한 줄로 훑는 얇은 대시보드 스트립.
   시황 해석은 뉴스 카드가 담당하고, 여기는 숫자만 담백하게 보여준다.
   등락 색은 국내 금융 관례(상승=빨강, 하락=파랑)를 따른다. */

const ChangeBadge = ({ change }) => {
  const flat = change === 0;
  const up = change > 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-[11px] font-semibold tabular-nums",
        flat ? "text-slate-400" : up ? "text-red-500" : "text-blue-600"
      )}
    >
      {flat ? (
        <Minus className="h-3 w-3" />
      ) : up ? (
        <TrendingUp className="h-3 w-3" />
      ) : (
        <TrendingDown className="h-3 w-3" />
      )}
      {up ? "+" : ""}
      {change.toFixed(2)}%
    </span>
  );
};

const SkeletonChip = () => (
  <div className="min-w-[7rem] flex-1 animate-pulse rounded-md bg-slate-100 py-5" />
);

const fmtAsOf = (d) => {
  if (!d) return null;
  const dt = d instanceof Date ? d : new Date(d);
  if (isNaN(dt)) return null;
  return `${dt.getMonth() + 1}. ${dt.getDate()}`;
};

export function MarketBoard({ markets, status, live, asOf }) {
  const asOfText = fmtAsOf(asOf);
  return (
    <section className="rounded-lg border border-slate-200 bg-white px-4 py-3">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          마켓 보드
        </span>
        <span className="text-[10px] text-slate-500">
          {live
            ? `${asOfText ? `${asOfText} ` : ""}종가 기준 · Yahoo Finance`
            : "예시 데이터 (시세 조회 실패)"}
        </span>
      </div>

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5">
        {status !== "ready"
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonChip key={i} />)
          : markets.map((m, i) => (
              <div
                key={m.label}
                className={cn(
                  "flex min-w-[7rem] flex-1 flex-col gap-0.5 rounded-md px-3 py-2",
                  i % 2 === 0 ? "bg-slate-50" : "bg-white",
                  "border border-slate-100"
                )}
              >
                <span className="whitespace-nowrap text-[10px] font-medium uppercase tracking-wide text-slate-500">
                  {m.label}
                </span>
                <span className="text-[14px] font-bold tabular-nums text-slate-900">
                  {m.value}
                </span>
                <ChangeBadge change={m.change} />
              </div>
            ))}
      </div>
    </section>
  );
}
