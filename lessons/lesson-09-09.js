const advancedLesson0909=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0909(){if(advancedLesson0909)advancedLesson0909.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0909)
syncAdvancedTarget0909()

// Section 14's lab: The Shard Fan-Out Console. Shard membership and
// distances below match this concept's own already-verified hash
// assignment and brute-force ranking (Section 10) exactly -- this
// widget performs no new benchmarking, it only replays those cited
// numbers across three local_k settings.

const GROUND_TRUTH_0909=['doc-01','doc-02','doc-03','doc-12']

const SHARDS_0909=[
  [{id:'doc-03',d:2.2361},{id:'doc-09',d:8.0623},{id:'doc-06',d:9.4340}],
  [{id:'doc-01',d:1.0000},{id:'doc-12',d:5.0000},{id:'doc-07',d:7.0000},{id:'doc-11',d:7.0711},{id:'doc-04',d:9.2195}],
  [{id:'doc-02',d:1.0000},{id:'doc-10',d:6.0000},{id:'doc-08',d:8.0623},{id:'doc-05',d:9.2195}]
]

function mergeTopK_0909(localK,k){
  const candidates=[]
  for(const shardPoints of SHARDS_0909){
    const sorted=[...shardPoints].sort((a,b)=>a.d-b.d)
    candidates.push(...sorted.slice(0,localK))
  }
  candidates.sort((a,b)=>a.d-b.d)
  return {merged:candidates.slice(0,k).map(p=>p.id), fannedOut:candidates.length}
}

const shardChipRows_0909=[
  document.querySelector('#shardChips0_0909'),
  document.querySelector('#shardChips1_0909'),
  document.querySelector('#shardChips2_0909')
]
const candidatesBox_0909=document.querySelector('#fanoutCandidates_0909')
const mergedBox_0909=document.querySelector('#fanoutMerged_0909')
const matchBox_0909=document.querySelector('#fanoutMatch_0909')
const verdictBox_0909=document.querySelector('#fanoutVerdict_0909')
const lk1Btn_0909=document.querySelector('#lk1Btn_0909')
const lk3Btn_0909=document.querySelector('#lk3Btn_0909')
const lk4Btn_0909=document.querySelector('#lk4Btn_0909')

const VERDICT_TEXT_0909={
  1:"MISS -- doc-12 sits inside Shard 1 but was never sent, because Shard 1 only forwarded its own single best result.",
  3:"MATCH -- but only by luck: doc-12 happened to fall inside Shard 1's own top-3. A different query could easily miss here.",
  4:"MATCH -- guaranteed correct: no shard can ever hold more than k=4 of the true global top-4."
}

function buildShardChip_0909(point,isSent){
  const div=document.createElement('div')
  div.className='rank-chip'+(isSent?' match':' excluded')
  const b=document.createElement('b')
  b.textContent=point.id
  const span=document.createElement('span')
  span.textContent='d='+point.d.toFixed(4)
  const small=document.createElement('small')
  small.textContent=isSent?'SENT':'KEPT LOCAL'
  div.appendChild(b)
  div.appendChild(span)
  div.appendChild(small)
  return div
}

function render0909(localK){
  const result=mergeTopK_0909(localK,4)
  const isMatch=result.merged.length===GROUND_TRUTH_0909.length &&
    result.merged.every((id,i)=>id===GROUND_TRUTH_0909[i])

  SHARDS_0909.forEach((shardPoints,idx)=>{
    const row=shardChipRows_0909[idx]
    if(!row)return
    row.innerHTML=''
    const sorted=[...shardPoints].sort((a,b)=>a.d-b.d)
    sorted.forEach((point,rank)=>{
      row.appendChild(buildShardChip_0909(point,rank<localK))
    })
  })

  if(candidatesBox_0909)candidatesBox_0909.textContent=String(result.fannedOut)
  if(mergedBox_0909)mergedBox_0909.textContent=result.merged.join(', ')
  if(matchBox_0909)matchBox_0909.textContent=isMatch?'YES':'NO'

  if(verdictBox_0909){
    verdictBox_0909.className=isMatch?'callout':'callout warning'
    verdictBox_0909.textContent=`local_k=${localK}: ${VERDICT_TEXT_0909[localK]}`
  }

  ;[[1,lk1Btn_0909],[3,lk3Btn_0909],[4,lk4Btn_0909]].forEach(([k,btn])=>{
    if(btn)btn.classList.toggle('active',k===localK)
  })
}

lk1Btn_0909?.addEventListener('click',()=>render0909(1))
lk3Btn_0909?.addEventListener('click',()=>render0909(3))
lk4Btn_0909?.addEventListener('click',()=>render0909(4))

render0909(1)
