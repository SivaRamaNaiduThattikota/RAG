const advancedLesson0308=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0308(){if(advancedLesson0308)advancedLesson0308.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0308)
syncAdvancedTarget0308()

// Section 14's lab: run one request through the four boundary questions this
// concept draws, in order, and stop at whichever question first decides the
// route -- RAG, fine-tuning, search alone, tool use, or "already parametric."
const ROUTES={
  BASE:{label:'Already parametric — no new architecture needed',note:'General ability was never a retrieval, training, search, or action problem — Module 02’s pretraining already supplies it (Concept 05’s parametric memory). None of today’s four patterns add anything here.'},
  TOOL:{label:'Tool use / agentic — take the action, don’t just answer',note:'This needs a real external effect, not text back. Concept 01’s b06 named this boundary; Module 23 owns how an agent decides to act.'},
  SEARCH:{label:'Search / IR alone — hand back documents, generate nothing',note:'No answer text was wanted at all. A ranked document list already satisfies this request — Concept 01’s two-box definition requires a generation step RAG would otherwise add for nothing.'},
  RAG:{label:'RAG — retrieve, then generate',note:'A small set of current, specific evidence is needed before answering — Concept 01’s two boxes, Concept 06’s pipelines.'},
  FINETUNE:{label:'Fine-tuning — bake it into the weights once',note:'A stable skill or style, not a fact to look up per query — worth training in once (Concept 05’s parametric memory), not retrieved fresh every time.'}
}

const REQUESTS=[
  {id:'threshold',text:'"What’s our current international travel pre-approval threshold?"',beyondBase:true,needsAction:false,wantsRawDocs:false,needsFreshLookup:true,route:'RAG'},
  {id:'tone',text:'"Always reply in Oracle’s formal internal voice, in every single response."',beyondBase:true,needsAction:false,wantsRawDocs:false,needsFreshLookup:false,route:'FINETUNE'},
  {id:'pdfs',text:'"List every policy PDF that mentions ‘expense report’ so I can read them myself."',beyondBase:true,needsAction:false,wantsRawDocs:true,needsFreshLookup:null,route:'SEARCH'},
  {id:'email',text:'"Email my manager my current PTO balance, and cc me on it."',beyondBase:true,needsAction:true,wantsRawDocs:null,needsFreshLookup:null,route:'TOOL'},
  {id:'headcount',text:'"How many employees currently work in the Vienna office?"',beyondBase:true,needsAction:false,wantsRawDocs:false,needsFreshLookup:true,route:'RAG'},
  {id:'grammar',text:'"Write one grammatically correct English sentence."',beyondBase:false,needsAction:null,wantsRawDocs:null,needsFreshLookup:null,route:'BASE'}
]

const routerButtons=[...document.querySelectorAll('#routerButtons0308 button')]
const routerTrace=document.querySelector('#routerTrace0308')
const routerResult=document.querySelector('#routerResult0308')

const traceStep=(question,answer,stopsHere)=>
  `<p class="fine-print"><b>${question}</b> ${answer}${stopsHere?' — deciding question, stop here.':''}</p>`

const runRequest=req=>{
  const steps=[]
  steps.push(traceStep('Does this go beyond a well-trained base model’s own fluent ability?',req.beyondBase?'Yes.':'No.',!req.beyondBase))
  if(!req.beyondBase){
    render(steps,req)
    return
  }
  steps.push(traceStep('Does fulfilling it require a real external action (send, book, execute), not just an answer?',req.needsAction?'Yes.':'No.',req.needsAction))
  if(req.needsAction){
    render(steps,req)
    return
  }
  steps.push(traceStep('Does the requester want raw source material to read themselves, with no generated answer at all?',req.wantsRawDocs?'Yes.':'No.',req.wantsRawDocs))
  if(req.wantsRawDocs){
    render(steps,req)
    return
  }
  steps.push(traceStep('Does the needed knowledge change over time, or is it specific information better looked up than memorized?',req.needsFreshLookup?'Yes.':'No.',true))
  render(steps,req)
}

const render=(steps,req)=>{
  if(routerTrace)routerTrace.innerHTML=steps.join('')
  if(routerResult){
    const routed=ROUTES[req.route]
    routerResult.innerHTML=`<p><b>Routed to:</b> ${routed.label}</p><p>${routed.note}</p>`
  }
}

const selectRequest=button=>{
  routerButtons.forEach(item=>{const active=item===button;item.classList.toggle('active',active);item.classList.toggle('secondary',!active);item.setAttribute('aria-pressed',String(active))})
  const req=REQUESTS.find(item=>item.id===button.dataset.request)
  if(req)runRequest(req)
}

routerButtons.forEach(button=>button.addEventListener('click',()=>selectRequest(button)))

const firstButton=routerButtons[0]
if(firstButton)selectRequest(firstButton)
