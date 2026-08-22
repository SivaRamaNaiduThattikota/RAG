const advancedLesson0409=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0409(){if(advancedLesson0409)advancedLesson0409.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0409)
syncAdvancedTarget0409()

// Section 14's lab: The Complexity Scaling Lab -- every earlier Module 04 lab
// (06-08) dragged SCORES or a TEMPERATURE and watched a probability or a loss
// respond. This one drags neither -- it drags the size of the problem itself:
// the number of candidates n and the embedding dimension d. Nothing here is a
// probability or a loss; every readout is an operation count or a byte count,
// computed directly from Big-O's n and d, matching the concept's actual
// subject (cost at scale, not the correctness of any one score).

const DEFAULT_N_EXP_0409=4   // n = 10^4 = 10,000
const DEFAULT_D_0409=768

const nSlider0409=document.querySelector('#cxN_0409')
const dSlider0409=document.querySelector('#cxD_0409')
const nOut0409=document.querySelector('#cxNOut_0409')
const dOut0409=document.querySelector('#cxDOut_0409')

const dotBox0409=document.querySelector('#cxDot_0409')
const searchBox0409=document.querySelector('#cxSearch_0409')
const sortBox0409=document.querySelector('#cxSort_0409')
const spaceBox0409=document.querySelector('#cxSpace_0409')

const dotBar0409=document.querySelector('#cxBarDot_0409')
const dotBarOut0409=document.querySelector('#cxBarDotOut_0409')
const sortBar0409=document.querySelector('#cxBarSort_0409')
const sortBarOut0409=document.querySelector('#cxBarSortOut_0409')
const searchBar0409=document.querySelector('#cxBarSearch_0409')
const searchBarOut0409=document.querySelector('#cxBarSearchOut_0409')

const verdictBox0409=document.querySelector('#cxVerdict_0409')

const presetSmall0409=document.querySelector('#cxPresetSmall_0409')
const presetRealistic0409=document.querySelector('#cxPresetRealistic_0409')
const presetLarge0409=document.querySelector('#cxPresetLarge_0409')
const presetReset0409=document.querySelector('#cxPresetReset_0409')

function fmtCount0409(n){
  if(n>=1e9)return(n/1e9).toFixed(2)+'B'
  if(n>=1e6)return(n/1e6).toFixed(2)+'M'
  if(n>=1e3)return(n/1e3).toFixed(1)+'K'
  return Math.round(n).toString()
}

function fmtBytes0409(b){
  if(b>=1e9)return(b/1e9).toFixed(2)+' GB'
  if(b>=1e6)return(b/1e6).toFixed(2)+' MB'
  if(b>=1e3)return(b/1e3).toFixed(1)+' KB'
  return Math.round(b)+' B'
}

function setState0409(nExp,d){
  if(nSlider0409)nSlider0409.value=String(nExp)
  if(dSlider0409)dSlider0409.value=String(d)
}

function render0409(){
  if(!nSlider0409||!dSlider0409)return
  const nExp=Number(nSlider0409.value)
  const n=Math.pow(10,nExp)
  const d=Number(dSlider0409.value)

  if(nOut0409)nOut0409.textContent=n.toLocaleString()
  if(dOut0409)dOut0409.textContent=d.toLocaleString()

  const dotCost=d                     // O(d) -- one similarity score (Concept 03)
  const searchCost=n*d                // O(n*d) -- brute-force search over n candidates
  const sortCost=n*Math.log2(n)       // O(n log n) -- sorting n scores (Concept 08's ranking)
  const spaceBytes=n*d*4              // n vectors, d dims each, 4 bytes per float32

  if(dotBox0409)dotBox0409.textContent=fmtCount0409(dotCost)+' ops'
  if(searchBox0409)searchBox0409.textContent=fmtCount0409(searchCost)+' ops'
  if(sortBox0409)sortBox0409.textContent=fmtCount0409(sortCost)+' comparisons'
  if(spaceBox0409)spaceBox0409.textContent=fmtBytes0409(spaceBytes)

  const maxVal=Math.max(dotCost,searchCost,sortCost)
  const logMax=Math.log10(maxVal)
  function barWidth(v){
    if(v<=1)return 4
    return Math.max((Math.log10(v)/logMax)*100,4)
  }
  if(dotBar0409)dotBar0409.style.width=barWidth(dotCost)+'%'
  if(dotBarOut0409)dotBarOut0409.textContent=fmtCount0409(dotCost)
  if(sortBar0409)sortBar0409.style.width=barWidth(sortCost)+'%'
  if(sortBarOut0409)sortBarOut0409.textContent=fmtCount0409(sortCost)
  if(searchBar0409)searchBar0409.style.width=barWidth(searchCost)+'%'
  if(searchBarOut0409)searchBarOut0409.textContent=fmtCount0409(searchCost)

  const ratio=searchCost/sortCost
  const log2n=Math.log2(n)
  if(verdictBox0409){
    verdictBox0409.textContent=`Brute-force search costs ${fmtCount0409(searchCost)} operations -- about ${ratio.toFixed(1)}x more than sorting the ${fmtCount0409(n)} results afterward (${fmtCount0409(sortCost)} comparisons). Sorting would only overtake search if d fell below log2(n) (here log2(n) = ${log2n.toFixed(1)}) -- no real embedding model has a dimension that small, so search cost dominates at every setting on these sliders.`
  }
}

;[nSlider0409,dSlider0409].forEach(el=>el?.addEventListener('input',render0409))

presetSmall0409?.addEventListener('click',()=>{setState0409(2,64);render0409()})
presetRealistic0409?.addEventListener('click',()=>{setState0409(4,768);render0409()})
presetLarge0409?.addEventListener('click',()=>{setState0409(6,1536);render0409()})
presetReset0409?.addEventListener('click',()=>{setState0409(DEFAULT_N_EXP_0409,DEFAULT_D_0409);render0409()})

render0409()
