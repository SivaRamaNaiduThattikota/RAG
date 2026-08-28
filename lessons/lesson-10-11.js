const advancedLesson1011=document.querySelector('#advanced-lesson')
function syncAdvancedTarget1011(){if(advancedLesson1011)advancedLesson1011.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget1011)
syncAdvancedTarget1011()

// Section 14's lab: The Engine Swap. Reuses Section 10's own five-vector
// toy dataset and its independently node-verified cosine distances
// (c1=0, c5=0, c2=0.5, c3=0.5, c4=1). Toggling the engine only ever
// swaps the SQL text in the three code panels -- the rank chips never
// move, because the underlying math is identical in both engines.

const CANDIDATES_1011=[
  {id:'c1', v:[1,0,1], dist:0},
  {id:'c5', v:[2,0,2], dist:0},
  {id:'c2', v:[0,1,1], dist:0.5},
  {id:'c3', v:[1,1,0], dist:0.5},
  {id:'c4', v:[-1,0,1], dist:1},
]
const K_1011=3

const SNIPPETS_1011={
  oracle:{
    type:'ALTER TABLE embeddings MODIFY (embedding VECTOR(384, FLOAT32));',
    index:'CREATE VECTOR INDEX embeddings_hnsw_idx ON embeddings (embedding)\n  ORGANIZATION INMEMORY NEIGHBOR GRAPH\n  DISTANCE COSINE\n  WITH TARGET ACCURACY 95;',
    query:"SELECT chunk_id, VECTOR_DISTANCE(embedding, :qv, COSINE) AS dist\nFROM embeddings\nORDER BY dist\nFETCH FIRST 3 ROWS ONLY;",
    verdict:'ORACLE: native VECTOR type, no enabling step. One TARGET ACCURACY dial governs the whole recall/speed trade-off. The three closest by cosine distance are still c1 and c5 (tied at 0.000000), then either c2 or c3 (tied at 0.500000).'
  },
  pgvector:{
    type:'CREATE EXTENSION vector;\n\nCREATE TABLE embeddings (\n  chunk_id  bigint PRIMARY KEY,\n  embedding vector(384)\n);',
    index:'CREATE INDEX ON embeddings\n  USING hnsw (embedding vector_cosine_ops)\n  WITH (m = 16, ef_construction = 64);\n\nSET hnsw.ef_search = 100;',
    query:"SELECT chunk_id, embedding <=> '[1,0,1]' AS dist\nFROM embeddings\nORDER BY dist\nLIMIT 3;",
    verdict:"PGVECTOR: the vector type doesn't exist until CREATE EXTENSION vector runs. Raw m/ef_construction/ef_search knobs replace Oracle's single dial. Same standard cosine formula, same data -- the three closest are still c1 and c5 (tied at 0.000000), then either c2 or c3 (tied at 0.500000)."
  }
}

const typeLabel_1011=document.querySelector('#typeLabel_1011')
const indexLabel_1011=document.querySelector('#indexLabel_1011')
const queryLabel_1011=document.querySelector('#queryLabel_1011')
const typeSnippet_1011=document.querySelector('#typeSnippet_1011')
const indexSnippet_1011=document.querySelector('#indexSnippet_1011')
const querySnippet_1011=document.querySelector('#querySnippet_1011')
const rowEl_1011=document.querySelector('#engineRow_1011')
const verdict_1011=document.querySelector('#engineVerdict_1011')
const engineButtons_1011=[...document.querySelectorAll('#s14 [data-engine]')]

let currentEngine_1011='oracle'

function syncButtons_1011(){
  engineButtons_1011.forEach(btn=>btn.classList.toggle('active', btn.dataset.engine===currentEngine_1011))
}

function buildChip_1011(row, isCutoff){
  const div=document.createElement('div')
  div.className='rank-chip'+(row.dist===0?' match':'')+(isCutoff?' cutoff-edge':'')
  const b=document.createElement('b')
  b.textContent=row.id
  const span=document.createElement('span')
  span.textContent='dist '+row.dist.toFixed(2)
  div.appendChild(b)
  div.appendChild(span)
  return div
}

function renderRow_1011(){
  if(!rowEl_1011) return
  rowEl_1011.innerHTML=''
  const sorted=[...CANDIDATES_1011].sort((a,b)=>a.dist-b.dist)
  sorted.forEach((row,i)=>{
    // The k=3 cutoff falls inside the c2/c3 tie -- honestly marked, not
    // resolved, since neither engine's own ORDER BY docs promise a
    // specific winner between two exactly-tied distance values.
    const isCutoff = i===K_1011-1 || i===K_1011
    const chip=buildChip_1011(row, i===K_1011-1)
    if(i>=K_1011) chip.style.opacity='0.4'
    rowEl_1011.appendChild(chip)
  })
}

function render_1011(){
  const s=SNIPPETS_1011[currentEngine_1011]
  if(typeLabel_1011) typeLabel_1011.textContent = currentEngine_1011==='oracle' ? 'TYPE DECLARATION — ORACLE' : 'TYPE DECLARATION — PGVECTOR'
  if(indexLabel_1011) indexLabel_1011.textContent = currentEngine_1011==='oracle' ? 'INDEX STATEMENT — ORACLE' : 'INDEX STATEMENT — PGVECTOR'
  if(queryLabel_1011) queryLabel_1011.textContent = currentEngine_1011==='oracle' ? 'DISTANCE QUERY — ORACLE' : 'DISTANCE QUERY — PGVECTOR'
  if(typeSnippet_1011) typeSnippet_1011.textContent = s.type
  if(indexSnippet_1011) indexSnippet_1011.textContent = s.index
  if(querySnippet_1011) querySnippet_1011.textContent = s.query
  if(verdict_1011){
    verdict_1011.className='callout'
    verdict_1011.textContent=s.verdict
  }
  renderRow_1011()
}

engineButtons_1011.forEach(btn=>btn.addEventListener('click',()=>{
  currentEngine_1011=btn.dataset.engine
  syncButtons_1011()
  render_1011()
}))

syncButtons_1011()
render_1011()
