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
} from "lucide-react";
import { CARD } from "@shared/lib/surface";
import { cn } from "@shared/lib/format";

/* 오늘 아침 꼭 알아야 할 뉴스 — PB/VM 출근 브리핑.
   금융 리서치 노트 톤: 채도 높은 배너 대신 흰 마스트헤드 + 타이포 위계.
   구성: ① 오늘의 시황 한 줄(마켓 데이터 → PB 관점 해석) ② 뉴스(사실+상담포인트+관련상품).
   최근 7일치를 기본 노출하고, 그보다 오래된 것은 「지난 뉴스」로 접는다. */

const WEEK = 7;

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

export function MorningNews({ data, status, onReload }) {
  const [showOlder, setShowOlder] = useState(false);

  const items = status === "ready" ? data?.news ?? [] : [];
  const recent = items.filter((n) => daysAgo(n.date) <= WEEK);
  const older = items.filter((n) => daysAgo(n.date) > WEEK);
  const mustCount = recent.filter((n) => n.importance === "high").length;
  const market = status === "ready" ? marketSummary(data?.markets) : null;

  return (
    <section className={cn(CARD, "overflow-hidden")}>
      {/* 마스트헤드 */}
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-im-500 to-im-600 text-white shadow-sm shadow-im-600/25 ring-1 ring-inset ring-white/20">
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
                ? `${fmtDate(data.date)} · 최근 7일 · 필수 ${mustCount}건`
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
          ) : (
            <>
              {recent.map((item) => (
                <NewsItem key={item.id} item={item} />
              ))}

              {recent.length === 0 && (
                <li className="px-5 py-6 text-center text-[12.5px] text-slate-400">
                  {older.length > 0
                    ? "최근 7일 새 브리핑이 없습니다."
                    : "표시할 브리핑이 없습니다."}
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
