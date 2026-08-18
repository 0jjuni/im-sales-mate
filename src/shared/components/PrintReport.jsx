/* 계산기 결과를 고객에게 인쇄·전달하기 위한 범용 표준 양식.
   화면에는 hidden, 인쇄(window.print) 시에만 print:block 적용.
   디스클레이머·입력 조건·결과·차트·법령 근거를 모두 포함하여 고객에게 전달 시
   오해를 줄이는 것이 목적. A4 한 페이지에 들어가도록 압축 디자인.

   모듈별로 다른 부분(브랜드 라벨·출처·문의·하단 고지)은 props로 주입한다 —
   상품 모듈이 늘어나도 이 컴포넌트 하나를 공유한다. */

/* 모듈 아이덴티티 색 — 디스클레이머 박스·강조 결과행에 사용.
   (Tailwind JIT 스캔을 위해 정적 클래스 문자열로 보관) */
const ACCENTS = {
  amber: {
    box: "border-amber-600 bg-amber-50",
    boxTitle: "text-amber-900",
    rowBorder: "border-b-2 border-amber-600 bg-amber-50",
    rowText: "text-amber-900",
  },
  emerald: {
    box: "border-emerald-600 bg-emerald-50",
    boxTitle: "text-emerald-900",
    rowBorder: "border-b-2 border-emerald-600 bg-emerald-50",
    rowText: "text-emerald-900",
  },
  violet: {
    box: "border-violet-600 bg-violet-50",
    boxTitle: "text-violet-900",
    rowBorder: "border-b-2 border-violet-600 bg-violet-50",
    rowText: "text-violet-900",
  },
};

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
  brandLabel = "iM 세일즈메이트 상담 자료 · iM뱅크",
  sourceLine,
  contactLine,
  footerNote = "본 자료는 iM뱅크 영업점 직원이 고객 상담 시 참고용으로 제공하는 추정 안내입니다. 실제 금액·세액·이율은 다른 소득·공제 항목, 시점, 세법 개정 등에 따라 달라질 수 있으니 정확한 내용은 관련 기관·시스템 조회 결과로 확인해 주시기 바랍니다.",
  accent = "amber",
  /* 준법감시인 심의필 번호. 고객에게 교부하는 자료는 금융소비자보호법상 광고·안내자료
     규제 대상이 될 수 있어 서식에 대한 준법감시인 사전심의가 필요하다.
     심의를 받으면 「2025-025호」 같은 번호와 유효기간을 넘기고, 없으면 데모 표기가 나간다. */
  complianceReviewNo,
  complianceValidUntil,
}) => {
  const ac = ACCENTS[accent] ?? ACCENTS.amber;
  const now = new Date();
  const printedAt = `${now.getFullYear()}. ${String(now.getMonth() + 1).padStart(2, "0")}. ${String(
    now.getDate()
  ).padStart(2, "0")}. ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  return (
    <div
      className="hidden print:block print-report bg-white text-slate-900"
      style={{ fontFamily: "'Noto Sans KR', 'Pretendard', system-ui, sans-serif" }}
      aria-hidden="true"
    >
      <div className="px-2 py-2 max-w-3xl mx-auto leading-snug">
        {/* 헤더 */}
        <div className="border-b-2 border-slate-900 pb-2 mb-3">
          <div className="flex items-baseline justify-between gap-3">
            <div>
              {/* uppercase를 적용하면 「iM뱅크」가 「IM뱅크」로 출력돼 브랜드 표기가 틀어진다 */}
              <div className="text-[9px] tracking-widest text-slate-500 font-bold">
                {brandLabel}
              </div>
              <h1 className="text-[17px] font-black text-slate-900 mt-0.5 leading-tight tracking-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-[11px] text-slate-700 mt-0.5">{subtitle}</p>
              )}
            </div>
            <div className="text-right text-[9px] text-slate-500 leading-snug flex-shrink-0">
              <div>인쇄일시: {printedAt}</div>
              {showId && <div>참조번호: {showId}</div>}
              {/* 고객이 자료를 가지고 돌아간 뒤 어디로 문의할지 알 수 있도록 손으로 적는 칸 */}
              <div className="mt-1.5">상담 점포 · 담당자</div>
              <div className="ml-auto mt-0.5 h-3 w-28 border-b border-slate-400" />
            </div>
          </div>
        </div>

        {/* 디스클레이머 — 가장 눈에 띄게 */}
        <div className={`border ${ac.box} rounded-sm p-2 mb-3 break-inside-avoid`}>
          <div className="flex items-start gap-1.5">
            <span className="text-sm leading-none mt-0.5">⚠</span>
            <div className="flex-1">
              <div className={`text-[10px] font-black ${ac.boxTitle} tracking-wider mb-0.5`}>
                본 안내는 추정치입니다. 반드시 확인해 주세요.
              </div>
              <p className="text-[10.5px] text-slate-900 leading-snug whitespace-pre-line">
                {disclaimer}
              </p>
            </div>
          </div>
        </div>

        {/* 입력 조건 — 어떤 조건으로 산정했는지 명시 */}
        {inputs.length > 0 && (
          <section className="mb-3 break-inside-avoid">
            <h2 className="text-[10px] font-black uppercase tracking-wider text-slate-700 border-b border-slate-300 pb-0.5 mb-1">
              입력 조건 (산정 기준)
            </h2>
            <table className="w-full text-[11px]">
              <tbody>
                {inputs.map(({ label, value }, i) => (
                  <tr key={i} className="border-b border-slate-100 last:border-b-0">
                    <td className="py-1 pr-3 text-slate-600 w-2/5 align-top">
                      {label}
                    </td>
                    <td className="py-1 text-slate-900 font-semibold">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* 추정 결과 — 핵심 수치는 박스로 부각, 세부는 표로 */}
        {results.length > 0 && (
          <section className="mb-3 break-inside-avoid">
            <h2 className="text-[10px] font-black uppercase tracking-wider text-slate-700 border-b border-slate-300 pb-0.5 mb-1.5">
              추정 결과
            </h2>

            {/* 핵심(emphasis) 결과 — 고객이 가장 먼저 보는 숫자 */}
            {results.some((r) => r.emphasis) && (
              <div className="mb-2 flex flex-wrap gap-2">
                {results
                  .filter((r) => r.emphasis)
                  .map(({ label, value, sub }, i) => (
                    <div
                      key={i}
                      className={`min-w-[9rem] flex-1 border-2 ${ac.box} rounded-sm px-3 py-1.5 break-inside-avoid`}
                    >
                      <div className={`text-[9px] font-black uppercase tracking-wider ${ac.boxTitle}`}>
                        {label}
                      </div>
                      <div className={`text-[18px] font-black leading-tight ${ac.rowText}`}>
                        {value}
                      </div>
                      {sub && (
                        <div className="mt-0.5 text-[9.5px] leading-snug text-slate-700">{sub}</div>
                      )}
                    </div>
                  ))}
              </div>
            )}

            {/* 세부 내역 */}
            {results.some((r) => !r.emphasis) && (
              <table className="w-full text-[11px]">
                <tbody>
                  {results
                    .filter((r) => !r.emphasis)
                    .map(({ label, value, sub }, i) => (
                      <tr key={i} className="border-b border-slate-100 last:border-b-0">
                        <td className="py-1 pr-3 text-slate-600 w-2/5 align-top">{label}</td>
                        <td className="py-1 text-slate-900 font-semibold">
                          {value}
                          {sub && (
                            <div className="text-[10px] font-normal text-slate-600 mt-0.5">{sub}</div>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </section>
        )}

        {/* 차트 (옵션) — 고정 사이즈로 전달되어야 hidden 상태에서도 안전하게 렌더 */}
        {chart && (
          <section className="mb-3 break-inside-avoid">
            <h2 className="text-[10px] font-black uppercase tracking-wider text-slate-700 border-b border-slate-300 pb-0.5 mb-1">
              시각화
            </h2>
            <div className="flex justify-center">{chart}</div>
          </section>
        )}

        {/* 참고 사항 */}
        {notes.length > 0 && (
          <section className="mb-3 break-inside-avoid">
            <h2 className="text-[10px] font-black uppercase tracking-wider text-slate-700 border-b border-slate-300 pb-0.5 mb-1">
              참고 사항
            </h2>
            <ul className="text-[10.5px] text-slate-800 leading-snug space-y-0.5">
              {notes.map((n, i) => (
                <li key={i} className="flex gap-1.5">
                  <span className="text-slate-500 flex-shrink-0">·</span>
                  <span className="flex-1 whitespace-pre-line">{n}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 푸터 — 법령 근거 + 출처 + 문의 + 단정 안내 금지 고지 */}
        <div className="border-t-2 border-slate-900 pt-1.5 mt-2 text-[9.5px] text-slate-700 leading-snug space-y-0.5 break-inside-avoid">
          {legalBasis && (
            <p>
              <strong className="text-slate-900">법령 근거:</strong> {legalBasis}
            </p>
          )}
          {sourceLine && (
            <p>
              <strong className="text-slate-900">출처:</strong> {sourceLine}
            </p>
          )}
          {contactLine && (
            <p>
              <strong className="text-slate-900">문의:</strong> {contactLine}
            </p>
          )}
          <p className="text-slate-500 mt-1">{footerNote}</p>

          {/* 심의를 받은 서식에만 번호를 표기한다. 심의 전에는 아무것도 붙이지 않고,
              대신 이 출력물을 「고객 교부용」이 아닌 상담용 자료로 다룬다. */}
          {complianceReviewNo && (
            <p className="mt-1 font-semibold text-slate-800">
              준법감시인 심의필 제{complianceReviewNo}호
              {complianceValidUntil && ` (유효기간 ~${complianceValidUntil})`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
