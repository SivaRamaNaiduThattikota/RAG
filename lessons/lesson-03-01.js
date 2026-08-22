const advancedLesson0301=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0301(){if(advancedLesson0301)advancedLesson0301.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0301);syncAdvancedTarget0301()

// "Retriever or Generator?" sorter.
// Every prior lab in this course is either a two-panel probability comparison (module 02, concepts 09
// and 11) or a single-click routing explorer (concept 08). This one is a different mechanic entirely:
// classify-by-clicking. Eight short descriptions of things that happen somewhere in a RAG pipeline sit
// in an unsorted pool. The learner selects one, then chooses which of three boxes it belongs in --
// retriever-side work, generator-side work, or neither (things people mistake for RAG's core pattern).
// There's no drag-and-drop; it's click-to-select, then click-to-assign, so every step works from a
// keyboard with nothing but native <button> semantics.
//
// Expected markup hooks (owned by the HTML for this lesson, not this file):
//   #sortPool0301                        -- pool of unsorted .sort-chip buttons (data-item, data-bin)
//   .bin-button[data-bin-target]         -- #binRetriever0301 / #binGenerator0301 / #binNone0301
//   #sortStatus0301                      -- one-line status / instruction readout
//   #sortedRetriever0301 / #sortedGenerator0301 / #sortedNone0301 -- the three destination boxes
//   #resetSortButton0301                 -- puts every chip back in the pool, in original order
//   #sortScore0301                       -- running "X of 8 sorted -- Y correct so far" readout

const DEFAULT_STATUS0301='Select a component above, then choose the box it belongs in.'

const binLabels0301={
  retriever:'the Retriever box',
  generator:'the Generator box',
  none:"the box for things that aren't RAG's core pattern",
}

const sortPool0301=document.querySelector('#sortPool0301')
const binButtons0301=[...document.querySelectorAll('.bin-button')]
const sortStatus0301=document.querySelector('#sortStatus0301')
const sortScore0301=document.querySelector('#sortScore0301')
const resetSortButton0301=document.querySelector('#resetSortButton0301')

const sortBoxes0301={
  retriever:document.querySelector('#sortedRetriever0301'),
  generator:document.querySelector('#sortedGenerator0301'),
  none:document.querySelector('#sortedNone0301'),
}

// Snapshot the pool's original order once, before anything moves, so reset can rebuild it exactly.
const originalChipOrder0301=sortPool0301?[...sortPool0301.querySelectorAll('.sort-chip')]:[]

let selectedChip0301=null
let correctCount0301=0
let totalMoved0301=0

function selectChip0301(chip){
  if(selectedChip0301===chip){
    chip.classList.remove('active')
    selectedChip0301=null
    if(sortStatus0301)sortStatus0301.textContent=DEFAULT_STATUS0301
    return
  }
  if(selectedChip0301)selectedChip0301.classList.remove('active')
  selectedChip0301=chip
  chip.classList.add('active')
  if(sortStatus0301)sortStatus0301.textContent=`Selected: ${chip.textContent} — now choose a box.`
}

function moveChip0301(chip,targetKey){
  const box=sortBoxes0301[targetKey]
  if(!box)return
  chip.classList.remove('active')
  const isCorrect=chip.dataset.bin===targetKey
  chip.classList.add(isCorrect?'correct':'incorrect')
  if(!isCorrect)chip.title=`Correct answer: ${binLabels0301[chip.dataset.bin]}`
  box.appendChild(chip)
  if(isCorrect)correctCount0301+=1
  totalMoved0301+=1
  selectedChip0301=null
  if(sortScore0301)sortScore0301.textContent=`${totalMoved0301} of 8 sorted — ${correctCount0301} correct so far.`
  if(sortStatus0301){
    sortStatus0301.textContent=totalMoved0301>=8
      ? `All 8 sorted — ${correctCount0301} of 8 correct. Chips marked incorrect show which box they actually belong in — open them to check.`
      : DEFAULT_STATUS0301
  }
}

function resetSort0301(){
  selectedChip0301=null
  correctCount0301=0
  totalMoved0301=0
  originalChipOrder0301.forEach(chip=>{
    chip.classList.remove('active','correct','incorrect')
    chip.removeAttribute('title')
    sortPool0301.appendChild(chip)
  })
  if(sortStatus0301)sortStatus0301.textContent=DEFAULT_STATUS0301
  if(sortScore0301)sortScore0301.textContent=''
}

sortPool0301?.addEventListener('click',e=>{
  const chip=e.target.closest('.sort-chip')
  if(!chip||!sortPool0301.contains(chip))return
  selectChip0301(chip)
})

binButtons0301.forEach(button=>{
  button.addEventListener('click',()=>{
    if(!selectedChip0301){
      if(sortStatus0301)sortStatus0301.textContent='Select a component first.'
      return
    }
    moveChip0301(selectedChip0301,button.dataset.binTarget)
  })
})

resetSortButton0301?.addEventListener('click',resetSort0301)
