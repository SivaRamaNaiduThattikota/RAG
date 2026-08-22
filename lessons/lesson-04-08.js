const advancedLesson0408=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0408(){if(advancedLesson0408)advancedLesson0408.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0408)
syncAdvancedTarget0408()

// Section 14's lab: The Ranking & Contrastive Loss Lab -- unlike Concepts 06-07's
// labs (which held the raw scores fixed and only varied temperature or which
// candidate counted as correct), this one lets the user drag the raw scores
// THEMSELVES. Doc 1 is always the positive (the actually-relevant passage);
// docs 2-3 are negatives. The point on display: temperature alone never
// changes the ranking (cited from Concept 06), but moving the raw scores does
// -- and moving the positive's score up is exactly what training does to
// drive Concept 07's cross-entropy loss toward 0.

const DEFAULT_Z_0408=[2.0,1.0,0.1]
const DEFAULT_TEMP_X100_0408=100

const zSlider1_0408=document.querySelector('#rlZ1_0408')
const zSlider2_0408=document.querySelector('#rlZ2_0408')
const zSlider3_0408=document.querySelector('#rlZ3_0408')
const zOut1_0408=document.querySelector('#rlZ1Out_0408')
const zOut2_0408=document.querySelector('#rlZ2Out_0408')
const zOut3_0408=document.querySelector('#rlZ3Out_0408')
const tempSlider0408=document.querySelector('#rlTemp_0408')
const tempOut0408=document.querySelector('#rlTempOut_0408')

const rankingBox0408=document.querySelector('#rlRanking_0408')
const lossBox0408=document.querySelector('#rlLoss_0408')
const verdictBox0408=document.querySelector('#rlVerdict_0408')

const bar1_0408=document.querySelector('#rlBar1_0408')
const bar1Out0408=document.querySelector('#rlBar1Out_0408')
const bar2_0408=document.querySelector('#rlBar2_0408')
const bar2Out0408=document.querySelector('#rlBar2Out_0408')
const bar3_0408=document.querySelector('#rlBar3_0408')
const bar3Out0408=document.querySelector('#rlBar3Out_0408')

const presetLow0408=document.querySelector('#rlPresetLow_0408')
const presetHigh0408=document.querySelector('#rlPresetHigh_0408')
const presetReset0408=document.querySelector('#rlPresetReset_0408')

function softmax0408(scores,T){
  const scaled=scores.map(s=>s/T)
  const m=Math.max(...scaled)
  const exps=scaled.map(s=>Math.exp(s-m))
  const total=exps.reduce((a,b)=>a+b,0)
  return exps.map(e=>e/total)
}

function rankOrder0408(values){
  return [0,1,2].slice().sort((a,b)=>values[b]-values[a])
}

function setSliders0408(z){
  if(zSlider1_0408)zSlider1_0408.value=String(z[0])
  if(zSlider2_0408)zSlider2_0408.value=String(z[1])
  if(zSlider3_0408)zSlider3_0408.value=String(z[2])
}

function render0408(){
  if(!zSlider1_0408)return
  const z=[Number(zSlider1_0408.value),Number(zSlider2_0408.value),Number(zSlider3_0408.value)]
  const T=Number(tempSlider0408.value)/100

  if(zOut1_0408)zOut1_0408.textContent=z[0].toFixed(1)
  if(zOut2_0408)zOut2_0408.textContent=z[1].toFixed(1)
  if(zOut3_0408)zOut3_0408.textContent=z[2].toFixed(1)
  if(tempOut0408)tempOut0408.textContent=T.toFixed(2)

  const probs=softmax0408(z,T)
  const bars=[[bar1_0408,bar1Out0408],[bar2_0408,bar2Out0408],[bar3_0408,bar3Out0408]]
  bars.forEach(([bar,out],i)=>{
    if(bar)bar.style.width=(probs[i]*100)+'%'
    if(out)out.textContent=probs[i].toFixed(3)
  })

  const rawOrder=rankOrder0408(z)
  const softOrder=rankOrder0408(probs)
  const labels=['Doc 1 (positive)','Doc 2 (negative)','Doc 3 (negative)']
  if(rankingBox0408)rankingBox0408.textContent=rawOrder.map(i=>labels[i]).join(' > ')

  const loss=-Math.log(probs[0])
  if(lossBox0408)lossBox0408.textContent=loss.toFixed(4)+' nats'

  const rankingMatches=rawOrder.every((v,i)=>v===softOrder[i])
  const positiveOnTop=rawOrder[0]===0
  if(verdictBox0408){
    verdictBox0408.textContent=positiveOnTop
      ? `The positive document ranks first, and the contrastive loss is ${loss.toFixed(3)} nats. Ranking from raw scores matches ranking from the softmax output ${rankingMatches?'(as it always must be, Concept 06 Section 09)':''} -- temperature changes the loss, never the order.`
      : `The positive document does NOT rank first here -- the loss is a steep ${loss.toFixed(3)} nats. This is exactly the state training pushes away from: raising Doc 1's raw score (not the temperature) is what would fix the ranking.`
    verdictBox0408.classList.toggle('warning',!positiveOnTop)
  }
}

;[zSlider1_0408,zSlider2_0408,zSlider3_0408,tempSlider0408].forEach(el=>el?.addEventListener('input',render0408))

presetLow0408?.addEventListener('click',()=>{setSliders0408([5.0,1.0,0.1]);render0408()})
presetHigh0408?.addEventListener('click',()=>{setSliders0408([0.1,1.0,2.0]);render0408()})
presetReset0408?.addEventListener('click',()=>{
  setSliders0408(DEFAULT_Z_0408)
  if(tempSlider0408)tempSlider0408.value=String(DEFAULT_TEMP_X100_0408)
  render0408()
})

render0408()
