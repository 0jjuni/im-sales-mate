import { useState, useEffect } from "react";
import {
  Home,
  LayoutGrid,
  Library,
  Menu,
  X,
  Building2,
} from "lucide-react";
import { cn } from "@shared/lib/format";

/* 서비스명 미정 — 확정되면 이 상수만 변경하면 전체에 반영된다. */
export const HUB_NAME = "SalesBridge";
export const HUB_SUBTITLE = "PB·VM 상품 상담 허브";

/* 허브 네비게이션 — 홈은 단일 페이지 스크롤이므로 섹션 앵커로 이동.
   지식 라이브러리 등이 별도 라우트로 분리되면 여기서 to/href를 라우트로 교체. */
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
    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-sky-500 to-blue-700 shadow-sm">
      <Building2 className="h-5 w-5 text-white" />
    </div>
    <div className="min-w-0">
      <div className="text-[13px] font-black leading-tight text-slate-900">
        {HUB_NAME}
      </div>
      <div className="mt-0.5 text-[10px] leading-tight text-slate-500">
        {HUB_SUBTITLE}
      </div>
    </div>
  </div>
);

export function HubShell({ children }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [active, setActive] = useState("top");

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e) => e.key === "Escape" && setDrawerOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  const go = (id) => {
    setActive(id);
    scrollToSection(id);
    setDrawerOpen(false);
  };

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between gap-2 border-b border-slate-200 p-4">
        <Brand />
        <button
          onClick={() => setDrawerOpen(false)}
          className="flex-shrink-0 rounded-sm p-1.5 hover:bg-slate-100 md:hidden"
          aria-label="메뉴 닫기"
        >
          <X className="h-5 w-5 text-slate-600" />
        </button>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                go(item.id);
              }}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-sm px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-blue-700 font-semibold text-white"
                  : "text-slate-700 hover:bg-slate-100"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="flex-1 text-left">{item.label}</span>
            </a>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-3">
        <div className="rounded-sm border border-blue-100 bg-blue-50/60 p-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
            안내
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
            내부 영업 지원 도구입니다. 시황·수치는 참고용이며 투자권유가 아닙니다.
          </p>
        </div>
        <div className="mt-2 px-1 text-center text-[9px] text-slate-400">
          {HUB_NAME} · 내부 전용 (베타)
        </div>
      </div>
    </>
  );

  return (
    <div
      className="min-h-screen bg-slate-50 text-slate-900"
      style={{ fontFamily: "'Noto Sans KR', 'Pretendard', system-ui, sans-serif" }}
    >
      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white px-3 py-2 md:hidden">
        <button
          onClick={() => setDrawerOpen(true)}
          className="rounded-sm p-1.5 hover:bg-slate-100"
          aria-label="메뉴 열기"
        >
          <Menu className="h-5 w-5 text-slate-700" />
        </button>
        <div className="min-w-0 flex-1">
          <Brand />
        </div>
      </header>

      <div className="md:flex">
        {drawerOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
        )}

        <aside
          className={cn(
            "flex flex-col border-r border-slate-200 bg-white",
            "md:static md:min-h-screen md:w-60 md:translate-x-0",
            "fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] transform transition-transform duration-200 ease-out",
            drawerOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          )}
        >
          {sidebarContent}
        </aside>

        <main className="min-h-screen min-w-0 flex-1">
          <div className="mx-auto max-w-6xl p-4 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
