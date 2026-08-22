const advancedLesson0509=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0509(){if(advancedLesson0509)advancedLesson0509.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0509)
syncAdvancedTarget0509()

// Section 14's lab: the Rank-Position Payoff Board. Same 8-slot ranked list
// Concept 08 used (relevant = {1,2,4,7}), but here one relevant document --
// the one that starts at rank 7, the "mover" -- can be dragged to any rank.
// Moving it re-splices the whole boolean array, exactly like promoting or
// demoting a document in a real re-ranked list. RR, AP and nDCG@8 react to
// that move; Precision@3/Recall@3 (Concept 08's own metrics) are shown
// alongside for direct contrast.

const N_0509=8
let arr0509=[true,true,false,true,false,false,true,false] // ranks 1-8, relevant = {1,2,4,7}
let moverIndex0509=6 // zero-based index of the mover, starts at rank 7

const sliderMover0509=document.querySelector('#wgMoverSlider_0509')
const moverOut0509=document.querySelector('#wgMoverOut_0509')
const resetBtn0509=document.querySelector('#wgResetBtn_0509')
const rankRow0509=document.querySelector('#wgRankRow_0509')
const dcgOut0509=document.querySelector('#wgDCG_0509')
const idcgOut0509=document.querySelector('#wgIDCG_0509')
const barRR0509=document.querySelector('#wgBarRR_0509')
const valRR0509=document.querySelector('#wgValRR_0509')
const barAP0509=document.querySelector('#wgBarAP_0509')
const valAP0509=document.querySelector('#wgValAP_0509')
const barNDCG0509=document.querySelector('#wgBarNDCG_0509')
const valNDCG0509=document.querySelector('#wgValNDCG_0509')
const barP30509=document.querySelector('#wgBarP3_0509')
const valP30509=document.querySelector('#wgValP3_0509')
const barR30509=document.querySelector('#wgBarR3_0509')
const valR30509=document.querySelector('#wgValR3_0509')

function discountWeight0509(rank){
  return 1/Math.log2(rank+1)
}

function computeMetrics0509(arr){
  const n=arr.length
  const totalRelevant=arr.filter(Boolean).length
  let rr=0
  for(let i=0;i<n;i+=1){
    if(arr[i]){rr=1/(i+1);break}
  }
  let apSum=0
  let relSeen=0
  for(let i=0;i<n;i+=1){
    if(arr[i]){
      relSeen+=1
      apSum+=relSeen/(i+1)
    }
  }
  const ap=totalRelevant>0?apSum/totalRelevant:0
  let dcg=0
  for(let i=0;i<n;i+=1){
    if(arr[i])dcg+=discountWeight0509(i+1)
  }
  let idcg=0
  for(let i=0;i<totalRelevant;i+=1){
    idcg+=discountWeight0509(i+1)
  }
  const ndcg=idcg>0?dcg/idcg:0
  const top3Count=arr.slice(0,3).filter(Boolean).length
  const precision3=top3Count/3
  const recall3=totalRelevant>0?top3Count/totalRelevant:0
  return{rr,ap,dcg,idcg,ndcg,precision3,recall3,totalRelevant}
}

function setBar0509(fillEl,valEl,value){
  const clamped=Math.max(0,Math.min(1,value))
  if(fillEl)fillEl.style.width=`${clamped*100}%`
  if(valEl)valEl.textContent=value.toFixed(3)
}

function render0509(){
  if(moverOut0509)moverOut0509.textContent=String(moverIndex0509+1)
  if(sliderMover0509)sliderMover0509.value=String(moverIndex0509+1)
  const chips=[]
  for(let i=0;i<N_0509;i+=1){
    const rank=i+1
    const isRelevant=arr0509[i]
    const isMover=i===moverIndex0509
    const cls=`rank-chip ${isRelevant?'tp':'tn'}${isMover?' mover':''}`
    chips.push(`<div class="${cls}"><b>${rank}</b><span>${isRelevant?'relevant':'not relevant'}</span>${isMover?'<small>MOVER</small>':''}</div>`)
  }
  if(rankRow0509)rankRow0509.innerHTML=chips.join('')
  const m=computeMetrics0509(arr0509)
  if(dcgOut0509)dcgOut0509.textContent=m.dcg.toFixed(4)
  if(idcgOut0509)idcgOut0509.textContent=m.idcg.toFixed(4)
  setBar0509(barRR0509,valRR0509,m.rr)
  setBar0509(barAP0509,valAP0509,m.ap)
  setBar0509(barNDCG0509,valNDCG0509,m.ndcg)
  setBar0509(barP30509,valP30509,m.precision3)
  setBar0509(barR30509,valR30509,m.recall3)
}

sliderMover0509?.addEventListener('input',()=>{
  const target=Number(sliderMover0509.value)-1
  if(target===moverIndex0509)return
  arr0509.splice(moverIndex0509,1)
  arr0509.splice(target,0,true)
  moverIndex0509=target
  render0509()
})

resetBtn0509?.addEventListener('click',()=>{
  arr0509=[true,true,false,true,false,false,true,false]
  moverIndex0509=6
  render0509()
})

render0509()
