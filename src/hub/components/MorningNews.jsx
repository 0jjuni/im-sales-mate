import { useState } from "react";
import {
  Sparkles,
  RefreshCw,
  AlertCircle,
  MessageSquareText,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  LineChart,
  CalendarClock,
  Search,
} from "lucide-react";
import { CARD } from "@shared/lib/surface";
import { cn } from "@shared/lib/format";
import { getEconomicCalendar } from "../data/economicCalendar";

/* 오늘 아침 꼭 알아야 할 뉴스 — PB/VM 출근 브리핑.
   금융 리서치 노트 톤: 채도 높은 배너 대신 흰 마스트헤드 + 타이포 위계.
   구성: ① 오늘의 시황 한 줄(마켓 데이터 → PB 관점 해석) ② 뉴스(사실+상담포인트+관련상품).
   최근 1달치를 기본 노출하고, 그보다 오래된 것은 「지난 뉴스」로 접는다. */

const RECENT_DAYS = 30;
/* 최근 뉴스도 길어지므로 기본은 미리보기 몇 건만 펼치고 나머지는 접는다.
   단, 「필수」로 표시된 건은 접힌 상태에서도 항상 노출한다(출근 브리핑 성격상 놓치면 안 됨). */
const RECENT_PREVIEW = 3;

const fmtDate = (iso) => {
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d)) return iso;
  const day = ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()} (${day})`;
};

const fmtShort = (iso) => {
  if (!iso) return null;
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d)) return iso;
  const day = ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
  return `${d.getMonth() + 1}.${d.getDate()} (${day})`;
};

const daysAgo = (iso) => {
  if (!iso) return 0;
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d)) return 0;
  return Math.floor((Date.now() - d.getTime()) / 86400000);
};

/* 뉴스 카테고리 → 관련 상품(창구 상담 연결용). 비면 태그 없음 */
const PRODUCTS_BY_CATEGORY = {
  금리: ["예금", "연금"],
  세제: ["ISA", "연금", "노란우산"],
  퇴직연금: ["연금·IRP"],
  "예금·수신": ["예금", "ISA"],
  "투자·펀드": ["ISA"],
  상속증여: ["연금", "노란우산"],
};

/* 마켓 데이터 → 오늘의 시황 한 줄 + PB 관점 메모.
   규칙 기반(추정) — 내부 참고용이며 투자권유가 아니다(하단 고지). */
const marketSummary = (markets) => {
  if (!Array.isArray(markets) || markets.length === 0) return null;
  const val = (label) => {
    const m = markets.find((x) => x.label === label);
    return m && typeof m.change === "number" ? m.change : null;
  };
  const kospi = val("KOSPI");
  const kosdaq = val("KOSDAQ");
  const sp = val("S&P 500");
  const nasdaq = val("나스닥");
  const fx = val("USD/KRW");
  const tnx = val("미국 10년물");

  const tone = (v) => (v == null ? null : v > 0.3 ? "강세" : v < -0.3 ? "약세" : "보합");
  const dom = kospi != null && kosdaq != null ? (kospi + kosdaq) / 2 : null;
  const us = sp != null && nasdaq != null ? (sp + nasdaq) / 2 : null;

  const parts = [];
  if (dom != null)
    parts.push(
      `국내 증시 ${tone(dom)}${kospi != null ? ` (코스피 ${kospi > 0 ? "+" : ""}${kospi.toFixed(2)}%)` : ""}`
    );
  if (us != null) parts.push(`미국 증시 ${tone(us)}`);
  if (fx != null && Math.abs(fx) > 0.3) parts.push(fx > 0 ? "원화 약세" : "원화 강세");
  if (tnx != null && Math.abs(tnx) > 0.5) parts.push(tnx > 0 ? "미 국채금리 상승" : "미 국채금리 하락");
  if (parts.length === 0) return null;

  const riskOff = (dom != null && dom < -0.3) || (us != null && us < -0.3);
  let note;
  if (riskOff && fx != null && fx > 0.3)
    note =
      "위험자산 약세·원화 약세 국면입니다. 안전자산 선호가 커질 수 있어 예금 만기 재예치·ISA 문의에 대비하세요.";
  else if (tnx != null && tnx > 0.5)
    note = "시장금리가 오르면 예금 금리 매력이 부각됩니다. 만기 도래 고객 재예치 상담에 활용하세요.";
  else if (riskOff)
    note =
      "증시 조정 국면입니다. 변동성에 민감한 고객에게는 예적금·ISA 등 안정형 대안을 함께 제시하세요.";
  else note = "지표 방향을 참고해 오늘 상담 톤을 잡으세요.";

  return { line: parts.join(" · "), note };
};

const NewsItem = ({ item }) => {
  const must = item.importance === "high";
  const dateText = fmtShort(item.date);
  const related = PRODUCTS_BY_CATEGORY[item.category] || [];
  return (
    <li
      className={cn(
        "border-l-[3px] px-5 py-4",
        must ? "border-im-500 bg-im-50/25" : "border-transparent"
      )}
    >
      {/* 메타 라인 — 필수·카테고리·출처(링크)·보도날짜 */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {must && (
          <span className="rounded-sm bg-im-500 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
            필수
          </span>
        )}
        <span className="rounded-sm border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
          {item.category}
        </span>
        {item.source &&
          (item.sourceUrl ? (
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="원문 보기 (새 창)"
              className="inline-flex items-center gap-0.5 text-[10px] text-slate-400 transition-colors hover:text-im-700 hover:underline"
            >
              {item.source}
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          ) : (
            <span className="text-[10px] text-slate-400">{item.source}</span>
          ))}
        {dateText && (
          <span className="text-[10px] tabular-nums text-slate-400">· {dateText} 보도</span>
        )}
      </div>

      {/* 헤드라인 + 요약 */}
      <h3 className="mt-2 text-[15px] font-bold leading-snug tracking-tight text-slate-900">
        {item.headline}
      </h3>
      <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">{item.summary}</p>

      {/* 상담 포인트 */}
      <div className="mt-3 flex gap-2.5 rounded-lg bg-im-50/60 px-3.5 py-2.5 ring-1 ring-inset ring-im-100/70">
        <MessageSquareText className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-im-600" />
        <p className="text-[12.5px] leading-relaxed text-slate-700">
          <span className="mr-1.5 font-bold text-im-700">상담 포인트</span>
          {item.pbNote}
        </p>
      </div>

      {/* 관련 상품 — 뉴스를 창구 상담으로 연결 */}
      {related.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-semibold text-slate-400">관련 상품</span>
          {related.map((p) => (
            <span
              key={p}
              className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600"
            >
              {p}
            </span>
          ))}
        </div>
      )}
    </li>
  );
};

const SkeletonItem = () => (
  <li className="border-l-[3px] border-transparent px-5 py-4">
    <div className="h-3 w-28 animate-pulse rounded bg-slate-100" />
    <div className="mt-2.5 h-4 w-3/4 animate-pulse rounded bg-slate-100" />
    <div className="mt-2 h-3 w-full animate-pulse rounded bg-slate-100" />
    <div className="mt-3 h-10 w-full animate-pulse rounded-lg bg-im-50" />
  </li>
);

export function MorningNews({ data, status, onReload, full = false }) {
  const [showOlder, setShowOlder] = useState(false);
  const [showAllRecent, setShowAllRecent] = useState(false);
  /* 전체(뉴스 탭) 모드 필터 — 누적되어도 기간·카테고리·검색으로 좁힌다 */
  const [cat, setCat] = useState("전체");
  const [period, setPeriod] = useState("전체");
  const [q, setQ] = useState("");

  const items = status === "ready" ? data?.news ?? [] : [];
  const recent = items.filter((n) => daysAgo(n.date) <= RECENT_DAYS);
  const older = items.filter((n) => daysAgo(n.date) > RECENT_DAYS);
  const mustCount = recent.filter((n) => n.importance === "high").length;

  const categories = ["전체", ...Array.from(new Set(items.map((n) => n.category)))];
  const q2 = q.trim().toLowerCase();
  const fullList = items
    .filter((n) => period === "전체" || (period === "recent" ? daysAgo(n.date) <= RECENT_DAYS : daysAgo(n.date) > RECENT_DAYS))
    .filter((n) => cat === "전체" || n.category === cat)
    .filter((n) => !q2 || [n.headline, n.summary, n.pbNote].some((t) => (t || "").toLowerCase().includes(q2)))
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  /* 접힌 상태 노출 규칙 — 정확히 RECENT_PREVIEW건만.
     「필수」를 먼저 채우고(놓치면 안 되니), 남는 자리만 최신순 일반 뉴스로 채운다.
     화면에는 원래 순서를 유지해 렌더한다. */
  const collapsedIds = new Set(
    [
      ...recent.filter((n) => n.importance === "high"),
      ...recent.filter((n) => n.importance !== "high"),
    ]
      .slice(0, RECENT_PREVIEW)
      .map((n) => n.id)
  );
  const collapsedRecent = recent.filter((n) => collapsedIds.has(n.id));
  const shownRecent = showAllRecent ? recent : collapsedRecent;
  const hiddenRecent = recent.length - collapsedRecent.length;
  const canCollapseRecent = hiddenRecent > 0;
  const market = status === "ready" ? marketSummary(data?.markets) : null;
  const calendar = getEconomicCalendar();

  return (
    <section className={cn(CARD, "overflow-hidden")}>
      {/* 마스트헤드 */}
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-im-50 text-im-600">
            <Sparkles className="h-[18px] w-[18px]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-[17px] font-bold tracking-tight text-slate-900">
                오늘 아침 꼭 알아야 할 뉴스
              </h2>
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                AI
              </span>
            </div>
            <p className="mt-0.5 text-[12px] text-slate-500">
              {status === "ready" && data
                ? full
                  ? `${fmtDate(data.date)} 기준 · 전체 ${items.length}건`
                  : `${fmtDate(data.date)} · 최근 1달 · 필수 ${mustCount}건`
                : "불러오는 중…"}
            </p>
          </div>
        </div>
        <button
          onClick={onReload}
          disabled={status === "loading"}
          className="flex flex-shrink-0 items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-800 disabled:opacity-50"
        >
          <RefreshCw className={cn("h-3 w-3", status === "loading" && "animate-spin")} />
          새로고침
        </button>
      </div>

      {/* 오늘의 시황 — 마켓 숫자를 PB 관점 한 줄로 */}
      {market && (
        <div className="border-b border-slate-100 bg-slate-50/60 px-5 py-3">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <LineChart className="h-3 w-3" />
            오늘의 시황
          </div>
          <p className="mt-1 text-[12.5px] font-semibold text-slate-800">{market.line}</p>
          <p className="mt-0.5 text-[12px] leading-relaxed text-slate-600">{market.note}</p>
        </div>
      )}

      {/* 다가오는 일정 — 주간 수동 관리 */}
      {calendar.length > 0 && (
        <div className="border-b border-slate-100 px-5 py-3">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <CalendarClock className="h-3 w-3" />
            다가오는 일정
          </div>
          <ul className="mt-1.5 space-y-1">
            {calendar.map((e, i) => (
              <li key={i} className="flex items-center gap-2 text-[12px]">
                <span className="w-[3.6rem] flex-shrink-0 tabular-nums font-semibold text-slate-500">
                  {fmtShort(e.date)}
                </span>
                <span
                  className={cn(
                    "flex-shrink-0 rounded-sm px-1.5 py-0.5 text-[9px] font-bold",
                    e.kind === "해외"
                      ? "bg-blue-50 text-blue-600"
                      : e.kind === "상품"
                      ? "bg-im-50 text-im-700"
                      : "bg-slate-100 text-slate-500"
                  )}
                >
                  {e.kind}
                </span>
                <span className="text-slate-700">{e.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 필터 (뉴스 탭 전용) — 기간·카테고리·검색으로 누적 뉴스를 좁힌다 */}
      {full && status !== "error" && (
        <div className="space-y-2 border-b border-slate-100 bg-white px-5 py-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="뉴스 검색 (헤드라인·요약·상담포인트)"
              className="w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-3 text-[13px] focus:border-im-500 focus:outline-none"
            />
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {[["전체", "전체"], ["recent", "최근 1달"], ["past", "지난"]].map(([k, l]) => (
              <button
                key={k}
                onClick={() => setPeriod(k)}
                className={cn("rounded-md px-2.5 py-1 text-[12px] font-semibold transition-colors", period === k ? "bg-slate-800 text-white" : "bg-white text-slate-600 ring-1 ring-inset ring-slate-200 hover:text-slate-900")}
              >
                {l}
              </button>
            ))}
            <span className="mx-1 h-4 w-px bg-slate-200" />
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={cn("rounded-full px-2.5 py-1 text-[11.5px] font-semibold transition-colors", cat === c ? "bg-im-600 text-white" : "bg-white text-slate-600 ring-1 ring-inset ring-slate-200 hover:text-slate-900")}
              >
                {c}
              </button>
            ))}
            <span className="ml-auto text-[11px] tabular-nums text-slate-400">{fullList.length}건</span>
          </div>
        </div>
      )}

      {/* 본문 */}
      {status === "error" ? (
        <div className="flex items-center gap-2 px-5 py-8 text-sm text-slate-600">
          <AlertCircle className="h-4 w-4 text-rose-500" />
          브리핑을 불러오지 못했습니다. 새로고침을 눌러 다시 시도해 주세요.
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {status === "loading" ? (
            Array.from({ length: 3 }).map((_, i) => <SkeletonItem key={i} />)
          ) : full ? (
            fullList.length ? (
              fullList.map((item) => <NewsItem key={item.id} item={item} />)
            ) : (
              <li className="px-5 py-10 text-center text-[12.5px] text-slate-400">조건에 맞는 뉴스가 없습니다.</li>
            )
          ) : (
            <>
              {shownRecent.map((item) => (
                <NewsItem key={item.id} item={item} />
              ))}

              {recent.length === 0 && (
                <li className="px-5 py-6 text-center text-[12.5px] text-slate-400">
                  {older.length > 0
                    ? "최근 1달 새 브리핑이 없습니다."
                    : "표시할 브리핑이 없습니다."}
                </li>
              )}

              {/* 최근 뉴스 접기/펼치기 — 필수 건은 이미 위에 노출되므로 여기선 나머지만 다룬다 */}
              {canCollapseRecent && (
                <li className="border-l-[3px] border-transparent">
                  <button
                    onClick={() => setShowAllRecent((v) => !v)}
                    className="flex w-full items-center justify-center gap-1.5 px-5 py-2.5 text-[12px] font-semibold text-slate-500 transition-colors hover:bg-slate-50 hover:text-im-700"
                  >
                    {showAllRecent ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                    {showAllRecent ? "간략히 접기" : `뉴스 ${hiddenRecent}건 더 보기`}
                  </button>
                </li>
              )}

              {older.length > 0 && (
                <li className="border-l-[3px] border-transparent">
                  <button
                    onClick={() => setShowOlder((v) => !v)}
                    className="flex w-full items-center justify-center gap-1.5 px-5 py-2.5 text-[12px] font-semibold text-slate-500 transition-colors hover:bg-slate-50 hover:text-im-700"
                  >
                    {showOlder ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                    {showOlder ? "지난 뉴스 접기" : `지난 뉴스 ${older.length}건 더 보기`}
                  </button>
                </li>
              )}
              {showOlder && older.map((item) => <NewsItem key={item.id} item={item} />)}
            </>
          )}
        </ul>
      )}

      <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-2.5 text-[10px] text-slate-500">
        공개된 발표·보도를 요약한 내부 참고 자료입니다. 상담 전 원문과 최신 시행 사항을 확인하세요.
        특정 종목·상품의 투자권유가 아닙니다.
      </div>
    </section>
  );
}
