"use strict";
const $ = (selector) => document.querySelector(selector);
const all = (selector) => Array.from(document.querySelectorAll(selector));
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
const motionPreference = matchMedia("(prefers-reduced-motion: reduce)");
let moving = !motionPreference.matches;
const art = $("#cover-art");
const slider = $("#reveal");
const heroCanvas = $("#hero-cad");
let reveal = 0,
  pointer = 0,
  heroFrame = 0,
  dirty = true;
function drawCover() {
  heroFrame = 0;
  art.style.setProperty("--reveal", reveal + "%");
  art.style.setProperty("--turn", reveal * -0.065 + "deg");
  art.style.setProperty("--zoom", 1.035 + reveal * 0.0018);
  slider.value = reveal;
  $("#reveal-out").value = reveal + "%";
  if (reveal > 0 || dirty)
    Paper.lamp(heroCanvas, 0.15 + reveal * 0.021 + pointer * 0.4, reveal / 100);
  dirty = false;
}
function redrawCover() {
  if (!heroFrame) heroFrame = requestAnimationFrame(drawCover);
}
// The frame stays pinned for the height of its track. Leave the final
// 12% of travel to see the completed drawing before the frame moves away.
const opening = $(".opening");
const folding = $(".folding");
const animationShare = 0.88;
function sceneBounds(scene) {
  const box = scene.getBoundingClientRect();
  const frame = scene.firstElementChild;
  const inset = parseFloat(getComputedStyle(frame).top) || 0;
  return {
    start: scrollY + box.top - inset,
    travel: (box.height - frame.offsetHeight) * animationShare,
  };
}
function percentAt(scene) {
  const { start, travel } = sceneBounds(scene);
  return Math.round(100 * clamp((scrollY - start) / Math.max(1, travel), 0, 1));
}
function seek(scene, percent, behavior = "instant") {
  const { start, travel } = sceneBounds(scene);
  window.scrollTo({ top: start + (travel * percent) / 100, behavior });
}
function followPage() {
  if (!moving) return;
  const next = percentAt(opening);
  if (reveal !== next) {
    reveal = next;
    redrawCover();
  }
  const nextFold = 100 - percentAt(folding);
  if (Number(fold.value) !== nextFold) {
    fold.value = nextFold;
    drawModel();
  }
}
function measureScenes() {
  // On shorter screens the reader can scroll the intro text into view
  // before the illustration pins. Keep the workshop drawing in view.
  opening.style.setProperty(
    "--pin-top",
    Math.min(0, innerHeight - opening.firstElementChild.offsetHeight) + "px",
  );
  folding.style.setProperty(
    "--pin-top",
    Math.max(0, (innerHeight - folding.firstElementChild.offsetHeight) * 0.45) +
      "px",
  );
  followPage();
}
function applyMotion(on) {
  moving = on;
  document.documentElement.dataset.motion = on ? "on" : "off";
  $("#motion").setAttribute("aria-pressed", String(on));
  $("#motion").textContent = on ? "모션 켜짐" : "모션 꺼짐";
  $(".cover-figure label").textContent = on
    ? "스크롤로 도면 펼치기"
    : "도면 펼치기";
  $("#fold-help").textContent = on
    ? "아래로 스크롤하면 종이가 펼쳐집니다."
    : "‘펼쳐 보기’를 누르면 종이가 펼쳐집니다.";
  pointer = 0;
  art.style.removeProperty("--px");
  art.style.removeProperty("--py");
  if (on) measureScenes();
  else {
    reveal = 0;
    redrawCover();
  }
}
slider.addEventListener("input", () => {
  reveal = Number(slider.value);
  if (moving) seek(opening, reveal);
  redrawCover();
});
art.addEventListener("pointermove", (event) => {
  if (!moving || event.pointerType === "touch") return;
  const b = art.getBoundingClientRect();
  pointer = (event.clientX - b.left) / b.width - 0.5;
  art.style.setProperty("--px", pointer * 2 + "%");
  art.style.setProperty(
    "--py",
    ((event.clientY - b.top) / b.height - 0.5) * 2 + "%",
  );
  redrawCover();
});
art.addEventListener("pointerleave", () => {
  pointer = 0;
  art.style.removeProperty("--px");
  art.style.removeProperty("--py");
  redrawCover();
});
addEventListener("scroll", followPage, { passive: true });
$("#motion").addEventListener("click", () => applyMotion(!moving));
motionPreference.addEventListener("change", (e) => applyMotion(!e.matches));

const steps = [
  [
    "Reference",
    "발코니의 윤곽을 따서 그렸습니다.",
    "위에서 내려다보면 발코니의 가장자리가 꽃잎처럼 둥글게 이어집니다. 그 윤곽을 층마다 겹쳐 그린 스케치입니다.",
    "발코니 윤곽 스케치",
  ],
  [
    "Revision",
    "종이를 어디서 접을지 정했습니다.",
    "화면에서는 곡선을 매끈하게 그릴 수 있습니다. 같은 곡선을 종이로 만들려면 한 면의 폭과 접는 위치부터 정해야 합니다. OpenAI 팀과 저는 CAD 도면을 여러 번 고쳤습니다.",
    "형상 스케치 · 주름과 단면",
  ],
  [
    "Handoff",
    "도안을 직접 고칠 수 있게 했습니다.",
    "저는 조명 도안을 만드는 사이트를 구현했습니다. OpenAI 팀은 그 도안을 따라 종이를 접고 조명을 조립했습니다. 아래 작업대에서 주름 수를 바꾸면 인쇄 도안의 접는 선도 모형에 맞춰 바뀝니다.",
    "조립 스케치 · 펼침과 접힘",
  ],
];
let step = 0;
function mark(buttons, choice) {
  for (const b of buttons) b.setAttribute("aria-pressed", String(b === choice));
}
const stepButtons = all("[data-step]");
for (const button of stepButtons)
  button.addEventListener("click", () => {
    step = Number(button.dataset.step);
    mark(stepButtons, button);
    const [name, title, body, plate] = steps[step];
    $("#case-en").textContent = name;
    $("#case-title").textContent = title;
    $("#case-text").textContent = body;
    $("#case-plate").textContent = plate;
    Paper.sketch($("#case-art"), step);
  });

const tests = {
  workflow: {
    name: "Agents’ Last Exam",
    value: "+5.2",
    unit: "점",
    title:
      "전작보다 5.2점 높았고, 과제당 비용은 전작의 3분의 1에도 못 미쳤습니다.",
    body: "여기서 전작은 GPT-6 Astra입니다. 이 시험에서는 자료 검토부터 최종 결과물 작성까지 여러 단계를 한 모델에 맡깁니다.",
    detail:
      "제 점수는 Claude Fable 5.2보다 5.5점 높았고, 비용은 Fable의 5%였습니다. Fable의 순위를 집계할 때는 대체 모델이 수행한 아홉 과제를 뺐습니다.",
  },
  design: {
    name: "AA-3D",
    value: "1,318",
    unit: "Elo",
    title: "평가자는 두 화면을 직접 써 보고 하나를 골랐습니다.",
    body: "평가자는 어떤 모델이 만들었는지 모르는 상태에서 두 3D 화면을 조작했습니다. 두 작품 중 하나를 고른 결과를 모아 Elo 점수를 매깁니다. 2026년 11월 17일 발표에서 저는 1위였습니다.",
    detail:
      "GPT-6.2 Astra 1,318  ·  Claude Fable 5.2 1,271  ·  GPT-6.2 Sol 1,259",
  },
  patch: {
    name: "FrontierCode 2.0",
    value: "약 ⅕",
    unit: "과제 비용",
    title: "코드 수정 비용이 중요하면 저는 Sol부터 권합니다.",
    body: "이 시험은 수정한 코드가 실제 프로젝트의 병합 기준에 맞는지 평가합니다. 두 모델의 추론 강도를 최대로 높였을 때 GPT-6.2 Sol과 제 점수 차이는 0.5점 이내였습니다. Sol이 쓴 비용은 제 비용의 약 5분의 1이었습니다.",
    detail:
      "이 비용 비율은 FrontierCode 2.0 과제에서 측정했습니다. 다른 작업의 견적에는 그 작업의 입력량과 출력량이 필요합니다.",
  },
  reports: {
    name: "GDPval v2",
    value: "+6.2",
    unit: "%p",
    title: "전문 실무 점수는 올랐고, 출력 토큰은 22% 줄었습니다.",
    body: "OpenAI가 금융, 컨설팅, 디자인 분야의 실제 프로젝트로 만든 내부 평가입니다. 제 점수는 GPT-6 Astra보다 6.2%포인트 높았습니다. 결과물을 작성할 때 쓴 출력 토큰은 전작보다 22% 적었습니다.",
    detail:
      "토큰은 모델이 글이나 코드를 처리할 때 쓰는 단위입니다. 이 시험에서 22% 줄어든 것은 출력량입니다.",
  },
};
const taskButtons = all("[data-task]");
function setTest(button) {
  const t = tests[button.dataset.task];
  mark(taskButtons, button);
  $("#score-test").textContent = t.name.toUpperCase();
  const unit = document.createElement("span");
  unit.textContent = t.unit;
  $("#score").replaceChildren(t.value, unit);
  $("#score-title").textContent = t.title;
  $("#score-copy").textContent = t.body;
  $("#score-detail").textContent = t.detail;
}
for (const button of taskButtons)
  button.addEventListener("click", () => setTest(button));
setTest(taskButtons[0]);

const ribs = $("#ribs"),
  height = $("#height"),
  fold = $("#fold");
function drawModel() {
  const n = Number(ribs.value),
    h = Number(height.value),
    p = Number(fold.value);
  const shape = Paper.model($("#fold-art"), n, h, p / 100);
  $("#ribs-out").value = n + "개";
  $("#height-out").value = h + " mm";
  $("#fold-out").value = p + "%";
  $("#model-dims").textContent =
    "완성 지름 " + (2 * shape.radius).toFixed(1) + " mm · 높이 " + h + " mm";
  $("#fold-toggle").textContent = p >= 50 ? "펼쳐 보기" : "접어 보기";
  $("#print-spec").textContent =
    `주름 ${n}개 · 높이 ${h}mm · 한 면의 폭 ${shape.width.toFixed(2)}mm · 가로 230mm + 풀칠 8mm`;
}
for (const input of [ribs, height, fold])
  input.addEventListener("input", () => {
    if (input === fold && moving) seek(folding, 100 - Number(fold.value));
    if (input === ribs || input === height) {
      const ending = document.createElement("em");
      ending.textContent = "직접 고친 도안입니다.";
      $("#closing").replaceChildren(
        "주름 " + ribs.value + "개, 높이 " + height.value + "mm.",
        document.createElement("br"),
        ending,
      );
      $("#signature").textContent = "GPT-6.2 Astra × 당신 · 도안 작업대에서";
    }
    drawModel();
  });
$("#fold-toggle").addEventListener("click", () => {
  const to = Number(fold.value) >= 50 ? 0 : 100;
  if (moving) seek(folding, 100 - to, "smooth");
  else {
    fold.value = to;
    drawModel();
  }
});
function prepareSheet() {
  Paper.net($("#net"), Number(ribs.value), Number(height.value));
}
addEventListener("beforeprint", prepareSheet);
$("#print").addEventListener("click", () => {
  prepareSheet();
  window.print();
});
new ResizeObserver(() => {
  dirty = true;
  redrawCover();
}).observe(art);
new ResizeObserver(() => Paper.sketch($("#case-art"), step)).observe(
  $(".study-plate"),
);
new ResizeObserver(drawModel).observe($(".bench figure"));
const layoutObserver = new ResizeObserver(measureScenes);
layoutObserver.observe(opening.firstElementChild);
layoutObserver.observe(folding.firstElementChild);
addEventListener("resize", measureScenes);
addEventListener("pageshow", measureScenes);
applyMotion(moving);
Paper.sketch($("#case-art"), step);
drawModel();
redrawCover();

const entries = all(".ledger input");
function totalEntries() {
  return entries.reduce(
    (sum, input) => sum + (input.checked ? Number(input.value) : 0),
    0,
  );
}
for (const entry of entries)
  entry.addEventListener("change", () => {
    $("#ledger-sum").value = "선택 합계 $" + totalEntries();
    $("#audit-note").textContent = "";
  });
$("#audit").addEventListener("click", () => {
  const correct = entries.every(
    (input) => input.checked === (input.dataset.counts === "yes"),
  );
  $("#audit-note").textContent = correct
    ? "맞습니다. 480달러와 260달러를 더하면 지급액은 740달러입니다. 예산 잔액 120달러는 아직 쓰지 않은 돈입니다."
    : "장부에 기록된 지급액은 모두 740달러입니다. ‘지급 완료’ 두 줄만 더해 보세요.";
});

const briefPairs = {
  merch: [
    "팀마다 시안 한 가지",
    "의뢰는 네 팀의 동물 굿즈를 기획해 달라는 것이었습니다. 전작은 팀마다 한 가지 디자인을 골라 제품 시안으로 보여줬습니다.",
    "여덟 가지 디자인과 제작 파일",
    "저는 여덟 가지 디자인을 각각 핀, 티셔츠, 가방 패치에 적용했습니다. 제작자가 시제품의 크기와 색을 확인할 수 있도록 벡터 원본과 권장 치수, 샘플 확인 지침도 건넸습니다.",
  ],
  book: [
    "별도 탭에 정리한 매출",
    "두 모델은 같은 가상 기업의 재무제표를 받아 2031년까지의 매출을 추정했습니다. 전작은 사업별 매출을 별도 탭에 정리하고, 기업가치로 주당 가치를 계산하는 과정은 시트 아래쪽에 담았습니다.",
    "한곳에 모은 주당 가치의 근거",
    "저는 민감도 표 옆에 사업별 매출과 주당 가치 계산식을 놓았습니다. 가정을 바꾼 사람이 그 자리에서 어느 사업의 매출이 달라졌는지, 주당 가치는 얼마나 변했는지 확인할 수 있습니다.",
  ],
};
const briefButtons = all("[data-brief]");
for (const button of briefButtons)
  button.addEventListener("click", () => {
    mark(briefButtons, button);
    const fields = ["prior-title", "prior-body", "new-title", "new-body"];
    fields.forEach(
      (id, i) =>
        ($("#" + id).textContent = briefPairs[button.dataset.brief][i]),
    );
  });
