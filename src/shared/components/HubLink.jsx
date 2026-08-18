import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import { cn } from "@shared/lib/format";

/* 허브 대시보드로 돌아가는 버튼.
   모듈 안에서 길을 잃지 않도록 모든 화면에 같은 자리·같은 모양으로 둔다.
   모바일에서는 사이드바가 드로어라 드로어를 열지 않고도 돌아갈 수 있어야 해서
   상단바에도 같은 버튼을 노출한다. */
export const HubLink = ({ compact = false, className }) => (
  <Link
    to="/"
    title="허브 대시보드로"
    className={cn(
      "inline-flex flex-shrink-0 items-center gap-1.5 rounded-md border border-slate-300 bg-white font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50",
      compact ? "px-2 py-1.5 text-[12px]" : "w-full justify-center px-3 py-2 text-[12.5px]",
      className
    )}
  >
    <Home className="h-3.5 w-3.5" />
    허브
    {!compact && <span className="text-slate-400">대시보드</span>}
  </Link>
);
