const advancedLesson0210=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0210(){if(advancedLesson0210)advancedLesson0210.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0210);syncAdvancedTarget0210()

// Context-position dilution lab.
// Every earlier lab in this course picks from a small set of hand-authored scenarios (button
// presets) or streams a fixed token sequence. This one is a live numeric simulation: two sliders
// (context length N, and the rank position of the one answer-bearing chunk) feed Section 09's
// positional-bias softmax formula directly, and the bar chart below is redrawn from scratch for
// however many positions N happens to be. Nothing here is a scripted scenario -- move either
// slider and the whole distribution recomputes.

const EDGE_BETA=1.5 // fixed positional-bias strength, matching Section 09 and Section 10's worked trace

function edgeBias(position,n){
  if(n===1)return 0
  const normalized=(position-1)/(n-1) // 0 at the first key, 1 at the last
  return Math.abs(2*normalized-1)       // 0 at dead center, 1 at either edge
}

function attentionWeights(n,beta){
  // every chunk given an identical relevance score of 1.0 -- isolates position as the only variable
  const logits=[]
  for(let j=1;j<=n;j+=1)logits.push(1+beta*edgeBias(j,n))
  const peak=Math.max(...logits)
  const exps=logits.map(x=>Math.exp(x-peak))
  const total=exps.reduce((a,b)=>a+b,0)
  return exps.map(e=>e/total)
}

const lengthInput=document.querySelector('#contextLength0210')
const lengthOutput=document.querySelector('#contextLengthValue0210')
const positionInput=document.querySelector('#factPosition0210')
const positionOutput=document.querySelector('#factPositionValue0210')
const resetButton=document.querySelector('#dilutionResetButton0210')
const summaryEl=document.querySelector('#dilutionSummary0210')
const barsEl=document.querySelector('#dilutionBars0210')

function clampPositionToLength(){
  const n=Number(lengthInput.value)
  positionInput.max=String(n)
  if(Number(positionInput.value)>n)positionInput.value=String(n)
}

function renderDilutionLab(){
  const n=Number(lengthInput.value)
  const position=Number(positionInput.value)
  lengthOutput.value=String(n)
  positionOutput.value=String(position)

  const weights=attentionWeights(n,EDGE_BETA)
  const fairShare=1/n
  const targetWeight=weights[position-1]
  const ratio=targetWeight/fairShare

  const rows=weights.map((w,index)=>{
    const rank=index+1
    const isTarget=rank===position
    const label=isTarget?`Chunk ${rank} — answer-bearing`:`Chunk ${rank}`
    const pct=(w*100).toFixed(1)
    return `<div class="prob-row"${isTarget?' style="font-weight:700"':''}><span>${label}</span><div class="bar-track"><div class="bar-fill" style="width:${pct}%${isTarget?';background:var(--orange)':''}"></div></div><span>${pct}%</span></div>`
  }).join('')
  if(barsEl)barsEl.innerHTML=rows

  let verdict,verdictNote
  if(ratio>=1.15){
    verdict='RELIABLY ATTENDED'
    verdictNote='This position sits near an edge of the window and draws more than a fair 1/N share.'
  }else if(ratio>=0.85){
    verdict='BORDERLINE'
    verdictNote='This position is close to a fair 1/N share -- neither strongly favored nor strongly diluted.'
  }else{
    verdict='DILUTED -- AT RISK'
    verdictNote='This position sits in the flattest part of the curve and draws well under a fair 1/N share, despite identical relevance to every other chunk.'
  }

  if(summaryEl){
    summaryEl.innerHTML=`<p><b>N = ${n} chunks, answer-bearing chunk at rank ${position}.</b> A perfectly even split would give every chunk ${(fairShare*100).toFixed(1)}% of the attention weight. This chunk actually gets ${(targetWeight*100).toFixed(1)}% — ${ratio.toFixed(2)}× the fair share.</p><p><b>Verdict: ${verdict}.</b> ${verdictNote}</p>`
  }
}

lengthInput?.addEventListener('input',()=>{clampPositionToLength();renderDilutionLab()})
positionInput?.addEventListener('input',renderDilutionLab)
resetButton?.addEventListener('click',()=>{
  lengthInput.value='8'
  positionInput.value='4'
  clampPositionToLength()
  renderDilutionLab()
})

clampPositionToLength()
renderDilutionLab()
