const advancedLesson0811=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0811(){if(advancedLesson0811)advancedLesson0811.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0811)
syncAdvancedTarget0811()

// Section 14's lab: The Migration Ledger. A fixed 12-chunk corpus starts
// entirely tagged v1 (Model A, 384d). Each click on "Migrate next batch"
// moves the next 3 not-yet-migrated chunks to v2 (Model B, 768d), in the
// order 1-2-3, 4-5-6, 7-8-9, 10-11-12. The v2 scores are hardcoded,
// illustrative relevance numbers for the fixed query about the order
// cancellation window (same disclaimer pattern as Concept 10's own lab).
// Unsafe-mode score for a still-v1 chunk is (v2 score - 0.10), EXCEPT
// chunk 12, deliberately scripted to 0.94 -- the demonstration case where
// an irrelevant chunk's cross-model score spuriously outranks every
// genuine match, mirroring Part 1's rotation-proof finding live.

const BATCHES_0811=[[1,2,3],[4,5,6],[7,8,9],[10,11,12]]
const UNSAFE_OVERRIDE_0811={12:0.94}

const ledgerTable0811=document.querySelector('#ledgerTable_0811')
const ledgerRows0811=ledgerTable0811?[...ledgerTable0811.querySelectorAll('tbody tr')]:[]
const migrateBtn0811=document.querySelector('#migrateBtn_0811')
const modeButtons0811=[...document.querySelectorAll('#s14 [data-mode]')]
const ledgerReadout0811=document.querySelector('#ledgerReadout_0811')
const ledgerVerdict0811=document.querySelector('#ledgerVerdict_0811')

let batchesMigrated0811=0
let currentMode0811='safe'

function migratedIds0811(){
  const ids=new Set()
  for(let i=0;i<batchesMigrated0811;i++)BATCHES_0811[i].forEach(id=>ids.add(id))
  return ids
}

function unsafeScoreFor0811(id,v2){
  if(id in UNSAFE_OVERRIDE_0811)return UNSAFE_OVERRIDE_0811[id]
  return Math.round((v2-0.10)*100)/100
}

function syncModeButtons0811(){
  modeButtons0811.forEach(btn=>btn.classList.toggle('active',btn.dataset.mode===currentMode0811))
}

function render0811(){
  const migrated=migratedIds0811()
  const migratedCount=migrated.size
  const remaining=12-migratedCount

  let bestId=null,bestScore=-Infinity,searchableCount=0

  ledgerRows0811.forEach(row=>{
    const id=Number(row.dataset.id)
    const v2=Number(row.dataset.v2)
    const isV2=migrated.has(id)
    const versionCell=row.querySelector('.ledger-version')
    const scoreCell=row.querySelector('.ledger-score')
    if(versionCell)versionCell.textContent=isV2?'v2 (768d)':'v1 (384d)'
    row.classList.remove('row-top')

    let score=null,comparable=true
    if(currentMode0811==='safe'){
      if(isV2){score=v2}else{comparable=false}
    }else{
      score=isV2?v2:unsafeScoreFor0811(id,v2)
    }

    if(scoreCell)scoreCell.textContent=comparable?score.toFixed(2):'-- not comparable (v1) --'
    if(comparable){
      searchableCount++
      if(score>bestScore){bestScore=score;bestId=id}
    }
  })

  if(bestId!==null){
    const topRow=ledgerRows0811.find(row=>Number(row.dataset.id)===bestId)
    if(topRow)topRow.classList.add('row-top')
  }

  if(ledgerReadout0811){
    ledgerReadout0811.innerHTML=`
      <div><span>MIGRATED TO v2 (768d)</span><b>${migratedCount}/12</b></div>
      <div><span>STILL ON v1 (384d)</span><b>${remaining}/12</b></div>
      <div><span>SEARCH MODE</span><b>${currentMode0811==='safe'?'Safe (version-aware)':'Unsafe (cross-version)'}</b></div>
    `
  }

  if(ledgerVerdict0811){
    if(bestId===null){
      ledgerVerdict0811.innerHTML=`<b>No chunks are searchable yet.</b> Every chunk is still tagged v1 and safe mode excludes cross-version comparisons entirely -- migrate at least one batch to see a result.`
    }else{
      const topText=ledgerRows0811.find(row=>Number(row.dataset.id)===bestId)?.querySelector('td:nth-child(2)')?.textContent||''
      let html=`<b>Top match: chunk ${bestId}</b> — "${topText}" (score ${bestScore.toFixed(2)}).`
      if(currentMode0811==='safe'){
        if(migratedCount<12){
          html+=` ${searchableCount}/12 chunks searchable so far -- shrinking risk, not eliminating candidates early.`
        }else{
          html+=` All 12 chunks migrated -- the full corpus is searchable and safe and unsafe modes now agree.`
        }
      }else{
        if(bestId===12&&migratedCount<12){
          html+=` This is wrong. Chunk 12 ("Warehouse inventory is reconciled nightly") is irrelevant to the query, but it is still tagged v1 while chunk 1 is already on v2 -- the 0.94 score is a real number from the same formula, computed across two models with no shared basis. Part 1's rotation proof, applied live.`
        }else if(migratedCount===12){
          html+=` All 12 chunks are now on v2 -- the unsafe toggle has nothing left to demonstrate.`
        }
      }
      ledgerVerdict0811.innerHTML=html
    }
  }

  if(migrateBtn0811){
    if(batchesMigrated0811>=BATCHES_0811.length){
      migrateBtn0811.textContent='All 12 chunks migrated'
      migrateBtn0811.disabled=true
    }else{
      migrateBtn0811.textContent='Migrate next batch (3 chunks)'
      migrateBtn0811.disabled=false
    }
  }
}

migrateBtn0811?.addEventListener('click',()=>{
  if(batchesMigrated0811<BATCHES_0811.length){
    batchesMigrated0811++
    render0811()
  }
})

modeButtons0811.forEach(btn=>btn.addEventListener('click',()=>{
  currentMode0811=btn.dataset.mode
  syncModeButtons0811()
  render0811()
}))

syncModeButtons0811()
render0811()
