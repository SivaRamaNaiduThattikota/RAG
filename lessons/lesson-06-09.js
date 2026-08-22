const advancedLesson0609=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0609(){if(advancedLesson0609)advancedLesson0609.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0609)
syncAdvancedTarget0609()

// Section 14's lab: the Re-Ingestion Strategy Simulator. A days-elapsed
// scrubber, a 3-way strategy selector and a batch-interval slider drive a
// live recomputation over the same 6-document / 14-day worked example --
// D3 changes day 2, D1 (POLICY-REFUND-001) changes day 5, D5 changes day 9.
// Full batch and incremental share one schedule-driven catch-up model;
// event-driven catches each change the instant it happens.

const CHANGES_0609=[
  {doc:'D1',label:'D1',sub:'POLICY-REFUND-001',day:5},
  {doc:'D3',label:'D3',sub:'changed',day:2},
  {doc:'D5',label:'D5',sub:'changed',day:9},
]
const STATIC_DOCS_0609=['D2','D4','D6']
const DOC_ORDER_0609=['D1','D2','D3','D4','D5','D6']

const daysSlider0609=document.querySelector('#wgDaysElapsed_0609')
const daysOut0609=document.querySelector('#wgDaysElapsedOut_0609')
const intervalSlider0609=document.querySelector('#wgBatchInterval_0609')
const intervalOut0609=document.querySelector('#wgBatchIntervalOut_0609')
const intervalControl0609=document.querySelector('#wgIntervalControl_0609')
const strategyRadios0609=document.querySelectorAll('input[name="wgStrategy_0609"]')
const chipsRow0609=document.querySelector('#wgSimChips_0609')
const readout0609=document.querySelector('#wgSimReadout_0609')
const verdict0609=document.querySelector('#wgSimVerdict_0609')

function nextTick0609(day,interval){return Math.ceil(day/interval)*interval}

function currentStrategy0609(){
  for(const r of strategyRadios0609)if(r.checked)return r.value
  return 'full'
}

// Computes cost, average lag and per-document catch-up state as of
// daysElapsed, for whichever strategy is currently selected.
function computeState0609(daysElapsed,strategy,interval){
  const perDoc={}
  let cost=0,lagSum=0,lagCount=0

  if(strategy==='event'){
    CHANGES_0609.forEach(c=>{
      const caughtUp=daysElapsed>=c.day
      perDoc[c.doc]={changed:true,changeDay:c.day,catchupDay:c.day,caughtUp}
      if(caughtUp){cost+=1;lagCount+=1} // lag is 0, nothing to add to lagSum
    })
  }else{
    const ticksOccurred=Math.floor(daysElapsed/interval)
    CHANGES_0609.forEach(c=>{
      const tickDay=nextTick0609(c.day,interval)
      const caughtUp=daysElapsed>=tickDay
      perDoc[c.doc]={changed:true,changeDay:c.day,catchupDay:tickDay,caughtUp}
      if(caughtUp){lagSum+=(tickDay-c.day);lagCount+=1}
    })
    cost=strategy==='full'
      ?ticksOccurred*DOC_ORDER_0609.length
      :Object.values(perDoc).filter(d=>d.caughtUp).length
  }

  STATIC_DOCS_0609.forEach(d=>{perDoc[d]={changed:false,caughtUp:true}})

  const changesOccurredSoFar=CHANGES_0609.filter(c=>c.day<=daysElapsed).length
  const avgLag=lagCount?lagSum/lagCount:null
  return {perDoc,cost,avgLag,changesOccurredSoFar}
}

function chip0609(doc,state,daysElapsed){
  const d=state.perDoc[doc]
  if(!d.changed)return `<div class="rank-chip tp"><b>${doc}</b><span>no change</span><small>always current</small></div>`
  if(d.caughtUp)return `<div class="rank-chip tp"><b>${doc}</b><span>caught up</span><small>day ${d.catchupDay}</small></div>`
  if(daysElapsed>=d.changeDay)return `<div class="rank-chip fn"><b>${doc}</b><span>changed day ${d.changeDay}</span><small>awaiting reprocessing</small></div>`
  return `<div class="rank-chip"><b>${doc}</b><span>no change yet</span><small>watching</small></div>`
}

function verdictText0609(strategy,state,daysElapsed,interval){
  const plural=n=>n===1?'':'s'
  if(strategy==='full'){
    const wasted=state.cost-state.changesOccurredSoFar
    return `<b>${state.cost} reprocessing operation${plural(state.cost)} so far</b>${state.changesOccurredSoFar} real change${plural(state.changesOccurredSoFar)} occurred by day ${daysElapsed} — ${wasted} wasted rerun${plural(wasted)}, every tick reprocesses all 6 documents regardless of what actually changed.`
  }
  if(strategy==='incremental'){
    const lagText=state.avgLag===null?'no changes caught yet':`${state.avgLag.toFixed(1)}-day average detection lag`
    return `<b>${state.cost} reprocessing operation${plural(state.cost)} so far</b>${lagText} — the same lag full batch would show on this schedule, because incremental only narrows scope, not timing (batch_interval = ${interval} days).`
  }
  const lagText=state.avgLag===null?'no changes caught yet':`${state.avgLag.toFixed(1)}-day average detection lag`
  return `<b>${state.cost} reprocessing operation${plural(state.cost)} so far</b>${lagText} — each job fires the instant its document changes, with no schedule to wait for at all.`
}

function recomputeSimulator0609(){
  const daysElapsed=daysSlider0609?Number(daysSlider0609.value):0
  const interval=intervalSlider0609?Number(intervalSlider0609.value):7
  const strategy=currentStrategy0609()

  if(daysOut0609)daysOut0609.textContent=String(daysElapsed)
  if(intervalOut0609)intervalOut0609.textContent=String(interval)

  const schedules=strategy!=='event'
  if(intervalSlider0609)intervalSlider0609.disabled=!schedules
  if(intervalControl0609)intervalControl0609.style.opacity=schedules?'1':'.4'

  const state=computeState0609(daysElapsed,strategy,interval)

  if(chipsRow0609)chipsRow0609.innerHTML=DOC_ORDER_0609.map(doc=>chip0609(doc,state,daysElapsed)).join('')

  if(readout0609){
    const lagDisplay=state.avgLag===null?'n/a':`${state.avgLag.toFixed(1)}d`
    readout0609.innerHTML=`
      <div><span>STRATEGY</span><b>${strategy==='full'?'Full batch':strategy==='incremental'?'Incremental':'Event-driven'}</b></div>
      <div><span>DOCUMENTS REPROCESSED SO FAR</span><b>${state.cost}</b></div>
      <div><span>AVERAGE DETECTION LAG SO FAR</span><b>${lagDisplay}</b></div>
    `
  }

  if(verdict0609)verdict0609.innerHTML=verdictText0609(strategy,state,daysElapsed,interval)
}

daysSlider0609?.addEventListener('input',recomputeSimulator0609)
intervalSlider0609?.addEventListener('input',recomputeSimulator0609)
strategyRadios0609.forEach(r=>r.addEventListener('change',recomputeSimulator0609))
recomputeSimulator0609()
