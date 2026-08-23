const advancedLesson0809=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0809(){if(advancedLesson0809)advancedLesson0809.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0809)
syncAdvancedTarget0809()

// Section 14's lab: The Shared-Space Switch. Four fixed, already-verified
// vector pairs (Section 10's own worked numbers), swapped via two
// independent button groups. Cosine recomputes live from the vectors,
// not a hardcoded lookup, matching this course's established pattern.

const SCENARIOS_0809={
  crosslingual:{
    label:'Cross-lingual query', targetLabel:'D_doc (English document)',
    target:[0.62,0.78],
    general:{vec:[0.20,-0.30], label:'Q_mono (English-only model)'},
    specialized:{vec:[0.65,0.76], label:'Q_multi (multilingual model)'},
  },
  domain:{
    label:'Domain jargon term', targetLabel:'D_legal (true contract-clause meaning)',
    target:[0.75,0.45],
    general:{vec:[-0.49,0.81], label:'V_general (general model)'},
    specialized:{vec:[0.71,0.52], label:'V_domain (domain-tuned model)'},
  },
}

function dot0809(a,b){return a[0]*b[0]+a[1]*b[1]}
function norm0809(a){return Math.sqrt(dot0809(a,a))}
function cosine0809(a,b){return dot0809(a,b)/(norm0809(a)*norm0809(b))}

const ORIGIN_X_0809=160, ORIGIN_Y_0809=220, PLANE_SCALE_0809=130

function svgX0809(x){return ORIGIN_X_0809+PLANE_SCALE_0809*x}
function svgY0809(y){return ORIGIN_Y_0809-PLANE_SCALE_0809*y}

const scenarioButtons0809=[...document.querySelectorAll('#s14 [data-scenario]')]
const modelButtons0809=[...document.querySelectorAll('#s14 [data-model]')]
const targetArrow0809=document.querySelector('#targetArrow_0809')
const candidateArrow0809=document.querySelector('#candidateArrow_0809')
const readout0809=document.querySelector('#switchReadout_0809')
const verdict0809=document.querySelector('#switchVerdict_0809')

let currentScenario0809='crosslingual'
let currentModel0809='specialized'

function syncButtons0809(){
  scenarioButtons0809.forEach(btn=>btn.classList.toggle('active',btn.dataset.scenario===currentScenario0809))
  modelButtons0809.forEach(btn=>btn.classList.toggle('active',btn.dataset.model===currentModel0809))
}

function render0809(){
  const scenario=SCENARIOS_0809[currentScenario0809]
  const candidate=scenario[currentModel0809]
  const cos=cosine0809(candidate.vec,scenario.target)

  if(targetArrow0809){
    targetArrow0809.setAttribute('x2',svgX0809(scenario.target[0]))
    targetArrow0809.setAttribute('y2',svgY0809(scenario.target[1]))
  }
  if(candidateArrow0809){
    candidateArrow0809.setAttribute('x2',svgX0809(candidate.vec[0]))
    candidateArrow0809.setAttribute('y2',svgY0809(candidate.vec[1]))
  }

  if(readout0809){
    readout0809.innerHTML=`
      <div><span>SCENARIO</span><b>${scenario.label}</b></div>
      <div><span>TARGET</span><b>${scenario.targetLabel} = (${scenario.target[0].toFixed(2)}, ${scenario.target[1].toFixed(2)})</b></div>
      <div><span>CANDIDATE</span><b>${candidate.label} = (${candidate.vec[0].toFixed(2)}, ${candidate.vec[1].toFixed(2)})</b></div>
      <div><span>COSINE SIMILARITY</span><b>${cos.toFixed(6)}</b></div>
    `
  }

  if(verdict0809){
    let label,text
    if(cos>0.9){label='NEAR-PERFECT ALIGNMENT';text=`${cos.toFixed(6)} -- the candidate sits almost exactly where the target does.`}
    else if(cos>0.15){label='PARTIAL MATCH';text=`${cos.toFixed(6)} -- some real alignment, but far from the target.`}
    else if(cos>=-0.15){label='ESSENTIALLY ORTHOGONAL';text=`${cos.toFixed(6)} -- no meaningful relationship at all.`}
    else{label='NEGATIVE -- WORSE THAN UNRELATED';text=`${cos.toFixed(6)} -- the candidate points mostly AWAY from the target.`}
    verdict0809.innerHTML=`<b>${label}</b> ${text}`
  }
}

scenarioButtons0809.forEach(btn=>btn.addEventListener('click',()=>{
  currentScenario0809=btn.dataset.scenario
  syncButtons0809()
  render0809()
}))
modelButtons0809.forEach(btn=>btn.addEventListener('click',()=>{
  currentModel0809=btn.dataset.model
  syncButtons0809()
  render0809()
}))

syncButtons0809()
render0809()
