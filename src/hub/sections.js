import { Activity, Newspaper, Pin, LayoutGrid, Library } from "lucide-react";

/* 허브 대시보드 섹션 정의 — 개인화(순서·숨김)의 기준 목록.
   섹션을 새로 만들면 여기 등록 + HubHome의 SECTION_RENDERERS에 렌더러 추가.
   nav: true인 섹션은 상단바 네비게이션에도 표시된다. */
export const HUB_SECTIONS = [
  { id: "market", label: "마켓 보드", icon: Activity, nav: false },
  { id: "news", label: "모닝 브리핑", icon: Newspaper, nav: false },
  { id: "mytools", label: "내 도구", icon: Pin, nav: true },
  { id: "products", label: "상품 모듈", icon: LayoutGrid, nav: true },
  { id: "knowledge", label: "지식 라이브러리", icon: Library, nav: true },
];

export const SECTION_IDS = HUB_SECTIONS.map((s) => s.id);
export const getSection = (id) => HUB_SECTIONS.find((s) => s.id === id) ?? null;
