/* 보조 도구 결과를 전표 형태로 인쇄하는 서식.

   통장프린터로 뽑던 자리를 대신하는 용도라 A4 전면을 쓰지 않고,
   전표 크기(가로 148mm ≒ A6 폭)로 용지 좌상단에 붙여 출력한다.
   잘라 쓰도록 점선 테두리를 넣었다.

   화면에서는 숨기고 window.print() 시에만 나타난다. */
/* figure — 항목 왼쪽에 붙는 그림(QR 등). 없으면 항목만 전체 폭으로 찍힌다 */
export const UtilitySlip = ({ title, rows = [], note, figure }) => {
  const now = new Date();
  const printedAt = `${now.getFullYear()}. ${String(now.getMonth() + 1).padStart(2, "0")}. ${String(
    now.getDate()
  ).padStart(2, "0")}`;

  return (
    <div
      className="hidden print:block print-slip bg-white text-slate-900"
      style={{ fontFamily: "'Noto Sans KR', 'Pretendard', system-ui, sans-serif" }}
      aria-hidden="true"
    >
      <div
        className="border border-dashed border-slate-500 p-3"
        style={{ width: "148mm" }}
      >
        {/* 머리 */}
        <div className="border-b-2 border-slate-900 pb-1">
          <div className="flex items-center justify-between">
            <span className="text-[7.5px] font-bold uppercase tracking-[0.2em] text-slate-500">
              iM SalesMate · 창구 전표
            </span>
            <span className="text-[8px] tracking-widest text-slate-500">iM뱅크</span>
          </div>
          <div className="mt-0.5 text-[13px] font-black leading-tight tracking-tight">{title}</div>
        </div>

        {/* 항목 — figure가 있으면 왼쪽에 그림, 오른쪽에 항목 */}
        <div className="mt-1.5 flex items-start gap-3">
          {figure && <div className="flex-shrink-0">{figure}</div>}
          <table className="w-full text-[10px]">
          <tbody>
            {rows.map(({ label, value, sub, emphasis }, i) => (
              <tr key={i} className="align-top">
                <td className="w-20 border-b border-slate-200 py-1 pr-2 text-slate-600">
                  {label}
                </td>
                <td className="border-b border-slate-200 py-1">
                  <span
                    className={
                      emphasis
                        ? "block break-all rounded-sm border border-slate-300 bg-slate-50 px-2 py-1 text-[15px] font-black leading-tight tracking-[0.08em]"
                        : "block break-words leading-snug"
                    }
                  >
                    {value}
                  </span>
                  {sub && (
                    <span className="mt-0.5 block text-[8.5px] text-slate-500">{sub}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>

        {/* 꼬리 — 작성일과 담당자 기재란 */}
        <div className="mt-2 flex items-end justify-between gap-3 text-[8.5px] text-slate-600">
          <span>작성일 {printedAt}</span>
          <span className="flex items-end gap-1">
            담당
            <span className="inline-block h-3 w-20 border-b border-slate-400" />
          </span>
        </div>

        {note && (
          <p className="mt-1 border-t border-slate-200 pt-1 text-[8.5px] leading-snug text-slate-600">
            {note}
          </p>
        )}
      </div>
    </div>
  );
};
