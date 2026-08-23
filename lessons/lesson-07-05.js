const advancedLesson0705=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0705(){if(advancedLesson0705)advancedLesson0705.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0705)
syncAdvancedTarget0705()

// Section 14's lab: The Precision-Context Seesaw. A single 3-stop control
// drives three synchronized readouts at once (precision, antecedent status,
// waste) over the Meridian Freight passage's three verified chunk variants --
// visualizing the size trade-off as one tug-of-war instead of two separate
// sliders the way Concept 01's lab did.

const SPANS_0705={
  tight:{
    label:'Tight (1 sentence)', sentences:['S4'], cos:0.9946094863887088,
    antecedentResolved:false, wasteCount:0, totalCount:1,
  },
  minimal:{
    label:'Minimal complete (2 sentences)', sentences:['S3','S4'], cos:0.7273083770228662,
    antecedentResolved:true, wasteCount:0, totalCount:2,
  },
  whole:{
    label:'Whole passage (5 sentences)', sentences:['S1','S2','S3','S4','S5'], cos:0.6496687622128746,
    antecedentResolved:true, wasteCount:3, totalCount:5,
  },
}
const SPAN_ORDER_0705=['tight','minimal','whole']

const spanButtons0705=[...document.querySelectorAll('#seesawSpan_0705 [data-span]')]
const barWrap0705=document.querySelector('#seesawBarWrap_0705')
const precisionReadout0705=document.querySelector('#seesawPrecisionReadout_0705')
const readout0705=document.querySelector('#seesawReadout_0705')
const verdict0705=document.querySelector('#seesawVerdict_0705')

let currentSpan0705='tight'

function syncButtons0705(){
  spanButtons0705.forEach(btn=>btn.classList.toggle('active',btn.dataset.span===currentSpan0705))
}

function renderSeesaw0705(){
  const span=SPANS_0705[currentSpan0705]
  const keptPct=span.cos*100
  const lostPct=100-keptPct

  if(barWrap0705){
    barWrap0705.innerHTML=`
      <div class="token-bar" role="img" aria-label="Precision score ${span.cos.toFixed(4)} out of 1.0">
        <div class="kept" style="width:${keptPct}%"></div>
        <div class="lost" style="width:${lostPct}%"></div>
      </div>
      <div class="token-bar-legend">
        <span><i class="sw-kept"></i>match to query</span>
        <span><i class="sw-lost"></i>remaining headroom</span>
      </div>
    `
  }
  if(precisionReadout0705){
    precisionReadout0705.innerHTML=`<b>${span.label}</b> -- cosine similarity to query: <b>${span.cos.toFixed(4)}</b>`
  }

  if(readout0705){
    const wastePct=span.totalCount?(span.wasteCount/span.totalCount*100):0
    readout0705.innerHTML=`
      <div><span>ANTECEDENT</span><b style="color:${span.antecedentResolved?'var(--green)':'var(--orange)'}">${span.antecedentResolved?'RESOLVED':'UNRESOLVED'}</b></div>
      <div><span>SENTENCES IN CHUNK</span><b>${span.totalCount}</b></div>
      <div><span>WASTE FOR THIS QUERY</span><b>${span.wasteCount} of ${span.totalCount} (${wastePct.toFixed(0)}%)</b></div>
    `
  }

  if(verdict0705){
    verdict0705.className='callout'+(currentSpan0705!=='minimal'?' warning':'')
    if(currentSpan0705==='tight'){
      verdict0705.innerHTML=`<b>Highest-scoring chunk, and unreadable.</b> Cosine 0.9946 is this whole passage's best match to the query -- but read alone, "the window" has no antecedent inside this chunk. Move to Minimal complete to resolve it.`
    }else if(currentSpan0705==='minimal'){
      verdict0705.innerHTML=`<b>Minimal sufficient chunk.</b> Resolving the antecedent cost 26.87% of Tight's precision (0.9946 -&gt; 0.7273) -- a real cost, paid for a real gain. Nothing past this point is needed to answer this specific query.`
    }else{
      verdict0705.innerHTML=`<b>Fully readable, and 60% wasted.</b> Growing to the whole passage costs a further 10.67% precision (0.7273 -&gt; 0.6497) for zero extra comprehension -- 3 of 5 sentences do no work answering this query. Concepts 06 and 07 exist to avoid paying this exact cost.`
    }
  }
}

spanButtons0705.forEach(btn=>btn.addEventListener('click',()=>{
  currentSpan0705=btn.dataset.span
  syncButtons0705()
  renderSeesaw0705()
}))

syncButtons0705()
renderSeesaw0705()
