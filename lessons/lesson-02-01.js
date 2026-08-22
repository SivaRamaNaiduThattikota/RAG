const advancedLesson0201=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0201(){if(advancedLesson0201)advancedLesson0201.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0201);syncAdvancedTarget0201()

const llmPresets={
  gpt:{lm:true,transformer:true,autoregressive:true,scale:true,general:true},
  slm:{lm:true,transformer:true,autoregressive:true,scale:false,general:false},
  bert:{lm:true,transformer:true,autoregressive:false,scale:false,general:false},
  ngram:{lm:true,transformer:false,autoregressive:true,scale:false,general:false},
  rules:{lm:false,transformer:false,autoregressive:false,scale:false,general:false}
}
const criterionLabels={
  lm:'Predicts probability of the next linguistic unit',
  transformer:'Built from transformer attention blocks',
  autoregressive:'Generates open-ended text autoregressively (decoder-style)',
  scale:'Billions+ parameters trained on massive token corpora',
  general:'General-purpose across many language tasks'
}
let llmTraits={lm:false,transformer:false,autoregressive:false,scale:false,general:false}

const presetButtons=[...document.querySelectorAll('.llm-preset-button')]
const criteriaButtons=[...document.querySelectorAll('.llm-trait-button')]
const verdictOutput=document.querySelector('#llmVerdictOutput')

function verdictFor(traits){
  if(!traits.lm)return 'Not a language model at all -- nothing here models a probability over linguistic units, so "LLM" cannot apply.'
  if(!traits.transformer)return 'A genuine language model, but outside the transformer family the term "LLM" assumes today -- think n-gram counts or an older recurrent network.'
  if(!traits.autoregressive)return 'A transformer-based language model, but not the decoder-only autoregressive family most generative LLMs use -- closer to an encoder built for understanding than for open-ended generation.'
  if(!traits.scale)return 'A real autoregressive transformer language model -- just not at the parameter, data, and compute scale that earns the word "large." Call it a small language model.'
  if(!traits.general)return 'Large in scale and the right architecture family, but narrow in scope -- a large specialized model rather than a general-purpose LLM.'
  return 'Matches this lesson\'s working definition: transformer-based, autoregressive, at large parameter/data/compute scale, general enough for many language tasks. This is what "LLM" means in this course.'
}

function renderVerdict(){
  criteriaButtons.forEach(button=>{
    const key=button.dataset.criterion
    const active=!!llmTraits[key]
    button.classList.toggle('active',active)
    button.classList.toggle('secondary',!active)
    button.setAttribute('aria-pressed',String(active))
  })
  if(!verdictOutput)return
  const checklist=Object.entries(llmTraits).map(([key,value])=>`<div>${value?'✓':'✗'} ${criterionLabels[key]}</div>`).join('')
  verdictOutput.innerHTML=`<div class="prob-bars">${checklist}</div><p>${verdictFor(llmTraits)}</p>`
}

function applyPreset(button){
  presetButtons.forEach(item=>{
    const active=item===button
    item.classList.toggle('active',active)
    item.classList.toggle('secondary',!active)
    item.setAttribute('aria-pressed',String(active))
  })
  llmTraits={...llmPresets[button.dataset.preset]}
  renderVerdict()
}

presetButtons.forEach(button=>button.addEventListener('click',()=>applyPreset(button)))
criteriaButtons.forEach(button=>button.addEventListener('click',()=>{
  const key=button.dataset.criterion
  llmTraits={...llmTraits,[key]:!llmTraits[key]}
  presetButtons.forEach(item=>{item.classList.remove('active');item.classList.add('secondary');item.setAttribute('aria-pressed','false')})
  renderVerdict()
}))

if(presetButtons[0])applyPreset(presetButtons[0])
