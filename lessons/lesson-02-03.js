const advancedLesson0203=document.querySelector('#advanced-lesson');
function syncAdvancedTarget0203(){if(advancedLesson0203)advancedLesson0203.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0203);syncAdvancedTarget0203();
const STACK_DEPTH=4;
let currentBlock=0;
const residualToggle=document.querySelector('#residualToggle');
const stepButton=document.querySelector('#stackStepButton');
const resetButton=document.querySelector('#stackResetButton');
const stackOutput=document.querySelector('#stackLabOutput');
function describeStack(){
  const residualsOn=residualToggle?residualToggle.checked:true;
  if(currentBlock===0)return 'Token embeddings (plus positional info, Concept 04) enter the stack. No block has run yet.';
  if(currentBlock>STACK_DEPTH)return `All ${STACK_DEPTH} blocks complete. Final representations pass to the output head, producing the next-token distribution — Concept 07's decoding loop takes over from here.`;
  return residualsOn
    ? `Block ${currentBlock} of ${STACK_DEPTH}: self-attention sublayer mixes context across positions, added back via a residual connection and normalized; then the feed-forward sublayer transforms each position independently, again added back via a residual connection and normalized.`
    : `Block ${currentBlock} of ${STACK_DEPTH} — residuals OFF: each sublayer's output REPLACES its input instead of adding to it. In a real deep stack this breaks gradient flow and training fails; shown here only to illustrate why residual connections matter.`;
}
function renderStack(){if(stackOutput)stackOutput.innerHTML=`<p>${describeStack()}</p><p class="fine-print">Block ${Math.min(currentBlock,STACK_DEPTH)} of ${STACK_DEPTH}${currentBlock>STACK_DEPTH?' · output head reached':''}</p>`}
stepButton?.addEventListener('click',()=>{currentBlock=Math.min(currentBlock+1,STACK_DEPTH+1);renderStack()});
resetButton?.addEventListener('click',()=>{currentBlock=0;renderStack()});
residualToggle?.addEventListener('change',renderStack);
renderStack();
