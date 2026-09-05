import { useCallback, useEffect, useMemo, useState } from "react";
import { followupStore } from "./storage";

const uid = () => `f_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

/* 오늘 자정 기준 D-day (음수=지남, 0=오늘, 양수=예정). 날짜 없으면 null */
export const ddayOf = (dateStr) => {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(`${dateStr}T00:00:00`);
  if (isNaN(d)) return null;
  return Math.round((d - today) / 86400000);
};

export const isStaffCat = (c) => c === "leave" || c === "training" || c === "branch";

/* 현재 로그인 직원(가정). 내가 올린 항목 식별·편집 권한 기준. 실서비스에선 세션 사용자로 대체. */
export const ME = "이현수 계장";

/* 고객 후속·지점 일정 상태 관리 훅. localStorage 어댑터에 자동 저장.
   category: "todo"(할 일) | "note"(고객 메모) | "leave"(휴가 계획) | "training"(연수 계획) */
export function useFollowups() {
  const [items, setItems] = useState(() => followupStore.load().items);
  const [branchSeen, setBranchSeen] = useState(() => followupStore.getBranchSeen());

  useEffect(() => {
    followupStore.save({ version: 2, items });
  }, [items]);

  const add = useCallback((input) => {
    const cat = ["note", "leave", "training", "branch"].includes(input.category) ? input.category : "todo";
    const staff = isStaffCat(cat);
    const item = {
      id: uid(),
      category: cat,
      scope: staff ? "branch" : input.scope === "branch" ? "branch" : "mine",
      author: ME,
      customerNo: (input.customerNo || "").trim(),
      staffName: (input.staffName || "").trim(),
      memo: (input.memo || "").trim(),
      followUpDate: cat === "todo" ? input.followUpDate || null : null,
      startDate: staff ? input.startDate || null : null,
      endDate: staff ? input.endDate || input.startDate || null : null,
      time: staff ? input.time || "" : "",
      status: "open",
      createdAt: Date.now(),
    };
    setItems((prev) => [item, ...prev]);
  }, []);

  const remove = useCallback((id) => setItems((prev) => prev.filter((i) => i.id !== id)), []);

  const update = useCallback(
    (id, patch) => setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i))),
    []
  );

  const toggleDone = useCallback(
    (id) =>
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: i.status === "done" ? "open" : "done" } : i))
      ),
    []
  );

  /* 할 일(todo) 열린 항목 — 날짜 있는 건 가까운 순, 없는 건 뒤로. FollowupBoard 미리보기용 */
  const openItems = useMemo(() => {
    const open = items.filter((i) => i.category === "todo" && i.status === "open");
    const dated = open.filter((i) => i.followUpDate).sort((a, b) => a.followUpDate.localeCompare(b.followUpDate));
    const undated = open.filter((i) => !i.followUpDate).sort((a, b) => b.createdAt - a.createdAt);
    return [...dated, ...undated];
  }, [items]);

  const summary = useMemo(() => {
    let overdue = 0, today = 0, soon = 0;
    openItems.forEach((i) => {
      const d = ddayOf(i.followUpDate);
      if (d === null) return;
      if (d < 0) overdue += 1;
      else if (d === 0) today += 1;
      else if (d <= 7) soon += 1;
    });
    return { overdue, today, soon, openCount: openItems.length };
  }, [openItems]);

  /* 지점 공유 새 소식 — 동료(author!=="나")가 올린 지점 공유 항목 중 확인 시각 이후 등록분 */
  const branchNew = useMemo(
    () =>
      items
        .filter((i) => i.scope === "branch" && i.author && i.author !== ME && i.createdAt > branchSeen)
        .sort((a, b) => b.createdAt - a.createdAt),
    [items, branchSeen]
  );

  const markBranchSeen = useCallback(() => {
    const ts = Date.now();
    followupStore.setBranchSeen(ts);
    setBranchSeen(ts);
  }, []);

  return { items, openItems, summary, add, update, remove, toggleDone, branchNew, markBranchSeen };
}
