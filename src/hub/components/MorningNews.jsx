import {
  Sparkles,
  RefreshCw,
  AlertCircle,
  MessageSquareText,
} from "lucide-react";
import { CARD } from "@shared/lib/surface";
import { cn } from "@shared/lib/format";

/* 오늘 아침 꼭 알아야 할 뉴스 — PB/VM 출근 브리핑.
   금융 리서치 노트 톤: 채도 높은 배너 대신 흰 마스트헤드 + 타이포 위계.
   각 항목은 사실 요약(summary)과 「상담 포인트」(pbNote)를 분리해서
   "무슨 일이 있었나"와 "오늘 창구에서 어떤 의미인가"를 한눈에 잇는다.
   필수(importance:high) 항목만 민트 좌측 강조로 시선을 먼저 붙든다. */

const fmtDate = (iso) => {
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d)) return iso;
  const day = ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()} (${day})`;
};

const NewsItem = ({ item }) => {
  const must = item.importance === "high";
  return (
    <li
      className={cn(
        "border-l-[3px] px-5 py-4",
        must ? "border-im-500 bg-im-50/25" : "border-transparent"
      )}
    >
      {/* 메타 라인 — 카테고리 주도, 필수는 우선 배지 */}
      <div className="flex flex-wrap items-center gap-2">
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
      <h3 className="mt-2 text-[15px] font-bold leading-snug tracking-tight text-slate-900">
        {item.headline}
      </h3>
      <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">
        {item.summary}
      </p>

      {/* 상담 포인트 — 이 뉴스가 오늘 창구에서 갖는 의미 */}
      <div className="mt-3 flex gap-2.5 rounded-lg bg-im-50/60 px-3.5 py-2.5 ring-1 ring-inset ring-im-100/70">
        <MessageSquareText className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-im-600" />
        <p className="text-[12.5px] leading-relaxed text-slate-700">
          <span className="mr-1.5 font-bold text-im-700">상담 포인트</span>
          {item.pbNote}
        </p>
      </div>
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
  const mustCount = data?.news?.filter((n) => n.importance === "high").length ?? 0;

  return (
    <section className={cn(CARD, "overflow-hidden")}>
      {/* 마스트헤드 — 흰 표면 + 민트 칩(다른 섹션과 같은 언어), 채도 배너 걷어냄 */}
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
                ? `${fmtDate(data.date)} · ${data.session} · 필수 ${mustCount}건`
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
            : data.news.map((item) => <NewsItem key={item.id} item={item} />)}
        </ul>
      )}

      <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-2.5 text-[10px] text-slate-500">
        공개된 발표·보도를 요약한 내부 참고 자료입니다. 상담 전 원문과 최신 시행 사항을 확인하세요.
        특정 종목·상품의 투자권유가 아닙니다.
      </div>
    </section>
  );
}
