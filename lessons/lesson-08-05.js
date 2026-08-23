const advancedLesson0805=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0805(){if(advancedLesson0805)advancedLesson0805.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0805)
syncAdvancedTarget0805()

// Section 14's lab: The Negative Picker. All four cosines (S1=0.6644,
// B1 hard=0.6644, B2 easy=0.0000, S1-sharpened=0.9759) are Module 07
// Concept 09's own already-verified figures, reused unchanged. This file
// reuses Concept 04's own infonceLoss()/probPos() formula, recomputing
// live from the three button choices rather than hardcoding a lookup
// table, matching lesson-08-04.js's own established pattern.

function infonceLoss0805(cosPos,cosNeg,tau){
  const ePos=Math.exp(cosPos/tau), eNeg=Math.exp(cosNeg/tau)
  return -Math.log(ePos/(ePos+eNeg))
}
function probPos0805(cosPos,cosNeg,tau){
  const ePos=Math.exp(cosPos/tau), eNeg=Math.exp(cosNeg/tau)
  return ePos/(ePos+eNeg)
}

// Frozen -- Module 07 Concept 09's own already-verified cosines, reused unchanged.
const POS_COS_0805={default:0.6644,sharpened:0.9759}
const NEG_COS_0805={hard:0.6644,easy:0.0000}
const NEG_LABEL_0805={hard:'B1 (hard negative)',easy:'B2 (easy negative)'}
const POS_LABEL_0805={default:'S1, as indexed',sharpened:'S1, with header'}

const negButtons0805=[...document.querySelectorAll('#s14 [data-negative]')]
const posButtons0805=[...document.querySelectorAll('#s14 [data-positive]')]
const tauButtons0805=[...document.querySelectorAll('#s14 [data-tau]')]
const chipsWrap0805=document.querySelector('#pickerChips_0805')
const barsWrap0805=document.querySelector('#pickerBars_0805')
const readout0805=document.querySelector('#pickerReadout_0805')
const verdict0805=document.querySelector('#pickerVerdict_0805')

let currentNegative0805='hard'
let currentPositive0805='default'
let currentTau0805=0.05

function syncButtons0805(){
  negButtons0805.forEach(btn=>btn.classList.toggle('active',btn.dataset.negative===currentNegative0805))
  posButtons0805.forEach(btn=>btn.classList.toggle('active',btn.dataset.positive===currentPositive0805))
  tauButtons0805.forEach(btn=>btn.classList.toggle('active',Number(btn.dataset.tau)===currentTau0805))
}

function fmtLoss0805(loss){
  return loss<0.0001&&loss>0?loss.toExponential(6):loss.toFixed(6)
}

function render0805(){
  const cosPos=POS_COS_0805[currentPositive0805]
  const cosNeg=NEG_COS_0805[currentNegative0805]
  const gap=cosPos-cosNeg
  const tau=currentTau0805
  const prob=probPos0805(cosPos,cosNeg,tau)
  const loss=infonceLoss0805(cosPos,cosNeg,tau)

  // Easiest reference combination at the current temperature -- default
  // positive vs. easy negative -- for the live "x times bigger" ratio.
  const easyLoss=infonceLoss0805(POS_COS_0805.default,NEG_COS_0805.easy,tau)
  const ratio=loss/easyLoss

  if(chipsWrap0805){
    const tied=gap===0
    chipsWrap0805.innerHTML=`
      <span class="rank-chip">POSITIVE (${POS_LABEL_0805[currentPositive0805]}) — ${cosPos.toFixed(4)}</span>
      <span class="rank-chip${tied?' match':''}">NEGATIVE (${NEG_LABEL_0805[currentNegative0805]}) — ${cosNeg.toFixed(4)}${tied?' — TIED':''}</span>
    `
  }

  if(barsWrap0805){
    barsWrap0805.innerHTML=`
      <div class="prob-row winner">
        <span class="token-label">prob_pos</span>
        <div class="bar-track"><div class="bar-fill" style="width:${(prob*100).toFixed(4)}%"></div></div>
        <b>${prob.toFixed(6)}</b>
      </div>
      <div class="prob-row">
        <span class="token-label">1 − prob_pos</span>
        <div class="bar-track"><div class="bar-fill" style="width:${((1-prob)*100).toFixed(4)}%"></div></div>
        <b>${(1-prob).toFixed(6)}</b>
      </div>
    `
  }

  if(readout0805){
    readout0805.innerHTML=`
      <div><span>GAP</span><b>${gap.toFixed(4)}</b></div>
      <div><span>TEMPERATURE</span><b>&tau; = ${tau}</b></div>
      <div><span>LOSS (nats)</span><b>${fmtLoss0805(loss)}</b></div>
      <div><span>VS. EASIEST COMBINATION AT THIS &tau;</span><b>${ratio<1.01?'baseline':Math.round(ratio).toLocaleString()+'× bigger'}</b></div>
    `
  }

  if(verdict0805){
    let text
    if(gap===0){
      text=`Tied at ${cosPos.toFixed(4)} -- prob_pos is exactly 0.5000, the textbook worst case. This is where a contrastive loss still has everything to teach.`
    }else if(currentNegative0805==='easy'&&tau<=0.05){
      text=`Already separated by ${gap.toFixed(4)} in raw cosine -- at the real production temperature, prob_pos rounds to ${prob.toFixed(7)} and the loss is ${fmtLoss0805(loss)} nats. There is nothing left here for gradient descent to correct.`
    }else{
      text=`Gap of ${gap.toFixed(4)} at &tau;=${tau} -- prob_pos=${prob.toFixed(6)}, loss=${fmtLoss0805(loss)} nats. The smaller the gap, the more this negative still has to teach.`
    }
    verdict0805.innerHTML=`<b>${gap===0?'MAXIMUM UNCERTAINTY':currentNegative0805==='easy'?'LITTLE LEFT TO LEARN':'MEANINGFUL SIGNAL'}</b> ${text}`
  }
}

negButtons0805.forEach(btn=>btn.addEventListener('click',()=>{
  currentNegative0805=btn.dataset.negative
  syncButtons0805()
  render0805()
}))
posButtons0805.forEach(btn=>btn.addEventListener('click',()=>{
  currentPositive0805=btn.dataset.positive
  syncButtons0805()
  render0805()
}))
tauButtons0805.forEach(btn=>btn.addEventListener('click',()=>{
  currentTau0805=Number(btn.dataset.tau)
  syncButtons0805()
  render0805()
}))

syncButtons0805()
render0805()
