const advancedLesson0710=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0710(){if(advancedLesson0710)advancedLesson0710.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0710)
syncAdvancedTarget0710()

// Section 14's lab: The Query-Set Verdict. The first Module 07 lab to hold a
// corpus (3 passages, 9 fixed-size chunks) and chunking scheme fixed while
// varying only the query -- 6 queries across 2 sets (primary, paraphrased)
// against the same 9 chunks. Every score below was computed once via an
// executed Node.js script (a stopword-filtered bag-of-words cosine-overlap
// model) and hardcoded here.

const CHUNKS_0710={
  C11:{passage:'P1',short:'"...lets a customer cancel an order within a fixed period..."'},
  C12:{passage:'P1',short:'"...der-cancellation grace period is 14 days from the ship date..."'},
  C13:{passage:'P1',short:'"...CLOSED, refunds stop processing, manual override."'},
  C21:{passage:'P2',short:'"...issues a prepaid return shipping label..."'},
  C22:{passage:'P2',short:'"...ship the item back within 21 days of issuance..."'},
  C23:{passage:'P2',short:'"...window are rejected, order remains billed in full."'},
  C31:{passage:'P3',short:'"...assigns every support ticket a priority level..."'},
  C32:{passage:'P3',short:'"...routed to a senior queue automatically..."'},
  C33:{passage:'P3',short:'"...first response within two business hours."'},
}
const ORDER_0710=['C11','C12','C13','C21','C22','C23','C31','C32','C33']

const QUERIES_0710={
  Q1:{set:'primary',text:'What is the order-cancellation grace period?',correct:'C12',
    scores:{C11:0.2236,C12:0.3333,C13:0,C21:0,C22:0,C23:0,C31:0,C32:0,C33:0}},
  Q2:{set:'primary',text:'How many days do I have to ship a return label back?',correct:'C22',
    scores:{C11:0,C12:0.2108,C13:0,C21:0.2390,C22:0.4000,C23:0,C31:0,C32:0,C33:0}},
  Q3:{set:'primary',text:'Which tickets get routed to the senior queue automatically?',correct:'C32',
    scores:{C11:0,C12:0,C13:0.1195,C21:0,C22:0,C23:0,C31:0,C32:0.5455,C33:0}},
  Q1p:{set:'paraphrased',text:'How much time do I get before an order cancellation expires?',correct:'C12',
    scores:{C11:0,C12:0,C13:0,C21:0,C22:0,C23:0,C31:0,C32:0,C33:0}},
  Q2p:{set:'paraphrased',text:'What is the deadline for sending merchandise back for a refund?',correct:'C22',
    scores:{C11:0,C12:0,C13:0,C21:0,C22:0.1195,C23:0,C31:0,C32:0,C33:0}},
  Q3p:{set:'paraphrased',text:'What issues get escalated to a specialist team without manual action?',correct:'C32',
    scores:{C11:0,C12:0,C13:0.1054,C21:0.1260,C22:0,C23:0,C31:0,C32:0,C33:0}},
}

const VERDICTS_0710={
  Q1:'Correct chunk C12 wins cleanly -- shared vocabulary ("grace","period") makes this an easy hit.',
  Q2:'Correct chunk C22 wins cleanly -- "ship","back","days" all survive from query to chunk unchanged.',
  Q3:'Correct chunk C32 wins by a wide margin -- "routed","senior","queue","automatically" all match directly.',
  Q1p:'All 9 chunks tie at cosine 0.0000 -- zero vocabulary overlap at all. The word "cancellation" never appears whole in any chunk: the boundary cut inside P1 split it into "der-cancellation," and the query\'s own phrasing ("order cancellation expires") shares no surviving word with any chunk. C12\'s reported rank (2 of 9) is a tie-break artifact of insertion order, not a real retrieval signal.',
  Q2p:'C22 still wins (0.1195), on the single surviving shared word "back" -- a real hit, but a much thinner margin than Q2\'s direct phrasing.',
  Q3p:'C32 scores 0.0000 and ranks 8th of 9 -- a false-positive result. Two IRRELEVANT chunks outrank it: C21 (0.1260, a coincidental match on "issues" from P2\'s own opening sentence) and C13 (0.1054, a coincidental match on "manual" from P1\'s "manual override"). Neither has anything to do with the query\'s actual intent.',
}

const setButtons0710=[...document.querySelectorAll('#querySetRow_0710 [data-query]')]
const chipsWrap0710=document.querySelector('#queryVerdictChips_0710')
const readout0710=document.querySelector('#queryVerdictReadout_0710')
const verdict0710=document.querySelector('#queryVerdictCallout_0710')
const summaryEl0710=document.querySelector('#queryVerdictSummary_0710')

let currentQuery0710='Q1'

function syncButtons0710(){
  setButtons0710.forEach(btn=>btn.classList.toggle('active',btn.dataset.query===currentQuery0710))
}

function render0710(){
  const q=QUERIES_0710[currentQuery0710]
  const ranked=ORDER_0710.map(id=>({id,score:q.scores[id]})).sort((a,b)=>b.score-a.score)
  const rankOfCorrect=ranked.findIndex(r=>r.id===q.correct)+1
  const hit1=rankOfCorrect===1
  const hit3=rankOfCorrect<=3

  if(chipsWrap0710){
    chipsWrap0710.innerHTML=ranked.map((r,i)=>{
      const c=CHUNKS_0710[r.id]
      const cls=['rank-chip']
      if(r.id===q.correct)cls.push('match')
      if(i===2)cls.push('cutoff-edge')
      return `<div class="${cls.join(' ')}">
        <b>${r.id}</b>
        <span>${c.passage} · ${c.short}</span>
        <small>cosine: ${r.score.toFixed(4)}</small>
      </div>`
    }).join('')
  }

  if(readout0710){
    readout0710.innerHTML=`
      <div><span>QUERY</span><b>"${q.text}"</b></div>
      <div><span>RANK OF CORRECT CHUNK (${q.correct})</span><b>${rankOfCorrect} of 9</b></div>
      <div><span>HIT@1</span><b style="color:${hit1?'var(--green)':'var(--orange)'}">${hit1?'YES':'NO'}</b></div>
      <div><span>HIT@3</span><b style="color:${hit3?'var(--green)':'var(--orange)'}">${hit3?'YES':'NO'}</b></div>
    `
  }

  if(verdict0710){
    verdict0710.className='callout'+(hit1?'':' warning')
    verdict0710.innerHTML=VERDICTS_0710[currentQuery0710]
  }

  if(summaryEl0710){
    const setKey=q.set
    const setQueries=Object.entries(QUERIES_0710).filter(([,v])=>v.set===setKey)
    let hit1Count=0, hit3Count=0
    setQueries.forEach(([qid,qq])=>{
      const r=ORDER_0710.map(id=>({id,score:qq.scores[id]})).sort((a,b)=>b.score-a.score)
      const rank=r.findIndex(x=>x.id===qq.correct)+1
      if(rank===1)hit1Count++
      if(rank<=3)hit3Count++
    })
    const label=setKey==='primary'?'Primary set (3 queries)':'Paraphrased set (3 queries)'
    summaryEl0710.textContent=`${label}: recall@1 = ${hit1Count}/3 (${(hit1Count/3*100).toFixed(1)}%) · recall@3 = ${hit3Count}/3 (${(hit3Count/3*100).toFixed(1)}%)`
  }
}

setButtons0710.forEach(btn=>btn.addEventListener('click',()=>{
  currentQuery0710=btn.dataset.query
  syncButtons0710()
  render0710()
}))

syncButtons0710()
render0710()
