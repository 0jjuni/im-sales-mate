const compact = text => text.replace(/\s/g, "");
const numeric = text => /^[-+]?\d[\d,]*(\.\d+)?$/.test(text || "") ? Number(text.replaceAll(",", "")) : null;
export const findSection = (data, name) => data.sections.find(s => s.name === name && s.status !== "unavailable");
export const sectionValue = (section, label) => section?.tables.flatMap(t => t.rows).find(r => compact(r[0]?.text || "") === compact(label))?.[1]?.text || null;
export const sourceDate = (section, prefix) => section?.headings.find(h => h.startsWith(prefix))?.match(/\d{4}\.\d{2}\.\d{2}/)?.[0] || null;

export function shares(section, tableName, columnName) {
  const table = section?.tables.find(t => t.title === tableName);
  const column = table?.rows[0]?.findIndex(c => compact(c.text) === compact(columnName));
  if (column == null || column < 0) return [];
  return table.rows.slice(1).map(r => ({name:r[0]?.text, value:numeric(r[column]?.text), display:r[column]?.text})).filter(r => r.name && r.value != null);
}

export function fundHighlights(data) {
  const profile = findSection(data, "펀드개요");
  const portfolio = findSection(data, "포트폴리오분석");
  const holding = findSection(data, "보유내역");
  return {
    profileDate:sourceDate(profile,"펀드현황"),
    facts:[
      ["투자지역",sectionValue(profile,"투자지역")],
      ["펀드 유형",sectionValue(profile,"제로인 평가유형")],
      ["펀드 순자산",sectionValue(profile,"펀드 순자산액")],
      ["펀드 출범일",sectionValue(profile,"펀드출범일")?.replace(/\s*\(.*$/, "")],
    ],
    familySize:sectionValue(profile,"패밀리 운용규모"),
    compositionDate:sourceDate(portfolio,"자산구성"),
    industryDate:sourceDate(portfolio,"업종별"),
    assets:shares(portfolio,"자산구성리스트","펀드내비중"),
    industries:shares(portfolio,"업종별 주식 투자비중","주식내 비중"),
    holdingDate:sourceDate(holding,"보유내역"),
    stocks:shares(holding,"보유주식 리스트","펀드내 비중"),
    bonds:shares(holding,"보유채권 리스트","펀드내 비중"),
    stockCount:sectionValue(holding,"총보유 주식종목"),
    bondCount:sectionValue(holding,"총보유 채권종목"),
    stockTop10:sectionValue(holding,"주식 TOP10 종목비중"),
    bondTop10:sectionValue(holding,"채권 TOP10 종목비중"),
  };
}
