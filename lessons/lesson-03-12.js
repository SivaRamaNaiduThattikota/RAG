const advancedLesson0312=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0312(){if(advancedLesson0312)advancedLesson0312.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0312)
syncAdvancedTarget0312()

// Section 14's lab: The RAG Fit Console -- unlike Concept 10's sequential
// two-question reveal and Concept 11's inspect-then-single-guess diagnosis,
// this lab is a live rules-engine console: the learner sets all four gates
// for the current scenario with independent toggle buttons, the console
// readout and verdict recompute after every toggle (no "submit" needed to
// see intermediate state), and a separate "Check" pass then grades the full
// four-gate trace against the scenario's correct answer, exactly like
// Section 12's from-scratch should_use_rag function.

const SCENARIOS_0312=[
  {
    label:'Scenario 1 -- Self-review rewrite',
    text:'"Rewrite this employee\'s self-review in a friendlier tone." The full text to rewrite is already included in the request.',
    g1:'no', g2:'yes', g3:'yes', g4:'yes',
    verdict:'skip_rag',
    reason:'Gate 1 trips: nothing outside the text the requester already supplied is needed, so no corpus -- however complete -- changes the output. Route straight to generation; retrieval was never relevant here.'
  },
  {
    label:'Scenario 2 -- Patent and watermarking question',
    text:'"What does our patent portfolio say about watermarking technology?" The assistant\'s only ingested material is three HR policy documents -- nothing about patents, IP, or watermarking has ever been ingested, for any question in that domain.',
    g1:'yes', g2:'no', g3:'yes', g4:'yes',
    verdict:'skip_rag',
    reason:'Gate 2 trips: this is not one missing fact inside an otherwise-covered domain (Concept 10\'s coverage gap) -- the entire patent and IP domain has never been ingested for any question at all. Ingest a legal corpus before revisiting this domain.'
  },
  {
    label:'Scenario 3 -- Sub-50ms, high-volume typeahead',
    text:'A live typeahead feature suggests HR search terms as an employee types, expected to respond within 50ms at several thousand requests per second.',
    g1:'yes', g2:'yes', g3:'no', g4:'yes',
    verdict:'skip_rag',
    reason:'Gate 3 trips: embedding and searching on every keystroke, at this volume and latency budget, costs more than it returns even if retrieval works perfectly every time. A cached or precomputed suggestion list fits this workload better.'
  },
  {
    label:'Scenario 4 -- Exact tax-withholding calculation',
    text:'"Calculate and issue this paycheck\'s exact federal tax withholding amount." The figure has direct legal and financial consequences and must be exactly correct every time, with no review step described.',
    g1:'yes', g2:'yes', g3:'yes', g4:'no',
    verdict:'skip_rag',
    reason:'Gate 4 trips: Concept 11 showed that even a well-built chain has three places it can still fail. A task with zero tolerance for that residual risk needs a deterministic lookup and formula, not a generated answer.'
  },
  {
    label:'Scenario 5 -- Remote workdays per week',
    text:'"How many remote workdays per week are employees allowed?" The remote-work policy states it directly, the question is occasional and latency-tolerant, and a wrong answer here is low-stakes and easily corrected.',
    g1:'yes', g2:'yes', g3:'yes', g4:'yes',
    verdict:'use_rag',
    reason:'All four gates pass: a real fact is needed, the corpus covers it, the volume and latency budget leave room for retrieval, and the task can tolerate the chain\'s small residual risk. This is the one case worth building Concept 06\'s skeleton for.'
  }
]

const GATE_KEYS_0312=['g1','g2','g3','g4']
const GATE_TITLES_0312={g1:'Gate 1',g2:'Gate 2',g3:'Gate 3',g4:'Gate 4'}

const state0312={index:0,answers:{g1:null,g2:null,g3:null,g4:null},checked:false,score:0,attempted:0}

const scenarioBox0312=document.querySelector('#fitScenario0312')
const verdictBox0312=document.querySelector('#fitVerdict0312')
const checkButton0312=document.querySelector('#fitCheck0312')
const nextButton0312=document.querySelector('#fitNext0312')
const scoreBox0312=document.querySelector('#fitScore0312')

const GATE_GROUPS_0312={
  g1:document.querySelector('#fitGate1_0312'),
  g2:document.querySelector('#fitGate2_0312'),
  g3:document.querySelector('#fitGate3_0312'),
  g4:document.querySelector('#fitGate4_0312')
}
const GATE_LIGHTS_0312={
  g1:document.querySelector('#fitLight1_0312'),
  g2:document.querySelector('#fitLight2_0312'),
  g3:document.querySelector('#fitLight3_0312'),
  g4:document.querySelector('#fitLight4_0312')
}

function computeVerdict0312(answers){
  const tripped=GATE_KEYS_0312.filter(key=>answers[key]==='no')
  if(tripped.length===0)return {verdict:'use_rag',tripped}
  return {verdict:'skip_rag',tripped}
}

function renderLights0312(){
  GATE_KEYS_0312.forEach(key=>{
    const light=GATE_LIGHTS_0312[key]
    if(!light)return
    const small=light.querySelector('small')
    const answer=state0312.answers[key]
    light.classList.remove('active')
    if(answer===null){
      if(small)small.textContent='Not yet set'
      return
    }
    if(answer==='yes'){
      light.classList.add('active')
      if(small)small.textContent='PASS'
    }else{
      if(small)small.textContent='TRIPPED -- disqualifies RAG'
    }
  })
}

function renderVerdict0312(){
  const allSet=GATE_KEYS_0312.every(key=>state0312.answers[key]!==null)
  if(!allSet){
    const setCount=GATE_KEYS_0312.filter(key=>state0312.answers[key]!==null).length
    if(verdictBox0312)verdictBox0312.innerHTML=`<p>${setCount} of 4 gates set. Set the remaining ${4-setCount} to compute a live verdict.</p>`
    return
  }
  const {verdict,tripped}=computeVerdict0312(state0312.answers)
  if(verdict==='use_rag'){
    if(verdictBox0312)verdictBox0312.innerHTML='<p><b>Live verdict: use RAG.</b> No gate currently trips for this configuration.</p>'
  }else{
    const names=tripped.map(key=>GATE_TITLES_0312[key]).join(', ')
    if(verdictBox0312)verdictBox0312.innerHTML=`<p><b>Live verdict: skip RAG.</b> Tripped: ${names}.</p>`
  }
}

function renderScenario0312(){
  const scenario=SCENARIOS_0312[state0312.index]
  state0312.answers={g1:null,g2:null,g3:null,g4:null}
  state0312.checked=false
  if(scenarioBox0312)scenarioBox0312.innerHTML=`<p><b>${scenario.label}:</b> ${scenario.text}</p>`
  Object.values(GATE_GROUPS_0312).forEach(group=>{
    if(!group)return
    group.querySelectorAll('button').forEach(button=>button.classList.remove('active'))
  })
  renderLights0312()
  renderVerdict0312()
}

GATE_KEYS_0312.forEach(key=>{
  const group=GATE_GROUPS_0312[key]
  if(!group)return
  group.querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>{
    if(state0312.checked)return
    state0312.answers[key]=button.dataset.value
    group.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b===button))
    renderLights0312()
    renderVerdict0312()
  }))
})

if(checkButton0312)checkButton0312.addEventListener('click',()=>{
  const allSet=GATE_KEYS_0312.every(key=>state0312.answers[key]!==null)
  if(!allSet||state0312.checked)return
  const scenario=SCENARIOS_0312[state0312.index]
  const gateResults=GATE_KEYS_0312.map(key=>({key,correct:state0312.answers[key]===scenario[key]}))
  const allCorrect=gateResults.every(g=>g.correct)
  state0312.checked=true
  state0312.attempted++
  if(allCorrect)state0312.score++
  const missed=gateResults.filter(g=>!g.correct).map(g=>GATE_TITLES_0312[g.key])
  const headline=allCorrect
    ? '<b>All four gates correct.</b>'
    : `<b>${4-missed.length} of 4 gates correct.</b> Recheck: ${missed.join(', ')}.`
  if(verdictBox0312)verdictBox0312.innerHTML=`<p>${headline}</p><p>${scenario.reason}</p>`
  if(scoreBox0312)scoreBox0312.textContent=`Score: ${state0312.score} / ${state0312.attempted}`
})

if(nextButton0312)nextButton0312.addEventListener('click',()=>{
  state0312.index=(state0312.index+1)%SCENARIOS_0312.length
  renderScenario0312()
})

renderScenario0312()
