import { BookOpen } from "lucide-react";

/* 조항 출처 뱃지 — onClick이 있으면 조항 모달을 여는 버튼,
   없으면 표시 전용 span (버튼 카드 내부에서도 안전 — button 중첩 방지) */
export const SourceBadge = ({ articles = [], onClick }) => {
  const Tag = onClick ? "button" : "span";
  return (
    <div className="flex flex-wrap gap-1.5">
      {articles.map((a) => (
        <Tag
          key={a}
          onClick={onClick ? () => onClick(a) : undefined}
          className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium border border-slate-300 bg-slate-50 text-slate-700 rounded-sm ${
            onClick ? "hover:bg-amber-50 hover:border-amber-400 transition-colors" : ""
          }`}
        >
          <BookOpen className="w-3 h-3" />
          {a}
        </Tag>
      ))}
    </div>
  );
};
