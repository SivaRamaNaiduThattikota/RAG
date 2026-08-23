const advancedLesson0810=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0810(){if(advancedLesson0810)advancedLesson0810.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0810)
syncAdvancedTarget0810()

// Section 14's lab: The Selection Funnel. Corpus size is fixed at
// 2,000,000 chunks, matching Section 10's worked example exactly, so the
// four dimensions' GB costs are fixed, already-verified constants -- only
// the budget line and the language/domain verdict move live.

const DIMENSIONS_0810=[
  {dim:384, gb:3.072, model:'all-MiniLM-L6-v2', pointId:'pt384_0810'},
  {dim:768, gb:6.144, model:'BERT-base', pointId:'pt768_0810'},
  {dim:1536, gb:12.288, model:'OpenAI text-embedding-3-small / ada-002', pointId:'pt1536_0810'},
  {dim:3072, gb:24.576, model:'OpenAI text-embedding-3-large', pointId:'pt3072_0810'},
]

const AXIS_Y0_0810=176, AXIS_SCALE_0810=6, AXIS_TOP_0810=14

function gbToY0810(gb){return Math.max(AXIS_TOP_0810, AXIS_Y0_0810-AXIS_SCALE_0810*gb)}

const languageButtons0810=[...document.querySelectorAll('#s14 [data-language]')]
const domainButtons0810=[...document.querySelectorAll('#s14 [data-domain]')]
const budgetSlider0810=document.querySelector('#budgetSlider_0810')
const budgetOut0810=document.querySelector('#budgetOut_0810')
const budgetLine0810=document.querySelector('#budgetLine_0810')
const budgetLineLabel0810=document.querySelector('#budgetLineLabel_0810')
const funnelTable0810=document.querySelector('#funnelTable_0810')
const funnelReadout0810=document.querySelector('#funnelReadout_0810')
const funnelVerdict0810=document.querySelector('#funnelVerdict_0810')

let currentLanguage0810='single'
let currentDomain0810='general'

function syncButtons0810(){
  languageButtons0810.forEach(btn=>btn.classList.toggle('active',btn.dataset.language===currentLanguage0810))
  domainButtons0810.forEach(btn=>btn.classList.toggle('active',btn.dataset.domain===currentDomain0810))
}

function categoryLabel0810(){
  const multilingual=currentLanguage0810==='multi'
  const specialized=currentDomain0810==='specialized'
  if(multilingual&&specialized)return 'Multilingual + domain-specific -- rare combination, check MTEB\'s task-specific leaderboard filters or plan a routed/ensemble approach'
  if(multilingual)return 'Multilingual'
  if(specialized)return 'Domain-specific'
  return 'General-purpose'
}

function render0810(){
  const budget=Number(budgetSlider0810.value)
  if(budgetOut0810)budgetOut0810.textContent=budget.toFixed(1)+' GB'

  const lineY=gbToY0810(budget)
  if(budgetLine0810){
    budgetLine0810.setAttribute('y1',lineY)
    budgetLine0810.setAttribute('y2',lineY)
  }
  if(budgetLineLabel0810){
    budgetLineLabel0810.setAttribute('y',lineY-4)
    budgetLineLabel0810.textContent=budget.toFixed(1)+' GB BUDGET'
  }

  let survivorCount=0
  const survivors=[]
  DIMENSIONS_0810.forEach(row=>{
    const fits=row.gb<=budget
    if(fits){survivorCount++;survivors.push(row.dim)}
    const point=document.querySelector('#'+row.pointId)
    if(point)point.setAttribute('fill',fits?'#2f6f5c':'#5b6b64')
    const tr=funnelTable0810?.querySelector(`tr[data-dim="${row.dim}"]`)
    const statusCell=tr?.querySelector('.funnel-status')
    if(statusCell){
      statusCell.textContent=fits?'Fits':'Exceeds'
      tr.style.background=fits?'rgba(47,111,92,.12)':'rgba(91,107,100,.10)'
    }
  })

  if(funnelReadout0810){
    funnelReadout0810.innerHTML=`
      <div><span>BUDGET</span><b>${budget.toFixed(1)} GB</b></div>
      <div><span>SURVIVING DIMENSIONS</span><b>${survivors.length ? survivors.join(', ')+'d' : 'none'}</b></div>
      <div><span>RECOMMENDED CATEGORY</span><b>${categoryLabel0810()}</b></div>
    `
  }

  if(funnelVerdict0810){
    funnelVerdict0810.innerHTML=`<b>${survivorCount} of 4 dimensions survive the budget filter.</b> Category: ${categoryLabel0810()}. Corpus fixed at 2,000,000 chunks -- Step 4 (MTEB rank) runs on whatever survived Steps 1-3, not inside this lab.`
  }
}

languageButtons0810.forEach(btn=>btn.addEventListener('click',()=>{
  currentLanguage0810=btn.dataset.language
  syncButtons0810()
  render0810()
}))
domainButtons0810.forEach(btn=>btn.addEventListener('click',()=>{
  currentDomain0810=btn.dataset.domain
  syncButtons0810()
  render0810()
}))
budgetSlider0810?.addEventListener('input',render0810)

syncButtons0810()
render0810()
