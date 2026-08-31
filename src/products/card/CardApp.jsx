import { useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { CreditCard, Search, QrCode, BadgePercent } from "lucide-react";
import { HubShell } from "@hub/HubShell";
import { ModuleTabs } from "@shared/components/ModuleTabs";
import { CardCatalog } from "./pages/CardCatalog";
import { CardDetail } from "./pages/CardDetail";
import { PromoHandout } from "./pages/PromoHandout";
import { CardDeduction } from "./pages/CardDeduction";

/* 카드 모듈 — 상단 네비 + 본문 탭. rose 아이덴티티. "/card/*" 마운트.
   탐색(카탈로그)·상세·가입 안내문을 한 모듈로 묶는다. */

const NAV_ITEMS = [
  { id: "catalog", label: "카드 탐색", icon: Search },
  { id: "promo", label: "가입 QR", icon: QrCode },
  { id: "deduction", label: "소득공제", icon: BadgePercent },
];

export default function CardApp() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const activeId = pathname.startsWith("/card/promo")
    ? "promo"
    : pathname.startsWith("/card/deduction")
    ? "deduction"
    : "catalog";

  useEffect(() => {
    const prev = document.title;
    document.title = "카드 · iM 세일즈메이트";
    return () => {
      document.title = prev;
    };
  }, []);

  const onSelect = (id) =>
    navigate(id === "promo" ? "/card/promo" : id === "deduction" ? "/card/deduction" : "/card");

  return (
    <HubShell>
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
          <CreditCard className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-[17px] font-black leading-tight text-slate-900 md:text-xl">카드</h1>
          <p className="text-[11px] text-slate-500">카드 탐색 · 가입 QR</p>
        </div>
      </div>

      <ModuleTabs items={NAV_ITEMS} activeId={activeId} onSelect={onSelect} accent="rose" />

      <Routes>
        <Route index element={<CardCatalog />} />
        <Route path="promo" element={<PromoHandout />} />
        <Route path="deduction" element={<CardDeduction />} />
        <Route path=":id" element={<CardDetail />} />
      </Routes>
    </HubShell>
  );
}
