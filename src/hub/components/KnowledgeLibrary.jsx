import { Receipt, Scale, BookMarked, FileText } from "lucide-react";
import { KNOWLEDGE } from "../data/knowledge";
import { CARD } from "@shared/lib/surface";
import { cn } from "@shared/lib/format";

const ICONS = { Receipt, Scale, BookMarked };

/* 지식 라이브러리는 아직 입구(샘플 항목)만 있는 상태.
   비활성 버튼처럼 보이면 "고장 난 화면"으로 읽히므로,
   준비 중임을 배지로 분명히 하고 항목은 미리보기 리스트로 담백하게 보여준다. */
const KnowledgeCard = ({ category }) => {
  const Icon = ICONS[category.icon] ?? FileText;
  return (
    <div className={cn(CARD, "flex flex-col p-4")}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-im-50 text-im-600">
            <Icon className="h-[18px] w-[18px]" />
          </div>
          <div className="min-w-0">
            <h3 className="text-[14px] font-bold text-slate-900">{category.name}</h3>
            <p className="text-[11px] text-slate-500">{category.desc}</p>
          </div>
        </div>
        <span className="flex-shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-400">
          준비 중
        </span>
      </div>

      <ul className="mt-3.5 flex-1 space-y-1.5">
        {category.items.map((item, i) => (
          <li
            key={i}
            className="flex items-center gap-2 rounded-md bg-slate-50/80 px-2.5 py-2"
          >
            <span className="flex-shrink-0 rounded-sm bg-white px-1.5 py-0.5 text-[9px] font-bold text-slate-500 ring-1 ring-inset ring-slate-200">
              {item.tag}
            </span>
            <span className="min-w-0 flex-1 truncate text-[12px] text-slate-600">
              {item.title}
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-3.5 border-t border-slate-100 pt-2.5 text-center text-[11px] font-medium text-slate-400">
        상세 콘텐츠·검색 준비 중
      </p>
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
