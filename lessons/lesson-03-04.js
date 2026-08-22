const advancedLesson0304=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0304(){if(advancedLesson0304)advancedLesson0304.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0304);syncAdvancedTarget0304()

// "The Claim Checker" lab.
// Different mechanic again from concept 03's continuous three-clock time simulation and module 02
// concept 11's token-by-token grammar stepper: this one is a claim-to-source verification workflow.
// The learner picks a fixed scenario, reads a generated answer with (or without) a citation attached,
// then takes a deliberate "verify" action against the evidence pool -- no simulated clock, no per-
// token decode, just one fixed query, one generated answer, and the separate question of whether
// that answer's citation actually says what the answer claims it says.
//
// Expected markup hooks (owned by the HTML for this lesson, not this file):
//   .claim-scenario-button[data-scenario="ungrounded|grounded-match|grounded-misread"] -- the picker
//   #claimQueryLine0304        -- the fixed query, restated per scenario
//   #claimEvidencePool0304     -- retrieved passages (or "nothing retrieved") for the scenario
//   #claimAnswerOutput0304     -- the generated answer, with an inline [DocN] citation where it applies
//   #verifyClaimButton0304     -- "Verify this claim ->", checks the citation against the evidence pool
//   #claimVerdictOutput0304    -- the verify result: unverifiable / verified / citation-but-wrong
//   #claimCheckerLog0304       -- append-only log
//   #resetClaimButton0304      -- restores the initial, nothing-chosen-yet placeholder state

const fixedQuery0304=`"What's our password-reset policy?"`

const doc2Passage0304='<div><span>DOC2 -- RETRIEVED</span><p>Company password policy (v4): passwords must be reset every 90 days.</p></div>'
const doc1Distractor0304='<div><span>DOC1 -- RETRIEVED, NOT RELEVANT</span><p>Onboarding checklist (v2): new hires complete IT setup within their first 3 days.</p></div>'
const groundedEvidenceHtml0304=doc2Passage0304+doc1Distractor0304

const scenarioSpecs0304={
  ungrounded:{
    label:'Ask with no evidence',
    queryLine:`${fixedQuery0304} -- asked directly, with no retrieval step in front of it.`,
    evidenceHtml:'<p class="fine-print">(no evidence retrieved -- this answer comes from parametric memory only)</p>',
    answerHtml:'Our policy requires a password reset every 30 days.',
  },
  'grounded-match':{
    label:'Ask grounded -- evidence matches',
    queryLine:`${fixedQuery0304} -- asked with retrieval switched on first.`,
    evidenceHtml:groundedEvidenceHtml0304,
    answerHtml:'Our policy requires a password reset every 90 days. <code>[Doc2]</code>',
  },
  'grounded-misread':{
    label:'Ask grounded -- model misreads evidence',
    queryLine:`${fixedQuery0304} -- asked with retrieval switched on first.`,
    evidenceHtml:groundedEvidenceHtml0304,
    answerHtml:'Our policy requires a password reset every 30 days. <code>[Doc2]</code>',
  },
}

const verdictText0304={
  ungrounded:'No source attached. This claim is unverifiable -- it may be correct, or it may be a hallucination. There is nothing here to check it against.',
  'grounded-match':'Citation [Doc2] checked against the evidence pool: the passage does support this claim. Verified.',
  'grounded-misread':'Citation [Doc2] checked against the evidence pool: the passage says 90 days, not 30. The citation is present and real, but the claim does not match it -- grounding reduced the risk here, it did not eliminate it.',
}

const placeholderQuery0304='Choose a scenario to see the query.'
const placeholderAnswer0304='Generated answer will appear here.'
const defaultScenario0304='ungrounded'

let currentScenario0304=defaultScenario0304

const scenarioButtons0304=[...document.querySelectorAll('.claim-scenario-button')]
const queryLineEl0304=document.querySelector('#claimQueryLine0304')
const evidencePoolEl0304=document.querySelector('#claimEvidencePool0304')
const answerOutputEl0304=document.querySelector('#claimAnswerOutput0304')
const verifyButton0304=document.querySelector('#verifyClaimButton0304')
const verdictOutputEl0304=document.querySelector('#claimVerdictOutput0304')
const logEl0304=document.querySelector('#claimCheckerLog0304')
const resetButton0304=document.querySelector('#resetClaimButton0304')

function appendLog0304(html){
  if(!logEl0304)return
  logEl0304.insertAdjacentHTML('beforeend',`<p>${html}</p>`)
}

function setActiveScenarioButton0304(scenarioKey){
  scenarioButtons0304.forEach(button=>button.classList.toggle('active',button.dataset.scenario===scenarioKey))
}

function selectScenario0304(scenarioKey){
  const spec=scenarioSpecs0304[scenarioKey]
  if(!spec)return
  currentScenario0304=scenarioKey
  setActiveScenarioButton0304(scenarioKey)
  if(queryLineEl0304)queryLineEl0304.textContent=spec.queryLine
  if(evidencePoolEl0304)evidencePoolEl0304.innerHTML=spec.evidenceHtml
  if(answerOutputEl0304)answerOutputEl0304.innerHTML=spec.answerHtml
  if(verdictOutputEl0304)verdictOutputEl0304.textContent=''
  appendLog0304(`Scenario: ${spec.label}. Evidence pool and answer updated -- verify the claim when ready.`)
}

function verifyClaim0304(){
  const spec=scenarioSpecs0304[currentScenario0304]
  const verdict=verdictText0304[currentScenario0304]
  if(!spec||!verdict)return
  if(verdictOutputEl0304)verdictOutputEl0304.textContent=verdict
  appendLog0304(`Verify pressed on "${spec.label}": ${verdict}`)
}

function resetClaim0304(){
  currentScenario0304=defaultScenario0304
  setActiveScenarioButton0304(defaultScenario0304)
  if(queryLineEl0304)queryLineEl0304.textContent=placeholderQuery0304
  if(evidencePoolEl0304)evidencePoolEl0304.innerHTML=''
  if(answerOutputEl0304)answerOutputEl0304.textContent=placeholderAnswer0304
  if(verdictOutputEl0304)verdictOutputEl0304.textContent=''
  if(logEl0304)logEl0304.innerHTML=''
}

scenarioButtons0304.forEach(button=>button.addEventListener('click',()=>selectScenario0304(button.dataset.scenario)))
verifyButton0304?.addEventListener('click',verifyClaim0304)
resetButton0304?.addEventListener('click',resetClaim0304)
