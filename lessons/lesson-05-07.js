const advancedLesson0507=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0507(){if(advancedLesson0507)advancedLesson0507.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0507)
syncAdvancedTarget0507()

// Section 14's lab: the Length-Normalization Explorer.
// Reuses the same five-ticket corpus every prior Module 05 concept has
// used, but this is the first widget that actually varies document
// length's effect live -- dragging b moves every ticket's score in
// opposite directions depending on whether it's shorter or longer than
// the corpus average, which is the one thing Concept 06's own lab
// could not show (it never let b do anything).

const TICKETS_0507={
  T1:'my order is late and my order never arrived',
  T2:'please refund my order immediately',
  T3:'the refund was processed but the refund amount is wrong',
  T4:'where is my order confirmation email',
  T5:'i need help resetting my password'
}

const K1_0507=1.2
const TERM_0507='refund'

function docLength0507(text){
  return text.split(' ').length
}

const AVGDL_0507=Object.values(TICKETS_0507).reduce((sum,t)=>sum+docLength0507(t),0)/Object.keys(TICKETS_0507).length // 7.2

function termFrequency0507(term,text){
  return text.split(' ').filter(word=>word===term).length
}

function documentFrequency0507(term){
  return Object.values(TICKETS_0507).filter(text=>text.split(' ').includes(term)).length
}

function inverseDocumentFrequency0507(term){
  const n=Object.keys(TICKETS_0507).length
  const df=documentFrequency0507(term)
  if(df===0)return null
  return Math.log(n/df)
}

function lengthTerm0507(docId,b){
  const dl=docLength0507(TICKETS_0507[docId])
  return (1-b)+b*(dl/AVGDL_0507)
}

function bm25Term0507(term,docId,b){
  const idf=inverseDocumentFrequency0507(term)
  if(idf===null)return 0
  const tf=termFrequency0507(term,TICKETS_0507[docId])
  const L=lengthTerm0507(docId,b)
  const ratio=(tf*(K1_0507+1))/(tf+K1_0507*L)
  return idf*ratio
}

const bSlider0507=document.querySelector('#wgB_0507')
const bOut0507=document.querySelector('#wgBOut_0507')
const lenBarsBox0507=document.querySelector('#wgLenBars_0507')
const lenPairBox0507=document.querySelector('#wgLenPair_0507')
const lenGapBox0507=document.querySelector('#wgLenGap_0507')
const verdictBox0507=document.querySelector('#wgVerdictLen_0507')

function renderLenBars0507(b){
  const docIds=Object.keys(TICKETS_0507)
  const rows=docIds.map(doc=>({doc,score:bm25Term0507(TERM_0507,doc,b)}))
  const maxScore=Math.max(0.0001,...rows.map(row=>row.score))
  return rows
    .sort((a,b2)=>b2.score-a.score)
    .map(row=>`<div class="prob-row"><span>${row.doc}</span><div class="bar-track"><div class="bar-fill" style="width:${(row.score/maxScore*100)}%"></div></div><span>${row.score.toFixed(4)}</span></div>`)
    .join('')
}

function runLengthExplorer0507(){
  const b=parseFloat(bSlider0507?.value||'0.75')
  if(bOut0507)bOut0507.textContent=b.toFixed(2)
  if(lenBarsBox0507)lenBarsBox0507.innerHTML=renderLenBars0507(b)
  const lT2=lengthTerm0507('T2',b)
  const lT3=lengthTerm0507('T3',b)
  if(lenPairBox0507)lenPairBox0507.textContent=`${lT2.toFixed(4)} / ${lT3.toFixed(4)}`
  const scoreT2=bm25Term0507(TERM_0507,'T2',b)
  const scoreT3=bm25Term0507(TERM_0507,'T3',b)
  const gap=scoreT3-scoreT2
  if(lenGapBox0507)lenGapBox0507.textContent=gap.toFixed(4)
  if(verdictBox0507){
    let verdict
    if(b===0){
      verdict=`At b=0, L(d)=1 for every ticket regardless of its length -- this is exactly Concept 06's assumption. T2 (short) scores ${scoreT2.toFixed(4)} and T3 (long) scores ${scoreT3.toFixed(4)}, a gap of ${gap.toFixed(4)} driven entirely by T3 repeating "refund" twice against T2's once.`
    }else{
      verdict=`At b=${b.toFixed(2)}, T2 (5 words, below avgdl=7.2) gets L(d)=${lT2.toFixed(4)} and rises to ${scoreT2.toFixed(4)}; T3 (10 words, above avgdl) gets L(d)=${lT3.toFixed(4)} and falls to ${scoreT3.toFixed(4)}. The gap between them is now ${gap.toFixed(4)} -- drag b toward 0 to watch how much of that gap was length, not relevance.`
    }
    verdictBox0507.textContent=verdict
  }
}

function resetLengthExplorer0507(){
  if(bSlider0507)bSlider0507.value='0.75'
  runLengthExplorer0507()
}

bSlider0507?.addEventListener('input',runLengthExplorer0507)

resetLengthExplorer0507()
