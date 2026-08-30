import { useState } from "react";
import { MessageSquareQuote, ChevronDown } from "lucide-react";
import { cn } from "@shared/lib/format";

/* 고객 안내 멘트 — 계산 결과를 「입으로 할 수 있는 말」로 제시한다.
   직원 가독성이 최우선: 핵심 한 마디를 크게, 부연은 담백하게, 되묻는 질문은 접어 둔다.
   결과 숫자 재나열은 결과부·인쇄물과 중복이므로 하지 않는다.
   accent는 상품 모듈 아이덴티티 색(단일 accent). */
const ACCENTS = {
  amber: { chip: "bg-amber-100 text-amber-700", icon: "text-amber-700", quote: "border-amber-400" },
  fuchsia: { chip: "bg-fuchsia-100 text-fuchsia-700", icon: "text-fuchsia-700", quote: "border-fuchsia-400" },
  violet: { chip: "bg-violet-100 text-violet-700", icon: "text-violet-700", quote: "border-violet-400" },
};

export const SalesScript = ({ accent = "amber", opening, detail = [], objections = [] }) => {
  const ac = ACCENTS[accent] ?? ACCENTS.amber;
  const [openIdx, setOpenIdx] = useState(null);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 print:hidden">
      <header className="mb-4 flex items-center gap-2.5">
        <span className={cn("flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg", ac.chip)}>
          <MessageSquareQuote className={cn("h-4 w-4", ac.icon)} />
        </span>
        <div className="min-w-0">
          <h4 className="text-[14px] font-bold text-slate-900">고객 안내 멘트</h4>
          <p className="text-[11.5px] text-slate-500">상담할 때 그대로 읽어도 되는 스크립트입니다.</p>
        </div>
      </header>

      {/* 핵심 한 마디 — 가장 먼저, 가장 크게 */}
      <p className={cn("border-l-[3px] pl-4 text-[17px] font-semibold leading-relaxed text-slate-900", ac.quote)}>
        {opening}
      </p>

      {/* 이어서 풀어 주는 말 — 박스 없이 여백으로만 구분 */}
      {detail.length > 0 && (
        <div className="mt-4 space-y-2.5 border-l-[3px] border-transparent pl-4">
          {detail.map((d, i) => (
            <p key={i} className="text-[13.5px] leading-relaxed text-slate-600">
              {d}
            </p>
          ))}
        </div>
      )}

      {/* 되묻는 질문 대응 — 필요할 때만 펼친다 */}
      {objections.length > 0 && (
        <div className="mt-5 border-t border-slate-100 pt-4">
          <div className="mb-2 text-[12px] font-semibold text-slate-500">고객이 이렇게 되물으면</div>
          <div className="divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200">
            {objections.map((o, i) => {
              const open = openIdx === i;
              return (
                <div key={i}>
                  <button
                    onClick={() => setOpenIdx(open ? null : i)}
                    className="flex w-full items-center justify-between gap-2 px-3.5 py-2.5 text-left transition-colors hover:bg-slate-50"
                  >
                    <span className="text-[13px] font-semibold text-slate-800">"{o.q}"</span>
                    <ChevronDown className={cn("h-4 w-4 flex-shrink-0 text-slate-400 transition-transform", open && "rotate-180")} />
                  </button>
                  {open && (
                    <p className="border-t border-slate-100 bg-slate-50/50 px-3.5 py-3 text-[13px] leading-relaxed text-slate-700">
                      {o.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};
