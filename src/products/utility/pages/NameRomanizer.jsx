import { useMemo, useState } from "react";
import { UserRound, AlertTriangle, Check, Copy } from "lucide-react";
import { romanizeWord, romanizeEachSyllable, isAllHangul } from "../lib/hangul";
import { SURNAMES, COMPOUND_SURNAMES } from "../data/surnames";
import { cn } from "@shared/lib/format";

/* 영문 이름 변환기.
   근거: 국어의 로마자 표기법 제3장 제4항(인명) + 여권 관용 표기

   표기법 원칙 두 가지를 반영한다.
   1. 성과 이름은 띄어 쓰고, 이름은 붙여 쓰는 것을 원칙으로 한다(붙임표 허용).
   2. 이름에서 일어나는 음운 변화는 표기에 반영하지 않는다.
      (한복남 Han Boknam, 홍빛나 Hong Bitna — 비음화를 적용하지 않음)

   성씨는 표기법대로면 김=Gim이지만 여권에는 KIM을 쓰는 사람이 대부분이라
   관용 표기를 먼저 제시하고 다른 후보를 함께 보여준다. */

const CopyChip = ({ value, label }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };
  return (
    <button
      onClick={copy}
      title="복사"
      className={cn(
        "group inline-flex items-center gap-2 rounded-md border px-3 py-2 text-left transition-colors",
        copied
          ? "border-sky-500 bg-sky-50"
          : "border-stone-200 bg-white hover:border-sky-400"
      )}
    >
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-bold tracking-wide text-stone-900">
          {value}
        </span>
        {label && <span className="block text-[11px] text-stone-500">{label}</span>}
      </span>
      {copied ? (
        <Check className="h-4 w-4 flex-shrink-0 text-sky-600" />
      ) : (
        <Copy className="h-4 w-4 flex-shrink-0 text-stone-300 group-hover:text-stone-500" />
      )}
    </button>
  );
};

/* 성과 이름 분리 — 두 글자 성을 먼저 확인한다 */
const splitName = (name) => {
  const chars = [...name];
  if (chars.length >= 3) {
    const two = chars.slice(0, 2).join("");
    if (COMPOUND_SURNAMES[two]) {
      return { surname: two, given: chars.slice(2).join(""), compound: true };
    }
  }
  return { surname: chars[0] ?? "", given: chars.slice(1).join(""), compound: false };
};

export const NameRomanizer = () => {
  const [input, setInput] = useState("");

  const result = useMemo(() => {
    const name = input.replace(/\s+/g, "");
    if (!name) return null;
    if (!isAllHangul(name)) return { error: "한글 이름만 변환할 수 있습니다." };
    if ([...name].length < 2) return { error: "성과 이름을 모두 입력해 주세요." };

    const { surname, given, compound } = splitName(name);
    const table = compound ? COMPOUND_SURNAMES : SURNAMES;
    const entry = table[surname];

    /* 성씨 표에 없으면 로마자 표기법대로 변환해 후보로 제시 */
    const surnamePrimary = entry
      ? entry.primary
      : romanizeWord(surname, { linkAcross: false }).toUpperCase();
    const surnameAlts = entry ? entry.alts : [];
    const surnameKnown = Boolean(entry);

    /* 이름은 음운 변화를 반영하지 않는다(표기법 제4항 [붙임]) */
    const syllables = romanizeEachSyllable(given).map((s, i) => {
      const plain = romanizeWord([...given][i], { capitalize: false, linkAcross: false });
      return plain || s;
    });
    const joined = syllables.join("");
    const givenJoined = joined.charAt(0).toUpperCase() + joined.slice(1);
    const givenHyphen =
      syllables.length > 1
        ? syllables
            .map((s, i) => (i === 0 ? s.charAt(0).toUpperCase() + s.slice(1) : s))
            .join("-")
        : givenJoined;

    return {
      surname,
      given,
      surnamePrimary,
      surnameAlts,
      surnameKnown,
      givenJoined,
      givenHyphen,
      candidates: [
        { value: `${surnamePrimary} ${givenJoined.toUpperCase()}`, label: "여권 표기 형식 (전체 대문자)" },
        { value: `${surnamePrimary} ${givenJoined}`, label: "성 대문자 + 이름 첫 글자만 대문자" },
        { value: `${surnamePrimary} ${givenHyphen.toUpperCase()}`, label: "이름 음절 사이 붙임표" },
      ],
    };
  }, [input]);

  return (
    <div className="space-y-5">
      <div>
        <span className="text-xs uppercase tracking-widest text-sky-700 font-semibold">
          Name Romanization
        </span>
        <h1 className="text-2xl md:text-3xl font-bold text-stone-900 tracking-tight mt-1">
          영문 이름 변환기
        </h1>
        <p className="text-sm text-stone-600 mt-1">
          카드 발급 신청서나 해외송금 서식에 적을 영문 이름을 만듭니다. 고객이 영문 표기를 모를 때
          대신 적어 드리는 용도입니다.
        </p>
      </div>

      <div className="rounded-md border border-stone-200 bg-white px-4 py-3">
        <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
          어느 표기를 쓸지
        </div>
        <div className="mt-1.5 grid gap-2 sm:grid-cols-2">
          <div className="rounded-sm border-l-4 border-sky-400 bg-sky-50/50 px-3 py-2">
            <div className="text-[12px] font-bold text-stone-900">여권이 있으면</div>
            <p className="mt-0.5 text-[11.5px] leading-relaxed text-stone-600">
              여권 표기를 그대로 쓰세요. 특히 해외에서 쓸 카드나 해외송금은 여권과 다르면 문제가
              생길 수 있습니다.
            </p>
          </div>
          <div className="rounded-sm border-l-4 border-emerald-400 bg-emerald-50/50 px-3 py-2">
            <div className="text-[12px] font-bold text-stone-900">여권이 없거나 모르시면</div>
            <p className="mt-0.5 text-[11.5px] leading-relaxed text-stone-600">
              아래 표기를 사용하시면 됩니다. 국내 사용 카드는 여권과 맞출 필요가 없습니다.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-md border border-stone-200 bg-white p-5">
        <label className="mb-1.5 block text-xs font-bold text-stone-700">한글 이름</label>
        <div className="relative">
          <UserRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="예: 홍길동"
            autoFocus
            className="w-full rounded-md border border-stone-300 py-2.5 pl-9 pr-3 text-[15px] focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-200"
          />
        </div>

        {result?.error && (
          <p className="mt-2 text-[12px] text-rose-600">{result.error}</p>
        )}

        {result && !result.error && (
          <div className="mt-4 space-y-4">
            <div className="rounded-md border-2 border-sky-300 bg-gradient-to-br from-sky-50 to-white p-4">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700">
                  권장 표기
                </span>
                {/* 카드 각인은 글자 수 제한이 있어 미리 보여 준다 */}
                <span className="text-[11px] text-stone-500">
                  공백 포함 {`${result.surnamePrimary} ${result.givenJoined}`.length}자
                </span>
              </div>
              {/* 서식에 옮겨 적는 용도라 크게, 글자 간격을 넓혀 한 글자씩 구분되게 */}
              <div className="mt-1.5 break-all text-3xl font-black leading-tight tracking-[0.12em] text-stone-900 sm:text-4xl">
                {result.surnamePrimary} {result.givenJoined.toUpperCase()}
              </div>
              <div className="mt-2 text-[12px] text-stone-600">
                성 {result.surname} → {result.surnamePrimary}
                {result.surnameKnown ? " (여권에 많이 쓰는 표기)" : " (로마자 표기법 변환)"} · 이름{" "}
                {result.given} → {result.givenJoined}
              </div>
            </div>

            <div>
              <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-stone-500">
                다른 표기 형식
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {result.candidates.map((c) => (
                  <CopyChip key={c.value} value={c.value} label={c.label} />
                ))}
              </div>
            </div>

            {result.surnameAlts.length > 0 && (
              <div>
                <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-stone-500">
                  성씨 다른 표기 · 고객 여권과 대조하세요
                </div>
                <div className="flex flex-wrap gap-2">
                  {[result.surnamePrimary, ...result.surnameAlts].map((s, i) => (
                    <span
                      key={s}
                      className={cn(
                        "rounded-full px-3 py-1 text-[13px] font-bold",
                        i === 0
                          ? "bg-sky-600 text-white"
                          : "border border-stone-300 bg-white text-stone-600"
                      )}
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <p className="mt-1.5 text-[11px] leading-relaxed text-stone-500">
                  같은 성이라도 사람마다 쓰는 표기가 다릅니다. 고객이 이미 쓰던 표기가 있으면 그것을
                  쓰시고, 여권이 있으면 여권 표기가 우선입니다.
                </p>
              </div>
            )}

            {!result.surnameKnown && (
              <div className="rounded-sm border border-stone-200 bg-stone-50 px-3 py-2 text-[11.5px] leading-relaxed text-stone-600">
                자주 쓰이는 성씨 목록에 없는 성이라 로마자 표기법대로 변환했습니다. 실제 여권
                표기와 다를 수 있으니 반드시 확인해 주세요.
              </div>
            )}
          </div>
        )}
      </div>

      <div className="rounded-md border border-stone-200 bg-stone-50 p-3 text-[11.5px] leading-relaxed text-stone-600">
        <strong className="text-stone-800">표기 원칙:</strong> 국어의 로마자 표기법에 따라 성과
        이름을 띄어 쓰고 이름은 붙여 씁니다. 이름에서 일어나는 음운 변화는 표기에 반영하지
        않습니다. 예를 들어 한복남은 Han Bongnam이 아니라 Han Boknam입니다. 성씨는 표기법상
        Gim, I, Bak이지만 여권에는 KIM, LEE, PARK 같은 관용 표기를 쓰는 경우가 대부분이라 관용
        표기를 먼저 제시합니다.
      </div>
    </div>
  );
};
