import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, ChevronDown, Settings2 } from "lucide-react";
import { faqsForModule } from "@shared/data/faqs";
import { cn } from "@shared/lib/format";

/* ISA FAQ — 조특법 근거 핵심 문항. 담당 부서가 부서 관리자 화면에서 편집(FAQ 스토어). */
export const FaqPage = () => {
  const [query, setQuery] = useState("");
  const [openIdx, setOpenIdx] = useState(0);
  const [items] = useState(() => faqsForModule("isa"));

  const filtered = items.filter(
    (f) => f.q.includes(query) || f.a.includes(query)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            자주 묻는 질문
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            조세특례제한법 근거 핵심 문항 · 담당 부서가 직접 관리
          </p>
        </div>
        <Link
          to="/admin?mode=faq"
          className="inline-flex flex-shrink-0 items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11.5px] font-semibold text-slate-600 transition-colors hover:border-slate-400 hover:text-slate-900"
        >
          <Settings2 className="h-3.5 w-3.5" />
          FAQ 관리
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="질문 검색 (예: 비과세, 납입한도, 손익통산)"
          className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-200"
        />
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center text-sm text-slate-500 py-8">
            검색 결과가 없습니다.
          </div>
        )}
        {filtered.map((f, i) => {
          const isOpen = openIdx === i;
          return (
            <div key={i} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <button
                onClick={() => setOpenIdx(isOpen ? -1 : i)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-slate-50"
              >
                <span className="text-sm font-semibold text-slate-900">{f.q}</span>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 text-slate-400 flex-shrink-0 transition-transform",
                    isOpen && "rotate-180"
                  )}
                />
              </button>
              {isOpen && (
                <div className="px-4 pb-3.5 pt-0.5 border-t border-slate-100">
                  <p className="text-[13px] text-slate-700 leading-relaxed">{f.a}</p>
                  {f.ref && (
                    <div className="mt-2 inline-flex items-center gap-1 rounded-sm border border-fuchsia-200 bg-fuchsia-50 px-2 py-0.5 text-[10px] font-semibold text-fuchsia-700">
                      {f.ref}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
