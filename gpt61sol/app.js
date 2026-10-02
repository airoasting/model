(() => {
  'use strict';
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let motion = !reducedMotion.matches;
  const motionButton = document.querySelector('.motion-toggle');
  const motionLabel = document.querySelector('.motion-label');
  const art = document.querySelector('.hero-art');
  const hero = document.querySelector('.hero');
  let heroVisible = true;
  let toastTimer;
  let scrollController = null;

  function updateMotion() {
    const position = scrollController?.capturePosition();
    root.classList.toggle('js-motion', motion);
    root.classList.toggle('no-motion', !motion);
    motionButton.setAttribute('aria-pressed', String(motion));
    motionButton.setAttribute('aria-label', motion ? '애니메이션 끄기' : '애니메이션 켜기');
    motionLabel.textContent = motion ? '모션 ON' : '모션 OFF';
    const image = art.querySelector('img');
    if (image) image.style.animationPlayState = motion && heroVisible ? 'running' : 'paused';
    if (!motion) {
      art.style.setProperty('--pointer-x', '0px');
      art.style.setProperty('--pointer-y', '0px');
      art.style.setProperty('--pointer-turn', '0deg');
    }
    scrollController?.syncMotion(position);
  }
  updateMotion();
  motionButton.addEventListener('click', () => { motion = !motion; updateMotion(); });
  reducedMotion.addEventListener('change', event => { motion = !event.matches; updateMotion(); });

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));
  new IntersectionObserver(entries => {
    heroVisible = entries[0].isIntersecting;
    const image = art.querySelector('img');
    if (image) image.style.animationPlayState = heroVisible && motion ? 'running' : 'paused';
  }).observe(hero);

  const menuButton = document.querySelector('.menu-toggle');
  const menu = document.querySelector('#mobile-menu');
  function closeMenu() {
    menu.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', '메뉴 열기');
  }
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menu.hidden = !open;
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
  });
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !menu.hidden) { closeMenu(); menuButton.focus(); } });

  const scenarios = {
    build: {
      prompt: '나만의 포트폴리오 사이트를 만들고 싶어. 미니멀하지만 기억에 남게.',
      intro: '작업이 먼저 눈에 들어오도록, 조용한 레이아웃 안에 한 가지 강한 인상을 남기겠습니다.',
      steps: ['작업 3개를 중심으로 이야기 구성', '큰 타이포그래피와 선명한 포인트 컬러', '모바일 화면과 키보드 탐색까지 확인'],
      file: 'portfolio / concept',
      artifact: '<div class="mini-portfolio"><span>SELECTED WORK / 2026</span><strong>Less, but<br><i>memorable.</i></strong><div class="mini-work"><span>01 / BRAND</span><span>02 / DIGITAL</span><span>03 / OBJECT</span></div></div>'
    },
    think: {
      prompt: '동네의 작은 책방을 위한 새로운 서비스, 어디서부터 시작하면 좋을까?',
      intro: '책을 많이 파는 방법보다, 사람들이 다시 찾아올 이유부터 생각해보겠습니다.',
      steps: ['단골 독자 5명에게 책방을 찾는 이유 묻기', '취향을 나누는 작은 독서 모임 기획', '2주 동안 시범 운영하고 다음 방문 의향 확인'],
      file: 'bookshop / first experiment',
      artifact: '<div class="plan-artifact"><span>A SMALL IDEA, A REAL FIRST STEP.</span><h4>취향으로 만나는 동네 책방</h4><div class="plan-phases"><div><b>01 / LISTEN</b><p>독자의 이야기<br>5명 인터뷰</p></div><div><b>02 / TRY</b><p>한 권의 책<br>작은 독서 모임</p></div><div><b>03 / LEARN</b><p>다음 약속<br>다시 올 이유 찾기</p></div></div></div>'
    },
    create: {
      prompt: '도시의 마지막 불빛을 수집하는 사람. 이 설정으로 짧은 이야기의 첫 문장을 써줘.',
      intro: '불빛을 수집한다는 낯선 행동을 일상의 작은 장면에 놓아, 이야기가 자연스럽게 시작되도록 해볼게요.',
      steps: ['밤의 도시를 배경으로 감각적인 장면 만들기', '설명 대신 작은 행동으로 인물 소개하기', '독자가 다음 문장을 궁금해할 여운 남기기'],
      file: 'the last light / opening',
      artifact: '<div class="story-artifact"><span>THE LAST LIGHT — CHAPTER 01</span><h4>도시가 잠들 때마다,<br>그는 빈 병을 하나씩 꺼냈다.</h4><p>오늘은 문 닫은 빵집의 노란 불빛이었다.<br>병을 흔들면, 아직 따뜻한 저녁 냄새가 났다.</p></div>'
    }
  };
  let currentScenario = 'build';
  const panel = document.querySelector('#scenario-panel');
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  function replay() {
    panel.classList.remove('is-playing');
    if (motion) requestAnimationFrame(() => requestAnimationFrame(() => panel.classList.add('is-playing')));
  }
  function selectScenario(name, scroll = false, fromScroll = false) {
    if (!scenarios[name]) return;
    currentScenario = name;
    const scenario = scenarios[name];
    tabs.forEach(tab => {
      const selected = tab.dataset.scenario === name;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    panel.setAttribute('aria-labelledby', `tab-${name}`);
    document.querySelector('#example-prompt').textContent = scenario.prompt;
    document.querySelector('#example-intro').textContent = scenario.intro;
    const steps = document.querySelector('#example-steps');
    steps.replaceChildren(...scenario.steps.map(text => {
      const row = document.createElement('div');
      row.innerHTML = '<svg aria-hidden="true"><use href="#check"/></svg>';
      const span = document.createElement('span');
      span.textContent = text;
      row.append(span);
      return row;
    }));
    document.querySelector('#artifact-file').textContent = scenario.file;
    document.querySelector('#artifact-body').innerHTML = scenario.artifact;
    replay();
    scrollController?.onScenarioSelected(name, scroll, fromScroll);
  }
  document.querySelectorAll('[data-scenario]').forEach(button => {
    button.addEventListener('click', () => selectScenario(button.dataset.scenario, button.classList.contains('capability')));
  });
  tabs.forEach((tab, index) => tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next !== undefined) { event.preventDefault(); selectScenario(tabs[next].dataset.scenario); tabs[next].focus(); }
  }));
  document.querySelector('#replay-demo').addEventListener('click', replay);

  function toast(text) {
    const element = document.querySelector('.toast');
    element.textContent = text;
    element.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => element.classList.remove('visible'), 3200);
  }
  async function copy(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
      else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.cssText = 'position:fixed;left:-9999px;top:0';
        document.body.append(textarea);
        textarea.select();
        const copied = document.execCommand('copy');
        textarea.remove();
        if (!copied) throw new Error('Clipboard unavailable');
      }
      toast('복사했어요. 대화창에 붙여넣어 시작하세요.');
    } catch { toast('복사를 사용할 수 없어요. 작업 예시의 요청 문장을 직접 선택해주세요.'); }
  }
  document.querySelector('#copy-prompt').addEventListener('click', () => copy(scenarios[currentScenario].prompt));
  document.querySelector('#copy-starter').addEventListener('click', () => copy('함께 새로운 아이디어를 만들어보자. 내가 만들고 싶은 것은 [아이디어]이고, [누가] 사용할 거야. 먼저 중요한 질문을 정리하고, 직접 확인할 수 있는 첫 결과물까지 만들어줘.'));

  // One scroll controller keeps the browser's native wheel, touch and keyboard scrolling.
  // Geometry is cached on layout changes; frames only update transforms and opacity.
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const heroStage = document.querySelector('.hero-scroll-stage');
  const heroCopy = document.querySelector('.hero-copy');
  const ticker = document.querySelector('.ticker');
  const tickerTrack = document.querySelector('.ticker-track');
  const words = [...document.querySelectorAll('.scroll-word')];
  const cards = [...document.querySelectorAll('.capability')];
  const principles = [...document.querySelectorAll('.principle')];
  const studioTrack = document.querySelector('.studio-scroll-track');
  const studioShell = document.querySelector('.studio-shell');
  const studioNumber = document.querySelector('.studio-wordmark small');
  const closing = document.querySelector('.closing');
  const header = document.querySelector('.site-header');
  const pinnedViewport = window.matchMedia('(min-width: 961px) and (min-height: 820px)');
  const sceneNames = ['build', 'think', 'create'];
  let geometry = {};
  let targetScroll = window.scrollY;
  let easedScroll = targetScroll;
  let scrollFrame = 0;
  let manualUntil = 0;
  let manualTimer;
  let measureFrame = 0;
  let measuredStudioHeight = 0;

  function layoutTop(element) {
    let top = 0;
    for (let current = element; current; current = current.offsetParent) top += current.offsetTop;
    return top;
  }
  function measureScenes() {
    measureFrame = 0;
    // Keep the scene's height stable while its shorter examples are displayed.
    measuredStudioHeight = Math.max(measuredStudioHeight, studioShell.offsetHeight);
    studioTrack.style.setProperty('--studio-size', `${measuredStudioHeight}px`);
    const studioTop = parseFloat(getComputedStyle(studioShell).top) || 126;
    geometry = {
      viewport: window.innerHeight,
      maxScroll: Math.max(1, root.scrollHeight - window.innerHeight),
      heroTop: layoutTop(heroStage),
      heroTravel: Math.max(1, heroStage.offsetHeight - hero.offsetHeight),
      heroHeight: hero.offsetHeight,
      heroPinned: getComputedStyle(hero).position === 'sticky',
      tickerTop: layoutTop(ticker),
      aboutTop: layoutTop(document.querySelector('#about-title')),
      cards: cards.map(element => ({ top: layoutTop(element), height: element.offsetHeight })),
      principles: principles.map(element => ({ top: layoutTop(element), height: element.offsetHeight })),
      studioStart: layoutTop(studioTrack) - studioTop,
      studioTravel: Math.max(1, studioTrack.offsetHeight - studioShell.offsetHeight),
      studioPinned: getComputedStyle(studioShell).position === 'sticky',
      closingTop: layoutTop(closing),
      closingHeight: closing.offsetHeight
    };
    queueScrollFrame();
  }
  function queueMeasurements() {
    if (!measureFrame) measureFrame = requestAnimationFrame(measureScenes);
  }
  function renderScroll(scrollY) {
    const viewport = geometry.viewport || window.innerHeight;
    document.querySelector('.reading-progress').style.width = `${clamp(window.scrollY / (geometry.maxScroll || 1)) * 100}%`;
    header.classList.toggle('is-scrolled', window.scrollY > 32);
    if (!motion) return;

    const heroProgress = clamp((scrollY - geometry.heroTop) / (geometry.heroPinned ? geometry.heroTravel : geometry.heroHeight * .85));
    art.style.setProperty('--hero-turn', `${-44 * heroProgress}deg`);
    art.style.setProperty('--hero-scale', `${1 + heroProgress * .3}`);
    art.style.setProperty('--hero-shift-x', `${window.innerWidth > 780 ? -150 * heroProgress : 0}px`);
    art.style.setProperty('--hero-shift-y', `${-24 * heroProgress}px`);
    heroCopy.style.setProperty('--hero-copy-y', `${-64 * heroProgress}px`);
    heroCopy.style.setProperty('--hero-copy-opacity', `${1 - heroProgress * .62}`);
    hero.style.setProperty('--hero-glow', `${.35 + heroProgress * .45}`);

    const tickerProgress = clamp((scrollY + viewport - geometry.tickerTop) / (viewport + 100));
    tickerTrack.style.setProperty('--ticker-shift', `${-180 * tickerProgress}px`);
    ticker.style.setProperty('--ticker-turn', `${Math.sin(tickerProgress * Math.PI) * 2.4}deg`);

    const reading = clamp((scrollY + viewport * .83 - geometry.aboutTop) / (viewport * .46));
    words.forEach((word, index) => word.style.setProperty('--word-light', clamp(reading * (words.length + 1) - index)));
    principles.forEach((element, index) => {
      const progress = clamp((scrollY + viewport * .9 - geometry.principles[index].top) / (viewport * .38));
      element.style.setProperty('--principle-line', clamp(progress * 1.3 - index * .12));
    });
    cards.forEach((card, index) => {
      const progress = clamp((scrollY + viewport * .94 - geometry.cards[index].top) / (viewport * .46));
      const staggered = clamp(progress * 1.25 - (window.innerWidth > 780 ? index * .1 : 0));
      card.style.setProperty('--card-y', `${(1 - staggered) * 76}px`);
      card.style.setProperty('--card-tilt', `${(1 - staggered) * 13}deg`);
      card.style.setProperty('--card-scale', `${.93 + staggered * .07}`);
      card.style.setProperty('--card-opacity', `${.25 + staggered * .75}`);
    });

    if (pinnedViewport.matches && geometry.studioPinned) {
      const progress = clamp((scrollY - geometry.studioStart) / geometry.studioTravel);
      const phase = Math.min(2.999, progress * sceneNames.length);
      const index = Math.floor(phase);
      const inScene = scrollY >= geometry.studioStart - 1 && scrollY <= geometry.studioStart + geometry.studioTravel + 1;
      if (inScene && performance.now() >= manualUntil && currentScenario !== sceneNames[index]) selectScenario(sceneNames[index], false, true);
      studioShell.style.setProperty('--studio-progress', `${progress}`);
      tabs.forEach((tab, tabIndex) => tab.style.setProperty('--tab-progress', `${clamp(phase - tabIndex)}`));
    }
    const closingProgress = clamp((scrollY + viewport * .88 - geometry.closingTop) / (viewport * .7));
    closing.style.setProperty('--closing-progress', `${closingProgress}`);
  }
  function animateScroll() {
    scrollFrame = 0;
    targetScroll = window.scrollY;
    if (!motion) easedScroll = targetScroll;
    else easedScroll += (targetScroll - easedScroll) * .19;
    if (Math.abs(targetScroll - easedScroll) < .15) easedScroll = targetScroll;
    renderScroll(easedScroll);
    if (motion && Math.abs(targetScroll - easedScroll) > .15) queueScrollFrame();
  }
  function queueScrollFrame() {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(animateScroll);
  }
  scrollController = {
    capturePosition() {
      const anchors = [studioShell, hero, document.querySelector('#about'), document.querySelector('#possibilities'), closing];
      for (const element of anchors) {
        const rect = element.getBoundingClientRect();
        if (rect.top < window.innerHeight * .6 && rect.bottom > window.innerHeight * .3) return { element, top: rect.top };
      }
      return null;
    },
    syncMotion(position) {
      manualUntil = 0;
      clearTimeout(manualTimer);
      if (!motion) {
        heroCopy.style.removeProperty('--hero-copy-y');
        heroCopy.style.removeProperty('--hero-copy-opacity');
        words.forEach(word => word.style.setProperty('--word-light', '1'));
      }
      easedScroll = window.scrollY;
      queueMeasurements();
      if (position) requestAnimationFrame(() => {
        measureScenes();
        if (motion && geometry.studioPinned && position.element === studioShell) {
          const index = sceneNames.indexOf(currentScenario);
          manualUntil = performance.now() + 350;
          window.scrollTo({ top: geometry.studioStart + geometry.studioTravel * (index + .22) / sceneNames.length, behavior: 'instant' });
        } else window.scrollBy({ top: position.element.getBoundingClientRect().top - position.top, behavior: 'instant' });
        easedScroll = window.scrollY;
        queueScrollFrame();
      });
    },
    onScenarioSelected(name, shouldScroll, fromScroll) {
      studioNumber.textContent = `${String(sceneNames.indexOf(name) + 1).padStart(2, '0')} / 03`;
      if (fromScroll) return;
      const insideScene = window.scrollY >= geometry.studioStart - 180 && window.scrollY <= geometry.studioStart + geometry.studioTravel + 180;
      if (motion && pinnedViewport.matches && geometry.studioPinned && (shouldScroll || insideScene)) {
        manualUntil = performance.now() + 1400;
        clearTimeout(manualTimer);
        const target = geometry.studioStart + geometry.studioTravel * (sceneNames.indexOf(name) + .22) / sceneNames.length;
        window.scrollTo({ top: target, behavior: 'smooth' });
        manualTimer = setTimeout(() => { manualUntil = 0; queueScrollFrame(); }, 1450);
      } else if (shouldScroll) document.querySelector('#studio').scrollIntoView({ behavior: motion ? 'smooth' : 'auto' });
      queueMeasurements();
    }
  };
  window.addEventListener('scroll', queueScrollFrame, { passive: true });
  window.addEventListener('wheel', () => { manualUntil = 0; }, { passive: true });
  function resetSceneSize() {
    measuredStudioHeight = 0;
    studioTrack.style.removeProperty('--studio-size');
    queueMeasurements();
  }
  window.addEventListener('resize', resetSceneSize, { passive: true });
  pinnedViewport.addEventListener('change', resetSceneSize);
  new ResizeObserver(queueMeasurements).observe(studioShell);
  document.fonts.ready.then(queueMeasurements);
  measureScenes();
  renderScroll(window.scrollY);

  // Ambient points are non-representational geometry; the hero artwork is a separate generated asset.
  const canvas = document.querySelector('#ambient-canvas');
  const context = canvas.getContext('2d');
  let width = 0, height = 0, pointerX = 0, pointerY = 0;
  let points = [];
  function resizeCanvas() {
    width = hero.clientWidth;
    height = hero.clientHeight;
    const scale = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = width * scale;
    canvas.height = height * scale;
    if (context) context.setTransform(scale, 0, 0, scale, 0, 0);
    const count = window.innerWidth < 780 ? 28 : 65;
    points = Array.from({ length: count }, () => ({ x: Math.random() * width, y: Math.random() * height, r: Math.random() * .9 + .3, speed: Math.random() * .12 + .04, phase: Math.random() * Math.PI * 2 }));
    if (!motion) paintPoints(0);
  }
  hero.addEventListener('pointermove', event => {
    if (!motion || event.pointerType !== 'mouse') return;
    const box = hero.getBoundingClientRect();
    pointerX = (event.clientX - box.left) / box.width - .5;
    pointerY = (event.clientY - box.top) / box.height - .5;
    art.style.setProperty('--pointer-x', `${pointerX * 19}px`);
    art.style.setProperty('--pointer-y', `${pointerY * 15}px`);
    art.style.setProperty('--pointer-turn', `${pointerX * 2}deg`);
  });
  hero.addEventListener('pointerleave', () => {
    pointerX = 0; pointerY = 0;
    art.style.setProperty('--pointer-x', '0px');
    art.style.setProperty('--pointer-y', '0px');
    art.style.setProperty('--pointer-turn', '0deg');
  });
  function paintPoints(time) {
    if (!context) return;
    context.clearRect(0, 0, width, height);
    for (const point of points) {
      const alpha = .17 + .22 * (.5 + .5 * Math.sin(time * .0005 + point.phase));
      context.fillStyle = `rgba(203,181,255,${alpha})`;
      context.beginPath();
      context.arc(point.x, point.y, point.r, 0, Math.PI * 2);
      context.fill();
      if (motion) { point.y -= point.speed; if (point.y < 0) point.y = height; }
    }
  }
  let lastFrame = 0;
  function frame(time) {
    if (motion && heroVisible && !document.hidden && time - lastFrame > 30) { paintPoints(time); lastFrame = time; }
    requestAnimationFrame(frame);
  }
  new ResizeObserver(resizeCanvas).observe(hero);
  resizeCanvas();
  paintPoints(0);
  requestAnimationFrame(frame);
})();
