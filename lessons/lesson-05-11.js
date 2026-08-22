const advancedLesson0511=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0511(){if(advancedLesson0511)advancedLesson0511.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0511)
syncAdvancedTarget0511()

// Section 14's lab: the Vocabulary Mismatch Bench. Same 5-ticket corpus,
// same k1/b defaults and the same AVGDL=7.2 already published in Concepts
// 06-07 -- reimplemented here unchanged so any query the learner types
// scores exactly the way Concepts 06-07's own worked numbers do. Typing a
// query or clicking a preset chip re-tokenizes it, recomputes every
// ticket's BM25 total live, and highlights the literal tokens each ticket
// shares with the query -- which is also why some tickets highlight
// nothing at all and still show a nonzero score (the shared token can be
// a different word than the one that scored).

const CORPUS_0511={
  T1:'my order is late and my order never arrived',
  T2:'please refund my order immediately',
  T3:'the refund was processed but the refund amount is wrong',
  T4:'where is my order confirmation email',
  T5:'i need help resetting my password'
}
const TICKET_IDS_0511=['T1','T2','T3','T4','T5']
const K1_0511=1.2
const B_0511=0.75
const AVGDL_0511=TICKET_IDS_0511.reduce((sum,id)=>sum+docLength_0511(CORPUS_0511[id]),0)/TICKET_IDS_0511.length
const HUMAN_RELEVANCE_0511={T2:'partial',T3:'clean'}
const DEFAULT_QUERY_0511='refund'

function docLength_0511(text){return text.split(' ').length}
function termFrequency_0511(term,text){return text.split(' ').filter(w=>w===term).length}
function documentFrequency_0511(term){return TICKET_IDS_0511.filter(id=>CORPUS_0511[id].split(' ').includes(term)).length}
function inverseDocumentFrequency_0511(term){
  const df=documentFrequency_0511(term)
  if(df===0)return null
  return Math.log(TICKET_IDS_0511.length/df)
}
function lengthTerm_0511(docId){
  const dl=docLength_0511(CORPUS_0511[docId])
  return (1-B_0511)+B_0511*(dl/AVGDL_0511)
}
function bm25Term_0511(term,docId){
  const idf=inverseDocumentFrequency_0511(term)
  if(idf===null)return 0
  const tf=termFrequency_0511(term,CORPUS_0511[docId])
  const L=lengthTerm_0511(docId)
  const ratio=(tf*(K1_0511+1))/(tf+K1_0511*L)
  return idf*ratio
}
function tokenizeQuery_0511(query){
  return query.toLowerCase().trim().split(/\s+/).filter(Boolean)
}
function bm25Query_0511(tokens,docId){
  let total=0
  tokens.forEach(term=>{total+=bm25Term_0511(term,docId)})
  return total
}
function escapeHtml_0511(str){
  return str.replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]))
}
function highlightTicketText_0511(text,tokens){
  const tokenSet=new Set(tokens)
  return text.split(' ').map(word=>tokenSet.has(word)?`<mark class="term-hit">${word}</mark>`:word).join(' ')
}

const queryInput_0511=document.querySelector('#wgQueryInput_0511')
const presetChips_0511=document.querySelectorAll('.preset-chip[data-query-0511]')
const revealRelBtn_0511=document.querySelector('#wgRevealRelBtn_0511')
const resetBtn_0511=document.querySelector('#wgResetBtn_0511')
const ticketList_0511=document.querySelector('#wgTicketList_0511')
const vocabReadout_0511=document.querySelector('#wgVocabReadout_0511')
const mismatchCallout_0511=document.querySelector('#wgMismatchCallout_0511')

let revealedRelevance_0511=false

function render_0511(){
  const tokens=tokenizeQuery_0511(queryInput_0511?.value||'')
  const results=TICKET_IDS_0511.map(id=>({id,total:bm25Query_0511(tokens,id)}))
  const maxScore=Math.max(0,...results.map(r=>r.total))
  const ranked=[...results].sort((a,b)=>b.total-a.total)
  const topRankedId=maxScore>0?ranked[0].id:null

  if(ticketList_0511){
    ticketList_0511.innerHTML=results.map(r=>{
      const width=maxScore>0?(r.total/maxScore*100):0
      const highlighted=highlightTicketText_0511(CORPUS_0511[r.id],tokens)
      const isTop=r.id===topRankedId
      let badge=''
      if(revealedRelevance_0511&&HUMAN_RELEVANCE_0511[r.id]){
        const kind=HUMAN_RELEVANCE_0511[r.id]
        badge=`<br><span class="relevance-badge ${kind==='clean'?'clean-match':'partial-match'}">HUMAN: ${kind==='clean'?'CLEAN MATCH':'PARTIAL MATCH'}</span>`
      }
      return `<div class="ticket-row${isTop?' top-ranked':''}">
<div class="ticket-id">${r.id}</div>
<div class="ticket-text">${highlighted}${badge}</div>
<div class="bar-track"><div class="bar-fill" style="width:${width.toFixed(1)}%"></div></div>
<div class="ticket-score">${r.total.toFixed(4)}</div>
</div>`
    }).join('')
  }

  if(vocabReadout_0511){
    if(tokens.length===0){
      vocabReadout_0511.innerHTML='Type a query above to see which of its words the corpus actually recognizes.'
    }else{
      const tags=tokens.map(t=>{
        const df=documentFrequency_0511(t)
        const safe=escapeHtml_0511(t)
        return df>0
          ?`<span class="vocab-tag iv">${safe} — in-vocabulary, df=${df}</span>`
          :`<span class="vocab-tag oov">${safe} — out-of-vocabulary, df=0</span>`
      }).join('')
      const topLabel=topRankedId?`Top-ranked: ${topRankedId} (${maxScore.toFixed(4)})`:'Top-ranked: none — every ticket scored 0.0000'
      vocabReadout_0511.innerHTML=`${tags}<span>${topLabel}</span>`
    }
  }

  if(mismatchCallout_0511){
    if(revealedRelevance_0511&&tokens.length>0){
      const t3=results.find(r=>r.id==='T3')
      const t3Rank=ranked.findIndex(r=>r.id==='T3')+1
      mismatchCallout_0511.hidden=false
      if(topRankedId!=='T3'){
        mismatchCallout_0511.innerHTML=`<b>Mismatch</b>Top-ranked: ${topRankedId||'none'} (${maxScore.toFixed(4)}) — Human-relevant: T3, scored ${t3.total.toFixed(4)}, ranked ${t3Rank} of 5.`
      }else{
        mismatchCallout_0511.innerHTML=`<b>Agreement</b>Top-ranked ticket matches the human-tagged clean match — T3, scored ${t3.total.toFixed(4)}.`
      }
    }else{
      mismatchCallout_0511.hidden=true
    }
  }
}

queryInput_0511?.addEventListener('input',render_0511)

presetChips_0511.forEach(btn=>{
  btn.addEventListener('click',()=>{
    if(queryInput_0511){
      queryInput_0511.value=btn.getAttribute('data-query-0511')||''
      queryInput_0511.focus()
    }
    render_0511()
  })
})

revealRelBtn_0511?.addEventListener('click',()=>{
  revealedRelevance_0511=!revealedRelevance_0511
  if(revealRelBtn_0511)revealRelBtn_0511.textContent=revealedRelevance_0511?'Hide human relevance':'Reveal human relevance'
  render_0511()
})

resetBtn_0511?.addEventListener('click',()=>{
  if(queryInput_0511)queryInput_0511.value=DEFAULT_QUERY_0511
  revealedRelevance_0511=false
  if(revealRelBtn_0511)revealRelBtn_0511.textContent='Reveal human relevance'
  render_0511()
})

render_0511()
