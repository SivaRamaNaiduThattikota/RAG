const advancedLesson0903=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0903(){if(advancedLesson0903)advancedLesson0903.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0903)
syncAdvancedTarget0903()

// Section 14's lab: The Greedy-Descent Tracer. Steps through this concept's
// own six-point, two-layer toy graph exactly as traced in Section 10 --
// every distance below is copied from that already-verified worked example,
// nothing here is recomputed or interpolated.

const STEPS_0903=[
  {
    layer:'1 (sparse)',
    node:'A (entry point)',
    dist:'5.3151',
    verdict:"Search starts at the fixed entry point, A, in the sparse top layer. Click \"Next step\" to begin the greedy descent."
  },
  {
    layer:'1 (sparse)',
    node:'D',
    dist:'2.0125',
    verdict:"A's only Layer 1 neighbour is D (2.0125), closer to Q than A (5.3151) -- move to D."
  },
  {
    layer:'1 → 0 (descending)',
    node:'D',
    dist:'2.0125',
    verdict:"D's only Layer 1 neighbour is A, already worse. No improving move remains -- Layer 1 terminates at D. Descending to Layer 0, carrying D as the starting point."
  },
  {
    layer:'0 (dense)',
    node:'C',
    dist:'0.2236',
    verdict:"D's Layer 0 neighbours are C (0.2236) and E (4.2485) from Q. C is closer -- move to C."
  },
  {
    layer:'0 (dense)',
    node:'C (final answer)',
    dist:'0.2236',
    verdict:"C's Layer 0 neighbours are B (2.2023) and D (2.0125), both farther from Q than C itself. No improving move remains -- Layer 0's own local minimum is reached. The search returns C, confirmed by brute-force check to be the true nearest neighbour among all six points."
  }
]

const layerBox0903=document.querySelector('#hnswLayer_0903')
const nodeBox0903=document.querySelector('#hnswNode_0903')
const distBox0903=document.querySelector('#hnswDist_0903')
const stepNumBox0903=document.querySelector('#hnswStepNum_0903')
const verdictBox0903=document.querySelector('#hnswVerdict_0903')
const prevBtn0903=document.querySelector('#hnswPrev_0903')
const nextBtn0903=document.querySelector('#hnswNext_0903')

let currentStep0903=0

function render0903(){
  const step=STEPS_0903[currentStep0903]
  if(!step)return

  if(layerBox0903)layerBox0903.textContent=step.layer
  if(nodeBox0903)nodeBox0903.textContent=step.node
  if(distBox0903)distBox0903.textContent=step.dist
  if(stepNumBox0903)stepNumBox0903.textContent=currentStep0903+' of '+(STEPS_0903.length-1)
  if(verdictBox0903){
    verdictBox0903.className=currentStep0903===STEPS_0903.length-1?'callout':'callout'
    verdictBox0903.textContent=step.verdict
  }
  if(prevBtn0903)prevBtn0903.disabled=currentStep0903===0
  if(nextBtn0903)nextBtn0903.disabled=currentStep0903===STEPS_0903.length-1
  if(prevBtn0903)prevBtn0903.classList.toggle('active',false)
  if(nextBtn0903)nextBtn0903.classList.toggle('active',currentStep0903<STEPS_0903.length-1)
}

prevBtn0903?.addEventListener('click',()=>{
  if(currentStep0903>0){currentStep0903-=1;render0903()}
})
nextBtn0903?.addEventListener('click',()=>{
  if(currentStep0903<STEPS_0903.length-1){currentStep0903+=1;render0903()}
})

render0903()
