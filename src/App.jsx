import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { PersonalizationProvider } from "@hub/personalization/PersonalizationContext";
import { HubHome } from "@hub/HubHome";
import NoranApp from "@noran/NoranApp";
import IsaApp from "@isa/IsaApp";
import PensionApp from "@pension/PensionApp";
import CardApp from "@card/CardApp";
import CardQrPrint from "@card/pages/CardQrPrint";
import UtilityApp from "@utility/UtilityApp";
import FollowupsPage from "@hub/followups/FollowupsPage";
import SearchPage from "@hub/SearchPage";
import GrossTaxPage from "@hub/GrossTaxPage";
import NewsPage from "@hub/NewsPage";
import LibraryPage from "@hub/LibraryPage";
import WealthPage from "@hub/WealthPage";
import WealthDetailPage from "@hub/WealthDetailPage";
import WealthComparePage from "@hub/WealthComparePage";
import AdminPage from "@hub/AdminPage";

/* iM 세일즈메이트 루트 라우터.
   "/"        → 허브(대시보드)
   "/noran/*" → 노란우산공제 모듈(내부에서 자체 라우팅)
   개인화(핀·최근 사용)는 허브와 모듈 양쪽에서 쓰므로 라우터 전체를 Provider로 감싼다. */
/* 라우트(경로) 이동 시 스크롤을 맨 위로 — SPA는 기본적으로 이전 스크롤 위치를 유지한다.
   (같은 경로 내 탭/필터 전환은 경로가 안 바뀌므로 스크롤 유지) */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <PersonalizationProvider>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HubHome />} />
        <Route path="/noran/*" element={<NoranApp />} />
        <Route path="/isa/*" element={<IsaApp />} />
        <Route path="/pension/*" element={<PensionApp />} />
        <Route path="/card/qr/:id" element={<CardQrPrint />} />
        <Route path="/card/*" element={<CardApp />} />
        <Route path="/tools/*" element={<UtilityApp />} />
        <Route path="/followups" element={<FollowupsPage />} />
        <Route path="/tax" element={<GrossTaxPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/wealth" element={<WealthPage />} />
        <Route path="/wealth/compare" element={<WealthComparePage />} />
        <Route path="/wealth/:id" element={<WealthDetailPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </PersonalizationProvider>
  );
}
