const advancedLesson03=document.querySelector('#advanced-lesson');
function syncAdvancedTarget03(){if(advancedLesson03)advancedLesson03.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget03);syncAdvancedTarget03();

const familyDescriptions={
  autoregressive:'Training signal: conditional likelihood. Sampling: generate the next element from the existing prefix and repeat. Strength: natural fit for ordered discrete data. Risk: sequential latency and compounding mistakes.',
  vae:'Training signal: reconstruction plus KL regularization through an ELBO. Sampling: draw a latent code and decode it. Strength: useful structured latent space. Risk: posterior collapse or oversmoothed samples.',
  gan:'Training signal: adversarial feedback from a discriminator. Sampling: transform noise through the generator. Strength: fast one-pass sampling. Risk: unstable training and mode collapse.',
  diffusion:'Training signal: predict noise, score, or reverse transitions. Sampling: iteratively transform noise into data. Strength: high-quality controllable samples. Risk: repeated-step compute and latency.',
  flow:'Training signal: exact likelihood through change of variables. Sampling: apply an invertible transform to a base sample. Strength: tractable density and reversible sampling. Risk: invertibility and Jacobian constraints.',
  energy:'Training signal: lower energy for compatible data and raise it for alternatives. Sampling: search or move toward low-energy regions. Strength: flexible compatibility modelling. Risk: normalization and slow-mixing samplers.'
};
const familyButtons=[...document.querySelectorAll('.family-button')];
const familyOutput=document.querySelector('#familyOutput');
function selectFamily(button){familyButtons.forEach(item=>{const active=item===button;item.classList.toggle('active',active);item.classList.toggle('secondary',!active);item.setAttribute('aria-pressed',String(active))});if(familyOutput)familyOutput.textContent=familyDescriptions[button.dataset.family]}
familyButtons.forEach(button=>button.addEventListener('click',()=>selectFamily(button)));
if(familyButtons[0])selectFamily(familyButtons[0]);
