import { useState } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { CARD } from "@shared/lib/surface";
import { cn } from "@shared/lib/format";
import { Sparkline } from "./MarketChart";
import { MarketDetailModal } from "./MarketDetailModal";

/* 마켓 보드 — 주요 지표를 한 줄로 훑는 얇은 대시보드 스트립.
   시황 해석은 뉴스 카드가 담당하고, 여기는 숫자만 담백하게 보여준다.
   구분선으로 나뉜 셀 구조 — 줄무늬 없이, 지표 수만큼만.
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

const SkeletonCell = () => (
  <div className="min-w-[7.5rem] flex-1 px-4 py-3">
    <div className="h-2.5 w-12 animate-pulse rounded bg-slate-100" />
    <div className="mt-2 h-4 w-20 animate-pulse rounded bg-slate-100" />
    <div className="mt-1.5 h-2.5 w-14 animate-pulse rounded bg-slate-100" />
  </div>
);

const fmtAsOf = (d) => {
  if (!d) return null;
  const dt = d instanceof Date ? d : new Date(d);
  if (isNaN(dt)) return null;
  return `${dt.getMonth() + 1}. ${dt.getDate()}`;
};

export function MarketBoard({ markets, status, live, asOf, stale }) {
  const asOfText = fmtAsOf(asOf);
  const [selected, setSelected] = useState(null);
  /* 클릭 상세·인쇄는 실시간 시리즈가 있을 때만 의미가 있다(목업엔 series 없음) */
  const interactive = live;

  return (
    <section className={cn(CARD, "overflow-hidden")}>
      <div className="flex items-baseline justify-between gap-2 border-b border-slate-100 px-4 py-2.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          마켓 보드
        </span>
        <span className="text-[10px] text-slate-400">
          {live
            ? `${asOfText ? `${asOfText} ` : ""}종가 기준 · Yahoo Finance${stale ? " · 직전 시세(재조회 중)" : " · 클릭 시 추이·인쇄"}`
            : "예시 데이터 (시세 조회 실패)"}
        </span>
      </div>

      <div className="flex divide-x divide-slate-100 overflow-x-auto">
        {status !== "ready"
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCell key={i} />)
          : markets.map((m) => {
              const cellBody = (
                <>
                  <span className="whitespace-nowrap text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    {m.label}
                  </span>
                  <div className="mt-1 text-[16px] font-bold leading-none tabular-nums text-slate-900">
                    {m.value}
                  </div>
                  <div className="mt-1.5 flex items-center justify-between gap-2">
                    <ChangeBadge change={m.change} />
                    <Sparkline series={m.series} width={52} height={22} />
                  </div>
                </>
              );

              return interactive ? (
                <button
                  key={m.label}
                  type="button"
                  onClick={() => setSelected(m)}
                  title={`${m.label} 추이 보기 · 상담자료 인쇄`}
                  className="group min-w-[8rem] flex-1 px-4 py-3 text-left transition-colors hover:bg-slate-50"
                >
                  {cellBody}
                </button>
              ) : (
                <div key={m.label} className="min-w-[7.5rem] flex-1 px-4 py-3">
                  {cellBody}
                </div>
              );
            })}
      </div>

      {selected && (
        <MarketDetailModal market={selected} asOf={asOf} onClose={() => setSelected(null)} />
      )}
    </section>
  );
}
