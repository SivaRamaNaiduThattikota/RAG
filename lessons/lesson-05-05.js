const advancedLesson0505=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0505(){if(advancedLesson0505)advancedLesson0505.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0505)
syncAdvancedTarget0505()

// Section 14's lab: the TF-IDF Document Ranker.
// Reuses Concept 04's five-ticket corpus and idf definition, but goes one
// step further than Concept 04's explorer did: it multiplies tf by idf for
// every ticket and actually sorts them, so the ranking this concept derives
// is something you can watch happen, not just read about.

const TICKETS_0505={
  T1:'my order is late and my order never arrived',
  T2:'please refund my order immediately',
  T3:'the refund was processed but the refund amount is wrong',
  T4:'where is my order confirmation email',
  T5:'i need help resetting my password'
}

const TERMS_0505=['order','refund','password','my','is']

function termFrequency0505(term,text){
  return text.split(' ').filter(word=>word===term).length
}

function documentFrequency0505(term){
  return Object.values(TICKETS_0505).filter(text=>text.split(' ').includes(term)).length
}

function inverseDocumentFrequency0505(term){
  const n=Object.keys(TICKETS_0505).length
  const df=documentFrequency0505(term)
  if(df===0)return null
  return Math.log(n/df)
}

function tfIdf0505(term,docId){
  const idf=inverseDocumentFrequency0505(term)
  if(idf===null)return 0
  return termFrequency0505(term,TICKETS_0505[docId])*idf
}

const termSelect0505=document.querySelector('#wgTerm_0505')
const runButton0505=document.querySelector('#wgRunRanker_0505')
const resetButton0505=document.querySelector('#wgResetRanker_0505')
const rankBarsBox0505=document.querySelector('#wgRankBars_0505')
const idfBox0505=document.querySelector('#wgRankIdf_0505')
const topBox0505=document.querySelector('#wgRankTop_0505')
const verdictBox0505=document.querySelector('#wgVerdictRanker_0505')

function populateTermSelect0505(){
  if(!termSelect0505)return
  TERMS_0505.forEach(term=>{
    const opt=document.createElement('option')
    opt.value=term
    opt.textContent=`"${term}"`
    termSelect0505.appendChild(opt)
  })
  termSelect0505.value='refund'
}

function renderRankBars0505(ranked){
  const maxScore=Math.max(0.0001,...ranked.map(row=>row.score))
  return ranked.map((row,index)=>`<div class="prob-row"><span>#${index+1} ${row.doc}</span><div class="bar-track"><div class="bar-fill" style="width:${(row.score/maxScore*100)}%"></div></div><span>${row.score.toFixed(4)}</span></div>`).join('')
}

function runRanker0505(){
  const term=termSelect0505?.value||'refund'
  const idf=inverseDocumentFrequency0505(term)
  const docIds=Object.keys(TICKETS_0505)
  const ranked=docIds
    .map(doc=>({doc,tf:termFrequency0505(term,TICKETS_0505[doc]),score:tfIdf0505(term,doc)}))
    .sort((a,b)=>b.score-a.score)
  if(rankBarsBox0505)rankBarsBox0505.innerHTML=renderRankBars0505(ranked)
  if(idfBox0505)idfBox0505.textContent=idf===null?'undefined (log of ∞)':idf.toFixed(4)
  const top=ranked[0]
  if(topBox0505)topBox0505.textContent=top&&top.score>0?`${top.doc} (${top.score.toFixed(4)})`:'none (all tied at 0)'
  if(verdictBox0505){
    let verdict
    if(idf===null){
      verdict=`"${term}" appears in zero of the five tickets, so idf is undefined and every tf-idf score comes out 0 -- there is nothing to rank, only ties.`
    }else if(idf===0){
      verdict=`"${term}" appears in all five tickets, so idf = 0 exactly and every ticket's tf-idf score is 0 regardless of how many times the term repeats -- multiplication zeroed out an uninformative term completely.`
    }else{
      const zeroCount=ranked.filter(row=>row.score===0).length
      verdict=`Ranked by tf-idf for "${term}": ${top.doc} comes first with tf = ${top.tf} and score ${top.score.toFixed(4)}. ${zeroCount} of the five tickets tie at exactly 0 because their term frequency for "${term}" is 0 -- the shared idf of ${idf.toFixed(4)} scales every ticket's tf the same way, so the ranking is really tf's ranking, multiplied by a constant.`
    }
    verdictBox0505.textContent=verdict
  }
}

function resetRanker0505(){
  if(termSelect0505)termSelect0505.value='refund'
  if(rankBarsBox0505)rankBarsBox0505.innerHTML=''
  if(idfBox0505)idfBox0505.textContent='—'
  if(topBox0505)topBox0505.textContent='—'
  if(verdictBox0505)verdictBox0505.textContent='Pick a term and press "Rank tickets" to see all five tickets sorted by tf-idf score.'
}

runButton0505?.addEventListener('click',runRanker0505)
resetButton0505?.addEventListener('click',resetRanker0505)
termSelect0505?.addEventListener('change',resetRanker0505)

populateTermSelect0505()
resetRanker0505()
