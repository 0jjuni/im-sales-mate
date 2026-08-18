import { Receipt, Scale, BookMarked, ChevronRight, FileText } from "lucide-react";
import { KNOWLEDGE } from "../data/knowledge";
import { CARD } from "@shared/lib/surface";
import { cn } from "@shared/lib/format";

const ICONS = { Receipt, Scale, BookMarked };

const KnowledgeCard = ({ category }) => {
  const Icon = ICONS[category.icon] ?? FileText;
  return (
    <div className={cn(CARD, "flex flex-col p-4")}>
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-im-50 text-im-700">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-[14px] font-bold text-slate-900">{category.name}</h3>
          <p className="text-[11px] text-slate-500">{category.desc}</p>
        </div>
      </div>

      <ul className="mt-3 flex-1 space-y-1">
        {category.items.map((item, i) => (
          <li key={i}>
            <button
              type="button"
              className="flex w-full cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-left"
              title="준비 중"
              disabled
            >
              <span className="rounded-sm bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-500">
                {item.tag}
              </span>
              <span className="flex-1 truncate text-[12px] text-slate-700">
                {item.title}
              </span>
              <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-slate-300" />
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="mt-3 w-full rounded-md border border-dashed border-slate-300 py-1.5 text-[12px] font-medium text-slate-400"
        disabled
      >
        전체 보기 (준비 중)
      </button>
    </div>
  );
};

export function KnowledgeLibrary() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {KNOWLEDGE.map((c) => (
        <KnowledgeCard key={c.id} category={c} />
      ))}
    </div>
  );
}
