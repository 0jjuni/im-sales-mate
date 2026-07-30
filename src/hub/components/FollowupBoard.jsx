import { Link } from "react-router-dom";
import { ArrowRight, ShieldAlert, CalendarDays } from "lucide-react";
import { useFollowups } from "../followups/useFollowups";
import { FollowupRow, FollowupForm, PrivacyNotice } from "../followups/parts";
import { cn } from "@shared/lib/format";

/* 허브의 고객 후속 관리 위젯 — 요약만 보여 준다.
   달력·검색·완료 이력 같은 관리 기능은 전체 화면(/followups)에서 한다.
   여기서는 ① 오늘 챙길 게 몇 건인지 ② 임박한 건 몇 개 ③ 빠른 기록만 남긴다. */

const PREVIEW_COUNT = 4;

export function FollowupBoard() {
  const { openItems, summary, add, update, remove, toggleDone } = useFollowups();

  /* 지남·오늘·임박 순으로 이미 정렬돼 오는 목록의 앞부분만 */
  const preview = openItems.slice(0, PREVIEW_COUNT);
  const rest = openItems.length - preview.length;

  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      {/* 요약 */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-3 py-2.5">
        {summary.overdue > 0 && (
          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-700">
            지남 {summary.overdue}
          </span>
        )}
        {summary.today > 0 && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">
            오늘 {summary.today}
          </span>
        )}
        {summary.soon > 0 && (
          <span className="rounded-full bg-im-100 px-2 py-0.5 text-[11px] font-bold text-im-700">
            7일 내 {summary.soon}
          </span>
        )}
        {summary.overdue === 0 && summary.today === 0 && summary.soon === 0 && (
          <span className="text-[12px] text-slate-500">가까운 후속 연락이 없습니다</span>
        )}
        {/* 달력·검색이 여기 없으므로 전체 화면으로 가는 길이 분명해야 한다 */}
        <Link
          to="/followups"
          className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-im-600 px-3 py-1.5 text-[12px] font-bold text-white transition-colors hover:bg-im-700"
        >
          <CalendarDays className="h-3.5 w-3.5" />
          달력으로 전체 관리
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* 임박한 건 미리보기 */}
      {preview.length === 0 ? (
        <p className="px-3 py-5 text-center text-[12.5px] text-slate-400">
          예정된 후속 연락이 없습니다. 상담 중 나온 약속을 아래에 기록해 두세요.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100 py-1">
          {preview.map((item) => (
            <FollowupRow
              key={item.id}
              item={item}
              compact
              onToggle={toggleDone}
              onUpdate={update}
              onRemove={remove}
            />
          ))}
        </ul>
      )}

      {rest > 0 && (
        <Link
          to="/followups"
          className="block border-t border-slate-100 px-3 py-2 text-center text-[12px] font-semibold text-slate-500 transition-colors hover:bg-slate-50 hover:text-im-700"
        >
          예정 {rest}건 더 보기
        </Link>
      )}

      {/* 빠른 기록 */}
      <div className="border-t border-slate-100 bg-slate-50/50 p-3">
        <FollowupForm onAdd={add} />
      </div>

      <div className="flex items-start gap-1.5 border-t border-slate-100 bg-amber-50/40 px-3 py-2">
        <ShieldAlert className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-600" />
        <PrivacyNotice />
      </div>
    </div>
  );
}
