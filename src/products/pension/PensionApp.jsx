import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Home, Coins, HelpCircle, Landmark, Megaphone } from "lucide-react";
import { usePersonalization } from "@hub/personalization/PersonalizationContext";
import { PinToolButton } from "@hub/personalization/PinToolButton";
import { findToolByPath } from "@hub/registry/toolRegistry";
import { HubShell } from "@hub/HubShell";
import { ModuleTabs } from "@shared/components/ModuleTabs";
import { ModuleNoticeBoard } from "@shared/components/ModuleNoticeBoard";
import { noticesForModule } from "@shared/data/notices";
import { Overview } from "./pages/Overview";
import { CalculatorPage } from "./pages/CalculatorPage";
import { FaqPage } from "./pages/FaqPage";

/* 연금계좌 모듈 — 상단 네비 + 본문 탭(사이드바 제거). violet 아이덴티티. "/pension/*" 마운트. */

const NAV_ITEMS = [
  { id: "overview", label: "세제 한눈에", icon: Home },
  { id: "calculator", label: "세액공제 계산기", icon: Coins, highlight: true },
  { id: "faq", label: "FAQ", icon: HelpCircle },
  { id: "notices", label: "공지사항", icon: Megaphone },
];

const VALID_PAGES = NAV_ITEMS.map((i) => i.id);

const parseSplat = (splat) => {
  const raw = (splat || "").replace(/^\/+|\/+$/g, "");
  if (!raw) return { page: "overview", sub: null };
  const [page, ...rest] = raw.split("/");
  return { page, sub: rest.join("/") || null };
};

const buildPath = (page) => `/pension/${page}`;
const normalizeRoute = (r) => (VALID_PAGES.includes(r.page) ? r : { page: "overview", sub: null });

export default function PensionApp() {
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
    document.title = "연금계좌 상담 가이드 · iM 세일즈메이트";
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
      case "notices":
        return <ModuleNoticeBoard moduleId="pension" />;
      default:
        return <Overview onNavigate={navigate} />;
    }
  };

  const navItems = NAV_ITEMS.map((i) =>
    i.id === "notices" ? { ...i, count: noticesForModule("pension").length } : i
  );

  return (
    <HubShell>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
            <Landmark className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-[17px] font-black leading-tight text-slate-900 md:text-xl">연금계좌 상담 가이드</h1>
            <p className="text-[11px] text-slate-500">연금저축 · IRP · 데모</p>
          </div>
        </div>
        {currentTool && (
          <div className="print:hidden">
            <PinToolButton toolId={currentTool.id} />
          </div>
        )}
      </div>

      <ModuleTabs items={navItems} activeId={page} onSelect={navigate} accent="violet" />

      {renderPage()}
    </HubShell>
  );
}
