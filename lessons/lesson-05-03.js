const advancedLesson0503=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0503(){if(advancedLesson0503)advancedLesson0503.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0503)
syncAdvancedTarget0503()

// Section 14's lab: the Sparse vs. Dense Result Board. Reuses Concept 02's
// exact eight-document corpus and inverted-index/merge code for the real
// sparse side, pairs it with a small illustrative (hand-set, not model-
// generated) dense similarity table per query, then shows where the two
// mechanisms agree and where dense alone can see a document sparse never
// could -- the entire point of this concept, made interactive.

const CORPUS_0503={
  1:'vector search over dense embeddings',
  2:'sparse retrieval with an inverted index',
  3:'dense embeddings for semantic search',
  4:'keyword search using an inverted index',
  5:'vector index for approximate search',
  6:'sparse and dense retrieval combined',
  7:'embeddings from a neural encoder',
  8:'boolean search over an inverted index'
}

function buildIndex0503(corpus){
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

function intersect0503(a,b){
  let i=0,j=0
  const result=[]
  while(i<a.length&&j<b.length){
    if(a[i]===b[j]){result.push(a[i]);i++;j++}
    else if(a[i]<b[j])i++
    else j++
  }
  return result
}

const INDEX_0503=buildIndex0503(CORPUS_0503)

// Illustrative dense similarity scores per preset query -- hand-set to
// demonstrate the mechanism's *shape* (every document gets a score, ranked),
// not pulled from a trained embedding model. Each query below is a pair of
// real terms from the corpus so the sparse side can compute a genuine AND.
const QUERIES_0503=[
  {label:'vector search',termA:'vector',termB:'search',dense:{1:0.91,5:0.78,3:0.74,7:0.52,4:0.33,6:0.30,8:0.28,2:0.19}},
  {label:'dense search',termA:'dense',termB:'search',dense:{3:0.88,1:0.85,6:0.55,5:0.47,7:0.44,4:0.31,8:0.24,2:0.21}},
  {label:'inverted index',termA:'inverted',termB:'index',dense:{2:0.86,8:0.80,4:0.77,5:0.62,1:0.35,3:0.29,7:0.27,6:0.25}},
  {label:'sparse retrieval',termA:'sparse',termB:'retrieval',dense:{2:0.89,6:0.84,4:0.41,8:0.38,1:0.30,3:0.28,5:0.22,7:0.20}}
]

const querySelect0503=document.querySelector('#wgQuery_0503')
const runButton0503=document.querySelector('#wgRunBoard_0503')
const resetButton0503=document.querySelector('#wgResetBoard_0503')
const sparseBox0503=document.querySelector('#wgSparseResult_0503')
const denseBox0503=document.querySelector('#wgDenseResult_0503')
const overlapBox0503=document.querySelector('#wgOverlap_0503')
const denseOnlyBox0503=document.querySelector('#wgDenseOnly_0503')
const verdictBox0503=document.querySelector('#wgVerdictBoard_0503')

function populateQuerySelect0503(){
  if(!querySelect0503)return
  QUERIES_0503.forEach((q,idx)=>{
    const opt=document.createElement('option')
    opt.value=String(idx)
    opt.textContent=`"${q.label}"`
    querySelect0503.appendChild(opt)
  })
  querySelect0503.value='0'
}

function docLabel0503(id){return 'D'+id}

function runBoard0503(){
  const q=QUERIES_0503[Number(querySelect0503?.value||0)]
  if(!q)return
  const postingsA=INDEX_0503[q.termA]||[]
  const postingsB=INDEX_0503[q.termB]||[]
  const sparseResult=intersect0503(postingsA,postingsB)
  const denseRanking=Object.entries(q.dense).map(([doc,score])=>[Number(doc),score]).sort((a,b)=>b[1]-a[1])
  const denseTop4=denseRanking.slice(0,4).map(pair=>pair[0])
  const sparseSet=new Set(sparseResult)
  const denseSet=new Set(denseTop4)
  const overlap=denseTop4.filter(doc=>sparseSet.has(doc))
  const denseOnly=denseTop4.filter(doc=>!sparseSet.has(doc))
  const sparseOnly=sparseResult.filter(doc=>!denseSet.has(doc))
  if(sparseBox0503)sparseBox0503.textContent=sparseResult.length?sparseResult.map(docLabel0503).join(', '):'(no exact-term match)'
  if(denseBox0503)denseBox0503.textContent=denseRanking.slice(0,4).map(([doc,score])=>`${docLabel0503(doc)} (${score.toFixed(2)})`).join(', ')
  if(overlapBox0503)overlapBox0503.textContent=overlap.length?overlap.map(docLabel0503).join(', '):'none'
  if(denseOnlyBox0503)denseOnlyBox0503.textContent=denseOnly.length?denseOnly.map(docLabel0503).join(', '):'none'
  if(verdictBox0503){
    let verdict=`For "${q.label}": the sparse AND merge returns ${sparseResult.length} document${sparseResult.length===1?'':'s'}, and the illustrative dense ranking's top 4 overlap on ${overlap.length}. `
    if(denseOnly.length)verdict+=`${denseOnly.map(docLabel0503).join(' and ')} rank highly on the dense side despite sharing no exact term with the query -- invisible to the sparse mechanism at any rank.`
    else verdict+=`Every document the dense ranking favors also satisfies the sparse merge for this particular query -- not every query diverges the same way.`
    if(sparseOnly.length)verdict+=` ${sparseOnly.map(docLabel0503).join(' and ')} satisfy the exact-term merge but didn't make the illustrative dense top 4.`
    verdictBox0503.textContent=verdict
  }
}

function resetBoard0503(){
  if(querySelect0503)querySelect0503.value='0'
  if(sparseBox0503)sparseBox0503.textContent='—'
  if(denseBox0503)denseBox0503.textContent='—'
  if(overlapBox0503)overlapBox0503.textContent='—'
  if(denseOnlyBox0503)denseOnlyBox0503.textContent='—'
  if(verdictBox0503)verdictBox0503.textContent='Pick a query and press "Compare mechanisms" to see where the two result sets agree and diverge.'
}

runButton0503?.addEventListener('click',runBoard0503)
resetButton0503?.addEventListener('click',resetBoard0503)
querySelect0503?.addEventListener('change',resetBoard0503)

populateQuerySelect0503()
resetBoard0503()
