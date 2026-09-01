import { useState } from "react";
import { Megaphone, AlertTriangle, Pin, ChevronDown, ChevronUp } from "lucide-react";
import { noticesForModule } from "@shared/data/notices";
import { deptOfModule } from "@shared/data/departments";
import { cn } from "@shared/lib/format";

/* 상품 모듈 상단에 붙는 「담당 부서 공지」 바.
   해당 모듈의 공지를 담당 부서가 올린 것으로 표시한다. 공지가 없으면 아무것도 렌더하지 않는다.
   기본 1건 노출, 여러 건이면 펼쳐 보기. */
export function DeptNoticeBar({ moduleId }) {
  const [open, setOpen] = useState(false);
  const notices = noticesForModule(moduleId);
  const dept = deptOfModule(moduleId);

  if (notices.length === 0) return null;

  const shown = open ? notices : notices.slice(0, 1);
  const rest = notices.length - 1;

  return (
    <div className="mb-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-2">
        <Megaphone className="h-3.5 w-3.5 text-slate-500" />
        <span className="text-[12px] font-bold text-slate-700">담당 부서 공지</span>
        {dept && <span className="text-[11px] text-slate-400">{dept.name}</span>}
        <span className="ml-auto text-[11px] tabular-nums text-slate-400">{notices.length}건</span>
      </div>

      <ul className="divide-y divide-slate-100">
        {shown.map((n) => (
          <li key={n.id} className="px-4 py-2.5">
            <div className="flex items-start gap-2">
              {n.level === "important" ? (
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-500" />
              ) : n.pinned ? (
                <Pin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
              ) : (
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-300" />
              )}
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

      {rest > 0 && (
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-center gap-1.5 border-t border-slate-100 px-4 py-2 text-[12px] font-semibold text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800"
        >
          {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          {open ? "접기" : `공지 ${rest}건 더 보기`}
        </button>
      )}
    </div>
  );
}
