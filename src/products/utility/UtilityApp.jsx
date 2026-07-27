import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { UserRound, MapPin, Menu, X, Wrench } from "lucide-react";
import { usePersonalization } from "@hub/personalization/PersonalizationContext";
import { PinToolButton } from "@hub/personalization/PinToolButton";
import { findToolByPath } from "@hub/registry/toolRegistry";
import { cn } from "@shared/lib/format";
import { NameRomanizer } from "./pages/NameRomanizer";
import { AddressConverter } from "./pages/AddressConverter";

/* 보조 도구 셸 — 상품 모듈과 같은 셸 패턴에 sky 아이덴티티.
   특정 상품에 속하지 않고 창구 업무 전반에서 쓰는 도구를 모은다.
   상위 라우터의 "/tools/*"에 마운트. */

const NAV_ITEMS = [
  { id: "name", label: "영문 이름 변환기", icon: UserRound },
  { id: "address", label: "영문 주소 변환기", icon: MapPin },
];

const VALID_PAGES = NAV_ITEMS.map((i) => i.id);

const parseSplat = (splat) => {
  const raw = (splat || "").replace(/^\/+|\/+$/g, "");
  if (!raw) return "name";
  return raw.split("/")[0];
};

const buildPath = (page) => `/tools/${page}`;

const Brand = () => (
  <div className="flex items-center gap-2.5">
    <div className="relative w-9 h-9 flex-shrink-0">
      <div className="absolute inset-0 bg-gradient-to-br from-sky-300 to-blue-500 rounded-md transform rotate-3" />
      <div className="absolute inset-0 bg-gradient-to-br from-sky-400 to-blue-500 rounded-md flex items-center justify-center shadow-sm">
        <Wrench className="w-5 h-5 text-white" />
      </div>
    </div>
    <div className="min-w-0">
      <div className="text-[13px] font-black text-stone-900 leading-tight">보조 도구</div>
      <div className="text-[10px] text-stone-500 leading-tight mt-0.5">창구 업무 도우미</div>
    </div>
  </div>
);

export default function UtilityApp() {
  const routerNavigate = useNavigate();
  const params = useParams();
  const raw = parseSplat(params["*"]);
  const page = VALID_PAGES.includes(raw) ? raw : "name";
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { recordToolVisit } = usePersonalization();
  const currentTool = findToolByPath(buildPath(page));
  const currentToolId = currentTool?.id ?? null;

  useEffect(() => {
    if (currentToolId) recordToolVisit(currentToolId);
  }, [currentToolId, recordToolVisit]);

  useEffect(() => {
    const prev = document.title;
    document.title = "보조 도구 · iM 세일즈메이트";
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
                "w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-sm transition-colors",
                isActive
                  ? "bg-stone-900 text-white font-semibold"
                  : "text-stone-700 hover:bg-stone-100"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="flex-1 text-left">{item.label}</span>
            </a>
          );
        })}
      </nav>
      <div className="p-3 border-t border-stone-200">
        <div className="bg-amber-50/60 border border-amber-200 rounded-sm p-3">
          <div className="text-[10px] uppercase tracking-wider text-amber-700 font-bold mb-1">
            확인 필수
          </div>
          <p className="text-[10.5px] text-stone-600 leading-relaxed">
            영문 이름은 여권 표기가, 영문 주소는 도로명주소 안내시스템 조회 결과가 기준입니다. 이
            도구의 결과는 후보로만 사용하세요.
          </p>
        </div>
      </div>
    </>
  );

  return (
    <div
      className="min-h-screen bg-stone-50 text-stone-900"
      style={{ fontFamily: "'Noto Sans KR', 'Pretendard', system-ui, sans-serif" }}
    >
      <header className="md:hidden sticky top-0 z-30 bg-white border-b border-stone-200 flex items-center gap-3 px-3 py-2">
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
            "bg-white border-r border-stone-200 flex flex-col",
            "md:w-60 md:min-h-screen md:static md:translate-x-0",
            "fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] transform transition-transform duration-200 ease-out",
            drawerOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          )}
        >
          {sidebarContent}
        </aside>

        <main className="flex-1 min-h-screen min-w-0">
          <div className="p-4 md:p-8 max-w-4xl">
            {currentTool && (
              <div className="flex justify-end mb-3">
                <PinToolButton toolId={currentTool.id} />
              </div>
            )}
            {page === "name" ? <NameRomanizer /> : <AddressConverter />}
          </div>
        </main>
      </div>
    </div>
  );
}
