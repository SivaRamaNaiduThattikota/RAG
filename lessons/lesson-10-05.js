const advancedLesson1005=document.querySelector('#advanced-lesson')
function syncAdvancedTarget1005(){if(advancedLesson1005)advancedLesson1005.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget1005)
syncAdvancedTarget1005()

// Section 18's lab: The Metric Swap Trap. Reuses Concept 04's own pre-filter
// SQL shape and Module 09 Concept 07 / Concept 04's own cited rank list
// (3,7,9,14,17,20) unchanged -- only the ORDER BY expression is swapped in
// and out, since that is the one thing this concept actually changes.

const MATCH_RANKS_1005=[3,7,9,14,17,20]

const EXPR_1005={
  'euclid-op':{sql:'e.embedding <-> :query_embedding', metric:'EUCLIDEAN', label:'<-> (Euclidean operator)'},
  'cosine-op':{sql:'e.embedding <=> :query_embedding', metric:'COSINE', label:'<=> (cosine operator)'},
  'vd-cosine':{sql:'VECTOR_DISTANCE(e.embedding, :query_embedding, COSINE)', metric:'COSINE', label:'VECTOR_DISTANCE(...,COSINE)'},
  'vd-euclid':{sql:'VECTOR_DISTANCE(e.embedding, :query_embedding, EUCLIDEAN)', metric:'EUCLIDEAN', label:'VECTOR_DISTANCE(...,EUCLIDEAN)'},
  'cosine-fn':{sql:'COSINE_DISTANCE(e.embedding, :query_embedding)', metric:'COSINE', label:'COSINE_DISTANCE(...)'},
}

const slot_1005=document.querySelector('#metricSlot_1005')
const verdict_1005=document.querySelector('#metricVerdict_1005')
const chips_1005=[...document.querySelectorAll('#metricChipRow_1005 .rank-chip')]
const exprButtons_1005=[...document.querySelectorAll('#s18 [data-expr]')]

function render_1005(key){
  const entry=EXPR_1005[key]
  if(!entry)return

  if(slot_1005)slot_1005.textContent=entry.sql

  exprButtons_1005.forEach(btn=>btn.classList.toggle('active', btn.dataset.expr===key))

  const isCosine=entry.metric==='COSINE'
  chips_1005.forEach(chip=>{
    chip.classList.remove('match','excluded')
    chip.classList.add(isCosine?'match':'excluded')
  })

  if(verdict_1005){
    verdict_1005.className=isCosine?'callout':'callout warning'
    if(isCosine){
      verdict_1005.textContent=entry.label+' resolves to the COSINE metric -- matches this course\'s convention since M04 Concept 03 and every M08/M09 embedding step. All six of Acme\'s cited matches (ranks 3,7,9,14,17,20) stay included.'
    } else {
      verdict_1005.textContent=entry.label+' resolves to EUCLIDEAN, not COSINE -- this is exactly the trap: Concept 04\'s placeholder used these literal <-> characters, but they are real Oracle syntax for a different metric than this project has used everywhere else. Swapping to it here would silently re-rank Acme\'s own six matches (ranks 3,7,9,14,17,20) under a different metric than the rest of the course.'
    }
  }
}

exprButtons_1005.forEach(btn=>btn.addEventListener('click',()=>render_1005(btn.dataset.expr)))

render_1005('vd-cosine')
