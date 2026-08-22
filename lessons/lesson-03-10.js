const advancedLesson0310=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0310(){if(advancedLesson0310)advancedLesson0310.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0310)
syncAdvancedTarget0310()

// Section 14's lab: The Answerability Triage -- for each sample question,
// walk the two-question test (knowledge-intensive? then covered by the
// shown three-document corpus?) and check the resulting classification
// against the question's real answer, exactly like Section 12's
// from-scratch check_answerability function.

const QUESTIONS_0310=[
  {
    text:'Write a two-line congratulations note for a promoted employee.',
    knowledgeIntensive:false,
    covered:false,
    reason:'No fact from any corpus is required to write this -- it is a pure generation task. Retrieval could not help even if the corpus were perfect.'
  },
  {
    text:'How many remote workdays per week are employees allowed?',
    knowledgeIntensive:true,
    covered:true,
    reason:'This depends on a specific policy number, and the shown corpus states it directly in the remote-work document: 3 days.'
  },
  {
    text:'Does the company offer unlimited PTO?',
    knowledgeIntensive:true,
    covered:false,
    reason:'This depends on a specific policy fact, but none of the three shown documents mentions PTO limits at all -- a coverage gap, not a retrieval failure.'
  },
  {
    text:'How many weeks of paid parental leave are available after one year of employment?',
    knowledgeIntensive:true,
    covered:true,
    reason:'This depends on a specific policy number, and the shown corpus states it directly in the parental-leave document: 12 weeks.'
  },
  {
    text:'Translate the phrase "thank you for your patience" into French.',
    knowledgeIntensive:false,
    covered:false,
    reason:'Translation draws on general language ability, not on any fact this or any other corpus would need to supply.'
  }
]

const OUTCOME_LABELS_0310={
  'not-knowledge-intensive':'Not answerable — and not RAG’s job at all',
  'coverage-gap':'Not answerable — coverage gap',
  'answerable':'Answerable'
}

const classifyOutcome0310=(knowledgeIntensive,covered)=>{
  if(!knowledgeIntensive)return 'not-knowledge-intensive'
  if(!covered)return 'coverage-gap'
  return 'answerable'
}

const state0310={index:0,step1:null,step2:null,score:0,attempted:0}

const questionBox0310=document.querySelector('#answerabilityQuestion0310')
const step1Group0310=document.querySelector('#answerabilityStep1_0310')
const step2Group0310=document.querySelector('#answerabilityStep2_0310')
const resultBox0310=document.querySelector('#answerabilityResult0310')
const scoreBox0310=document.querySelector('#answerabilityScore0310')
const nextButton0310=document.querySelector('#answerabilityNext0310')

function syncStepButtons(group,value){
  if(!group)return
  ;[...group.querySelectorAll('button')].forEach(button=>{
    const on=value===button.dataset.value
    button.classList.toggle('active',on)
    button.classList.toggle('secondary',!on)
  })
}

function renderQuestion(){
  const question=QUESTIONS_0310[state0310.index]
  if(questionBox0310)questionBox0310.innerHTML=`<p><b>Question:</b> ${question.text}</p>`
  state0310.step1=null
  state0310.step2=null
  if(resultBox0310)resultBox0310.innerHTML=''
  if(step2Group0310)step2Group0310.hidden=true
  syncStepButtons(step1Group0310,null)
  syncStepButtons(step2Group0310,null)
}

function evaluate(){
  if(state0310.step1===null)return
  if(state0310.step1==='yes'&&state0310.step2===null){
    if(step2Group0310)step2Group0310.hidden=false
    return
  }
  const question=QUESTIONS_0310[state0310.index]
  const guessedKI=state0310.step1==='yes'
  const guessedCovered=guessedKI&&state0310.step2==='yes'
  const guessedOutcome=classifyOutcome0310(guessedKI,guessedCovered)
  const actualOutcome=classifyOutcome0310(question.knowledgeIntensive,question.covered)
  const correct=guessedOutcome===actualOutcome
  state0310.attempted++
  if(correct)state0310.score++
  if(resultBox0310)resultBox0310.innerHTML=`<p><b>${correct?'Correct':'Not quite'} — ${OUTCOME_LABELS_0310[actualOutcome]}.</b></p><p>${question.reason}</p>`
  if(scoreBox0310)scoreBox0310.textContent=`Score: ${state0310.score} / ${state0310.attempted}`
}

if(step1Group0310)step1Group0310.querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>{
  state0310.step1=button.dataset.value
  state0310.step2=null
  if(step2Group0310)step2Group0310.hidden=true
  if(resultBox0310)resultBox0310.innerHTML=''
  syncStepButtons(step1Group0310,state0310.step1)
  syncStepButtons(step2Group0310,null)
  evaluate()
}))

if(step2Group0310)step2Group0310.querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>{
  state0310.step2=button.dataset.value
  syncStepButtons(step2Group0310,state0310.step2)
  evaluate()
}))

if(nextButton0310)nextButton0310.addEventListener('click',()=>{
  state0310.index=(state0310.index+1)%QUESTIONS_0310.length
  renderQuestion()
})

renderQuestion()
