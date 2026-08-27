const advancedLesson1001=document.querySelector('#advanced-lesson')
function syncAdvancedTarget1001(){if(advancedLesson1001)advancedLesson1001.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget1001)
syncAdvancedTarget1001()

// Section 14's lab: The Boundary Sorter. Six real, named systems, each with
// a fixed, cited real-world category and a four-row evidence ledger --
// nothing here is computed live, every placement and citation below is
// already verified against the systems' own documentation.

const SYSTEMS_1001={
  langchain:{
    label:'LangChain VectorStore', bin:'store', reason:'interface only, no storage of its own',
    marks:['✗ No — depends entirely on the plugged-in backend','✗ No','✗ No','✗ No'],
    citation:"LangChain's own VectorStore documentation describes it as a base interface that most integrations implement by wrapping another library or service — persistence is inherited from whichever backend is plugged in underneath, not guaranteed by the abstraction itself."
  },
  faiss:{
    label:'FAISS', bin:'store', reason:'library, not a server',
    marks:['✗ No — write_index/read_index is a step you call yourself','✗ No','✗ No','✗ No'],
    citation:'FAISS\'s own documentation describes itself as "a library for efficient similarity search," not a database — saving an index to disk is an explicit function call you make yourself, and there is no built-in server, transaction log, or replication.'
  },
  oracle:{
    label:'Oracle AI Database', bin:'database', reason:'ACID RDBMS with vector search built in',
    marks:['✓ Yes','✓ Yes — classic ACID','✓ Yes — Data Guard/RAC','✗ No'],
    citation:"Oracle's own AI Database documentation describes vector search as a native capability inside a general-purpose, ACID-compliant relational database — vectors get the same persistence, transactional consistency, and replication as any other Oracle table."
  },
  qdrant:{
    label:'Qdrant', bin:'database', reason:'persistent, own replication, weaker consistency',
    marks:['✓ Yes','✗ No — own model, not classic ACID','✓ Yes — sharding + replication','✗ No'],
    citation:"Qdrant's own documentation describes collections as persisted to disk with their own sharding and replication — but, as this course's own Module 09 Concept 09 already cited, Qdrant's default favors availability over strict consistency, so it does not claim classic multi-statement ACID transactions the way Oracle AI Database does."
  },
  elastic:{
    label:'Elasticsearch', bin:'search', reason:'BM25 engine, vector bolted on',
    marks:['✓ Yes','✗ No','✓ Yes — index replicas','✓ Yes — BM25 by default'],
    citation:"Elastic's own dense-vector/kNN search documentation adds approximate vector search on top of Elasticsearch's original Lucene-based, BM25-scored lexical search engine — the vector capability is a later addition to a search engine, not the reason the engine was built."
  },
  opensearch:{
    label:'OpenSearch', bin:'search', reason:'Elasticsearch fork, vector via plugin',
    marks:['✓ Yes','✗ No','✓ Yes — replica shards','✓ Yes — BM25 by default'],
    citation:"OpenSearch's own k-NN plugin documentation adds vector search as a plugin on top of OpenSearch's own Lucene-based lexical search engine (forked from Elasticsearch) — the same bolted-on relationship as its sibling."
  }
}

const sysButtons_1001=[...document.querySelectorAll('#s14 [data-system]')]
const resetBtn_1001=document.querySelector('#sortReset_1001')
const binChipRows_1001={
  store: document.querySelector('#binStoreChips_1001'),
  database: document.querySelector('#binDatabaseChips_1001'),
  search: document.querySelector('#binSearchChips_1001'),
}
const critPersist_1001=document.querySelector('#critPersist_1001')
const critConsistency_1001=document.querySelector('#critConsistency_1001')
const critReplication_1001=document.querySelector('#critReplication_1001')
const critLexical_1001=document.querySelector('#critLexical_1001')
const verdict_1001=document.querySelector('#sortVerdict_1001')

const BIN_NAMES_1001={store:'VECTOR STORE', database:'VECTOR DATABASE', search:'SEARCH ENGINE'}

const DEFAULT_VERDICT_1001='Click a real system above to sort it into its category and see the citation behind the placement.'
const COMPLETION_VERDICT_1001='All six sorted — two per bin. Notice Qdrant lands in VECTOR DATABASE with Oracle AI Database even though it fails the consistency row here: persistence and its own replication are what earn a system that name under this concept\'s own definition, and Oracle AI Database\'s classic ACID guarantee is the stronger case of the same category, not a different one. LangChain VectorStore and FAISS fail every row — that absence is exactly what "vector store" means. Elasticsearch and OpenSearch pass persistence and replication but fail consistency and origin — a bolted-on capability on a lexical engine, not a database built for vectors.'

function sortedCount_1001(){
  return sysButtons_1001.filter(btn=>btn.classList.contains('sorted')).length
}

function handleSort_1001(btn){
  if(btn.disabled)return
  const key=btn.dataset.system
  const entry=SYSTEMS_1001[key]
  if(!entry)return

  btn.disabled=true
  btn.setAttribute('aria-disabled','true')
  btn.classList.add('sorted')

  const row=binChipRows_1001[entry.bin]
  if(row){
    const chip=document.createElement('span')
    chip.className='rank-chip bin-'+entry.bin+' sorted-in'
    const b=document.createElement('b')
    b.textContent=entry.label
    const span=document.createElement('span')
    span.textContent=entry.reason
    chip.appendChild(b)
    chip.appendChild(span)
    row.appendChild(chip)
  }

  if(critPersist_1001)critPersist_1001.textContent=entry.marks[0]
  if(critConsistency_1001)critConsistency_1001.textContent=entry.marks[1]
  if(critReplication_1001)critReplication_1001.textContent=entry.marks[2]
  if(critLexical_1001)critLexical_1001.textContent=entry.marks[3]

  const n=sortedCount_1001()
  if(verdict_1001){
    if(n<6){
      verdict_1001.innerHTML=`<b>${entry.label} → ${BIN_NAMES_1001[entry.bin]}.</b> ${entry.citation}<br><small>Sorted ${n} of 6 so far.</small>`
    } else {
      verdict_1001.innerHTML=COMPLETION_VERDICT_1001
    }
  }
}

function resetBoard_1001(){
  sysButtons_1001.forEach(btn=>{
    btn.disabled=false
    btn.removeAttribute('aria-disabled')
    btn.classList.remove('sorted')
  })
  Object.values(binChipRows_1001).forEach(row=>{ if(row)row.innerHTML='' })
  if(critPersist_1001)critPersist_1001.textContent='—'
  if(critConsistency_1001)critConsistency_1001.textContent='—'
  if(critReplication_1001)critReplication_1001.textContent='—'
  if(critLexical_1001)critLexical_1001.textContent='—'
  if(verdict_1001)verdict_1001.innerHTML=DEFAULT_VERDICT_1001
}

sysButtons_1001.forEach(btn=>btn.addEventListener('click',()=>handleSort_1001(btn)))
resetBtn_1001?.addEventListener('click',resetBoard_1001)
