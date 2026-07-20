import { useEffect } from "react";
import { Link } from "react-router-dom";
import { X, Pin, Check, ExternalLink } from "lucide-react";
import { TOOLS_BY_MODULE } from "../registry/toolRegistry";
import { getToolIcon, getToolAccent } from "../registry/toolPresentation";
import { usePersonalization } from "../personalization/PersonalizationContext";
import { cn } from "@shared/lib/format";

/* 도구 라이브러리 — 전체 모듈의 등록 가능한 도구를 한눈에 보고 고정/해제.
   레지스트리(toolRegistry)에 모듈이 추가되면 자동으로 이 목록에 나타난다. */
export function ToolLibrary({ onClose }) {
  const { isPinned, togglePin } = usePersonalization();

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />

      <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5">
          <div>
            <h2 className="text-[15px] font-bold text-slate-900">도구 라이브러리</h2>
            <p className="mt-0.5 text-[11px] text-slate-500">
              자주 쓰는 도구를 대시보드에 고정하세요 · 모듈이 늘어나면 여기에 자동 추가됩니다
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="닫기"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {TOOLS_BY_MODULE.map(({ module, tools }) => {
            const accent = getToolAccent(module.accent);
            /* 소그룹(세일즈 계산기 / 상담 지원 등) 단위로 묶어 표시 */
            const groups = [...new Set(tools.map((t) => t.group))];
            return (
              <div key={module.id} className="mb-5 last:mb-0">
                <div className="mb-2.5 flex items-center gap-2">
                  <span className={cn("rounded-sm px-2 py-0.5 text-[11px] font-bold", accent.chip)}>
                    {module.name}
                  </span>
                  <span className="text-[11px] text-slate-400">{tools.length}개 도구</span>
                </div>

                {groups.map((group) => (
                  <div key={group} className="mb-3 last:mb-0">
                    <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {group}
                    </div>
                    <ul className="space-y-1.5">
                      {tools
                        .filter((t) => t.group === group)
                        .map((tool) => {
                          const Icon = getToolIcon(tool.icon);
                          const pinned = isPinned(tool.id);
                          return (
                            <li
                              key={tool.id}
                              className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5"
                            >
                              <div className={cn("flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md", accent.icon)}>
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="truncate text-[13px] font-semibold text-slate-900">
                                  {tool.name}
                                </div>
                                <div className="truncate text-[11px] text-slate-500">{tool.desc}</div>
                              </div>
                              <Link
                                to={tool.to}
                                onClick={onClose}
                                title="바로 열기"
                                className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Link>
                              <button
                                onClick={() => togglePin(tool.id)}
                                className={cn(
                                  "inline-flex w-[4.5rem] items-center justify-center gap-1 rounded-md border px-2 py-1.5 text-[11px] font-semibold transition-colors",
                                  pinned
                                    ? "border-im-500 bg-im-500 text-white hover:bg-im-600"
                                    : "border-slate-300 bg-white text-slate-600 hover:border-im-400 hover:text-im-700"
                                )}
                              >
                                {pinned ? <Check className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
                                {pinned ? "고정됨" : "고정"}
                              </button>
                            </li>
                          );
                        })}
                    </ul>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
