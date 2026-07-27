import {
  Coins,
  TrendingDown,
  Scale,
  MessageSquare,
  CheckSquare,
  HelpCircle,
  Percent,
  UserRound,
  MapPin,
  Wrench,
} from "lucide-react";

/* 도구 매니페스트의 icon(문자열) → lucide 컴포넌트 매핑.
   새 모듈 도구가 새 아이콘을 쓰면 여기에 추가한다. */
const TOOL_ICONS = {
  Coins,
  TrendingDown,
  Scale,
  MessageSquare,
  CheckSquare,
  HelpCircle,
  Percent,
  UserRound,
  MapPin,
};

export const getToolIcon = (name) => TOOL_ICONS[name] ?? Wrench;

/* 모듈 아이덴티티 컬러(accent 키) → 정적 Tailwind 클래스.
   ProductGrid의 ACCENT와 같은 원칙 — 동적 클래스 조합은 purge에 잡히지 않으므로 금지 */
export const TOOL_ACCENT = {
  amber: { chip: "bg-amber-100 text-amber-800", icon: "bg-gradient-to-br from-amber-400 to-yellow-500 text-white" },
  emerald: { chip: "bg-emerald-100 text-emerald-800", icon: "bg-gradient-to-br from-emerald-400 to-teal-500 text-white" },
  violet: { chip: "bg-violet-100 text-violet-800", icon: "bg-gradient-to-br from-violet-400 to-purple-500 text-white" },
  sky: { chip: "bg-sky-100 text-sky-800", icon: "bg-gradient-to-br from-sky-400 to-blue-500 text-white" },
};

export const getToolAccent = (accent) => TOOL_ACCENT[accent] ?? TOOL_ACCENT.sky;
