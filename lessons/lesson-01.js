const logits={useful:2.2,reliable:1.4,risky:.7};
const temperatureInput=document.querySelector('#temperature');
const seedInput=document.querySelector('#seed');
const countInput=document.querySelector('#sampleCount');
const tempValue=document.querySelector('#temperatureValue');
const countValue=document.querySelector('#sampleCountValue');
const sampleOutput=document.querySelector('#sampleOutput');

function probabilities(){
  const temperature=Math.max(.1,Number(temperatureInput.value));
  const entries=Object.entries(logits);
  const exponentials=entries.map(([,value])=>Math.exp(value/temperature));
  const total=exponentials.reduce((sum,value)=>sum+value,0);
  return entries.map(([token],index)=>({token,p:exponentials[index]/total}));
}
function renderDistribution(){
  tempValue.value=Number(temperatureInput.value).toFixed(1);
  countValue.value=countInput.value;
  probabilities().forEach(({token,p})=>{
    document.querySelector(`[data-bar="${token}"]`).style.width=`${(p*100).toFixed(1)}%`;
    document.querySelector(`[data-prob="${token}"]`).textContent=`${(p*100).toFixed(1)}%`;
  });
}
function seededRandom(seed){let state=(seed>>>0)||1;return()=>{state=(1664525*state+1013904223)>>>0;return state/4294967296}}
function generate(){
  const random=seededRandom(Number(seedInput.value));
  const distribution=probabilities();
  const samples=[];
  for(let i=0;i<Number(countInput.value);i+=1){
    const u=random();let cumulative=0;
    const selected=distribution.find(item=>{cumulative+=item.p;return u<cumulative})||distribution.at(-1);
    samples.push(selected.token);
  }
  sampleOutput.textContent=`RAG is ${samples.join(' · RAG is ')}`;
}
temperatureInput?.addEventListener('input',renderDistribution);
countInput?.addEventListener('input',renderDistribution);
document.querySelector('#generateSamples')?.addEventListener('click',generate);
document.querySelector('#resetLab')?.addEventListener('click',()=>{temperatureInput.value='1';seedInput.value='42';countInput.value='12';renderDistribution();generate()});
renderDistribution();generate();

const advancedLesson=document.querySelector('#advanced-lesson');
function syncAdvancedTarget(){if(advancedLesson)advancedLesson.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget);syncAdvancedTarget();
