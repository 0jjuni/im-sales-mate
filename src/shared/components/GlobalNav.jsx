import { Link, useLocation } from "react-router-dom";
import { CalendarDays } from "lucide-react";
import { IMSymbol } from "@hub/components/IMSymbol";
import { cn } from "@shared/lib/format";

/* 글로벌 상단 네비게이션 — 모든 화면 공통 뼈대.
   "지금 어디 있고, 어디로 갈 수 있나"를 항상 보여 주고, 모듈 간 직접 이동을 연다.
   홈(대시보드)은 커스텀 유지, 이 바는 그 위의 고정 길잡이 역할.

   taste-skill 네비 규율: 데스크톱 한 줄 · 높이 ≤72px · 민트 단일 강조 · 현재 위치 하이라이트.
   좁은 화면에서는 메뉴가 가로 스크롤된다. right 슬롯에 페이지별 액션(예: 대시보드 편집)을 넣는다. */

const NAV = [
  { to: "/", label: "홈" },
  { to: "/noran", label: "노란우산" },
  { to: "/isa", label: "ISA" },
  { to: "/pension", label: "연금" },
  { to: "/tools", label: "보조도구" },
  { to: "/followups", label: "고객 관리" },
];

const isActive = (pathname, to) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

const TodayBadge = () => {
  const now = new Date();
  const day = ["일", "월", "화", "수", "목", "금", "토"][now.getDay()];
  return (
    <span className="hidden items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1.5 text-[11px] font-semibold text-slate-500 lg:inline-flex">
      <CalendarDays className="h-3.5 w-3.5" />
      {now.getMonth() + 1}. {now.getDate()} ({day})
    </span>
  );
};

export function GlobalNav({ right = null }) {
  const { pathname } = useLocation();
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur print:hidden">
      <div className="h-1 bg-gradient-to-r from-im-500 via-im-400 to-im-lime" />
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 md:gap-5 md:px-8">
        {/* 로고 = 홈 대시보드로 */}
        <Link
          to="/"
          title="홈 대시보드로"
          className="flex flex-shrink-0 items-center gap-2 rounded-md transition-opacity hover:opacity-80"
        >
          <IMSymbol className="h-7 w-11 flex-shrink-0" />
          <span className="hidden whitespace-nowrap text-[14px] font-black leading-none text-slate-900 sm:block">
            iM<span className="text-im-600"> 세일즈메이트</span>
          </span>
        </Link>

        {/* 주 메뉴 — 좁으면 가로 스크롤 */}
        <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
          {NAV.map((item) => {
            const active = isActive(pathname, item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "whitespace-nowrap rounded-md px-3 py-1.5 text-[13px] font-semibold transition-colors",
                  active
                    ? "bg-im-50 text-im-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* 우측 — 날짜 + 페이지별 액션 슬롯 */}
        <div className="flex flex-shrink-0 items-center gap-2">
          <TodayBadge />
          {right}
        </div>
      </div>
    </header>
  );
}
