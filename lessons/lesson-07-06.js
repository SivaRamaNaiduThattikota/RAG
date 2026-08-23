const advancedLesson0706=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0706(){if(advancedLesson0706)advancedLesson0706.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0706)
syncAdvancedTarget0706()

// Section 14's lab: The Coverage Gamble. Dials through the 7 verified overlap
// settings from the worked example (0/10/20/30/40/50/66%) over the identical
// Oracle Order Management passage, computing chunk spans, storage/call cost
// and fact containment live via the same sliding-window logic the worked
// example's own Node script used -- not hardcoded outcomes.

const PASSAGE_0706='Oracle Order Management lets a customer cancel an order within a fixed period after purchase. The order-cancellation grace period is 14 days from the ship date. Once it elapses, the order status locks to CLOSED and refunds stop processing automatically. Support agents must file a manual override.'
const FACT_0706='The order-cancellation grace period is 14 days from the ship date.'
const CHUNK_SIZE_0706=100
const FACT_START_0706=PASSAGE_0706.indexOf(FACT_0706)
const FACT_END_0706=FACT_START_0706+FACT_0706.length
const DOC_LEN_0706=PASSAGE_0706.length

function chunkFixed0706(text,n,stride){
  const chunks=[]
  let start=0
  while(start<text.length){
    const end=Math.min(start+n,text.length)
    chunks.push({start,end})
    if(end===text.length)break
    start+=stride
  }
  return chunks
}

function containsFact0706(chunks,a,b){
  return chunks.some(c=>c.start<=a&&c.end>=b)
}

// Three real states, three colors -- red for split, amber for contained-by-luck,
// green for contained-and-guaranteed. The site's shared palette only names
// orange/green, so these three are hardcoded hex to keep the distinction the
// worked example actually needs (positional luck is not the same as split,
// and it is definitely not the same as guaranteed).
function statusColor0706(contained,guaranteed){
  if(!contained)return'#ff7957'
  return guaranteed?'#3fae86':'#f4b942'
}

const BASELINE_CHUNKS_0706=chunkFixed0706(PASSAGE_0706,CHUNK_SIZE_0706,CHUNK_SIZE_0706).length

const STEPS_0706=[0,10,20,30,40,50,66].map(pct=>{
  const overlapSize=Math.round(CHUNK_SIZE_0706*pct/100)
  const stride=CHUNK_SIZE_0706-overlapSize
  return {pct,overlapSize,stride}
})

const stepButtons0706=[...document.querySelectorAll('#coverageSteps_0706 [data-pct]')]
const trackWrap0706=document.querySelector('#coverageTrackWrap_0706')
const readout0706=document.querySelector('#coverageReadout_0706')
const verdict0706=document.querySelector('#coverageVerdict_0706')

let currentPct0706=0

function syncStepButtons0706(){
  stepButtons0706.forEach(btn=>btn.classList.toggle('active',Number(btn.dataset.pct)===currentPct0706))
}

// A coordinate-based SVG ruler over the passage's 297 character positions.
// All chunk bars share one horizontal band at a fixed low fill-opacity, so
// SVG's own alpha blending makes overlapping regions visibly stack/darken --
// no extra math needed to detect overlap regions for the drawing itself.
function renderTrack0706(step,chunks,contained,guaranteed){
  const plotX0=40,plotW=540,vbW=620,vbH=190
  const scale=plotW/DOC_LEN_0706
  const X=pos=>(plotX0+pos*scale).toFixed(1)
  const barY=54,barH=52
  const bars=chunks.map((c,i)=>{
    const x=X(c.start),w=(c.end-c.start)*scale
    return `<rect x="${x}" y="${barY}" width="${w.toFixed(1)}" height="${barH}" fill="#ff7957" fill-opacity="0.32" stroke="#14241f" stroke-width="1.2"/>`
      +`<text x="${(parseFloat(x)+w/2).toFixed(1)}" y="${barY+barH/2+3}" font-size="9" text-anchor="middle" font-family="DM Mono, monospace" fill="#14241f">C${i+1}</text>`
  }).join('')
  const factX=X(FACT_START_0706),factW=(FACT_END_0706-FACT_START_0706)*scale
  const factColor=statusColor0706(contained,guaranteed)
  const axisY=barY+barH+30
  const ticks=[0,50,100,150,200,250,DOC_LEN_0706].map(p=>{
    const x=X(p)
    return `<line x1="${x}" y1="${axisY-4}" x2="${x}" y2="${axisY+4}" stroke="#14241f" stroke-width="1"/>`
      +`<text x="${x}" y="${axisY+16}" font-size="7.5" text-anchor="middle" font-family="DM Mono, monospace" fill="#14241f">${p}</text>`
  }).join('')
  const badgeText=contained?(guaranteed?'CONTAINED — guaranteed (overlap_size 66 ≥ fact_length 66)':'CONTAINED — positional luck'):(step.pct===50?'SPLIT AGAIN':'SPLIT')
  trackWrap0706.innerHTML=`
    <svg class="vector-plane" viewBox="0 0 ${vbW} ${vbH}" role="img" aria-label="Chunk spans over the 297-character passage at ${step.pct} percent overlap, with the target fact span marked">
      <line x1="${plotX0}" y1="${axisY}" x2="${plotX0+plotW}" y2="${axisY}" stroke="#14241f" stroke-width="1.5"/>
      ${ticks}
      ${bars}
      <rect x="${factX}" y="${axisY+26}" width="${factW.toFixed(1)}" height="7" fill="${factColor}" stroke="#14241f" stroke-width="1"/>
      <text x="${factX}" y="${axisY+46}" font-size="8.5" font-family="DM Mono, monospace" fill="${factColor}" font-weight="700">${badgeText}</text>
      <text x="${plotX0}" y="14" font-size="9" font-family="DM Mono, monospace" fill="#14241f" font-weight="700">${step.pct}% overlap · stride=${step.stride} · ${chunks.length} chunk${chunks.length===1?'':'s'}</text>
    </svg>
    <p style="margin-top:6px;font:11px 'DM Mono',monospace;color:var(--muted)">Translucent bars are chunks; where two overlap the fill darkens. The lower bar marks the fact's fixed [${FACT_START_0706},${FACT_END_0706}) span.</p>
  `
}

function renderCoverage0706(){
  const step=STEPS_0706.find(s=>s.pct===currentPct0706)
  const chunks=chunkFixed0706(PASSAGE_0706,CHUNK_SIZE_0706,step.stride)
  const contained=containsFact0706(chunks,FACT_START_0706,FACT_END_0706)
  const guaranteed=step.overlapSize>=FACT_0706.length
  const totalStored=chunks.reduce((sum,c)=>sum+(c.end-c.start),0)
  const extraPct=(totalStored-DOC_LEN_0706)/DOC_LEN_0706*100
  const callExtraPct=(chunks.length-BASELINE_CHUNKS_0706)/BASELINE_CHUNKS_0706*100

  renderTrack0706(step,chunks,contained,guaranteed)

  if(readout0706){
    readout0706.innerHTML=`
      <div><span>CHUNKS</span><b>${chunks.length}</b></div>
      <div><span>STORED</span><b>${totalStored} chars (+${extraPct.toFixed(2)}%)</b></div>
      <div><span>EMBEDDING CALLS</span><b>${chunks.length} (+${callExtraPct.toFixed(1)}%)</b></div>
      <div><span>FACT STATUS</span><b style="color:${statusColor0706(contained,guaranteed)}">${contained?(guaranteed?'GUARANTEED':'CONTAINED'):'SPLIT'}</b></div>
    `
  }

  if(verdict0706){
    verdict0706.className='callout'+(contained&&guaranteed?'':' warning')
    if(step.pct===0){
      verdict0706.innerHTML=`<b>Zero overlap — Concept 02's own special case.</b> stride=chunk_size, no shared characters. The fact splits mid-word inside "order-cancellation": chunk 1 ends "...The or", chunk 2 begins "der-cancellation grace period...". Neither chunk alone states the complete fact.`
    }else if(step.pct===50){
      verdict0706.innerHTML=`<b>More overlap just failed where less overlap (40%) succeeded.</b> That's proof this dial reduces risk, it does not guarantee safety below the threshold Section 09 derives — overlap_size=50 is still short of the fact's own 66-character length, exactly like overlap_size=40 was.`
    }else if(step.pct===66){
      verdict0706.innerHTML=`<b>Guaranteed.</b> overlap_size=66 meets the fact's own 66-character length — the exact condition Section 09 derives. This is the only step on this dial where containment is certain regardless of where the fact sits, and it costs +133.33% storage to get there.`
    }else{
      verdict0706.innerHTML=`<b>Contained — but by position, not by guarantee.</b> overlap_size=${step.overlapSize} is below the 66-character threshold this fact needs. It happens to work at ${step.pct}%; nothing here promises it keeps working as the fact or its position changes.`
    }
  }
}

stepButtons0706.forEach(btn=>btn.addEventListener('click',()=>{
  currentPct0706=Number(btn.dataset.pct)
  syncStepButtons0706()
  renderCoverage0706()
}))

syncStepButtons0706()
renderCoverage0706()
