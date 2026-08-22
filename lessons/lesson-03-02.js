const advancedLesson0302=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0302(){if(advancedLesson0302)advancedLesson0302.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0302);syncAdvancedTarget0302()

// "The Wiring Test" lab.
// Different mechanic from concept 01's drag-to-bin sorter and module 02 concept 09's coverage-select-
// then-stream-decode lab: this one is repeated-attempt-then-fix. The learner picks a query, then tries
// three different prompting strategies against it -- as many times as they like -- before finally
// clicking "wire in a retriever." The point: no amount of rephrasing changes what a plain LLM can reach.
// The private and post-cutoff queries stay broken no matter how they're asked; the public query already
// works without a retriever, so wiring one in there is shown to add nothing.
//
// Expected markup hooks (owned by the HTML for this lesson, not this file):
//   .wiring-query-chip[data-query]        -- private / cutoff / public, mutually exclusive "active"
//   .wiring-attempt-button[data-attempt]  -- plain / polite / cite
//   #wireRetrieverButton0302              -- the fix button
//   #wiringResetButton0302                -- clears log + score, resets status
//   #wiringStatus0302 / #wiringLog0302 / #wiringScore0302 -- the three output containers

const queryData0302={
  private:{
    label:`"What's our internal reimbursement cap for home-office equipment?"`,
    guess:`"The cap is $750 per year." That figure isn't drawn from any document — it's a plausible-sounding guess.`,
    reason:`closed loop — no read channel to any external document, regardless of the instruction.`,
    source:`the internal reimbursement policy document`,
  },
  cutoff:{
    label:`"What did the company announce in this morning's town hall?"`,
    guess:`"A Q3 roadmap update and a benefits reminder." Invented — no transcript of this morning's meeting was ever read.`,
    reason:`closed loop — no read channel to any external document, regardless of the instruction.`,
    source:`this morning's town-hall transcript`,
  },
  public:{
    label:`"How many days are in a standard calendar week?"`,
    guess:`"Seven."`,
    reason:`dense, public coverage — no retrieval needed here.`,
  },
}

const attemptLabels0302={
  plain:`Just ask it`,
  polite:`Ask it to "double-check itself"`,
  cite:`Instruct it to "only answer if certain, and cite a source"`,
}

const queryChips0302=[...document.querySelectorAll('.wiring-query-chip')]
const attemptButtons0302=[...document.querySelectorAll('.wiring-attempt-button')]
const fixButton0302=document.querySelector('#wireRetrieverButton0302')
const resetButton0302=document.querySelector('#wiringResetButton0302')
const statusEl0302=document.querySelector('#wiringStatus0302')
const logEl0302=document.querySelector('#wiringLog0302')
const scoreEl0302=document.querySelector('#wiringScore0302')

let currentQuery0302='private'
let wired0302=false
let attemptCount0302=0
let fixCount0302=0

function plural0302(n,singular,plural){return n===1?singular:plural}

function renderStatus0302(){
  if(!statusEl0302)return
  const label=queryData0302[currentQuery0302].label
  statusEl0302.textContent=`Loaded: ${label} — ${wired0302?'EVIDENCE WIRE ATTACHED':'CLOSED LOOP'}.`
}

function appendLog0302(html){
  if(!logEl0302)return
  logEl0302.insertAdjacentHTML('beforeend',`<p>${html}</p>`)
}

function renderScore0302(){
  if(!scoreEl0302)return
  const attempts=`${attemptCount0302} prompt ${plural0302(attemptCount0302,'attempt','attempts')}`
  if(currentQuery0302==='public'){
    scoreEl0302.textContent=`${attempts}, ${attemptCount0302} ${plural0302(attemptCount0302,'success','successes')}. Retrieval added nothing new.`
    return
  }
  const fixes=`${fixCount0302} ${plural0302(fixCount0302,'wired retriever','wired retrievers')}`
  scoreEl0302.textContent=`${attempts}, 0 successes. ${fixes}, ${fixCount0302} ${plural0302(fixCount0302,'success','successes')}.`
}

function setActiveChip0302(){
  queryChips0302.forEach(chip=>{
    const active=chip.dataset.query===currentQuery0302
    chip.classList.toggle('active',active)
    chip.setAttribute('aria-pressed',String(active))
  })
}

function selectQuery0302(key){
  if(!queryData0302[key])return
  currentQuery0302=key
  wired0302=false
  attemptCount0302=0
  fixCount0302=0
  setActiveChip0302()
  if(logEl0302)logEl0302.innerHTML=''
  if(scoreEl0302)scoreEl0302.textContent=''
  renderStatus0302()
}

function runAttempt0302(attemptKey){
  const data=queryData0302[currentQuery0302]
  const label=attemptLabels0302[attemptKey]
  attemptCount0302+=1
  if(currentQuery0302==='public'){
    appendLog0302(`<b>${label}</b> → SUCCESS. ${data.guess} Reason: ${data.reason}`)
  }else{
    appendLog0302(`<b>${label}</b> → FAILED. ${data.guess} Reason: ${data.reason}`)
  }
  renderStatus0302()
}

function runFix0302(){
  const data=queryData0302[currentQuery0302]
  fixCount0302+=1
  wired0302=true
  if(currentQuery0302==='public'){
    appendLog0302(`<b>Wire in a retriever</b> → SUCCESS, unchanged. Nothing was missing, so retrieval added nothing new.`)
  }else{
    appendLog0302(`<b>Wire in a retriever</b> → SUCCESS. The answer is now grounded in ${data.source}.`)
  }
  renderStatus0302()
  renderScore0302()
}

function resetWiring0302(){
  wired0302=false
  attemptCount0302=0
  fixCount0302=0
  if(logEl0302)logEl0302.innerHTML=''
  if(scoreEl0302)scoreEl0302.textContent=''
  renderStatus0302()
}

queryChips0302.forEach(chip=>{
  chip.addEventListener('click',()=>selectQuery0302(chip.dataset.query))
})

attemptButtons0302.forEach(button=>{
  button.addEventListener('click',()=>runAttempt0302(button.dataset.attempt))
})

fixButton0302?.addEventListener('click',runFix0302)
resetButton0302?.addEventListener('click',resetWiring0302)

setActiveChip0302()
renderStatus0302()
