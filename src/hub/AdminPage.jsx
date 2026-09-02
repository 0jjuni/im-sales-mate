import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Megaphone, RotateCcw, HelpCircle, ChevronDown, Check } from "lucide-react";
import { HubShell } from "./HubShell";
import { DEPARTMENTS } from "@shared/data/departments";
import { resetNotices } from "@shared/data/notices";
import { resetFaqs } from "@shared/data/faqs";
import { NoticeManager } from "./components/NoticeManager";
import { FaqManager } from "./components/FaqManager";
import { cn } from "@shared/lib/format";

/* 부서 관리자 화면 — 담당 부서가 자기 상품의 공지·FAQ를 직접 관리한다.
   공지는 목록→글쓰기(전체 화면) 게시판 흐름(NoticeManager), FAQ는 FaqManager.
   데모라 인증 대신 「부서 전환」으로 담당 부서를 고른다(실배포 시 부서 SSO·권한으로 교체). */

const MODES = [
  { id: "notices", label: "공지사항", icon: Megaphone },
  { id: "faq", label: "FAQ", icon: HelpCircle },
];

export default function AdminPage() {
  const [params] = useSearchParams();
  const [deptId, setDeptId] = useState(DEPARTMENTS[0].id);
  const [mode, setMode] = useState(params.get("mode") === "faq" ? "faq" : "notices");
  const [switchOpen, setSwitchOpen] = useState(false);

  useEffect(() => {
    const prev = document.title;
    document.title = "부서 관리자 · iM 세일즈메이트";
    return () => {
      document.title = prev;
    };
  }, []);

  const dept = DEPARTMENTS.find((d) => d.id === deptId);

  const onReset = () => {
    if (mode === "faq") resetFaqs();
    else resetNotices();
    window.location.reload();
  };

  return (
    <HubShell>
      {/* 콘솔 헤더 — 담당자 계정으로 접속한 관리 화면 */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
            <Megaphone className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-[16px] font-black leading-tight text-slate-900 md:text-[17px]">공지·FAQ 관리자</h1>
            <p className="text-[11.5px] text-slate-500">담당 부서 계정으로 접속 중</p>
          </div>
        </div>

        {/* 접속 계정(부서) — 전환 가능 */}
        <div className="relative">
          <button
            onClick={() => setSwitchOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-1.5 pr-2.5 transition-colors hover:border-slate-300"
          >
            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-im-600 text-[12px] font-bold text-white">
              {dept?.manager?.[0] ?? "담"}
            </span>
            <span className="text-left leading-tight">
              <span className="block text-[12.5px] font-bold text-slate-900">{dept?.manager ?? "담당자"}</span>
              <span className="block text-[11px] text-slate-500">{dept?.name}</span>
            </span>
            <ChevronDown className={cn("h-3.5 w-3.5 text-slate-400 transition-transform", switchOpen && "rotate-180")} />
          </button>

          {switchOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setSwitchOpen(false)} />
              <div className="absolute right-0 top-full z-40 mt-1.5 w-60 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
                <div className="border-b border-slate-100 px-3 py-2 text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
                  관리 부서 전환
                </div>
                {DEPARTMENTS.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => {
                      setDeptId(d.id);
                      setSwitchOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-slate-50",
                      d.id === deptId && "bg-im-50/60"
                    )}
                  >
                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-slate-200 text-[12px] font-bold text-slate-600">
                      {d.manager[0]}
                    </span>
                    <span className="min-w-0 flex-1 leading-tight">
                      <span className="block truncate text-[12.5px] font-semibold text-slate-900">{d.name}</span>
                      <span className="block text-[11px] text-slate-500">{d.manager}</span>
                    </span>
                    {d.id === deptId && <Check className="h-4 w-4 flex-shrink-0 text-im-600" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 공지사항 / FAQ 모드 */}
      <div className="mb-5 flex gap-1 border-b border-slate-200">
        {MODES.map((m) => {
          const Icon = m.icon;
          const on = mode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={cn(
                "-mb-px inline-flex items-center gap-1.5 border-b-2 px-3 py-2 text-[13px] font-semibold transition-colors",
                on ? "border-slate-900 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-800"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {m.label}
            </button>
          );
        })}
      </div>

      {mode === "faq" ? <FaqManager dept={dept} /> : <NoticeManager dept={dept} />}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-3 text-[11px] text-slate-400">
        <span>변경 사항은 저장 즉시 각 상품 화면에 반영됩니다.</span>
        <button onClick={onReset} className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-600">
          <RotateCcw className="h-3 w-3" />
          {mode === "faq" ? "FAQ" : "공지"} 기본값으로 초기화
        </button>
      </div>
    </HubShell>
  );
}
