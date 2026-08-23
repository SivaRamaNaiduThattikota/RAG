const advancedLesson0701=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0701(){if(advancedLesson0701)advancedLesson0701.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0701)
syncAdvancedTarget0701()

// Section 14's lab: The Single-Vector Squeeze. Two independent panels share
// one lab: a topic-count slider drives an auto-generated N-vector compass
// (failure mode b, dilution) and a document-length slider plus a cap toggle
// drives a two-color token bar (failure mode a, truncation). Neither panel
// depends on the other -- that independence is itself the point Section 15
// makes: a bigger cap never touches dilution, and fewer topics never touches
// truncation.

const ZERO_EPS_0701=1e-9

const topicsSlider0701=document.querySelector('#sqTopics_0701')
const topicsOut0701=document.querySelector('#sqTopicsOut_0701')
const capToggle0701=document.querySelector('#sqCapToggle_0701')
const docLenSlider0701=document.querySelector('#sqDocLen_0701')
const docLenOut0701=document.querySelector('#sqDocLenOut_0701')
const tokenBarWrap0701=document.querySelector('#sqTokenBarWrap_0701')
const tokenReadout0701=document.querySelector('#sqTokenReadout_0701')
const compassWrap0701=document.querySelector('#sqCompassWrap_0701')
const cosReadout0701=document.querySelector('#sqCosReadout_0701')
const verdict0701=document.querySelector('#sqVerdict_0701')

let currentCap0701=512

// --- Failure mode (a): truncation, driven by docLen + cap -----------------

function renderTokenBar0701(){
  const docLen=docLenSlider0701?Number(docLenSlider0701.value):7000
  if(docLenOut0701)docLenOut0701.textContent=docLen.toLocaleString()

  const kept=Math.min(docLen,currentCap0701)
  const lost=Math.max(0,docLen-currentCap0701)
  const pctLost=(lost/docLen)*100
  const keptPct=(kept/docLen)*100
  const lostPct=100-keptPct

  if(tokenBarWrap0701){
    tokenBarWrap0701.innerHTML=`
      <div class="token-bar" role="img" aria-label="${kept.toLocaleString()} tokens kept, ${lost.toLocaleString()} tokens lost to truncation">
        <div class="kept" style="width:${keptPct}%"></div>
        <div class="lost" style="width:${lostPct}%"></div>
      </div>
      <div class="token-bar-legend">
        <span><i class="sw-kept"></i>kept (embedded)</span>
        <span><i class="sw-lost"></i>lost (silently truncated)</span>
      </div>
    `
  }
  if(tokenReadout0701){
    tokenReadout0701.innerHTML=`<b>${kept.toLocaleString()} kept</b> / <b>${lost.toLocaleString()} lost</b> (${pctLost.toFixed(2)}% lost) -- embedding cap ${currentCap0701.toLocaleString()} tokens, document ${docLen.toLocaleString()} tokens`
  }
}

if(capToggle0701)capToggle0701.querySelectorAll('button').forEach(button=>{
  button.addEventListener('click',()=>{
    currentCap0701=Number(button.dataset.cap)
    capToggle0701.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b===button))
    renderTokenBar0701()
  })
})
docLenSlider0701?.addEventListener('input',renderTokenBar0701)

// --- Failure mode (b): dilution, driven by topic count ---------------------

// Topic i's toy 2D unit vector sits at angle i * 90 degrees, i = 0..N-1.
// The query is fixed at angle 0 (Topic 1's own direction), so cosine
// similarity to Topic 1 alone is always exactly 1.0 by construction.
function meanVector0701(n){
  let x=0,y=0
  for(let i=0;i<n;i++){
    const angle=i*90*Math.PI/180
    x+=Math.cos(angle)
    y+=Math.sin(angle)
  }
  return {x:x/n,y:y/n}
}

function renderCompass0701(n){
  const mean=meanVector0701(n)
  const norm=Math.sqrt(mean.x*mean.x+mean.y*mean.y)
  const isZero=norm<ZERO_EPS_0701
  const cx=130,cy=130,r=90

  let spokes=''
  for(let i=0;i<n;i++){
    const angle=i*90*Math.PI/180
    const x=cx+r*Math.cos(angle)
    const y=cy-r*Math.sin(angle)
    spokes+=`<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="#8a978f" stroke-width="1.5"/>`
    spokes+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4" fill="#fff" stroke="#14241f" stroke-width="2"/>`
    spokes+=`<text x="${x.toFixed(1)}" y="${(y-8).toFixed(1)}" font-size="8" text-anchor="middle" fill="#14241f" font-family="DM Mono, monospace">Topic ${i+1}</text>`
  }

  const queryEnd={x:cx+r*0.8,y:cy}
  const queryArrow=`<line x1="${cx}" y1="${cy}" x2="${queryEnd.x}" y2="${queryEnd.y}" stroke="#14241f" stroke-width="2" stroke-dasharray="2 4"/><text x="${queryEnd.x+4}" y="${queryEnd.y+4}" font-size="8" fill="#14241f" font-family="DM Mono, monospace">query</text>`

  let meanArrow=''
  if(!isZero){
    const nx=mean.x/norm,ny=mean.y/norm
    const ex=cx+r*nx,ey=cy-r*ny
    meanArrow=`<line x1="${cx}" y1="${cy}" x2="${ex.toFixed(1)}" y2="${ey.toFixed(1)}" stroke="#ff7957" stroke-width="3"/><circle cx="${ex.toFixed(1)}" cy="${ey.toFixed(1)}" r="5" fill="#ff7957" stroke="#14241f" stroke-width="1.5"/><text x="${(ex+6).toFixed(1)}" y="${(ey-4).toFixed(1)}" font-size="8.5" font-weight="700" fill="#ff7957" font-family="DM Mono, monospace">document vector</text>`
  }

  if(compassWrap0701){
    compassWrap0701.innerHTML=`
      <svg class="vector-plane" viewBox="0 0 260 260" role="img" aria-label="A compass of ${n} topic vector${n===1?'':'s'} and their combined document vector">
        <line x1="20" y1="130" x2="240" y2="130" stroke="#ccd2ca" stroke-width="1"/>
        <line x1="130" y1="20" x2="130" y2="240" stroke="#ccd2ca" stroke-width="1"/>
        ${spokes}
        ${queryArrow}
        ${meanArrow}
      </svg>
      ${isZero?'<div class="zero-vector-message">This vector has canceled to nothing — cosine similarity is undefined. Every topic pulled in a different direction and none of them survived.</div>':''}
    `
  }
  return {isZero,cos:isZero?null:(mean.x/norm)} // query is (1,0), so cos(q,mean_normalized) = mean.x/norm
}

function verdictHtml0701(n,cos){
  if(n===1)return `<b>N = 1 · informational.</b> One topic, nothing to average against -- the document vector IS the topic vector. Cosine similarity to the query stays at 1.0000.`
  if(n===2)return `<b>N = 2 · cautionary.</b> Two distinct topics averaged into one vector. Cosine similarity to a Topic 1 query drops from 1.0000 to ${cos.toFixed(4)} -- a ${((1-cos)*100).toFixed(2)}% relative loss, purely from dilution. Nothing was computed wrong; averaging two legitimate topics geometrically pulls the vector toward their midpoint.`
  if(n===3)return `<b>N = 3 · cautionary.</b> The mean vector is still well-defined and nonzero, but it now sits exactly orthogonal to a Topic 1 query -- cosine similarity is ${cos.toFixed(4)}. A query that would perfectly match a Topic-1-only chunk retrieves nothing from this document at all.`
  return `<b>N = 4 · critical.</b> This vector has canceled to nothing — cosine similarity is undefined. Every topic pulled in a different direction and none of them survived. A bigger embedding model never fixes this; it is a property of averaging, not of capacity.`
}

function renderSqueeze0701(){
  const n=topicsSlider0701?Number(topicsSlider0701.value):2
  if(topicsOut0701)topicsOut0701.textContent=String(n)

  const {isZero,cos}=renderCompass0701(n)

  if(cosReadout0701){
    cosReadout0701.innerHTML=`
      <div><span>CHUNK-LEVEL SIMILARITY (Topic 1 alone)</span><b>1.0000</b></div>
      <div><span>WHOLE-DOCUMENT SIMILARITY (N=${n} topics averaged)</span><b>${isZero?'undefined':cos.toFixed(4)}</b></div>
      <div><span>RELATIVE DROP</span><b>${isZero?'undefined':((1-cos)*100).toFixed(2)+'%'}</b></div>
    `
  }

  if(verdict0701){
    verdict0701.className='callout'+(n>=2&&n<=3?' warning':'')+(n===4?' warning critical':'')
    verdict0701.innerHTML=verdictHtml0701(n,cos)
  }
}

topicsSlider0701?.addEventListener('input',renderSqueeze0701)

renderTokenBar0701()
renderSqueeze0701()
