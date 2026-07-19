/* 계산기 결과를 고객에게 인쇄·전달하기 위한 표준 양식.
   화면에는 hidden, 인쇄(window.print) 시에만 print:block 적용.
   디스클레이머·입력 조건·결과·차트·법령 근거를 모두 포함하여 고객에게 전달 시
   오해를 줄이는 것이 목적. A4 한 페이지에 들어가도록 압축 디자인. */
export const PrintReport = ({
  title,
  subtitle,
  disclaimer,
  inputs = [],
  results = [],
  chart,
  notes = [],
  legalBasis,
  showId,
}) => {
  const now = new Date();
  const printedAt = `${now.getFullYear()}. ${String(now.getMonth() + 1).padStart(2, "0")}. ${String(
    now.getDate()
  ).padStart(2, "0")}. ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  return (
    <div
      className="hidden print:block print-report bg-white text-stone-900"
      style={{ fontFamily: "'Noto Sans KR', 'Pretendard', system-ui, sans-serif" }}
      aria-hidden="true"
    >
      <div className="px-2 py-2 max-w-3xl mx-auto leading-snug">
        {/* 헤더 */}
        <div className="border-b-2 border-stone-900 pb-2 mb-3">
          <div className="flex items-baseline justify-between gap-3">
            <div>
              <div className="text-[9px] uppercase tracking-widest text-stone-500 font-bold">
                노란우산공제 상담 자료 · iM뱅크
              </div>
              <h1 className="text-base font-black text-stone-900 mt-0.5 leading-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-[11px] text-stone-700 mt-0.5">{subtitle}</p>
              )}
            </div>
            <div className="text-right text-[9px] text-stone-500 leading-snug flex-shrink-0">
              <div>인쇄일시: {printedAt}</div>
              {showId && <div>참조번호: {showId}</div>}
            </div>
          </div>
        </div>

        {/* 디스클레이머 — 가장 눈에 띄게 */}
        <div className="border border-amber-600 bg-amber-50 rounded-sm p-2 mb-3 break-inside-avoid">
          <div className="flex items-start gap-1.5">
            <span className="text-sm leading-none mt-0.5">⚠</span>
            <div className="flex-1">
              <div className="text-[10px] font-black text-amber-900 uppercase tracking-wider mb-0.5">
                본 안내는 추정치입니다 — 반드시 확인해 주세요
              </div>
              <p className="text-[10.5px] text-stone-900 leading-snug whitespace-pre-line">
                {disclaimer}
              </p>
            </div>
          </div>
        </div>

        {/* 입력 조건 — 어떤 조건으로 산정했는지 명시 */}
        {inputs.length > 0 && (
          <section className="mb-3 break-inside-avoid">
            <h2 className="text-[10px] font-black uppercase tracking-wider text-stone-700 border-b border-stone-300 pb-0.5 mb-1">
              입력 조건 (산정 기준)
            </h2>
            <table className="w-full text-[11px]">
              <tbody>
                {inputs.map(({ label, value }, i) => (
                  <tr key={i} className="border-b border-stone-100 last:border-b-0">
                    <td className="py-1 pr-3 text-stone-600 w-2/5 align-top">
                      {label}
                    </td>
                    <td className="py-1 text-stone-900 font-semibold">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* 추정 결과 */}
        {results.length > 0 && (
          <section className="mb-3 break-inside-avoid">
            <h2 className="text-[10px] font-black uppercase tracking-wider text-stone-700 border-b border-stone-300 pb-0.5 mb-1">
              추정 결과
            </h2>
            <table className="w-full text-[11px]">
              <tbody>
                {results.map(({ label, value, emphasis, sub }, i) => (
                  <tr
                    key={i}
                    className={
                      emphasis
                        ? "border-b-2 border-amber-600 bg-amber-50"
                        : "border-b border-stone-100"
                    }
                  >
                    <td
                      className={`py-1 px-1.5 text-stone-600 w-2/5 align-top ${
                        emphasis ? "font-bold text-amber-900" : ""
                      }`}
                    >
                      {label}
                    </td>
                    <td
                      className={`py-1 px-1.5 ${
                        emphasis
                          ? "text-sm font-black text-amber-900"
                          : "text-stone-900 font-semibold"
                      }`}
                    >
                      {value}
                      {sub && (
                        <div className="text-[10px] font-normal text-stone-600 mt-0.5">
                          {sub}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* 차트 (옵션) — 고정 사이즈로 전달되어야 hidden 상태에서도 안전하게 렌더 */}
        {chart && (
          <section className="mb-3 break-inside-avoid">
            <h2 className="text-[10px] font-black uppercase tracking-wider text-stone-700 border-b border-stone-300 pb-0.5 mb-1">
              시각화
            </h2>
            <div className="flex justify-center">{chart}</div>
          </section>
        )}

        {/* 참고 사항 */}
        {notes.length > 0 && (
          <section className="mb-3 break-inside-avoid">
            <h2 className="text-[10px] font-black uppercase tracking-wider text-stone-700 border-b border-stone-300 pb-0.5 mb-1">
              참고 사항
            </h2>
            <ul className="text-[10.5px] text-stone-800 leading-snug space-y-0.5">
              {notes.map((n, i) => (
                <li key={i} className="flex gap-1.5">
                  <span className="text-stone-500 flex-shrink-0">·</span>
                  <span className="flex-1 whitespace-pre-line">{n}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 푸터 — 법령 근거 + 콜센터 + 단정 안내 금지 */}
        <div className="border-t-2 border-stone-900 pt-1.5 mt-2 text-[9.5px] text-stone-700 leading-snug space-y-0.5 break-inside-avoid">
          {legalBasis && (
            <p>
              <strong className="text-stone-900">법령 근거:</strong> {legalBasis}
            </p>
          )}
          <p>
            <strong className="text-stone-900">출처:</strong> 소기업·소상공인공제 약관(2026.7.1
            시행), 조세특례제한법(법률 2025.7.1 시행 / 시행령 2026.2.27 시행), 중소기업협동조합법(제121조의2 2026.6.3 시행)
          </p>
          <p>
            <strong className="text-stone-900">문의:</strong> 중소기업중앙회 노란우산공제 1666-9988
            · https://www.8899.or.kr/
          </p>
          <p className="text-stone-500 mt-1">
            본 자료는 iM뱅크 영업점 직원이 고객 상담 시 참고용으로 제공하는 추정 안내입니다. 실제
            공제금·환급금·세액·이율은 다른 소득공제 항목, 추가 소득, 시점, 세법 개정, 분기별 기준이율
            변동 등에 따라 달라질 수 있으니 정확한 금액은 중앙회 시스템 조회 결과로 확인해 주시기
            바랍니다.
          </p>
        </div>
      </div>
    </div>
  );
};
