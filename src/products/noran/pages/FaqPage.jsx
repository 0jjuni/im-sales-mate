import { useState, useMemo } from "react";
import { Search, HelpCircle } from "lucide-react";
import { CATEGORIES } from "../data/categories";
import { FAQS } from "../data/faqs";
import { SourceBadge } from "@shared/components/SourceBadge";
import { cn } from "@shared/lib/format";

export const FaqPage = ({ onOpenArticle }) => {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(() => {
    return FAQS.filter((f) => {
      if (filter !== "all" && f.category !== filter) return false;
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        f.question.toLowerCase().includes(q) ||
        f.shortAnswer.toLowerCase().includes(q)
      );
    });
  }, [query, filter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-stone-900 tracking-tight">자주 묻는 질문</h1>
        <p className="text-sm text-stone-600 mt-1">키워드로 약관 기반 답변과 근거 조항을 즉시 확인하세요.</p>
      </div>

      <div className="bg-white border border-stone-200 rounded-md p-4 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="질문을 검색하세요 (예: 부금월액, 노령급부, 해약환급금)"
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-stone-200 rounded-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-200"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "px-2.5 py-1 text-xs rounded-sm",
              filter === "all"
                ? "bg-stone-900 text-white"
                : "bg-stone-100 text-stone-700 hover:bg-stone-200"
            )}
          >
            전체 ({FAQS.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = FAQS.filter((f) => f.category === cat.id).length;
            if (count === 0) return null;
            return (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={cn(
                  "px-2.5 py-1 text-xs rounded-sm",
                  filter === cat.id
                    ? "bg-stone-900 text-white"
                    : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                )}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="bg-stone-50 border border-stone-200 rounded-md p-8 text-center">
            <p className="text-sm text-stone-500">검색 결과가 없습니다.</p>
          </div>
        ) : (
          filtered.map((faq) => (
            <div key={faq.id} className="bg-white border border-stone-200 rounded-md p-4">
              <div className="flex items-start gap-3">
                <HelpCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3 mb-1">
                    <h3 className="text-sm font-bold text-stone-900">{faq.question}</h3>
                    <SourceBadge articles={faq.sourceReference.articles} onClick={onOpenArticle} />
                  </div>
                  <p className="text-sm text-stone-700 leading-relaxed">{faq.shortAnswer}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
