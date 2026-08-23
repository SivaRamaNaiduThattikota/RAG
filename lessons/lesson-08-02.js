const advancedLesson0802=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0802(){if(advancedLesson0802)advancedLesson0802.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0802)
syncAdvancedTarget0802()

// Section 14's lab: The Sharpness Dial. A continuous, live-recomputed
// softmax-temperature slider layered under a token picker, running real
// scaled dot-product attention in the browser (Module 02 Concept 04's own
// Attention(Q,K,V)=softmax(QK^T/sqrt(d_k))V formula, Q=K=V=the token's own
// base vector, a stated simplification). Base vectors and scores were
// computed once via three independently-structured Node.js scripts that
// matched to 4 decimals; only the live softmax/temperature step runs here.

const VECS_0802={the:[0.10,0.10],order:[2.00,0.40],shipped:[1.80,1.90],late:[0.30,2.10]}
const TOKENS_0802=Object.keys(VECS_0802)
const SCALE_0802=Math.sqrt(2)

function dot0802(a,b){return a[0]*b[0]+a[1]*b[1]}
function softmax0802(arr){
  const m=Math.max(...arr)
  const exps=arr.map(x=>Math.exp(x-m))
  const sum=exps.reduce((s,x)=>s+x,0)
  return exps.map(x=>x/sum)
}
function euclid0802(a,b){return Math.sqrt((a[0]-b[0])**2+(a[1]-b[1])**2)}

const BASE_SCORES_0802={}
TOKENS_0802.forEach(ti=>{
  BASE_SCORES_0802[ti]=TOKENS_0802.map(tj=>dot0802(VECS_0802[ti],VECS_0802[tj])/SCALE_0802)
})

const tokenButtons0802=[...document.querySelectorAll('#s14 .lab-actions [data-token]')]
const tempSlider0802=document.querySelector('#sharpnessTemp_0802')
const tempOut0802=document.querySelector('#sharpnessTempOut_0802')
const barsWrap0802=document.querySelector('#sharpnessBars_0802')
const readout0802=document.querySelector('#sharpnessReadout_0802')
const verdict0802=document.querySelector('#sharpnessVerdict_0802')

let currentToken0802='shipped'

function syncButtons0802(){
  tokenButtons0802.forEach(btn=>btn.classList.toggle('active',btn.dataset.token===currentToken0802))
}

function render0802(){
  const T=Number(tempSlider0802.value)
  if(tempOut0802)tempOut0802.textContent=T.toFixed(2)

  const scaled=BASE_SCORES_0802[currentToken0802].map(s=>s/T)
  const weights=softmax0802(scaled)
  let cx=0,cy=0
  TOKENS_0802.forEach((tj,j)=>{cx+=weights[j]*VECS_0802[tj][0]; cy+=weights[j]*VECS_0802[tj][1]})
  const contextualized=[cx,cy]
  const moved=euclid0802(VECS_0802[currentToken0802],contextualized)
  const maxIdx=weights.indexOf(Math.max(...weights))
  const attendsMost=TOKENS_0802[maxIdx]

  if(barsWrap0802){
    barsWrap0802.innerHTML=TOKENS_0802.map((tj,j)=>{
      const pct=(weights[j]*100).toFixed(2)
      const isWinner=j===maxIdx
      return `<div class="prob-row${isWinner?' winner':''}">
        <span class="token-label">${tj}</span>
        <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
        <b>${pct}%</b>
      </div>`
    }).join('')
  }

  if(readout0802){
    readout0802.innerHTML=`
      <div><span>SELF-ATTENTION WEIGHT</span><b>${(weights[TOKENS_0802.indexOf(currentToken0802)]*100).toFixed(2)}%</b></div>
      <div><span>ATTENDS MOST TO</span><b>${attendsMost}</b></div>
      <div><span>MOVED (EUCLIDEAN)</span><b>${moved.toFixed(4)}</b></div>
    `
  }

  if(verdict0802){
    verdict0802.className='callout'
    if(T<=0.4){
      verdict0802.innerHTML=`<b>Sharp, near one-hot limit.</b> At T=${T.toFixed(2)}, ${currentToken0802} attends almost entirely to a single token -- the weight distribution collapses toward a hard selection rather than a blend.`
    }else if(T>=3.0){
      verdict0802.innerHTML=`<b>Flat, near-uniform limit.</b> At T=${T.toFixed(2)}, ${currentToken0802}'s weights flatten toward an equal blend of all four tokens -- structurally the same move Concept 08's own toy contextualize() made by hard-coding one fixed 50/50 split for every token, regardless of content. Real embedding models don't run at a fixed high temperature; the sharp, content-specific weights at T=1 are what a trained encoder actually produces.`
    }else{
      verdict0802.innerHTML=`<b>T=${T.toFixed(2)}, close to the untouched default (T=1).</b> ${currentToken0802} attends most to ${attendsMost} (${(weights[maxIdx]*100).toFixed(2)}%) -- a real, content-specific weight pattern, not a fixed global blend.`
    }
  }
}

tokenButtons0802.forEach(btn=>btn.addEventListener('click',()=>{
  currentToken0802=btn.dataset.token
  syncButtons0802()
  render0802()
}))
tempSlider0802?.addEventListener('input',render0802)

syncButtons0802()
render0802()
