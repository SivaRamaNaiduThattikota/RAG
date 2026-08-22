const advancedLesson0209=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0209(){if(advancedLesson0209)advancedLesson0209.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0209);syncAdvancedTarget0209()

// Confidence-vs-coverage decoding lab.
// Unlike every earlier lesson's lab (instant recompute on click), this one actually runs the
// decoding loop: pressing "run" streams tokens in one at a time, the same predict-decode-append-
// repeat cycle from Module 01, Concept 07, updating a live confidence reading per token. The point
// the animation exists to make: that confidence reading looks about the same across all three
// coverage levels, even though only one of the three answers is actually correct.

const coverageScenarios={
  dense:{
    query:'"How many hours are in a standard full-time work week?"',
    tokens:['A','standard','full-time','week','is','40','hours.'],
    confidences:[74,81,79,88,85,93,90],
    outcome:'CORRECT',
    note:'A common pattern, reinforced constantly across pretraining text — the weight groups converge on the right token and the loop happens to land on it.',
  },
  sparse:{
    query:'"What is the exact unused-sick-leave carryover cap in the internal policy?"',
    tokens:['The','policy','allows','up','to','5','days','of','carryover.'],
    confidences:[70,66,72,77,80,68,84,79,86],
    outcome:'SUBTLY WRONG',
    note:'The true cap is 3 days. This detail was thinly represented in training data, but the loop still emits a specific, fluent, confident-sounding number — see Section 10’s worked trace for the exact softmax numbers behind this scenario.',
  },
  absent:{
    query:'"What changed in the policy revision issued last week?"',
    tokens:['The','revision','raised','the','carryover','cap','and','added','a','sign-off','step.'],
    confidences:[69,73,71,75,78,82,74,80,77,83,88],
    outcome:'FABRICATED',
    note:'This event happened after any plausible training cutoff — it cannot exist in the weight groups at any density. Every detail in this sentence was invented, not recalled, yet the confidence reading never dips to signal that.',
  },
}

const coverageButtons=[...document.querySelectorAll('.coverage-button')]
const runButton=document.querySelector('#runGenerationButton')
const queryEl=document.querySelector('#genQuery')
const streamEl=document.querySelector('#genStream')
const confidenceEl=document.querySelector('#genConfidence')
const outcomeEl=document.querySelector('#genOutcome')

let currentCoverage='dense'
let running=false

const setActiveCoverage=()=>{
  coverageButtons.forEach(button=>{
    const active=button.dataset.coverage===currentCoverage
    button.classList.toggle('active',active)
    button.classList.toggle('secondary',!active)
    button.setAttribute('aria-pressed',String(active))
  })
}

const showQuery=()=>{
  if(!queryEl)return
  const scenario=coverageScenarios[currentCoverage]
  queryEl.innerHTML=`<p><b>Question sent to the model:</b> ${scenario.query}</p>`
}

const meterRow=(label,value)=>`<div class="prob-row"><span>${label}</span><div class="bar-track"><div class="bar-fill" style="width:${value}%"></div></div><span>${value}%</span></div>`

const resetPanels=()=>{
  if(streamEl)streamEl.innerHTML='<p>Press "Run the decoding loop" to generate this answer one token at a time.</p>'
  if(confidenceEl)confidenceEl.innerHTML=''
  if(outcomeEl)outcomeEl.innerHTML=''
}

coverageButtons.forEach(button=>button.addEventListener('click',()=>{
  if(running)return
  currentCoverage=button.dataset.coverage
  setActiveCoverage()
  showQuery()
  resetPanels()
}))

const runDecodingLoop=()=>{
  if(running)return
  running=true
  if(runButton){runButton.disabled=true;runButton.textContent='Running…'}
  const scenario=coverageScenarios[currentCoverage]
  const emitted=[]
  let step=0
  if(streamEl)streamEl.innerHTML='<p></p>'
  if(outcomeEl)outcomeEl.innerHTML=''

  const tick=()=>{
    if(step>=scenario.tokens.length){
      running=false
      if(runButton){runButton.disabled=false;runButton.textContent='Run the decoding loop ▶'}
      const avg=Math.round(scenario.confidences.reduce((a,b)=>a+b,0)/scenario.confidences.length)
      if(outcomeEl){
        outcomeEl.innerHTML=`<p><b>Outcome: ${scenario.outcome}.</b> ${scenario.note}</p><p>Average confidence during generation: ${avg}%. Compare that number across all three coverage levels — nothing about it tracked whether the final sentence was actually true.</p>`
      }
      return
    }
    const token=scenario.tokens[step]
    const confidence=scenario.confidences[step]
    emitted.push(token)
    if(streamEl)streamEl.innerHTML=`<p>${emitted.join(' ')}</p>`
    if(confidenceEl)confidenceEl.innerHTML=meterRow(`Decoding step ${step+1} of ${scenario.tokens.length} — top-token confidence`,confidence)
    step+=1
    setTimeout(tick,240)
  }
  tick()
}

if(runButton)runButton.addEventListener('click',runDecodingLoop)

setActiveCoverage()
showQuery()
resetPanels()
