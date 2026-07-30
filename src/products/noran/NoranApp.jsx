import { useState, useEffect } from "react";
import {
  Search,
  Home,
  ClipboardList,
  HelpCircle,
  CheckSquare,
  MessageSquare,
  ExternalLink,
  Calculator,
  Lightbulb,
  Menu,
  X,
} from "lucide-react";
import { GUIDES } from "./data/guides";
import { ArticleModal } from "./components/ArticleModal";
import { GlobalWarning } from "./components/GlobalWarning";
import { DateBadge } from "./components/DateBadge";
import { Dashboard } from "./pages/Dashboard";
import { GuideListPage } from "./pages/GuideListPage";
import { GuideDetailPage } from "./pages/GuideDetailPage";
import { FaqPage } from "./pages/FaqPage";
import { ChecklistPage } from "./pages/ChecklistPage";
import { SimulatorPage } from "./pages/SimulatorPage";
import { IntroPage } from "./pages/IntroPage";
import { CalculatorPage } from "./pages/calculator/CalculatorPage";
import { useNavigate, useParams, Link } from "react-router-dom";
import { usePersonalization } from "@hub/personalization/PersonalizationContext";
import { PinToolButton } from "@hub/personalization/PinToolButton";
import { findToolByPath } from "@hub/registry/toolRegistry";
import { HubLink } from "@shared/components/HubLink";
import { cn } from "@shared/lib/format";

const NAV_ITEMS = [
  { id: "dashboard", label: "대시보드", icon: Home },
  { id: "intro", label: "5분 입문", icon: Lightbulb },
  { id: "simulator", label: "상담 시뮬레이터", icon: MessageSquare },
  { id: "calculator", label: "계산기", icon: Calculator, highlight: true },
  { id: "guide", label: "업무별 가이드", icon: ClipboardList },
  { id: "checklist", label: "구비서류 체크리스트", icon: CheckSquare },
  { id: "faq", label: "FAQ 검색", icon: HelpCircle },
];

const VALID_PAGES = NAV_ITEMS.map((i) => i.id);

/* 경로 라우팅 — "/noran/page" 또는 "/noran/page/sub" 형식.
   NoranApp은 상위 라우터의 "/noran/*"에 마운트되며, splat(*)이 page/sub를 담는다.
   sub는 가이드 ID (guide/guide-payment-01) 또는 체크리스트 사유 (checklist/closure) */
const parseSplat = (splat) => {
  const raw = (splat || "").replace(/^\/+|\/+$/g, "");
  if (!raw) return { page: "dashboard", sub: null };
  const [page, ...rest] = raw.split("/");
  return { page, sub: rest.join("/") || null };
};

const buildPath = (page, sub) => (sub ? `/noran/${page}/${sub}` : `/noran/${page}`);

/* 계산기 탭 — URL 서브경로로 제어 (/noran/calculator/:tab).
   개별 계산기를 허브 「내 도구」에 등록·딥링크하기 위함 */
const CALC_TABS = ["tax", "refund", "compare"];
const calcTab = (sub) => (CALC_TABS.includes(sub) ? sub : "tax");

const Brand = () => (
  <div className="flex items-center gap-2.5">
    <div className="relative w-9 h-9 flex-shrink-0">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-300 to-amber-500 rounded-md transform rotate-3" />
      <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-md flex items-center justify-center shadow-sm">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 text-stone-900"
        >
          <path d="M12 2v2M12 20v2M2 12c0-5.523 4.477-10 10-10s10 4.477 10 10H2z" />
          <path d="M12 12v8a2 2 0 0 1-2-2" />
        </svg>
      </div>
    </div>
    <div className="min-w-0">
      <div className="text-[13px] font-black text-stone-900 leading-tight">
        노란우산 상담 가이드
      </div>
      <div className="text-[10px] text-stone-500 leading-tight mt-0.5">
        iM뱅크 영업점 전용
      </div>
    </div>
  </div>
);

const normalizeRoute = (r) =>
  VALID_PAGES.includes(r.page) ? r : { page: "dashboard", sub: null };

export default function NoranApp() {
  const routerNavigate = useNavigate();
  const params = useParams();
  /* 라우트는 상위 "/noran/*"의 splat에서 파생 — 브라우저 뒤로/앞으로·딥링크 진입 모두
     location 변화에 따라 재렌더되어 자동 반영된다(별도 상태·리스너 불필요). */
  const route = normalizeRoute(parseSplat(params["*"]));
  const [openArticle, setOpenArticle] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { page, sub } = route;
  const selectedGuide =
    page === "guide" && sub ? GUIDES.find((g) => g.id === sub) : null;
  const checklistReason = page === "checklist" ? sub : null;

  /* 현재 화면이 허브 도구 레지스트리에 등록된 도구인지 역조회 —
     맞으면 핀 버튼을 띄우고 「최근 사용」에 자동 기록한다 */
  const { recordToolVisit } = usePersonalization();
  const toolPath =
    page === "calculator" ? `/noran/calculator/${calcTab(sub)}` : buildPath(page, sub);
  const currentTool = findToolByPath(toolPath);
  const currentToolId = currentTool?.id ?? null;

  useEffect(() => {
    if (currentToolId) recordToolVisit(currentToolId);
  }, [currentToolId, recordToolVisit]);

  /* 모듈 체류 중 브라우저 탭 제목 — 허브로 돌아가면 원래 제목 복원 */
  useEffect(() => {
    const prev = document.title;
    document.title = "노란우산공제 상담 가이드 · iM 세일즈메이트";
    return () => {
      document.title = prev;
    };
  }, []);

  /* 라우트 변경 — 경로 이동 → useParams 재평가로 자동 렌더 */
  const navigate = (p, s = null) => {
    routerNavigate(buildPath(p, s));
    setDrawerOpen(false);
  };

  const handleNavigate = (p, s = null) => navigate(p, s);
  const handleGoToChecklist = (reasonKey) => navigate("checklist", reasonKey);
  const handleSelectGuide = (guideId) => navigate("guide", guideId);
  const handleBackToGuideList = () => navigate("guide");

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e) => e.key === "Escape" && setDrawerOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  const renderPage = () => {
    if (page === "guide" && selectedGuide) {
      return (
        <GuideDetailPage
          guide={selectedGuide}
          onBack={handleBackToGuideList}
          onOpenArticle={setOpenArticle}
        />
      );
    }
    switch (page) {
      case "dashboard":
        return <Dashboard onNavigate={handleNavigate} onOpenArticle={setOpenArticle} />;
      case "intro":
        return <IntroPage onNavigate={handleNavigate} onOpenArticle={setOpenArticle} />;
      case "simulator":
        return (
          <SimulatorPage
            onOpenArticle={setOpenArticle}
            onGoToChecklist={handleGoToChecklist}
            initialNode={sub}
          />
        );
      case "calculator":
        return (
          <CalculatorPage
            onOpenArticle={setOpenArticle}
            activeTab={calcTab(sub)}
            onTabChange={(tabId) => navigate("calculator", tabId)}
          />
        );
      case "guide":
        return <GuideListPage onSelectGuide={handleSelectGuide} />;
      case "checklist":
        return (
          <ChecklistPage
            onOpenArticle={setOpenArticle}
            initialReason={checklistReason}
          />
        );
      case "faq":
        return <FaqPage onOpenArticle={setOpenArticle} />;
      default:
        return <Dashboard onNavigate={handleNavigate} onOpenArticle={setOpenArticle} />;
    }
  };

  const sidebarContent = (
    <>
      <div className="p-4 border-b border-stone-200 space-y-3">
        <HubLink />
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

        <button
          onClick={() => handleNavigate("faq")}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-sm transition-colors group"
        >
          <Search className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-600" />
          <span className="text-[11px] text-stone-500 group-hover:text-stone-700 flex-1 text-left">
            약관·FAQ 검색
          </span>
          <kbd className="text-[9px] font-mono text-stone-400 bg-white px-1 py-0.5 rounded border border-stone-200">
            /
          </kbd>
        </button>

        <DateBadge />
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
                handleNavigate(item.id);
              }}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-sm transition-colors relative",
                isActive
                  ? "bg-stone-900 text-white font-semibold"
                  : item.highlight
                  ? "text-stone-800 hover:bg-amber-50 border border-amber-200 bg-amber-50/30"
                  : "text-stone-700 hover:bg-stone-100"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.highlight && !isActive && (
                <span className="text-[9px] font-bold uppercase tracking-wider text-amber-700 bg-amber-200 px-1.5 py-0.5 rounded-sm">
                  세일즈
                </span>
              )}
              {item.badge && !isActive && (
                <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-sm">
                  {item.badge}
                </span>
              )}
            </a>
          );
        })}
      </nav>
      <div className="p-3 border-t border-stone-200 space-y-2">
        <div className="bg-stone-50 border border-stone-200 rounded-sm p-3">
          <div className="flex items-center justify-between mb-1">
            <div className="text-[10px] uppercase tracking-wider text-stone-500 font-bold">
              중앙회 콜센터
            </div>
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" title="운영 중" />
          </div>
          <div className="text-sm font-bold text-stone-900">1666-9988</div>
          <a
            href="https://www.8899.or.kr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-stone-500 hover:text-amber-700 mt-0.5 flex items-center gap-0.5"
          >
            www.8899.or.kr
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
        <div className="text-[9px] text-stone-400 text-center leading-relaxed px-1">
          v1.6 · 약관 2026.7.1 + 조특법 법률 2025.7.1<br />
          + 시행령 2026.2.27 + 중협법 2026.6.3 반영
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 print:min-h-0 print:bg-white" style={{ fontFamily: "'Noto Sans KR', 'Pretendard', system-ui, sans-serif" }}>
      {/* Mobile top bar */}
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
        <HubLink compact />
      </header>

      <div className="md:flex">
        {/* Mobile drawer backdrop */}
        {drawerOpen && (
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/40"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Sidebar — desktop static, mobile drawer */}
        <aside
          className={cn(
            "bg-white border-r border-stone-200 flex flex-col print:hidden",
            // Desktop
            "md:w-60 md:min-h-screen md:static md:translate-x-0",
            // Mobile drawer
            "fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] transform transition-transform duration-200 ease-out",
            drawerOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          )}
        >
          {sidebarContent}
        </aside>

        {/* Main */}
        <main className="flex-1 min-h-screen min-w-0 print:min-h-0">
          <GlobalWarning />
          <div className="p-4 md:p-8 max-w-6xl print:p-0 print:max-w-none">
            {/* 등록 가능한 도구 화면이면 허브 고정 버튼 노출 */}
            {currentTool && (
              <div className="flex justify-end mb-3 print:hidden">
                <PinToolButton toolId={currentTool.id} />
              </div>
            )}
            {renderPage()}
          </div>
        </main>
      </div>

      <ArticleModal articleNo={openArticle} onClose={() => setOpenArticle(null)} />
    </div>
  );
}
