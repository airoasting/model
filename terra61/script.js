'use strict';

const tasks = {
  catalog: {
    kicker: 'SEE → MATCH → UPDATE',
    title: ['사진을 살피고', '상품을 연결해요.'],
    copy: '공급업체의 상품 사진을 카탈로그와 비교하고, 일치하는 항목을 찾아 목록을 업데이트하는 작업을 도울 수 있습니다.',
    output: '매칭 결과와 확인이 필요한 항목 목록',
  },
  design: {
    kicker: 'OBSERVE → REVIEW → ORGANIZE',
    title: ['디자인을 보고', '수정점을 찾아요.'],
    copy: '캠페인 이미지에서 잘린 부분과 글자 배치를 살피고, 수정이 필요한 사항을 정리하는 데 활용할 수 있습니다.',
    output: '소재별 검토 내용과 수정 사항 목록',
  },
  writing: {
    kicker: 'READ → DRAFT → REFINE',
    title: ['주어진 자료를', '명확한 제안으로.'],
    copy: '브리프와 참고 자료를 바탕으로 제안서 초안을 작성하고, 대상 독자와 목적에 맞게 문장을 간결하고 자연스럽게 다듬습니다.',
    output: '핵심 제안과 근거를 담은 문서 초안',
  },
  code: {
    kicker: 'INSPECT → EDIT → VERIFY',
    title: ['명확한 수정부터', '결과 확인까지.'],
    copy: '기존 코드와 요구사항, 검증 방법을 함께 제공해 보세요. 범위가 정해진 파일 수정과 결과 확인에 활용할 수 있습니다.',
    output: '수정한 파일과 검증 결과',
  },
};

const evaluations = {
  visual: {
    kicker: '01 / VISUAL ACCURACY',
    title: '원본에서 읽은 정보가 정확한가?',
    copy: '같은 이미지와 같은 질문으로 비교하고, 식별한 항목과 읽어낸 수치를 원본 자료에 대조하세요.',
    checks: ['상품·레이블·수치 식별의 정확성', '읽기 어려운 부분의 불확실성 표시', '검토와 수정에 걸린 전체 시간'],
  },
  computer: {
    kicker: '02 / TASK COMPLETION',
    title: '실제 저장된 결과까지 맞는가?',
    copy: '완료 보고만 읽는 데서 그치지 말고, 수정된 기록이나 페이지를 다시 열어 요청한 변경이 반영되었는지 확인하세요.',
    checks: ['요청한 작업의 완료 여부', '관련 없는 데이터의 보존 여부', '완료 보고와 실제 저장 결과의 일치'],
  },
  writing: {
    kicker: '03 / WRITING QUALITY',
    title: '독자와 목적에 맞게 쓰였는가?',
    copy: '같은 자료와 요구사항으로 만든 글을 나란히 읽어보세요. 길이와 정확성뿐 아니라 문체와 필요한 세부 정보도 확인하세요.',
    checks: ['필수 사실과 조건의 정확한 반영', '대상 독자에 맞는 문체와 정보량', '검토·수정 시간을 포함한 유용성'],
  },
  code: {
    kicker: '04 / REGRESSION CHECK',
    title: '수정 후에도 의도대로 작동하는가?',
    copy: '같은 코드와 수정 요구를 제공하고 회귀 테스트를 실행하세요. 인터랙티브 앱이라면 데스크톱과 모바일의 렌더링도 살펴보세요.',
    checks: ['요구사항을 충족하는 코드 변경', '기존 기능의 회귀 테스트 통과', '실제 화면과 인터랙션의 정상 작동'],
  },
};

function setLines(element, lines) {
  element.replaceChildren();
  lines.forEach((line, index) => {
    if (index) element.append(document.createElement('br'));
    element.append(document.createTextNode(line));
  });
}

function connectTabs(selector, panel, onSelect) {
  const tabs = [...document.querySelectorAll(selector)];
  const vertical = tabs[0]?.parentElement.getAttribute('aria-orientation') === 'vertical';
  const previous = vertical ? 'ArrowUp' : 'ArrowLeft';
  const next = vertical ? 'ArrowDown' : 'ArrowRight';
  function select(tab) {
    tabs.forEach(item => {
      const active = item === tab;
      item.classList.toggle('active', active);
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
    });
    panel.setAttribute('aria-labelledby', tab.id);
    onSelect(tab);
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', event => {
      if (![previous, next, 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let targetIndex = index;
      if (event.key === previous) targetIndex = (index - 1 + tabs.length) % tabs.length;
      if (event.key === next) targetIndex = (index + 1) % tabs.length;
      if (event.key === 'Home') targetIndex = 0;
      if (event.key === 'End') targetIndex = tabs.length - 1;
      select(tabs[targetIndex]);
      tabs[targetIndex].focus();
    });
  });
}

connectTabs('[data-choice]', document.querySelector('#task-panel'), tab => {
  const task = tasks[tab.dataset.choice];
  document.querySelector('#result-kicker').textContent = task.kicker;
  setLines(document.querySelector('#result-title'), task.title);
  document.querySelector('#result-copy').textContent = task.copy;
  document.querySelector('#result-output').textContent = task.output;
});

connectTabs('[data-eval]', document.querySelector('#evaluation-panel'), tab => {
  const evaluation = evaluations[tab.dataset.eval];
  document.querySelector('#evaluation-kicker').textContent = evaluation.kicker;
  document.querySelector('#evaluation-title').textContent = evaluation.title;
  document.querySelector('#evaluation-copy').textContent = evaluation.copy;
  document.querySelector('#evaluation-checks').replaceChildren(...evaluation.checks.map(check => {
    const item = document.createElement('li');
    item.textContent = check;
    return item;
  }));
});

const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
const revealElements = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !motionQuery.matches) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  revealElements.forEach(element => observer.observe(element));
  document.documentElement.classList.add('js');
  motionQuery.addEventListener('change', event => {
    if (event.matches) {
      observer.disconnect();
      revealElements.forEach(element => element.classList.add('visible'));
    }
  });
}

const hero = document.querySelector('.hero');
const heroScroll = document.querySelector('.hero-scroll');
const heroInner = document.querySelector('.hero-inner');
const heroCopy = document.querySelector('.hero-copy');
const object = document.querySelector('.object-model');
const coreImage = object.querySelector('img');
const phaseLabels = [...document.querySelectorAll('.scroll-phases>span')];
const progress = document.querySelector('.progress span');
let scrollGeometry = null;
let scrollPending = false;
let measurePending = false;
let activePhase = -1;

const clamp = value => Math.min(1, Math.max(0, value));
function smoothRange(start, end, value) {
  const normalized = clamp((value - start) / (end - start));
  return normalized * normalized * (3 - 2 * normalized);
}

// Offset geometry stays independent of the transforms driven by scrolling.
function positionInHero(element) {
  let x = 0;
  let y = 0;
  for (let node = element; node && node !== hero; node = node.offsetParent) {
    x += node.offsetLeft;
    y += node.offsetTop;
  }
  return { x, y };
}

function measureHero() {
  measurePending = false;
  heroScroll.classList.remove('scroll-motion');
  if (motionQuery.matches) {
    scrollGeometry = null;
    heroCopy.inert = false;
    updateProgress();
    return;
  }

  const mobile = innerWidth <= 750;
  const stageHeight = hero.offsetHeight;
  const stickyTop = Math.min(0, innerHeight - stageHeight);
  const distance = mobile
    ? Math.min(640, Math.max(430, innerHeight * 0.72))
    : Math.min(960, Math.max(560, innerHeight * 0.9));
  const center = positionInHero(coreImage);
  const wrapperTop = heroScroll.getBoundingClientRect().top + scrollY;
  scrollGeometry = {
    start: wrapperTop - stickyTop,
    distance,
    x: hero.clientWidth / 2 - (center.x + coreImage.offsetWidth / 2),
    y: innerHeight * (mobile ? 0.48 : 0.44) - stickyTop - (center.y + coreImage.offsetHeight / 2),
    shrink: mobile ? 0.18 : 0.28,
  };

  heroScroll.style.setProperty('--hero-stage-height', stageHeight + 'px');
  heroScroll.style.setProperty('--hero-sticky-top', stickyTop + 'px');
  heroScroll.style.setProperty('--hero-scroll-distance', distance + 'px');
  heroScroll.classList.add('scroll-motion');
  updateProgress();
}

function updateHeroScroll() {
  if (!scrollGeometry || motionQuery.matches) return;
  const amount = clamp((scrollY - scrollGeometry.start) / scrollGeometry.distance);
  const travel = smoothRange(0, 1, amount);
  const phaseReveal = smoothRange(0.18, 0.42, amount);
  heroCopy.inert = amount >= 0.44;
  const values = {
    '--core-x': scrollGeometry.x * travel + 'px',
    '--core-y': scrollGeometry.y * travel + 'px',
    '--core-rotation': travel * 105 + 'deg',
    '--core-rotate-x': travel * 18 + 'deg',
    '--core-rotate-y': travel * -26 + 'deg',
    '--core-scale': 1 - travel * scrollGeometry.shrink,
    '--core-detail-opacity': 1 - smoothRange(0.03, 0.32, amount),
    '--core-halo-opacity': 1 + travel * 0.5,
    '--core-halo-scale': 1 + travel * 0.25,
    '--hero-copy-y': travel * -70 + 'px',
    '--hero-copy-opacity': 1 - smoothRange(0.04, 0.44, amount),
    '--phase-opacity': phaseReveal,
    '--phase-y': (1 - phaseReveal) * 12 + 'px',
    '--scroll-cue-opacity': 1 - smoothRange(0, 0.2, amount),
  };
  for (const [property, value] of Object.entries(values)) {
    heroScroll.style.setProperty(property, String(value));
  }
  const phase = Math.min(2, Math.floor(amount * 3));
  if (phase !== activePhase) {
    phaseLabels.forEach((label, index) => label.classList.toggle('is-active', index === phase));
    activePhase = phase;
  }
}

function updateProgress() {
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.width = (max > 0 ? clamp(scrollY / max) * 100 : 0) + '%';
  updateHeroScroll();
  scrollPending = false;
}

function queueMeasure() {
  if (measurePending) return;
  measurePending = true;
  requestAnimationFrame(measureHero);
}

addEventListener('scroll', () => {
  if (!scrollPending) {
    scrollPending = true;
    requestAnimationFrame(updateProgress);
  }
}, { passive: true });
addEventListener('resize', queueMeasure);
addEventListener('load', queueMeasure);
addEventListener('pageshow', queueMeasure);
if ('ResizeObserver' in window) {
  new ResizeObserver(queueMeasure).observe(heroInner);
  new ResizeObserver(updateProgress).observe(document.body);
}
if (document.fonts) document.fonts.ready.then(queueMeasure);
measureHero();

hero.addEventListener('pointermove', event => {
  if (motionQuery.matches || event.pointerType !== 'mouse') return;
  const bounds = hero.getBoundingClientRect();
  const x = (event.clientX - bounds.left) / bounds.width - 0.5;
  const y = (event.clientY - bounds.top) / bounds.height - 0.5;
  object.style.setProperty('--tilt-x', -y * 8 + 'deg');
  object.style.setProperty('--tilt-y', x * 10 + 'deg');
}, { passive: true });
function resetObject() {
  object.style.removeProperty('--tilt-x');
  object.style.removeProperty('--tilt-y');
}
hero.addEventListener('pointerleave', resetObject);
motionQuery.addEventListener('change', () => {
  resetObject();
  queueMeasure();
});
