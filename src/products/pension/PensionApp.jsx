import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Home, Coins, HelpCircle, Menu, X, Landmark } from "lucide-react";
import { usePersonalization } from "@hub/personalization/PersonalizationContext";
import { PinToolButton } from "@hub/personalization/PinToolButton";
import { findToolByPath } from "@hub/registry/toolRegistry";
import { cn } from "@shared/lib/format";
import { Overview } from "./pages/Overview";
import { CalculatorPage } from "./pages/CalculatorPage";
import { FaqPage } from "./pages/FaqPage";

/* 연금계좌 모듈 셸 — 노란·ISA와 동일한 셸 패턴(사이드바 + 경로 라우팅)에 violet 아이덴티티.
   연금저축과 IRP는 세액공제 한도를 공유하므로 별도 모듈로 나누지 않고 하나로 묶는다.
   상위 라우터의 "/pension/*"에 마운트. */

const NAV_ITEMS = [
  { id: "overview", label: "세제 한눈에", icon: Home },
  { id: "calculator", label: "세액공제 계산기", icon: Coins, highlight: true },
  { id: "faq", label: "FAQ", icon: HelpCircle },
];

const VALID_PAGES = NAV_ITEMS.map((i) => i.id);

const parseSplat = (splat) => {
  const raw = (splat || "").replace(/^\/+|\/+$/g, "");
  if (!raw) return { page: "overview", sub: null };
  const [page, ...rest] = raw.split("/");
  return { page, sub: rest.join("/") || null };
};

const buildPath = (page) => `/pension/${page}`;

const Brand = () => (
  <div className="flex items-center gap-2.5">
    <div className="relative w-9 h-9 flex-shrink-0">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-300 to-purple-500 rounded-md transform rotate-3" />
      <div className="absolute inset-0 bg-gradient-to-br from-violet-400 to-purple-500 rounded-md flex items-center justify-center shadow-sm">
        <Landmark className="w-5 h-5 text-white" />
      </div>
    </div>
    <div className="min-w-0">
      <div className="text-[13px] font-black text-stone-900 leading-tight">연금계좌 상담 가이드</div>
      <div className="text-[10px] text-stone-500 leading-tight mt-0.5">연금저축 · IRP · 데모</div>
    </div>
  </div>
);

const normalizeRoute = (r) =>
  VALID_PAGES.includes(r.page) ? r : { page: "overview", sub: null };

export default function PensionApp() {
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
    document.title = "연금계좌 상담 가이드 · iM 세일즈메이트";
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
                  ? "text-stone-800 hover:bg-violet-50 border border-violet-200 bg-violet-50/30"
                  : "text-stone-700 hover:bg-stone-100"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.highlight && !isActive && (
                <span className="text-[9px] font-bold uppercase tracking-wider text-violet-700 bg-violet-200 px-1.5 py-0.5 rounded-sm">
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
            소득세법 제59조의3 + iM뱅크 공시자료 기준. 연금수령 개시 업무 절차·구비서류는 자료 확보 후
            시뮬레이터로 확장 예정.
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
