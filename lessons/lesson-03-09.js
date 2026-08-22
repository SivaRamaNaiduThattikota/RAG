const advancedLesson0309=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0309(){if(advancedLesson0309)advancedLesson0309.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0309)
syncAdvancedTarget0309()

// Section 14's lab: classify a pipeline as naive, advanced, or modular RAG
// from three independent flags, exactly like Section 12's from-scratch
// classify_rag_shape function -- composability decides first, then whether
// any pre-/post-retrieval step has been added.
const SHAPES={
  naive:{label:'Naive RAG',note:'Retrieve top-k, then generate — nothing added before or after retrieval, one fixed order. Concept 06’s pipeline, exactly.'},
  advanced:{label:'Advanced RAG',note:'The same fixed order as naive RAG, with at least one pre- or post-retrieval step inserted. Named here; Modules 15-17 build the steps themselves.'},
  modular:{label:'Modular RAG',note:'Stages are swappable, composable components — no single fixed order exists. This is true regardless of how many pre-/post-retrieval steps happen to also be present.'}
}

const state0309={pre:false,post:false,modular:false}

const PRESETS={
  naive:{pre:false,post:false,modular:false},
  advanced:{pre:true,post:true,modular:false},
  modular:{pre:false,post:false,modular:true}
}

const toggleButtons0309=[...document.querySelectorAll('#shapeToggles0309 button')]
const presetButtons0309=[...document.querySelectorAll('#shapePresets0309 button')]
const shapeDiagram0309=document.querySelector('#shapeDiagram0309')
const shapeResult0309=document.querySelector('#shapeResult0309')

const classifyShape=({pre,post,modular})=>{
  if(modular)return 'modular'
  if(pre||post)return 'advanced'
  return 'naive'
}

const renderDiagram=()=>{
  if(!shapeDiagram0309)return
  if(state0309.modular){
    shapeDiagram0309.innerHTML=`
      <div class="diagram-node"><b>Router</b><small>decides which components run this time</small></div>
      <div class="diagram-node"><b>Retrieval${state0309.pre?' (+ pre-retrieval)':''}</b><small>swappable — may or may not run as shown</small></div>
      <div class="diagram-node"><b>Re-ranking${state0309.post?' (active)':' (skippable)'}</b><small>composable — present for some requests, not others</small></div>
      <div class="diagram-node active"><b>Generation</b><small>the one stage every request still reaches</small></div>`
    return
  }
  const nodes=['<div class="diagram-node"><b>Query</b><small>arrives</small></div>']
  if(state0309.pre)nodes.push('<div class="diagram-node"><b>Pre-retrieval</b><small>e.g. query rewriting</small></div>')
  nodes.push('<div class="diagram-node active"><b>Retrieval</b><small>top-k, fixed order</small></div>')
  if(state0309.post)nodes.push('<div class="diagram-node"><b>Post-retrieval</b><small>e.g. re-ranking</small></div>')
  nodes.push('<div class="diagram-node"><b>Generation</b><small>final stage, fixed order</small></div>')
  shapeDiagram0309.innerHTML=nodes.join('')
}

const renderResult=()=>{
  if(!shapeResult0309)return
  const shape=SHAPES[classifyShape(state0309)]
  shapeResult0309.innerHTML=`<p><b>Classified as:</b> ${shape.label}</p><p>${shape.note}</p>`
}

const syncToggleButtons=()=>{
  toggleButtons0309.forEach(button=>{
    const on=state0309[button.dataset.flag]
    button.classList.toggle('active',on)
    button.classList.toggle('secondary',!on)
    button.setAttribute('aria-pressed',String(on))
  })
}

const refresh=()=>{
  syncToggleButtons()
  renderDiagram()
  renderResult()
}

toggleButtons0309.forEach(button=>button.addEventListener('click',()=>{
  const flag=button.dataset.flag
  state0309[flag]=!state0309[flag]
  refresh()
}))

presetButtons0309.forEach(button=>button.addEventListener('click',()=>{
  const preset=PRESETS[button.dataset.preset]
  if(!preset)return
  state0309.pre=preset.pre
  state0309.post=preset.post
  state0309.modular=preset.modular
  refresh()
}))

refresh()
