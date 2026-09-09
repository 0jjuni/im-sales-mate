const fs=require('node:fs');
const path=require('node:path');
const Module=require('node:module');
const {buildSync}=require('esbuild');
const root=path.resolve(__dirname,'..');
const bundle=buildSync({entryPoints:[path.join(root,'src/hub/data/wealthProducts.js')],bundle:true,platform:'node',format:'cjs',write:false});
const catalogue=new Module('wealth-catalogue');
catalogue._compile(bundle.outputFiles[0].text,'wealth-catalogue.cjs');
const products=catalogue.exports.PRODUCTS.filter(p=>p.type==='펀드');
const index=JSON.parse(fs.readFileSync(path.join(root,'public/data/wealth-bank/index.json'),'utf8'));
// Retain class letters. Only presentation punctuation and explicit class descriptions are removed.
const key=name=>name.replace(/\s*\((?:클[래레]스\s*상세\s*:|수수료)[\s\S]*$/,'').replace(/[\s()[\]·-]/g,'').toLowerCase();
const mapping={},unmatched=[],ambiguous=[];
for(const product of products){
  const candidates=index.products.filter(p=>key(p.name)===key(product.name));
  if(candidates.length===1)mapping[product.id]=candidates[0].code;
  else if(candidates.length>1)ambiguous.push({id:product.id,name:product.name,codes:candidates.map(p=>p.code)});
  else unmatched.push({id:product.id,name:product.name});
}
const report={matched:Object.keys(mapping).length,catalogueCount:products.length,mapping,unmatched,ambiguous};
fs.writeFileSync(path.join(root,'public/data/wealth-bank/catalogue-map.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify({matched:report.matched,catalogueCount:products.length,unmatched,ambiguous},null,2));
