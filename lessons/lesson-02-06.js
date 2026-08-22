const advancedLesson0206=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0206(){if(advancedLesson0206)advancedLesson0206.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0206);syncAdvancedTarget0206()

// same toy logits as the worked example (Section 10): position after "...allows"
const tokenNames=['unlimited','several','many']
const toyLogits=[1.2,0.9,0.3]

const stageInfo={
  pretraining:{groups:['wmEmbed','wmBlocks','wmHead'],lossLabel:'Cross-entropy (next token)',computesCE:true,note:'Every position in raw text becomes a true-next-token example — no labeling needed.'},
  sft:{groups:['wmEmbed','wmBlocks','wmHead'],lossLabel:'Cross-entropy (curated pairs)',computesCE:true,note:'Same loss as pretraining, computed only over curated instruction-response tokens.'},
  alignment:{groups:['wmEmbed','wmBlocks','wmHead'],lossLabel:'Preference comparison (preview)',computesCE:false,note:'Compares whole candidate responses instead of one true token — full RLHF mechanics are out of scope for RAG Atlas.'},
  inference:{groups:[],lossLabel:'None — forward pass only',computesCE:false,note:'Weights are read, never written. No loss is computed and no gradient exists.'},
}

const softmax=logits=>{
  const m=Math.max(...logits)
  const exps=logits.map(z=>Math.exp(z-m))
  const sum=exps.reduce((a,b)=>a+b,0)
  return exps.map(e=>e/sum)
}

const stageButtons=[...document.querySelectorAll('.stage-select-button')]
const tokenButtons=[...document.querySelectorAll('.truetoken-select-button')]
const wmNodes={
  wmEmbed:document.querySelector('#wmEmbed'),
  wmBlocks:document.querySelector('#wmBlocks'),
  wmHead:document.querySelector('#wmHead'),
}
const wmLossLabel=document.querySelector('#wmLossLabel')
const wmTrueLabel=document.querySelector('#wmTrueLabel')
const trainingOutput=document.querySelector('#trainingLabOutput')

let currentStage='pretraining'
let currentTrueIndex=0

const renderLab=()=>{
  if(!trainingOutput)return
  const info=stageInfo[currentStage]
  Object.entries(wmNodes).forEach(([id,node])=>{if(node)node.classList.toggle('active',info.groups.includes(id))})
  if(wmLossLabel)wmLossLabel.textContent=info.lossLabel
  if(wmTrueLabel)wmTrueLabel.textContent=info.computesCE?tokenNames[currentTrueIndex]:'n/a for this stage'

  const groupText=info.groups.length?info.groups.map(id=>id.replace('wm','')).join(', '):'none — all weight groups stay frozen'

  if(!info.computesCE){
    trainingOutput.innerHTML=`<p class="fine-print">Weight groups touched: ${groupText}.</p><p>${info.note}</p>`
    return
  }

  const probs=softmax(toyLogits)
  const loss=-Math.log(probs[currentTrueIndex])
  const grad=probs.map((p,i)=>i===currentTrueIndex?(p-1):p)
  const ranked=tokenNames.map((name,i)=>({name,prob:probs[i],grad:grad[i],isTrue:i===currentTrueIndex})).sort((a,b)=>b.prob-a.prob)
  const bars=ranked.map(r=>
    `<div class="prob-row"><span>${r.name}${r.isTrue?' ✓':''}</span><div class="bar-track"><div class="bar-fill" style="width:${(r.prob*100).toFixed(0)}%"></div></div><span>${(r.prob*100).toFixed(0)}% · ∂L/∂z=${r.grad.toFixed(2)}</span></div>`
  ).join('')
  trainingOutput.innerHTML=`<p class="fine-print">Weight groups touched: ${groupText}. True token: "${tokenNames[currentTrueIndex]}" · loss = −log(${probs[currentTrueIndex].toFixed(3)}) = ${loss.toFixed(3)}</p><div class="prob-bars">${bars}</div><p>${info.note}</p>`
}

const selectStage=button=>{
  stageButtons.forEach(item=>{const active=item===button;item.classList.toggle('active',active);item.classList.toggle('secondary',!active);item.setAttribute('aria-pressed',String(active))})
  currentStage=button.dataset.stage
  renderLab()
}
const selectTrueToken=button=>{
  tokenButtons.forEach(item=>{const active=item===button;item.classList.toggle('active',active);item.classList.toggle('secondary',!active);item.setAttribute('aria-pressed',String(active))})
  currentTrueIndex=Number(button.dataset.token)
  renderLab()
}

stageButtons.forEach(button=>button.addEventListener('click',()=>selectStage(button)))
tokenButtons.forEach(button=>button.addEventListener('click',()=>selectTrueToken(button)))
if(trainingOutput)renderLab()
