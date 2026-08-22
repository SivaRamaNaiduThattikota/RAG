const advancedLesson0205=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0205(){if(advancedLesson0205)advancedLesson0205.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0205);syncAdvancedTarget0205()

const hiddenVectors={
  allows:[1,1],
  warranty:[0.5,1.5],
  capital:[2,0.3],
}
const candidateRows={
  allows:[
    {token:'12',tied:[0.95,0.95],untied:[1.40,0.60]},
    {token:'10',tied:[0.75,0.75],untied:[0.30,1.30]},
    {token:'unlimited',tied:[0.70,0.70],untied:[0.90,0.50]},
    {token:'several',tied:[0.55,0.55],untied:[0.20,0.90]},
    {token:'many',tied:[0.30,0.30],untied:[0.10,0.50]},
  ],
  warranty:[
    {token:'24',tied:[0.90,0.30],untied:[0.40,0.70]},
    {token:'12',tied:[0.50,0.50],untied:[0.70,0.20]},
    {token:'36',tied:[1.00,0.20],untied:[0.30,0.80]},
    {token:'several',tied:[0.30,0.60],untied:[0.55,0.35]},
    {token:'indefinite',tied:[0.20,0.10],untied:[0.10,0.15]},
  ],
  capital:[
    {token:'Paris',tied:[1.00,0.50],untied:[0.60,1.10]},
    {token:'Lyon',tied:[0.60,0.40],untied:[0.40,0.70]},
    {token:'France',tied:[0.50,0.90],untied:[0.90,0.30]},
    {token:'a',tied:[0.10,0.20],untied:[0.05,0.15]},
    {token:'the',tied:[0.05,0.10],untied:[0.05,0.10]},
  ],
}
const labelFor={allows:'…allows',warranty:'…warranty is',capital:'"The capital of France is"'}

const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]
const softmax=logits=>{
  const m=Math.max(...logits)
  const exps=logits.map(z=>Math.exp(z-m))
  const sum=exps.reduce((a,b)=>a+b,0)
  return exps.map(e=>e/sum)
}

const hvButtons=[...document.querySelectorAll('.hv-select-button')]
const tieButtons=[...document.querySelectorAll('.tie-mode-button')]
const headOutput=document.querySelector('#headLabOutput')
let currentVector='allows'
let currentlyTied=true

const renderHead=()=>{
  if(!headOutput)return
  const h=hiddenVectors[currentVector]
  const rows=candidateRows[currentVector]
  const mode=currentlyTied?'tied':'untied'
  const logits=rows.map(row=>dot(h,row[mode]))
  const probs=softmax(logits)
  const ranked=rows.map((row,i)=>({token:row.token,logit:logits[i],prob:probs[i]})).sort((a,b)=>b.prob-a.prob)
  const bars=ranked.map(r=>
    `<div class="prob-row"><span>${r.token}</span><div class="bar-track"><div class="bar-fill" style="width:${(r.prob*100).toFixed(0)}%"></div></div><span>${(r.prob*100).toFixed(0)}%</span></div>`
  ).join('')
  headOutput.innerHTML=`<p class="fine-print">Hidden vector after ${labelFor[currentVector]} = [${h[0]}, ${h[1]}] · ${currentlyTied?'tied':'untied'} output head — logits and softmax computed live, not looked up.</p><div class="prob-bars">${bars}</div>`
}

const selectHiddenVector=button=>{
  hvButtons.forEach(item=>{const active=item===button;item.classList.toggle('active',active);item.classList.toggle('secondary',!active);item.setAttribute('aria-pressed',String(active))})
  currentVector=button.dataset.vector
  renderHead()
}
const selectTieMode=button=>{
  tieButtons.forEach(item=>{const active=item===button;item.classList.toggle('active',active);item.classList.toggle('secondary',!active);item.setAttribute('aria-pressed',String(active))})
  currentlyTied=button.dataset.tied==='true'
  renderHead()
}

hvButtons.forEach(button=>button.addEventListener('click',()=>selectHiddenVector(button)))
tieButtons.forEach(button=>button.addEventListener('click',()=>selectTieMode(button)))
if(headOutput)renderHead()
