const advancedLesson02=document.querySelector('#advanced-lesson');
function syncAdvancedTarget02(){if(advancedLesson02)advancedLesson02.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget02);syncAdvancedTarget02();

const priorSpam=document.querySelector('#priorSpam');
const likeSpam=document.querySelector('#likeSpam');
const likeHam=document.querySelector('#likeHam');
const priorSpamValue=document.querySelector('#priorSpamValue');
const likeSpamValue=document.querySelector('#likeSpamValue');
const likeHamValue=document.querySelector('#likeHamValue');
const bayesOutput=document.querySelector('#bayesOutput');

function renderBayes(){
  if(!priorSpam||!likeSpam||!likeHam||!bayesOutput)return;
  const prior=Number(priorSpam.value)/100;
  const spamLikelihood=Number(likeSpam.value)/100;
  const hamLikelihood=Number(likeHam.value)/100;
  const numerator=spamLikelihood*prior;
  const evidence=numerator+hamLikelihood*(1-prior);
  const posterior=evidence?numerator/evidence:0;
  priorSpamValue.value=priorSpam.value+'%';
  likeSpamValue.value=likeSpam.value+'%';
  likeHamValue.value=likeHam.value+'%';
  bayesOutput.textContent='P(spam | “offer”) = '+(posterior*100).toFixed(1)+'% · predicted class: '+(posterior>=.5?'spam':'not spam');
}
[priorSpam,likeSpam,likeHam].forEach(input=>input?.addEventListener('input',renderBayes));
renderBayes();
