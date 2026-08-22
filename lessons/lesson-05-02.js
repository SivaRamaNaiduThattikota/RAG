const advancedLesson0502=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0502(){if(advancedLesson0502)advancedLesson0502.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0502)
syncAdvancedTarget0502()

// Section 14's lab: the Postings List Intersection Race. Builds the same
// eight-document inverted index the lesson text builds by hand, then steps
// a two-pointer merge across any two chosen terms' postings lists -- one
// comparison per click -- while keeping a running comparison count and the
// AND result so far. Finishes by comparing that comparison count against a
// brute-force full-corpus scan, which is this concept's entire argument.

const CORPUS_0502={
  1:'vector search over dense embeddings',
  2:'sparse retrieval with an inverted index',
  3:'dense embeddings for semantic search',
  4:'keyword search using an inverted index',
  5:'vector index for approximate search',
  6:'sparse and dense retrieval combined',
  7:'embeddings from a neural encoder',
  8:'boolean search over an inverted index'
}

function buildIndex0502(corpus){
  const index={}
  Object.entries(corpus).forEach(([docId,text])=>{
    const terms=new Set(text.split(' '))
    terms.forEach(term=>{
      if(!index[term])index[term]=[]
      index[term].push(Number(docId))
    })
  })
  Object.values(index).forEach(list=>list.sort((a,b)=>a-b))
  return index
}

const INDEX_0502=buildIndex0502(CORPUS_0502)
const VOCAB_0502=Object.keys(INDEX_0502).sort()
const N_DOCS_0502=Object.keys(CORPUS_0502).length

const termASelect0502=document.querySelector('#wgTermA_0502')
const termBSelect0502=document.querySelector('#wgTermB_0502')
const stepButton0502=document.querySelector('#wgStep_0502')
const runButton0502=document.querySelector('#wgRun_0502')
const resetButton0502=document.querySelector('#wgReset_0502')
const listABox0502=document.querySelector('#wgListA_0502')
const listBBox0502=document.querySelector('#wgListB_0502')
const comparisonsBox0502=document.querySelector('#wgComparisons_0502')
const resultBox0502=document.querySelector('#wgResult_0502')
const verdictBox0502=document.querySelector('#wgVerdict_0502')
const costBox0502=document.querySelector('#wgCost_0502')

let state0502=null

function populateSelects0502(){
  if(!termASelect0502||!termBSelect0502)return
  VOCAB_0502.forEach(term=>{
    const optA=document.createElement('option'); optA.value=term; optA.textContent=term
    termASelect0502.appendChild(optA)
    const optB=document.createElement('option'); optB.value=term; optB.textContent=term
    termBSelect0502.appendChild(optB)
  })
  termASelect0502.value='search'
  termBSelect0502.value='inverted'
}

function renderList0502(box,list,pointer,done){
  if(!box)return
  box.textContent=list.map((doc,idx)=>{
    if(idx===pointer&&!done)return `[${doc}]`
    return String(doc)
  }).join(', ')
}

function resetState0502(){
  const termA=termASelect0502?.value||'search'
  const termB=termBSelect0502?.value||'inverted'
  state0502={
    a:INDEX_0502[termA]||[],
    b:INDEX_0502[termB]||[],
    i:0,
    j:0,
    comparisons:0,
    result:[],
    done:false
  }
  render0502()
  if(verdictBox0502)verdictBox0502.textContent=`Postings ready: "${termA}" has ${state0502.a.length} document${state0502.a.length===1?'':'s'}, "${termB}" has ${state0502.b.length}. Press "Step forward" to begin the merge.`
  if(costBox0502)costBox0502.textContent=''
}

function stepOnce0502(){
  const s=state0502
  if(!s||s.done)return false
  if(s.i>=s.a.length||s.j>=s.b.length){finish0502();return false}
  s.comparisons++
  const av=s.a[s.i], bv=s.b[s.j]
  if(av===bv){
    s.result.push(av)
    s.i++; s.j++
    if(verdictBox0502)verdictBox0502.textContent=`Comparison ${s.comparisons}: ${av} = ${bv} -- MATCH on document ${av}. Advance both pointers.`
  }else if(av<bv){
    s.i++
    if(verdictBox0502)verdictBox0502.textContent=`Comparison ${s.comparisons}: ${av} < ${bv} -- advance the pointer into the shorter-so-far list (A).`
  }else{
    s.j++
    if(verdictBox0502)verdictBox0502.textContent=`Comparison ${s.comparisons}: ${av} > ${bv} -- advance pointer B.`
  }
  if(s.i>=s.a.length||s.j>=s.b.length)finish0502()
  render0502()
  return true
}

function finish0502(){
  const s=state0502
  if(!s||s.done)return
  s.done=true
  const touched=new Set([...s.a,...s.b])
  const untouched=Object.keys(CORPUS_0502).map(Number).filter(d=>!touched.has(d))
  const bruteForce=N_DOCS_0502
  if(costBox0502){
    costBox0502.textContent=`Merge finished in ${s.comparisons} comparisons over ${s.a.length+s.b.length} total postings entries. `+
      `A brute-force scan for the same two terms would have to open all ${bruteForce} documents in the corpus. `+
      (untouched.length?`Documents ${untouched.map(d=>'D'+d).join(', ')} were never touched by the index at all -- neither term appears in them.`:'Every document in the corpus contains at least one of the two terms.')
  }
}

function render0502(){
  const s=state0502
  if(!s)return
  renderList0502(listABox0502,s.a,s.i,s.done)
  renderList0502(listBBox0502,s.b,s.j,s.done)
  if(comparisonsBox0502)comparisonsBox0502.textContent=String(s.comparisons)
  if(resultBox0502)resultBox0502.textContent=s.result.length?s.result.map(d=>'D'+d).join(', '):'—'
}

stepButton0502?.addEventListener('click',()=>{stepOnce0502()})
runButton0502?.addEventListener('click',()=>{while(stepOnce0502()){}})
resetButton0502?.addEventListener('click',resetState0502)
termASelect0502?.addEventListener('change',resetState0502)
termBSelect0502?.addEventListener('change',resetState0502)

populateSelects0502()
resetState0502()
