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
  QrCode,
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
  QrCode,
};

export const getToolIcon = (name) => TOOL_ICONS[name] ?? Wrench;

/* 모듈 아이덴티티 컬러(accent 키) → 정적 Tailwind 클래스.
   ProductGrid의 ACCENT와 같은 원칙 — 동적 클래스 조합은 purge에 잡히지 않으므로 금지 */
/* 프로페셔널 톤: 채도 높은 그라디언트 대신 옅은 틴트 + 같은 색 플랫 아이콘.
   MyTools 타일·UtilityGrid 카드가 이 icon 클래스를 공유한다. */
export const TOOL_ACCENT = {
  amber: { chip: "bg-amber-100 text-amber-800", icon: "bg-amber-50 text-amber-700" },
  rose: { chip: "bg-rose-100 text-rose-800", icon: "bg-rose-50 text-rose-700" },
  violet: { chip: "bg-violet-100 text-violet-800", icon: "bg-violet-50 text-violet-700" },
  sky: { chip: "bg-sky-100 text-sky-800", icon: "bg-sky-50 text-sky-700" },
};

export const getToolAccent = (accent) => TOOL_ACCENT[accent] ?? TOOL_ACCENT.sky;
