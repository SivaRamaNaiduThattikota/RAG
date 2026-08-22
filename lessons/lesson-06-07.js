const advancedLesson0607=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0607(){if(advancedLesson0607)advancedLesson0607.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0607)
syncAdvancedTarget0607()

// Section 14's lab: the As-Of Query Timeline. Unlike every earlier Module 06
// lab, this one accumulates real state -- a version-history array that can
// grow -- rather than just recomputing from fixed inputs. A date slider
// drives a genuine current(doc_id, t) lookup, and a button (unlocked only
// once the slider reaches "today") appends a brand-new third version live.

const DOC_ID_0607='POLICY-REFUND-001'
const TODAY_DAY_0607=659 // days(2024-11-02 -> 2026-08-23), matches Section 10's worked example
const DAY_ZERO_0607=Date.UTC(2024,10,2) // 2024-11-02, month is 0-indexed

function dayToDateLabel0607(day){
  const d=new Date(DAY_ZERO_0607+day*86400000)
  return d.toISOString().slice(0,10)
}

// A small, dependency-free FNV-1a (32-bit) hash -- a deliberate stand-in for
// SHA-256 so the demo can compute a new "hash" live in the browser without
// pulling in a crypto library. Labeled as such everywhere it's shown.
function fnv1a0607(str){
  let h=0x811c9dc5
  for(let i=0;i<str.length;i++){
    h^=str.charCodeAt(i)
    h=Math.imul(h,0x01000193)
  }
  return (h>>>0).toString(16).padStart(8,'0')
}

function formatHash0607(hash){
  return hash.length>16?`${hash.slice(0,8)}…${hash.slice(-8)}`:hash
}

// Initial state: exactly the two versions from Section 10's worked example.
let versions0607=[
  {versionNumber:1,text:'Refund requests must be submitted within 30 days of purchase.',hash:'97ca17e152d71b0bdd3f32616ea0ff734aefb5317a2670224661215b91b4363a',algo:'SHA-256',effectiveDay:0,supersededDay:228,status:'SUPERSEDED'},
  {versionNumber:2,text:'Refund requests must be submitted within 45 days of purchase.',hash:'2be6d94f38532cc9a4070b0edf7882b25f0d3fa73d7473cbf3d9858c3071dd9d',algo:'SHA-256',effectiveDay:228,supersededDay:null,status:'CURRENT'}
]

function currentVersionAsOf0607(day){
  let best=null
  for(const v of versions0607){
    if(v.effectiveDay<=day&&(best===null||v.effectiveDay>best.effectiveDay))best=v
  }
  if(best&&best.supersededDay!==null&&day>=best.supersededDay){
    // day sits past this version's own supersededDay but no later version
    // starts before it -- shouldn't happen with well-formed data, but fall
    // back to the latest version rather than showing nothing.
    return versions0607[versions0607.length-1]
  }
  return best
}

const slider0607=document.querySelector('#wgAsOf_0607')
const sliderOut0607=document.querySelector('#wgAsOfOut_0607')
const addEditBtn0607=document.querySelector('#wgAddEdit_0607')
const readout0607=document.querySelector('#wgTimelineReadout_0607')
const verdict0607=document.querySelector('#wgTimelineVerdict_0607')

function recompute0607(){
  const day=slider0607?Number(slider0607.value):0
  if(sliderOut0607)sliderOut0607.textContent=`day ${day} — ${dayToDateLabel0607(day)}`
  if(addEditBtn0607)addEditBtn0607.disabled=day<TODAY_DAY_0607

  const active=currentVersionAsOf0607(day)

  if(readout0607&&active){
    readout0607.innerHTML=`
      <div><span>DOC_ID</span><b>${DOC_ID_0607}</b></div>
      <div><span>ACTIVE VERSION</span><b>v${active.versionNumber}</b></div>
      <div><span>HASH (${active.algo})</span><b>${formatHash0607(active.hash)}</b></div>
      <div><span>STATUS</span><b style="color:${active.status==='CURRENT'?'var(--green)':'var(--muted)'}">${active.status}</b></div>
    `
  }
  if(!verdict0607||!active)return
  const textLine=`"${active.text}"`
  if(active.effectiveDay===0){
    verdict0607.textContent=`As of day ${day}, this is v1 -- the oldest version under doc_id ${DOC_ID_0607}. ${textLine} Move the slider forward to cross into v2.`
  }else{
    verdict0607.textContent=`Crossing day ${active.effectiveDay} -- same doc_id, brand-new hash. This is identity surviving a hash change, not identity coming from the hash. As of day ${day}: ${textLine}`
  }
}

addEditBtn0607?.addEventListener('click',()=>{
  const day=slider0607?Number(slider0607.value):0
  if(day<TODAY_DAY_0607)return // guarded by disabled state too, kept as a safety check
  const newText='Refund requests must be submitted within 60 days of purchase.'
  const newHash=fnv1a0607(newText)
  const priorCurrent=versions0607.find(v=>v.status==='CURRENT')
  if(priorCurrent){
    priorCurrent.supersededDay=day
    priorCurrent.status='SUPERSEDED'
  }
  versions0607.push({
    versionNumber:versions0607.length+1,
    text:newText,
    hash:newHash,
    algo:'FNV-1a (browser demo stand-in for SHA-256)',
    effectiveDay:day,
    supersededDay:null,
    status:'CURRENT'
  })
  recompute0607()
})

slider0607?.addEventListener('input',recompute0607)
recompute0607()
