import { useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Pin, Settings2 } from "lucide-react";
import { loadNotices } from "@shared/data/notices";
import { getModule, deptOfModule } from "@shared/data/departments";
import { cn } from "@shared/lib/format";

/* 홈 「부서 공지」 위젯 — 모든 담당 부서가 올린 상품별 공지를 한데 모아 보여준다.
   고정·중요 공지를 위로, 각 공지는 담당 부서·상품 태그와 함께 상품 화면으로 링크한다.
   우측 「관리」로 부서 관리자 화면(/admin)에 진입한다. */

const ACCENT_DOT = {
  amber: "bg-amber-500",
  fuchsia: "bg-fuchsia-500",
  violet: "bg-violet-500",
  emerald: "bg-emerald-500",
  rose: "bg-rose-500",
  im: "bg-im-500",
};

export function DeptNoticeBoard() {
  const [notices] = useState(() => loadNotices());
  const top = notices.slice(0, 5);

  return (
    <div>
      <div className="mb-3 flex items-center justify-end">
        <Link
          to="/admin"
          className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11.5px] font-semibold text-slate-600 transition-colors hover:border-slate-400 hover:text-slate-900"
        >
          <Settings2 className="h-3.5 w-3.5" />
          부서 공지 관리
        </Link>
      </div>

      {top.length === 0 ? (
        <p className="rounded-lg bg-slate-50 px-4 py-6 text-center text-[12.5px] text-slate-400">
          등록된 공지가 없습니다.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200">
          {top.map((n) => {
            const mod = getModule(n.moduleId);
            const dept = deptOfModule(n.moduleId);
            return (
              <li key={n.id}>
                <Link to={mod?.to ?? "/"} className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-slate-50">
                  <span className={cn("mt-1.5 h-2 w-2 flex-shrink-0 rounded-full", ACCENT_DOT[mod?.accent] ?? "bg-slate-300")} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      {n.level === "important" && (
                        <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                          <AlertTriangle className="h-3 w-3" /> 중요
                        </span>
                      )}
                      {n.pinned && <Pin className="h-3 w-3 text-slate-400" />}
                      <span className="truncate text-[13px] font-bold text-slate-900">{n.title}</span>
                    </div>
                    <p className="mt-0.5 truncate text-[12px] text-slate-500">{n.body}</p>
                    <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-400">
                      <span className="font-semibold text-slate-500">{dept?.name ?? "담당 부서"}</span>
                      <span>·</span>
                      <span>{mod?.label ?? n.moduleId}</span>
                      <span>·</span>
                      <span className="tabular-nums">{n.date}</span>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
