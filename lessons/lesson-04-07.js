const advancedLesson0407=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0407(){if(advancedLesson0407)advancedLesson0407.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0407)
syncAdvancedTarget0407()

// Section 14's lab: The Surprise Meter -- reuses Concept 06's exact fixed
// scores and softmax+temperature mechanism (not re-derived here) and adds
// two new readouts this concept actually defines: entropy of the resulting
// distribution, and cross-entropy against whichever candidate the user
// marks as the actually-correct one. The point on display is that entropy
// only depends on the shape of the distribution (falls as temperature
// falls), while cross-entropy also depends on WHERE the true answer landed
// -- a confident, correct guess scores low; a confident, wrong guess is
// punished hard by the same formula.

const FIXED_SCORES_0407=[2.0,1.0,0.1]
const DEFAULT_TEMP_X100_0407=100

const tempSlider0407=document.querySelector('#seTemp_0407')
const tempOut0407=document.querySelector('#seTempOut_0407')
const correctToggle0407=document.querySelector('#seCorrectToggle_0407')
const entropyBox0407=document.querySelector('#seEntropyBox_0407')
const crossEntBox0407=document.querySelector('#seCrossEntBox_0407')
const verdictBox0407=document.querySelector('#seVerdict_0407')

const bar1_0407=document.querySelector('#seBar1_0407')
const bar1Out0407=document.querySelector('#seBar1Out_0407')
const bar2_0407=document.querySelector('#seBar2_0407')
const bar2Out0407=document.querySelector('#seBar2Out_0407')
const bar3_0407=document.querySelector('#seBar3_0407')
const bar3Out0407=document.querySelector('#seBar3Out_0407')

function softmax0407(scores,T){
  const scaled=scores.map(s=>s/T)
  const m=Math.max(...scaled)
  const exps=scaled.map(s=>Math.exp(s-m))
  const total=exps.reduce((a,b)=>a+b,0)
  return exps.map(e=>e/total)
}

function entropy0407(probs){
  return -probs.reduce((s,p)=>s+(p>0?p*Math.log(p):0),0)
}

function toggleGroupValue0407(group){return group?.querySelector('button.active')?.dataset.value}
function setToggle0407(group,value){
  if(!group)return
  ;[...group.querySelectorAll('button')].forEach(btn=>btn.classList.toggle('active',btn.dataset.value===value))
}

function render0407(tempX100){
  if(!tempSlider0407)return
  const T=tempX100/100
  const probs=softmax0407(FIXED_SCORES_0407,T)
  const correctIdx=Number(toggleGroupValue0407(correctToggle0407)??0)

  if(tempOut0407)tempOut0407.textContent=T.toFixed(2)

  const bars=[[bar1_0407,bar1Out0407],[bar2_0407,bar2Out0407],[bar3_0407,bar3Out0407]]
  bars.forEach(([bar,out],i)=>{
    if(bar)bar.style.width=(probs[i]*100)+'%'
    if(out)out.textContent=probs[i].toFixed(3)
  })

  const h=entropy0407(probs)
  const ce=-Math.log(probs[correctIdx])
  if(entropyBox0407)entropyBox0407.textContent=h.toFixed(4)+' nats'
  if(crossEntBox0407)crossEntBox0407.textContent=ce.toFixed(4)+' nats'

  if(verdictBox0407){
    const docLabel=['Doc 1 (score 2.0)','Doc 2 (score 1.0)','Doc 3 (score 0.1)'][correctIdx]
    const confident=probs[correctIdx]>0.5
    verdictBox0407.textContent=confident
      ? `Marked correct answer: ${docLabel}, at ${(probs[correctIdx]*100).toFixed(1)}% probability. Cross-entropy is low (${ce.toFixed(3)} nats) -- the distribution was already confident in the right place.`
      : `Marked correct answer: ${docLabel}, at only ${(probs[correctIdx]*100).toFixed(1)}% probability. Cross-entropy is high (${ce.toFixed(3)} nats) -- the distribution was confident, just confidently pointed somewhere else.`
    verdictBox0407.classList.toggle('warning',!confident)
  }
}

if(tempSlider0407){
  tempSlider0407.addEventListener('input',()=>{
    render0407(Number(tempSlider0407.value))
  })
}
correctToggle0407?.querySelectorAll('button').forEach(btn=>btn.addEventListener('click',()=>{
  setToggle0407(correctToggle0407,btn.dataset.value)
  render0407(Number(tempSlider0407?.value??DEFAULT_TEMP_X100_0407))
}))

render0407(DEFAULT_TEMP_X100_0407)
