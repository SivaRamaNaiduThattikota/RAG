const advancedLesson0207=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0207(){if(advancedLesson0207)advancedLesson0207.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0207);syncAdvancedTarget0207()

// toy context window, matching Section 03's running Oracle RAG prompt
const CONTEXT_WINDOW=8000
const FIXED_SYSTEM=300
const FIXED_QUERY=60
const RESERVED_OUTPUT=500
const TOKENS_PER_EXAMPLE=250
const TOKENS_PER_CHUNK=900
const TOKENS_HISTORY=600

const budgetItems={chunk1:{label:'Retrieved chunk 1',tokens:TOKENS_PER_CHUNK,active:false},chunk2:{label:'Retrieved chunk 2',tokens:TOKENS_PER_CHUNK,active:false},history:{label:'Conversation history',tokens:TOKENS_HISTORY,active:false}}

let exampleCount=0

const exampleButtons=[...document.querySelectorAll('.example-select-button')]
const toggleButtons=[...document.querySelectorAll('.budget-toggle-button')]
const budgetBar=document.querySelector('#budgetBar')
const budgetMeta=document.querySelector('#budgetMeta')
const iclOutput=document.querySelector('#iclLabOutput')

// toy ICL curve: more worked examples -> the "correct format" reading sharpens,
// same shape as Section 12's from-scratch conditioning demo, zero weight change either way
const iclProbByExamples=[0.22,0.48,0.65,0.79,0.90]

const segmentColor={
  system:'#d7ff53',
  examples:'#5ee6c3',
  chunk1:'#7fb8ff',
  chunk2:'#4a8fe0',
  history:'#f5a35c',
  query:'#e6e6e6',
  reserved:'#c9c9c9',
}

const renderBudget=()=>{
  const parts=[
    {key:'system',label:'System',tokens:FIXED_SYSTEM},
    {key:'query',label:'Query',tokens:FIXED_QUERY},
    {key:'examples',label:`${exampleCount} example${exampleCount===1?'':'s'}`,tokens:exampleCount*TOKENS_PER_EXAMPLE},
  ]
  Object.entries(budgetItems).forEach(([key,item])=>{if(item.active)parts.push({key,label:item.label,tokens:item.tokens})})
  parts.push({key:'reserved',label:'Reserved for answer',tokens:RESERVED_OUTPUT})

  const usedBeforeReserve=parts.filter(p=>p.key!=='reserved').reduce((sum,p)=>sum+p.tokens,0)
  const total=usedBeforeReserve+RESERVED_OUTPUT
  const overflow=Math.max(0,total-CONTEXT_WINDOW)

  if(budgetBar){
    budgetBar.innerHTML=parts.filter(p=>p.tokens>0).map(p=>{
      const widthPct=Math.max(2,(p.tokens/CONTEXT_WINDOW)*100)
      return `<div class="budget-segment" style="width:${widthPct}%;background:${segmentColor[p.key]||'#ccc'}" title="${p.label}: ${p.tokens} tokens">${p.tokens}</div>`
    }).join('')
  }

  if(budgetMeta){
    const statusText=overflow>0
      ? `<span class="budget-overflow">Over budget by ${overflow} tokens — something must be trimmed before this request can run.</span>`
      : `<span>${CONTEXT_WINDOW-total} tokens of headroom left in the window.</span>`
    budgetMeta.innerHTML=`<span>${Math.min(total,CONTEXT_WINDOW+overflow)} / ${CONTEXT_WINDOW} tokens used</span>${statusText}`
  }

  if(iclOutput){
    const correctProb=iclProbByExamples[exampleCount]
    const driftProb=1-correctProb
    iclOutput.innerHTML=`
      <p class="fine-print">Weight change from adding these examples: 0. Only the input changed — same frozen model, every time.</p>
      <div class="prob-bars">
        <div class="prob-row"><span>Correct format ✓</span><div class="bar-track"><div class="bar-fill" style="width:${(correctProb*100).toFixed(0)}%"></div></div><span>${(correctProb*100).toFixed(0)}%</span></div>
        <div class="prob-row"><span>Free-form drift</span><div class="bar-track"><div class="bar-fill" style="width:${(driftProb*100).toFixed(0)}%"></div></div><span>${(driftProb*100).toFixed(0)}%</span></div>
      </div>
      <p>${exampleCount===0?'With no worked examples in context, the model has nothing to condition its format on beyond the instruction itself.':`With ${exampleCount} worked example${exampleCount===1?'':'s'} in context, attention over those example tokens (Concept 04) pulls the output toward the format they demonstrate.`}</p>`
  }
}

const selectExamples=button=>{
  exampleButtons.forEach(item=>{const active=item===button;item.classList.toggle('active',active);item.classList.toggle('secondary',!active);item.setAttribute('aria-pressed',String(active))})
  exampleCount=Number(button.dataset.examples)
  renderBudget()
}
const toggleItem=button=>{
  const key=button.dataset.item
  const item=budgetItems[key]
  if(!item)return
  item.active=!item.active
  button.classList.toggle('active',item.active)
  button.classList.toggle('secondary',!item.active)
  button.setAttribute('aria-pressed',String(item.active))
  renderBudget()
}

exampleButtons.forEach(button=>button.addEventListener('click',()=>selectExamples(button)))
toggleButtons.forEach(button=>button.addEventListener('click',()=>toggleItem(button)))
if(budgetBar)renderBudget()
