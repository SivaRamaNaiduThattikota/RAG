const advancedLesson0904=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0904(){if(advancedLesson0904)advancedLesson0904.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0904)
syncAdvancedTarget0904()

// Section 14's lab: The Cluster Probe Selector. Reuses this concept's own
// ten-point, three-cluster toy corpus exactly as traced in Section 10 --
// every distance and cluster assignment below is copied from that
// already-verified worked example, nothing here is recomputed live.

const TRUE_BEST_0904={label:'(8,4)',dist:0.4243}

const NPROBE_STATES_0904={
  1:{
    probed:'C3',
    scanned:'3 of 10',
    bestLabel:'(10, 2)',
    bestDist:2.4042,
    fraction:30,
    result:'MISS',
    verdict:'nprobe=1 probes only C3 (nearest centroid, 3.1202 from Q). Best found: (10,2) at 2.4042. The true nearest neighbour, (8,4) at 0.4243, sits in C2 -- the second-nearest cluster -- and is never scanned. A real, confirmed miss.'
  },
  2:{
    probed:'C3, C2',
    scanned:'7 of 10',
    bestLabel:'(8, 4)',
    bestDist:0.4243,
    fraction:70,
    result:'HIT',
    verdict:'nprobe=2 adds C2 (second-nearest centroid, 3.3866 from Q). (8,4) at 0.4243 is now scanned and found -- the true global nearest neighbour, confirmed against the brute-force ranking of all ten points.'
  },
  3:{
    probed:'C3, C2, C1',
    scanned:'10 of 10',
    bestLabel:'(8, 4)',
    bestDist:0.4243,
    fraction:100,
    result:'HIT (exhaustive)',
    verdict:'nprobe=3 equals nlist -- every cluster is probed, so this is exactly Concept 01\'s own exhaustive exact search again. 100% recall is guaranteed, but IVF\'s entire speedup is gone: nothing was skipped.'
  }
}

const probeButtons0904=[...document.querySelectorAll('#s14 [data-nprobe]')]

const probedBox0904=document.querySelector('#ivfProbed_0904')
const scannedBox0904=document.querySelector('#ivfScanned_0904')
const bestBox0904=document.querySelector('#ivfBest_0904')
const resultBox0904=document.querySelector('#ivfResult_0904')

const barFill0904=document.querySelector('#ivfBarFill_0904')
const barOut0904=document.querySelector('#ivfBarOut_0904')
const barRow0904=document.querySelector('#ivfBarRow_0904')

const verdictBox0904=document.querySelector('#ivfVerdict_0904')

let currentNprobe0904=1

function syncProbeButtons0904(){
  probeButtons0904.forEach(btn=>btn.classList.toggle('active',Number(btn.dataset.nprobe)===currentNprobe0904))
}

function render0904(){
  const state=NPROBE_STATES_0904[currentNprobe0904]
  if(!state)return

  if(probedBox0904)probedBox0904.textContent=state.probed
  if(scannedBox0904)scannedBox0904.textContent=state.scanned
  if(bestBox0904)bestBox0904.textContent=state.bestLabel+', d='+state.bestDist.toFixed(4)
  if(resultBox0904)resultBox0904.textContent=state.result

  if(barFill0904)barFill0904.style.width=state.fraction+'%'
  if(barOut0904)barOut0904.textContent=state.fraction+'%'
  if(barRow0904)barRow0904.classList.toggle('winner',state.result.startsWith('HIT'))

  if(verdictBox0904){
    verdictBox0904.className=state.result.startsWith('MISS')?'callout warning':'callout'
    verdictBox0904.textContent=state.verdict
  }
}

probeButtons0904.forEach(btn=>btn.addEventListener('click',()=>{
  currentNprobe0904=Number(btn.dataset.nprobe)
  syncProbeButtons0904()
  render0904()
}))

syncProbeButtons0904()
render0904()
