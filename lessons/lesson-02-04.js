const advancedLesson0204=document.querySelector('#advanced-lesson');
function syncAdvancedTarget0204(){if(advancedLesson0204)advancedLesson0204.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0204);syncAdvancedTarget0204();
const attentionWeights={
  it:{trophy:.45,suitcase:.35,big:.10,fit:.06,it:.04},
  trophy:{trophy:.50,fit:.25,big:.15,suitcase:.06,it:.04},
  big:{trophy:.40,suitcase:.30,it:.15,big:.10,fit:.05},
  suitcase:{suitcase:.45,fit:.25,trophy:.15,it:.10,big:.05},
  fit:{trophy:.35,suitcase:.30,fit:.20,it:.10,big:.05},
};
const attnButtons=[...document.querySelectorAll('.attn-query-button')];
const attnOutput=document.querySelector('#attnLabOutput');
function renderAttention(query){
  const weights=attentionWeights[query];
  if(!attnOutput||!weights)return;
  const rows=Object.entries(weights).sort((a,b)=>b[1]-a[1]).map(([key,weight])=>
    `<div class="prob-row"><span>${key}</span><div class="bar-track"><div class="bar-fill" style="width:${(weight*100).toFixed(0)}%"></div></div><span>${(weight*100).toFixed(0)}%</span></div>`
  ).join('');
  attnOutput.innerHTML=`<p class="fine-print">Illustrative weights for query “${query}” — hand-authored, not computed from a real model.</p><div class="prob-bars">${rows}</div>`;
}
function selectAttentionQuery(button){
  attnButtons.forEach(item=>{const active=item===button;item.classList.toggle('active',active);item.classList.toggle('secondary',!active);item.setAttribute('aria-pressed',String(active))});
  renderAttention(button.dataset.query);
}
attnButtons.forEach(button=>button.addEventListener('click',()=>selectAttentionQuery(button)));
if(attnButtons[0])selectAttentionQuery(attnButtons[0]);
