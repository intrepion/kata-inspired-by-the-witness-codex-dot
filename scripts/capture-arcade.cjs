'use strict';
const {chromium}=require('playwright');
const {mkdir,readFile,writeFile,readdir}=require('node:fs/promises');
const {createHash}=require('node:crypto');
const path=require('node:path');
(async()=>{
 const output=process.env.CAPTURE_OUTPUT||'/tmp/stillwater-captures',site=process.env.CAPTURE_SITE||'capture-site';
 await mkdir(output,{recursive:true}); const inputs={};
 for(const f of ['index.html',...(await readdir(path.join(site,'assets'))).map(x=>'assets/'+x)]) inputs[f]=createHash('sha256').update(await readFile(path.join(site,f))).digest('hex');
 const browser=await chromium.launch({headless:true,...(process.env.LOCAL_CHROME?{executablePath:process.env.LOCAL_CHROME}:{})});
 try {
  const page=await browser.newPage({viewport:{width:1280,height:1000},deviceScaleFactor:1,locale:'en-US',reducedMotion:'reduce'});
  await page.goto('http://127.0.0.1:4271/',{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:/Enter the garden/}).click(); await page.waitForTimeout(700);
  await page.screenshot({path:path.join(output,'stillwater-01.png'),animations:'disabled'});
  await page.keyboard.down('a'); await page.waitForTimeout(850); await page.keyboard.up('a');
  await page.keyboard.down('w'); await page.waitForTimeout(1000); await page.keyboard.up('w');
  await page.getByText('CLICK / E · First Light').waitFor({timeout:5000}); await page.keyboard.press('e');
  await page.getByText('FIELD TABLET',{exact:true}).waitFor(); await page.waitForTimeout(700);
  await page.keyboard.press('Enter'); await page.keyboard.press('ArrowUp'); await page.keyboard.press('ArrowRight');
  await page.screenshot({path:path.join(output,'stillwater-02.png'),animations:'disabled'});
  await writeFile(path.join(output,'capture.json'),JSON.stringify({schemaVersion:1,workflowCommit:process.env.GITHUB_SHA||null,sourceCommit:process.env.GAME_SOURCE_COMMIT||null,runId:process.env.GITHUB_RUN_ID||null,url:'http://127.0.0.1:4271/',inputs,browser:browser.version(),viewport:{width:1280,height:1000},screenshots:['stillwater-01.png','stillwater-02.png']},null,2)+'\n');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
