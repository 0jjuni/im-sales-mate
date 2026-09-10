/* 보조 도구 요청 저장소 — 창구에서 "이 사이트에 이런 도구가 있으면 좋겠다" 요청을 모은다.
   홈 대시보드(요청·공감)와 관리자 화면(상태 변경)이 공유한다.
   데모라 localStorage에 저장(실서비스에선 백엔드로 교체).

   ⚠ 요청은 이 사이트에서 만들 수 있는 것(계산기·변환기·안내/인쇄 도구 등)이어야 한다. */

const KEY = "salesbridge.tools.requests";
const VOTE_KEY = "salesbridge.tools.requests.voted";
export const REQUEST_TOOLS = [
  {path:"/tools/name",label:"영문 이름 변환기"},
  {path:"/tools/address",label:"영문 주소 변환기"},
  {path:"/tools/qr",label:"QR코드 생성기"},
];
const enrich = (list) => list.map(r => ({
  ...({r1:{toolPath:"/tools/name",reply:"변환 결과를 전표로 인쇄할 수 있도록 반영했습니다."},r2:{toolPath:"/tools/address",reply:"영문 주소 변환기를 사용할 수 있습니다."},r3:{toolPath:"/tools/qr",reply:"링크를 QR 코드로 만들고 전표로 인쇄할 수 있습니다."}}[r.id] || {}),
  ...r,
}));

export const REQUEST_STATUS = {
  review: { label: "검토중", cls: "bg-slate-100 text-slate-500" },
  building: { label: "개발중", cls: "bg-amber-100 text-amber-700" },
  done: { label: "반영완료", cls: "bg-emerald-100 text-emerald-700" },
};
export const STATUS_ORDER = ["review", "building", "done"];

/* 시드 — 모두 이 사이트에서 만들 수 있는 도구 요청. 이미 있는 3종은 반영완료로 표시. */
const SEED = [
  { id: "r1", title: "영문 이름을 전표로 출력", detail: "고객 영문 이름 변환 결과를 전표 형태로 바로 인쇄할 수 있으면 좋겠어요.", author: "이현수 계장", status: "done", votes: 24 },
  { id: "r2", title: "도로명주소 영문 변환", detail: "해외 송금·서류용으로 도로명주소를 영문 표기로 바꿔주는 도구요.", author: "김하늘 대리", status: "done", votes: 18 },
  { id: "r3", title: "링크를 QR 코드로 만들기", detail: "가입 링크나 안내 페이지를 QR 코드로 만들어 전표로 건네고 싶어요.", author: "박준호 대리", status: "done", votes: 15 },
  { id: "r4", title: "여러 예적금 만기·예상 이자 한 번에 계산", detail: "고객이 가입한 여러 예적금의 만기일·예상 이자를 한 화면에서 계산하고 싶어요.", author: "최민재 주임", status: "review", votes: 31 },
  { id: "r5", title: "고객 상황별 추천 상품 비교표 인쇄", detail: "상담 상황에 맞는 상품 2~3개를 골라 비교표로 인쇄해 건네고 싶어요.", author: "오세훈 대리", status: "building", votes: 27 },
  { id: "r6", title: "대출 한도·월 상환액 간이 계산기", detail: "소득·금리·기간만 넣으면 대략적인 한도와 월 상환액이 나오는 간이 계산기요.", author: "한지우 계장", status: "review", votes: 19 },
];

const canStore = () => typeof window !== "undefined" && !!window.localStorage;

export const loadRequests = () => {
  if (!canStore()) return enrich(SEED);
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      window.localStorage.setItem(KEY, JSON.stringify(SEED));
      return enrich(SEED);
    }
    const p = JSON.parse(raw);
    return enrich(Array.isArray(p) ? p : SEED);
  } catch {
    return enrich(SEED);
  }
};

const write = (list) => {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* 무시 */
  }
  return list;
};

/* 정렬: 미완료(검토·개발) 먼저, 공감 많은 순. 반영완료는 아래로. */
export const sortRequests = (list) =>
  [...list].sort((a, b) => (a.status === "done" ? 1 : 0) - (b.status === "done" ? 1 : 0) || b.votes - a.votes);

const uid = () => `r_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`;

export const addRequest = ({ title, detail, author }) =>
  write([
    { id: uid(), title: (title || "").trim(), detail: (detail || "").trim(), author, status: "review", votes: 0 },
    ...loadRequests(),
  ]);

export const setRequestStatus = (id, status) =>
  write(loadRequests().map((r) => (r.id === id ? { ...r, status } : r)));

export const updateRequestResponse = (id, reply, toolPath) =>
  write(loadRequests().map(r => r.id === id ? {...r, reply:reply.trim(), toolPath:REQUEST_TOOLS.some(t=>t.path===toolPath)?toolPath:""} : r));

export const setRequestVotes = (id, votes) =>
  write(loadRequests().map((r) => (r.id === id ? { ...r, votes: Math.max(0, votes) } : r)));

export const removeRequest = (id) => write(loadRequests().filter((r) => r.id !== id));

export const loadVoted = () => {
  try {
    return new Set(JSON.parse(window.localStorage.getItem(VOTE_KEY) || "[]"));
  } catch {
    return new Set();
  }
};
export const saveVoted = (set) => {
  try {
    window.localStorage.setItem(VOTE_KEY, JSON.stringify([...set]));
  } catch {
    /* 무시 */
  }
};
