import { Activity, Newspaper, Pin, LayoutGrid, Library, CalendarClock, Wrench } from "lucide-react";

/* 허브 대시보드 섹션 정의 — 개인화(순서·숨김)의 기준 목록.
   섹션을 새로 만들면 여기 등록 + HubHome의 renderSection()에 렌더러 추가.
   라벨은 은행원(사용자) 언어를 쓴다 — 내부 용어(모듈 등) 노출 금지. */
export const HUB_SECTIONS = [
  { id: "market", label: "마켓 보드", icon: Activity, desc: "지수·환율·금리 한 줄 요약" },
  { id: "mytools", label: "내 도구", icon: Pin, desc: "자주 쓰는 계산기·도구 바로가기" },
  { id: "products", label: "상품 상담", icon: LayoutGrid, desc: "상품별 상담 화면 진입" },
  { id: "utility", label: "보조 도구", icon: Wrench, desc: "영문 이름·주소 변환 등" },
  { id: "followups", label: "고객 후속 관리", icon: CalendarClock, desc: "후속 연락 약속과 고객 메모" },
  { id: "news", label: "모닝 브리핑", icon: Newspaper, desc: "오늘 창구에 영향을 줄 뉴스" },
  { id: "knowledge", label: "지식 라이브러리", icon: Library, desc: "세무·규제·용어 참고 자료" },
];

export const SECTION_IDS = HUB_SECTIONS.map((s) => s.id);
export const getSection = (id) => HUB_SECTIONS.find((s) => s.id === id) ?? null;
