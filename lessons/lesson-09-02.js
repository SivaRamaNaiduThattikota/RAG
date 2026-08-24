const advancedLesson0902=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0902(){if(advancedLesson0902)advancedLesson0902.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0902)
syncAdvancedTarget0902()

// Section 14's lab: The Recall/Speed Trade-off Bench. Unlike Concept 01's
// own Latency Budget Checker -- which swept two continuous sliders over a
// closed-form formula -- this lab snaps between three REAL, named,
// pre-measured operating points from FAISS's own published SIFT1M
// benchmark table. Nothing here is interpolated or computed from a
// formula; every number below is copied directly from that table (or
// derived from it exactly as the lesson text describes: total time
// divided by the standard 10,000-query SIFT1M query set).

const INDEXES_0902={
  exact:{
    label:'Exact (Flat-CPU)',
    timeMs:0.91,
    recall:100.00,
    verdict:'Exact search scores every stored vector -- guaranteed correct, at the real cost this lab measures every other index against.'
  },
  ivf:{
    label:'IVF16384,Flat',
    timeMs:0.0538,
    recall:89.80,
    verdict:'IVF16384,Flat: about 16.9x faster than exact search, missing the true nearest neighbour for roughly 1 in 9.8 queries.'
  },
  hnsw:{
    label:'nmslib (HNSW)',
    timeMs:0.0081,
    recall:81.95,
    verdict:'HNSW: about 112.3x faster than exact search, but misses the true nearest neighbour for roughly 1 in 5.5 queries.'
  }
}

const EXACT_TIME_MS_0902=INDEXES_0902.exact.timeMs

const indexButtons0902=[...document.querySelectorAll('#s14 [data-index]')]

const timeBox0902=document.querySelector('#annTime_0902')
const speedupBox0902=document.querySelector('#annSpeedup_0902')
const recallBox0902=document.querySelector('#annRecall_0902')
const missBox0902=document.querySelector('#annMiss_0902')

const barFill0902=document.querySelector('#annBarFill_0902')
const barOut0902=document.querySelector('#annBarOut_0902')
const barRow0902=document.querySelector('#annBarRow_0902')

const verdictBox0902=document.querySelector('#annVerdict_0902')

let currentIndex0902='exact'

function fmtTime0902(ms){
  return ms.toFixed(4)+' ms'
}

function syncIndexButtons0902(){
  indexButtons0902.forEach(btn=>btn.classList.toggle('active',btn.dataset.index===currentIndex0902))
}

function render0902(){
  const entry=INDEXES_0902[currentIndex0902]
  if(!entry)return

  const speedup=EXACT_TIME_MS_0902/entry.timeMs
  const missPct=100-entry.recall

  if(timeBox0902)timeBox0902.textContent=fmtTime0902(entry.timeMs)
  if(speedupBox0902)speedupBox0902.textContent=speedup.toFixed(2)+'x'
  if(recallBox0902)recallBox0902.textContent=entry.recall.toFixed(2)+'%'
  if(missBox0902)missBox0902.textContent=missPct.toFixed(2)+'%'

  const barWidth=Math.min(missPct,100)
  if(barFill0902)barFill0902.style.width=barWidth+'%'
  if(barOut0902)barOut0902.textContent=missPct.toFixed(2)+'% risk'
  if(barRow0902)barRow0902.classList.toggle('winner',missPct>0)

  if(verdictBox0902){
    verdictBox0902.className=currentIndex0902==='exact'?'callout':'callout warning'
    verdictBox0902.textContent=entry.verdict
  }
}

indexButtons0902.forEach(btn=>btn.addEventListener('click',()=>{
  currentIndex0902=btn.dataset.index
  syncIndexButtons0902()
  render0902()
}))

syncIndexButtons0902()
render0902()
