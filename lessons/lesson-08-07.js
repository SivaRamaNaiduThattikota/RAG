const advancedLesson0807=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0807(){if(advancedLesson0807)advancedLesson0807.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0807)
syncAdvancedTarget0807()

// Section 14's lab: The Anisotropy Cone Widener. Scales the same four
// words' relative angular offsets by a continuous cone-width slider W,
// where s = W/13 and angle_i = 20 + s*offset_i. At W=13 this reproduces
// the lesson's own Part 1 mean cosine (0.990608) exactly. Every value
// recomputes live; a normalize toggle proves the mean never changes.

const OFFSETS_0807={cello:0,pizza:5,tax:9,orbit:13}
const MAGS_0807={cello:1.1,pizza:1.4,tax:1.8,orbit:2.1}
const ORIGIN_X_0807=160, ORIGIN_Y_0807=220, PLANE_SCALE_0807=55

function toRad0807(d){return d*Math.PI/180}
function dot0807(a,b){return a[0]*b[0]+a[1]*b[1]}
function norm0807(a){return Math.sqrt(dot0807(a,a))}
function cosine0807(a,b){return dot0807(a,b)/(norm0807(a)*norm0807(b))}
function normalize0807(a){const n=norm0807(a);return [a[0]/n,a[1]/n]}

function vectorsAt0807(W){
  const s=W/13
  const vecs={}
  for(const k of Object.keys(OFFSETS_0807)){
    const angle=toRad0807(20+s*OFFSETS_0807[k])
    vecs[k]=[MAGS_0807[k]*Math.cos(angle), MAGS_0807[k]*Math.sin(angle)]
  }
  return vecs
}

const slider0807=document.querySelector('#wgConeWidth_0807')
const sliderOut0807=document.querySelector('#wgConeWidthOut_0807')
const normButtons0807=[...document.querySelectorAll('#s14 [data-normalize]')]
const readout0807=document.querySelector('#wgConeReadout_0807')
const verdict0807=document.querySelector('#wgConeVerdict_0807')
const arrows0807={
  cello: document.querySelector('#arrowCello_0807'),
  pizza: document.querySelector('#arrowPizza_0807'),
  tax: document.querySelector('#arrowTax_0807'),
  orbit: document.querySelector('#arrowOrbit_0807'),
}

let currentNormalize0807=false

function syncButtons0807(){
  normButtons0807.forEach(btn=>btn.classList.toggle('active',btn.dataset.normalize===(currentNormalize0807?'on':'off')))
}

function render0807(){
  const W=Number(slider0807.value)
  if(sliderOut0807)sliderOut0807.textContent=W+'°'

  const vecs=vectorsAt0807(W)
  const names=Object.keys(vecs)
  let sum=0,count=0
  for(let i=0;i<names.length;i++)for(let j=i+1;j<names.length;j++){sum+=cosine0807(vecs[names[i]],vecs[names[j]]);count++}
  const mean=sum/count

  // Draw either raw or normalized (unit-length) arrows -- the displayed
  // MEAN is identical either way, only the drawing changes.
  for(const name of names){
    const el=arrows0807[name]
    if(!el)continue
    const drawVec=currentNormalize0807?normalize0807(vecs[name]):vecs[name]
    const x2=ORIGIN_X_0807+PLANE_SCALE_0807*drawVec[0]
    const y2=ORIGIN_Y_0807-PLANE_SCALE_0807*drawVec[1]
    el.setAttribute('x2',x2)
    el.setAttribute('y2',y2)
  }

  if(readout0807){
    readout0807.innerHTML=`
      <div><span>CONE WIDTH</span><b>${W}°</b></div>
      <div><span>MEAN PAIRWISE COSINE (4 UNRELATED WORDS)</span><b>${mean.toFixed(6)}</b></div>
      <div><span>NORMALIZED?</span><b>${currentNormalize0807?'yes -- mean unchanged':'no'}</b></div>
    `
  }

  if(verdict0807){
    let label,text
    if(mean>0.85){label='ANISOTROPIC';text=`Narrow cone -- baseline artificially inflated (${mean.toFixed(6)}) for words that share no meaning at all.`}
    else if(mean>=-0.15){label='NEAR-ISOTROPIC';text=`Baseline (${mean.toFixed(6)}) sits close to what unrelated words should show under genuine isotropy.`}
    else{label='SPREAD PAST ISOTROPIC';text=`Baseline (${mean.toFixed(6)}) has moved past isotropic -- some pairs now point away from each other.`}
    verdict0807.innerHTML=`<b>${label}</b> ${text} ${currentNormalize0807?'Toggling normalization redrew the arrows at unit length but left this exact number unchanged -- proof normalizing cannot touch anisotropy.':''}`
  }
}

normButtons0807.forEach(btn=>btn.addEventListener('click',()=>{
  currentNormalize0807=btn.dataset.normalize==='on'
  syncButtons0807()
  render0807()
}))
slider0807?.addEventListener('input',render0807)

syncButtons0807()
render0807()
