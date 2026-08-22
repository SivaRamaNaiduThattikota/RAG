const advancedLesson0305=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0305(){if(advancedLesson0305)advancedLesson0305.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0305)
syncAdvancedTarget0305()

const RETRAIN_STAGES=['Collecting new training data…','Running the training pass…','Evaluating the retrained model…','Deploying the retrained model…']

let corpusEdited=false
let retrainStep=0

const editButton=document.querySelector('#editCorpusButton0305')
const stepButton=document.querySelector('#stepRetrainButton0305')
const queryButton=document.querySelector('#queryBothButton0305')
const resetButton=document.querySelector('#resetRaceButton0305')
const statusOut=document.querySelector('#updateRaceStatus0305')
const queryOut=document.querySelector('#updateRaceQueryOutput0305')

function renderStatus(){
  if(!statusOut)return
  const corpusLine=corpusEdited
    ?'Non-parametric corpus: EDITED — now reads "Headcount: 41,350 (as of today)."'
    :'Non-parametric corpus: unedited — still reads "Headcount: 41,200 (as of Jan 1)."'
  const retrainLine=retrainStep>=RETRAIN_STAGES.length
    ?'Parametric retrain pipeline: COMPLETE — the model now reflects the new headcount.'
    :retrainStep===0
    ?'Parametric retrain pipeline: not started.'
    :`Parametric retrain pipeline: stage ${retrainStep} of ${RETRAIN_STAGES.length} — ${RETRAIN_STAGES[retrainStep-1]}`
  statusOut.innerHTML=`<p>${corpusLine}</p><p>${retrainLine}</p>`
}

function renderQuery(){
  if(!queryOut)return
  const corpusAnswer=corpusEdited?'41,350 (current)':'41,200 (stale — from Jan 1)'
  const modelAnswer=retrainStep>=RETRAIN_STAGES.length?'41,350 (current, post-retrain)':'41,200 (stale — retrain not finished)'
  const verdict=corpusEdited&&retrainStep<RETRAIN_STAGES.length
    ?'The non-parametric path already answers correctly. The parametric path is still stale — it will stay stale until every remaining retrain stage finishes.'
    :(!corpusEdited&&retrainStep<RETRAIN_STAGES.length)
    ?'Neither path has been updated yet — both answer with the old number.'
    :'Both paths now agree — but the non-parametric edit took one click; the retrain took all four stages.'
  queryOut.innerHTML=`<p><b>Query: "What's the current headcount?"</b></p>
<p>Retrieved from non-parametric corpus: ${corpusAnswer}</p>
<p>Generated from parametric memory: ${modelAnswer}</p>
<p>${verdict}</p>`
}

editButton?.addEventListener('click',()=>{
  corpusEdited=true
  renderStatus()
})

stepButton?.addEventListener('click',()=>{
  if(retrainStep<RETRAIN_STAGES.length){
    retrainStep+=1
    renderStatus()
  }
})

queryButton?.addEventListener('click',renderQuery)

resetButton?.addEventListener('click',()=>{
  corpusEdited=false
  retrainStep=0
  renderStatus()
  if(queryOut)queryOut.innerHTML=''
})

renderStatus()
