import { useEffect, useMemo, useState } from "react";
import { Newspaper, RefreshCw, Search, LineChart, CalendarClock, AlertCircle, X } from "lucide-react";
import { HubShell } from "./HubShell";
import { useMorningBriefing } from "./hooks/useMorningBriefing";
import { NewsItem, marketSummary, fmtDate, fmtShort, daysAgo } from "./components/MorningNews";
import { getEconomicCalendar } from "./data/economicCalendar";
import { CARD } from "@shared/lib/surface";
import { cn } from "@shared/lib/format";

/* 뉴스 탭 — 홈 위젯을 그대로 옮기지 않고, 읽기 좋은 전용 레이아웃으로 구성한다.
   좌측: 필터 + 뉴스 카드 리스트 / 우측(고정): 오늘의 시황 · 다가오는 일정. */

const PERIODS = [
  ["전체", "전체"],
  ["w7", "최근 7일"],
  ["m30", "최근 1달"],
  ["past", "지난"],
];

const SkeletonCard = () => (
  <li className={cn(CARD, "px-5 py-4")}>
    <div className="h-3 w-28 animate-pulse rounded bg-slate-100" />
    <div className="mt-2.5 h-4 w-3/4 animate-pulse rounded bg-slate-100" />
    <div className="mt-2 h-3 w-full animate-pulse rounded bg-slate-100" />
    <div className="mt-3 h-10 w-full animate-pulse rounded-lg bg-im-50" />
  </li>
);

export default function NewsPage() {
  const { data, status, reload } = useMorningBriefing();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("전체");
  const [period, setPeriod] = useState("전체");

  useEffect(() => {
    const prev = document.title;
    document.title = "뉴스 · iM 세일즈메이트";
    return () => {
      document.title = prev;
    };
  }, []);

  const items = status === "ready" ? data?.news ?? [] : [];
  const market = status === "ready" ? marketSummary(data?.markets) : null;
  const calendar = getEconomicCalendar();
  const categories = ["전체", ...Array.from(new Set(items.map((n) => n.category)))];

  const q2 = q.trim().toLowerCase();
  const list = useMemo(() => {
    const inPeriod = (n) => {
      if (period === "전체") return true;
      const d = daysAgo(n.date);
      if (period === "w7") return d <= 7;
      if (period === "m30") return d <= 30;
      return d > 30;
    };
    return items
      .filter(inPeriod)
      .filter((n) => cat === "전체" || n.category === cat)
      .filter((n) => !q2 || [n.headline, n.summary, n.pbNote].some((t) => (t || "").toLowerCase().includes(q2)))
      .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  }, [items, period, cat, q2]);

  return (
    <HubShell wide>
      {/* 페이지 헤더 */}
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-im-600" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">뉴스</h1>
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-500">AI</span>
          </div>
          <p className="mt-1 text-[13px] text-slate-500">
            {status === "ready" && data
              ? `${fmtDate(data.date)} 기준 · 전체 ${items.length}건 · 창구에 영향을 줄 뉴스·시황`
              : "매일 아침 창구에 영향을 줄 뉴스·시황을 정리합니다."}
          </p>
        </div>
        <button
          onClick={reload}
          disabled={status === "loading"}
          className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-800 disabled:opacity-50"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", status === "loading" && "animate-spin")} />
          새로고침
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        {/* 좌측: 필터 + 뉴스 리스트 */}
        <div className="min-w-0">
          {/* 필터 */}
          <div className={cn(CARD, "mb-4 space-y-2.5 p-3.5")}>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="뉴스 검색 (헤드라인·요약·상담 포인트)"
                className="w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-9 text-[13px] focus:border-im-500 focus:outline-none"
              />
              {q && (
                <button onClick={() => setQ("")} aria-label="지우기" className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {PERIODS.map(([k, l]) => (
                <button
                  key={k}
                  onClick={() => setPeriod(k)}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-[12px] font-semibold transition-colors",
                    period === k ? "bg-slate-800 text-white" : "bg-white text-slate-600 ring-1 ring-inset ring-slate-200 hover:text-slate-900"
                  )}
                >
                  {l}
                </button>
              ))}
              <span className="mx-1 h-4 w-px bg-slate-200" />
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[11.5px] font-semibold transition-colors",
                    cat === c ? "bg-im-600 text-white" : "bg-white text-slate-600 ring-1 ring-inset ring-slate-200 hover:text-slate-900"
                  )}
                >
                  {c}
                </button>
              ))}
              <span className="ml-auto text-[11px] tabular-nums text-slate-400">{list.length}건</span>
            </div>
          </div>

          {/* 리스트 */}
          {status === "error" ? (
            <div className={cn(CARD, "flex items-center gap-2 px-5 py-8 text-sm text-slate-600")}>
              <AlertCircle className="h-4 w-4 text-rose-500" />
              브리핑을 불러오지 못했습니다. 새로고침을 눌러 다시 시도해 주세요.
            </div>
          ) : status === "loading" ? (
            <ul className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </ul>
          ) : list.length === 0 ? (
            <div className={cn(CARD, "px-5 py-14 text-center text-[13px] text-slate-400")}>조건에 맞는 뉴스가 없습니다.</div>
          ) : (
            <ul className="space-y-3">
              {list.map((item) => (
                <NewsItem key={item.id} item={item} card />
              ))}
            </ul>
          )}
        </div>

        {/* 우측: 오늘의 시황 · 다가오는 일정 (고정) */}
        <aside className="space-y-4 self-start lg:sticky lg:top-20">
          <div className={cn(CARD, "overflow-hidden")}>
            <div className="flex items-center gap-1.5 border-b border-slate-100 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <LineChart className="h-3.5 w-3.5" /> 오늘의 시황
            </div>
            {market ? (
              <div className="px-4 py-3">
                <p className="text-[12.5px] font-semibold text-slate-800">{market.line}</p>
                <p className="mt-1 text-[12px] leading-relaxed text-slate-600">{market.note}</p>
              </div>
            ) : (
              <p className="px-4 py-4 text-[12px] text-slate-400">{status === "loading" ? "불러오는 중…" : "표시할 시황이 없습니다."}</p>
            )}
          </div>

          {calendar.length > 0 && (
            <div className={cn(CARD, "overflow-hidden")}>
              <div className="flex items-center gap-1.5 border-b border-slate-100 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <CalendarClock className="h-3.5 w-3.5" /> 다가오는 일정
              </div>
              <ul className="divide-y divide-slate-100">
                {calendar.map((e, i) => (
                  <li key={i} className="flex items-center gap-2 px-4 py-2 text-[12px]">
                    <span className="w-[3.4rem] flex-shrink-0 tabular-nums font-semibold text-slate-500">{fmtShort(e.date)}</span>
                    <span
                      className={cn(
                        "flex-shrink-0 rounded-sm px-1.5 py-0.5 text-[9px] font-bold",
                        e.kind === "해외" ? "bg-blue-50 text-blue-600" : e.kind === "상품" ? "bg-im-50 text-im-700" : "bg-slate-100 text-slate-500"
                      )}
                    >
                      {e.kind}
                    </span>
                    <span className="min-w-0 truncate text-slate-700">{e.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="px-1 text-[10.5px] leading-relaxed text-slate-400">
            공개된 발표·보도를 요약한 내부 참고 자료입니다. 상담 전 원문과 최신 시행 사항을 확인하세요. 특정 종목·상품의 투자권유가 아닙니다.
          </p>
        </aside>
      </div>
    </HubShell>
  );
}
