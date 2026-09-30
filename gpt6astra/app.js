const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
let motionPaused=reducedMotion.matches;
const motionButton=document.querySelector('.motion-toggle');
function syncMotion(){document.documentElement.classList.toggle('motion-paused',motionPaused);motionButton.setAttribute('aria-pressed',String(motionPaused));motionButton.setAttribute('aria-label',motionPaused?'애니메이션 재생':'애니메이션 일시 정지');motionButton.firstElementChild.textContent=motionPaused?'▷':'Ⅱ';}
syncMotion();motionButton.addEventListener('click',()=>{motionPaused=!motionPaused;syncMotion()});
reducedMotion.addEventListener('change',e=>{motionPaused=e.matches;syncMotion()});
const canvas=document.getElementById('starfield'),ctx=canvas.getContext('2d');
const hero=document.querySelector('.hero'),art=document.querySelector('.hero-art');
let width=0,height=0,stars=[],mouse={x:0,y:0},warp=0,warping=false,lastFrame=0;
let heroVisible=true,planetTime=0,planetLastFrame=0;
const planetPointer={x:0,y:0};
function syncHeroVisibility(){
  hero.classList.toggle('hero-idle',!heroVisible||document.hidden);
  planetLastFrame=0;
  if(!heroVisible||document.hidden)setWarp(false);
}
new IntersectionObserver(entries=>{heroVisible=entries[0].isIntersecting;syncHeroVisibility();}).observe(hero);
document.addEventListener('visibilitychange',syncHeroVisibility);
function animatePlanet(time){
  const delta=planetLastFrame?Math.min(time-planetLastFrame,64):0;
  planetLastFrame=time;
  if(motionPaused)return;
  planetTime+=delta;
  const seconds=planetTime/1000;
  const ease=1-Math.exp(-delta/280);
  planetPointer.x+=(mouse.x-planetPointer.x)*ease;
  planetPointer.y+=(mouse.y-planetPointer.y)*ease;
  const amplitude=width<700?.5:1;
  // Different periods keep the drift gentle without a visible loop boundary.
  const driftX=Math.sin(seconds*Math.PI*2/37)*10*amplitude;
  const driftY=Math.sin(seconds*Math.PI*2/29)*7*amplitude;
  const rotation=Math.sin(seconds*Math.PI*2/53)*.55*amplitude;
  const scale=1.055+Math.sin(seconds*Math.PI*2/23)*.01+warp*.08;
  art.style.transform=`translate3d(${driftX-planetPointer.x*5}px,${driftY-planetPointer.y*4}px,0) rotate(${rotation}deg) scale(${scale})`;
}
function resizeStars(){width=hero.clientWidth;height=hero.clientHeight;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=width*dpr;canvas.height=height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);stars=Array.from({length:width<700?90:190},()=>({x:Math.random()*width,y:Math.random()*height,z:Math.random(),phase:Math.random()*Math.PI*2}));}
resizeStars();window.addEventListener('resize',resizeStars);
hero.addEventListener('pointermove',e=>{if(motionPaused||e.pointerType==='touch')return;const bounds=hero.getBoundingClientRect();mouse.x=Math.max(-1,Math.min(1,((e.clientX-bounds.left)/width-.5)*2));mouse.y=Math.max(-1,Math.min(1,((e.clientY-bounds.top)/height-.5)*2));});hero.addEventListener('pointerleave',()=>{mouse.x=0;mouse.y=0});
const warpButton=document.querySelector('.warp-button');
function setWarp(value){warping=value&&!motionPaused;warpButton.classList.toggle('active',warping)}
warpButton.addEventListener('pointerdown',e=>{warpButton.setPointerCapture(e.pointerId);setWarp(true)});['pointerup','pointercancel','lostpointercapture','blur'].forEach(event=>warpButton.addEventListener(event,()=>setWarp(false)));warpButton.addEventListener('keydown',e=>{if(e.code==='Space'||e.code==='Enter'){e.preventDefault();setWarp(true)}});warpButton.addEventListener('keyup',()=>setWarp(false));
function animateStars(time){requestAnimationFrame(animateStars);if(document.hidden||!heroVisible){planetLastFrame=0;return;}animatePlanet(time);if(time-lastFrame<30)return;lastFrame=time;ctx.clearRect(0,0,width,height);warp+=(Number(warping&&!motionPaused)-warp)*.065;for(const s of stars){if(!motionPaused){s.x+=(s.x-width*.62)*warp*.038;s.y+=(s.y-height*.45)*warp*.038;if(s.x<0||s.x>width||s.y<0||s.y>height){s.x=width*.62+(Math.random()-.5)*width*.5;s.y=height*.45+(Math.random()-.5)*height*.5}}const twinkle=motionPaused?.65:.5+Math.sin(time*.00065+s.phase)*.3;const x=s.x+mouse.x*s.z*7,y=s.y+mouse.y*s.z*7;ctx.globalAlpha=twinkle*(.4+s.z*.6);ctx.fillStyle='#e6dcff';if(warp>.08){ctx.strokeStyle='#e6dcff';ctx.lineWidth=s.z*.8+.25;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+(x-width*.62)*warp*.12,y+(y-height*.45)*warp*.12);ctx.stroke()}else{ctx.beginPath();ctx.arc(x,y,s.z*1+.25,0,Math.PI*2);ctx.fill()}}ctx.globalAlpha=1;}
requestAnimationFrame(animateStars);
function updateScroll(){const max=document.documentElement.scrollHeight-innerHeight;document.querySelector('.reading-progress').style.transform=`scaleX(${max>0?scrollY/max:0})`;}window.addEventListener('scroll',updateScroll,{passive:true});updateScroll();

// Independent concept examples; no requests are sent to an AI service.
const modes={
  reason:{label:'01 / DEEP REASONING',title:'복잡함을, 명료함으로.',copy:'문제를 여러 관점에서 살피고, 흩어진 단서를 연결합니다. 복잡한 질문도 단계별로 깊이 탐구하세요.',state:'SPHERICAL CONNECTIONS',hue:267},
  build:{label:'02 / CODING & BUILDING',title:'아이디어를, 작동하는 현실로.',copy:'설계부터 구현, 디버깅까지. 코드의 맥락을 읽고 도구와 연결하며, 복잡한 작업을 한 단계씩 완성합니다.',state:'DOUBLE HELIX SYSTEM',hue:216},
  create:{label:'03 / CREATIVE EXPLORATION',title:'아직 없는 세계를, 당신답게.',copy:'새로운 관점으로 글을 쓰고, 이야기를 구성하고, 문서를 완성하세요. 막연했던 생각에 구체적인 형태를 더합니다.',state:'INFINITE POSSIBILITIES',hue:302}
};
let fieldMode='reason',fieldHue=267,targetHue=267;
const capabilityTabs=[...document.querySelectorAll('.capability-tab')];
function selectCapability(mode){fieldMode=mode;const data=modes[mode];targetHue=data.hue;capabilityTabs.forEach(button=>{const active=button.dataset.mode===mode;button.classList.toggle('active',active);button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1});document.getElementById('field-label').textContent=data.label;document.getElementById('field-title').textContent=data.title;document.getElementById('field-copy').textContent=data.copy;document.getElementById('field-state').textContent=data.state;document.getElementById('field-mode').textContent=mode.toUpperCase();const panel=document.getElementById('cap-panel');panel.setAttribute('aria-labelledby',`cap-${mode}`);panel.textContent=data.copy;}
capabilityTabs.forEach(button=>button.addEventListener('click',()=>selectCapability(button.dataset.mode)));
function wireTabKeys(tabs,onSelect,vertical=false){tabs.forEach((button,index)=>button.addEventListener('keydown',e=>{let next=index;if(e.key==='ArrowRight'||(vertical&&e.key==='ArrowDown'))next=(index+1)%tabs.length;else if(e.key==='ArrowLeft'||(vertical&&e.key==='ArrowUp'))next=(index-1+tabs.length)%tabs.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=tabs.length-1;else return;e.preventDefault();onSelect(tabs[next]);tabs[next].focus()}));}
wireTabKeys(capabilityTabs,button=>selectCapability(button.dataset.mode));

const fieldCanvas=document.getElementById('neural-field'),fieldCtx=fieldCanvas.getContext('2d');
let fieldW=0,fieldH=0,fieldVisible=false,angle=.3,pitch=.23,dragging=false,dragX=0,dragY=0,fieldLast=0,fieldTime=0;
const particleCount=innerWidth<700?760:1150;
function geometry(mode,i){const t=i/particleCount;if(mode==='build'){const strand=i%2;const theta=t*Math.PI*9+strand*Math.PI;return{x:Math.cos(theta)*.57,y:(t-.5)*2.2,z:Math.sin(theta)*.57};}if(mode==='create'){const theta=t*Math.PI*2;const phi=i*2.399963;const r=.73+.24*Math.cos(phi);return{x:r*Math.cos(theta),y:r*Math.sin(theta),z:.24*Math.sin(phi)};}const y=1-2*t,r=Math.sqrt(Math.max(0,1-y*y)),theta=i*2.399963;return{x:Math.cos(theta)*r,y,z:Math.sin(theta)*r};}
const fieldPoints=Array.from({length:particleCount},(_,i)=>({...geometry('reason',i),i,size:.45+(i%7)/8}));
const fieldShapes={reason:fieldPoints.map((_,i)=>geometry('reason',i)),build:fieldPoints.map((_,i)=>geometry('build',i)),create:fieldPoints.map((_,i)=>geometry('create',i))};
function resizeField(){fieldW=fieldCanvas.clientWidth;fieldH=fieldCanvas.clientHeight;const ratio=Math.min(devicePixelRatio||1,2);fieldCanvas.width=fieldW*ratio;fieldCanvas.height=fieldH*ratio;fieldCtx.setTransform(ratio,0,0,ratio,0,0)}resizeField();new ResizeObserver(resizeField).observe(fieldCanvas);
new IntersectionObserver(entries=>{fieldVisible=entries[0].isIntersecting},{rootMargin:'50px'}).observe(fieldCanvas);
fieldCanvas.addEventListener('pointerdown',e=>{dragging=true;dragX=e.clientX;dragY=e.clientY;fieldCanvas.setPointerCapture(e.pointerId)});fieldCanvas.addEventListener('pointermove',e=>{if(dragging){angle+=(e.clientX-dragX)*.008;pitch=Math.max(-1.2,Math.min(1.2,pitch+(e.clientY-dragY)*.005));dragX=e.clientX;dragY=e.clientY}});['pointerup','pointercancel','lostpointercapture'].forEach(event=>fieldCanvas.addEventListener(event,()=>dragging=false));
function drawField(time){requestAnimationFrame(drawField);if(!fieldVisible||document.hidden||time-fieldLast<30)return;const delta=Math.min(time-fieldLast,60);fieldLast=time;if(!motionPaused){fieldTime+=delta;angle+=.0019*(delta/30)}fieldHue+=(targetHue-fieldHue)*.08;const ctx=fieldCtx,w=fieldW,h=fieldH,scale=Math.min(w,h)*.355;ctx.clearRect(0,0,w,h);const glow=ctx.createRadialGradient(w/2,h/2,0,w/2,h/2,scale*1.32);glow.addColorStop(0,`hsla(${fieldHue},65%,65%,.045)`);glow.addColorStop(.75,`hsla(${fieldHue},65%,45%,.015)`);glow.addColorStop(1,'transparent');ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);ctx.lineWidth=.5;ctx.strokeStyle=`hsla(${fieldHue},40%,70%,.09)`;ctx.beginPath();ctx.ellipse(w/2,h/2,scale*1.28,scale*.45,-.35,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.ellipse(w/2,h/2,scale*1.25,scale*.78,.8,0,Math.PI*2);ctx.stroke();const cosA=Math.cos(angle),sinA=Math.sin(angle),cosP=Math.cos(pitch),sinP=Math.sin(pitch);const projected=[];for(const p of fieldPoints){const target=fieldShapes[fieldMode][p.i],blend=motionPaused?1:.065;p.x+=(target.x-p.x)*blend;p.y+=(target.y-p.y)*blend;p.z+=(target.z-p.z)*blend;const ripple=1+Math.sin(p.i*.07+fieldTime*.00045)*.018;const x=(p.x*cosA-p.z*sinA)*ripple,z=(p.x*sinA+p.z*cosA)*ripple;const y=p.y*cosP-z*sinP,z2=p.y*sinP+z*cosP,perspective=3.5/(3.5-z2);projected.push({x:w/2+x*scale*perspective,y:h/2+y*scale*perspective,z:z2,size:p.size*perspective,i:p.i})}projected.sort((a,b)=>a.z-b.z);for(const p of projected){const alpha=.2+(p.z+1.2)/2.4*.75;ctx.fillStyle=`hsla(${fieldHue+(p.i%30)*.6},75%,${70+(p.z+1)*9}%,${Math.max(.15,Math.min(1,alpha))})`;ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();if(p.i%17===0&&p.z>.3){ctx.strokeStyle=`hsla(${fieldHue},70%,85%,.25)`;ctx.lineWidth=.45;ctx.beginPath();ctx.moveTo(p.x-4,p.y);ctx.lineTo(p.x+4,p.y);ctx.moveTo(p.x,p.y-4);ctx.lineTo(p.x,p.y+4);ctx.stroke()}}const front=projected.filter(p=>p.z>.35&&p.i%5===0);ctx.lineWidth=.4;for(let i=0;i<front.length;i++){let count=0;for(let j=i+1;j<front.length&&count<2;j++){const a=front[i],b=front[j],dist=Math.hypot(a.x-b.x,a.y-b.y);if(dist<scale*.27){ctx.strokeStyle=`hsla(${fieldHue},65%,75%,${(1-dist/(scale*.27))*.22})`;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();count++}}}}
requestAnimationFrame(drawField);

const scenarios={
 reason:{prompt:'양자 얽힘을 처음 듣는 사람에게 설명해줘.',status:'설명 예시',steps:['개념 정리','핵심 비유','한계 짚기'],html:'<p><strong>멀리 떨어져 있어도, 하나의 상태로 설명되는 입자들.</strong></p><p>두 입자가 얽혀 있으면 각각을 독립적으로 설명할 수 없습니다. 함께 준비된 상태가, 나중에 따로 측정한 결과 사이에 특별한 연관성을 만듭니다.</p><p>서로 맞물린 두 퍼즐 조각을 떠올려 보세요. 다만 양자 세계에서는 단순히 미리 정해진 답을 확인하는 것보다 훨씬 미묘한 일이 벌어집니다.</p><div class="response-divider"></div><p><strong>기억할 점</strong> — 이 연관성을 이용해 빛보다 빠르게 정보를 보낼 수는 없습니다.</p>'},
 build:{prompt:'마우스를 따라 부드럽게 움직이는 빛을 만들어줘.',status:'코드 예시',steps:['이벤트 연결','좌표 추적','부드러운 보간'],html:'<p><strong>작은 움직임 하나로, 화면에 생동감을.</strong></p><p>포인터 좌표를 기록하고 현재 위치를 조금씩 보간하면, 빛이 마우스를 부드럽게 따라옵니다.</p><pre><code><span class="code-keyword">const</span> target = { x: 0, y: 0 };\naddEventListener("pointermove", e =&gt; {\n  target.x = e.clientX;\n  target.y = e.clientY;\n});\n\n<span class="code-keyword">function</span> animate() {\n  x += (target.x - x) * 0.08;\n  y += (target.y - y) * 0.08;\n  glow.style.translate = `${x}px ${y}px`;\n  requestAnimationFrame(animate);\n}</code></pre><p>glow 요소와 x, y의 초기값을 준비한 뒤 animate()를 호출합니다.</p>'},
 create:{prompt:'우주를 여행하는 사람의 첫 문장을 써줘.',status:'창작 예시',steps:['시점 설정','감각 발견','첫 문장 완성'],html:'<p><strong>가장 먼 곳에서, 가장 가까운 기억을.</strong></p><div class="poem">지구가 마침내 별 하나만큼 작아졌을 때,<br />나는 두고 온 집의 불을<br />끄지 않았다는 사실이 떠올랐다.</div><div class="response-divider"></div><p>우주의 거대한 풍경과 아주 일상적인 걱정을 나란히 두었습니다. 낯선 세계에 들어서는 독자가, 익숙한 감정 하나를 쥐고 시작할 수 있도록.</p>'}
};
const scenarioTabs=[...document.querySelectorAll('.scenario-tab')],responseEl=document.getElementById('demo-response');let currentScenario='reason',typingTimer=0,typingRun=0;
function renderExample(scenario,animate=true){currentScenario=scenario;const data=scenarios[scenario];scenarioTabs.forEach(button=>{const active=button.dataset.scenario===scenario;button.classList.toggle('active',active);button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1});document.getElementById('demo-panel').setAttribute('aria-labelledby',`scenario-${scenario}`);document.getElementById('demo-prompt').textContent=data.prompt;document.getElementById('demo-status').textContent=data.status;document.getElementById('reasoning-steps').replaceChildren(...data.steps.flatMap((text,i)=>{const span=document.createElement('span');span.textContent=text;if(!i)return [span];const dot=document.createElement('i');dot.textContent='·';return [dot,span]}));clearTimeout(typingTimer);const run=++typingRun;responseEl.classList.remove('typing');responseEl.innerHTML=data.html;responseEl.setAttribute('aria-busy','false');if(!animate||motionPaused)return;const walker=document.createTreeWalker(responseEl,NodeFilter.SHOW_TEXT);const nodes=[];while(walker.nextNode()){nodes.push({node:walker.currentNode,text:walker.currentNode.textContent})}nodes.forEach(n=>n.node.textContent='');responseEl.classList.add('typing');responseEl.setAttribute('aria-busy','true');let nodeIndex=0,charIndex=0;function tick(){if(run!==typingRun)return;if(motionPaused){responseEl.innerHTML=data.html;responseEl.classList.remove('typing');responseEl.setAttribute('aria-busy','false');return}let amount=6;while(amount>0&&nodeIndex<nodes.length){const item=nodes[nodeIndex],remaining=item.text.length-charIndex,take=Math.min(amount,remaining);charIndex+=take;item.node.textContent=item.text.slice(0,charIndex);amount-=take;if(charIndex>=item.text.length){nodeIndex++;charIndex=0}}if(nodeIndex<nodes.length)typingTimer=setTimeout(tick,25);else{responseEl.classList.remove('typing');responseEl.setAttribute('aria-busy','false')}}tick()}
scenarioTabs.forEach(button=>button.addEventListener('click',()=>renderExample(button.dataset.scenario)));wireTabKeys(scenarioTabs,button=>renderExample(button.dataset.scenario),true);document.getElementById('replay-demo').addEventListener('click',()=>renderExample(currentScenario));renderExample('reason',false);

const efforts=[{name:'Low',description:'가벼운 질문과 간결한 작업을 빠르게 살펴볼 때.'},{name:'Medium',description:'일상적인 작업에서 균형 있게 생각할 때.'},{name:'High',description:'복잡한 문제를 차근차근 살펴볼 때.'},{name:'XHigh',description:'여러 조건과 가능성을 더 깊게 탐구할 때.'},{name:'Max',description:'가장 까다로운 문제에 사고를 집중할 때.'}];
const effortRange=document.getElementById('effort-range');effortRange.addEventListener('input',()=>{const level=Number(effortRange.value),data=efforts[level];document.getElementById('effort-value').textContent=data.name;document.getElementById('effort-description').textContent=data.description;effortRange.setAttribute('aria-valuetext',data.name);effortRange.style.background=`linear-gradient(to right,#bc8fec ${level*25}%,#31223f ${level*25}%)`;document.querySelector('.effort-star').style.animationDuration=`${35-level*7}s`;document.querySelector('.effort-star').style.color=`hsl(${270+level*5},${45+level*9}%,${65+level*5}%)`;});
const contextLines=document.querySelector('.context-lines');for(let i=0;i<90;i++){const line=document.createElement('i');line.style.height=`${18+Math.sin(i*.27)*12+Math.cos(i*.73)*8}px`;line.style.animationDelay=`${i*-.1}s`;contextLines.append(line)}
document.querySelectorAll('.spec-card').forEach(card=>{card.addEventListener('pointermove',e=>{const rect=card.getBoundingClientRect();card.style.setProperty('--card-x',`${e.clientX-rect.left}px`);card.style.setProperty('--card-y',`${e.clientY-rect.top}px`)});});
if('IntersectionObserver' in window){document.documentElement.classList.add('js-reveal');const revealObserver=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){entry.target.classList.add('visible');revealObserver.unobserve(entry.target)}}},{threshold:.08});document.querySelectorAll('.reveal').forEach(element=>revealObserver.observe(element));}
window.addEventListener('pagehide',()=>clearTimeout(typingTimer));

// Scores transcribed from OpenAI's GPT-6 Astra announcement, checked 2026-09-30.
const benchmarkNames={sol:'GPT-5.6 Sol',fable:'Claude Fable 5.1',opus:'Claude Opus 5'};
const benchmarkRows=[...document.querySelectorAll('[data-benchmark-group]')];
const benchmarkFilters=[...document.querySelectorAll('[data-benchmark-filter]')];
const benchmarkCompetitor=document.getElementById('benchmark-competitor');
let benchmarkFilter='all';
function updateBenchmarks(){
  const competitor=benchmarkCompetitor.value;
  let visible=0;
  benchmarkRows.forEach(row=>{
    row.hidden=benchmarkFilter!=='all'&&row.dataset.benchmarkGroup!==benchmarkFilter;
    if(!row.hidden)visible++;
    const raw=row.dataset[competitor];
    const hasScore=raw!==''&&raw!==undefined;
    const score=hasScore?Number(raw):null;
    const comparison=row.querySelector('.benchmark-compare');
    comparison.dataset.label=benchmarkNames[competitor];
    comparison.querySelector('.benchmark-score').textContent=hasScore?`${score.toFixed(1)}%`:'—';
    comparison.querySelector('.benchmark-bar i').style.setProperty('--score',`${score??0}%`);
    const delta=row.querySelector('.benchmark-delta');
    if(hasScore){
      const difference=Math.round((Number(row.dataset.astra)-score)*10)/10;
      delta.textContent=`${difference>0?'+':''}${difference.toFixed(1)} pp`;
      delta.dataset.trend=difference<0?'negative':'positive';
    }else{delta.textContent='비교 없음';delta.dataset.trend='missing'}
  });
  benchmarkFilters.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.benchmarkFilter===benchmarkFilter)));
  document.getElementById('benchmark-comparator-heading').textContent=benchmarkNames[competitor];
  document.getElementById('benchmark-summary').textContent=`${visible}개 평가 · ${benchmarkNames[competitor]}과 비교`;
  updateScroll();
}
benchmarkFilters.forEach(button=>button.addEventListener('click',()=>{benchmarkFilter=button.dataset.benchmarkFilter;updateBenchmarks()}));
benchmarkCompetitor.addEventListener('change',updateBenchmarks);
updateBenchmarks();
