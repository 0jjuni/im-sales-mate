/* 부서 공지사항 저장소 — 담당 부서가 상품별 공지를 올리고 창구 직원이 확인한다.
   데모 환경(백엔드 없음)이라 브라우저 localStorage에 저장한다. 즉 저장 내용은
   이 브라우저 안에서만 유지되며, 실배포 시에는 이 어댑터를 백엔드 API로 교체하면 된다.

   notice = { id, moduleId, title, body, level:"info"|"important", pinned, date:"YYYY-MM-DD", author }
   author = 담당 부서명(작성 시점의 부서). */

import { deptOfModule } from "./departments";

const KEY = "salesbridge.notices";

/* 초기 시드 — 실제 창구 공지 톤의 예시. 최초 1회 localStorage에 심고, 이후엔 저장소가 원본이 된다. */
const SEED = [
  {
    id: "seed-card-training",
    moduleId: "card",
    title: "[교육 이수] 신상품 출시 관련 판매 전 필수 교육 이수 안내",
    body: "신상품 출시에 따라 판매 담당자는 관련 상품 교육을 반드시 이수해야 합니다. 이수 완료 후 고객 안내를 진행해 주세요.",
    level: "important",
    pinned: true,
    date: "2026-08-31",
    author: "카드사업부",
  },
  {
    id: "seed-card-1",
    moduleId: "card",
    title: "iM 세븐카드 캐시백 프로모션 9월 말까지 연장",
    body: "3만원 이상 일시불 7% 캐시백 프로모션을 9월 30일까지 연장합니다. 신규 발급 고객 안내 시 활용하세요.",
    level: "important",
    pinned: true,
    date: "2026-08-28",
    author: "카드사업부",
  },
  {
    id: "seed-noran-1",
    moduleId: "noran",
    title: "노란우산공제 폐업 시 공제금 지급 서류 간소화",
    body: "행정정보 공동이용 동의 시 폐업사실증명 등 일부 서류가 자동 조회됩니다. 창구 제출 서류를 확인 후 안내해 주세요.",
    level: "info",
    pinned: false,
    date: "2026-08-25",
    author: "WM사업부",
  },
  {
    id: "seed-isa-1",
    moduleId: "isa",
    title: "ISA 서민형 가입자격 확인서류 변경 안내",
    body: "서민형 가입 시 소득확인 증빙 기준이 일부 변경되었습니다. 대상 여부는 상담 화면의 확인 항목을 참고하세요.",
    level: "info",
    pinned: false,
    date: "2026-08-22",
    author: "신탁연금부",
  },
  {
    id: "seed-pension-1",
    moduleId: "pension",
    title: "연금저축·IRP 세액공제 한도 상담 유의사항",
    body: "연금저축과 IRP는 세액공제 한도(연 900만원)를 공유합니다. 배분 최적화는 계산기 결과를 근거로 안내하세요.",
    level: "info",
    pinned: false,
    date: "2026-08-20",
    author: "신탁연금부",
  },
  {
    id: "seed-wealth-1",
    moduleId: "wealth",
    title: "국내주식형 ETF 신규 라인업 추가",
    body: "이번 주 신규 ETF가 카탈로그에 추가되었습니다. 목표수익률 관리 고객에게 리밸런싱 상담 시 참고하세요.",
    level: "info",
    pinned: false,
    date: "2026-08-27",
    author: "WM사업부",
  },
];

const canStore = () => typeof window !== "undefined" && !!window.localStorage;

const read = () => {
  if (!canStore()) return SEED;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      window.localStorage.setItem(KEY, JSON.stringify(SEED));
      return SEED;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : SEED;
  } catch {
    return SEED;
  }
};

const write = (list) => {
  if (!canStore()) return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* 저장 실패는 데모에서 조용히 무시 */
  }
};

/* 정렬: 고정 먼저 → 최신 날짜순 */
const byPriority = (a, b) => {
  if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
  return (b.date || "").localeCompare(a.date || "");
};

export const loadNotices = () => [...read()].sort(byPriority);

export const noticesForModule = (moduleId) =>
  read()
    .filter((n) => n.moduleId === moduleId)
    .sort(byPriority);

const uid = () => `n-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

const today = () => new Date().toISOString().slice(0, 10);

export const addNotice = ({ moduleId, title, body, level = "info", pinned = false }) => {
  const dept = deptOfModule(moduleId);
  const next = [
    {
      id: uid(),
      moduleId,
      title: title.trim(),
      body: body.trim(),
      level,
      pinned,
      date: today(),
      author: dept?.name ?? "담당 부서",
    },
    ...read(),
  ];
  write(next);
  return next.sort(byPriority);
};

export const updateNotice = (id, patch) => {
  const next = read().map((n) => (n.id === id ? { ...n, ...patch } : n));
  write(next);
  return next.sort(byPriority);
};

export const removeNotice = (id) => {
  const next = read().filter((n) => n.id !== id);
  write(next);
  return next.sort(byPriority);
};

export const resetNotices = () => {
  write(SEED);
  return [...SEED].sort(byPriority);
};
