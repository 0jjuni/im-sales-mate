import { Routes, Route, Navigate } from "react-router-dom";
import { PersonalizationProvider } from "@hub/personalization/PersonalizationContext";
import { HubHome } from "@hub/HubHome";
import NoranApp from "@noran/NoranApp";
import IsaApp from "@isa/IsaApp";
import PensionApp from "@pension/PensionApp";
import UtilityApp from "@utility/UtilityApp";
import FollowupsPage from "@hub/followups/FollowupsPage";
import SearchPage from "@hub/SearchPage";
import GrossTaxPage from "@hub/GrossTaxPage";
import NewsPage from "@hub/NewsPage";
import WealthPage from "@hub/WealthPage";
import WealthDetailPage from "@hub/WealthDetailPage";

/* iM 세일즈메이트 루트 라우터.
   "/"        → 허브(대시보드)
   "/noran/*" → 노란우산공제 모듈(내부에서 자체 라우팅)
   개인화(핀·최근 사용)는 허브와 모듈 양쪽에서 쓰므로 라우터 전체를 Provider로 감싼다. */
export default function App() {
  return (
    <PersonalizationProvider>
      <Routes>
        <Route path="/" element={<HubHome />} />
        <Route path="/noran/*" element={<NoranApp />} />
        <Route path="/isa/*" element={<IsaApp />} />
        <Route path="/pension/*" element={<PensionApp />} />
        <Route path="/tools/*" element={<UtilityApp />} />
        <Route path="/followups" element={<FollowupsPage />} />
        <Route path="/tax" element={<GrossTaxPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/wealth" element={<WealthPage />} />
        <Route path="/wealth/:id" element={<WealthDetailPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </PersonalizationProvider>
  );
}
