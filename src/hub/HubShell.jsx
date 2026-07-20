import { useState } from "react";
import { Home, Building2, Settings2, Check } from "lucide-react";
import { cn } from "@shared/lib/format";

/* 서비스명 미정 — 확정되면 이 상수만 변경하면 전체에 반영된다. */
export const HUB_NAME = "SalesBridge";
export const HUB_SUBTITLE = "PB·VM 상품 상담 허브";

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

const NavTabs = ({ items, active, onSelect, className }) => (
  <nav className={cn("flex items-center gap-1", className)}>
    {items.map((item) => {
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

/* navSections: 표시 중인 섹션 중 nav:true인 것들(개인화 반영) — HubHome이 내려준다 */
export function HubShell({ children, navSections = [], editMode = false, onToggleEdit }) {
  const [active, setActive] = useState("top");

  const navItems = [{ id: "top", label: "홈", icon: Home }, ...navSections];

  const go = (id) => {
    setActive(id);
    scrollToSection(id);
  };

  const editButton = onToggleEdit && (
    <button
      onClick={onToggleEdit}
      className={cn(
        "flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border px-3 py-1.5 text-[12px] font-semibold transition-colors",
        editMode
          ? "border-im-500 bg-im-500 text-white hover:bg-im-600"
          : "border-slate-300 bg-white text-slate-600 hover:border-im-400 hover:text-im-700"
      )}
    >
      {editMode ? <Check className="h-3.5 w-3.5" /> : <Settings2 className="h-3.5 w-3.5" />}
      {editMode ? "편집 완료" : "대시보드 편집"}
    </button>
  );

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
            {/* 데스크톱: 우측 인라인 탭 + 편집 버튼 */}
            <div className="hidden items-center gap-2 md:flex">
              <NavTabs items={navItems} active={active} onSelect={go} />
              {editButton}
            </div>
            {/* 모바일: 편집 버튼만 우측 상단 */}
            <div className="md:hidden">{editButton}</div>
          </div>
          {/* 모바일: 하단 가로 스크롤 탭 */}
          <NavTabs
            items={navItems}
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
