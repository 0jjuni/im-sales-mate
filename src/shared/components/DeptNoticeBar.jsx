import { Link } from "react-router-dom";
import { Megaphone, AlertTriangle, ArrowRight } from "lucide-react";
import { noticesForModule } from "@shared/data/notices";
import { deptOfModule } from "@shared/data/departments";
import { cn } from "@shared/lib/format";

/* 상품 모듈 상단의 「담당 부서 공지」 바.
   게시판이 기본이고, 여기에는 부서가 '띄우기(pinned)'로 정한 공지만 노출한다.
   담당 부서 공지가 하나도 없으면 렌더하지 않는다. 우측 링크로 공지 게시판에 진입한다. */
export function DeptNoticeBar({ moduleId }) {
  const all = noticesForModule(moduleId);
  const dept = deptOfModule(moduleId);
  if (all.length === 0) return null;

  const pinned = all.filter((n) => n.pinned);

  return (
    <div className="mb-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-2">
        <Megaphone className="h-3.5 w-3.5 text-slate-500" />
        <span className="text-[12px] font-bold text-slate-700">담당 부서 공지</span>
        {dept && <span className="text-[11px] text-slate-400">{dept.name}</span>}
        <Link
          to={`/notices?dept=${dept?.id ?? ""}`}
          className="ml-auto inline-flex items-center gap-1 text-[11.5px] font-semibold text-slate-500 hover:text-im-700"
        >
          공지 게시판 {all.length}건
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {pinned.length > 0 && (
        <ul className="divide-y divide-slate-100">
          {pinned.map((n) => (
            <li key={n.id} className="px-4 py-2.5">
              <div className="flex items-start gap-2">
                <AlertTriangle
                  className={cn(
                    "mt-0.5 h-3.5 w-3.5 flex-shrink-0",
                    n.level === "important" ? "text-amber-500" : "text-slate-300"
                  )}
                />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span className="text-[13px] font-bold text-slate-900">{n.title}</span>
                    <span className="text-[11px] tabular-nums text-slate-400">{n.date}</span>
                  </div>
                  <p className="mt-0.5 text-[12.5px] leading-relaxed text-slate-600">{n.body}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
