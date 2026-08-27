const advancedLesson1010=document.querySelector('#advanced-lesson')
function syncAdvancedTarget1010(){if(advancedLesson1010)advancedLesson1010.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget1010)
syncAdvancedTarget1010()

// Section 14's lab: The Missing WHERE Clause. Reuses Concept 04's own
// already-verified 20-chunk, 30%-selectivity corpus (Acme ranks unchanged).
// The caller's own SQL never changes between the two states -- what
// changes is only whether a DBMS_RLS/VPD policy is attached to
// `documents`. Numbers here match the node script quoted in Section 10:
// policy off -> 4 of the top 5 rows returned are wrong-tenant; policy on
// -> identical outcome to Concept 04's own explicit pre-filter shape,
// even though the caller's query has no tenant predicate in either case.

const N_1010=20
const K_1010=5
const MATCH_RANKS_1010=[3,7,9,14,17,20]

function buildChip_1010(rank, isMatch, isCutoff, isLeak){
  const div=document.createElement('div')
  div.className='rank-chip'+(isMatch?' match':' excluded')+(isCutoff?' cutoff-edge':'')
  if(isLeak) div.style.outline='2px dashed var(--orange)'
  const b=document.createElement('b')
  b.textContent=String(rank)
  const span=document.createElement('span')
  span.textContent=isMatch?'Acme':'other tenant'
  div.appendChild(b)
  div.appendChild(span)
  return div
}

const rowEl_1010=document.querySelector('#policyRow_1010')
const touchedBox_1010=document.querySelector('#policyTouched_1010')
const returnedBox_1010=document.querySelector('#policyReturned_1010')
const leakedBox_1010=document.querySelector('#policyLeaked_1010')
const whereBox_1010=document.querySelector('#policyWhere_1010')
const verdict_1010=document.querySelector('#policyVerdict_1010')
const policyButtons_1010=[...document.querySelectorAll('#s14 [data-policy]')]
const resetBtn_1010=document.querySelector('#policyReset_1010')

let currentPolicy_1010='on'

function syncButtons_1010(){
  policyButtons_1010.forEach(btn=>btn.classList.toggle('active', btn.dataset.policy===currentPolicy_1010))
}

function render_1010(){
  const matchSet=new Set(MATCH_RANKS_1010)
  const acmeRanksSorted=[...MATCH_RANKS_1010].sort((a,b)=>a-b)

  if(rowEl_1010){
    rowEl_1010.innerHTML=''
    for(let rank=1; rank<=N_1010; rank++){
      const isMatch=matchSet.has(rank)
      let isCutoff=false, isLeak=false
      if(currentPolicy_1010==='on'){
        // Transient view already narrows to Acme's own 6 rows before ORDER BY
        // ever runs -- identical shape to Concept 04's own pre-filter query.
        isCutoff = isMatch && rank===acmeRanksSorted[K_1010-1]
      } else {
        // No policy, no WHERE clause: naive top-5-by-distance across ALL
        // tenants. Global ranks 1-5 are returned regardless of tenant.
        isCutoff = rank===5
        isLeak = rank<=5 && !isMatch
      }
      const chip=buildChip_1010(rank, isMatch, isCutoff, isLeak)
      if(currentPolicy_1010==='on' && !isMatch){
        chip.style.opacity='0.25' // never enters the transient view at all
      }
      if(currentPolicy_1010==='off' && rank>5){
        chip.style.opacity='0.25' // never reached -- FETCH FIRST 5 already cut here
      }
      rowEl_1010.appendChild(chip)
    }
  }

  if(currentPolicy_1010==='on'){
    if(touchedBox_1010)touchedBox_1010.textContent=String(MATCH_RANKS_1010.length)
    if(returnedBox_1010)returnedBox_1010.textContent=String(K_1010)
    if(leakedBox_1010)leakedBox_1010.textContent='0'
    if(whereBox_1010)whereBox_1010.textContent='Inside the table itself (transient view)'
    if(verdict_1010){
      verdict_1010.className='callout'
      verdict_1010.textContent='VPD policy ON: the caller\'s SQL still has no tenant predicate, but Oracle already rewrote documents into a transient view filtered to Acme\'s own 6 rows before ORDER BY/FETCH FIRST ever ran. Result: identical to Concept 04\'s own explicit pre-filter shape -- 5 returned, 1 discarded (Acme\'s own 6th match), 0 wrong-tenant rows.'
    }
  } else {
    if(touchedBox_1010)touchedBox_1010.textContent=String(N_1010)
    if(returnedBox_1010)returnedBox_1010.textContent=String(K_1010)
    if(leakedBox_1010)leakedBox_1010.textContent='4'
    if(whereBox_1010)whereBox_1010.textContent='Nowhere -- no predicate exists anywhere'
    if(verdict_1010){
      verdict_1010.className='callout warning'
      verdict_1010.textContent='VPD policy OFF: with no policy and no WHERE clause, ORDER BY/FETCH FIRST run across all 20 rows with zero tenant awareness. The top 5 by distance are global ranks 1-5 -- only rank 3 is Acme\'s own row. Ranks 1, 2, 4, and 5 belong to other tenants: 4 of the 5 returned rows are a real cross-tenant leak, exactly the "FORGOTTEN PREDICATE" failure Concept 04 named.'
    }
  }
}

policyButtons_1010.forEach(btn=>btn.addEventListener('click',()=>{
  currentPolicy_1010=btn.dataset.policy
  syncButtons_1010()
  render_1010()
}))

resetBtn_1010?.addEventListener('click',()=>{
  currentPolicy_1010='on'
  syncButtons_1010()
  if(rowEl_1010)rowEl_1010.innerHTML=''
  if(touchedBox_1010)touchedBox_1010.textContent='—'
  if(returnedBox_1010)returnedBox_1010.textContent='—'
  if(leakedBox_1010)leakedBox_1010.textContent='—'
  if(whereBox_1010)whereBox_1010.textContent='—'
  if(verdict_1010){
    verdict_1010.className='callout'
    verdict_1010.textContent='Click a button above to run the identical caller SQL with the policy off or on.'
  }
})

syncButtons_1010()
render_1010()
