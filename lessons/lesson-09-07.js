const advancedLesson0907=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0907(){if(advancedLesson0907)advancedLesson0907.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0907)
syncAdvancedTarget0907()

// Section 14's lab: The Over-Fetch Simulator. Every match-rank array below
// is fixed so that the scan it produces reproduces this concept's own
// already-verified scan-depth table (Section 10) exactly -- this widget
// performs no new benchmarking, it only replays those cited numbers over
// a visible 20-rank strip.

const N_0907=20

const SELECTIVITY_SETS_0907={
  20:[4,8,13,18],
  30:[3,7,9,14,17,20],
  50:[2,4,6,9,11,13,15,17,19,20],
  70:[2,3,4,6,7,8,9,10,11,12,13,14,15,16],
}

function scanDepth0907(matchRanks,k){
  if(matchRanks.length<k)return {fetched:null, discarded:null, overFetch:null, impossible:true}
  const fetched=matchRanks[k-1]
  const discarded=fetched-k
  const overFetch=fetched/k
  return {fetched, discarded, overFetch, impossible:false}
}

const fullRowEl_0907=document.querySelector('#fullRow_0907')
const matchRowEl_0907=document.querySelector('#matchRow_0907')
const fetchedBox_0907=document.querySelector('#fetchedBox_0907')
const discardedBox_0907=document.querySelector('#discardedBox_0907')
const overfetchBox_0907=document.querySelector('#overfetchBox_0907')
const prefilterBox_0907=document.querySelector('#prefilterBox_0907')

const selectivityGroup_0907=document.querySelector('#selectivityGroup_0907')
const kGroup_0907=document.querySelector('#kGroup_0907')

let activeSelectivity_0907=20
let activeK_0907=3

function buildChip_0907(rank, isMatch, isCutoff, extraClass){
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

function render0907(){
  const matchRanks=SELECTIVITY_SETS_0907[activeSelectivity_0907]
  const matchSet=new Set(matchRanks)
  const result=scanDepth0907(matchRanks, activeK_0907)

  if(fullRowEl_0907){
    fullRowEl_0907.innerHTML=''
    for(let rank=1; rank<=N_0907; rank++){
      const isMatch=matchSet.has(rank)
      const isCutoff=!result.impossible && rank===result.fetched
      fullRowEl_0907.appendChild(buildChip_0907(rank, isMatch, isCutoff, null))
    }
  }

  if(matchRowEl_0907){
    matchRowEl_0907.innerHTML=''
    matchRanks.forEach((rank, idx)=>{
      const isTopK=idx<activeK_0907
      matchRowEl_0907.appendChild(buildChip_0907(rank, true, false, isTopK?'mover':null))
    })
  }

  if(fetchedBox_0907)fetchedBox_0907.textContent=result.impossible ? 'N/A -- not enough matches' : ('top '+result.fetched)
  if(discardedBox_0907)discardedBox_0907.textContent=result.impossible ? '—' : String(result.discarded)
  if(overfetchBox_0907)overfetchBox_0907.textContent=result.impossible ? '—' : (result.overFetch.toFixed(2)+'x')
  if(prefilterBox_0907)prefilterBox_0907.textContent=String(matchRanks.length)
}

function syncButtons_0907(){
  if(selectivityGroup_0907){
    [...selectivityGroup_0907.querySelectorAll('[data-selectivity]')].forEach(btn=>{
      btn.classList.toggle('active', Number(btn.dataset.selectivity)===activeSelectivity_0907)
    })
  }
  if(kGroup_0907){
    [...kGroup_0907.querySelectorAll('[data-k]')].forEach(btn=>{
      btn.classList.toggle('active', Number(btn.dataset.k)===activeK_0907)
    })
  }
}

if(selectivityGroup_0907){
  [...selectivityGroup_0907.querySelectorAll('[data-selectivity]')].forEach(btn=>{
    btn.addEventListener('click',()=>{
      activeSelectivity_0907=Number(btn.dataset.selectivity)
      syncButtons_0907()
      render0907()
    })
  })
}

if(kGroup_0907){
  [...kGroup_0907.querySelectorAll('[data-k]')].forEach(btn=>{
    btn.addEventListener('click',()=>{
      activeK_0907=Number(btn.dataset.k)
      syncButtons_0907()
      render0907()
    })
  })
}

syncButtons_0907()
render0907()
