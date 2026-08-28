import { Star } from "lucide-react";
import { usePersonalization } from "./PersonalizationContext";
import { cn } from "@shared/lib/format";

/* 현재 도구를 홈 「내 도구」에 추가/제거하는 즐겨찾기 버튼.
   모듈은 toolId만 넘기면 되고, 상태·저장은 개인화 컨텍스트가 처리한다. */
export function PinToolButton({ toolId, className }) {
  const { isPinned, togglePin } = usePersonalization();
  const pinned = isPinned(toolId);

  return (
    <button
      onClick={() => togglePin(toolId)}
      title={pinned ? "홈 「내 도구」에서 빼기" : "이 도구를 홈 「내 도구」에 추가"}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors print:hidden",
        pinned
          ? "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100"
          : "border-slate-300 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-900",
        className
      )}
    >
      <Star className={cn("h-3.5 w-3.5", pinned && "fill-amber-400 text-amber-400")} />
      {pinned ? "내 도구에 추가됨" : "내 도구에 추가"}
    </button>
  );
}
