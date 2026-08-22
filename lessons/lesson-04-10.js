const advancedLesson0410=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0410(){if(advancedLesson0410)advancedLesson0410.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0410)
syncAdvancedTarget0410()

// Section 14's lab: The Full Pipeline Walkthrough -- the module's closing lab. Query
// vector A is draggable (two sliders); candidates B=(6,8) and C=(4,3) stay fixed,
// matching the lesson's own worked example. Every downstream stage -- norms, cosine
// similarity, raw and normalized distance, softmax, entropy, cross-entropy, and the
// final ranking -- recomputes live from the same two formulas Concepts 01-08 already
// built. Nothing here is a new formula; it's Concepts 01-08 run back to back on one
// example, exactly like the lesson text.

const FIXED_B_0410=[6,8]
const FIXED_C_0410=[4,3]

const axSlider0410=document.querySelector('#wgAx_0410')
const aySlider0410=document.querySelector('#wgAy_0410')
const axOut0410=document.querySelector('#wgAxOut_0410')
const ayOut0410=document.querySelector('#wgAyOut_0410')

const normA0410=document.querySelector('#wgNormA_0410')
const normB0410=document.querySelector('#wgNormB_0410')
const normC0410=document.querySelector('#wgNormC_0410')
const cosAB0410=document.querySelector('#wgCosAB_0410')
const cosAC0410=document.querySelector('#wgCosAC_0410')
const rawDistAB0410=document.querySelector('#wgRawDistAB_0410')
const rawDistAC0410=document.querySelector('#wgRawDistAC_0410')
const normDistAB0410=document.querySelector('#wgNormDistAB_0410')
const normDistAC0410=document.querySelector('#wgNormDistAC_0410')
const softB0410=document.querySelector('#wgSoftB_0410')
const softC0410=document.querySelector('#wgSoftC_0410')
const entropy0410box=document.querySelector('#wgEntropy_0410')
const crossEnt0410box=document.querySelector('#wgCrossEnt_0410')
const ranking0410box=document.querySelector('#wgRanking_0410')
const verdict0410box=document.querySelector('#wgVerdict_0410')

function norm0410(v){return Math.sqrt(v[0]*v[0]+v[1]*v[1])}
function dot0410(u,v){return u[0]*v[0]+u[1]*v[1]}
function dist0410(u,v){return Math.sqrt((u[0]-v[0])**2+(u[1]-v[1])**2)}
function normalize0410(v){const n=norm0410(v);return n>0?[v[0]/n,v[1]/n]:[0,0]}
function softmax0410(z,T=1){const s=z.map(x=>x/T);const m=Math.max(...s);const e=s.map(x=>Math.exp(x-m));const t=e.reduce((a,b)=>a+b,0);return e.map(x=>x/t)}
function entropy0410(p){return -p.reduce((s,x)=>s+(x>0?x*Math.log(x):0),0)}

function render0410(){
  if(!axSlider0410)return
  const A=[Number(axSlider0410.value),Number(aySlider0410.value)]
  if(axOut0410)axOut0410.textContent=A[0].toFixed(1)
  if(ayOut0410)ayOut0410.textContent=A[1].toFixed(1)

  const nA=norm0410(A), nB=norm0410(FIXED_B_0410), nC=norm0410(FIXED_C_0410)
  if(normA0410)normA0410.textContent=nA.toFixed(3)
  if(normB0410)normB0410.textContent=nB.toFixed(3)
  if(normC0410)normC0410.textContent=nC.toFixed(3)

  const cAB=nA>0?dot0410(A,FIXED_B_0410)/(nA*nB):0
  const cAC=nA>0?dot0410(A,FIXED_C_0410)/(nA*nC):0
  if(cosAB0410)cosAB0410.textContent=cAB.toFixed(4)
  if(cosAC0410)cosAC0410.textContent=cAC.toFixed(4)

  const rAB=dist0410(A,FIXED_B_0410), rAC=dist0410(A,FIXED_C_0410)
  if(rawDistAB0410)rawDistAB0410.textContent=rAB.toFixed(4)
  if(rawDistAC0410)rawDistAC0410.textContent=rAC.toFixed(4)

  const An=normalize0410(A), Bn=normalize0410(FIXED_B_0410), Cn=normalize0410(FIXED_C_0410)
  const nAB=dist0410(An,Bn), nAC=dist0410(An,Cn)
  if(normDistAB0410)normDistAB0410.textContent=nAB.toFixed(4)
  if(normDistAC0410)normDistAC0410.textContent=nAC.toFixed(4)

  const probs=softmax0410([cAB,cAC],1)
  if(softB0410)softB0410.textContent=probs[0].toFixed(4)
  if(softC0410)softC0410.textContent=probs[1].toFixed(4)

  const h=entropy0410(probs)
  const winnerIdx=cAB>=cAC?0:1
  const ce=-Math.log(probs[winnerIdx])
  if(entropy0410box)entropy0410box.textContent=h.toFixed(4)+' nats'
  if(crossEnt0410box)crossEnt0410box.textContent=ce.toFixed(4)+' nats'

  const rawOrder=rAB<=rAC?'B > C (raw distance)':'C > B (raw distance)'
  const normOrder=nAB<=nAC?'B > C (normalized distance)':'C > B (normalized distance)'
  const cosOrder=cAB>=cAC?'B > C (cosine)':'C > B (cosine)'
  if(ranking0410box)ranking0410box.textContent=`Cosine: ${cosOrder} · Raw distance: ${rawOrder} · Normalized distance: ${normOrder}`

  const agree=(cAB>=cAC)===(nAB<=nAC)
  const rawAgrees=(cAB>=cAC)===(rAB<=rAC)
  if(verdict0410box){
    verdict0410box.textContent=rawAgrees
      ? `At this A, raw distance and cosine already agree on the closer candidate. Drag A to reproduce the lesson's default case, where they disagree until normalized.`
      : `Raw distance and cosine DISAGREE here on which candidate is closer -- exactly Concept 04's point. Normalized distance agrees with cosine ${agree?'(as it always does, Concept 04 Section 09)':''}.`
  }
}

;[axSlider0410,aySlider0410].forEach(el=>el?.addEventListener('input',render0410))
render0410()
