/* Public product pages only. Run with Playwright installed; no login or user profile. */
const { chromium } = require('playwright');
const fs = require('node:fs/promises');
const path = require('node:path');
const output = path.resolve(__dirname, '../public/data/wealth-bank');
const listUrl = 'https://www.imbank.co.kr/fnf_ebz_33010_fund.act';
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
let activeBrowser;
const extract = () => {
  const scope = document.querySelector('#fundInfo') ? document.body : document.querySelector('article') || document.body;
  const clean = e => (e.innerText || e.textContent).replace(/\s+/g, ' ').trim();
  return {
    headings: [...scope.querySelectorAll('h2,h3')].map(clean),
    tables: [...scope.querySelectorAll('table')].filter(t => t.getBoundingClientRect().height > 0 && !/관심상품,\s*최근/.test(t.getAttribute('summary') || '')).map(t => ({
      title: t.getAttribute('summary') || t.querySelector('caption')?.textContent?.trim() || '',
      rows: [...t.rows].filter(r=>![...r.cells].some(c=>c.querySelector('table'))).map(r => [...r.cells].map(c => ({text:clean(c),rowSpan:c.rowSpan,colSpan:c.colSpan,header:c.tagName==='TH'}))),
    })).filter(t=>t.rows.some(r=>r.some(c=>c.text))),
  };
};
(async () => {
  await fs.mkdir(output,{recursive:true});
  const browser = await chromium.launch({channel:'msedge',headless:true});
  activeBrowser=browser;
  const context = await browser.newContext();
  const parserContext = await browser.newContext({javaScriptEnabled:false});
  await parserContext.route('**/*',route=>route.abort());
  const loadStatic = async (cp,url) => {
    let response;
    for(let attempt=0;attempt<3;attempt++){
      response=await context.request.get(url,{timeout:20000});
      if(response.ok() || response.status()<500)break;
      await pause(1000);
    }
    if(!response.ok())throw Error(`HTTP ${response.status()}: ${url}`);
    const html=new TextDecoder('euc-kr').decode(await response.body());
    await cp.setContent(`<base href="${url.replace(/&/g,'&amp;')}">`+html,{waitUntil:'domcontentloaded'});
  };
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  await page.goto(listUrl,{waitUntil:'domcontentloaded'});
  await page.locator('a[href*="goDetailPageCom"]').first().waitFor();
  const expectedCount=Number((await page.locator('body').innerText()).match(/총\s*(\d+)\s*건/)?.[1]);
  await page.evaluate(()=>reDrawTable(20));
  await pause(800);
  const products = [];
  let pageNo=1;
  while(true){
    const links=await page.locator('a[href*="goDetailPageCom"]').evaluateAll(es=>es.map(e=>({name:e.textContent.trim(),href:e.getAttribute('href')})));
    for(const link of links){const code=link.href.match(/goDetailPageCom\('([^']+)'/)[1];if(!products.some(p=>p.code===code))products.push({code,name:link.name});}
    const next=page.locator(`a[href="javascript:getList(${pageNo+1})"]`).first();
    if(!await next.count())break;
    const prev=links[0].href;
    await next.click();
    await page.waitForFunction(old=>{const href=document.querySelector('a[href*="goDetailPageCom"]')?.getAttribute('href');return href&&href!==old;},prev);
    pageNo++;
    await pause(350);
  }
  if(!expectedCount || products.length!==expectedCount)throw Error(`Incomplete catalogue: ${products.length}/${expectedCount}`);
  await fs.writeFile(path.join(output,'index.json'),JSON.stringify({source:listUrl,retrievedAt:new Date().toISOString(),products},null,2));
  console.log('CATALOGUE',products.length);
  for(const [i,product] of products.entries()){
    if(process.env.CRAWL_CODES && !process.env.CRAWL_CODES.split(',').includes(product.code))continue;
    if(i % Number(process.env.CRAWL_WORKERS || 1) !== Number(process.env.CRAWL_WORKER || 0))continue;
    const destination=path.join(output,product.code+'.json');
    let previous;
    try{previous=JSON.parse(await fs.readFile(destination,'utf8'));if(previous.schemaVersion===3)continue;}catch{}
    try{
      await page.evaluate(p=>goDetailPageCom(p.code,p.name,'fnf_ebz_33010_fund'),product);
      await page.waitForURL('**/fnf_ebz_31030_fund.act');
      await page.waitForFunction(p=>document.querySelector('#fundInfo')?.textContent.includes(p.name.split('(')[0])&&document.querySelector('#ifr_cms')?.getAttribute('src')?.includes(p.code),product);
      const bank=await page.evaluate(extract);
      const introUrl=await page.locator('#ifr_cms').getAttribute('src');
      const detailTitle=await page.locator('#fundInfo').innerText();
      if(!detailTitle.includes(product.name.split('(')[0]))throw Error('Product name mismatch');
      let sections=previous?.sections;
      if(!sections){
      const cp=await parserContext.newPage();
      await loadStatic(cp,introUrl);
      const tabs=await cp.locator('.tabMenu a').evaluateAll(es=>es.map(e=>({name:e.textContent.trim(),url:e.href})));
      if(tabs.length!==8)throw Error('Expected eight fund information tabs');
      sections=[];
      for(const tab of tabs){
        try {
        await loadStatic(cp,tab.url);
        const data=await cp.evaluate(extract);
        sections.push({...tab,...data});
        } catch(error) {
          sections.push({...tab,status:'unavailable',error:error.message,headings:[],tables:[]});
          console.log('UNAVAILABLE',product.code,tab.name,error.message);
        }
        await pause(200);
      }
      await cp.close();
      }
      await fs.writeFile(destination,JSON.stringify({schemaVersion:3,...product,retrievedAt:new Date().toISOString(),source:listUrl,coverage:{tables:true,chartGraphics:false,unavailableSections:sections.filter(s=>s.status==='unavailable').map(s=>s.name)},bank:{summary:detailTitle,...bank},sections}));
      console.log('SAVED',i+1,products.length,product.code);
    }catch(error){console.log('FAILED',product.code,error.message);process.exitCode=1;}
    await pause(350);
  }
  await browser.close();
})().catch(async e=>{console.error(e);if(activeBrowser)await activeBrowser.close();process.exitCode=1});
