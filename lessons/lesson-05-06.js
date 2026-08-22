const advancedLesson0506=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0506(){if(advancedLesson0506)advancedLesson0506.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0506)
syncAdvancedTarget0506()

// Section 14's lab: the BM25 Saturation Curve.
// Holds document length equal to the corpus average throughout (this
// concept's own simplification), so only k1 is exposed as a control --
// b has nothing to do here on purpose, and Concept 07's lab is the one
// that finally gives b a job.

const IDF_REFUND_0506=Math.log(5/2) // reused from Concepts 04/05's five-ticket corpus
const TF_POINTS_0506=[1,2,4,6,8,10]

function saturatingRatio0506(tf,k1){
  return (tf*(k1+1))/(tf+k1) // L(d) held at 1
}

const k1Slider0506=document.querySelector('#wgK1_0506')
const k1Out0506=document.querySelector('#wgK1Out_0506')
const satBarsBox0506=document.querySelector('#wgSatBars_0506')
const ceilingBox0506=document.querySelector('#wgSatCeiling_0506')
const tenBox0506=document.querySelector('#wgSatTen_0506')
const verdictBox0506=document.querySelector('#wgVerdictSat_0506')

function renderSatBars0506(k1){
  const ceiling=k1+1
  return TF_POINTS_0506.map(tf=>{
    const ratio=saturatingRatio0506(tf,k1)
    const pct=Math.min(100,(ratio/ceiling)*100)
    return `<div class="prob-row"><span>tf=${tf}</span><div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div><span>${ratio.toFixed(4)}</span></div>`
  }).join('')
}

function runSaturation0506(){
  const k1=parseFloat(k1Slider0506?.value||'1.2')
  if(k1Out0506)k1Out0506.textContent=k1.toFixed(2)
  if(satBarsBox0506)satBarsBox0506.innerHTML=renderSatBars0506(k1)
  const ceiling=k1+1
  if(ceilingBox0506)ceilingBox0506.textContent=ceiling.toFixed(4)
  const tenRatio=saturatingRatio0506(10,k1)
  if(tenBox0506)tenBox0506.textContent=`${tenRatio.toFixed(4)} (${((tenRatio/ceiling)*100).toFixed(1)}% of ceiling)`
  if(verdictBox0506){
    const rawTfIdfTen=10*IDF_REFUND_0506
    const bm25Ten=tenRatio*IDF_REFUND_0506
    const bm25One=saturatingRatio0506(1,k1)*IDF_REFUND_0506
    verdictBox0506.textContent=`With k1=${k1.toFixed(2)}, tf=10 already reaches ${((tenRatio/ceiling)*100).toFixed(1)}% of its ceiling of ${ceiling.toFixed(4)}. For "refund" (idf ≈ 0.9163), BM25 goes from ${bm25One.toFixed(4)} at tf=1 to only ${bm25Ten.toFixed(4)} at tf=10 -- a raw tf-idf score would have grown all the way to ${rawTfIdfTen.toFixed(4)} for the same jump.`
  }
}

function resetSaturation0506(){
  if(k1Slider0506)k1Slider0506.value='1.2'
  runSaturation0506()
}

k1Slider0506?.addEventListener('input',runSaturation0506)

resetSaturation0506()
