import { useState } from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Eye,
  EyeOff,
  RotateCcw,
  Check,
  ArrowUp,
  ArrowDown,
  HelpCircle,
} from "lucide-react";
import { HubShell } from "./HubShell";
import { getSection } from "./sections";
import { usePersonalization } from "./personalization/PersonalizationContext";
import { useMorningBriefing } from "./hooks/useMorningBriefing";
import { MarketBoard } from "./components/MarketBoard";
import { MorningNews } from "./components/MorningNews";
import { MyTools } from "./components/MyTools";
import { FollowupBoard } from "./components/FollowupBoard";
import { ProductGrid } from "./components/ProductGrid";
import { UtilityGrid } from "./components/UtilityGrid";
import { KnowledgeLibrary } from "./components/KnowledgeLibrary";
import { EditGuide, hasSeenEditGuide, markEditGuideSeen } from "./components/EditGuide";
import { cn } from "@shared/lib/format";

const SectionHeader = ({ icon: Icon, title, sub }) => (
  <div className="mb-4 flex items-center gap-2.5">
    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-im-50 text-im-600">
      <Icon className="h-[18px] w-[18px]" />
    </div>
    <div className="min-w-0">
      <h2 className="text-[17px] font-bold leading-tight tracking-tight text-slate-900">{title}</h2>
      {sub && <p className="mt-0.5 text-[12px] text-slate-500">{sub}</p>}
    </div>
  </div>
);

/* 섹션 묶음 패널 — 헤더 + 카드들을 하나의 박스로 그룹핑해 섹션 경계를 분명히 한다.
   마켓 보드·뉴스는 이미 자체 카드라 감싸지 않고, 헤더+그리드로 「떠 있던」 섹션만 감싼다.
   페이지 캔버스가 slate-50이라, 박스는 흰색+테두리+옅은 그림자로 두어 캔버스 위로 떠 보이게 한다.
   명도 층: 캔버스(slate-50) → 박스(white) → 안쪽 카드(white, 테두리로 구분). (스킬: 절제 · 명도로 층 만들기) */
const SectionPanel = ({ children }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">{children}</div>
);

/* 편집 모드의 섹션 한 줄.
   섹션 내용을 미리보기로 펼치면 7개를 옮기는 데 화면을 한참 스크롤해야 해서,
   편집 중에는 제목·설명만 있는 목록으로 접는다.
   드래그가 서툰 환경을 위해 위·아래 버튼도 함께 둔다. */
const SortableSectionRow = ({ id, hidden, index, total, onToggleHidden, onMove }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });
  const meta = getSection(id);
  const Icon = meta?.icon;

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        "flex items-center gap-2 border-b border-slate-100 bg-white px-2.5 py-2.5 last:border-b-0",
        isDragging && "relative z-10 rounded-md border-b-0 shadow-lg ring-1 ring-im-400",
        hidden && "bg-slate-50"
      )}
    >
      <button
        {...attributes}
        {...listeners}
        title="끌어서 순서 변경"
        aria-label={`${meta?.label ?? id} 끌어서 순서 변경`}
        className="flex-shrink-0 cursor-grab rounded p-1.5 text-slate-300 hover:bg-slate-100 hover:text-slate-500 active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {Icon && (
        <div
          className={cn(
            "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md",
            hidden ? "bg-slate-200 text-slate-400" : "bg-slate-900 text-white"
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div
          className={cn(
            "truncate text-[13px] font-bold",
            hidden ? "text-slate-400" : "text-slate-900"
          )}
        >
          {meta?.label ?? id}
        </div>
        {meta?.desc && (
          <div className="truncate text-[11px] text-slate-500">{meta.desc}</div>
        )}
      </div>

      {/* 순서 이동 — 드래그 대신 눌러서도 옮길 수 있게 */}
      <div className="flex flex-shrink-0 items-center">
        <button
          onClick={() => onMove(index, -1)}
          disabled={index === 0}
          title="위로"
          aria-label={`${meta?.label ?? id} 위로`}
          className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-25 disabled:hover:bg-transparent"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
        <button
          onClick={() => onMove(index, 1)}
          disabled={index === total - 1}
          title="아래로"
          aria-label={`${meta?.label ?? id} 아래로`}
          className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-25 disabled:hover:bg-transparent"
        >
          <ArrowDown className="h-4 w-4" />
        </button>
      </div>

      <button
        onClick={() => onToggleHidden(id)}
        title={hidden ? "이 섹션 다시 보기" : "이 섹션 숨기기"}
        className={cn(
          "ml-1 inline-flex w-[4.5rem] flex-shrink-0 items-center justify-center gap-1 rounded-md border px-2 py-1.5 text-[11px] font-semibold transition-colors",
          hidden
            ? "border-slate-300 bg-white text-slate-500 hover:border-slate-400"
            : "border-im-500 bg-im-500 text-white hover:bg-im-600"
        )}
      >
        {hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        {hidden ? "숨김" : "표시"}
      </button>
    </li>
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
  const [showGuide, setShowGuide] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  /* 섹션 id → 실제 콘텐츠. 새 섹션은 sections.js 등록 후 여기에 렌더러 추가 */
  const renderSection = (id) => {
    switch (id) {
      case "market":
        return (
          <MarketBoard
            markets={data?.markets}
            status={status}
            live={data?.marketsLive}
            asOf={data?.marketsAsOf}
          />
        );
      case "news":
        return <MorningNews data={data} status={status} onReload={reload} />;
      case "mytools": {
        const meta = getSection("mytools");
        return (
          <SectionPanel>
            <SectionHeader icon={meta.icon} title="내 도구" sub="자주 쓰는 계산기·도구를 등록해 바로 진입하세요" />
            <MyTools />
          </SectionPanel>
        );
      }
      case "followups": {
        const meta = getSection("followups");
        return (
          <SectionPanel>
            <SectionHeader
              icon={meta.icon}
              title="고객 후속 관리"
              sub="가까운 후속 연락과 빠른 기록 · 달력과 검색은 전체 관리에서"
            />
            <FollowupBoard />
          </SectionPanel>
        );
      }
      case "products": {
        const meta = getSection("products");
        return (
          <SectionPanel>
            <SectionHeader icon={meta.icon} title="상품 상담" sub="상담할 상품을 선택해 시작하세요" />
            <ProductGrid />
          </SectionPanel>
        );
      }
      case "utility": {
        const meta = getSection("utility");
        return (
          <SectionPanel>
            <SectionHeader
              icon={meta.icon}
              title="보조 도구"
              sub="상품과 무관하게 창구에서 자주 쓰는 도구"
            />
            <UtilityGrid />
          </SectionPanel>
        );
      }
      case "knowledge": {
        const meta = getSection("knowledge");
        return (
          <SectionPanel>
            <SectionHeader icon={meta.icon} title="PB 지식 라이브러리" sub="세무·규제·용어 — 상담 근거 자료" />
            <KnowledgeLibrary />
          </SectionPanel>
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

  /* 버튼으로 한 칸 이동 */
  const moveSection = (index, delta) => {
    const next = index + delta;
    if (next < 0 || next >= sectionOrder.length) return;
    reorderSections(arrayMove(sectionOrder, index, next));
  };

  const openEdit = () => {
    setEditMode(true);
    if (!hasSeenEditGuide()) setShowGuide(true);
  };

  const closeGuide = () => {
    markEditGuideSeen();
    setShowGuide(false);
  };

  const visibleCount = sectionOrder.filter((id) => !isSectionHidden(id)).length;

  return (
    <HubShell
      editMode={editMode}
      onToggleEdit={() => (editMode ? setEditMode(false) : openEdit())}
    >
      {editMode ? (
        <>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-im-200 bg-im-50/60 px-4 py-2.5">
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-im-900">대시보드 편집 중</p>
              <p className="text-[11.5px] text-im-800">
                화면에 표시할 섹션과 순서를 정하세요. 전체 {sectionOrder.length}개 중{" "}
                {visibleCount}개 표시 중입니다.
              </p>
            </div>
            <div className="flex flex-shrink-0 items-center gap-2">
              <button
                onClick={() => setShowGuide(true)}
                title="편집 안내 다시 보기"
                aria-label="편집 안내 다시 보기"
                className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-500 hover:border-slate-400 hover:text-slate-700"
              >
                <HelpCircle className="h-3.5 w-3.5" />
              </button>
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
              <ul className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                {sectionOrder.map((id, i) => (
                  <SortableSectionRow
                    key={id}
                    id={id}
                    index={i}
                    total={sectionOrder.length}
                    hidden={isSectionHidden(id)}
                    onToggleHidden={toggleSectionHidden}
                    onMove={moveSection}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>

          <p className="mt-2 text-[11.5px] text-slate-500">
            변경 사항은 바로 저장됩니다. 완료를 누르면 편집이 끝납니다.
          </p>

          {showGuide && <EditGuide onClose={closeGuide} />}
        </>
      ) : (
        <div className="space-y-6">
          {sectionOrder
            .filter((id) => !isSectionHidden(id))
            .map((id) => (
              <section key={id} id={id} className="scroll-mt-20">
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
