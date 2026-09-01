import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Megaphone, AlertTriangle, Pin, Settings2, ArrowUpRight } from "lucide-react";
import { HubShell } from "./HubShell";
import { loadNotices } from "@shared/data/notices";
import { DEPARTMENTS, getModule, deptOfModule } from "@shared/data/departments";
import { cn } from "@shared/lib/format";

/* 공지사항 게시판 — 담당 부서가 올린 상품별 공지를 한 곳에서 본다(읽기 전용).
   부서·상품 필터로 좁히고, 부서가 '띄운(pinned)' 공지는 상단에 배지로 구분한다.
   작성·수정은 부서 관리자 화면(/admin)에서. */

const ACCENT_DOT = {
  amber: "bg-amber-500",
  fuchsia: "bg-fuchsia-500",
  violet: "bg-violet-500",
  emerald: "bg-emerald-500",
  rose: "bg-rose-500",
  im: "bg-im-500",
};

export default function NoticeBoardPage() {
  const [params, setParams] = useSearchParams();
  const [all] = useState(() => loadNotices());
  const deptFilter = params.get("dept") || "all";

  useEffect(() => {
    const prev = document.title;
    document.title = "공지사항 게시판 · iM 세일즈메이트";
    return () => {
      document.title = prev;
    };
  }, []);

  const setDept = (id) => {
    const next = new URLSearchParams(params);
    if (id === "all") next.delete("dept");
    else next.set("dept", id);
    setParams(next, { replace: true });
  };

  const list = useMemo(() => {
    if (deptFilter === "all") return all;
    const dept = DEPARTMENTS.find((d) => d.id === deptFilter);
    if (!dept) return all;
    return all.filter((n) => dept.modules.includes(n.moduleId));
  }, [all, deptFilter]);

  return (
    <HubShell>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
            <Megaphone className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-[17px] font-black leading-tight text-slate-900 md:text-xl">공지사항 게시판</h1>
            <p className="text-[11.5px] text-slate-500">담당 부서가 올린 상품별 공지</p>
          </div>
        </div>
        <Link
          to="/admin"
          className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11.5px] font-semibold text-slate-600 transition-colors hover:border-slate-400 hover:text-slate-900"
        >
          <Settings2 className="h-3.5 w-3.5" />
          부서 공지 관리
        </Link>
      </div>

      {/* 부서 필터 */}
      <div className="mb-4 flex flex-wrap gap-2">
        {[{ id: "all", name: "전체" }, ...DEPARTMENTS].map((d) => (
          <button
            key={d.id}
            onClick={() => setDept(d.id)}
            className={cn(
              "rounded-md border px-3 py-1.5 text-[12.5px] font-semibold transition-colors",
              d.id === deptFilter
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-300 bg-white text-slate-600 hover:border-slate-400"
            )}
          >
            {d.name}
          </button>
        ))}
        <span className="ml-auto self-center text-[11.5px] tabular-nums text-slate-400">{list.length}건</span>
      </div>

      {list.length === 0 ? (
        <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-12 text-center text-[13px] text-slate-400">
          등록된 공지가 없습니다.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
          {list.map((n) => {
            const mod = getModule(n.moduleId);
            const dept = deptOfModule(n.moduleId);
            return (
              <li key={n.id} className="px-4 py-3.5 sm:px-5">
                <div className="flex items-start gap-3">
                  <span className={cn("mt-1.5 h-2 w-2 flex-shrink-0 rounded-full", ACCENT_DOT[mod?.accent] ?? "bg-slate-300")} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      {n.pinned && (
                        <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
                          <Pin className="h-3 w-3" /> 띄움
                        </span>
                      )}
                      {n.level === "important" && (
                        <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                          <AlertTriangle className="h-3 w-3" /> 중요
                        </span>
                      )}
                      <span className="text-[13.5px] font-bold text-slate-900">{n.title}</span>
                    </div>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-slate-600">{n.body}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
                      <span className="font-semibold text-slate-500">{dept?.name ?? "담당 부서"}</span>
                      <span>·</span>
                      <span>{mod?.label ?? n.moduleId}</span>
                      <span>·</span>
                      <span className="tabular-nums">{n.date}</span>
                      {mod?.to && (
                        <Link to={mod.to} className="ml-1 inline-flex items-center gap-0.5 font-semibold text-im-600 hover:text-im-700">
                          상품 화면 <ArrowUpRight className="h-3 w-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </HubShell>
  );
}
