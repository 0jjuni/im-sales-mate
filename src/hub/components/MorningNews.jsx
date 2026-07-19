import {
  Sparkles,
  RefreshCw,
  AlertCircle,
  MessageSquareText,
} from "lucide-react";
import { cn } from "@shared/lib/format";

/* 오늘 아침 꼭 알아야 할 뉴스 — PB/VM 출근 브리핑.
   각 항목은 사실 요약(summary)과 「상담 포인트」(pbNote)를 분리해서
   "무슨 일이 있었나"와 "오늘 창구에서 어떤 의미인가"를 한눈에 잇는다. */

const fmtDate = (iso) => {
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d)) return iso;
  const day = ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()} (${day})`;
};

const NewsItem = ({ item, index }) => {
  const must = item.importance === "high";
  return (
    <li className="group relative flex gap-3.5 px-4 py-4 md:px-5">
      {/* 순번 — 필수는 민트 채움, 나머지는 아웃라인 */}
      <div
        className={cn(
          "mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[12px] font-bold tabular-nums",
          must
            ? "bg-im-500 text-white shadow-sm"
            : "border border-slate-300 bg-white text-slate-500"
        )}
      >
        {index + 1}
      </div>

      <div className="min-w-0 flex-1">
        {/* 메타 라인 */}
        <div className="flex flex-wrap items-center gap-1.5">
          {must && (
            <span className="rounded-sm bg-im-500 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
              필수
            </span>
          )}
          <span className="rounded-sm border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
            {item.category}
          </span>
          <span className="text-[10px] text-slate-400">{item.source}</span>
        </div>

        {/* 헤드라인 + 요약 */}
        <h3 className="mt-1.5 text-[14px] font-bold leading-snug text-slate-900">
          {item.headline}
        </h3>
        <p className="mt-1 text-[12.5px] leading-relaxed text-slate-600">
          {item.summary}
        </p>

        {/* 상담 포인트 — 이 뉴스가 오늘 창구에서 갖는 의미 */}
        <div className="mt-2.5 flex gap-2 rounded-md border-l-2 border-im-400 bg-im-50/70 px-3 py-2">
          <MessageSquareText className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-im-600" />
          <p className="text-[12px] leading-relaxed text-im-800">
            <span className="mr-1 font-bold text-im-700">상담 포인트</span>
            {item.pbNote}
          </p>
        </div>
      </div>
    </li>
  );
};

const SkeletonItem = () => (
  <li className="flex gap-3.5 px-4 py-4 md:px-5">
    <div className="h-6 w-6 flex-shrink-0 animate-pulse rounded-full bg-slate-100" />
    <div className="flex-1 space-y-2">
      <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
      <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
      <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
      <div className="h-8 w-full animate-pulse rounded bg-im-50" />
    </div>
  </li>
);

export function MorningNews({ data, status, onReload }) {
  const mustCount = data?.news?.filter((n) => n.importance === "high").length ?? 0;

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* 헤더 밴드 — 민트 아이덴티티 */}
      <div className="bg-gradient-to-r from-im-700 to-im-500 px-4 py-3.5 md:px-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white/15">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[14px] font-bold tracking-tight text-white">
                  오늘 아침 꼭 알아야 할 뉴스
                </h2>
                <span className="rounded-sm bg-white/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-im-50">
                  AI Briefing
                </span>
              </div>
              <p className="mt-0.5 text-[11px] text-im-100">
                {status === "ready" && data
                  ? `${fmtDate(data.date)} · ${data.session} · 필수 ${mustCount}건`
                  : "불러오는 중…"}
              </p>
            </div>
          </div>
          <button
            onClick={onReload}
            disabled={status === "loading"}
            className="flex items-center gap-1 rounded-md border border-white/20 bg-white/10 px-2 py-1 text-[11px] font-medium text-white transition-colors hover:bg-white/20 disabled:opacity-50"
          >
            <RefreshCw className={cn("h-3 w-3", status === "loading" && "animate-spin")} />
            새로고침
          </button>
        </div>
      </div>

      {/* 본문 */}
      {status === "error" ? (
        <div className="flex items-center gap-2 px-5 py-8 text-sm text-slate-600">
          <AlertCircle className="h-4 w-4 text-rose-500" />
          브리핑을 불러오지 못했습니다. 새로고침을 눌러 다시 시도해 주세요.
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {status === "loading"
            ? Array.from({ length: 3 }).map((_, i) => <SkeletonItem key={i} />)
            : data.news.map((item, i) => (
                <NewsItem key={item.id} item={item} index={i} />
              ))}
        </ul>
      )}

      <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-2.5 text-[10px] text-slate-400">
        더미 데이터 (구글시트 연동 예정) · 내부 참고용이며 특정 종목·상품의 투자권유가 아닙니다.
      </div>
    </section>
  );
}
