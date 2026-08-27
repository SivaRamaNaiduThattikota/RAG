const advancedLesson0908=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0908(){if(advancedLesson0908)advancedLesson0908.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0908)
syncAdvancedTarget0908()

// Section 14's lab: The Compaction Clock. The deletion order below is
// fixed, matching this concept's own already-verified tick-by-tick table
// (Section 10) exactly -- this widget performs no new benchmarking, it
// only replays those cited numbers over a visible 20-rank strip.

const N_0908=20
const K_0908=5
const DELETE_ORDER_0908=[2,5,11,16,19]

function scanPastTombstones_0908(tombstoneRanks,k){
  const tombstoned=new Set(tombstoneRanks)
  let collected=0, skipped=0, fetched=0
  for(let rank=1; rank<=N_0908; rank++){
    fetched=rank
    if(tombstoned.has(rank)){ skipped++; continue }
    collected++
    if(collected===k)break
  }
  return {fetched, skipped, collected, impossible:collected<k}
}

const rowEl_0908=document.querySelector('#clockRow_0908')
const tombstonesBox_0908=document.querySelector('#clockTombstones_0908')
const fetchedBox_0908=document.querySelector('#clockFetched_0908')
const skippedBox_0908=document.querySelector('#clockSkipped_0908')
const overfetchBox_0908=document.querySelector('#clockOverfetch_0908')
const verdictBox_0908=document.querySelector('#clockVerdict_0908')
const deleteBtn_0908=document.querySelector('#deleteBtn_0908')
const compactBtn_0908=document.querySelector('#compactBtn_0908')

let tombstoneCount_0908=0

function buildChip_0908(rank, isTombstoned, isCutoff){
  const div=document.createElement('div')
  div.className='rank-chip'+(isTombstoned?' excluded':' match')+(isCutoff?' cutoff-edge':'')
  const b=document.createElement('b')
  b.textContent=String(rank)
  const span=document.createElement('span')
  span.textContent=isTombstoned?'tombstoned':'live'
  div.appendChild(b)
  div.appendChild(span)
  return div
}

function render0908(){
  const activeTombstones=DELETE_ORDER_0908.slice(0,tombstoneCount_0908)
  const result=scanPastTombstones_0908(activeTombstones,K_0908)
  const overFetch=result.impossible?null:result.fetched/K_0908
  const tombstoneSet=new Set(activeTombstones)

  if(rowEl_0908){
    rowEl_0908.innerHTML=''
    for(let rank=1; rank<=N_0908; rank++){
      const isCutoff=!result.impossible && rank===result.fetched
      rowEl_0908.appendChild(buildChip_0908(rank, tombstoneSet.has(rank), isCutoff))
    }
  }

  if(tombstonesBox_0908)tombstonesBox_0908.textContent=String(tombstoneCount_0908)
  if(fetchedBox_0908)fetchedBox_0908.textContent=result.impossible?'20 (scans everything)':String(result.fetched)
  if(skippedBox_0908)skippedBox_0908.textContent=String(result.skipped)
  if(overfetchBox_0908)overfetchBox_0908.textContent=result.impossible?'unreachable':(overFetch.toFixed(2)+'x')

  if(verdictBox_0908){
    const rate=tombstoneCount_0908/N_0908
    const overThreshold=rate>0.2
    verdictBox_0908.className=overThreshold?'callout warning':'callout'
    verdictBox_0908.textContent=`Deletes since last compaction: ${tombstoneCount_0908} (${(rate*100).toFixed(0)}% of the corpus). Qdrant's own deleted_threshold is 0.2 (20%)${overThreshold?' -- this toy index has now crossed it; a real Qdrant segment here would already have compaction scheduled.':'.'}`
  }

  if(deleteBtn_0908)deleteBtn_0908.disabled=tombstoneCount_0908>=DELETE_ORDER_0908.length
  if(compactBtn_0908)compactBtn_0908.disabled=tombstoneCount_0908===0
}

deleteBtn_0908?.addEventListener('click',()=>{
  if(tombstoneCount_0908<DELETE_ORDER_0908.length){
    tombstoneCount_0908+=1
    render0908()
  }
})

compactBtn_0908?.addEventListener('click',()=>{
  tombstoneCount_0908=0
  render0908()
})

render0908()
