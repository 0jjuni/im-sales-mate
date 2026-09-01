import { Link } from "react-router-dom";
import { AlertTriangle, Pin, Settings2 } from "lucide-react";
import { noticesForModule } from "@shared/data/notices";
import { deptOfModule } from "@shared/data/departments";
import { cn } from "@shared/lib/format";

/* 상품 모듈 내부 「공지사항」 탭 — 담당 부서가 올린 그 상품의 공지 게시판.
   상단 고정 공지가 위로 정렬된다(noticesForModule에서 처리). 작성·수정은 부서 관리자(/admin). */
export function ModuleNoticeBoard({ moduleId }) {
  const notices = noticesForModule(moduleId);
  const dept = deptOfModule(moduleId);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-[15px] font-bold text-slate-900">공지사항</h2>
          <p className="mt-0.5 text-[12px] text-slate-500">
            {dept ? `${dept.name} 담당 공지` : "담당 부서 공지"}
          </p>
        </div>
        <Link
          to="/admin"
          className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11.5px] font-semibold text-slate-600 transition-colors hover:border-slate-400 hover:text-slate-900"
        >
          <Settings2 className="h-3.5 w-3.5" />
          공지 관리
        </Link>
      </div>

      {notices.length === 0 ? (
        <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-12 text-center text-[13px] text-slate-400">
          등록된 공지가 없습니다.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
          {notices.map((n) => (
            <li key={n.id} className="px-4 py-3.5 sm:px-5">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                {n.pinned && (
                  <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
                    <Pin className="h-3 w-3" /> 고정
                  </span>
                )}
                {n.level === "important" && (
                  <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                    <AlertTriangle className="h-3 w-3" /> 중요
                  </span>
                )}
                <span className="text-[13.5px] font-bold text-slate-900">{n.title}</span>
                <span className="ml-auto text-[11px] tabular-nums text-slate-400">{n.date}</span>
              </div>
              <p className="mt-1 text-[12.5px] leading-relaxed text-slate-600">{n.body}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
