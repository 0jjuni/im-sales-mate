import { Link } from "react-router-dom";
import { queryGrossTax } from "@hub/data/grossTax";

/* 상담 중 고객 컨텍스트 + 고객 진단 복귀 — 화면 오른쪽 위에 고정되는 작은 pill(스크롤 따라다님).
   ?no= 로 진입한 상담 모듈(ISA·연금·노란·카드·투자상품)에서 공통 사용. 유효 고객번호가 없으면 렌더 안 함. */
export function ConsultReturnButton({ no, income }) {
  const customer = /^\d{9}$/.test(no || "") ? queryGrossTax(no) : null;
  if (!customer) return null;
  return (
    <Link
      to={`/tax?no=${no}`}
      title={`${customer.name}${income ? ` · ${income}` : ""} · 고객 진단으로 돌아가기`}
      className="fixed right-3 top-[70px] z-40 inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-lg backdrop-blur transition hover:bg-slate-50 print:hidden"
    >
      <span aria-hidden className="text-slate-400">←</span>
      <span className="max-w-[9rem] truncate">{customer.name} · 진단</span>
    </Link>
  );
}
