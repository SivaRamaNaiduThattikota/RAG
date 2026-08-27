const advancedLesson0905=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0905(){if(advancedLesson0905)advancedLesson0905.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0905)
syncAdvancedTarget0905()

// Section 14's lab: The Byte-Budget Explorer. Reuses this concept's own
// fixed d=128, n=1,000,000-vector corpus and the two cited FAISS formulas
// (SQ8 = d bytes/vector; PQ = ceil(M*nbits/8) bytes/vector) exactly as
// verified in Section 10 -- nothing here is a new formula.

const D_0905=128
const N_0905=1000000
const NBITS_0905=8
const FLAT_BYTES_0905=4*D_0905

function pqBytes0905(m){
  return Math.ceil((m*NBITS_0905)/8)
}

function stateFor0905(encoding, m){
  let bytesPerVector
  if(encoding==='flat')bytesPerVector=FLAT_BYTES_0905
  else if(encoding==='sq8')bytesPerVector=D_0905
  else bytesPerVector=pqBytes0905(m)

  const totalBytes=bytesPerVector*N_0905
  const totalMiB=totalBytes/(1024*1024)
  const ratio=FLAT_BYTES_0905/bytesPerVector
  const barWidth=(bytesPerVector/FLAT_BYTES_0905)*100

  return {bytesPerVector, totalMiB, ratio, barWidth}
}

const encodingButtons0905=[...document.querySelectorAll('#s14 [data-encoding]')]
const mButtons0905=[...document.querySelectorAll('#s14 [data-m]')]
const pqMRow0905=document.querySelector('#pqMRow_0905')

const bytesBox0905=document.querySelector('#pqBytes_0905')
const totalBox0905=document.querySelector('#pqTotal_0905')
const ratioBox0905=document.querySelector('#pqRatio_0905')

const barFill0905=document.querySelector('#pqBarFill_0905')
const barOut0905=document.querySelector('#pqBarOut_0905')
const barRow0905=document.querySelector('#pqBarRow_0905')

let currentEncoding0905='flat'
let currentM0905=16

function syncButtons0905(){
  encodingButtons0905.forEach(btn=>btn.classList.toggle('active',btn.dataset.encoding===currentEncoding0905))
  mButtons0905.forEach(btn=>btn.classList.toggle('active',Number(btn.dataset.m)===currentM0905))
  if(pqMRow0905)pqMRow0905.style.display=currentEncoding0905==='pq'?'':'none'
}

function render0905(){
  const state=stateFor0905(currentEncoding0905, currentM0905)

  if(bytesBox0905)bytesBox0905.textContent=state.bytesPerVector
  if(totalBox0905)totalBox0905.textContent=state.totalMiB.toFixed(1)+' MiB'
  if(ratioBox0905)ratioBox0905.textContent=state.ratio.toFixed(2)+'x'

  if(barFill0905)barFill0905.style.width=Math.max(state.barWidth,0.3)+'%'
  if(barOut0905)barOut0905.textContent=state.barWidth>=1?state.barWidth.toFixed(1)+'%':state.barWidth.toFixed(2)+'%'
  if(barRow0905)barRow0905.classList.toggle('winner',currentEncoding0905!=='flat')
}

encodingButtons0905.forEach(btn=>btn.addEventListener('click',()=>{
  currentEncoding0905=btn.dataset.encoding
  syncButtons0905()
  render0905()
}))

mButtons0905.forEach(btn=>btn.addEventListener('click',()=>{
  currentM0905=Number(btn.dataset.m)
  syncButtons0905()
  render0905()
}))

syncButtons0905()
render0905()
