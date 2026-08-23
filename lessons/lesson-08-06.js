const advancedLesson0806=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0806(){if(advancedLesson0806)advancedLesson0806.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0806)
syncAdvancedTarget0806()

// Section 14's lab: The Pooling Bench. The four base contextualized
// vectors are Concept 02's own already-verified numbers, reused
// unchanged. Pooling and normalization recompute live from the button
// choices, reusing the exact formulas verified in Section 10.

const TOKENS_0806={the:[1.1029,1.1812],order:[1.7468,1.2292],shipped:[1.6010,1.7274],late:[1.0859,1.8722]}

function dot0806(a,b){return a[0]*b[0]+a[1]*b[1]}
function norm0806(a){return Math.sqrt(dot0806(a,a))}
function cosine0806(a,b){return dot0806(a,b)/(norm0806(a)*norm0806(b))}
function euclid0806(a,b){return Math.sqrt((a[0]-b[0])**2+(a[1]-b[1])**2)}
function normalize0806(a){const n=norm0806(a);return [a[0]/n,a[1]/n]}

function poolOutput0806(strategy){
  if(strategy==='mean'){
    const vecs=Object.values(TOKENS_0806)
    return [vecs.reduce((s,v)=>s+v[0],0)/vecs.length, vecs.reduce((s,v)=>s+v[1],0)/vecs.length]
  }
  if(strategy==='first')return TOKENS_0806.the
  return TOKENS_0806.late
}

const poolButtons0806=[...document.querySelectorAll('#s14 [data-pool]')]
const normButtons0806=[...document.querySelectorAll('#s14 [data-normalize]')]
const chipsWrap0806=document.querySelector('#poolChips_0806')
const outputWrap0806=document.querySelector('#poolOutput_0806')
const readout0806=document.querySelector('#poolReadout_0806')
const verdict0806=document.querySelector('#poolVerdict_0806')

let currentPool0806='mean'
let currentNormalize0806=false

function syncButtons0806(){
  poolButtons0806.forEach(btn=>btn.classList.toggle('active',btn.dataset.pool===currentPool0806))
  normButtons0806.forEach(btn=>btn.classList.toggle('active',btn.dataset.normalize===(currentNormalize0806?'on':'off')))
}

function includedSet0806(strategy){
  if(strategy==='mean')return new Set(['the','order','shipped','late'])
  if(strategy==='first')return new Set(['the'])
  return new Set(['late'])
}

function render0806(){
  const included=includedSet0806(currentPool0806)
  if(chipsWrap0806){
    chipsWrap0806.innerHTML=Object.entries(TOKENS_0806).map(([name,vec])=>{
      const isIn=included.has(name)
      const weight=currentPool0806==='mean'?'weight 1/4':isIn?'weight 1':'discarded'
      return `<span class="rank-chip${isIn?' match':' excluded'}">${name} (${vec[0].toFixed(4)}, ${vec[1].toFixed(4)}) — ${weight}</span>`
    }).join('')
  }

  const output=poolOutput0806(currentPool0806)
  const outNorm=norm0806(output)

  if(outputWrap0806){
    outputWrap0806.innerHTML=`
      <div><span>POOLED OUTPUT</span><b>(${output[0].toFixed(6)}, ${output[1].toFixed(6)})</b></div>
      <div><span>NORM</span><b>${outNorm.toFixed(6)}</b></div>
    `
  }

  const rows=Object.entries(TOKENS_0806).map(([name,vec])=>({
    name, cos:cosine0806(output,vec), eucl:euclid0806(output,vec),
  }))

  let normLine=''
  if(currentNormalize0806){
    const outHat=normalize0806(output)
    const lateHat=normalize0806(TOKENS_0806.late)
    const dotVal=dot0806(outHat,lateHat)
    const cosVal=cosine0806(output,TOKENS_0806.late)
    normLine=`<div><span>NORMALIZED OUTPUT</span><b>(${outHat[0].toFixed(6)}, ${outHat[1].toFixed(6)}) — norm ${norm0806(outHat).toFixed(6)}</b></div>
      <div><span>dot(normalized, normalized "late")</span><b>${dotVal.toFixed(6)}</b></div>
      <div><span>cosine(output, "late") — for comparison</span><b>${cosVal.toFixed(6)}</b></div>`
  }

  if(readout0806){
    readout0806.innerHTML=`
      ${rows.map(r=>`<div><span>cos / eucl to "${r.name}"</span><b>${r.cos.toFixed(6)} / ${r.eucl.toFixed(6)}</b></div>`).join('')}
      ${normLine}
    `
  }

  if(verdict0806){
    if(currentNormalize0806){
      verdict0806.innerHTML=`<b>NORMALIZED — DOT EQUALS COSINE</b> Once the output and "late" are both rescaled to unit length, their plain dot product (${dot0806(normalize0806(output),normalize0806(TOKENS_0806.late)).toFixed(6)}) matches their cosine similarity (${cosine0806(output,TOKENS_0806.late).toFixed(6)}) exactly -- no separate division step needed.`
    }else{
      const label=currentPool0806==='mean'?'MEAN pooling averages all 4 tokens':currentPool0806==='first'?'FIRST-TOKEN pooling keeps only "the" (illustrative CLS stand-in, not a real trained CLS vector)':'LAST-TOKEN pooling keeps only "late" (valid under causal attention)'
      verdict0806.innerHTML=`<b>RAW VECTORS</b> ${label}. Toggle normalization to see the dot-product-equals-cosine proof live.`
    }
  }
}

poolButtons0806.forEach(btn=>btn.addEventListener('click',()=>{
  currentPool0806=btn.dataset.pool
  syncButtons0806()
  render0806()
}))
normButtons0806.forEach(btn=>btn.addEventListener('click',()=>{
  currentNormalize0806=btn.dataset.normalize==='on'
  syncButtons0806()
  render0806()
}))

syncButtons0806()
render0806()
