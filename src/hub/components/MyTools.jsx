import { useState } from "react";
import { Link } from "react-router-dom";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X, Plus, Clock, ChevronRight } from "lucide-react";
import { usePersonalization } from "../personalization/PersonalizationContext";
import { getToolById } from "../registry/toolRegistry";
import { getToolIcon, getToolAccent } from "../registry/toolPresentation";
import { ToolLibrary } from "./ToolLibrary";
import { cn } from "@shared/lib/format";

/* 내 도구 — 자주 쓰는 도구를 바로 여는 런처.
   타일은 이름·소속만 간결하게 보여주고(설명은 툴팁), 정리 컨트롤(드래그·해제)은
   호버 시에만 나타나 평소에는 실행에만 집중되는 화면을 유지한다. */

const SortableToolTile = ({ tool, onUnpin }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: tool.id });
  const Icon = getToolIcon(tool.icon);
  const accent = getToolAccent(tool.accent);

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        "group relative rounded-xl border bg-white transition-all",
        isDragging
          ? "z-10 border-im-400 shadow-lg"
          : "border-slate-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
      )}
    >
      <Link
        to={tool.to}
        title={tool.desc}
        className="flex items-center gap-3 px-4 py-3.5"
      >
        <div
          className={cn(
            "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg shadow-sm transition-transform group-hover:scale-105",
            accent.icon
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-bold text-slate-900">{tool.name}</div>
          <div className="mt-0.5 whitespace-nowrap text-[11px] text-slate-400">
            {tool.moduleName}
          </div>
        </div>
        <ChevronRight className="h-4 w-4 flex-shrink-0 text-slate-200 transition-colors group-hover:text-im-500" />
      </Link>

      {/* 정리 컨트롤 — 호버 시에만, 타일 우상단에 살짝 */}
      <div className="absolute -right-2 -top-2 flex items-center gap-0.5 rounded-full border border-slate-200 bg-white p-0.5 opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
        <button
          {...attributes}
          {...listeners}
          title="끌어서 순서 변경"
          className="cursor-grab rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 active:cursor-grabbing"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onUnpin(tool.id)}
          title="내 도구에서 해제"
          className="rounded-full p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-500"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

const AddTile = ({ onClick, emphasized }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-colors",
      emphasized
        ? "min-h-[4.5rem] w-full border-slate-300 bg-white/60 px-4 py-6 hover:border-im-400 hover:bg-im-50/40"
        : "border-slate-200 px-4 py-3.5 text-slate-400 hover:border-im-400 hover:bg-im-50/40 hover:text-im-700"
    )}
  >
    <Plus className={emphasized ? "h-5 w-5 text-slate-400" : "h-4 w-4"} />
    <span className="text-[13px] font-semibold">도구 추가</span>
  </button>
);

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
      {pinned.length === 0 ? (
        <div className="space-y-1.5">
          <AddTile emphasized onClick={() => setLibraryOpen(true)} />
          <p className="text-center text-[11px] text-slate-400">
            자주 쓰는 계산기·시뮬레이터를 등록해 두면 여기서 바로 열 수 있습니다
          </p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={pinned.map((t) => t.id)} strategy={rectSortingStrategy}>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {pinned.map((tool) => (
                <SortableToolTile key={tool.id} tool={tool} onUnpin={togglePin} />
              ))}
              <AddTile onClick={() => setLibraryOpen(true)} />
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
                title={tool.desc}
                className="group inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-500 transition-colors hover:border-im-300 hover:text-im-700"
              >
                <Icon className="h-3 w-3 text-slate-400 group-hover:text-im-600" />
                {tool.name}
              </Link>
            );
          })}
        </div>
      )}

      {libraryOpen && <ToolLibrary onClose={() => setLibraryOpen(false)} />}
    </div>
  );
}
