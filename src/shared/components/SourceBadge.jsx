import { BookOpen } from "lucide-react";

export const SourceBadge = ({ articles = [], onClick }) => (
  <div className="flex flex-wrap gap-1.5">
    {articles.map((a) => (
      <button
        key={a}
        onClick={() => onClick && onClick(a)}
        className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium border border-stone-300 bg-stone-50 text-stone-700 rounded-sm hover:bg-amber-50 hover:border-amber-400 transition-colors"
      >
        <BookOpen className="w-3 h-3" />
        {a}
      </button>
    ))}
  </div>
);
