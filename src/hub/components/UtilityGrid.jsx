import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ALL_TOOLS } from "../registry/toolRegistry";
import { getToolIcon, getToolAccent } from "../registry/toolPresentation";

/* 보조 도구 섹션 — 특정 상품에 매이지 않고 창구 업무 전반에서 쓰는 도구.
   목록은 도구 레지스트리에서 가져오므로 보조 도구 매니페스트에 항목을 추가하면
   여기에도 자동으로 나타난다. (상품 상담 섹션과 성격이 달라 별도 섹션으로 둔다) */
export function UtilityGrid() {
  const tools = ALL_TOOLS.filter((t) => t.moduleId === "utility");
  if (!tools.length) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {tools.map((tool) => {
        const Icon = getToolIcon(tool.icon);
        const accent = getToolAccent(tool.accent);
        return (
          <Link
            key={tool.id}
            to={tool.to}
            className="group flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md"
          >
            <div
              className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg shadow-sm transition-transform group-hover:scale-105 ${accent.icon}`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[14px] font-bold text-slate-900">{tool.name}</div>
              <p className="mt-0.5 text-[11.5px] leading-relaxed text-slate-500">{tool.desc}</p>
            </div>
            <ArrowRight className="mt-1 h-4 w-4 flex-shrink-0 text-slate-200 transition-colors group-hover:text-sky-500" />
          </Link>
        );
      })}
    </div>
  );
}
