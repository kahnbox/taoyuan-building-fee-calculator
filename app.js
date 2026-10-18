const $ = id => document.getElementById(id);
const money = n => 'NT$ ' + Math.max(0, Math.round(n)).toLocaleString('zh-TW');
const val = id => Number($(id).value) || 0;
const rows = items => items.filter(x => x.amount !== 0).map(x => `<div class="fee-row"><span>${x.label}</span><strong>${money(x.amount)}</strong></div>`).join('');
const costTables={
  '115':{fixed:{steelwall:3040,lightsteel:4940,brick:6210,brickwood:4430},rc:[[5,8770],[8,10410],[12,12830],[15,15030],[20,17710],[25,18520],[30,19330],[999,20490]],src:[[10,12760],[15,16360],[20,17860],[25,19370],[30,20180],[35,21440],[999,22260]],steel:[[1,8000],[10,12830],[15,16780],[20,18430],[25,20210],[30,21100],[35,22120],[999,23010]]},
  '110':{fixed:{steelwall:2630,lightsteel:4270,brick:5370,brickwood:3800},rc:[[5,7570],[8,8990],[12,11080],[15,12980],[20,15290],[25,15990],[30,16660],[999,18100]],src:[[10,10200],[15,14320],[20,15430],[25,16720],[30,17420],[35,18510],[999,19620]],steel:[[1,6300],[10,10200],[15,14320],[20,15910],[25,17400],[30,18210],[35,19090],[999,20160]]},
  '105':{fixed:{steelwall:2400,lightsteel:3900,brick:4900,brickwood:3250},rc:[[5,6300],[8,8200],[12,10100],[15,12000],[20,14500],[25,15200],[30,16600],[999,16600]],src:[[10,10100],[15,13200],[20,14500],[25,15900],[30,16600],[35,17400],[999,18100]],steel:[[1,6300],[10,10100],[15,13200],[20,14500],[25,15900],[30,16600],[35,17400],[999,18100]]},
  county:{fixed:{steelwall:2400,lightsteel:3900,brick:4900,brickwood:3500},rc:[[5,6300],[8,7500],[12,9200],[15,12000],[999,14500]],src:[[5,6300],[8,7500],[12,9200],[15,12000],[999,14500]],steel:[[5,6300],[8,7500],[12,9200],[15,12000],[999,14500]]}
};
function unitPrice(){const v=$('legalVersion').value,s=$('structure').value,f=Math.max(1,val('floors')),table=costTables[v];if(table.fixed[s])return table.fixed[s];const row=table[s].find(x=>f<=x[0]);return row?row[1]:0}
function legalCost(){const a=val('legalArea')||val('area'),building=a*unitPrice(),extras=val('excavation')*140+val('filling')*220+val('wallLength')*2150+val('drainLength')*1890+val('retainingLength')*val('retainingHeight');return Math.floor((building+extras)/10)*10}
function updateLegal(){$('legalTotal').textContent=money(legalCost());}

function calc(){
  const type=$('caseType').value, a=val('area'), cost=val('cost'), r=Math.max(1,val('reviewCount')), i=val('inspectionCount'), u=Math.max(1,val('units')), printed=$('printing').checked, recheck=$('recheck').checked, designMethod=$('designMethod').value, designRate=val('designRate'), includeDesign=$('includeDesign').checked;
  let items=[], hint='依目前匯入的收費標準估算';
  if(type==='permit'){
    const base=cost<=50000000?cost*.0006:cost*.0002+30000;
    items=[{label:'簽證發照審照費',amount:Math.max(4000,Math.min(80000,Math.round(base/100)*100))},{label:'執照打字費',amount:printed?500:0}]; hint='建造／雜項執照：依工程造價分級計算';
  } else if(type==='interior'){
    const review=a<=100?7000:(a<=2000?7000+(a-100)*15:7000+1900*15+(a-2000)*10), inspect=a<=100?9000:(a<=2000?9000+(a-100)*15:9000+1900*15+(a-2000)*10);
    items=[{label:'室內裝修審查費',amount:Math.min(100000,review)},{label:'室內裝修查驗費',amount:i?Math.min(100000,inspect)*i:0},{label:'第 3 次以後審查',amount:r>2?(r-2)*4000:0},{label:'第 3 次以後查驗',amount:i>2?(i-2)*6000:0},{label:'打字費',amount:printed?300:0}]; hint='100㎡以下採基本費，超過部分按級距計算；第 2 次審查（查驗）不另收費';
  } else if(type==='change'){
    const base=a<=300?5000:(a<=2000?5000+(a-300)*15:5000+1700*15+(a-2000)*10), check=a<=300?7000:(a<=2000?7000+(a-300)*15:7000+1700*15+(a-2000)*10);
    items=[{label:'變更使用執照審查費',amount:Math.min(100000,base)},{label:'變更使用執照查驗費',amount:i?Math.min(100000,check)*i:0},{label:'第 3 次以後審查',amount:r>2?(r-2)*4000:0},{label:'打字費',amount:printed?300:0}]; hint='300㎡以下採基本費；門牌增（整）編 2,500 元／件需另行勾選或輸入';
  } else if(type==='simple'){
    items=[{label:'簡裝單元審查費',amount:5000+(u-1)*2000},{label:'執照印製及打字費',amount:printed?500:0}]; hint='同卷宗相同內容最多 10 戶，不同內容最多 3 戶';
  } else if(type==='urban'){
    items=[{label:recheck?'都審複審費':'都市設計審議費',amount:recheck?1000:10000},{label:'變更設計／重審',amount:0}]; hint='適用基地面積 2,000㎡以下且無涉建照預審';
  } else if(type==='special'){
    const review=a<=200?15000:(a<=2000?15000+(a-200)*20:15000+1800*20+(a-2000)*10), inspect=a<=200?20000:(a<=2000?20000+(a-200)*25:20000+1800*25+(a-2000)*15);
    items=[{label:'特種建築物審查費',amount:Math.min(100000,review)},{label:'特種建築物查驗費',amount:i?Math.min(100000,inspect)*i:0},{label:'第 3 次以上審查',amount:r>2?(r-2)*4000:0},{label:'第 3 次以上查驗',amount:i>2?(i-2)*6000:0},{label:'更正',amount:5000}]; hint='審查費、查驗費上限各 100,000 元；更正費 5,000 元／件需確認是否適用';
  } else if(type==='withdraw'){
    const paid=val('paid'), proc=1000+1000+(type==='withdraw'&&i?i*5000:r*3000); items=[{label:'掛號',amount:1000},{label:'初審',amount:1000},{label:'已辦程序費',amount:proc-2000},{label:'預計退款',amount:Math.max(0,paid-proc)}]; hint=paid?'已依已繳費用扣除已辦程序費用估算退款':'請填寫已繳費用以計算退款';
  }
  const designFee=designMethod==='percent'?cost*designRate/100:designMethod==='area'?a*designRate:designRate;
  if(designFee>0) items.push({label:includeDesign?'事務所設計費':'事務所設計費（未納入合計）',amount:designFee});
  const statutory=items.filter(x=>!x.label.startsWith('事務所設計費')).reduce((s,x)=>s+x.amount,0), total=statutory+(includeDesign?designFee:0);
  const methodText=designMethod==='percent'?`工程造價 ${designRate}%`:designMethod==='area'?`每㎡ ${money(designRate)}`:`固定 ${money(designRate)}`;
  $('designUnit').textContent=designMethod==='percent'?'%':designMethod==='area'?'元／㎡':'元'; $('total').textContent=money(total); $('resultHint').textContent=designFee?`${hint} · 設計費採${methodText}`:hint; $('breakdown').innerHTML=rows(items)||'<div class="empty"><span>✦</span><p>尚無可計算費用</p><small>請補上必要的案件數字</small></div>';
}

function parseText(){
  const t=$('pasteBox').value; const nums=[...t.replaceAll(',','').matchAll(/(\d+(?:\.\d+)?)\s*(平方公尺|㎡|m2|萬|萬元|元)/gi)];
  if(/室內裝修|簡裝/.test(t)) $('caseType').value=/簡裝/.test(t)?'simple':'interior'; else if(/變更使用/.test(t)) $('caseType').value='change'; else if(/都市設計|都審/.test(t)) $('caseType').value='urban'; else if(/特種建築/.test(t)) $('caseType').value='special'; else if(/撤案/.test(t)) $('caseType').value='withdraw'; else if(/建造|雜項|新建/.test(t)) $('caseType').value='permit';
  nums.forEach(m=>{const n=Number(m[1]),u=m[2]; if(/平方|㎡|m2/i.test(u)) $('area').value=n; else if(/萬/.test(u)) $('cost').value=n*10000; else if(/元/.test(u)) $('cost').value=n});
  const review=t.match(/第\s*(\d+)\s*次/); if(review)$('reviewCount').value=review[1]; calc();
}
['caseType','area','cost','reviewCount','inspectionCount','units','paid','printing','recheck','designMethod','designRate','includeDesign'].forEach(id=>$(id).addEventListener('input',calc));
['legalVersion','legalArea','structure','floors','excavation','filling','wallLength','drainLength','retainingLength','retainingHeight','area'].forEach(id=>$(id).addEventListener('input',updateLegal));
$('useLegalBtn').addEventListener('click',()=>{const total=legalCost();if(total>0){$('cost').value=Math.round(total);calc()}});
$('parseBtn').addEventListener('click',parseText); $('resetBtn').addEventListener('click',()=>{document.querySelectorAll('input').forEach(x=>{if(x.type==='checkbox')x.checked=x.id==='printing';else x.value=x.id==='reviewCount'?'1':x.id==='inspectionCount'||x.id==='units'?'0':''});$('units').value=1;$('legalArea').value='';$('floors').value=5;$('excavation').value='';$('filling').value='';$('wallLength').value='';$('drainLength').value='';$('retainingLength').value='';$('pasteBox').value='';updateLegal();calc()});
$('copyBtn').addEventListener('click',()=>{const text=`桃園建築案件費用試算\n案件類型：${$('caseType').selectedOptions[0].text}\n估算合計：${$('total').textContent}\n${[...document.querySelectorAll('.fee-row')].map(x=>x.innerText.replace('\n','：')).join('\n')}`;navigator.clipboard?.writeText(text);$('copyBtn').textContent='已複製 ✓';setTimeout(()=>$('copyBtn').textContent='複製明細',1600)});
updateLegal(); calc();
