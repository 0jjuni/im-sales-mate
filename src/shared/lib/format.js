export const cn = (...classes) => classes.filter(Boolean).join(" ");

export const formatKRW = (n) =>
  isNaN(n) || n === null
    ? "-"
    : Math.round(n).toLocaleString("ko-KR") + "원";

export const formatKRWShort = (n) => {
  if (isNaN(n) || n === null) return "-";
  const won = Math.round(n);
  if (won >= 100000000) return `${(won / 100000000).toFixed(1)}억원`;
  if (won >= 10000) return `${(won / 10000).toFixed(0)}만원`;
  return won.toLocaleString("ko-KR") + "원";
};
