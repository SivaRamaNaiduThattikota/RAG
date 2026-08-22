const advancedLesson0306=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0306(){if(advancedLesson0306)advancedLesson0306.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0306)
syncAdvancedTarget0306()

const ALL_DOCS=['Refund policy','Shipping FAQ','Warranty terms']
const RELEVANT_DOC='Refund policy'

let indexQueue=[...ALL_DOCS]
let indexedDocs=[]
let queryAttempts=[]

const indexButton=document.querySelector('#indexNextButton0306')
const queryButton=document.querySelector('#runQueryButton0306')
const resetButton=document.querySelector('#resetIndexButton0306')
const indexStatusOut=document.querySelector('#indexStatus0306')
const queryLogOut=document.querySelector('#queryLog0306')

function renderIndexStatus(){
  if(!indexStatusOut)return
  const indexedLine=indexedDocs.length
    ?`Vector index holds ${indexedDocs.length} document${indexedDocs.length===1?'':'s'}: ${indexedDocs.join(', ')}.`
    :'Vector index is empty — offline indexing has not run yet.'
  const queueLine=indexQueue.length
    ?`Waiting to be indexed: ${indexQueue.join(', ')}.`
    :'Every document has already been through offline indexing.'
  indexStatusOut.innerHTML=`<p>${indexedLine}</p><p>${queueLine}</p>`
}

function renderQueryLog(){
  if(!queryLogOut)return
  if(!queryAttempts.length){queryLogOut.innerHTML='';return}
  const rows=queryAttempts.map(a=>`<li>Attempt ${a.n} — index held ${a.indexedCount} document${a.indexedCount===1?'':'s'} at that moment: ${a.result}.</li>`).join('')
  queryLogOut.innerHTML=`<p><b>Query: "What's the refund window?"</b></p><ol>${rows}</ol>`
}

function runQuery(){
  const n=queryAttempts.length+1
  let result
  if(indexedDocs.length===0){
    result='no documents indexed yet — retrieval finds nothing, generation has no evidence to condition on'
  }else if(indexedDocs.includes(RELEVANT_DOC)){
    result=`retrieved "${RELEVANT_DOC}" → grounded answer: "The refund window is 30 days. [Doc1]"`
  }else{
    result=`retrieved only ${indexedDocs.join(', ')} — none of it covers refunds, so there is nothing relevant to ground on`
  }
  queryAttempts.push({n,indexedCount:indexedDocs.length,result})
  renderQueryLog()
}

indexButton?.addEventListener('click',()=>{
  if(!indexQueue.length)return
  const next=indexQueue.shift()
  indexedDocs.push(next)
  renderIndexStatus()
})

queryButton?.addEventListener('click',runQuery)

resetButton?.addEventListener('click',()=>{
  indexQueue=[...ALL_DOCS]
  indexedDocs=[]
  queryAttempts=[]
  renderIndexStatus()
  renderQueryLog()
})

renderIndexStatus()
