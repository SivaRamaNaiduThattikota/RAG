const advancedLesson0202=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0202(){if(advancedLesson0202)advancedLesson0202.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0202);syncAdvancedTarget0202()

const bpeCorpora={
  chunk:{chunk:4,chunks:3,chunked:2,chunking:5},
  embed:{embed:3,embeds:2,embedded:4,embedding:5},
  index:{index:5,indexed:3,indexing:4,indexes:2}
}

let bpeWords=[]
let bpeVocab=[]
let bpeStep=0
let bpeCorpusKey='chunk'
let bpeDone=false

const splitWord=word=>[...word,'_']

function resetBpe(key){
  bpeCorpusKey=key||bpeCorpusKey
  const corpus=bpeCorpora[bpeCorpusKey]
  bpeWords=Object.entries(corpus).map(([word,count])=>({chars:word,count,symbols:splitWord(word)}))
  const alphabet=new Set()
  bpeWords.forEach(w=>w.symbols.forEach(s=>alphabet.add(s)))
  bpeVocab=[...alphabet]
  bpeStep=0
  bpeDone=false
  renderBpe(null)
}

function pairCounts(){
  const counts=new Map()
  bpeWords.forEach(w=>{
    for(let i=0;i<w.symbols.length-1;i++){
      const pair=`${w.symbols[i]} ${w.symbols[i+1]}`
      counts.set(pair,(counts.get(pair)||0)+w.count)
    }
  })
  return counts
}

function stepBpe(){
  if(bpeDone)return
  const counts=pairCounts()
  if(counts.size===0){bpeDone=true;renderBpe(null);return}
  const sorted=[...counts.entries()].sort((a,b)=>b[1]-a[1]).slice(0,5)
  const [bestPair,bestFreq]=sorted[0]
  const [a,b]=bestPair.split(' ')
  const merged=a+b
  bpeWords.forEach(w=>{
    const next=[]
    let i=0
    while(i<w.symbols.length){
      if(i<w.symbols.length-1&&w.symbols[i]===a&&w.symbols[i+1]===b){next.push(merged);i+=2}
      else{next.push(w.symbols[i]);i+=1}
    }
    w.symbols=next
  })
  bpeVocab=[...bpeVocab,merged]
  bpeStep+=1
  renderBpe({pair:bestPair,freq:bestFreq,merged,sorted})
}

function renderBpe(last){
  const output=document.querySelector('#bpeLabOutput')
  if(!output)return
  const topFreq=last?last.sorted[0][1]:1
  const pairRows=last?last.sorted.map(([pair,freq])=>{
    const pct=Math.round(freq/topFreq*100)
    const label=pair.replace(' ',' + ')
    return `<div class="prob-row"><span>${label}</span><div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div><span>${freq}</span></div>`
  }).join(''):'<div class="prob-row"><span>--</span><div class="bar-track"><div class="bar-fill" style="width:0%"></div></div><span>0</span></div>'
  const mergeLine=last?`<p>Merge ${bpeStep}: <code>${last.pair.replace(' ',' + ')}</code> &rarr; <code>${last.merged}</code> (weighted frequency ${last.freq})</p>`:'<p>No merges yet -- every word below is still split into raw characters plus an end-of-word marker.</p>'
  const wordRows=bpeWords.map(w=>`<div><code>${w.chars}</code> &times;${w.count} &rarr; ${w.symbols.map(s=>`<code>${s}</code>`).join(' ')}</div>`).join('')
  const doneLine=bpeDone?'<p class="fine-print">No pair repeats anymore -- every word in this toy corpus has collapsed into a single token.</p>':''
  output.innerHTML=`<div class="prob-bars">${pairRows}</div>${mergeLine}<div class="sample-output">${wordRows}</div>${doneLine}<p class="fine-print">Step ${bpeStep} &middot; vocabulary size ${bpeVocab.length}</p>`
}

const corpusButtons=[...document.querySelectorAll('.bpe-corpus-button')]
const stepButton=document.querySelector('.bpe-step-button')
const resetButton=document.querySelector('.bpe-reset-button')

corpusButtons.forEach(button=>button.addEventListener('click',()=>{
  corpusButtons.forEach(item=>{
    const active=item===button
    item.classList.toggle('active',active)
    item.classList.toggle('secondary',!active)
    item.setAttribute('aria-pressed',String(active))
  })
  resetBpe(button.dataset.corpus)
}))
stepButton?.addEventListener('click',stepBpe)
resetButton?.addEventListener('click',()=>resetBpe())

if(corpusButtons[0])resetBpe(corpusButtons[0].dataset.corpus)
