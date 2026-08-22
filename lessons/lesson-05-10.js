const advancedLesson0510=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0510(){if(advancedLesson0510)advancedLesson0510.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0510)
syncAdvancedTarget0510()

// Section 14's lab: the Pool Coverage Grid. Same 50-document corpus and the
// same fixed top-10 ranked lists for Systems A, B and C from Section 10.
// Checking a system in or out, and dragging the pool-depth slider, changes
// which documents union into the current pool. "Reveal ground truth" flips
// the grid from a plain judged/unjudged view to a relevant/not-relevant/
// escapee view -- document #44 is deliberately absent from all three
// systems' lists, so no combination of toggles or depth ever pools it.

const CORPUS_SIZE_0510=50
const SYSTEMS_0510={
  A:[3,7,12,15,18,22,29,31,40,45],
  B:[1,7,12,16,22,25,33,38,40,47],
  C:[3,9,12,19,22,27,31,36,40,49]
}
const TRUE_RELEVANT_0510=new Set([7,12,22,25,31,38,49,44]) // 7 judged-in-pool + the escapee
const ESCAPEE_ID_0510=44
const TRUE_TOTAL_RELEVANT_0510=TRUE_RELEVANT_0510.size

const sysCheckA_0510=document.querySelector('#wgSysA_0510')
const sysCheckB_0510=document.querySelector('#wgSysB_0510')
const sysCheckC_0510=document.querySelector('#wgSysC_0510')
const depthSlider_0510=document.querySelector('#wgDepthSlider_0510')
const depthOut_0510=document.querySelector('#wgDepthOut_0510')
const revealBtn_0510=document.querySelector('#wgRevealBtn_0510')
const resetBtn_0510=document.querySelector('#wgResetBtn_0510')
const poolGrid_0510=document.querySelector('#wgPoolGrid_0510')
const poolReadout_0510=document.querySelector('#wgPoolReadout_0510')
const poolSizeOut_0510=document.querySelector('#wgPoolSize_0510')
const coverageOut_0510=document.querySelector('#wgCoverage_0510')
const capturedOut_0510=document.querySelector('#wgCaptured_0510')
const escapedOut_0510=document.querySelector('#wgEscaped_0510')

let revealed_0510=false

function activeSystems_0510(){
  const active=[]
  if(sysCheckA_0510?.checked)active.push(SYSTEMS_0510.A)
  if(sysCheckB_0510?.checked)active.push(SYSTEMS_0510.B)
  if(sysCheckC_0510?.checked)active.push(SYSTEMS_0510.C)
  return active
}

function buildPool_0510(systems,depth){
  const pool=new Set()
  systems.forEach(rankedList=>{
    rankedList.slice(0,depth).forEach(docId=>pool.add(docId))
  })
  return pool
}

function render_0510(){
  const depth=Number(depthSlider_0510?.value||10)
  if(depthOut_0510)depthOut_0510.textContent=String(depth)
  const pool=buildPool_0510(activeSystems_0510(),depth)
  const poolSize=pool.size
  const coverage=poolSize/CORPUS_SIZE_0510*100

  if(poolGrid_0510){
    const cells=[]
    for(let id=1;id<=CORPUS_SIZE_0510;id+=1){
      let cls='pool-cell'
      if(id===ESCAPEE_ID_0510){
        if(revealed_0510)cls+=' escapee-revealed'
      }else if(pool.has(id)){
        if(revealed_0510){
          cls+=TRUE_RELEVANT_0510.has(id)?' relevant-revealed':' not-relevant-revealed'
        }else{
          cls+=' in-pool'
        }
      }
      cells.push(`<div class="${cls}">${id}</div>`)
    }
    poolGrid_0510.innerHTML=cells.join('')
  }

  if(poolSizeOut_0510)poolSizeOut_0510.textContent=String(poolSize)
  if(coverageOut_0510)coverageOut_0510.textContent=`${coverage.toFixed(1)}%`

  if(revealed_0510){
    let captured=0
    TRUE_RELEVANT_0510.forEach(docId=>{if(pool.has(docId))captured+=1})
    const escaped=TRUE_TOTAL_RELEVANT_0510-captured
    if(capturedOut_0510)capturedOut_0510.textContent=`${captured} / ${TRUE_TOTAL_RELEVANT_0510}`
    if(escapedOut_0510)escapedOut_0510.textContent=String(escaped)
    if(poolReadout_0510){
      poolReadout_0510.textContent=escaped>0
        ?`Ground truth revealed: ${captured} of ${TRUE_TOTAL_RELEVANT_0510} truly relevant documents are inside the current pool. Document #44 stays outside no matter how deep or wide the pool goes -- it was never in any system's top 10 to begin with.`
        :`Ground truth revealed: ${captured} of ${TRUE_TOTAL_RELEVANT_0510} truly relevant documents are inside the current pool.`
    }
  }else{
    if(capturedOut_0510)capturedOut_0510.textContent='—'
    if(escapedOut_0510)escapedOut_0510.textContent='—'
    if(poolReadout_0510)poolReadout_0510.textContent='Judgments pending — flip "Reveal ground truth" to see which pooled documents are actually relevant.'
  }
}

sysCheckA_0510?.addEventListener('change',render_0510)
sysCheckB_0510?.addEventListener('change',render_0510)
sysCheckC_0510?.addEventListener('change',render_0510)
depthSlider_0510?.addEventListener('input',render_0510)

revealBtn_0510?.addEventListener('click',()=>{
  revealed_0510=!revealed_0510
  if(revealBtn_0510)revealBtn_0510.textContent=revealed_0510?'Hide ground truth':'Reveal ground truth'
  render_0510()
})

resetBtn_0510?.addEventListener('click',()=>{
  if(sysCheckA_0510)sysCheckA_0510.checked=true
  if(sysCheckB_0510)sysCheckB_0510.checked=true
  if(sysCheckC_0510)sysCheckC_0510.checked=true
  if(depthSlider_0510)depthSlider_0510.value='10'
  revealed_0510=false
  if(revealBtn_0510)revealBtn_0510.textContent='Reveal ground truth'
  render_0510()
})

render_0510()
