import { Link } from "react-router-dom";
import { queryGrossTax } from "@hub/data/grossTax";

/* 상담 중 고객 컨텍스트 + 고객 진단 복귀 — 화면 오른쪽 위에 고정(스크롤 따라다님).
   ?no= 로 진입한 상담 모듈(ISA·연금·노란·카드·투자상품)에서 공통 사용. 유효 고객번호가 없으면 렌더 안 함.
   "상담 중" 상태 배지 + 고객 아바타/이름 + '진단으로 돌아가기' 액션을 분명히 드러내는 다크 카드. */
export function ConsultReturnButton({ no, income }) {
  const customer = /^\d{9}$/.test(no || "") ? queryGrossTax(no) : null;
  if (!customer) return null;
  const initial = customer.name?.[0] || "고";
  return (
    <Link
      to={`/tax?no=${no}`}
      title={`${customer.name}${income ? ` · ${income}` : ""} · 고객 진단으로 돌아가기`}
      className="group fixed right-4 top-[68px] z-40 flex items-center gap-2.5 rounded-2xl bg-slate-900 py-2 pl-2 pr-3 text-white shadow-xl ring-1 ring-white/10 transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-2xl print:hidden sm:top-[76px]"
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/15 text-sm font-extrabold">
        {initial}
      </span>
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="flex items-center gap-1 text-[10.5px] font-semibold tracking-wide text-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_0_3px_rgba(52,211,153,0.25)]" />
          상담 중
        </span>
        <span className="truncate text-sm font-bold">
          {customer.name}
          {income ? <span className="ml-1 text-[11px] font-normal text-slate-300">· {income}</span> : null}
        </span>
      </span>
      <span className="ml-1 flex shrink-0 items-center gap-0.5 self-stretch border-l border-white/15 pl-2.5 text-[11px] font-semibold text-slate-300 transition group-hover:text-white">
        진단으로
        <span aria-hidden className="text-base leading-none transition-transform group-hover:-translate-x-0.5">
          ↩
        </span>
      </span>
    </Link>
  );
}
