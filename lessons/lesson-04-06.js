const advancedLesson0406=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0406(){if(advancedLesson0406)advancedLesson0406.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0406)
syncAdvancedTarget0406()

// Section 14's lab: The Temperature Dial -- unlike Concept 05's Bayes
// Calculator (three independent percentages), this widget carries one
// fixed set of raw scores (2.0, 1.0, 0.1) and a single temperature dial,
// recomputing the full softmax distribution (Section 09's log-sum-exp
// trick) live as temperature changes. The point on display is that the
// ranking never moves even as the shares stretch and compress.

const FIXED_SCORES_0406=[2.0,1.0,0.1]
const DEFAULT_TEMP_X100_0406=100 // slider carries T*100 so it can step in 0.05 increments

const tempSlider0406=document.querySelector('#simTemp_0406')
const tempOut0406=document.querySelector('#simTempOut_0406')
const topBox0406=document.querySelector('#simTopBox0406')
const sumBox0406=document.querySelector('#simSumBox0406')
const rankBox0406=document.querySelector('#simRankBox0406')

const bar1_0406=document.querySelector('#simBar1_0406')
const bar1Out0406=document.querySelector('#simBar1Out0406')
const bar2_0406=document.querySelector('#simBar2_0406')
const bar2Out0406=document.querySelector('#simBar2Out0406')
const bar3_0406=document.querySelector('#simBar3_0406')
const bar3Out0406=document.querySelector('#simBar3Out0406')
const verdictBox0406=document.querySelector('#simVerdict0406')
const resetButton0406=document.querySelector('#simReset0406')

// Section 09's log-sum-exp trick -- subtract the max before exponentiating
function softmax0406(scores,T){
  const scaled=scores.map(s=>s/T)
  const m=Math.max(...scaled)
  const exps=scaled.map(s=>Math.exp(s-m))
  const total=exps.reduce((a,b)=>a+b,0)
  return exps.map(e=>e/total)
}

function render0406(tempX100){
  const T=tempX100/100
  const probs=softmax0406(FIXED_SCORES_0406,T)
  const sum=probs.reduce((a,b)=>a+b,0)

  if(tempOut0406)tempOut0406.textContent=T.toFixed(2)
  if(topBox0406)topBox0406.textContent=(probs[0]*100).toFixed(1)+'%'
  if(sumBox0406)sumBox0406.textContent=(sum*100).toFixed(1)+'%'

  // ranking check -- Section 09's claim: softmax never re-orders its inputs
  const rawOrder=[0,1,2].slice().sort((a,b)=>FIXED_SCORES_0406[b]-FIXED_SCORES_0406[a])
  const probOrder=[0,1,2].slice().sort((a,b)=>probs[b]-probs[a])
  const unchanged=rawOrder.every((v,i)=>v===probOrder[i])
  if(rankBox0406)rankBox0406.textContent=unchanged?'Unchanged':'Changed (should not happen)'

  if(bar1_0406)bar1_0406.style.width=(probs[0]*100)+'%'
  if(bar1Out0406)bar1Out0406.textContent=probs[0].toFixed(3)
  if(bar2_0406)bar2_0406.style.width=(probs[1]*100)+'%'
  if(bar2Out0406)bar2Out0406.textContent=probs[1].toFixed(3)
  if(bar3_0406)bar3_0406.style.width=(probs[2]*100)+'%'
  if(bar3Out0406)bar3Out0406.textContent=probs[2].toFixed(3)

  if(verdictBox0406){
    verdictBox0406.textContent=`At T=${T.toFixed(2)}, the top candidate holds ${(probs[0]*100).toFixed(1)}% of the probability mass. The ranking is unchanged from the raw scores at every temperature.`
    verdictBox0406.classList.toggle('warning',!unchanged)
  }
}

if(tempSlider0406){
  tempSlider0406.addEventListener('input',()=>{
    render0406(Number(tempSlider0406.value))
  })
}

if(resetButton0406)resetButton0406.addEventListener('click',()=>{
  if(tempSlider0406)tempSlider0406.value=String(DEFAULT_TEMP_X100_0406)
  render0406(DEFAULT_TEMP_X100_0406)
})

render0406(DEFAULT_TEMP_X100_0406)
