const advancedLesson0508=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0508(){if(advancedLesson0508)advancedLesson0508.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0508)
syncAdvancedTarget0508()

// Section 14's lab: the Top-k Confusion Grid. Eight ranked positions, each
// toggleable as relevant or not (defaulting to b03/s10's own {1,2,4,7}), plus
// a k slider. Every change reclassifies all eight positions into TP/FP/FN/TN
// and recomputes precision/recall/F1 live -- no pick/reveal step, matching
// this module's established live-calculator lab convention.

const N_0508=8
let relevant0508=new Set([1,2,4,7])
let k0508=3

const togglesBox0508=document.querySelector('#wgRelToggles_0508')
const kSlider0508=document.querySelector('#wgK_0508')
const kOut0508=document.querySelector('#wgKOut_0508')
const rankRow0508=document.querySelector('#wgRankRow_0508')
const tpCell0508=document.querySelector('#wgTP_0508')
const fpCell0508=document.querySelector('#wgFP_0508')
const fnCell0508=document.querySelector('#wgFN_0508')
const tnCell0508=document.querySelector('#wgTN_0508')
const precOut0508=document.querySelector('#wgPrec_0508')
const recOut0508=document.querySelector('#wgRec_0508')
const f1Out0508=document.querySelector('#wgF1_0508')

function buildToggles0508(){
  if(!togglesBox0508)return
  for(let pos=1;pos<=N_0508;pos+=1){
    const label=document.createElement('label')
    const input=document.createElement('input')
    input.type='checkbox'
    input.checked=relevant0508.has(pos)
    input.addEventListener('change',()=>{
      if(input.checked)relevant0508.add(pos)
      else relevant0508.delete(pos)
      recompute0508()
    })
    label.appendChild(input)
    label.appendChild(document.createTextNode(`Position ${pos}`))
    togglesBox0508.appendChild(label)
  }
}

function classify0508(pos){
  const isRetrieved=pos<=k0508
  const isRelevant=relevant0508.has(pos)
  if(isRetrieved&&isRelevant)return 'tp'
  if(isRetrieved&&!isRelevant)return 'fp'
  if(!isRetrieved&&isRelevant)return 'fn'
  return 'tn'
}

function recompute0508(){
  if(kOut0508)kOut0508.textContent=String(k0508)
  let tp=0,fp=0,fn=0,tn=0
  const chips=[]
  for(let pos=1;pos<=N_0508;pos+=1){
    const cls=classify0508(pos)
    if(cls==='tp')tp+=1
    else if(cls==='fp')fp+=1
    else if(cls==='fn')fn+=1
    else tn+=1
    const isCutoffEdge=pos===k0508
    chips.push(`<div class="rank-chip ${cls}${isCutoffEdge?' cutoff-edge':''}"><b>${pos}</b><span>${relevant0508.has(pos)?'relevant':'not relevant'}</span><small>${cls.toUpperCase()}</small></div>`)
  }
  if(rankRow0508)rankRow0508.innerHTML=chips.join('')
  if(tpCell0508)tpCell0508.textContent=String(tp)
  if(fpCell0508)fpCell0508.textContent=String(fp)
  if(fnCell0508)fnCell0508.textContent=String(fn)
  if(tnCell0508)tnCell0508.textContent=String(tn)
  const retrievedCount=tp+fp
  const totalRelevant=tp+fn
  const precision=retrievedCount>0?tp/retrievedCount:0
  const recall=totalRelevant>0?tp/totalRelevant:null
  const f1=(recall!==null&&(precision+recall)>0)?2*precision*recall/(precision+recall):0
  if(precOut0508)precOut0508.textContent=precision.toFixed(3)
  if(recOut0508)recOut0508.textContent=recall===null?'undefined':recall.toFixed(3)
  if(f1Out0508)f1Out0508.textContent=f1.toFixed(3)
}

kSlider0508?.addEventListener('input',()=>{
  k0508=Number(kSlider0508.value)
  recompute0508()
})

buildToggles0508()
recompute0508()
