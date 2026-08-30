import { useState } from "react";
import { MessageSquareQuote, ChevronDown } from "lucide-react";
import { cn } from "@shared/lib/format";

/* 고객 안내 멘트 — 계산 결과를 「입으로 할 수 있는 말」로 제시한다.

   계산 결과를 다시 나열하는 것은 화면 결과부·인쇄물과 중복이므로 하지 않는다.
   여기서는 ① 처음 꺼내는 한 마디 ② 체감되게 풀어 주는 말
   ③ 고객이 흔히 되묻는 것에 대한 답변만 담는다.

   accent는 상품 모듈 아이덴티티 색 (Tailwind 정적 클래스). */
const ACCENTS = {
  amber: {
    box: "border-amber-200 bg-amber-50/40",
    chip: "bg-amber-100 text-amber-800",
    icon: "text-amber-600",
    quote: "border-amber-300",
  },
  fuchsia: {
    box: "border-fuchsia-200 bg-fuchsia-50/40",
    chip: "bg-fuchsia-100 text-fuchsia-800",
    icon: "text-fuchsia-600",
    quote: "border-fuchsia-300",
  },
  violet: {
    box: "border-violet-200 bg-violet-50/40",
    chip: "bg-violet-100 text-violet-800",
    icon: "text-violet-600",
    quote: "border-violet-300",
  },
};

export const SalesScript = ({ accent = "amber", opening, detail = [], objections = [] }) => {
  const ac = ACCENTS[accent] ?? ACCENTS.amber;
  const [openIdx, setOpenIdx] = useState(null);

  return (
    <div className={cn("rounded-md border p-4 print:hidden", ac.box)}>
      <div className="mb-2.5 flex items-center gap-2">
        <h4 className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
          <MessageSquareQuote className={cn("h-4 w-4", ac.icon)} />
          고객 안내 멘트
        </h4>
      </div>

      {/* 처음 꺼내는 한 마디 */}
      <blockquote
        className={cn("border-l-[3px] bg-white/70 px-3.5 py-3 text-[14px] font-semibold leading-relaxed text-slate-900", ac.quote)}
      >
        {opening}
      </blockquote>

      {/* 이어서 풀어 주는 말 */}
      {detail.length > 0 && (
        <div className="mt-2 space-y-1.5">
          {detail.map((d, i) => (
            <p
              key={i}
              className="rounded-sm bg-white/50 px-3.5 py-2 text-[13px] leading-relaxed text-slate-800"
            >
              {d}
            </p>
          ))}
        </div>
      )}

      {/* 되묻는 질문 대응 — 필요할 때만 펼친다 */}
      {objections.length > 0 && (
        <div className="mt-3">
          <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            이렇게 되물으시면
          </div>
          <div className="space-y-1">
            {objections.map((o, i) => {
              const open = openIdx === i;
              return (
                <div key={i} className="overflow-hidden rounded-sm border border-slate-200 bg-white">
                  <button
                    onClick={() => setOpenIdx(open ? null : i)}
                    className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left hover:bg-slate-50"
                  >
                    <span className="text-[12.5px] font-semibold text-slate-800">"{o.q}"</span>
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 flex-shrink-0 text-slate-400 transition-transform",
                        open && "rotate-180"
                      )}
                    />
                  </button>
                  {open && (
                    <p className="border-t border-slate-100 px-3 py-2 text-[12.5px] leading-relaxed text-slate-700">
                      {o.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
