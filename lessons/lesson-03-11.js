const advancedLesson0311=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0311(){if(advancedLesson0311)advancedLesson0311.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0311)
syncAdvancedTarget0311()

// Section 14's lab: The Failure Chain Diagnostic -- one fixed query, four
// possible underlying runs (intact, retrieval failure, augmentation failure,
// generation failure). The learner inspects three checkpoints in any order
// (retrieval log, assembled context, generated answer) via independent
// reveal toggles, then picks a diagnosis, exactly like Section 12's
// from-scratch diagnose_failure function.

const QUERY_LINE_0311='"How many remote workdays per week are employees allowed?" -- true fact: 3 days, stated directly in the remote-work policy.'

const RUNS_0311=[
  {
    label:'Intact run',
    retrievalLog:'Top-3 candidates: remote-work-policy (score 0.89, rank 1), parental-leave-policy (0.40), expense-policy (0.25). The remote-work chunk is in the candidate set.',
    context:'"...Employees may work remotely up to 3 days per week with manager approval..." -- present, intact, in the exact prompt sent to the model.',
    answer:'"Employees are allowed up to 3 remote workdays per week."',
    evidenceInCandidates:true,
    evidenceInContext:true,
    answerMatchesEvidence:true,
    outcome:'correct',
    reason:'All three links held: the remote-work chunk was retrieved, it survived intact into context, and the model restated it correctly. No failure anywhere in the chain.'
  },
  {
    label:'Run A',
    retrievalLog:'Top-3 candidates: expense-policy (0.42), parental-leave-policy (0.38), onboarding-faq (0.35). The remote-work chunk never appears -- a vocabulary mismatch between "remote" in the query and "telecommute" in the document.',
    context:'Only the three retrieved (irrelevant) chunks above. No remote-workday number appears anywhere in the assembled context.',
    answer:'"Employees may work remotely as needed, subject to manager approval." -- no specific number given.',
    evidenceInCandidates:false,
    evidenceInContext:false,
    answerMatchesEvidence:false,
    outcome:'retrieval_failure',
    reason:'The remote-work chunk never entered the candidate set at all. Augmentation and generation never had a fair chance -- there was nothing correct to assemble or use. Fix: chunking, embeddings, or query phrasing, not the model.'
  },
  {
    label:'Run B',
    retrievalLog:'Top-3 candidates: remote-work-policy (score 0.89, rank 1), parental-leave-policy (0.40), expense-policy (0.25). The remote-work chunk is retrieved correctly, at rank 1.',
    context:'A consolidation-strategy bug discards the top-ranked chunk as a near-duplicate of an unrelated boilerplate header before the prompt is built. No remote-workday number appears in the final assembled context, despite correct retrieval.',
    answer:'"Employees may work remotely as needed, subject to manager approval." -- no specific number given.',
    evidenceInCandidates:true,
    evidenceInContext:false,
    answerMatchesEvidence:false,
    outcome:'augmentation_failure',
    reason:'Retrieval held -- the fact was found. But it was dropped during context assembly before the model ever saw it. This looks identical to Run A from the final answer alone; only the retrieval log (which shows the chunk WAS found) tells them apart. Fix: the context assembler, not the retriever.'
  },
  {
    label:'Run C',
    retrievalLog:'Top-3 candidates: remote-work-policy (score 0.89, rank 1), parental-leave-policy (0.40), expense-policy (0.25). The remote-work chunk is retrieved correctly, at rank 1.',
    context:'"...Employees may work remotely up to 3 days per week with manager approval..." -- present, intact, in the exact prompt sent to the model.',
    answer:'"Employees are allowed up to 5 remote workdays per week."',
    evidenceInCandidates:true,
    evidenceInContext:true,
    answerMatchesEvidence:false,
    outcome:'generation_failure',
    reason:'Retrieval and augmentation both held -- the correct evidence was confirmed intact in the model\'s context. The model still stated the wrong number. This is Concept 04\'s grounded-misread mechanism: evidence present, claim still wrong.'
  }
]

const OUTCOME_LABELS_0311={
  retrieval_failure:'Retrieval failure',
  augmentation_failure:'Augmentation failure',
  generation_failure:'Generation failure',
  correct:'No failure -- correct'
}

const diagnoseFailure0311=(evidenceInCandidates,evidenceInContext,answerMatchesEvidence)=>{
  if(!evidenceInCandidates)return 'retrieval_failure'
  if(!evidenceInContext)return 'augmentation_failure'
  if(!answerMatchesEvidence)return 'generation_failure'
  return 'correct'
}

const state0311={index:0,score:0,attempted:0,diagnosed:false}

const queryLineBox0311=document.querySelector('#chainQueryLine0311')
const inspectButtons0311=[...document.querySelectorAll('[data-inspect]')]
const panelRetrieval0311=document.querySelector('#chainPanelRetrieval0311')
const panelContext0311=document.querySelector('#chainPanelContext0311')
const panelAnswer0311=document.querySelector('#chainPanelAnswer0311')
const diagnosisGroup0311=document.querySelector('#chainDiagnosisGroup0311')
const resultBox0311=document.querySelector('#chainResult0311')
const scoreBox0311=document.querySelector('#chainScore0311')
const nextButton0311=document.querySelector('#chainNext0311')

const PANELS_0311={
  retrieval:panelRetrieval0311,
  context:panelContext0311,
  answer:panelAnswer0311
}

function renderRun0311(){
  const run=RUNS_0311[state0311.index]
  if(queryLineBox0311)queryLineBox0311.innerHTML=`<p><b>Query:</b> ${QUERY_LINE_0311}</p>`
  state0311.diagnosed=false
  if(resultBox0311)resultBox0311.innerHTML=''
  Object.values(PANELS_0311).forEach(panel=>{if(panel){panel.hidden=true}})
  if(panelRetrieval0311)panelRetrieval0311.querySelector('p').textContent=run.retrievalLog
  if(panelContext0311)panelContext0311.querySelector('p').textContent=run.context
  if(panelAnswer0311)panelAnswer0311.querySelector('p').textContent=run.answer
  ;[...document.querySelectorAll('[data-diagnosis]')].forEach(button=>button.classList.remove('active'))
}

inspectButtons0311.forEach(button=>button.addEventListener('click',()=>{
  const key=button.dataset.inspect
  const panel=PANELS_0311[key]
  if(panel)panel.hidden=!panel.hidden
}))

if(diagnosisGroup0311)diagnosisGroup0311.querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>{
  if(state0311.diagnosed)return
  const run=RUNS_0311[state0311.index]
  const guess=button.dataset.diagnosis
  const correct=guess===run.outcome
  state0311.diagnosed=true
  state0311.attempted++
  if(correct)state0311.score++
  diagnosisGroup0311.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b===button))
  if(resultBox0311)resultBox0311.innerHTML=`<p><b>${correct?'Correct':'Not quite'} -- ${OUTCOME_LABELS_0311[run.outcome]}.</b></p><p>${run.reason}</p>`
  if(scoreBox0311)scoreBox0311.textContent=`Score: ${state0311.score} / ${state0311.attempted}`
}))

if(nextButton0311)nextButton0311.addEventListener('click',()=>{
  state0311.index=(state0311.index+1)%RUNS_0311.length
  renderRun0311()
})

renderRun0311()
