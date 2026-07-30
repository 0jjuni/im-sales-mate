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

/* 고객 후속 메모 상태 관리 훅. localStorage 어댑터에 자동 저장. */
export function useFollowups() {
  const [items, setItems] = useState(() => followupStore.load().items);

  useEffect(() => {
    followupStore.save({ version: 1, items });
  }, [items]);

  const add = useCallback(({ customerNo, memo, followUpDate, products, type }) => {
    const isNote = type === "note";
    const item = {
      id: uid(),
      /* type: "followup"(후속 연락) | "note"(고객 메모 — 날짜·완료 개념 없음) */
      type: isNote ? "note" : "followup",
      customerNo: (customerNo || "").trim(),
      memo: (memo || "").trim(),
      followUpDate: isNote ? null : followUpDate || null,
      products: Array.isArray(products) ? products : [],
      status: "open",
      createdAt: Date.now(),
    };
    setItems((prev) => [item, ...prev]);
  }, []);

  const remove = useCallback((id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  /* 부분 수정 — 연락일 변경 등 */
  const update = useCallback((id, patch) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }, []);

  const toggleDone = useCallback((id) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: i.status === "done" ? "open" : "done" } : i))
    );
  }, []);

  /* 예정(open) — 날짜 있는 항목은 가까운 순, 날짜 없는 항목은 뒤로(최근 등록순).
     고객 메모(note)는 별도 목록으로 분리 */
  const openItems = useMemo(() => {
    const open = items.filter((i) => i.type !== "note" && i.status === "open");
    const dated = open
      .filter((i) => i.followUpDate)
      .sort((a, b) => a.followUpDate.localeCompare(b.followUpDate));
    const undated = open.filter((i) => !i.followUpDate).sort((a, b) => b.createdAt - a.createdAt);
    return [...dated, ...undated];
  }, [items]);

  const doneItems = useMemo(
    () =>
      items
        .filter((i) => i.type !== "note" && i.status === "done")
        .sort((a, b) => b.createdAt - a.createdAt),
    [items]
  );

  /* 고객 메모 — 최근 등록순 */
  const noteItems = useMemo(
    () => items.filter((i) => i.type === "note").sort((a, b) => b.createdAt - a.createdAt),
    [items]
  );

  /* 상단 요약 — 지남/오늘/7일 이내 카운트 */
  const summary = useMemo(() => {
    let overdue = 0;
    let today = 0;
    let soon = 0;
    openItems.forEach((i) => {
      const d = ddayOf(i.followUpDate);
      if (d === null) return;
      if (d < 0) overdue += 1;
      else if (d === 0) today += 1;
      else if (d <= 7) soon += 1;
    });
    return { overdue, today, soon, openCount: openItems.length };
  }, [openItems]);

  return { items, openItems, doneItems, noteItems, summary, add, update, remove, toggleDone };
}
