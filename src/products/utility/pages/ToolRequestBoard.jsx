import { useState } from "react";
import { Lightbulb, ThumbsUp, PenSquare, Check } from "lucide-react";
import { ME } from "@hub/followups/useFollowups";
import { cn } from "@shared/lib/format";

/* 보조 도구 요청 게시판 — 창구에서 "이런 도구가 있으면 좋겠다" 싶은 걸 올리는 곳.
   직원들이 공감(추천)을 누르면 우선순위가 올라가고, 담당이 상태를 검토중→개발중→반영완료로 바꾼다.
   데모라 localStorage에 저장한다(실서비스에선 백엔드로 교체). */

const KEY = "salesbridge.tools.requests";
const VOTE_KEY = "salesbridge.tools.requests.voted";

const STATUS = {
  review: { label: "검토중", cls: "bg-slate-100 text-slate-500" },
  building: { label: "개발중", cls: "bg-amber-100 text-amber-700" },
  done: { label: "반영완료", cls: "bg-emerald-100 text-emerald-700" },
};

/* 시드 — 실제 창구 요청 톤. 이미 만들어진 도구는 「반영완료」로 두어 요청→반영 흐름을 보여 준다. */
const SEED = [
  { id: "r1", title: "영문 이름을 전표로 출력", detail: "고객 영문 이름 변환 결과를 전표 형태로 바로 인쇄할 수 있으면 좋겠어요.", author: "이현수 계장", status: "done", votes: 24 },
  { id: "r2", title: "도로명주소 영문 변환", detail: "해외 송금·서류용으로 도로명주소를 영문 표기로 바꿔주는 도구요.", author: "김하늘 대리", status: "done", votes: 18 },
  { id: "r3", title: "링크를 QR로 뽑기", detail: "가입 링크나 안내 페이지를 QR 코드로 만들어 전표로 건네고 싶어요.", author: "박준호 대리", status: "done", votes: 15 },
  { id: "r4", title: "여러 예적금 만기·이자 한 번에 계산", detail: "고객이 가입한 여러 상품의 만기일·예상 이자를 한 화면에서 보고 싶어요.", author: "최민재 주임", status: "review", votes: 31 },
  { id: "r5", title: "구비서류 문자 발송 템플릿", detail: "업무별 필요 서류 안내를 문자 템플릿으로 바로 보내면 좋겠어요.", author: "오세훈 대리", status: "building", votes: 27 },
  { id: "r6", title: "고객 대기 메모 알림", detail: "상담 중 다음 대기 고객 상황을 간단히 메모하고 알림받고 싶습니다.", author: "한지우 계장", status: "review", votes: 12 },
];

const canStore = () => typeof window !== "undefined" && !!window.localStorage;
const load = () => {
  if (!canStore()) return SEED;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      window.localStorage.setItem(KEY, JSON.stringify(SEED));
      return SEED;
    }
    const p = JSON.parse(raw);
    return Array.isArray(p) ? p : SEED;
  } catch {
    return SEED;
  }
};
const save = (list) => {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* 무시 */
  }
};
const loadVoted = () => {
  try {
    return new Set(JSON.parse(window.localStorage.getItem(VOTE_KEY) || "[]"));
  } catch {
    return new Set();
  }
};
const saveVoted = (set) => {
  try {
    window.localStorage.setItem(VOTE_KEY, JSON.stringify([...set]));
  } catch {
    /* 무시 */
  }
};

const uid = () => `r_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`;

/* 정렬: 미완료(검토·개발) 먼저, 공감 많은 순. 반영완료는 아래로. */
const sortReqs = (list) =>
  [...list].sort((a, b) => (a.status === "done" ? 1 : 0) - (b.status === "done" ? 1 : 0) || b.votes - a.votes);

export function ToolRequestBoard() {
  const [reqs, setReqs] = useState(load);
  const [voted, setVoted] = useState(loadVoted);
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");

  const list = sortReqs(reqs);

  const submit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    const next = [
      { id: uid(), title: title.trim(), detail: detail.trim(), author: ME, status: "review", votes: 0 },
      ...reqs,
    ];
    setReqs(next);
    save(next);
    setTitle("");
    setDetail("");
  };

  const vote = (id) => {
    const has = voted.has(id);
    const nextVoted = new Set(voted);
    has ? nextVoted.delete(id) : nextVoted.add(id);
    setVoted(nextVoted);
    saveVoted(nextVoted);
    const next = reqs.map((r) => (r.id === id ? { ...r, votes: Math.max(0, r.votes + (has ? -1 : 1)) } : r));
    setReqs(next);
    save(next);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">도구 요청 게시판</h1>
        <p className="mt-1 text-sm text-slate-600">
          창구에서 “이런 도구가 있으면 좋겠다” 싶은 걸 남겨 주세요. 공감을 많이 받은 요청부터 검토합니다.
        </p>
      </div>

      {/* 요청 작성 */}
      <form onSubmit={submit} className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-2 flex items-center gap-1.5 text-[12.5px] font-bold text-slate-600">
          <Lightbulb className="h-4 w-4 text-sky-600" /> 새 요청
        </div>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="어떤 도구가 필요하세요? (한 줄 제목)"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-[14px] font-semibold text-slate-900 placeholder:font-normal placeholder:text-slate-300 focus:border-sky-500 focus:outline-none"
        />
        <textarea
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          rows={2}
          placeholder="예: 영문으로 이름 변환해서 전표 형태로 출력되면 좋겠어요."
          className="mt-2 w-full resize-y rounded-md border border-slate-300 px-3 py-2 text-[13px] leading-relaxed text-slate-700 placeholder:text-slate-300 focus:border-sky-500 focus:outline-none"
        />
        <div className="mt-2 flex justify-end">
          <button
            type="submit"
            disabled={!title.trim()}
            className="inline-flex items-center gap-1.5 rounded-md bg-sky-600 px-4 py-2 text-[13px] font-bold text-white transition-colors hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <PenSquare className="h-3.5 w-3.5" /> 요청 등록
          </button>
        </div>
      </form>

      {/* 요청 목록 */}
      <div className="space-y-2.5">
        {list.map((r) => {
          const on = voted.has(r.id);
          const st = STATUS[r.status] || STATUS.review;
          return (
            <div key={r.id} className={cn("flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4", r.status === "done" && "opacity-80")}>
              {/* 공감 */}
              <button
                onClick={() => vote(r.id)}
                className={cn(
                  "flex w-14 flex-shrink-0 flex-col items-center gap-0.5 rounded-lg border px-2 py-1.5 transition-colors",
                  on ? "border-sky-500 bg-sky-50 text-sky-700" : "border-slate-200 bg-white text-slate-500 hover:border-sky-300 hover:text-sky-700"
                )}
                aria-pressed={on}
                title="공감"
              >
                <ThumbsUp className={cn("h-4 w-4", on && "fill-sky-500")} />
                <span className="text-[13px] font-bold tabular-nums">{r.votes}</span>
              </button>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className={cn("inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold", st.cls)}>
                    {r.status === "done" && <Check className="h-3 w-3" />}
                    {st.label}
                  </span>
                  <h3 className="text-[14px] font-bold text-slate-900">{r.title}</h3>
                </div>
                {r.detail && <p className="mt-1 text-[12.5px] leading-relaxed text-slate-500">{r.detail}</p>}
                <div className="mt-1.5 text-[11px] text-slate-400">요청 {r.author}</div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] leading-relaxed text-slate-400">
        요청·공감은 데모용으로 이 화면에 기록됩니다. 상태(검토중·개발중·반영완료)는 도구 담당이 관리합니다.
      </p>
    </div>
  );
}
