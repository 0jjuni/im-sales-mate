import { useState } from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Eye, EyeOff, RotateCcw, Check } from "lucide-react";
import { HubShell } from "./HubShell";
import { getSection } from "./sections";
import { usePersonalization } from "./personalization/PersonalizationContext";
import { useMorningBriefing } from "./hooks/useMorningBriefing";
import { MarketBoard } from "./components/MarketBoard";
import { MorningNews } from "./components/MorningNews";
import { MyTools } from "./components/MyTools";
import { ProductGrid } from "./components/ProductGrid";
import { KnowledgeLibrary } from "./components/KnowledgeLibrary";
import { cn } from "@shared/lib/format";

const SectionHeader = ({ icon: Icon, title, sub }) => (
  <div className="mb-3 flex items-center gap-2.5">
    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900 text-white">
      <Icon className="h-4 w-4" />
    </div>
    <div>
      <h2 className="text-[15px] font-bold tracking-tight text-slate-900">{title}</h2>
      {sub && <p className="text-[11px] text-slate-500">{sub}</p>}
    </div>
  </div>
);

/* 편집 모드에서 각 섹션을 감싸는 셸 — 드래그 손잡이 + 표시/숨김 토글 */
const SortableSectionShell = ({ id, hidden, onToggleHidden, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });
  const meta = getSection(id);

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        "rounded-xl border-2 bg-white/70 transition-shadow",
        isDragging ? "z-10 border-im-400 shadow-lg" : "border-dashed border-slate-300"
      )}
    >
      <div className="flex items-center gap-2 border-b border-dashed border-slate-200 px-3 py-2">
        <button
          {...attributes}
          {...listeners}
          title="끌어서 순서 변경"
          className="cursor-grab rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <span className="flex-1 text-[13px] font-bold text-slate-700">{meta?.label ?? id}</span>
        <button
          onClick={() => onToggleHidden(id)}
          title={hidden ? "섹션 표시" : "섹션 숨김"}
          className={cn(
            "inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold transition-colors",
            hidden
              ? "bg-slate-100 text-slate-400 hover:text-slate-600"
              : "bg-im-50 text-im-700 hover:bg-im-100"
          )}
        >
          {hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {hidden ? "숨김" : "표시"}
        </button>
      </div>

      {hidden ? (
        <div className="px-4 py-3 text-[12px] text-slate-400">
          숨겨진 섹션입니다 — 「숨김」을 눌러 다시 표시할 수 있습니다.
        </div>
      ) : (
        <div className="pointer-events-none select-none p-3 opacity-60">{children}</div>
      )}
    </div>
  );
};

export function HubHome() {
  /* 마켓 보드와 뉴스 카드가 같은 브리핑 데이터를 공유 — fetch는 한 번만 */
  const { data, status, reload } = useMorningBriefing();
  const {
    sectionOrder,
    isSectionHidden,
    toggleSectionHidden,
    reorderSections,
    resetDashboard,
  } = usePersonalization();
  const [editMode, setEditMode] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  /* 섹션 id → 실제 콘텐츠. 새 섹션은 sections.js 등록 후 여기에 렌더러 추가 */
  const renderSection = (id) => {
    switch (id) {
      case "market":
        return <MarketBoard markets={data?.markets} status={status} />;
      case "news":
        return <MorningNews data={data} status={status} onReload={reload} />;
      case "mytools": {
        const meta = getSection("mytools");
        return (
          <>
            <SectionHeader icon={meta.icon} title="내 도구" sub="자주 쓰는 계산기·도구를 등록해 바로 진입하세요" />
            <MyTools />
          </>
        );
      }
      case "products": {
        const meta = getSection("products");
        return (
          <>
            <SectionHeader icon={meta.icon} title="상품 모듈" sub="상담을 시작할 상품을 선택하세요" />
            <ProductGrid />
          </>
        );
      }
      case "knowledge": {
        const meta = getSection("knowledge");
        return (
          <>
            <SectionHeader icon={meta.icon} title="PB 지식 라이브러리" sub="세무·규제·용어 — 상담 근거 자료" />
            <KnowledgeLibrary />
          </>
        );
      }
      default:
        return null;
    }
  };

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    reorderSections(
      arrayMove(sectionOrder, sectionOrder.indexOf(active.id), sectionOrder.indexOf(over.id))
    );
  };

  const visibleNavSections = sectionOrder
    .filter((id) => !isSectionHidden(id))
    .map(getSection)
    .filter((s) => s?.nav);

  return (
    <HubShell
      navSections={visibleNavSections}
      editMode={editMode}
      onToggleEdit={() => setEditMode((v) => !v)}
    >
      {editMode ? (
        <>
          <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-im-200 bg-im-50/60 px-4 py-2.5">
            <p className="text-[12px] text-im-800">
              <span className="font-bold">대시보드 편집 중</span> — 손잡이를 끌어 순서를 바꾸고, 눈 아이콘으로 섹션을 숨기거나 표시하세요.
            </p>
            <div className="flex flex-shrink-0 items-center gap-2">
              <button
                onClick={resetDashboard}
                className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:border-slate-400"
              >
                <RotateCcw className="h-3 w-3" />
                기본값 복원
              </button>
              <button
                onClick={() => setEditMode(false)}
                className="inline-flex items-center gap-1 rounded-md bg-im-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-im-700"
              >
                <Check className="h-3.5 w-3.5" />
                완료
              </button>
            </div>
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={sectionOrder} strategy={verticalListSortingStrategy}>
              <div className="space-y-4">
                {sectionOrder.map((id) => (
                  <SortableSectionShell
                    key={id}
                    id={id}
                    hidden={isSectionHidden(id)}
                    onToggleHidden={toggleSectionHidden}
                  >
                    {renderSection(id)}
                  </SortableSectionShell>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </>
      ) : (
        <div className="space-y-8">
          {sectionOrder
            .filter((id) => !isSectionHidden(id))
            .map((id, i) => (
              <section key={id} id={i === 0 ? "top" : id} className="scroll-mt-20">
                {/* 첫 섹션은 상단 앵커를 겸한다 */}
                {i === 0 && <span id={id} />}
                {renderSection(id)}
              </section>
            ))}
        </div>
      )}

      <footer className="mt-10 border-t border-slate-200 pt-4 text-[11px] text-slate-400">
        내부 영업 지원 도구 (베타) · 시황 및 계산 결과는 참고용이며 투자권유가 아닙니다.
      </footer>
    </HubShell>
  );
}
