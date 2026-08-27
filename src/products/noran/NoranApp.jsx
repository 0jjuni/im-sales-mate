import { useState, useEffect } from "react";
import { Home, ClipboardList, HelpCircle, CheckSquare, MessageSquare, Calculator, Lightbulb } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { GUIDES } from "./data/guides";
import { ArticleModal } from "./components/ArticleModal";
import { GlobalWarning } from "./components/GlobalWarning";
import { Dashboard } from "./pages/Dashboard";
import { GuideListPage } from "./pages/GuideListPage";
import { GuideDetailPage } from "./pages/GuideDetailPage";
import { FaqPage } from "./pages/FaqPage";
import { ChecklistPage } from "./pages/ChecklistPage";
import { SimulatorPage } from "./pages/SimulatorPage";
import { IntroPage } from "./pages/IntroPage";
import { CalculatorPage } from "./pages/calculator/CalculatorPage";
import { usePersonalization } from "@hub/personalization/PersonalizationContext";
import { PinToolButton } from "@hub/personalization/PinToolButton";
import { findToolByPath } from "@hub/registry/toolRegistry";
import { HubShell } from "@hub/HubShell";
import { ModuleTabs } from "@shared/components/ModuleTabs";

/* 노란우산 모듈 — 상단 네비 + 본문 탭(사이드바 제거). amber 아이덴티티. "/noran/*" 마운트. */

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

const parseSplat = (splat) => {
  const raw = (splat || "").replace(/^\/+|\/+$/g, "");
  if (!raw) return { page: "dashboard", sub: null };
  const [page, ...rest] = raw.split("/");
  return { page, sub: rest.join("/") || null };
};

const buildPath = (page, sub) => (sub ? `/noran/${page}/${sub}` : `/noran/${page}`);

const CALC_TABS = ["tax", "refund", "compare"];
const calcTab = (sub) => (CALC_TABS.includes(sub) ? sub : "tax");

const NoranBrandIcon = () => (
  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M12 2v2M12 20v2M2 12c0-5.523 4.477-10 10-10s10 4.477 10 10H2z" />
      <path d="M12 12v8a2 2 0 0 1-2-2" />
    </svg>
  </div>
);

const normalizeRoute = (r) => (VALID_PAGES.includes(r.page) ? r : { page: "dashboard", sub: null });

export default function NoranApp() {
  const routerNavigate = useNavigate();
  const params = useParams();
  const route = normalizeRoute(parseSplat(params["*"]));
  const [openArticle, setOpenArticle] = useState(null);

  const { page, sub } = route;
  const selectedGuide = page === "guide" && sub ? GUIDES.find((g) => g.id === sub) : null;
  const checklistReason = page === "checklist" ? sub : null;

  const { recordToolVisit } = usePersonalization();
  const toolPath = page === "calculator" ? `/noran/calculator/${calcTab(sub)}` : buildPath(page, sub);
  const currentTool = findToolByPath(toolPath);
  const currentToolId = currentTool?.id ?? null;

  useEffect(() => {
    if (currentToolId) recordToolVisit(currentToolId);
  }, [currentToolId, recordToolVisit]);

  useEffect(() => {
    const prev = document.title;
    document.title = "노란우산공제 상담 가이드 · iM 세일즈메이트";
    return () => {
      document.title = prev;
    };
  }, []);

  const navigate = (p, s = null) => routerNavigate(buildPath(p, s));
  const handleGoToChecklist = (reasonKey) => navigate("checklist", reasonKey);
  const handleSelectGuide = (guideId) => navigate("guide", guideId);
  const handleBackToGuideList = () => navigate("guide");

  const renderPage = () => {
    if (page === "guide" && selectedGuide) {
      return <GuideDetailPage guide={selectedGuide} onBack={handleBackToGuideList} onOpenArticle={setOpenArticle} />;
    }
    switch (page) {
      case "intro":
        return <IntroPage onNavigate={navigate} onOpenArticle={setOpenArticle} />;
      case "simulator":
        return <SimulatorPage onOpenArticle={setOpenArticle} onGoToChecklist={handleGoToChecklist} initialNode={sub} />;
      case "calculator":
        return <CalculatorPage onOpenArticle={setOpenArticle} activeTab={calcTab(sub)} onTabChange={(tabId) => navigate("calculator", tabId)} />;
      case "guide":
        return <GuideListPage onSelectGuide={handleSelectGuide} />;
      case "checklist":
        return <ChecklistPage onOpenArticle={setOpenArticle} initialReason={checklistReason} />;
      case "faq":
        return <FaqPage onOpenArticle={setOpenArticle} />;
      default:
        return <Dashboard onNavigate={navigate} onOpenArticle={setOpenArticle} />;
    }
  };

  return (
    <HubShell>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <NoranBrandIcon />
          <div>
            <h1 className="text-[17px] font-black leading-tight text-slate-900 md:text-xl">노란우산 상담 가이드</h1>
            <p className="text-[11px] text-slate-500">iM뱅크 영업점 전용</p>
          </div>
        </div>
        {currentTool && (
          <div className="print:hidden">
            <PinToolButton toolId={currentTool.id} />
          </div>
        )}
      </div>

      <GlobalWarning />

      <ModuleTabs items={NAV_ITEMS} activeId={page} onSelect={(id) => navigate(id)} accent="amber" />

      {renderPage()}

      <ArticleModal articleNo={openArticle} onClose={() => setOpenArticle(null)} />
    </HubShell>
  );
}
