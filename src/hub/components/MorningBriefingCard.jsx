import { useEffect, useState } from "react";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { fetchMorningBriefing } from "../data/morningBriefing";
import { cn } from "@shared/lib/format";

const fmtDate = (iso) => {
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d)) return iso;
  const day = ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()} (${day})`;
};

const MarketChip = ({ label, value, change }) => {
  const up = change >= 0;
  return (
    <div className="flex flex-col gap-0.5 rounded-md border border-white/10 bg-white/5 px-3 py-2">
      <span className="text-[10px] font-medium uppercase tracking-wide text-im-100/70">
        {label}
      </span>
      <span className="text-[13px] font-bold text-white tabular-nums">{value}</span>
      <span
        className={cn(
          "inline-flex items-center gap-0.5 text-[11px] font-semibold tabular-nums",
          up ? "text-emerald-300" : "text-rose-300"
        )}
      >
        {up ? (
          <TrendingUp className="h-3 w-3" />
        ) : (
          <TrendingDown className="h-3 w-3" />
        )}
        {up ? "+" : ""}
        {change.toFixed(2)}%
      </span>
    </div>
  );
};

const SkeletonBar = ({ className }) => (
  <div className={cn("animate-pulse rounded bg-white/10", className)} />
);

export function MorningBriefingCard() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let alive = true;
    setStatus("loading");
    fetchMorningBriefing()
      .then((d) => {
        if (!alive) return;
        setData(d);
        setStatus("ready");
      })
      .catch(() => {
        if (!alive) return;
        setStatus("error");
      });
    return () => {
      alive = false;
    };
  }, [nonce]);

  return (
    <section className="relative overflow-hidden rounded-xl bg-gradient-to-br from-im-700 via-im-600 to-im-500 p-5 text-white shadow-sm md:p-6">
      {/* 헤더 */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white/15">
            <Sparkles className="h-4 w-4 text-im-100" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold tracking-tight">AI 모닝 시황 브리핑</h2>
              <span className="rounded-sm bg-white/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-im-50">
                Beta
              </span>
            </div>
            <p className="mt-0.5 text-[11px] text-im-100/80">
              {status === "ready" && data
                ? `${fmtDate(data.date)} · ${data.session}`
                : "불러오는 중…"}
            </p>
          </div>
        </div>
        <button
          onClick={() => setNonce((n) => n + 1)}
          disabled={status === "loading"}
          className="flex items-center gap-1 rounded-md border border-white/15 bg-white/5 px-2 py-1 text-[11px] font-medium text-im-50 transition-colors hover:bg-white/10 disabled:opacity-50"
        >
          <RefreshCw
            className={cn("h-3 w-3", status === "loading" && "animate-spin")}
          />
          새로고침
        </button>
      </div>

      {status === "loading" && (
        <div className="space-y-3">
          <SkeletonBar className="h-5 w-3/4" />
          <SkeletonBar className="h-3 w-full" />
          <SkeletonBar className="h-3 w-5/6" />
          <div className="grid grid-cols-3 gap-2 pt-1 sm:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonBar key={i} className="h-14" />
            ))}
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-4 py-6 text-sm text-im-50">
          <AlertCircle className="h-4 w-4 text-rose-300" />
          시황 데이터를 불러오지 못했습니다. 새로고침을 눌러 다시 시도해 주세요.
        </div>
      )}

      {status === "ready" && data && (
        <>
          <h3 className="text-base font-bold leading-snug md:text-lg">
            {data.headline}
          </h3>
          <p className="mt-1.5 text-[13px] leading-relaxed text-im-50/90">
            {data.summary}
          </p>

          {/* 시장 지표 */}
          <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {data.markets.map((m) => (
              <MarketChip key={m.label} {...m} />
            ))}
          </div>

          {/* 상담 화두 */}
          <div className="mt-4 rounded-lg bg-white/5 p-3.5">
            <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-im-100/80">
              오늘의 상담 화두
            </div>
            <ul className="space-y-1.5">
              {data.talkingPoints.map((t, i) => (
                <li key={i} className="flex gap-2 text-[13px] leading-relaxed text-im-50">
                  <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-im-lime" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-3 text-[10px] text-im-100/60">
            {data.source} · 내부 참고용이며 특정 종목·상품의 투자권유가 아닙니다.
          </p>
        </>
      )}
    </section>
  );
}
