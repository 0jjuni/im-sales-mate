const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../public/data/wealth-bank');
const index = JSON.parse(fs.readFileSync(path.join(root, 'index.json'), 'utf8'));
const expected = ['상품안내', '펀드개요', '일별기준가', '차트분석', '성과분석', '위험분석', '포트폴리오분석', '보유내역'];
assert.equal(new Set(index.products.map(p => p.code)).size, index.products.length, 'Duplicate product codes');
let tables=0, rows=0;
const failures=[];
const unavailable=[];
for (const product of index.products) {
  try {
    const text=fs.readFileSync(path.join(root, product.code+'.json'), 'utf8');
    const data=JSON.parse(text);
    assert.equal(data.schemaVersion,3);
    assert.equal(data.code,product.code);
    assert.equal(data.name,product.name);
    assert(!text.includes('\uFFFD'),'Character decoding error');
    assert.deepEqual(data.sections.map(s=>s.name),expected);
    assert(data.bank.summary.replace(/\s/g,'').includes(product.name.replace(/\s/g,'')),'Bank product/class mismatch');
    const bankLabels=data.bank.tables.flatMap(t=>t.rows.flatMap(r=>r.map(c=>c.text)));
    assert(bankLabels.includes('수수료'),'Missing bank fee information');
    assert(bankLabels.includes('투자대상'),'Missing investment target');
    for(const section of data.sections){
      if(section.status==='unavailable')unavailable.push({code:product.code,name:product.name,section:section.name,error:section.error});
      assert(new URL(section.url).searchParams.get('panme_fund_cd')===product.code);
      for(const table of section.tables){
        tables++;rows+=table.rows.length;
        assert(table.rows.every(r=>r.every(c=>typeof c.text==='string'&&c.rowSpan>=1&&c.colSpan>=1)));
      }
    }
  } catch(error) { failures.push({code:product.code,error:error.message}); }
}
console.log(JSON.stringify({products:index.products.length,passed:index.products.length-failures.length,tables,rows,unavailable,failures},null,2));
if(failures.length)process.exitCode=1;
