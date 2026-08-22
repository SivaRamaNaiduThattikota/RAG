const advancedLesson0504=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0504(){if(advancedLesson0504)advancedLesson0504.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0504)
syncAdvancedTarget0504()

// Section 14's lab: the Term Frequency / Document Frequency Explorer.
// Reuses b03's own five-ticket corpus (kept in sync with the hand-worked
// numbers in Sections 06/10/12 of the advanced lesson) and computes tf, df
// and idf live for whichever term is selected -- including one term that
// never appears anywhere, so the df = 0 undefined case is reachable, not
// just described in prose.

const TICKETS_0504={
  T1:'my order is late and my order never arrived',
  T2:'please refund my order immediately',
  T3:'the refund was processed but the refund amount is wrong',
  T4:'where is my order confirmation email',
  T5:'i need help resetting my password'
}

const TERMS_0504=['my','order','refund','password','is','shipping']

function termFrequency0504(term,text){
  return text.split(' ').filter(word=>word===term).length
}

function documentFrequency0504(term){
  return Object.values(TICKETS_0504).filter(text=>text.split(' ').includes(term)).length
}

function inverseDocumentFrequency0504(df,n){
  if(df===0)return null
  return Math.log(n/df)
}

const termSelect0504=document.querySelector('#wgTerm_0504')
const runButton0504=document.querySelector('#wgRunExplorer_0504')
const resetButton0504=document.querySelector('#wgResetExplorer_0504')
const barsBox0504=document.querySelector('#wgBars_0504')
const sumBox0504=document.querySelector('#wgSum_0504')
const dfBox0504=document.querySelector('#wgDf_0504')
const nBox0504=document.querySelector('#wgN_0504')
const idfBox0504=document.querySelector('#wgIdf_0504')
const verdictBox0504=document.querySelector('#wgVerdictExplorer_0504')

function populateTermSelect0504(){
  if(!termSelect0504)return
  TERMS_0504.forEach(term=>{
    const opt=document.createElement('option')
    opt.value=term
    opt.textContent=`"${term}"`
    termSelect0504.appendChild(opt)
  })
  termSelect0504.value='order'
}

function renderBars0504(counts){
  const maxCount=Math.max(1,...counts.map(pair=>pair[1]))
  return counts.map(([doc,count])=>`<div class="prob-row"><span>${doc}</span><div class="bar-track"><div class="bar-fill" style="width:${(count/maxCount*100)}%"></div></div><span>${count}</span></div>`).join('')
}

function runExplorer0504(){
  const term=termSelect0504?.value||'order'
  const docIds=Object.keys(TICKETS_0504)
  const n=docIds.length
  const counts=docIds.map(doc=>[doc,termFrequency0504(term,TICKETS_0504[doc])])
  const sum=counts.reduce((total,[,count])=>total+count,0)
  const df=documentFrequency0504(term)
  const idf=inverseDocumentFrequency0504(df,n)
  if(barsBox0504)barsBox0504.innerHTML=renderBars0504(counts)
  if(sumBox0504)sumBox0504.textContent=String(sum)
  if(dfBox0504)dfBox0504.textContent=`${df} of ${n}`
  if(nBox0504)nBox0504.textContent=String(n)
  if(idfBox0504)idfBox0504.textContent=idf===null?'undefined (log of ∞)':idf.toFixed(4)
  if(verdictBox0504){
    let verdict
    if(df===0){
      verdict=`"${term}" appears in zero of the ${n} tickets. Document frequency is 0, so N / df is a division by zero before the log even runs -- idf is undefined here, not simply "very large." A real system would either skip scoring this term or apply a smoothed variant (Section 13).`
    }else if(df===n){
      verdict=`"${term}" appears in all ${n} tickets. idf = ln(${n}/${df}) = ln(1) = 0 exactly -- this term gets zero weight once Concept 05 multiplies it against any document's term frequency, no matter how often it repeats.`
    }else{
      const commonness=df>=Math.ceil(n/2)?'fairly common':'fairly rare'
      verdict=`"${term}" appears in ${df} of ${n} tickets (${commonness} in this corpus), giving idf ≈ ${idf.toFixed(4)}. That single number would be exactly the same if you looked it up while scoring any of the ${n} tickets -- only each ticket's own term-frequency bar above changes.`
    }
    verdictBox0504.textContent=verdict
  }
}

function resetExplorer0504(){
  if(termSelect0504)termSelect0504.value='order'
  if(barsBox0504)barsBox0504.innerHTML=''
  if(sumBox0504)sumBox0504.textContent='—'
  if(dfBox0504)dfBox0504.textContent='—'
  if(nBox0504)nBox0504.textContent='—'
  if(idfBox0504)idfBox0504.textContent='—'
  if(verdictBox0504)verdictBox0504.textContent='Pick a term and press "Compute TF and IDF" to see its per-document counts and its single corpus-wide IDF value.'
}

runButton0504?.addEventListener('click',runExplorer0504)
resetButton0504?.addEventListener('click',resetExplorer0504)
termSelect0504?.addEventListener('change',resetExplorer0504)

populateTermSelect0504()
resetExplorer0504()
