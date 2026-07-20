import { useState } from "react";
import { Link } from "react-router-dom";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X, Plus, Clock, ArrowRight } from "lucide-react";
import { usePersonalization } from "../personalization/PersonalizationContext";
import { getToolById } from "../registry/toolRegistry";
import { getToolIcon, getToolAccent } from "../registry/toolPresentation";
import { ToolLibrary } from "./ToolLibrary";
import { cn } from "@shared/lib/format";

/* 내 도구 — 사용자가 직접 등록한 도구 퀵 액세스.
   카드 드래그(손잡이)로 순서 변경, X로 해제, 「도구 추가」로 전체 라이브러리 탐색.
   하단에 최근 사용한 도구가 자동 표시된다. */

const SortableToolCard = ({ tool, onUnpin }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: tool.id });
  const Icon = getToolIcon(tool.icon);
  const accent = getToolAccent(tool.accent);

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3.5 transition-shadow",
        isDragging ? "z-10 shadow-lg ring-2 ring-im-300" : "hover:shadow-sm"
      )}
    >
      <div className={cn("flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md shadow-sm", accent.icon)}>
        <Icon className="h-5 w-5" />
      </div>

      <Link to={tool.to} className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-[13px] font-bold text-slate-900">{tool.name}</span>
        </div>
        <div className="mt-0.5 flex items-center gap-1.5">
          <span className={cn("rounded-sm px-1.5 py-0.5 text-[9px] font-bold", accent.chip)}>
            {tool.moduleName}
          </span>
          <span className="truncate text-[11px] text-slate-500">{tool.desc}</span>
        </div>
      </Link>

      {/* 드래그 손잡이 + 해제 — 호버 시 표시 */}
      <div className="flex flex-shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          {...attributes}
          {...listeners}
          title="끌어서 순서 변경"
          className="cursor-grab rounded p-1 text-slate-300 hover:bg-slate-100 hover:text-slate-500 active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <button
          onClick={() => onUnpin(tool.id)}
          title="대시보드에서 해제"
          className="rounded p-1 text-slate-300 hover:bg-rose-50 hover:text-rose-500"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export function MyTools() {
  const { pinnedTools, reorderPinnedTools, togglePin, recentTools } = usePersonalization();
  const [libraryOpen, setLibraryOpen] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  /* 레지스트리에서 사라진 도구 id는 조용히 건너뛴다(모듈 제거 대비) */
  const pinned = pinnedTools.map(getToolById).filter(Boolean);
  const recent = recentTools
    .map((r) => getToolById(r.id))
    .filter(Boolean)
    .slice(0, 5);

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const ids = pinned.map((t) => t.id);
    reorderPinnedTools(arrayMove(ids, ids.indexOf(active.id), ids.indexOf(over.id)));
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-end">
        <button
          onClick={() => setLibraryOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-md border border-im-200 bg-im-50 px-3 py-1.5 text-[12px] font-semibold text-im-700 transition-colors hover:bg-im-100"
        >
          <Plus className="h-3.5 w-3.5" />
          도구 추가
        </button>
      </div>

      {pinned.length === 0 ? (
        <button
          onClick={() => setLibraryOpen(true)}
          className="flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed border-slate-200 bg-white/60 px-4 py-8 text-center transition-colors hover:border-im-300 hover:bg-im-50/40"
        >
          <Plus className="h-6 w-6 text-slate-300" />
          <span className="text-[13px] font-medium text-slate-500">
            자주 쓰는 계산기·시뮬레이터를 등록해 보세요
          </span>
          <span className="text-[11px] text-slate-400">
            모듈 안에서 「대시보드에 고정」을 누르거나 여기서 바로 추가할 수 있습니다
          </span>
        </button>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={pinned.map((t) => t.id)} strategy={rectSortingStrategy}>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {pinned.map((tool) => (
                <SortableToolCard key={tool.id} tool={tool} onUnpin={togglePin} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {recent.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
            <Clock className="h-3.5 w-3.5" />
            최근 사용
          </span>
          {recent.map((tool) => {
            const Icon = getToolIcon(tool.icon);
            return (
              <Link
                key={tool.id}
                to={tool.to}
                className="group inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 transition-colors hover:border-im-300 hover:text-im-700"
              >
                <Icon className="h-3 w-3 text-slate-400 group-hover:text-im-600" />
                {tool.name}
                <ArrowRight className="h-2.5 w-2.5 text-slate-300 group-hover:text-im-500" />
              </Link>
            );
          })}
        </div>
      )}

      {libraryOpen && <ToolLibrary onClose={() => setLibraryOpen(false)} />}
    </div>
  );
}
