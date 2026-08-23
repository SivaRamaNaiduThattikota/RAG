const advancedLesson0707=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0707(){if(advancedLesson0707)advancedLesson0707.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0707)
syncAdvancedTarget0707()

// Section 14's lab: The Small-to-Big Merger. Reuses Concept 06's own Oracle
// Order Management passage and fact, now split into 4 sentence-clean parents
// (P1-P4) each tiled into blind 35-char children (C1a...C4b) -- every number
// below (cosine scores, merge ratios) was computed once via an executed
// Node.js script against a small content-word vector model and hardcoded
// here, matching how Concepts 05/06's own readouts were built.

const PASSAGE_0707='Oracle Order Management lets a customer cancel an order within a fixed period after purchase. The order-cancellation grace period is 14 days from the ship date. Once it elapses, the order status locks to CLOSED and refunds stop processing automatically. Support agents must file a manual override.'

const PARENTS_0707={
  P1:{start:0,end:94,label:'P1'},
  P2:{start:94,end:161,label:'P2'},
  P3:{start:161,end:254,label:'P3'},
  P4:{start:254,end:297,label:'P4'},
}

const CHILDREN_0707=[
  {label:'C1a',parent:'P1',start:0,end:35,cos:0.2582},
  {label:'C1b',parent:'P1',start:35,end:70,cos:0.5164},
  {label:'C1c',parent:'P1',start:70,end:94,cos:0.3162},
  {label:'C2a',parent:'P2',start:94,end:129,cos:0.8944},
  {label:'C2b',parent:'P2',start:129,end:161,cos:0.0000},
  {label:'C3a',parent:'P3',start:161,end:196,cos:0.3162},
  {label:'C3b',parent:'P3',start:196,end:231,cos:0.0000},
  {label:'C3c',parent:'P3',start:231,end:254,cos:0.0000},
  {label:'C4a',parent:'P4',start:254,end:289,cos:0.0000},
  {label:'C4b',parent:'P4',start:289,end:297,cos:0.0000},
]

const PARENT_COS_0707={P1:0.5394,P2:0.6761,P3:0.1690,P4:0.0000}
const QUERY_0707='What is the grace period length for canceling an order?'
const FACT_0707='The order-cancellation grace period is 14 days from the ship date.'

function textOf0707(start,end){return PASSAGE_0707.slice(start,end)}
function containsFact0707(start,end){
  const factStart=PASSAGE_0707.indexOf(FACT_0707)
  const factEnd=factStart+FACT_0707.length
  return start<=factStart&&end>=factEnd
}

const RANKED_0707=[...CHILDREN_0707].filter(c=>c.cos>0).sort((a,b)=>b.cos-a.cos)

const modeButtons0707=[...document.querySelectorAll('#mergerMode_0707 [data-mode]')]
const rankWrap0707=document.querySelector('#mergerRankWrap_0707')
const readout0707=document.querySelector('#mergerReadout_0707')
const verdict0707=document.querySelector('#mergerVerdict_0707')

let currentMode0707='parentchild'
let currentRank0707=0
let mergeThreshold0707=50

function syncModeButtons0707(){
  modeButtons0707.forEach(btn=>btn.classList.toggle('active',btn.dataset.mode===currentMode0707))
}

function renderParentChild0707(){
  const c=RANKED_0707[currentRank0707]
  const parent=PARENTS_0707[c.parent]
  const childText=textOf0707(c.start,c.end)
  const parentText=textOf0707(parent.start,parent.end)
  const childHasFact=containsFact0707(c.start,c.end)
  const parentHasFact=containsFact0707(parent.start,parent.end)

  if(rankWrap0707){
    rankWrap0707.innerHTML=`
      <div class="dim-toggle" role="group" aria-label="Retrieved child, ranked by cosine similarity">
        ${RANKED_0707.map((r,i)=>`<button type="button" class="secondary${i===currentRank0707?' active':''}" data-rank="${i}">#${i+1} ${r.label}</button>`).join('')}
      </div>
    `
    ;[...rankWrap0707.querySelectorAll('[data-rank]')].forEach(btn=>btn.addEventListener('click',()=>{
      currentRank0707=Number(btn.dataset.rank)
      renderParentChild0707()
    }))
  }

  if(readout0707){
    readout0707.innerHTML=`
      <div><span>MATCHED CHILD (${c.label})</span><b>"${childText}"</b></div>
      <div><span>CHILD COSINE TO QUERY</span><b>${c.cos.toFixed(4)}</b></div>
      <div><span>CHILD ALONE STATES THE ANSWER?</span><b style="color:${childHasFact?'var(--green)':'var(--orange)'}">${childHasFact?'YES':'NO — truncated'}</b></div>
      <div><span>RETURNED PARENT (${c.parent})</span><b>"${parentText}"</b></div>
      <div><span>PARENT COSINE TO QUERY</span><b>${PARENT_COS_0707[c.parent].toFixed(4)}</b></div>
      <div><span>PARENT STATES THE ANSWER?</span><b style="color:${parentHasFact?'var(--green)':'var(--orange)'}">${parentHasFact?'YES — structurally guaranteed':'NO'}</b></div>
    `
  }

  if(verdict0707){
    verdict0707.className='callout'+(childHasFact?'':' warning')
    if(c.label==='C2a'){
      verdict0707.innerHTML=`<b>The #1 match, and it's cut off before the number.</b> C2a scores highest (0.8944) because "grace" and "period" are dense in this 35-character fragment -- but the blind character cut lands right before "is 14 days from the ship date," so the actual answer is missing. Its parent, P2, is the whole sentence -- returning it instead of the raw child restores the number without needing to guess an overlap size.`
    }else if(childHasFact){
      verdict0707.innerHTML=`<b>This particular child already states the answer.</b> Not every truncated child loses the fact -- but nothing about the search step guarantees that in general, which is why the parent is returned regardless of which child matched.`
    }else{
      verdict0707.innerHTML=`<b>Lower-ranked match, also incomplete alone.</b> ${c.label} scores ${c.cos.toFixed(4)} -- lower than C2a, and like C2a it's missing part of its sentence. Its parent (${c.parent}) restores the full sentence the same structural way, regardless of rank.`
    }
  }
}

function renderSmallToBig0707(){
  const top3=['C2a','C1b','C3a']
  const parentIds=['P1','P2','P3','P4']
  const ratios=parentIds.map(pid=>{
    const kids=CHILDREN_0707.filter(c=>c.parent===pid)
    const retrieved=kids.filter(c=>top3.includes(c.label))
    return {pid,retrieved:retrieved.length,total:kids.length,pct:retrieved.length/kids.length*100,retrievedLabels:retrieved.map(c=>c.label)}
  })

  if(rankWrap0707){
    rankWrap0707.innerHTML=`
      <div class="control"><label for="mergerThreshold_0707">Merge-ratio threshold ≥ <output id="mergerThresholdOut_0707">${mergeThreshold0707}%</output></label>
      <input type="range" id="mergerThreshold_0707" min="0" max="100" step="1" value="${mergeThreshold0707}"></div>
      <p style="margin-top:8px;font:11px 'DM Mono',monospace;color:var(--muted)">Top-3 retrieved children this round: C2a (0.8944), C1b (0.5164), C3a (0.3162) -- fixed, so only the threshold changes below.</p>
    `
    document.querySelector('#mergerThreshold_0707')?.addEventListener('input',e=>{
      mergeThreshold0707=Number(e.target.value)
      renderSmallToBig0707()
    })
  }

  if(readout0707){
    const rows=ratios.map(r=>{
      const merges=r.pct>=mergeThreshold0707&&r.retrieved>0
      return `<tr><td>${r.pid}</td><td>${r.retrieved}/${r.total} (${r.pct.toFixed(1)}%)</td><td style="color:${merges?'var(--green)':(r.retrieved>0?'var(--orange)':'var(--muted)')}">${merges?'MERGE → return full parent':(r.retrieved>0?'no merge → return raw child(ren)':'not retrieved')}</td></tr>`
    }).join('')
    readout0707.innerHTML=`<table class="worked-table"><thead><tr><th>Parent</th><th>Children retrieved</th><th>Decision at ${mergeThreshold0707}%</th></tr></thead><tbody>${rows}</tbody></table>`
  }

  if(verdict0707){
    const merged=ratios.filter(r=>r.pct>=mergeThreshold0707&&r.retrieved>0)
    const unmerged=ratios.filter(r=>r.retrieved>0&&!(r.pct>=mergeThreshold0707))
    verdict0707.className='callout'
    const mergedList=merged.map(r=>r.pid).join(', ')||'none'
    const unmergedList=unmerged.flatMap(r=>r.retrievedLabels).join(', ')||'none'
    verdict0707.innerHTML=`<b>Assembled context at ${mergeThreshold0707}%:</b> merged parent(s) [${mergedList}] returned in full, plus unmerged raw child(ren) [${unmergedList}] kept small. At the default 50% threshold, P2 merges (1/2 = 50.0% ≥ 50%) since C2a alone is half its children -- restoring the full grace-period sentence -- while P1 and P3 stay as their raw, still-incomplete children (1/3 ≈ 33.3% each, below threshold). This is the adaptive step plain parent-document retrieval skips: that always returns every matched parent in full, regardless of how much or little local evidence supports it.`
  }
}

function render0707(){
  if(currentMode0707==='parentchild')renderParentChild0707()
  else renderSmallToBig0707()
}

modeButtons0707.forEach(btn=>btn.addEventListener('click',()=>{
  currentMode0707=btn.dataset.mode
  syncModeButtons0707()
  render0707()
}))

syncModeButtons0707()
render0707()
