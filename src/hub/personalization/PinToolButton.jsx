import { Pin, PinOff } from "lucide-react";
import { usePersonalization } from "./PersonalizationContext";
import { cn } from "@shared/lib/format";

/* 상품 모듈 화면에서 현재 도구를 허브 대시보드에 고정/해제하는 버튼.
   모듈은 toolId만 넘기면 되고, 상태·저장은 개인화 컨텍스트가 처리한다.
   중립(stone) 톤이라 어떤 모듈 테마 위에서도 어울린다. */
export function PinToolButton({ toolId, className }) {
  const { isPinned, togglePin } = usePersonalization();
  const pinned = isPinned(toolId);

  return (
    <button
      onClick={() => togglePin(toolId)}
      title={pinned ? "허브 대시보드에서 해제" : "허브 대시보드에 고정"}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors print:hidden",
        pinned
          ? "border-stone-800 bg-stone-900 text-white hover:bg-stone-700"
          : "border-stone-300 bg-white text-stone-600 hover:border-stone-400 hover:text-stone-900",
        className
      )}
    >
      {pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
      {pinned ? "대시보드에 고정됨" : "대시보드에 고정"}
    </button>
  );
}
