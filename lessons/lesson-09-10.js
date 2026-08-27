const advancedLesson0910=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0910(){if(advancedLesson0910)advancedLesson0910.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0910)
syncAdvancedTarget0910()

// Section 14's lab: The Capacity Planner. Every cell below reproduces
// Section 10's own already-verified figures exactly -- this widget is
// arithmetic on Qdrant's own cited formula, not a new benchmark. Node
// counts use the raw ceiling formula only; the manual 100M/node ceiling
// bump discussed in Section 10's own prose is not reproduced here.

const CAP_PRESETS_0910={
  20000000:{
    noQuant:{vector:19.0735,hnsw:5.7221,id:1.9372,total:32.08,nodes:1},
    sq8:{vector:4.7684,hnsw:5.7221,id:1.9372,total:14.91,nodes:1}
  },
  50000000:{
    noQuant:{vector:47.6837,hnsw:14.3051,id:4.8429,total:80.20,nodes:2},
    sq8:{vector:11.9209,hnsw:14.3051,id:4.8429,total:37.28,nodes:1}
  },
  200000000:{
    noQuant:{vector:190.7349,hnsw:57.2205,id:19.3715,total:320.79,nodes:7},
    sq8:{vector:47.6837,hnsw:57.2205,id:19.3715,total:149.13,nodes:3}
  },
  500000000:{
    noQuant:{vector:476.8373,hnsw:143.0513,id:48.4288,total:801.98,nodes:16},
    sq8:{vector:119.2093,hnsw:143.0513,id:48.4288,total:372.83,nodes:8}
  }
}

console.assert(CAP_PRESETS_0910[200000000].noQuant.total===320.79,"200M no-quant total matches worked example")
console.assert(CAP_PRESETS_0910[200000000].noQuant.nodes===7,"200M no-quant needs 7 nodes")
console.assert(CAP_PRESETS_0910[200000000].sq8.total===149.13,"200M SQ8 total matches worked example")
console.assert(CAP_PRESETS_0910[200000000].sq8.nodes===3,"200M SQ8 needs 3 nodes before the ceiling bump")
console.assert(CAP_PRESETS_0910[500000000].sq8.nodes===8,"500M SQ8 needs 8 nodes")
console.assert(CAP_PRESETS_0910[20000000].noQuant.nodes===CAP_PRESETS_0910[20000000].sq8.nodes,"20M is the boundary case -- quantization saves RAM but does not cross a node threshold")

const nBtns_0910=[
  document.querySelector('#n20Btn_0910'),
  document.querySelector('#n50Btn_0910'),
  document.querySelector('#n200Btn_0910'),
  document.querySelector('#n500Btn_0910')
]
const quantOffBtn_0910=document.querySelector('#quantOffBtn_0910')
const quantOnBtn_0910=document.querySelector('#quantOnBtn_0910')

const capFillVector_0910=document.querySelector('#capFillVector_0910')
const capFillHnsw_0910=document.querySelector('#capFillHnsw_0910')
const capFillId_0910=document.querySelector('#capFillId_0910')
const capOutVector_0910=document.querySelector('#capOutVector_0910')
const capOutHnsw_0910=document.querySelector('#capOutHnsw_0910')
const capOutId_0910=document.querySelector('#capOutId_0910')
const capTotalRam_0910=document.querySelector('#capTotalRam_0910')
const capNodesNeeded_0910=document.querySelector('#capNodesNeeded_0910')
const capVerdict_0910=document.querySelector('#capVerdict_0910')

let currentN_0910=200000000
let currentQuant_0910=false

function fmtN_0910(n){
  return (n/1000000).toFixed(0)+'M'
}

function setBar_0910(fillEl,outEl,value,subtotal){
  if(fillEl)fillEl.style.width=(subtotal>0?(value/subtotal*100):0)+'%'
  if(outEl)outEl.textContent=value.toFixed(2)+' GiB'
}

function render0910(){
  const preset=CAP_PRESETS_0910[currentN_0910]
  const state=currentQuant_0910?preset.sq8:preset.noQuant
  const other=currentQuant_0910?preset.noQuant:preset.sq8
  const subtotal=state.vector+state.hnsw+state.id

  setBar_0910(capFillVector_0910,capOutVector_0910,state.vector,subtotal)
  setBar_0910(capFillHnsw_0910,capOutHnsw_0910,state.hnsw,subtotal)
  setBar_0910(capFillId_0910,capOutId_0910,state.id,subtotal)

  if(capTotalRam_0910)capTotalRam_0910.textContent=state.total.toFixed(2)+' GiB'
  if(capNodesNeeded_0910)capNodesNeeded_0910.textContent=String(state.nodes)

  if(capVerdict_0910){
    const noQuantNodes=preset.noQuant.nodes
    const sq8Nodes=preset.sq8.nodes
    let text
    if(noQuantNodes===sq8Nodes){
      text=`At N=${fmtN_0910(currentN_0910)}, quantization saves RAM (${preset.noQuant.total.toFixed(2)} → ${preset.sq8.total.toFixed(2)} GiB) but does NOT cross a node-count threshold -- both states still need ${sq8Nodes} node${sq8Nodes===1?'':'s'}.`
    }else{
      const reduction=noQuantNodes/sq8Nodes
      text=`SQ8 needs ${sq8Nodes} nodes vs. ${noQuantNodes} without it at N=${fmtN_0910(currentN_0910)} -- a ${reduction.toFixed(2)}x reduction, not this concept's own cited 4.00x per-vector ratio, because the HNSW graph and id-tracker don't compress.`
    }
    capVerdict_0910.textContent=(currentQuant_0910?'SQ8: ':'No quantization: ')+state.total.toFixed(2)+' GiB, '+state.nodes+' node'+(state.nodes===1?'':'s')+'. '+text
  }

  nBtns_0910.forEach(btn=>{
    if(btn)btn.classList.toggle('active',Number(btn.dataset.n)===currentN_0910)
  })
  if(quantOffBtn_0910)quantOffBtn_0910.classList.toggle('active',!currentQuant_0910)
  if(quantOnBtn_0910)quantOnBtn_0910.classList.toggle('active',currentQuant_0910)
}

nBtns_0910.forEach(btn=>{
  btn?.addEventListener('click',()=>{
    currentN_0910=Number(btn.dataset.n)
    render0910()
  })
})
quantOffBtn_0910?.addEventListener('click',()=>{currentQuant_0910=false;render0910()})
quantOnBtn_0910?.addEventListener('click',()=>{currentQuant_0910=true;render0910()})

render0910()
