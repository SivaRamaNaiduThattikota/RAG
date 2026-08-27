const advancedLesson1004=document.querySelector('#advanced-lesson')
function syncAdvancedTarget1004(){if(advancedLesson1004)advancedLesson1004.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget1004)
syncAdvancedTarget1004()

// Section 14's lab: The Filter-Order Duel. Reuses Module 09 Concept 07's own
// already-verified 20-chunk, 30%-selectivity corpus (matchRanks unchanged)
// -- nothing here is a new benchmark, only two real SQL shapes replayed
// over the same cited numbers.

const N_1004=20
const K_1004=5
const MATCH_RANKS_1004=[3,7,9,14,17,20]

function buildChip_1004(rank, isMatch, isCutoff, extraClass){
  const div=document.createElement('div')
  div.className='rank-chip'+(isMatch?' match':' excluded')+(isCutoff?' cutoff-edge':'')+(extraClass?' '+extraClass:'')
  const b=document.createElement('b')
  b.textContent=String(rank)
  const span=document.createElement('span')
  span.textContent=isMatch?'Acme':'other tenant'
  div.appendChild(b)
  div.appendChild(span)
  return div
}

const rowEl_1004=document.querySelector('#filterRow_1004')
const touchedBox_1004=document.querySelector('#filterTouched_1004')
const returnedBox_1004=document.querySelector('#filterReturned_1004')
const discardedBox_1004=document.querySelector('#filterDiscarded_1004')
const shapeBox_1004=document.querySelector('#filterShape_1004')
const verdict_1004=document.querySelector('#filterVerdict_1004')
const modeButtons_1004=[...document.querySelectorAll('#s14 [data-mode]')]
const resetBtn_1004=document.querySelector('#filterReset_1004')

let currentMode_1004='pre'

function syncButtons_1004(){
  modeButtons_1004.forEach(btn=>btn.classList.toggle('active', btn.dataset.mode===currentMode_1004))
}

function render_1004(){
  const matchSet=new Set(MATCH_RANKS_1004)

  if(rowEl_1004){
    rowEl_1004.innerHTML=''
    for(let rank=1; rank<=N_1004; rank++){
      const isMatch=matchSet.has(rank)
      let isCutoff=false
      if(currentMode_1004==='pre'){
        // Only Acme's own 6 rows are ever touched; among those, rank 17 is the 5th Acme row (cutoff).
        const acmeRanksSorted=[...MATCH_RANKS_1004].sort((a,b)=>a-b)
        isCutoff = isMatch && rank===acmeRanksSorted[K_1004-1]
      } else if(currentMode_1004==='post'){
        isCutoff = rank===17
      }
      const chip=buildChip_1004(rank, isMatch, isCutoff, null)
      if(currentMode_1004==='pre' && !isMatch){
        chip.style.opacity='0.25' // never touched at all under pre-filter
      }
      if(currentMode_1004==='post' && isMatch && rank>17){
        chip.classList.remove('match')
        chip.classList.add('excluded')
        chip.style.outline='2px dashed var(--orange)'
      }
      rowEl_1004.appendChild(chip)
    }
  }

  if(currentMode_1004==='pre'){
    if(touchedBox_1004)touchedBox_1004.textContent=String(MATCH_RANKS_1004.length)
    if(returnedBox_1004)returnedBox_1004.textContent=String(K_1004)
    if(discardedBox_1004)discardedBox_1004.textContent=String(MATCH_RANKS_1004.length-K_1004)
    if(shapeBox_1004)shapeBox_1004.textContent='WHERE before ORDER BY'
    if(verdict_1004){
      verdict_1004.className='callout'
      verdict_1004.textContent='Pre-filter: the tenant WHERE clause runs first, so the vector-distance ORDER BY only ever touches Acme\'s own 6 rows. Top 5 returned, 1 discarded (Acme\'s own 6th-ranked row) -- no other tenant\'s rows are ever compared at all.'
    }
  } else {
    const acmeWithinInner=MATCH_RANKS_1004.filter(r=>r<=17)
    if(touchedBox_1004)touchedBox_1004.textContent=String(N_1004)
    if(returnedBox_1004)returnedBox_1004.textContent=String(K_1004)
    if(discardedBox_1004)discardedBox_1004.textContent='12'
    if(shapeBox_1004)shapeBox_1004.textContent='ORDER BY before WHERE'
    if(verdict_1004){
      verdict_1004.className='callout warning'
      verdict_1004.textContent='Post-filter: the inner subquery ranks all 20 rows with zero tenant awareness and keeps only the top 17 (FETCH FIRST 17 ROWS ONLY) before the outer tenant WHERE clause ever runs. Acme\'s own rank-20 match is discarded by that inner limit before the tenant filter gets a chance to check it -- a leak-by-omission the pre-filter shape cannot produce. Only '+acmeWithinInner.length+' of Acme\'s 6 true matches survive to the outer filter.'
    }
  }
}

modeButtons_1004.forEach(btn=>btn.addEventListener('click',()=>{
  currentMode_1004=btn.dataset.mode
  syncButtons_1004()
  render_1004()
}))

resetBtn_1004?.addEventListener('click',()=>{
  currentMode_1004='pre'
  syncButtons_1004()
  if(rowEl_1004)rowEl_1004.innerHTML=''
  if(touchedBox_1004)touchedBox_1004.textContent='—'
  if(returnedBox_1004)returnedBox_1004.textContent='—'
  if(discardedBox_1004)discardedBox_1004.textContent='—'
  if(shapeBox_1004)shapeBox_1004.textContent='—'
  if(verdict_1004){
    verdict_1004.className='callout'
    verdict_1004.textContent='Click a button above to run one of the two SQL shapes against the same corpus.'
  }
})

syncButtons_1004()
render_1004()
