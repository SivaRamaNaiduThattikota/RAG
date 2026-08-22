const advancedLesson0307=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0307(){if(advancedLesson0307)advancedLesson0307.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0307)
syncAdvancedTarget0307()

// Section 09/10's own numbers: a fixed RAG baseline (top-8 chunks, ~750 tokens
// each) against a corpus that grows document by document, paste-everything style.
const PER_DOC_TOKENS=2000
const RAG_TOKENS=6000
const WINDOWS={modest:8000,generous:200000}

let corpusDocs=40
let selectedWindow=WINDOWS.generous

const docsRange=document.querySelector('#corpusDocsRange0307')
const docsValue=document.querySelector('#corpusDocsValue0307')
const windowButtons=[...document.querySelectorAll('.window-select-button')]
const ledgerBar=document.querySelector('#ledgerBar0307')
const ledgerMeta=document.querySelector('#ledgerMeta0307')
const ledgerOutput=document.querySelector('#ledgerOutput0307')

const middleRiskTier=docs=>{
  if(docs<=10)return {label:'mild',note:'still inside the range Concept 10’s own beginner examples used — a bit of edge-favoring skew, nothing severe yet.'}
  if(docs<100)return {label:'severe',note:'already well past the handful of sources where Concept 10 first demonstrated a measurable middle penalty — a correct answer buried mid-list is a real risk here.'}
  return {label:'worst-case',note:'with this many equally-weighted sources sharing one softmax’s attention budget, a correct answer sitting anywhere near the middle is close to invisible.'}
}

const renderLedger=()=>{
  const corpusTokens=corpusDocs*PER_DOC_TOKENS
  const fits=corpusTokens<=selectedWindow
  const k=corpusTokens/RAG_TOKENS
  const relativeCost=k*k
  const tier=middleRiskTier(corpusDocs)

  if(ledgerBar){
    const pct=Math.min(100,(corpusTokens/selectedWindow)*100)
    ledgerBar.innerHTML=`<div class="budget-segment" style="width:${Math.max(2,pct)}%;background:${fits?'#5ee6c3':'#ff7957'}" title="${corpusTokens.toLocaleString()} corpus tokens">${corpusTokens.toLocaleString()}</div>`
  }

  if(ledgerMeta){
    const usedLine=`<span>${corpusTokens.toLocaleString()} corpus tokens / ${selectedWindow.toLocaleString()} window tokens</span>`
    const statusLine=fits
      ?`<span>${(selectedWindow-corpusTokens).toLocaleString()} tokens of headroom left.</span>`
      :`<span class="budget-overflow">Exceeds the window by ${(corpusTokens-selectedWindow).toLocaleString()} tokens — cannot be attempted as one long-context prompt.</span>`
    ledgerMeta.innerHTML=usedLine+statusLine
  }

  if(ledgerOutput){
    const fitLine=fits
      ?`<b>Fits the chosen window.</b> ${corpusDocs} document${corpusDocs===1?'':'s'} at ~${PER_DOC_TOKENS.toLocaleString()} tokens each = ${corpusTokens.toLocaleString()} tokens.`
      :`<b>Does not fit the chosen window.</b> ${corpusDocs} document${corpusDocs===1?'':'s'} = ${corpusTokens.toLocaleString()} tokens, more than the ${selectedWindow.toLocaleString()}-token ceiling.`
    const costLine=`<b>Relative attention cost vs. RAG's ~${RAG_TOKENS.toLocaleString()}-token baseline:</b> k = ${k.toFixed(1)}× the length, so relative cost ≈ k² ≈ ${Math.round(relativeCost).toLocaleString()}× (Module 02 Concept 07's ratio, applied here — not re-derived).`
    const riskLine=`<b>Lost-in-the-middle risk at ${corpusDocs} source${corpusDocs===1?'':'s'} (Module 02 Concept 10, cited):</b> ${tier.label} — ${tier.note}`
    const boundaryLine=!fits
      ?`<p class="fine-print">The cost and risk figures above are shown as if this prompt could be sent. In reality, a corpus this size can't even enter the window — retrieval isn't optional here, it's the only way in.</p>`
      :''
    ledgerOutput.innerHTML=`<p>${fitLine}</p><p>${costLine}</p><p>${riskLine}</p>${boundaryLine}`
  }
}

const selectWindow=button=>{
  windowButtons.forEach(item=>{const active=item===button;item.classList.toggle('active',active);item.classList.toggle('secondary',!active);item.setAttribute('aria-pressed',String(active))})
  selectedWindow=Number(button.dataset.window)
  renderLedger()
}

docsRange?.addEventListener('input',()=>{
  corpusDocs=Number(docsRange.value)
  if(docsValue)docsValue.textContent=String(corpusDocs)
  renderLedger()
})
windowButtons.forEach(button=>button.addEventListener('click',()=>selectWindow(button)))

if(ledgerBar)renderLedger()
