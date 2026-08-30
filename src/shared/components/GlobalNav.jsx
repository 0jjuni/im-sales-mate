import { Link, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { IMSymbol } from "@hub/components/IMSymbol";
import { cn } from "@shared/lib/format";

/* 글로벌 상단 네비게이션 — 모든 화면 공통 뼈대.
   모듈 항목은 호버 시 하위 메뉴(드롭다운)로 각 화면에 바로 진입한다.
   taste-skill 네비 규율: 데스크톱 한 줄 · 높이 ≤72px · 민트 단일 강조 · 현재 위치 하이라이트. */

const NAV = [
  { to: "/", label: "홈" },
  { to: "/tax", label: "종합과세" },
  {
    to: "/wealth",
    label: "투자상품",
    children: [
      { to: "/wealth", label: "상품 탐색" },
      { to: "/wealth?tab=customers", label: "내 가입 고객" },
    ],
  },
  {
    to: "/noran",
    label: "노란우산",
    children: [
      { to: "/noran", label: "대시보드" },
      { to: "/noran/intro", label: "5분 입문" },
      { to: "/noran/simulator", label: "상담 시뮬레이터" },
      { to: "/noran/calculator", label: "계산기" },
      { to: "/noran/guide", label: "업무별 가이드" },
      { to: "/noran/checklist", label: "구비서류 체크리스트" },
      { to: "/noran/faq", label: "FAQ 검색" },
    ],
  },
  {
    to: "/isa",
    label: "ISA",
    children: [
      { to: "/isa", label: "세제 한눈에" },
      { to: "/isa/calculator", label: "세제 절세 계산기" },
      { to: "/isa/faq", label: "FAQ" },
    ],
  },
  {
    to: "/pension",
    label: "연금",
    children: [
      { to: "/pension", label: "세제 한눈에" },
      { to: "/pension/calculator", label: "세액공제 계산기" },
      { to: "/pension/faq", label: "FAQ" },
    ],
  },
  {
    to: "/card",
    label: "카드",
    children: [
      { to: "/card", label: "카드 탐색" },
      { to: "/card/promo", label: "가입 안내문" },
    ],
  },
  {
    to: "/tools",
    label: "보조도구",
    children: [
      { to: "/tools", label: "홈" },
      { to: "/tools/name", label: "영문 이름 변환기" },
      { to: "/tools/address", label: "영문 주소 변환기" },
      { to: "/tools/qr", label: "링크 QR 변환기" },
    ],
  },
  { to: "/news", label: "뉴스" },
  { to: "/followups", label: "일정 관리" },
];

const isActive = (pathname, to) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

const NavItem = ({ item, pathname }) => {
  const active = isActive(pathname, item.to);
  const base = cn(
    "whitespace-nowrap rounded-md px-3 py-1.5 text-[13px] font-semibold transition-colors",
    active ? "bg-im-50 text-im-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  );

  if (!item.children) {
    return (
      <Link to={item.to} className={base}>
        {item.label}
      </Link>
    );
  }

  return (
    <div className="group relative">
      <Link to={item.to} className={cn(base, "inline-flex items-center gap-0.5")}>
        {item.label}
        <ChevronDown className="h-3 w-3 opacity-50 transition-transform group-hover:rotate-180" />
      </Link>
      {/* 드롭다운 — 호버/포커스 시. pt-2가 항목-패널 사이 마우스 다리 역할 */}
      <div className="pointer-events-none absolute left-0 top-full z-40 pt-2 opacity-0 transition duration-150 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100 motion-reduce:transition-none">
        <div className="min-w-[11rem] rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg shadow-slate-900/5">
          {item.children.map((c) => {
            const cActive = pathname + (typeof window !== "undefined" ? window.location.search : "") === c.to || pathname === c.to;
            return (
              <Link
                key={c.to}
                to={c.to}
                className={cn(
                  "block rounded-md px-3 py-2 text-[13px] transition-colors",
                  cActive ? "bg-im-50 font-semibold text-im-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                {c.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
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

        {/* 주 메뉴 — 좁으면 가로 스크롤, lg↑에서는 드롭다운이 잘리지 않도록 overflow-visible */}
        <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto lg:overflow-visible">
          {NAV.map((item) => (
            <NavItem key={item.to} item={item} pathname={pathname} />
          ))}
        </nav>

        {/* 우측 — 페이지별 액션 슬롯 */}
        {right && <div className="flex flex-shrink-0 items-center gap-2">{right}</div>}
      </div>
    </header>
  );
}
