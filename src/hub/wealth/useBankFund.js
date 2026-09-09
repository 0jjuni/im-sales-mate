import { useEffect, useState } from "react";
import catalogue from "../../../public/data/wealth-bank/catalogue-map.json";

export const bankField = (data, label) => data?.bank.tables.flatMap(t => t.rows).find(r => r[0]?.text === label)?.slice(1).map(c => c.text).join(" · ") || null;
export const fundSection = (data, name) => data?.sections.find(s => s.name === name);
export const introRows = data => fundSection(data, "상품안내")?.tables.flatMap(t => t.rows) || [];
export const introField = (data, label) => introRows(data).find(r => r[0]?.text === label)?.[1]?.text || null;
const number = text => text && /^[-+]?\d[\d,]*(\.\d+)?$/.test(text.trim()) ? Number(text.replaceAll(",", "")) : null;
export function bankSeries(data) {
  const section = fundSection(data, "일별기준가");
  if (section?.status === "unavailable") return [];
  const table = section?.tables.find(t => t.title === "일별기준가");
  const column = table?.rows[0]?.findIndex(c => c.text === "기준가");
  if (column == null || column < 0) return [];
  return table.rows.filter(r => /^\d{4}\.\d{2}\.\d{2}$/.test(r[0]?.text)).map(r => ({ t: r[0].text.replaceAll(".", "-"), c: number(r[column]?.text) })).filter(p => p.c != null && p.c > 0).sort((a,b) => a.t.localeCompare(b.t));
}

export function useBankFund(productId) {
  const code = catalogue.mapping[productId];
  const [state, setState] = useState({});
  useEffect(() => {
    if (!code) return;
    const controller = new AbortController();
    setState({ code, loading: true });
    fetch(`/data/wealth-bank/${code}.json`, { signal: controller.signal }).then(r => {
      if (!r.ok) throw new Error("상품정보를 불러오지 못했습니다.");
      return r.json();
    }).then(data => {
      if (data.code !== code) throw new Error("상품 코드가 일치하지 않습니다.");
      setState({ code, data });
    }).catch(error => { if (error.name !== "AbortError") setState({ code, error: true }); });
    return () => controller.abort();
  }, [code]);
  return !code ? { missing: true } : state.code === code ? state : { loading: true };
}
