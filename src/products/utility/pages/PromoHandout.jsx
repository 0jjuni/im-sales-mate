import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Megaphone, Printer, FileText, AlertTriangle, Sparkles } from "lucide-react";
import { QrSvg, buildQrPath } from "../components/QrCode";
import { cn } from "@shared/lib/format";

/* 상품 가입 안내문 (eBiz 연동).

   창구에서 상품을 권유했는데 고객이 「지금 바쁘니 나중에 가입하겠다」며 나갈 때,
   문자 링크 대신 그 자리에서 종이로 건네는 안내문을 만든다.

   eBiz에서 만든 「가입 링크」(고객이 타고 들어가 가입하면 담당 직원 실적으로 잡힘)와
   해당 카드의 심의필 광고 문구를 붙여넣으면 —
     · 가입 링크를 QR로 변환하고
     · 승인된 광고 문구를 그대로(verbatim) 실은
   A4 안내문을 인쇄한다.

   심의필 문구는 광고 규제 대상이라 임의로 고치지 않고 붙여넣은 원문 그대로 출력한다.
   실서비스에서는 eBiz 링크 생성 화면과 직접 연동해 「링크 가져오기」로 대체할 수 있다. */

/* eBiz 광고 문구 붙여넣기 → 구조 분해.
   상품명·헤드라인은 배치용으로만 뽑고, 확인사항 본문은 원문 그대로 보존한다. */
const parseAd = (text) => {
  const raw = (text || "").replace(/\r\n/g, "\n");
  if (!raw.trim()) return null;

  const urlMatch = raw.match(/https?:\/\/[^\s]+/);
  const url = urlMatch ? urlMatch[0].replace(/[)\]>.,、。]+$/, "") : "";

  // 상품명 — 「■ "OOO" 상품가입」 패턴
  let product = "";
  const pm = raw.match(/■\s*["“”'‘’]?\s*([^\n"“”'‘’]+?)\s*["“”'‘’]?\s*상품\s*가입/);
  if (pm) product = pm[1].trim();

  // ■ 이전 줄 = 홍보 헤드라인/혜택
  const markerIdx = raw.indexOf("■");
  const preamble =
    markerIdx > 0
      ? raw.slice(0, markerIdx).split("\n").map((s) => s.trim()).filter(Boolean)
      : [];
  const eyebrow = preamble[0] || "";
  const benefit = preamble.slice(1).join(" ");

  // 심의필 — 별도 푸터로 뽑는다
  const approvals = raw.match(/\[[^\]]*심의필[^\]]*\]/g) || [];

  // 확인사항 본문 = 「반드시 확인」부터 끝까지(심의필 라인 제외). 없으면 링크 뒤부터.
  let body = "";
  const chk = raw.search(/\[?\s*반드시\s*확인/);
  if (chk >= 0) body = raw.slice(chk);
  else if (urlMatch) body = raw.slice(raw.indexOf(urlMatch[0]) + urlMatch[0].length);
  else body = raw;
  approvals.forEach((a) => {
    body = body.split(a).join("");
  });
  body = body.replace(/\n{3,}/g, "\n\n").trim();

  return { url, product, eyebrow, benefit, approvals, body };
};

/* 데모용 예시 — iM세븐캐쉬백카드 (심의필 문구 원문) */
const SAMPLE_TEXT = `심플한 카드를 찾는다면?
국내 및 해외가맹점 7% 청구할인 (단, 전월실적 30만원 이상)

■ "iM세븐캐쉬백카드" 상품가입
☞ https://mbanking.imbank.co.kr/com_ebz_mbs_00001.act?svcId=com_ebz_sbs_30020_0001&sms_seqno=3030011781

[반드시 확인하세요]
- 연회비 : BC(국내전용) 1만원, Master(해외겸용) 1만 2천원
※ 상환능력에 비해 신용카드 사용액이 과도할 경우, 귀하의 개인신용평점이 하락할 수 있습니다.
※ 개인신용평점 하락 시 금융거래와 관련된 불이익이 발생할 수 있습니다.
※ 일정기간 납부 대금을 연체할 경우, 모든 납부 대금을 변제할 의무가 발생할 수 있습니다.
※ 연체이자율 : 회원별 · 이용상품별 『정상이자율 + 3%p , 최고 연 20%』
- 카드 신청 전 상품설명서와 약관을 반드시 읽어보시기 바랍니다.
- 신용카드 발급이 부적정한 경우(연체금 보유, 신용점수 낮음 등)카드발급이 제한될 수 있습니다.
- 카드이용대금과 이에 수반되는 모든 수수료를 지정된 대금 결제일에 상환합니다.
- 금융소비자는 금융소비자보호법 제19조 제1항에 따라 해당상품 또는 서비스에 대하여 설명을 받을 권리가 있으며, 그 설명을 듣고 내용을 충분히 이해한 후 거래하시기 바랍니다.

- 자세한 사항은 iM뱅크 고객센터(☎1566-5050)로 문의 부탁드립니다.
- 이 광고는 법령 및 은행의 내부통제 기준에 따른 광고 관련 절차를 준수하여 작성되었습니다.

[준법감시인 심의필 제26-92호(2026.02.01~2027.01.31)]
[여신금융협회 심의필 제2026-C1f-00960호(2026.02.01~2027.01.31)]`;

const SAMPLE_PROSPECTUS = "/promo/im-seven-cashback.pdf#page=5";

/* 링크를 절대 URL로 — QR을 고객 휴대폰에서 열 수 있어야 한다.
   앱 내부 경로(상품설명서 등)는 배포 도메인 기준으로 만든다. */
const absoluteUrl = (u) => {
  const s = (u || "").trim();
  if (!s) return "";
  if (/^https?:\/\//i.test(s)) return s;
  if (typeof window !== "undefined") {
    return s.startsWith("/") ? window.location.origin + s : `https://${s}`;
  }
  return s;
};

export const PromoHandout = () => {
  const [rawText, setRawText] = useState("");
  const [prospectus, setProspectus] = useState("");

  const parsed = useMemo(() => parseAd(rawText), [rawText]);
  const url = parsed?.url || "";
  const prospectusUrl = absoluteUrl(prospectus);

  /* QR 용량·밀도 판단 — 전표 QR과 동일 기준(모듈 56 초과 시 촘촘) */
  const qrSize = useMemo(() => {
    if (!url) return null;
    try {
      return buildQrPath(url).size;
    } catch {
      return 0;
    }
  }, [url]);
  const tooLong = qrSize === 0;
  const tooDense = qrSize > 56;
  const ready = Boolean(url) && !tooLong;

  useEffect(() => {
    const cleanup = () => document.documentElement.classList.remove("printing-promo");
    window.addEventListener("afterprint", cleanup);
    return () => {
      window.removeEventListener("afterprint", cleanup);
      cleanup();
    };
  }, []);

  const handlePrint = () => {
    document.documentElement.classList.add("printing-promo");
    setTimeout(() => window.print(), 30);
  };

  const loadSample = () => {
    setRawText(SAMPLE_TEXT);
    setProspectus(SAMPLE_PROSPECTUS);
  };

  return (
    <>
      <div className="space-y-5 print:hidden">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            상품 가입 안내문
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            eBiz 가입 링크와 심의필 광고 문구로, 고객에게 바로 인쇄해 드릴 안내문을 만듭니다.
          </p>
        </div>

        {/* eBiz 연동 안내 */}
        <div className="flex items-start gap-2 rounded-xl border border-sky-200 bg-sky-50/50 px-4 py-3">
          <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-sky-600" />
          <p className="text-[12.5px] leading-relaxed text-slate-700">
            eBiz에서 만든 <strong className="font-semibold text-slate-900">가입 링크</strong>는
            고객이 타고 들어가 가입하면 담당 직원 실적으로 잡힙니다. 그 링크가 포함된{" "}
            <strong className="font-semibold text-slate-900">심의필 광고 문구</strong>를 아래에
            붙여넣으면, 링크는 QR로 바꾸고 문구는 그대로 실어 안내문으로 인쇄합니다.
            <span className="mt-1 block text-[11.5px] text-slate-500">
              실서비스에서는 eBiz 링크 생성 화면과 연동해 「링크 가져오기」로 대체됩니다.
            </span>
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <div>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-700">
                eBiz 광고 문구 붙여넣기
              </label>
              <button
                onClick={loadSample}
                className="rounded-full border border-slate-300 px-2.5 py-1 text-[11px] font-semibold text-slate-500 transition-colors hover:border-sky-400 hover:text-sky-700"
              >
                예시 불러오기 (iM세븐캐쉬백카드)
              </button>
            </div>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              rows={9}
              placeholder={"eBiz에서 복사한 광고 문구 전체를 붙여넣으세요.\n(상품명 · 가입 링크 · 확인사항 · 심의필 번호 포함)"}
              className="w-full resize-y rounded-sm border border-slate-300 px-3 py-2.5 text-[13px] leading-relaxed focus:border-sky-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700">
              상품설명서 링크{" "}
              <span className="font-medium text-slate-400">(선택 · 안내문에 QR로 함께 인쇄)</span>
            </label>
            <input
              value={prospectus}
              onChange={(e) => setProspectus(e.target.value)}
              placeholder="예: 상품설명서 PDF 주소"
              className="w-full rounded-sm border border-slate-300 px-3 py-2.5 text-sm focus:border-sky-500 focus:outline-none"
            />
          </div>
        </div>

        {(tooLong || tooDense) && (
          <div className="flex items-start gap-2 rounded-r-sm border-l-4 border-amber-500 bg-amber-50/60 px-4 py-2.5">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
            <p className="text-xs leading-relaxed text-slate-800">
              {tooLong
                ? "가입 링크가 너무 길어 QR로 만들 수 없습니다. eBiz 단축 링크를 사용해 주세요."
                : "링크가 길어 QR이 촘촘합니다. 인쇄물에서 잘 안 읽힐 수 있으니 단축 링크를 권합니다."}
            </p>
          </div>
        )}

        {rawText.trim() && !url && (
          <div className="flex items-start gap-2 rounded-r-sm border-l-4 border-amber-500 bg-amber-50/60 px-4 py-2.5">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
            <p className="text-xs leading-relaxed text-slate-800">
              붙여넣은 문구에서 가입 링크(http로 시작)를 찾지 못했습니다. 링크가 포함됐는지 확인해 주세요.
            </p>
          </div>
        )}

        {/* 미리보기 */}
        {ready && parsed && (
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-sky-700">미리보기</div>
            <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="flex-shrink-0 rounded-sm border border-slate-200 bg-white p-3">
                <QrSvg text={url} size="180px" />
                <div className="mt-1 text-center text-[10px] text-slate-500">가입 QR</div>
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                {parsed.eyebrow && (
                  <div className="text-[13px] font-semibold text-sky-700">{parsed.eyebrow}</div>
                )}
                {parsed.product && (
                  <div className="text-[20px] font-black leading-tight tracking-tight text-slate-900">
                    {parsed.product}
                  </div>
                )}
                {parsed.benefit && (
                  <p className="text-[14px] font-semibold leading-snug text-slate-700">
                    {parsed.benefit}
                  </p>
                )}
                <p className="break-all pt-1 text-[12px] leading-relaxed text-slate-500">{url}</p>

                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    onClick={handlePrint}
                    className="inline-flex items-center gap-1.5 rounded-sm bg-slate-900 px-3.5 py-2 text-[12.5px] font-bold text-white transition-colors hover:bg-slate-700"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    안내문 인쇄
                  </button>
                  {prospectusUrl && (
                    <a
                      href={prospectusUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-sm border border-slate-300 px-3 py-2 text-[12.5px] font-semibold text-slate-600 transition-colors hover:border-sky-400 hover:text-sky-700"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      상품설명서 열기
                    </a>
                  )}
                </div>
              </div>
            </div>

            <p className="mt-4 border-t border-slate-100 pt-3 text-[11px] leading-relaxed text-slate-500">
              심의필 광고 문구는 임의로 고치지 않고 붙여넣은 원문 그대로 인쇄됩니다. 인쇄 전 QR을 직접 찍어 링크가 맞는지 확인하세요.
            </p>
          </div>
        )}
      </div>

      {/* 인쇄 전용 A4 안내문 — body로 포탈해 화면(#root)과 분리 */}
      {ready &&
        parsed &&
        createPortal(<PromoPrint parsed={parsed} url={url} prospectusUrl={prospectusUrl} />, document.body)}
    </>
  );
};

const PromoPrint = ({ parsed, url, prospectusUrl }) => {
  const now = new Date();
  const printedAt = `${now.getFullYear()}. ${String(now.getMonth() + 1).padStart(2, "0")}. ${String(
    now.getDate()
  ).padStart(2, "0")}`;

  return (
    <div
      className="hidden print:block print-report bg-white text-slate-900"
      style={{ fontFamily: "'Noto Sans KR', 'Pretendard', system-ui, sans-serif" }}
      aria-hidden="true"
    >
      <div className="mx-auto max-w-3xl px-2 py-2 leading-snug">
        {/* 헤더 */}
        <div className="flex items-baseline justify-between border-b-2 border-slate-900 pb-2">
          <span className="text-[10px] font-black tracking-widest text-slate-500">
            iM뱅크 · 상품 가입 안내
          </span>
          <span className="text-[9px] text-slate-500">인쇄일 {printedAt}</span>
        </div>

        {/* 헤드라인 + QR */}
        <div className="mt-3 flex items-start gap-5">
          <div className="min-w-0 flex-1">
            {parsed.eyebrow && (
              <div className="text-[13px] font-bold text-sky-700">{parsed.eyebrow}</div>
            )}
            {parsed.product && (
              <h1 className="mt-1 text-[26px] font-black leading-tight tracking-tight text-slate-900">
                {parsed.product}
              </h1>
            )}
            {parsed.benefit && (
              <p className="mt-2 text-[15px] font-semibold leading-snug text-slate-800">
                {parsed.benefit}
              </p>
            )}

            <div className="mt-3 rounded border border-slate-300 bg-slate-50 px-3 py-2">
              <div className="text-[11px] font-bold text-slate-700">가입 방법</div>
              <p className="mt-0.5 text-[11px] text-slate-700">
                휴대폰 카메라로 오른쪽 QR을 비추면 가입 화면으로 바로 연결됩니다.
              </p>
              <p className="mt-1 break-all text-[9px] text-slate-500">{url}</p>
            </div>
          </div>

          <div className="flex-shrink-0 text-center">
            <div className="rounded border border-slate-300 bg-white p-2">
              <QrSvg text={url} size="40mm" />
            </div>
            <div className="mt-1 text-[9.5px] font-semibold text-slate-600">QR로 바로 가입</div>
            {prospectusUrl && (
              <div className="mt-2 border-t border-dashed border-slate-300 pt-2">
                <div className="inline-block rounded border border-slate-200 bg-white p-1">
                  <QrSvg text={prospectusUrl} size="22mm" />
                </div>
                <div className="mt-0.5 text-[8.5px] text-slate-500">상품설명서</div>
              </div>
            )}
          </div>
        </div>

        {/* 담당 기재란 */}
        <div className="mt-2 flex items-end justify-end gap-2 text-[9.5px] text-slate-600">
          <span>상담 점포 · 담당자</span>
          <span className="inline-block h-3 w-32 border-b border-slate-400" />
        </div>

        {/* 확인사항 — 심의필 원문 그대로 */}
        {parsed.body && (
          <section className="mt-3 border-t border-slate-300 pt-2 break-inside-avoid">
            <p className="whitespace-pre-wrap text-[9px] leading-snug text-slate-700">
              {parsed.body}
            </p>
          </section>
        )}

        {/* 심의필 */}
        {parsed.approvals.length > 0 && (
          <div className="mt-2 space-y-0.5 border-t-2 border-slate-900 pt-1.5 text-[9px] font-semibold text-slate-700">
            {parsed.approvals.map((a, i) => (
              <div key={i}>{a}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
