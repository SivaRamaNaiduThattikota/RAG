const advancedLesson0804=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0804(){if(advancedLesson0804)advancedLesson0804.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0804)
syncAdvancedTarget0804()

// Section 14's lab: The Pull-Push Trainer. doc1Vec/doc2Vec are Concept 03's
// own frozen, precomputed pooled vectors -- reused unchanged, never
// recomputed here. The query vector at each step is q0 + t*alpha*unitDir,
// an ILLUSTRATIVE PROXY for the direction the InfoNCE loss's gradient would
// push a query embedding (Module 04 Concept 08's own formula, cited not
// re-derived) -- not a literal dL/dq derivation. Every cos/loss number this
// file computes was independently triple-verified (two Node.js scripts, one
// Python script) before this file was written; this file recomputes them
// live from the same formula rather than hardcoding a lookup table, matching
// the course's established pattern (see lesson-08-03.js).

function dot0804(a,b){return a[0]*b[0]+a[1]*b[1]}
function norm0804(a){return Math.sqrt(dot0804(a,a))}
function cosine0804(a,b){return dot0804(a,b)/(norm0804(a)*norm0804(b))}
function unit0804(a){const n=norm0804(a);return [a[0]/n,a[1]/n]}

// Frozen -- Concept 03's own pooled vectors, reused unchanged.
const DOC1_VEC_0804=[1.3842,1.5025]
const DOC2_VEC_0804=[-0.4077,-0.9372]
const UNIT_DIR_0804=unit0804([DOC1_VEC_0804[0]-DOC2_VEC_0804[0],DOC1_VEC_0804[1]-DOC2_VEC_0804[1]])
const ALPHA_0804=0.06
const Q0_0804=[0.10,-0.10]

function queryAtStep0804(t){
  return [Q0_0804[0]+t*ALPHA_0804*UNIT_DIR_0804[0], Q0_0804[1]+t*ALPHA_0804*UNIT_DIR_0804[1]]
}

// The InfoNCE-style loss (Module 04 Concept 08, Section 05/09) with exactly
// one positive and one negative -- sim(q,d) filled in as real cosine
// similarity for the first time in the course.
function infonceLoss0804(cosPos,cosNeg,tau){
  const ePos=Math.exp(cosPos/tau), eNeg=Math.exp(cosNeg/tau)
  return -Math.log(ePos/(ePos+eNeg))
}
function probPos0804(cosPos,cosNeg,tau){
  const ePos=Math.exp(cosPos/tau), eNeg=Math.exp(cosNeg/tau)
  return ePos/(ePos+eNeg)
}

// 2D plane mapping, shared by the live lab SVG (Section 14).
const ORIGIN_X_0804=130, ORIGIN_Y_0804=195, PLANE_SCALE_0804=80
function svgX0804(x){return ORIGIN_X_0804+PLANE_SCALE_0804*x}
function svgY0804(y){return ORIGIN_Y_0804-PLANE_SCALE_0804*y}

const stepButtons0804=[...document.querySelectorAll('#s14 .lab-actions [data-step]')]
const tauButtons0804=[...document.querySelectorAll('#s14 .lab-actions [data-tau]')]
const readout0804=document.querySelector('#stepReadout_0804')
const barsWrap0804=document.querySelector('#pullPushBars_0804')
const rankingLine0804=document.querySelector('#rankingVerdict_0804')
const verdict0804=document.querySelector('#pullPushVerdict_0804')
const liveLine0804=document.querySelector('#liveQueryLine_0804')
const liveDot0804=document.querySelector('#liveQueryDot_0804')
const liveLabel0804=document.querySelector('#liveQueryLabel_0804')

let currentStep0804=0
let currentTau0804=1

function syncButtons0804(){
  stepButtons0804.forEach(btn=>btn.classList.toggle('active',Number(btn.dataset.step)===currentStep0804))
  tauButtons0804.forEach(btn=>btn.classList.toggle('active',Number(btn.dataset.tau)===currentTau0804))
}

function render0804(){
  const q0=queryAtStep0804(0)
  const qt=queryAtStep0804(currentStep0804)
  const cosPos0=cosine0804(q0,DOC1_VEC_0804)
  const cosNeg0=cosine0804(q0,DOC2_VEC_0804)
  const cosPos=cosine0804(qt,DOC1_VEC_0804)
  const cosNeg=cosine0804(qt,DOC2_VEC_0804)
  const loss0=infonceLoss0804(cosPos0,cosNeg0,currentTau0804)
  const loss=infonceLoss0804(cosPos,cosNeg,currentTau0804)
  const doc1Wins=cosPos>=cosNeg

  if(liveLine0804&&liveDot0804&&liveLabel0804){
    const x2=svgX0804(qt[0]), y2=svgY0804(qt[1])
    liveLine0804.setAttribute('x2',x2)
    liveLine0804.setAttribute('y2',y2)
    liveDot0804.setAttribute('cx',x2)
    liveDot0804.setAttribute('cy',y2)
    liveLabel0804.setAttribute('x',x2+8)
    liveLabel0804.setAttribute('y',y2-8)
    liveLabel0804.textContent=`q${currentStep0804} (${qt[0].toFixed(4)}, ${qt[1].toFixed(4)})`
  }

  if(readout0804){
    readout0804.innerHTML=`
      <div><span>STEP</span><b>t = ${currentStep0804}</b></div>
      <div><span>QUERY VECTOR</span><b>(${qt[0].toFixed(4)}, ${qt[1].toFixed(4)})</b></div>
      <div><span>TEMPERATURE</span><b>&tau; = ${currentTau0804}</b></div>
      <div><span>LOSS (nats)</span><b>${loss<0.0001&&loss>0?loss.toExponential(4):loss.toFixed(4)}</b></div>
    `
  }

  if(barsWrap0804){
    const rows=[
      {label:'cos to doc1 "The order shipped late" (relevant)',cos:cosPos,winner:doc1Wins},
      {label:'cos to doc2 "Refund policy updated" (irrelevant)',cos:cosNeg,winner:!doc1Wins}
    ]
    barsWrap0804.innerHTML=rows.map(r=>{
      const pct=(((r.cos+1)/2)*100).toFixed(2)
      return `<div class="prob-row${r.winner?' winner':''}">
        <span class="token-label">${r.label}</span>
        <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
        <b>${r.cos.toFixed(4)}</b>
      </div>`
    }).join('')
  }

  if(rankingLine0804){
    rankingLine0804.className='callout'+(doc1Wins?'':' warning')
    rankingLine0804.innerHTML=doc1Wins
      ? `<b>CORRECT -- doc1 (relevant) now ranks first.</b> cos_pos ${cosPos.toFixed(4)} &ge; cos_neg ${cosNeg.toFixed(4)}.`
      : `<b>WRONG -- doc2 (irrelevant) currently ranks first.</b> cos_neg ${cosNeg.toFixed(4)} &gt; cos_pos ${cosPos.toFixed(4)}.`
  }

  if(verdict0804){
    verdict0804.innerHTML=`<b>Step 0 &rarr; Step ${currentStep0804} at &tau;=${currentTau0804}:</b> cos to the relevant document ${cosPos>=cosPos0?'rose':'fell'} from ${cosPos0.toFixed(4)} to ${cosPos.toFixed(4)}; cos to the irrelevant document ${cosNeg<=cosNeg0?'fell':'rose'} from ${cosNeg0.toFixed(4)} to ${cosNeg.toFixed(4)}; the loss fell from ${loss0.toFixed(4)} to ${loss<0.0001&&loss>0?loss.toExponential(4):loss.toFixed(4)} nats. This is an illustrative proxy for the pull/push DIRECTION the loss encourages -- not real gradient descent on shared encoder weights (Module 09/24's actual job).</b>`
  }
}

stepButtons0804.forEach(btn=>btn.addEventListener('click',()=>{
  currentStep0804=Number(btn.dataset.step)
  syncButtons0804()
  render0804()
}))
tauButtons0804.forEach(btn=>btn.addEventListener('click',()=>{
  currentTau0804=Number(btn.dataset.tau)
  syncButtons0804()
  render0804()
}))

syncButtons0804()
render0804()
