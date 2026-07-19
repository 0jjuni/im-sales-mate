import { useState } from "react";
import { Home, LayoutGrid, Library, Building2 } from "lucide-react";
import { cn } from "@shared/lib/format";

/* 서비스명 미정 — 확정되면 이 상수만 변경하면 전체에 반영된다. */
export const HUB_NAME = "SalesBridge";
export const HUB_SUBTITLE = "PB·VM 상품 상담 허브";

/* 허브 네비게이션 — 홈은 단일 페이지 스크롤이므로 섹션 앵커로 이동.
   지식 라이브러리 등이 별도 라우트로 분리되면 여기서 라우트로 교체. */
const NAV_ITEMS = [
  { id: "top", label: "홈", icon: Home },
  { id: "products", label: "상품 모듈", icon: LayoutGrid },
  { id: "knowledge", label: "지식 라이브러리", icon: Library },
];

const scrollToSection = (id) => {
  if (id === "top") {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
};

const Brand = () => (
  <div className="flex items-center gap-2.5">
    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-im-500 to-im-700 shadow-sm">
      <Building2 className="h-5 w-5 text-white" />
    </div>
    <div className="min-w-0 leading-tight">
      <div className="text-[14px] font-black text-slate-900">{HUB_NAME}</div>
      <div className="text-[10px] text-slate-500">{HUB_SUBTITLE}</div>
    </div>
  </div>
);

const NavTabs = ({ active, onSelect, className }) => (
  <nav className={cn("flex items-center gap-1", className)}>
    {NAV_ITEMS.map((item) => {
      const Icon = item.icon;
      const isActive = active === item.id;
      return (
        <a
          key={item.id}
          href={`#${item.id}`}
          onClick={(e) => {
            e.preventDefault();
            onSelect(item.id);
          }}
          className={cn(
            "flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors",
            isActive
              ? "bg-im-50 text-im-700"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          )}
        >
          <Icon className="h-4 w-4" />
          {item.label}
        </a>
      );
    })}
  </nav>
);

export function HubShell({ children }) {
  const [active, setActive] = useState("top");

  const go = (id) => {
    setActive(id);
    scrollToSection(id);
  };

  return (
    <div
      className="min-h-screen bg-slate-50 text-slate-900"
      style={{ fontFamily: "'Noto Sans KR', 'Pretendard', system-ui, sans-serif" }}
    >
      {/* 상단바 — 사이드바 대신 헤더 네비게이션.
          민트 상단 스트립으로 브랜드 아이덴티티를 살짝 얹는다. */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="h-1 bg-gradient-to-r from-im-500 via-im-400 to-im-lime" />
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <div className="flex h-14 items-center justify-between gap-4">
            <Brand />
            {/* 데스크톱: 우측 인라인 탭 */}
            <NavTabs active={active} onSelect={go} className="hidden md:flex" />
          </div>
          {/* 모바일: 하단 가로 스크롤 탭 */}
          <NavTabs
            active={active}
            onSelect={go}
            className="-mx-1 overflow-x-auto pb-2 md:hidden"
          />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">{children}</main>
    </div>
  );
}
