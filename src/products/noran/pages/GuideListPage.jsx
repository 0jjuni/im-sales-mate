import { useState } from "react";
import { CATEGORIES } from "../data/categories";
import { GUIDES } from "../data/guides";
import { SourceBadge } from "@shared/components/SourceBadge";
import { cn } from "@shared/lib/format";

export const GuideListPage = ({ onSelectGuide }) => {
  const [activeCategory, setActiveCategory] = useState("all");
  const filtered = activeCategory === "all" ? GUIDES : GUIDES.filter((g) => g.category === activeCategory);

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mt-2 leading-tight">업무별 가이드</h1>
        <p className="text-base text-slate-600 mt-3 leading-loose">
          약관·법령 근거가 명시된 상담 가이드를 영역별로 확인하세요. 총 {GUIDES.length}개 가이드.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 pb-4 border-b-2 border-slate-200">
        <button
          onClick={() => setActiveCategory("all")}
          className={cn(
            "px-4 py-2 text-sm rounded-xl transition-colors",
            activeCategory === "all"
              ? "bg-slate-900 text-white font-bold"
              : "bg-white border border-slate-200 text-slate-700 hover:border-slate-400 font-medium"
          )}
        >
          전체 ({GUIDES.length})
        </button>
        {CATEGORIES.map((cat) => {
          const count = GUIDES.filter((g) => g.category === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "px-4 py-2 text-sm rounded-xl transition-colors",
                activeCategory === cat.id
                  ? "bg-slate-900 text-white font-bold"
                  : "bg-white border border-slate-200 text-slate-700 hover:border-slate-400 font-medium"
              )}
            >
              {cat.name} ({count})
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((guide) => {
          const cat = CATEGORIES.find((c) => c.id === guide.category);
          return (
            <button
              key={guide.id}
              onClick={() => onSelectGuide(guide.id)}
              className="group text-left bg-white border border-slate-200 hover:border-amber-400 hover:shadow-md rounded-xl p-6 transition-all"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-sm">
                  {cat?.name}
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-2 group-hover:text-amber-700 transition-colors leading-snug">
                {guide.title}
              </h3>
              <p className="text-[15px] text-slate-700 leading-loose mb-4 line-clamp-3">{guide.summary}</p>
              <SourceBadge articles={guide.sourceReference.articles.slice(0, 4)} />
            </button>
          );
        })}
      </div>
    </div>
  );
};
