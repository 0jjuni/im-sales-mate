# AI 모닝 브리핑 자동화 설정 (Apps Script + 구글시트)

뉴스를 자동 수집·요약해 **초안(draft)**으로 쌓고, 담당자가 검수해 **발행(published)**한 것만 앱에 노출한다.
사람 검수 단계가 곧 컴플라이언스 안전장치다.

```
RSS 수집 → Gemini 요약 → 시트 draft 적재 → [담당자 검수 → published] → doGet JSON → 앱 fetch
```

---

## 1. 구글시트 만들기

1. 새 구글시트 생성.
2. 시트 이름을 `briefing`으로 (안 하면 스크립트가 자동 생성).
3. 1행에 헤더를 **정확히 이 순서**로:

   ```
   id | date | status | importance | category | headline | summary | pbNote | source | sourceUrl
   ```

## 2. Apps Script 붙여넣기

1. 시트에서 **확장 프로그램 → Apps Script**.
2. `Code.gs`의 내용을 전부 붙여넣고 저장.

## 3. Gemini API 키 발급·등록

1. [Google AI Studio](https://aistudio.google.com/apikey)에서 **API 키 생성** (무료 티어 있음).
2. Apps Script 좌측 **프로젝트 설정(톱니) → 스크립트 속성 → 속성 추가**
   - 이름: `GEMINI_API_KEY`
   - 값: 발급받은 키

## 4. 첫 실행·검수 테스트

1. 상단 함수 선택에서 `collectAndDraft` → **실행**. 첫 실행 시 권한 승인 팝업 허용.
2. 시트에 `status = draft` 행들이 쌓이는지 확인.
3. **검수**: 각 행의 `summary`·`pbNote`를 읽고
   - 사실/수치 이상 없으면 `status`를 `published`로 변경
   - 이상하면 고치거나 행 삭제
   - `importance`(high/normal)도 상황에 맞게 조정

   > 매일의 검수 절차·체크리스트는 [REVIEW.md](REVIEW.md)(담당자용) 참고.

## 5. 시간 트리거 설정

1. Apps Script 좌측 **트리거(시계 아이콘) → 트리거 추가**
   - 실행할 함수: `collectAndDraft`
   - 이벤트 소스: 시간 기반 → 일 단위 → 오전 6~7시
2. 저장. 이제 매일 아침 자동으로 draft가 쌓인다(검수는 여전히 사람이).

## 6. 웹앱으로 배포 → 엔드포인트 확보

1. Apps Script 우상단 **배포 → 새 배포 → 유형: 웹 앱**
   - 실행: **나(me)**
   - 액세스 권한: **모든 사용자**  *(⚠ 아래 보안 주의 참고)*
2. 배포하면 나오는 **웹 앱 URL**을 복사 (`https://script.google.com/macros/s/…/exec`).

## 7. 프론트에 연결

`src/hub/data/morningBriefing.js` 상단의 상수에 URL을 넣는다:

```js
export const BRIEFING_ENDPOINT = "https://script.google.com/macros/s/…/exec";
```

- 값이 있으면 앱이 그 엔드포인트에서 뉴스를 가져오고, **실패하거나 비어 있으면 기존 목업으로 자동 후퇴**한다.
- 코드 수정·재배포 없이도 되돌리려면 `null`로 두면 된다.

---

## 주의사항

- **정확성**: Gemini 요약은 사실검증을 못 한다. 반드시 4번 검수 단계를 거친 `published`만 노출된다. 프롬프트에 "수치는 원문에 있는 것만" 제약을 넣었지만, 최종 책임은 검수자에게 있다.
- **저작권**: 기사 원문을 그대로 저장·재배포하지 않는다. 요약은 재작성본이며 `sourceUrl`로 출처를 남긴다.
- **보안(웹앱 공개 범위)**: "모든 사용자" 배포는 URL을 아는 사람 누구나 볼 수 있다. **데모용**이다.
  - **접근토큰(내장)**: 스크립트 속성에 `ACCESS_TOKEN`을 추가하면 `?token=값`이 일치할 때만 응답한다.
    이때 프론트의 `BRIEFING_ENDPOINT`를 `https://…/exec?token=값` 형태로 넣는다.
    단, 토큰이 프론트 번들에 노출되므로 완전한 보안이 아니라 **크롤링·캐주얼 접근 차단** 수준이다.
  - 실서비스의 진짜 접근통제는 **자체 서버/프록시**를 앞단에 둬야 한다.
- **CORS**: 브라우저에서 웹앱 URL을 바로 `fetch`할 때 CORS로 막히면, 시세(`marketQuotes.js`)가 쓰는 것과 같은 CORS 프록시를 앞에 붙이면 된다.
- **무료 쿼터**: Gemini 무료 티어에는 분당·일일 한도가 있다. `MAX_ITEMS_PER_RUN`으로 1회 처리량을 제한해 두었다.

## 뉴스 소스 조정

`Code.gs`의 `RSS_FEEDS`는 기본으로 **금융위원회 보도자료 RSS(1차 출처)** + Google News 키워드 검색을 함께 쓴다.
- 1차 출처를 더 넣으려면 각 기관 보도자료 페이지의 RSS 링크를 추가:
  - 금융위원회(이미 포함): `https://www.fsc.go.kr/about/fsc_bbs_rss/?fid=0111`
  - 한국은행: RSS 없음(뉴스레터만) → Google News 키워드로 대체.
  - 기획재정부: 국문 RSS 불명확, 영문 RSS만 확인됨(`http://english.moef.go.kr/pc/engmosfrss.do?boardCd=N0001`).
- 1차 출처는 사실관계가 정확해 요약 신뢰도가 높다(대신 건수는 적다).
- **한글이 깨지면** 인코딩(EUC-KR) 이슈이므로 `parseRss_`의 `getContentText()`를 `getContentText('EUC-KR')`로 바꾼다.
