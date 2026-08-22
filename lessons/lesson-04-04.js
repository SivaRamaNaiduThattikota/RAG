const advancedLesson0404=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0404(){if(advancedLesson0404)advancedLesson0404.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0404)
syncAdvancedTarget0404()

// Section 14's lab: The Distance Calculator -- unlike Concept 03's Similarity
// Calculator (two vectors, one angle), this one carries a query vector Q and
// two candidates, C1 and C2, and reduces all three to Euclidean distance,
// Manhattan distance, and cosine similarity (Concept 03's formula, reused,
// not rebuilt) from Q to each candidate. A raw/normalized toggle demonstrates
// this concept's central fact live: once every vector is rescaled to length
// one (Concept 02's normalization), nearest-by-Euclidean-distance and
// most-similar-by-cosine always agree -- even when they disagree on the raw,
// un-normalized vectors.

const DEFAULT_Q_0404=[3,4]
const DEFAULT_C1_0404=[6,8]
const DEFAULT_C2_0404=[4,3]
const state0404={mode:'raw',q:DEFAULT_Q_0404.slice(),c1:DEFAULT_C1_0404.slice(),c2:DEFAULT_C2_0404.slice()}

const modeToggle0404=document.querySelector('#simModeToggle0404')

const qSliderEls0404=[document.querySelector('#simQ1_0404'),document.querySelector('#simQ2_0404')]
const qOutputEls0404=[document.querySelector('#simQ1Out_0404'),document.querySelector('#simQ2Out_0404')]
const c1SliderEls0404=[document.querySelector('#simC1x_0404'),document.querySelector('#simC1y_0404')]
const c1OutputEls0404=[document.querySelector('#simC1xOut_0404'),document.querySelector('#simC1yOut_0404')]
const c2SliderEls0404=[document.querySelector('#simC2x_0404'),document.querySelector('#simC2y_0404')]
const c2OutputEls0404=[document.querySelector('#simC2xOut_0404'),document.querySelector('#simC2yOut_0404')]

const euclC1Box0404=document.querySelector('#simEuclC1_0404')
const manhC1Box0404=document.querySelector('#simManhC1_0404')
const cosC1Box0404=document.querySelector('#simCosC1_0404')
const euclC2Box0404=document.querySelector('#simEuclC2_0404')
const manhC2Box0404=document.querySelector('#simManhC2_0404')
const cosC2Box0404=document.querySelector('#simCosC2_0404')
const verdictBox0404=document.querySelector('#simVerdict0404')

const visualWrap0404=document.querySelector('#simVisualWrap0404')
const lineQ0404=document.querySelector('#simLineQ0404')
const lineC10404=document.querySelector('#simLineC10404')
const lineC20404=document.querySelector('#simLineC20404')
const labelQ0404=document.querySelector('#simLabelQ0404')
const labelC10404=document.querySelector('#simLabelC10404')
const labelC20404=document.querySelector('#simLabelC20404')
const connC10404=document.querySelector('#simConnC10404')
const connC20404=document.querySelector('#simConnC20404')
const unitCircle0404=document.querySelector('#simUnitCircle0404')
const captionEl0404=document.querySelector('#simCaption0404')
const resetButton0404=document.querySelector('#simReset0404')

function euclidean0404(a,b){return Math.sqrt(a.reduce((sum,x,i)=>sum+(x-b[i])**2,0))}
function manhattan0404(a,b){return a.reduce((sum,x,i)=>sum+Math.abs(x-b[i]),0)}
function norm0404(a){return Math.sqrt(a.reduce((sum,x)=>sum+x*x,0))}
function dot0404(a,b){return a.reduce((sum,x,i)=>sum+x*b[i],0)}
function cosine0404(a,b){
  const denom=norm0404(a)*norm0404(b)
  if(denom===0)return null
  return Math.max(-1,Math.min(1,dot0404(a,b)/denom))
}
function normalizeVec0404(a){
  const n=norm0404(a)
  return n===0?a.slice():a.map(x=>x/n)
}
function fmt0404(x){return Math.round(x*1000)/1000}

function activeVectors0404(){
  if(state0404.mode==='normalized'){
    return [normalizeVec0404(state0404.q),normalizeVec0404(state0404.c1),normalizeVec0404(state0404.c2)]
  }
  return [state0404.q.slice(),state0404.c1.slice(),state0404.c2.slice()]
}

function renderPlane0404(q,c1,c2){
  if(!visualWrap0404)return
  const cx=150,cy=150
  const scale=state0404.mode==='normalized'?95:11
  const toXY=(v)=>[cx+v[0]*scale,cy-v[1]*scale]
  const [xQ,yQ]=toXY(q)
  const [xC1,yC1]=toXY(c1)
  const [xC2,yC2]=toXY(c2)

  if(lineQ0404){lineQ0404.setAttribute('x1',String(cx));lineQ0404.setAttribute('y1',String(cy));lineQ0404.setAttribute('x2',String(xQ));lineQ0404.setAttribute('y2',String(yQ))}
  if(lineC10404){lineC10404.setAttribute('x1',String(cx));lineC10404.setAttribute('y1',String(cy));lineC10404.setAttribute('x2',String(xC1));lineC10404.setAttribute('y2',String(yC1))}
  if(lineC20404){lineC20404.setAttribute('x1',String(cx));lineC20404.setAttribute('y1',String(cy));lineC20404.setAttribute('x2',String(xC2));lineC20404.setAttribute('y2',String(yC2))}

  if(labelQ0404){labelQ0404.setAttribute('x',String(xQ+6));labelQ0404.setAttribute('y',String(yQ-4));labelQ0404.textContent=`Q = (${fmt0404(q[0])}, ${fmt0404(q[1])})`}
  if(labelC10404){labelC10404.setAttribute('x',String(xC1+6));labelC10404.setAttribute('y',String(yC1-4));labelC10404.textContent=`C1 = (${fmt0404(c1[0])}, ${fmt0404(c1[1])})`}
  if(labelC20404){labelC20404.setAttribute('x',String(xC2+6));labelC20404.setAttribute('y',String(yC2-4));labelC20404.textContent=`C2 = (${fmt0404(c2[0])}, ${fmt0404(c2[1])})`}

  if(connC10404){connC10404.setAttribute('x1',String(xQ));connC10404.setAttribute('y1',String(yQ));connC10404.setAttribute('x2',String(xC1));connC10404.setAttribute('y2',String(yC1))}
  if(connC20404){connC20404.setAttribute('x1',String(xQ));connC20404.setAttribute('y1',String(yQ));connC20404.setAttribute('x2',String(xC2));connC20404.setAttribute('y2',String(yC2))}

  if(unitCircle0404){
    if(state0404.mode==='normalized'){
      unitCircle0404.setAttribute('d',`M${cx+scale},${cy} A${scale},${scale} 0 1 0 ${cx-scale},${cy} A${scale},${scale} 0 1 0 ${cx+scale},${cy}`)
      unitCircle0404.style.display=''
    }else{
      unitCircle0404.style.display='none'
    }
  }

  if(captionEl0404){
    captionEl0404.textContent=state0404.mode==='normalized'
      ?'Every vector now sits on the unit circle -- only direction is left. The nearer candidate by the dashed straight-line gap is now also the candidate with the higher cosine similarity.'
      :'Q, C1, and C2 at their raw sizes. The dashed segments are the straight-line (Euclidean) gaps this concept measures -- the shortest one does not have to belong to the candidate with the highest cosine similarity.'
  }
}

function renderReadout0404(){
  const [q,c1,c2]=activeVectors0404()
  const euclC1=euclidean0404(q,c1)
  const euclC2=euclidean0404(q,c2)
  const manhC1=manhattan0404(q,c1)
  const manhC2=manhattan0404(q,c2)
  // cosine similarity is scale-invariant -- normalizing the inputs never
  // changes it, so it's always computed from the raw stored vectors
  const cosC1=cosine0404(state0404.q,state0404.c1)
  const cosC2=cosine0404(state0404.q,state0404.c2)

  if(euclC1Box0404)euclC1Box0404.textContent=euclC1.toFixed(3)
  if(euclC2Box0404)euclC2Box0404.textContent=euclC2.toFixed(3)
  if(manhC1Box0404)manhC1Box0404.textContent=manhC1.toFixed(3)
  if(manhC2Box0404)manhC2Box0404.textContent=manhC2.toFixed(3)
  if(cosC1Box0404)cosC1Box0404.textContent=cosC1===null?'undefined':cosC1.toFixed(3)
  if(cosC2Box0404)cosC2Box0404.textContent=cosC2===null?'undefined':cosC2.toFixed(3)

  let nearestLabel='tie'
  if(euclC1<euclC2)nearestLabel='C1'
  else if(euclC2<euclC1)nearestLabel='C2'

  let similarLabel='tie'
  if(cosC1!==null&&cosC2!==null){
    if(cosC1>cosC2)similarLabel='C1'
    else if(cosC2>cosC1)similarLabel='C2'
  }

  if(verdictBox0404){
    const agree=nearestLabel===similarLabel
    const modeWord=state0404.mode==='normalized'?'Normalized':'Raw'
    verdictBox0404.textContent=`${modeWord} vectors -- nearest by Euclidean distance: ${nearestLabel}. Most similar by cosine: ${similarLabel}. ${agree?'They agree.':'They disagree.'}`
    verdictBox0404.classList.toggle('warning',!agree)
  }
  renderPlane0404(q,c1,c2)
}

function setMode0404(mode){
  state0404.mode=mode
  if(modeToggle0404)modeToggle0404.querySelectorAll('button').forEach(button=>{
    button.classList.toggle('active',button.dataset.mode===mode)
  })
  renderReadout0404()
}

function wireSliderGroup0404(sliderEls,outputEls,vectorKey){
  sliderEls.forEach((slider,index)=>{
    if(!slider)return
    slider.addEventListener('input',()=>{
      state0404[vectorKey][index]=Number(slider.value)
      if(outputEls[index])outputEls[index].textContent=slider.value
      renderReadout0404()
    })
  })
}

wireSliderGroup0404(qSliderEls0404,qOutputEls0404,'q')
wireSliderGroup0404(c1SliderEls0404,c1OutputEls0404,'c1')
wireSliderGroup0404(c2SliderEls0404,c2OutputEls0404,'c2')

if(modeToggle0404)modeToggle0404.querySelectorAll('button').forEach(button=>{
  button.addEventListener('click',()=>setMode0404(button.dataset.mode))
})

if(resetButton0404)resetButton0404.addEventListener('click',()=>{
  state0404.q=DEFAULT_Q_0404.slice()
  state0404.c1=DEFAULT_C1_0404.slice()
  state0404.c2=DEFAULT_C2_0404.slice()
  qSliderEls0404.forEach((slider,index)=>{
    if(!slider)return
    slider.value=String(state0404.q[index])
    if(qOutputEls0404[index])qOutputEls0404[index].textContent=String(state0404.q[index])
  })
  c1SliderEls0404.forEach((slider,index)=>{
    if(!slider)return
    slider.value=String(state0404.c1[index])
    if(c1OutputEls0404[index])c1OutputEls0404[index].textContent=String(state0404.c1[index])
  })
  c2SliderEls0404.forEach((slider,index)=>{
    if(!slider)return
    slider.value=String(state0404.c2[index])
    if(c2OutputEls0404[index])c2OutputEls0404[index].textContent=String(state0404.c2[index])
  })
  setMode0404('raw')
})

renderReadout0404()
