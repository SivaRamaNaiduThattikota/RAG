const advancedLesson0901=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0901(){if(advancedLesson0901)advancedLesson0901.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0901)
syncAdvancedTarget0901()

// Section 14's lab: The Latency Budget Checker. Module 04 Concept 09's own
// Complexity Scaling Lab let a learner drag n and d and watch three raw
// operation counts respond on log-scale bars, but deliberately never
// converted any of them into real time. This lab is the direct continuation
// of that unfinished thread: it applies one real, cited hardware FLOPS rate
// (484 GFLOPS, a stock AMD Ryzen 5 3600) to turn the exact 2d-1 operation
// count into an actual millisecond figure, checks that figure against a
// chosen real-world latency budget with a PASS/FAIL verdict, and runs the
// inverse calculation Concept 09 never asked -- how many vectors fit inside
// the budget at all.

const RATE_0901=484e9 // FLOPS -- AMD Ryzen 5 3600, Wikipedia's FLOPS page

const N_VALUES_0901=[1000000,10000000,100000000,1000000000]
const D_VALUES_0901=[128,384,768,1024,1536,3072]

const nSlider0901=document.querySelector('#latN_0901')
const dSlider0901=document.querySelector('#latD_0901')
const nOut0901=document.querySelector('#latNOut_0901')
const dOut0901=document.querySelector('#latDOut_0901')

const budgetButtons0901=[...document.querySelectorAll('#s14 [data-budget]')]

const costBox0901=document.querySelector('#latCost_0901')
const timeBox0901=document.querySelector('#latTime_0901')
const storageBox0901=document.querySelector('#latStorage_0901')
const maxBox0901=document.querySelector('#latMax_0901')

const barFill0901=document.querySelector('#latBarFill_0901')
const barOut0901=document.querySelector('#latBarOut_0901')
const barRow0901=document.querySelector('#latBarRow_0901')

const verdictBox0901=document.querySelector('#latVerdict_0901')

let currentBudgetMs0901=100

function opsExact0901(d){return 2*d-1}

function fmtOps0901(n){
  if(n>=1e9)return(n/1e9).toFixed(2)+'B ops'
  if(n>=1e6)return(n/1e6).toFixed(2)+'M ops'
  if(n>=1e3)return(n/1e3).toFixed(1)+'K ops'
  return Math.round(n)+' ops'
}

function fmtTime0901(ms){
  if(ms>=1000)return(ms/1000).toFixed(3)+' s'
  return ms.toFixed(4)+' ms'
}

function fmtStorage0901(gb){
  if(gb>=1000)return(gb/1000).toFixed(3)+' TB'
  return gb.toFixed(3)+' GB'
}

function syncBudgetButtons0901(){
  budgetButtons0901.forEach(btn=>btn.classList.toggle('active',Number(btn.dataset.budget)===currentBudgetMs0901))
}

function render0901(){
  if(!nSlider0901||!dSlider0901)return
  const n=N_VALUES_0901[Number(nSlider0901.value)]
  const d=D_VALUES_0901[Number(dSlider0901.value)]

  if(nOut0901)nOut0901.textContent=n.toLocaleString()
  if(dOut0901)dOut0901.textContent=d.toLocaleString()

  const ops=opsExact0901(d)
  const searchFlops=n*ops
  const timeMs=(searchFlops/RATE_0901)*1000
  const storageGB=(n*d*4)/1e9
  const budgetMs=currentBudgetMs0901
  const withinBudget=timeMs<=budgetMs
  const nMax=Math.floor((budgetMs/1000)*RATE_0901/ops)

  if(costBox0901)costBox0901.textContent=fmtOps0901(searchFlops)
  if(timeBox0901)timeBox0901.textContent=fmtTime0901(timeMs)
  if(storageBox0901)storageBox0901.textContent=fmtStorage0901(storageGB)
  if(maxBox0901)maxBox0901.textContent=nMax.toLocaleString()

  const pctOfBudget=(timeMs/budgetMs)*100
  const barWidth=Math.min(pctOfBudget,300)
  if(barFill0901)barFill0901.style.width=barWidth+'%'
  if(barOut0901)barOut0901.textContent=pctOfBudget.toFixed(2)+'% of budget'
  if(barRow0901)barRow0901.classList.toggle('winner',!withinBudget)

  if(verdictBox0901){
    const nStr=n.toLocaleString()
    const dStr=d.toLocaleString()
    const timeStr=fmtTime0901(timeMs)
    const nMaxStr=nMax.toLocaleString()
    if(withinBudget){
      verdictBox0901.className='callout'
      verdictBox0901.innerHTML=`At n=${nStr} and d=${dStr}, one query's exhaustive search takes ≈${timeStr} -- well within a ${budgetMs} ms budget. At this dimension and budget, brute force could handle up to ${nMaxStr} vectors before exceeding it.`
    }else{
      const overBy=(timeMs/budgetMs)
      verdictBox0901.className='callout warning'
      verdictBox0901.innerHTML=`At n=${nStr} and d=${dStr}, one query's exhaustive search takes ≈${timeStr} -- this exceeds your ${budgetMs} ms budget by ${overBy.toFixed(1)}x. At this dimension and budget, brute force could handle up to ${nMaxStr} vectors before exceeding it. Real corpora at this size are exactly why Concept 02 introduces an approximate alternative.`
    }
  }
}

;[nSlider0901,dSlider0901].forEach(el=>el?.addEventListener('input',render0901))

budgetButtons0901.forEach(btn=>btn.addEventListener('click',()=>{
  currentBudgetMs0901=Number(btn.dataset.budget)
  syncBudgetButtons0901()
  render0901()
}))

syncBudgetButtons0901()
render0901()
