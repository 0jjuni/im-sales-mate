import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Home, Percent, HelpCircle, PiggyBank } from "lucide-react";
import { usePersonalization } from "@hub/personalization/PersonalizationContext";
import { PinToolButton } from "@hub/personalization/PinToolButton";
import { findToolByPath } from "@hub/registry/toolRegistry";
import { HubShell } from "@hub/HubShell";
import { ModuleTabs } from "@shared/components/ModuleTabs";
import { Overview } from "./pages/Overview";
import { CalculatorPage } from "./pages/CalculatorPage";
import { FaqPage } from "./pages/FaqPage";

/* ISA 모듈 — 상단 네비 + 본문 탭(사이드바 제거)로 앱 전체와 통일. fuchsia 아이덴티티.
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
const normalizeRoute = (r) => (VALID_PAGES.includes(r.page) ? r : { page: "overview", sub: null });

export default function IsaApp() {
  const routerNavigate = useNavigate();
  const params = useParams();
  const route = normalizeRoute(parseSplat(params["*"]));
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

  const navigate = (p) => routerNavigate(buildPath(p));

  const renderPage = () => {
    switch (page) {
      case "calculator":
        return <CalculatorPage />;
      case "faq":
        return <FaqPage />;
      default:
        return <Overview onNavigate={navigate} />;
    }
  };

  return (
    <HubShell>
      {/* 모듈 헤더 */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-fuchsia-50 text-fuchsia-700">
            <PiggyBank className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-[17px] font-black leading-tight text-slate-900 md:text-xl">ISA 상담 가이드</h1>
            <p className="text-[11px] text-slate-500">개인종합자산관리계좌 · 데모</p>
          </div>
        </div>
        {currentTool && (
          <div className="print:hidden">
            <PinToolButton toolId={currentTool.id} />
          </div>
        )}
      </div>

      <ModuleTabs items={NAV_ITEMS} activeId={page} onSelect={navigate} accent="fuchsia" />

      {renderPage()}
    </HubShell>
  );
}
