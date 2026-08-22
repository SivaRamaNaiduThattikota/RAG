const advancedLesson0211=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0211(){if(advancedLesson0211)advancedLesson0211.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0211);syncAdvancedTarget0211()

// Grammar mask stepper.
// Every earlier lab in this module either steps through one fixed toy table via a strategy switch,
// or drives one live formula off a couple of sliders. This one runs two decodes side by side, off
// the identical fixed toy logits, and only lets one of them see a restricted token set. The point
// isn't a new formula -- softmaxWithTemperature below is the exact same softmax-with-temperature
// shape used earlier in this course (T=1 here, dividing by 1 does nothing, it's cited not reinvented)
// -- the point is watching the same model, same scores, produce a guaranteed-valid string in one
// column and a fluent-but-broken one in the other.
//
// Expected markup hooks (owned by the HTML for this lesson, not this file):
//   .grammar-select-button[data-grammar="freeform|enum|citation"]  -- the schema picker
//   #grammarStepButton0211      -- "Step ▶", advances one decode position
//   #grammarRunAllButton0211    -- "Run all steps ▶▶", auto-advances to completion
//   #grammarResetButton0211     -- clears the trace for the current grammar
//   #automatonState0211         -- one-line automaton state readout
//   #unconstrainedBars0211      -- bars container, left panel ("Unconstrained decode")
//   #maskedBars0211             -- bars container, right panel ("Grammar-masked decode")
//   #generatedSoFar0211         -- running masked-winner-only string
//   #grammarSummary0211         -- final valid-vs-invalid payoff line, filled once complete

function softmaxWithTemperature(logits,temperature=1){
  const scaled=logits.map(x=>x/temperature)
  const peak=Math.max(...scaled)
  const exps=scaled.map(x=>Math.exp(x-peak))
  const total=exps.reduce((a,b)=>a+b,0)
  return exps.map(e=>e/total)
}

const grammarSpecs={
  freeform:{
    label:'Free-form',
    joinSeparator:' ',
    completeState:'state: complete (ran a fixed 3-step control — no grammar was ever active)',
    steps:[
      {state:'state: unconstrained — no grammar active',reason:'',isEligible:()=>true,
        candidates:[{token:'The',logit:2.3},{token:'Status',logit:2.6},{token:'It',logit:1.4},{token:'Result',logit:1.9}]},
      {state:'state: unconstrained — no grammar active',reason:'',isEligible:()=>true,
        candidates:[{token:'field',logit:2.5},{token:'value',logit:2.1},{token:'looks',logit:1.6},{token:'result',logit:1.3}]},
      {state:'state: unconstrained — no grammar active',reason:'',isEligible:()=>true,
        candidates:[{token:'pending.',logit:2.7},{token:'uncertain.',logit:2.4},{token:'fine.',logit:1.8},{token:'mixed.',logit:1.5}]},
    ],
  },
  enum:{
    label:'Enum field',
    joinSeparator:'',
    completeState:'state: complete',
    steps:[
      {state:'state: expecting one of approved | denied | pending',
        reason:'not valid here — expects an enum value',
        isEligible:token=>['approved','denied','pending'].includes(token),
        candidates:[{token:'unknown',logit:2.6},{token:'approved',logit:2.3},{token:'denied',logit:1.9},{token:'pending',logit:1.5},{token:'maybe',logit:1.2}]},
    ],
  },
  citation:{
    label:'Citation tag',
    joinSeparator:'',
    completeState:'state: complete',
    steps:[
      {state:'state: expecting the literal [Doc',
        reason:'not valid here — grammar requires the literal [Doc',
        isEligible:token=>token==='[Doc',
        candidates:[{token:'[Doc',logit:2.6},{token:'Source',logit:2.1},{token:'[Ref',logit:1.8},{token:'See',logit:1.4}]},
      {state:'state: expecting a single digit 0-9',
        reason:'not valid here — grammar requires exactly one digit',
        isEligible:token=>/^[0-9]$/.test(token),
        candidates:[{token:'12',logit:2.4},{token:'7',logit:2.1},{token:'x',logit:1.9},{token:'3',logit:1.5}]},
      {state:'state: expecting the closing ]',
        reason:'not valid here — grammar requires the closing ]',
        isEligible:token=>token===']',
        candidates:[{token:']',logit:2.3},{token:'.',logit:2.0},{token:',',logit:1.6},{token:']]',logit:1.2}]},
    ],
  },
}

const grammarButtons=[...document.querySelectorAll('.grammar-select-button')]
const stepButton=document.querySelector('#grammarStepButton0211')
const runAllButton=document.querySelector('#grammarRunAllButton0211')
const resetButton=document.querySelector('#grammarResetButton0211')
const stateEl=document.querySelector('#automatonState0211')
const unconstrainedBarsEl=document.querySelector('#unconstrainedBars0211')
const maskedBarsEl=document.querySelector('#maskedBars0211')
const generatedEl=document.querySelector('#generatedSoFar0211')
const summaryEl=document.querySelector('#grammarSummary0211')

let currentGrammarKey='freeform'
let stepIndex=0
let completed=false
let running=false
let runId=0
let runTimer=null
let generatedSoFar=''
let unconstrainedTrace=[]
let lastStepView=null

const currentGrammar=()=>grammarSpecs[currentGrammarKey]

function setActiveGrammarButton(){
  grammarButtons.forEach(button=>{
    const active=button.dataset.grammar===currentGrammarKey
    button.classList.toggle('active',active)
    button.classList.toggle('secondary',!active)
    button.setAttribute('aria-pressed',String(active))
  })
}

function stopRunning(){
  running=false
  runId+=1
  if(runTimer){clearTimeout(runTimer);runTimer=null}
}

function runStep(){
  const grammar=currentGrammar()
  if(completed||stepIndex>=grammar.steps.length)return false
  const step=grammar.steps[stepIndex]
  const tokens=step.candidates.map(c=>c.token)
  const logits=step.candidates.map(c=>c.logit)
  const eligibleFlags=tokens.map(step.isEligible)

  const uncProbs=softmaxWithTemperature(logits,1).map(p=>p*100)
  const eligibleLogits=logits.filter((_,i)=>eligibleFlags[i])
  const eligibleProbs=softmaxWithTemperature(eligibleLogits,1)
  let cursor=0
  const maskedProbs=eligibleFlags.map(flag=>{
    if(!flag)return 0
    const p=eligibleProbs[cursor]*100
    cursor+=1
    return p
  })

  const uncWinnerIndex=uncProbs.indexOf(Math.max(...uncProbs))
  const maskedWinnerIndex=maskedProbs.indexOf(Math.max(...maskedProbs))

  lastStepView={
    unconstrainedRows:tokens.map((token,i)=>({token,pct:uncProbs[i],winner:i===uncWinnerIndex,eligible:true})),
    maskedRows:tokens.map((token,i)=>({token,pct:maskedProbs[i],winner:eligibleFlags[i]&&i===maskedWinnerIndex,eligible:eligibleFlags[i],reason:step.reason})),
  }

  const uncWinnerToken=tokens[uncWinnerIndex]
  const maskedWinnerToken=tokens[maskedWinnerIndex]
  unconstrainedTrace.push({token:uncWinnerToken,eligible:eligibleFlags[uncWinnerIndex]})
  generatedSoFar=generatedSoFar.length===0?maskedWinnerToken:generatedSoFar+grammar.joinSeparator+maskedWinnerToken

  stepIndex+=1
  if(stepIndex>=grammar.steps.length)completed=true
  return true
}

function probRow(row){
  const classes=['prob-row']
  if(row.winner)classes.push('winner')
  if(row.eligible===false)classes.push('ineligible')
  const pct=row.pct.toFixed(1)
  const reasonHtml=row.eligible===false?`<small class="token-reason">${row.reason}</small>`:''
  return `<div class="${classes.join(' ')}"><span class="token-label">${row.token}${row.winner?' ✓':''}</span><div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div><span>${pct}%</span>${reasonHtml}</div>`
}

function renderState(){
  if(!stateEl)return
  const grammar=currentGrammar()
  stateEl.textContent=completed?grammar.completeState:grammar.steps[stepIndex].state
}

function renderPanels(){
  if(!lastStepView){
    const placeholder='<p class="fine-print">Press "Step ▶" to run the first decode step.</p>'
    if(unconstrainedBarsEl)unconstrainedBarsEl.innerHTML=placeholder
    if(maskedBarsEl)maskedBarsEl.innerHTML=placeholder
    return
  }
  if(unconstrainedBarsEl)unconstrainedBarsEl.innerHTML=lastStepView.unconstrainedRows.map(probRow).join('')
  if(maskedBarsEl)maskedBarsEl.innerHTML=lastStepView.maskedRows.map(probRow).join('')
}

function renderGenerated(){
  if(!generatedEl)return
  generatedEl.innerHTML=generatedSoFar
    ? `<p><b>Generated so far (masked winners only):</b> <code>${generatedSoFar}</code></p>`
    : '<p class="fine-print">Nothing generated yet.</p>'
}

function buildSummary(){
  const grammar=currentGrammar()
  if(currentGrammarKey==='freeform'){
    const uncStr=unconstrainedTrace.map(t=>t.token).join(grammar.joinSeparator)
    return `<p><b>Unconstrained decode produced:</b> "${uncStr}" — no grammar was active, so there was nothing to break.</p><p><b>Grammar-masked decode produced:</b> "${generatedSoFar}" — identical. With every candidate eligible, masking removes nothing: same logits in, same winner out, every step.</p>`
  }
  const breakAt=unconstrainedTrace.findIndex(t=>!t.eligible)
  const uncStr=unconstrainedTrace.map(t=>t.token).join(grammar.joinSeparator)
  const uncVerdict=breakAt===-1
    ? '(happens to still be valid here, but only by coincidence of these particular logits)'
    : `(invalid — breaks the grammar at step ${breakAt+1})`
  return `<p><b>Unconstrained decode would have produced:</b> "${uncStr}" ${uncVerdict}.</p><p><b>Grammar-masked decode produced:</b> "${generatedSoFar}" (valid ${grammar.label.toLowerCase()}). Same model, same logits, at every step — only the eligible set differed.</p>`
}

function renderSummary(){
  if(!summaryEl)return
  summaryEl.innerHTML=completed?buildSummary():''
}

function updateControls(){
  if(stepButton)stepButton.disabled=completed||running
  if(runAllButton)runAllButton.disabled=completed||running
}

function render(){
  renderState()
  renderPanels()
  renderGenerated()
  renderSummary()
  updateControls()
}

function resetTrace(){
  stopRunning()
  stepIndex=0
  completed=false
  generatedSoFar=''
  unconstrainedTrace=[]
  lastStepView=null
  render()
}

function selectGrammar(button){
  stopRunning()
  currentGrammarKey=button.dataset.grammar
  setActiveGrammarButton()
  resetTrace()
}

function runAllSteps(){
  if(completed||running)return
  running=true
  const thisRun=(runId+=1)
  updateControls()
  const tick=()=>{
    if(runId!==thisRun)return
    runStep()
    render()
    if(completed||runId!==thisRun){
      running=false
      runTimer=null
      return
    }
    runTimer=setTimeout(tick,260)
  }
  tick()
}

grammarButtons.forEach(button=>button.addEventListener('click',()=>selectGrammar(button)))
stepButton?.addEventListener('click',()=>{stopRunning();if(runStep())render()})
runAllButton?.addEventListener('click',runAllSteps)
resetButton?.addEventListener('click',resetTrace)

setActiveGrammarButton()
render()
