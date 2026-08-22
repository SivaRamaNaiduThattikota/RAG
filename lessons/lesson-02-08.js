const advancedLesson0208=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0208(){if(advancedLesson0208)advancedLesson0208.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0208);syncAdvancedTarget0208()

// Prompt structure + role-separation lab.
// Three independent readings: whether the instruction gives the model a real target,
// whether few-shot placement locks in the demonstrated format, and whether removing role
// delimiters lets an instruction-shaped sentence buried in retrieved context get obeyed too.

const labState={specificity:'vague',shots:0,roletags:'on'}

const specificityButtons=[...document.querySelectorAll('.specificity-button')]
const shotButtons=[...document.querySelectorAll('.fewshot-count-button')]
const roletagButtons=[...document.querySelectorAll('.roletag-button')]
const metersEl=document.querySelector('#promptLabMeters')
const outputEl=document.querySelector('#promptLabOutput')

// Task success: how well the instruction alone gives the model something concrete to hit.
const taskSuccessBySpecificity={vague:36,specific:85}

// Format match: few-shot examples sharpening toward the demonstrated shape (Concept 07's
// in-context learning, applied here rather than re-derived).
const formatMatchByShots=[16,47,68,84]

// Injection resistance: whether an instruction-shaped sentence hidden inside retrieved
// context gets the trained system-role weight it should never receive (Concept 06).
const injectionResistanceByTags={on:88,off:30}

const setActive=(buttons,predicate)=>{
  buttons.forEach(button=>{
    const active=predicate(button)
    button.classList.toggle('active',active)
    button.classList.toggle('secondary',!active)
    button.setAttribute('aria-pressed',String(active))
  })
}

const meterRow=(label,value)=>`<div class="prob-row"><span>${label}</span><div class="bar-track"><div class="bar-fill" style="width:${value}%"></div></div><span>${value}%</span></div>`

const render=()=>{
  const taskSuccess=taskSuccessBySpecificity[labState.specificity]
  const formatMatch=formatMatchByShots[labState.shots]
  let injectionResistance=injectionResistanceByTags[labState.roletags]
  if(labState.roletags==='on'&&labState.shots===3)injectionResistance=Math.max(80,injectionResistance-6) // heavier prompt, marginally more surface, still well-defended

  if(metersEl){
    metersEl.innerHTML=[
      meterRow('Task success (instruction met)',taskSuccess),
      meterRow('Format match (few-shot conditioning)',formatMatch),
      meterRow('Injection resistance (role separation)',injectionResistance),
    ].join('')
  }

  if(outputEl){
    const specificityLine=labState.specificity==='vague'
      ? 'The instruction only states a goal ("answer well"), so the output distribution has little concrete to sharpen toward.'
      : 'The instruction states a checkable rule and format, giving the output distribution something specific to sharpen toward.'
    const shotsLine=labState.shots===0
      ? 'With no few-shot examples, nothing in the prompt demonstrates the wanted format directly.'
      : `With ${labState.shots} worked example${labState.shots===1?'':'s'} in context, Concept 07's in-context learning conditions the output toward that demonstrated shape.`
    const tagsLine=labState.roletags==='on'
      ? 'Role delimiters are intact, so a sentence inside the retrieved context that merely reads like an instruction still lands in the user role — it stays data, not policy.'
      : 'Role delimiters are stripped, so the model has no structural signal left to tell the real system instruction apart from an instruction-shaped sentence sitting inside the retrieved context — both are just tokens now.'
    outputEl.innerHTML=`<p>${specificityLine}</p><p>${shotsLine}</p><p>${tagsLine}</p>`
  }
}

specificityButtons.forEach(button=>button.addEventListener('click',()=>{
  labState.specificity=button.dataset.specificity
  setActive(specificityButtons,b=>b===button)
  render()
}))

shotButtons.forEach(button=>button.addEventListener('click',()=>{
  labState.shots=Number(button.dataset.shots)
  setActive(shotButtons,b=>b===button)
  render()
}))

roletagButtons.forEach(button=>button.addEventListener('click',()=>{
  labState.roletags=button.dataset.roletags
  setActive(roletagButtons,b=>b===button)
  render()
}))

if(metersEl)render()
