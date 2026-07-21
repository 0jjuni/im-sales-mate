import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Home, Percent, HelpCircle, Menu, X, PiggyBank } from "lucide-react";
import { usePersonalization } from "@hub/personalization/PersonalizationContext";
import { PinToolButton } from "@hub/personalization/PinToolButton";
import { findToolByPath } from "@hub/registry/toolRegistry";
import { cn } from "@shared/lib/format";
import { Overview } from "./pages/Overview";
import { CalculatorPage } from "./pages/CalculatorPage";
import { FaqPage } from "./pages/FaqPage";

/* ISA 모듈 셸 — 노란과 동일한 셸 패턴(사이드바 + 경로 라우팅)에 emerald 아이덴티티.
   상위 라우터의 "/isa/*"에 마운트. */

const NAV_ITEMS = [
  { id: "overview", label: "세제 한눈에", icon: Home },
  { id: "calculator", label: "세제 절세 계산기", icon: Percent, highlight: true },
  { id: "faq", label: "FAQ", icon: HelpCircle },
];

const VALID_PAGES = NAV_ITEMS.map((i) => i.id);

const parseSplat = (splat) => {
  const raw = (splat || "").replace(/^\/+|\/+$/g, "");
  if (!raw) return { page: "overview", sub: null };
  const [page, ...rest] = raw.split("/");
  return { page, sub: rest.join("/") || null };
};

const buildPath = (page) => `/isa/${page}`;

const Brand = () => (
  <div className="flex items-center gap-2.5">
    <div className="relative w-9 h-9 flex-shrink-0">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-300 to-teal-500 rounded-md transform rotate-3" />
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-md flex items-center justify-center shadow-sm">
        <PiggyBank className="w-5 h-5 text-white" />
      </div>
    </div>
    <div className="min-w-0">
      <div className="text-[13px] font-black text-stone-900 leading-tight">
        ISA 상담 가이드
      </div>
      <div className="text-[10px] text-stone-500 leading-tight mt-0.5">
        개인종합자산관리계좌 · 데모
      </div>
    </div>
  </div>
);

const normalizeRoute = (r) =>
  VALID_PAGES.includes(r.page) ? r : { page: "overview", sub: null };

export default function IsaApp() {
  const routerNavigate = useNavigate();
  const params = useParams();
  const route = normalizeRoute(parseSplat(params["*"]));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { page } = route;

  const { recordToolVisit } = usePersonalization();
  const currentTool = findToolByPath(buildPath(page));
  const currentToolId = currentTool?.id ?? null;

  useEffect(() => {
    if (currentToolId) recordToolVisit(currentToolId);
  }, [currentToolId, recordToolVisit]);

  useEffect(() => {
    const prev = document.title;
    document.title = "ISA 상담 가이드 · iM 세일즈메이트";
    return () => {
      document.title = prev;
    };
  }, []);

  const navigate = (p) => {
    routerNavigate(buildPath(p));
    setDrawerOpen(false);
  };

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e) => e.key === "Escape" && setDrawerOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  const renderPage = () => {
    switch (page) {
      case "overview":
        return <Overview onNavigate={navigate} />;
      case "calculator":
        return <CalculatorPage />;
      case "faq":
        return <FaqPage />;
      default:
        return <Overview onNavigate={navigate} />;
    }
  };

  const sidebarContent = (
    <>
      <div className="p-4 border-b border-stone-200 space-y-3">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-[10px] font-semibold text-stone-400 hover:text-stone-700 transition-colors"
        >
          ← 허브 대시보드
        </Link>
        <div className="flex items-center justify-between gap-2">
          <Brand />
          <button
            onClick={() => setDrawerOpen(false)}
            className="md:hidden p-1.5 hover:bg-stone-100 rounded-sm flex-shrink-0"
            aria-label="메뉴 닫기"
          >
            <X className="w-5 h-5 text-stone-600" />
          </button>
        </div>
      </div>
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = page === item.id;
          return (
            <a
              key={item.id}
              href={buildPath(item.id)}
              onClick={(e) => {
                e.preventDefault();
                navigate(item.id);
              }}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-sm transition-colors relative",
                isActive
                  ? "bg-stone-900 text-white font-semibold"
                  : item.highlight
                  ? "text-stone-800 hover:bg-emerald-50 border border-emerald-200 bg-emerald-50/30"
                  : "text-stone-700 hover:bg-stone-100"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.highlight && !isActive && (
                <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-200 px-1.5 py-0.5 rounded-sm">
                  세일즈
                </span>
              )}
            </a>
          );
        })}
      </nav>
      <div className="p-3 border-t border-stone-200">
        <div className="bg-amber-50/60 border border-amber-200 rounded-sm p-3">
          <div className="text-[10px] uppercase tracking-wider text-amber-700 font-bold mb-1">
            데모 모듈
          </div>
          <p className="text-[10.5px] text-stone-600 leading-relaxed">
            조특법 제91조의18 근거로 구성. 자사 상품 조건·최신 개정은 별도 검증·반영 필요.
          </p>
        </div>
      </div>
    </>
  );

  return (
    <div
      className="min-h-screen bg-stone-50 text-stone-900 print:min-h-0 print:bg-white"
      style={{ fontFamily: "'Noto Sans KR', 'Pretendard', system-ui, sans-serif" }}
    >
      <header className="md:hidden sticky top-0 z-30 bg-white border-b border-stone-200 flex items-center gap-3 px-3 py-2 print:hidden">
        <button
          onClick={() => setDrawerOpen(true)}
          className="p-1.5 hover:bg-stone-100 rounded-sm"
          aria-label="메뉴 열기"
        >
          <Menu className="w-5 h-5 text-stone-700" />
        </button>
        <div className="flex-1 min-w-0">
          <Brand />
        </div>
      </header>

      <div className="md:flex">
        {drawerOpen && (
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/40"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
        )}

        <aside
          className={cn(
            "bg-white border-r border-stone-200 flex flex-col print:hidden",
            "md:w-60 md:min-h-screen md:static md:translate-x-0",
            "fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] transform transition-transform duration-200 ease-out",
            drawerOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          )}
        >
          {sidebarContent}
        </aside>

        <main className="flex-1 min-h-screen min-w-0 print:min-h-0">
          <div className="p-4 md:p-8 max-w-6xl print:p-0 print:max-w-none">
            {currentTool && (
              <div className="flex justify-end mb-3 print:hidden">
                <PinToolButton toolId={currentTool.id} />
              </div>
            )}
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
}
