import { Routes, Route, Navigate } from "react-router-dom";
import { HubPage } from "@shared/pages/HubPage";
import NoranApp from "@noran/NoranApp";

/* 세일즈브릿지 루트 라우터.
   "/"      → 허브(상품 모듈 목록)
   "/noran/*" → 노란우산공제 모듈(내부에서 자체 라우팅) */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HubPage />} />
      <Route path="/noran/*" element={<NoranApp />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
