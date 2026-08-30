import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { UserRound, MapPin, QrCode, Megaphone, Wrench, Home, ArrowRight } from "lucide-react";
import { usePersonalization } from "@hub/personalization/PersonalizationContext";
import { PinToolButton } from "@hub/personalization/PinToolButton";
import { findToolByPath } from "@hub/registry/toolRegistry";
import { HubShell } from "@hub/HubShell";
import { ModuleTabs } from "@shared/components/ModuleTabs";
import { NameRomanizer } from "./pages/NameRomanizer";
import { AddressConverter } from "./pages/AddressConverter";
import { QrConverter } from "./pages/QrConverter";
import { PromoHandout } from "./pages/PromoHandout";

/* 보조 도구 모듈 — 상단 네비 + 본문 탭(사이드바 제거). sky 아이덴티티. "/tools/*" 마운트. */

const NAV_ITEMS = [
  { id: "home", label: "홈", icon: Home },
  { id: "name", label: "영문 이름 변환기", icon: UserRound },
  { id: "address", label: "영문 주소 변환기", icon: MapPin },
  { id: "qr", label: "링크 QR 변환기", icon: QrCode },
  { id: "promo", label: "상품 가입 안내문", icon: Megaphone },
];

const TOOL_CARDS = [
  { id: "name", label: "영문 이름 변환기", desc: "한글 이름을 여권식 영문 표기로 변환", icon: UserRound },
  { id: "address", label: "영문 주소 변환기", desc: "도로명주소를 영문 표기로 변환", icon: MapPin },
  { id: "qr", label: "링크 QR 변환기", desc: "신청 링크를 QR로 만들어 전표 인쇄", icon: QrCode },
  { id: "promo", label: "상품 가입 안내문", desc: "eBiz 가입 링크·심의필 문구로 고객 안내문 인쇄", icon: Megaphone },
];

const VALID_PAGES = NAV_ITEMS.map((i) => i.id);
const parseSplat = (splat) => {
  const raw = (splat || "").replace(/^\/+|\/+$/g, "");
  return raw ? raw.split("/")[0] : "home";
};
const buildPath = (page) => `/tools/${page}`;

const UtilityHome = ({ onNavigate }) => (
  <div>
    <p className="mb-3 text-[13px] text-slate-500">특정 상품에 매이지 않고 창구 업무 전반에서 쓰는 도구입니다. 결과는 전표로 인쇄할 수 있습니다.</p>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {TOOL_CARDS.map((t) => {
        const Icon = t.icon;
        return (
          <button
            key={t.id}
            onClick={() => onNavigate(t.id)}
            className="group flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-[0_12px_28px_-12px_rgba(6,161,137,0.28)]"
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-700 transition-transform group-hover:scale-105">
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[14px] font-bold text-slate-900">{t.label}</div>
              <p className="mt-0.5 text-[11.5px] leading-relaxed text-slate-500">{t.desc}</p>
            </div>
            <ArrowRight className="mt-1 h-4 w-4 flex-shrink-0 text-slate-200 transition-colors group-hover:text-sky-500" />
          </button>
        );
      })}
    </div>
  </div>
);

export default function UtilityApp() {
  const routerNavigate = useNavigate();
  const params = useParams();
  const raw = parseSplat(params["*"]);
  const page = VALID_PAGES.includes(raw) ? raw : "home";

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

  const navigate = (p) => routerNavigate(buildPath(p));

  return (
    <HubShell>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
            <Wrench className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-[17px] font-black leading-tight text-slate-900 md:text-xl">보조 도구</h1>
            <p className="text-[11px] text-slate-500">창구 업무 도우미</p>
          </div>
        </div>
        {currentTool && (
          <div className="print:hidden">
            <PinToolButton toolId={currentTool.id} />
          </div>
        )}
      </div>

      <ModuleTabs items={NAV_ITEMS} activeId={page} onSelect={navigate} accent="sky" />

      {page === "home" ? (
        <UtilityHome onNavigate={navigate} />
      ) : page === "qr" ? (
        <QrConverter />
      ) : page === "promo" ? (
        <PromoHandout />
      ) : page === "address" ? (
        <AddressConverter />
      ) : (
        <NameRomanizer />
      )}
    </HubShell>
  );
}
