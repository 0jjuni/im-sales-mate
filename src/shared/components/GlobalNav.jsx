import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, Menu, X } from "lucide-react";
import { IMSymbol } from "@hub/components/IMSymbol";
import { NotificationBell } from "@hub/components/NotificationBell";
import { cn } from "@shared/lib/format";

/* 글로벌 상단 네비게이션 — 모든 화면 공통 뼈대.
   모듈 항목은 호버 시 하위 메뉴(드롭다운)로 각 화면에 바로 진입한다.
   taste-skill 네비 규율: 데스크톱 한 줄 · 높이 ≤72px · 민트 단일 강조 · 현재 위치 하이라이트. */

const NAV = [
  { to: "/", label: "홈" },
  { to: "/tax", label: "고객 진단" },
  {
    to: "/wealth",
    label: "투자상품",
    children: [
      { to: "/wealth", label: "홈" },
      { to: "/wealth?tab=fund", label: "상품 탐색" },
      { to: "/wealth?tab=customers", label: "내 가입고객 관리" },
      { to: "/wealth?tab=faq", label: "FAQ" },
      { to: "/wealth?tab=notices", label: "공지사항" },
    ],
  },
  {
    to: "/noran",
    label: "노란우산",
    children: [
      { to: "/noran", label: "홈" },
      { to: "/noran/intro", label: "5분 입문" },
      { to: "/noran/simulator", label: "상담 시뮬레이터" },
      { to: "/noran/calculator", label: "계산기" },
      { to: "/noran/guide", label: "업무별 가이드" },
      { to: "/noran/checklist", label: "구비서류 체크리스트" },
      { to: "/noran/faq", label: "FAQ" },
      { to: "/noran/notices", label: "공지사항" },
    ],
  },
  {
    to: "/isa",
    label: "ISA",
    children: [
      { to: "/isa", label: "홈" },
      { to: "/isa/calculator", label: "세제 절세 계산기" },
      { to: "/isa/faq", label: "FAQ" },
      { to: "/isa/notices", label: "공지사항" },
    ],
  },
  {
    to: "/pension",
    label: "연금",
    children: [
      { to: "/pension", label: "홈" },
      { to: "/pension/calculator", label: "세액공제 계산기" },
      { to: "/pension/faq", label: "FAQ" },
      { to: "/pension/notices", label: "공지사항" },
    ],
  },
  {
    to: "/card",
    label: "카드",
    children: [
      { to: "/card", label: "카드 탐색" },
      { to: "/card/promo", label: "가입 QR" },
      { to: "/card/deduction", label: "소득공제" },
      { to: "/card/notices", label: "공지사항" },
    ],
  },
  {
    to: "/tools",
    label: "보조도구",
    children: [
      { to: "/tools", label: "홈" },
      { to: "/tools/name", label: "영문 이름 변환기" },
      { to: "/tools/address", label: "영문 주소 변환기" },
      { to: "/tools/qr", label: "QR코드 생성기" },
    ],
  },
  { to: "/news", label: "뉴스" },
  { to: "/library", label: "지식 라이브러리" },
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
      <div className="absolute left-0 top-full z-40 hidden pt-2 group-hover:block group-focus-within:block">
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
  const { pathname, search } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);
  useEffect(() => setMenuOpen(false), [pathname, search]);
  useEffect(() => {
    const dialog = menuRef.current;
    if (!menuOpen) { if (dialog?.open) dialog.close(); return; }
    dialog.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const wide = window.matchMedia("(min-width: 1280px)");
    const closeOnWide = () => { if (wide.matches) setMenuOpen(false); };
    wide.addEventListener("change", closeOnWide);
    return () => { document.body.style.overflow = previous; wide.removeEventListener("change", closeOnWide); if (dialog.open) dialog.close(); menuButtonRef.current?.focus(); };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur print:hidden">
      <div className="h-1 bg-gradient-to-r from-im-500 via-im-400 to-im-lime" />
      <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center gap-2 px-4 md:gap-3 md:px-8">
        {/* 로고 = 홈 대시보드로 */}
        <Link
          to="/"
          title="홈 대시보드로"
          className="flex flex-shrink-0 items-center gap-2 rounded-md transition-opacity hover:opacity-80"
        >
          <IMSymbol className="h-7 w-11 flex-shrink-0" />
          <span className="whitespace-nowrap text-[14px] font-black leading-none text-slate-900">
            iM<span className="text-im-600"> 세일즈메이트</span>
          </span>
        </Link>

        {/* PC 주 메뉴 — 좁은 화면에서는 전체 메뉴 버튼 사용 */}
        <nav aria-label="주 메뉴" className="hidden min-w-0 flex-1 items-center gap-0 xl:flex">
          {NAV.map((item) => (
            <NavItem key={item.to} item={item} pathname={pathname} />
          ))}
        </nav>

        {/* 우측 — 알림 벨(공통) + 페이지별 액션 슬롯 */}
        <div className="ml-auto flex flex-shrink-0 items-center gap-2">
          <NotificationBell />
          <div className="hidden xl:block">{right}</div>
          <button ref={menuButtonRef} type="button" aria-label="전체 메뉴 열기" aria-haspopup="dialog" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)} className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 text-slate-700 xl:hidden"><Menu className="h-5 w-5" /></button>
        </div>
      </div>
      <dialog ref={menuRef} aria-labelledby="mobile-menu-title" onCancel={() => setMenuOpen(false)} onClose={() => setMenuOpen(false)} onClick={e => { if (e.target === e.currentTarget) setMenuOpen(false); }} className="mobile-menu m-0 ml-auto h-dvh max-h-none w-full max-w-md border-0 bg-white p-0 backdrop:bg-slate-900/40">
        <div className="flex h-full flex-col">
          <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3"><h2 id="mobile-menu-title" className="font-bold text-slate-900">전체 메뉴</h2><div className="flex items-center gap-2">{right}<button type="button" autoFocus aria-label="전체 메뉴 닫기" onClick={() => setMenuOpen(false)} className="flex h-11 w-11 items-center justify-center rounded-lg hover:bg-slate-100"><X className="h-5 w-5" /></button></div></div>
          <nav aria-label="모바일 전체 메뉴" className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 pb-8">
            {NAV.map(item => item.children ? <details key={item.to} open={isActive(pathname,item.to)} className="mb-2 rounded-xl border border-slate-200">
              <summary className={cn("cursor-pointer px-4 py-3 text-base font-semibold",isActive(pathname,item.to) && "text-im-700 bg-im-50")}>{item.label}</summary>
              <div className="grid grid-cols-2 gap-1 p-2">{item.children.map(child => <Link key={child.to} to={child.to} onClick={() => setMenuOpen(false)} aria-current={pathname+search === child.to ? "page" : undefined} className="flex min-h-11 items-center rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 aria-[current=page]:bg-im-50 aria-[current=page]:text-im-700">{child.label}</Link>)}</div>
            </details> : <Link key={item.to} to={item.to} onClick={() => setMenuOpen(false)} aria-current={pathname === item.to ? "page" : undefined} className="mb-2 flex min-h-12 items-center rounded-xl border border-slate-200 px-4 text-base font-semibold text-slate-700 aria-[current=page]:bg-im-50 aria-[current=page]:text-im-700">{item.label}</Link>)}
          </nav>
        </div>
      </dialog>
    </header>
  );
}
