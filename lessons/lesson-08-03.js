const advancedLesson0803=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0803(){if(advancedLesson0803)advancedLesson0803.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0803)
syncAdvancedTarget0803()

// Section 14's lab: The Precomputed Shelf. Two document vectors are built
// ONCE, at load, from Concept 02's own tokenize -> embed -> contextualize
// (Attention(Q,K,V)=softmax(QK^T/sqrt(d_k))V, Q=K=V=own base vector, d_k=2,
// scale=sqrt(2)) -> pool pipeline, then frozen in consts and never
// recomputed. Only the query side rebuilds live on toggle -- that
// frozen-vs-rebuilt contrast is the bi-encoder lesson made interactive.
// All numbers were independently triple-verified (two Node.js scripts,
// one Python script) before this file was written.

function dot0803(a,b){return a[0]*b[0]+a[1]*b[1]}
function softmax0803(arr){
  const m=Math.max(...arr)
  const exps=arr.map(x=>Math.exp(x-m))
  const sum=exps.reduce((s,x)=>s+x,0)
  return exps.map(x=>x/sum)
}
function euclid0803(a,b){return Math.sqrt((a[0]-b[0])**2+(a[1]-b[1])**2)}
function cosine0803(a,b){
  const dp=dot0803(a,b)
  const na=Math.sqrt(dot0803(a,a))
  const nb=Math.sqrt(dot0803(b,b))
  return dp/(na*nb)
}

const SCALE_0803=Math.sqrt(2)

function contextualizeAndPool0803(tokens,embedMap){
  const vecs=tokens.map(t=>{
    const scores=tokens.map(tj=>dot0803(embedMap[t],embedMap[tj])/SCALE_0803)
    const weights=softmax0803(scores)
    let cx=0,cy=0
    tokens.forEach((tj,j)=>{cx+=weights[j]*embedMap[tj][0]; cy+=weights[j]*embedMap[tj][1]})
    return [cx,cy]
  })
  const n=vecs.length
  const px=vecs.reduce((s,v)=>s+v[0],0)/n
  const py=vecs.reduce((s,v)=>s+v[1],0)/n
  return [px,py]
}

// Frozen, precomputed once at load -- the document side of the shelf.
const DOC1_EMBED_0803={the:[0.10,0.10],order:[2.00,0.40],shipped:[1.80,1.90],late:[0.30,2.10]}
const DOC2_EMBED_0803={refund:[-1.60,0.50],policy:[-0.40,-1.50],updated:[0.60,-1.70]}
const DOC1_VEC_0803=contextualizeAndPool0803(['the','order','shipped','late'],DOC1_EMBED_0803)
const DOC2_VEC_0803=contextualizeAndPool0803(['refund','policy','updated'],DOC2_EMBED_0803)

// Query-side embeds -- rebuilt live on every toggle click.
const EMBED_Q_0803={'query:':[0.05,0.05],order:[2.00,0.40],late:[0.30,2.10]}
const QUERY_TOKENS_0803={
  plain:['order','late'],
  prefixed:['query:','order','late']
}

const modeButtons0803=[...document.querySelectorAll('#s14 .lab-actions [data-mode]')]
const readout0803=document.querySelector('#queryReadout_0803')
const barsWrap0803=document.querySelector('#matchBars_0803')
const verdict0803=document.querySelector('#matchVerdict_0803')

let currentMode0803='plain'

function syncButtons0803(){
  modeButtons0803.forEach(btn=>btn.classList.toggle('active',btn.dataset.mode===currentMode0803))
}

function render0803(){
  const otherMode=currentMode0803==='plain'?'prefixed':'plain'
  const currentQVec=contextualizeAndPool0803(QUERY_TOKENS_0803[currentMode0803],EMBED_Q_0803)
  const otherQVec=contextualizeAndPool0803(QUERY_TOKENS_0803[otherMode],EMBED_Q_0803)
  const shift=euclid0803(currentQVec,otherQVec)

  const cosDoc1=cosine0803(currentQVec,DOC1_VEC_0803)
  const cosDoc2=cosine0803(currentQVec,DOC2_VEC_0803)
  const doc1Wins=cosDoc1>=cosDoc2

  if(readout0803){
    readout0803.innerHTML=`
      <div><span>QUERY TOKENS</span><b>${QUERY_TOKENS_0803[currentMode0803].join(', ')}</b></div>
      <div><span>QUERY VECTOR</span><b>(${currentQVec[0].toFixed(4)}, ${currentQVec[1].toFixed(4)})</b></div>
      <div><span>SHIFT VS. OTHER MODE</span><b>${shift.toFixed(4)}</b></div>
    `
  }

  if(barsWrap0803){
    const rows=[
      {label:'"The order shipped late" (doc1)',cos:cosDoc1,winner:doc1Wins},
      {label:'"Refund policy updated" (doc2)',cos:cosDoc2,winner:!doc1Wins}
    ]
    barsWrap0803.innerHTML=rows.map(r=>{
      const pct=(((r.cos+1)/2)*100).toFixed(2)
      return `<div class="prob-row${r.winner?' winner':''}">
        <span class="token-label">${r.label}</span>
        <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
        <b>${r.cos.toFixed(4)}</b>
      </div>`
    }).join('')
  }

  if(verdict0803){
    verdict0803.className='callout'
    const modeLabel=currentMode0803==='plain'?'"order late"':'"query: order late"'
    verdict0803.innerHTML=`<b>Query mode ${modeLabel}:</b> cosine to doc1 = ${cosDoc1.toFixed(4)}, cosine to doc2 = ${cosDoc2.toFixed(4)}. Neither document vector moved -- they were frozen at index time. Only the query vector rebuilt, shifting by ${shift.toFixed(4)} versus the other toggle state -- and the ranking did not flip; doc1 still wins.</b>`
  }
}

modeButtons0803.forEach(btn=>btn.addEventListener('click',()=>{
  currentMode0803=btn.dataset.mode
  syncButtons0803()
  render0803()
}))

syncButtons0803()
render0803()
