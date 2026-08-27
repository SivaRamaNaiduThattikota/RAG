const advancedLesson0906=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0906(){if(advancedLesson0906)advancedLesson0906.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0906)
syncAdvancedTarget0906()

// Section 14's lab: The Constraint Filter. Every recall/latency/memory
// value below is a direct, unchanged citation from Concepts 02-05
// (reused exactly as verified in Section 10) -- this widget only
// filters those already-cited numbers, it computes nothing new.

const ROWS_0906=[
  {id:1, recall:100.00, latencyMs:0.91,   memoryB:512},
  {id:2, recall:89.80,  latencyMs:0.0538, memoryB:512},
  {id:3, recall:81.95,  latencyMs:0.0081, memoryB:512},
  {id:4, recall:87.40,  latencyMs:0.011,  memoryB:512},
  {id:5, recall:99.20,  latencyMs:0.104,  memoryB:512},
  {id:6, recall:null,   latencyMs:null,   memoryB:128},
  {id:7, recall:null,   latencyMs:null,   memoryB:16},
]

const groups0906=[
  {axis:'recall',  el:document.querySelector('#recallGroup_0906')},
  {axis:'latency', el:document.querySelector('#latencyGroup_0906')},
  {axis:'memory',  el:document.querySelector('#memoryGroup_0906')},
]

const passBox0906=document.querySelector('#filterPass_0906')
const failBox0906=document.querySelector('#filterFail_0906')
const unknownBox0906=document.querySelector('#filterUnknown_0906')

let activeAxis0906=null
let activeThreshold0906=null

function evaluateRow0906(row){
  if(activeAxis0906===null)return 'neutral'

  if(activeAxis0906==='recall'){
    if(row.recall===null)return 'unknown'
    return row.recall>=activeThreshold0906 ? 'pass' : 'fail'
  }
  if(activeAxis0906==='latency'){
    if(row.latencyMs===null)return 'unknown'
    return row.latencyMs<=activeThreshold0906 ? 'pass' : 'fail'
  }
  // memory is cited for all seven rows -- never unknown
  return row.memoryB<=activeThreshold0906 ? 'pass' : 'fail'
}

function render0906(){
  let pass=0, fail=0, unknown=0

  ROWS_0906.forEach(row=>{
    const verdict=evaluateRow0906(row)
    const tr=document.querySelector('#labRow'+row.id+'_0906')
    if(!tr)return
    tr.classList.remove('rank-chip','tp','tn','fn')
    if(verdict==='pass'){tr.classList.add('rank-chip','tp');pass++}
    else if(verdict==='fail'){tr.classList.add('rank-chip','tn');fail++}
    else if(verdict==='unknown'){tr.classList.add('rank-chip','fn');unknown++}
    else {pass++} // neutral state (no constraint chosen yet) counts as passing/unfiltered
  })

  if(passBox0906)passBox0906.textContent=activeAxis0906===null?7:pass
  if(failBox0906)failBox0906.textContent=activeAxis0906===null?0:fail
  if(unknownBox0906)unknownBox0906.textContent=activeAxis0906===null?0:unknown
}

function syncButtons0906(){
  groups0906.forEach(group=>{
    if(!group.el)return
    const buttons=[...group.el.querySelectorAll('[data-threshold]')]
    buttons.forEach(btn=>{
      const isActive = group.axis===activeAxis0906
        ? String(btn.dataset.threshold)===String(activeThreshold0906)
        : btn.dataset.threshold==='none'
      btn.classList.toggle('active', isActive)
    })
  })
}

groups0906.forEach(group=>{
  if(!group.el)return
  const buttons=[...group.el.querySelectorAll('[data-threshold]')]
  buttons.forEach(btn=>{
    btn.addEventListener('click',()=>{
      if(btn.dataset.threshold==='none'){
        if(activeAxis0906===group.axis){
          activeAxis0906=null
          activeThreshold0906=null
        }
      } else {
        activeAxis0906=group.axis
        activeThreshold0906=Number(btn.dataset.threshold)
      }
      syncButtons0906()
      render0906()
    })
  })
})

syncButtons0906()
render0906()
