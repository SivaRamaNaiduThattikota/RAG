const advancedLesson0501=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0501(){if(advancedLesson0501)advancedLesson0501.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0501)
syncAdvancedTarget0501()

// Section 14's lab: the Relevance Judgment Explorer. No index, no scoring
// formula -- this concept hasn't built one yet. The learner marks each of the
// eight corpus documents relevant/not-relevant by their own judgment, then
// compares against the lesson's own graded judgment (Section 10 for the
// boolean-search query, Section 21 for the second query). The point is that
// disagreement is expected and fine -- relevance is a judgment call, not a
// lookup, which is this concept's whole thesis.

const CORPUS_0501={
  1:'vector search over dense embeddings',
  2:'sparse retrieval with an inverted index',
  3:'dense embeddings for semantic search',
  4:'keyword search using an inverted index',
  5:'vector index for approximate search',
  6:'sparse and dense retrieval combined',
  7:'embeddings from a neural encoder',
  8:'boolean search over an inverted index'
}

// Gold judgments, lifted directly from Section 10 (boolean) and Section 21 (dense).
const GOLD_0501={
  boolean:{1:0,2:1,3:0,4:1,5:0,6:0,7:0,8:2},
  dense:{1:2,2:0,3:2,4:0,5:1,6:0,7:1,8:0}
}

const querySelect0501=document.querySelector('#wgQuery_0501')
const toggleRow0501=document.querySelector('#wgDocToggles_0501')
const checkButton0501=document.querySelector('#wgCheck_0501')
const resetButton0501=document.querySelector('#wgReset_0501')
const readout0501=document.querySelector('#wgReadout_0501')
const yoursBox0501=document.querySelector('#wgYours_0501')
const goldBox0501=document.querySelector('#wgGold_0501')
const agreementBox0501=document.querySelector('#wgAgreement_0501')
const verdictBox0501=document.querySelector('#wgVerdict_0501')

let marks0501={}

function buildToggles0501(){
  if(!toggleRow0501)return
  toggleRow0501.innerHTML=''
  marks0501={}
  Object.keys(CORPUS_0501).forEach(id=>{
    marks0501[id]=false
    const btn=document.createElement('button')
    btn.type='button'
    btn.className='secondary'
    btn.dataset.doc=id
    btn.title=CORPUS_0501[id]
    btn.textContent=`D${id} · not relevant`
    btn.addEventListener('click',()=>{
      marks0501[id]=!marks0501[id]
      btn.classList.toggle('secondary',!marks0501[id])
      btn.textContent=marks0501[id]?`D${id} · relevant`:`D${id} · not relevant`
    })
    toggleRow0501.appendChild(btn)
  })
  if(readout0501)readout0501.hidden=true
  if(verdictBox0501)verdictBox0501.hidden=true
}

function reveal0501(){
  const gold=GOLD_0501[querySelect0501?.value||'boolean']
  const yourRelevant=Object.keys(marks0501).filter(id=>marks0501[id]).map(Number).sort((a,b)=>a-b)
  const goldRelevant=Object.keys(gold).filter(id=>gold[id]>0).map(Number).sort((a,b)=>a-b)
  let agree=0
  Object.keys(CORPUS_0501).forEach(id=>{
    const yours=!!marks0501[id]
    const golds=gold[id]>0
    if(yours===golds)agree++
  })
  if(yoursBox0501)yoursBox0501.textContent=yourRelevant.length?yourRelevant.map(d=>'D'+d).join(', '):'none marked'
  if(goldBox0501)goldBox0501.textContent=goldRelevant.map(d=>'D'+d).join(', ')
  if(agreementBox0501)agreementBox0501.textContent=`${agree} / 8 documents`
  if(readout0501)readout0501.hidden=false
  if(verdictBox0501){
    verdictBox0501.hidden=false
    verdictBox0501.textContent=agree===8
      ? 'You agreed with the lesson\'s judgment on every document -- but a different, equally reasonable reader could still disagree, since relevance is a judgment call, not a computed fact.'
      : `You disagreed with the lesson's judgment on ${8-agree} document${8-agree===1?'':'s'}. That is expected: rel(d,q) is an estimate of a human need, and reasonable readers can grade the same document differently.`
  }
}

querySelect0501?.addEventListener('change',buildToggles0501)
checkButton0501?.addEventListener('click',reveal0501)
resetButton0501?.addEventListener('click',buildToggles0501)
buildToggles0501()
