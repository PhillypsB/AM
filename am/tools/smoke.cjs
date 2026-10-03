/* Optional browser regression. Install Playwright or set PLAYWRIGHT_MODULE. */
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
const base=process.env.AM_BASE_URL||'http://127.0.0.1:8765/am/';
(async()=>{
 const browser=await chromium.launch({headless:true,channel:process.env.AM_BROWSER||'msedge'});
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const errors=[],requests=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));
 const fixture=new URL(base);fixture.searchParams.set('corte','2026-08-31');
 await page.goto(fixture.href);await page.waitForFunction(()=>window.ultimoResultado&&window.AMPremium);
 assert(!requests.some(u=>/ccpp_|word-logo|maplibre-gl\.js/.test(u)),'Heavy resource loaded during national startup');
 console.log('INITIAL',JSON.stringify(await page.evaluate(()=>({resources:performance.getEntriesByType('resource').length,transfer:performance.getEntriesByType('resource').reduce((s,r)=>s+r.transferSize,0)}))));
 await page.locator('#buscadorAmbito').fill('Pichari');
 await page.locator('.busca-item').filter({hasText:'Distrito'}).first().click();
 await page.waitForFunction(()=>ultimoResultado?.distrito==='PICHARI');
 await page.waitForFunction(()=>ccppDelCorte()&&selectCP.options.length>1);
 const district=await page.evaluate(()=>({saf:ultimoResultado.familias_2025,scd:ultimoResultado.niños_2025}));
 assert.equal(district.saf,537);assert.equal(district.scd,372);
 const word=await page.evaluate(()=>exportarWord({soloHTML:true}));assert(word.html.includes('data:image/'));assert(word.html.includes('PICHARI'));
 console.log('DISTRICT_AND_WORD_OK');
 if(process.env.AM_EXPORTS==='1'){
  const fs=require('node:fs'),path=require('node:path');const output=path.resolve(__dirname,'../test-results');fs.mkdirSync(output,{recursive:true});
  for(const [label,selector] of [['Word','#btnWord'],['Excel','#btnExcel'],['PPT','#btnPPT'],['Tarjeta','.saf-card .card-dl']]){
   const pending=page.waitForEvent('download',{timeout:60000});await page.locator(selector).click();const download=await pending;
   const target=path.join(output,download.suggestedFilename());await download.saveAs(target);assert(fs.statSync(target).size>0);console.log('DOWNLOAD',label,fs.statSync(target).size);
  }
 }
 const cpLink=await page.evaluate(()=>{selectCP.selectedIndex=1;filtrar();return selectCP.value});
 await page.waitForFunction(()=>ultimoResultado?.ccpp);const url=await page.evaluate(()=>AMPremium.publicLink());
 const linked=await browser.newPage({viewport:{width:390,height:844}});linked.on('pageerror',e=>errors.push(e.message));
 await linked.goto(url);await linked.waitForFunction(()=>window.ultimoResultado?.ccpp);
 assert.equal(await linked.evaluate(()=>selectCP.value),cpLink);
 for(const width of [360,390,768,1440]){await linked.setViewportSize({width,height:844});assert.equal(await linked.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);}
 console.log('CCPP_LINK_AND_LAYOUT_OK');
 await page.locator('#avanzadaToggle').click();await page.locator('#selectEspecial').selectOption('VRAEM');await page.waitForFunction(()=>ultimoResultado?._esEspecial);
 console.log('SPECIAL_OK');assert.deepEqual(errors,[]);
 await browser.close();console.log('PASS');
})().catch(error=>{console.error(error);process.exit(1)});
