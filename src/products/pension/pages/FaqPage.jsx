import { useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import { PENSION_FAQS } from "../data/pension";
import { cn } from "@shared/lib/format";

/* 연금계좌 FAQ — 소득세법·근퇴법 근거 + iM뱅크 공시자료 기반 핵심 문항. */
export const FaqPage = () => {
  const [query, setQuery] = useState("");
  const [openIdx, setOpenIdx] = useState(0);

  const filtered = PENSION_FAQS.filter(
    (f) => f.q.includes(query) || f.a.includes(query)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-stone-900 tracking-tight">
          자주 묻는 질문
        </h1>
        <p className="text-sm text-stone-600 mt-1">
          소득세법·근퇴법 근거 핵심 문항 · 자사 상품 FAQ는 자료 확보 후 확장 예정
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="질문 검색 (예: 세액공제, 중도해지, 연금수령, 수수료)"
          className="w-full pl-9 pr-3 py-2.5 text-sm border border-stone-300 rounded-md focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-200"
        />
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center text-sm text-stone-500 py-8">검색 결과가 없습니다.</div>
        )}
        {filtered.map((f, i) => {
          const isOpen = openIdx === i;
          return (
            <div key={i} className="bg-white border border-stone-200 rounded-md overflow-hidden">
              <button
                onClick={() => setOpenIdx(isOpen ? -1 : i)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-stone-50"
              >
                <span className="text-sm font-semibold text-stone-900">{f.q}</span>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 text-stone-400 flex-shrink-0 transition-transform",
                    isOpen && "rotate-180"
                  )}
                />
              </button>
              {isOpen && (
                <div className="px-4 pb-3.5 pt-0.5 border-t border-stone-100">
                  <p className="text-[13px] text-stone-700 leading-relaxed">{f.a}</p>
                  <div className="mt-2 inline-flex items-center gap-1 rounded-sm border border-violet-200 bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-700">
                    {f.ref}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
