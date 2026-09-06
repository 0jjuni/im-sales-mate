import {
  Sunrise,
  TrendingUp,
  MessageSquare,
  Lightbulb,
  Newspaper,
  BarChart3,
  FileText,
  Landmark,
  CalendarDays,
  Globe,
  ShieldCheck,
  Receipt,
  PieChart,
  Coins,
} from "lucide-react";
import { cn } from "@shared/lib/format";

/* 지식 라이브러리 채널 아이덴티티 — 이모지 대신 정제된 아이콘 + 강조색(엔터프라이즈 톤).
   Tailwind 정적 클래스라 색은 맵으로 보관한다. LibraryPage·LibraryBoard·알림에서 공용. */

export const CHANNEL_ICONS = {
  sunrise: Sunrise,
  trending: TrendingUp,
  comment: MessageSquare,
  lightbulb: Lightbulb,
  news: Newspaper,
  chart: BarChart3,
  file: FileText,
  landmark: Landmark,
  calendar: CalendarDays,
  globe: Globe,
  shield: ShieldCheck,
  receipt: Receipt,
  pie: PieChart,
  coins: Coins,
};

/* 채널 만들기 아이콘 선택 순서 */
export const CHANNEL_ICON_LIST = [
  "sunrise",
  "trending",
  "comment",
  "lightbulb",
  "news",
  "chart",
  "file",
  "landmark",
  "receipt",
  "pie",
  "coins",
  "globe",
  "shield",
  "calendar",
];

export const CHANNEL_COLORS = {
  im: { bg: "bg-im-50", tx: "text-im-600", dot: "bg-im-500", ring: "ring-im-500" },
  blue: { bg: "bg-blue-50", tx: "text-blue-600", dot: "bg-blue-500", ring: "ring-blue-500" },
  violet: { bg: "bg-violet-50", tx: "text-violet-600", dot: "bg-violet-500", ring: "ring-violet-500" },
  amber: { bg: "bg-amber-50", tx: "text-amber-600", dot: "bg-amber-500", ring: "ring-amber-500" },
  rose: { bg: "bg-rose-50", tx: "text-rose-600", dot: "bg-rose-500", ring: "ring-rose-500" },
  teal: { bg: "bg-teal-50", tx: "text-teal-600", dot: "bg-teal-500", ring: "ring-teal-500" },
  emerald: { bg: "bg-emerald-50", tx: "text-emerald-600", dot: "bg-emerald-500", ring: "ring-emerald-500" },
  slate: { bg: "bg-slate-100", tx: "text-slate-600", dot: "bg-slate-500", ring: "ring-slate-500" },
};

export const CHANNEL_COLOR_LIST = ["im", "blue", "violet", "amber", "rose", "teal", "emerald", "slate"];

const DIM = { sm: "h-9 w-9", md: "h-11 w-11", lg: "h-12 w-12" };
const ISZ = { sm: "h-4 w-4", md: "h-5 w-5", lg: "h-6 w-6" };

export function ChannelAvatar({ icon, color, size = "md", className }) {
  const Icon = CHANNEL_ICONS[icon] || Newspaper;
  const c = CHANNEL_COLORS[color] || CHANNEL_COLORS.slate;
  return (
    <div className={cn("flex flex-shrink-0 items-center justify-center rounded-xl", DIM[size], c.bg, className)}>
      <Icon className={cn(ISZ[size], c.tx)} />
    </div>
  );
}
