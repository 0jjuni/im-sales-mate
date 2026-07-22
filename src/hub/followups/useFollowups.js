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

  const add = useCallback(({ customerNo, memo, followUpDate, products }) => {
    const item = {
      id: uid(),
      customerNo: (customerNo || "").trim(),
      memo: (memo || "").trim(),
      followUpDate: followUpDate || null,
      products: Array.isArray(products) ? products : [],
      status: "open",
      createdAt: Date.now(),
    };
    setItems((prev) => [item, ...prev]);
  }, []);

  const remove = useCallback((id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const toggleDone = useCallback((id) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: i.status === "done" ? "open" : "done" } : i))
    );
  }, []);

  /* 예정(open) — 날짜 있는 항목은 가까운 순, 날짜 없는 항목은 뒤로(최근 등록순) */
  const openItems = useMemo(() => {
    const open = items.filter((i) => i.status === "open");
    const dated = open
      .filter((i) => i.followUpDate)
      .sort((a, b) => a.followUpDate.localeCompare(b.followUpDate));
    const undated = open.filter((i) => !i.followUpDate).sort((a, b) => b.createdAt - a.createdAt);
    return [...dated, ...undated];
  }, [items]);

  const doneItems = useMemo(
    () => items.filter((i) => i.status === "done").sort((a, b) => b.createdAt - a.createdAt),
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

  return { items, openItems, doneItems, summary, add, remove, toggleDone };
}
