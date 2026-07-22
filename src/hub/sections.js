import { Activity, Newspaper, Pin, LayoutGrid, Library, CalendarClock } from "lucide-react";

/* 허브 대시보드 섹션 정의 — 개인화(순서·숨김)의 기준 목록.
   섹션을 새로 만들면 여기 등록 + HubHome의 renderSection()에 렌더러 추가.
   라벨은 은행원(사용자) 언어를 쓴다 — 내부 용어(모듈 등) 노출 금지. */
export const HUB_SECTIONS = [
  { id: "mytools", label: "내 도구", icon: Pin },
  { id: "followups", label: "고객 후속 관리", icon: CalendarClock },
  { id: "products", label: "상품 상담", icon: LayoutGrid },
  { id: "market", label: "마켓 보드", icon: Activity },
  { id: "news", label: "모닝 브리핑", icon: Newspaper },
  { id: "knowledge", label: "지식 라이브러리", icon: Library },
];

export const SECTION_IDS = HUB_SECTIONS.map((s) => s.id);
export const getSection = (id) => HUB_SECTIONS.find((s) => s.id === id) ?? null;
