const advancedLesson0606=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0606(){if(advancedLesson0606)advancedLesson0606.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0606)
syncAdvancedTarget0606()

// Section 14's lab: the Duplicate Cluster Resolver. R1/R2/R3 stay fixed; a
// threshold slider is compared live against the fixed 0.50 Jaccard score
// between R1 and R3, and a checkbox introduces a single-character edit into
// R2 to show exact hashing's zero tolerance. No pick/reveal step -- every
// control recomputes the live output immediately.

const FIXED_JACCARD_0606=0.50
const HASH_R1_R2_0606='3ad197ae...15105e02'
const HASH_R3_0606='1c109b99...41a933de8'
const HASH_R2_EDITED_0606='c02cef59...e38579e59'

const threshSlider0606=document.querySelector('#wgThresh_0606')
const threshOut0606=document.querySelector('#wgThreshOut_0606')
const editToggle0606=document.querySelector('#wgEditToggle_0606')
const readoutBox0606=document.querySelector('#wgClusterReadout_0606')
const verdictBox0606=document.querySelector('#wgClusterVerdict_0606')

function recompute0606(){
  const threshold=threshSlider0606?Number(threshSlider0606.value):0.5
  if(threshOut0606)threshOut0606.textContent=threshold.toFixed(2)
  const edited=editToggle0606?.checked||false
  const r2Hash=edited?HASH_R2_EDITED_0606:HASH_R1_R2_0606
  const exactMatch=r2Hash===HASH_R1_R2_0606
  const nearFlagged=FIXED_JACCARD_0606>=threshold

  if(readoutBox0606){
    readoutBox0606.innerHTML=`
      <div><span>R1 / R2 HASH MATCH</span><b>${exactMatch?'MATCH':'NO MATCH'}</b></div>
      <div><span>R1 / R3 JACCARD</span><b>${FIXED_JACCARD_0606.toFixed(2)}</b></div>
      <div><span>NEAR-DUP THRESHOLD</span><b>${threshold.toFixed(2)}</b></div>
      <div><span>CANONICAL RECORD</span><b>${nearFlagged?'R2 (cluster of 3)':'R2 (cluster of 2 -- R3 stands alone)'}</b></div>
    `
  }
  if(!verdictBox0606)return
  const parts=[]
  if(edited){
    parts.push('R2 was edited by a single character -- its hash no longer matches R1 at all, exact dedup now reports NO MATCH even though the change is trivial. This is the avalanche effect: hashing gives zero partial credit.')
  }else{
    parts.push('R1 and R2 remain byte-identical -- exact dedup reports a clean MATCH.')
  }
  if(nearFlagged){
    parts.push(`At threshold ${threshold.toFixed(2)}, R3's fixed 0.50 Jaccard score is FLAGGED as a near-duplicate of R1 -- all three records resolve into one cluster, and Concept 01's authority ranking still picks R2 as canonical (type beats R3's more recent timestamp).`)
  }else{
    parts.push(`At threshold ${threshold.toFixed(2)}, R3's fixed 0.50 Jaccard score falls BELOW the threshold -- R3 is treated as a distinct record, sitting alongside the R1/R2 cluster rather than merged into it. Nothing about R3's actual similarity changed; only the threshold moved.`)
  }
  verdictBox0606.textContent=parts.join(' ')
}

threshSlider0606?.addEventListener('input',recompute0606)
editToggle0606?.addEventListener('change',recompute0606)
recompute0606()
