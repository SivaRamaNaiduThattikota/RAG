const advancedLesson1002=document.querySelector('#advanced-lesson')
function syncAdvancedTarget1002(){if(advancedLesson1002)advancedLesson1002.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget1002)
syncAdvancedTarget1002()

// Section 23's lab: The Boundary Trace. Two fixed six-step traces (insert,
// query), reused verbatim from Sections 18 and 20 above -- nothing here is
// free-form, every step's bucket and citation is already fixed by this
// concept's own definitions in Sections 04-16.

const TRACES_1002={
  insert:{
    label:'Insert trace',
    steps:[
      {label:'Chunk already made',note:'Module 07',bin:'before',
        citation:"Chunking finished in Module 07, before this request ever reaches the database -- the database only ever sees a finished chunk.",
        teaser:'This step happens in an earlier module, not at the database itself.'},
      {label:'Vector already computed',note:'Module 08',bin:'before',
        citation:"LangChain's own embeddings documentation: “Embedding models transform raw text … into a fixed-length vector of numbers that captures its semantic meaning …” -- finished in Module 08, before the database sees anything.",
        teaser:'This step also happens before the database is involved at all.'},
      {label:'write_chunk(...) arrives',note:'chunk_id, tenant_id, vector, metadata',bin:'at',
        citation:"Persistence (Section 04): the database stores the chunk's identity, vector and metadata together, as one durable unit -- this is the call that hands it all three at once.",
        teaser:'Think about which of the three owned jobs stores a chunk’s parts together.'},
      {label:'Atomic persist + commit',note:'row + vector + metadata, one unit',bin:'at',
        citation:"python-oracledb's own transaction docs: “A database transaction is a grouping of SQL statements that make a logical data change … commit or roll it back using Connection.commit() and Connection.rollback().” This is transactional consistency (Section 06).",
        teaser:'This step is about the write either fully landing or not landing at all -- which owned job is that?'},
      {label:'Commit acknowledgment returns',note:'to the ingestion pipeline',bin:'after',
        citation:"The database's own job ended at commit. The acknowledgment traveling back to the caller is the app's own bookkeeping, after the boundary.",
        teaser:'The database already finished its own job one step ago -- what happens to the caller now?'},
      {label:'App logs the chunk_id',note:'application-side bookkeeping',bin:'after',
        citation:"Recording the returned chunk_id happens in the application, strictly after the database handed back its result -- not a database responsibility.",
        teaser:'This is something the calling application does with what it already got back.'}
    ],
    summary:'All six placed. Two steps happen before the database (chunking, embedding); two are the database’s own owned jobs on this request (persistence, transactional consistency); two happen after, once the database’s own work is already done (the acknowledgment and the app’s own logging).'
  },
  query:{
    label:'Query trace',
    steps:[
      {label:'Query text already embedded',note:'Module 08',bin:'before',
        citation:"The same embedding stage from Module 08 runs on the query text too, before the database ever sees a search call.",
        teaser:'This is the same kind of step as the insert trace’s own vector step -- which zone did that land in?'},
      {label:'search(query_vector, filter, k=5) arrives',note:'tenant_id="acme"',bin:'at',
        citation:"Query execution (Section 09): the database receives one call carrying both the vector and the filter together, not two separate steps.",
        teaser:'This call is arriving at the database, not finishing somewhere else first.'},
      {label:'ANN search + tenant filter executed',note:'one of M09C07’s three strategies',bin:'at',
        citation:"Weaviate's own filtering docs ground the pre-filtering/post-filtering/integrated-ANN choice (Section 10-11); reusing M09C07's own numbers, post-filtering at 30% selectivity over-fetches to top-17 for k=5, a 3.4x over-fetch (17 ÷ 5 = 3.40).",
        teaser:'This is the database running its own internal strategy choice -- still its own job.'},
      {label:'Five matching chunks returned',note:'tenant-scoped',bin:'at',
        citation:"Still query execution: the five results returned are the direct output of the database's own combined search-and-filter operation, before anything else touches them.",
        teaser:'These results just came directly out of the search the database itself just ran.'},
      {label:'Chunks handed to generation stage',note:'Phase 3 / Module 11+',bin:'after',
        citation:"The database's job ends at returning matching chunks. Handing them to a separate generation stage is strictly after the boundary -- the database itself never calls an LLM.",
        teaser:'The database already returned its results one step ago -- who receives them next?'},
      {label:'LLM generates an answer',note:'Phase 3, forward reference only',bin:'after',
        citation:"LangChain's own models documentation: “Models are the reasoning engine of agents. They drive the agent's decision-making process …” The LLM never queries the database directly -- it only receives what the database already returned.",
        teaser:'This step is a language model doing its own work with what it was already handed.'}
    ],
    summary:'All six placed. One step happens before the database (embedding the query); three are the database’s own query-execution job on this request (the call arriving, the search-plus-filter running, the results coming back); two happen after, once generation takes over and the database is no longer involved.'
  }
}

const traceButtons_1002=[...document.querySelectorAll('#traceGroup_1002 [data-trace]')]
const classifyButtons_1002=[...document.querySelectorAll('#classifyGroup_1002 [data-bin]')]
const currentStepRow_1002=document.querySelector('#currentStepRow_1002')
const verdict_1002=document.querySelector('#verdict_1002')
const replayBtn_1002=document.querySelector('#replayBtn_1002')
const binChipRows_1002={
  before: document.querySelector('#beforeBinChips_1002'),
  at: document.querySelector('#atBinChips_1002'),
  after: document.querySelector('#afterBinChips_1002'),
}
const readoutPlaced_1002=document.querySelector('#readoutPlaced_1002')
const readoutBefore_1002=document.querySelector('#readoutBefore_1002')
const readoutAt_1002=document.querySelector('#readoutAt_1002')
const readoutAfter_1002=document.querySelector('#readoutAfter_1002')

const DEFAULT_VERDICT_1002='Pick a trace above to begin -- Insert trace or Query trace.'

let currentTraceKey_1002=null
let stepIndex_1002=0
let tally_1002={before:0,at:0,after:0}
let currentChip_1002=null

function resetBins_1002(){
  Object.values(binChipRows_1002).forEach(row=>{ if(row) row.innerHTML='' })
  tally_1002={before:0,at:0,after:0}
  updateReadout_1002()
}

function updateReadout_1002(){
  const placed=tally_1002.before+tally_1002.at+tally_1002.after
  const total=currentTraceKey_1002?TRACES_1002[currentTraceKey_1002].steps.length:0
  if(readoutPlaced_1002)readoutPlaced_1002.textContent=`${placed} / ${total||6}`
  if(readoutBefore_1002)readoutBefore_1002.textContent=String(tally_1002.before)
  if(readoutAt_1002)readoutAt_1002.textContent=String(tally_1002.at)
  if(readoutAfter_1002)readoutAfter_1002.textContent=String(tally_1002.after)
}

function setClassifyEnabled_1002(enabled){
  classifyButtons_1002.forEach(btn=>{
    btn.disabled=!enabled
    if(enabled)btn.removeAttribute('aria-disabled')
    else btn.setAttribute('aria-disabled','true')
  })
}

function renderCurrentStep_1002(){
  if(!currentStepRow_1002)return
  currentStepRow_1002.innerHTML=''
  const trace=TRACES_1002[currentTraceKey_1002]
  if(!trace)return
  if(stepIndex_1002>=trace.steps.length){
    setClassifyEnabled_1002(false)
    currentChip_1002=null
    if(verdict_1002)verdict_1002.innerHTML=`<b>${trace.label} complete.</b> ${trace.summary}`
    return
  }
  const step=trace.steps[stepIndex_1002]
  const chip=document.createElement('span')
  chip.className='rank-chip mover'
  const b=document.createElement('b')
  b.textContent=step.label
  const span=document.createElement('span')
  span.textContent=step.note
  const small=document.createElement('small')
  small.textContent=`Step ${stepIndex_1002+1} of ${trace.steps.length}`
  chip.appendChild(b)
  chip.appendChild(span)
  chip.appendChild(small)
  currentStepRow_1002.appendChild(chip)
  currentChip_1002=chip
  setClassifyEnabled_1002(true)
  if(verdict_1002)verdict_1002.textContent='Where does this step belong -- before, at the boundary, or after?'
}

function selectTrace_1002(key){
  if(!TRACES_1002[key])return
  currentTraceKey_1002=key
  stepIndex_1002=0
  resetBins_1002()
  traceButtons_1002.forEach(btn=>btn.classList.toggle('active',btn.dataset.trace===key))
  renderCurrentStep_1002()
}

function classify_1002(bin){
  if(!currentTraceKey_1002||!currentChip_1002)return
  const trace=TRACES_1002[currentTraceKey_1002]
  const step=trace.steps[stepIndex_1002]
  if(!step)return

  if(bin===step.bin){
    currentChip_1002.classList.remove('mover')
    currentChip_1002.classList.add('match','sorted-in')
    const row=binChipRows_1002[step.bin]
    if(row){
      const moved=currentChip_1002
      row.appendChild(moved)
    }
    tally_1002[step.bin]++
    updateReadout_1002()
    if(verdict_1002)verdict_1002.innerHTML=step.citation
    stepIndex_1002++
    setClassifyEnabled_1002(false)
    setTimeout(renderCurrentStep_1002,900)
  } else {
    currentChip_1002.classList.add('fn')
    if(verdict_1002)verdict_1002.innerHTML=`<b>Not quite.</b> ${step.teaser}`
    setTimeout(()=>{ currentChip_1002?.classList.remove('fn') },500)
  }
}

traceButtons_1002.forEach(btn=>btn.addEventListener('click',()=>selectTrace_1002(btn.dataset.trace)))
classifyButtons_1002.forEach(btn=>btn.addEventListener('click',()=>classify_1002(btn.dataset.bin)))
replayBtn_1002?.addEventListener('click',()=>{
  if(!currentTraceKey_1002)return
  stepIndex_1002=0
  resetBins_1002()
  renderCurrentStep_1002()
})

setClassifyEnabled_1002(false)
if(verdict_1002)verdict_1002.textContent=DEFAULT_VERDICT_1002
