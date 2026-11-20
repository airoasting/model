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
function followPage() {
  if (!moving) return;
  const bounds = art.getBoundingClientRect();
  const start = Math.max(0, scrollY + bounds.top - innerHeight * 0.68);
  const progress = clamp(
    (scrollY - start) / Math.max(150, bounds.height * 0.72),
    0,
    1,
  );
  const next = Math.round(progress * 100);
  if (reveal !== next) {
    reveal = next;
    redrawCover();
  }
}
function applyMotion(on) {
  moving = on;
  document.documentElement.dataset.motion = on ? "on" : "off";
  $("#motion").setAttribute("aria-pressed", String(on));
  $("#motion").textContent = on ? "모션 켜짐" : "모션 꺼짐";
  $(".cover-figure label").textContent = on
    ? "스크롤로 도면 펼치기"
    : "도면 펼치기";
  pointer = 0;
  art.style.removeProperty("--px");
  art.style.removeProperty("--py");
  if (on) followPage();
  else {
    reveal = 0;
    redrawCover();
  }
}
slider.addEventListener("input", () => {
  reveal = Number(slider.value);
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
applyMotion(moving);

const steps = [
  [
    "Reference",
    "건물에서 곡선 하나를 꺼냅니다.",
    "마리나 시티 전체를 작게 복제하면 건물 모형이 됩니다. 조명에 가져올 것은 탑의 높이보다 층마다 반복되는 발코니의 가장자리였습니다. 그림은 그 반복을 평면에서 다시 그린 스케치입니다.",
    "평면 스케치 · 형태 재해석",
  ],
  [
    "Revision",
    "곡선은 살리고, 종이가 꺾일 곳을 정합니다.",
    "OpenAI 팀은 저와 CAD 도면을 여러 번 고쳤습니다. 사진에는 보이지 않던 문제가 이 단계에서 생깁니다. 화면에서는 매끈한 곡선도 종이에 옮기려면 폭이 있는 면과 접히는 선으로 나눠야 합니다.",
    "형상 스케치 · 주름과 단면",
  ],
  [
    "Handoff",
    "도안을 고칠 도구까지 건넵니다.",
    "원래 사례에서 저는 종이 조명을 만드는 사이트를 구현했고, 사람은 도안을 손으로 조립했습니다. 아래 작업대에서도 주름 수를 바꿔 보세요. 모형과 인쇄 도안이 같은 치수에서 함께 바뀝니다.",
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
    title: "전작보다 점수가 높았고, 과제당 비용은 3분의 1 미만이었습니다.",
    body: "기준은 GPT-6 Astra입니다. 자료를 읽고 여러 단계를 거쳐 전문 업무를 마치는 평가라서, 긴 프로젝트에 저를 쓸 이유를 가장 직접적으로 보여줍니다.",
    detail:
      "Claude Fable 5.2와 비교하면 5.5점 앞섰고 비용은 5%였습니다. Fable의 순위표 결과는 대체 모델을 쓴 아홉 과제를 제외합니다.",
  },
  design: {
    name: "AA-3D",
    value: "1,318",
    unit: "Elo",
    title: "평가자는 두 화면을 직접 써 보고 하나를 골랐습니다.",
    body: "같은 요청으로 만든 인터랙티브 3D에서 모델 이름을 가렸습니다. 2026년 11월 17일 발표 기준 제 순위는 1위였습니다. Elo는 두 결과물을 맞붙인 선호도 평점입니다.",
    detail:
      "GPT-6.2 Astra 1,318  ·  Claude Fable 5.2 1,271  ·  GPT-6.2 Sol 1,259",
  },
  patch: {
    name: "FrontierCode 2.0",
    value: "약 ⅕",
    unit: "과제 비용",
    title: "코드 수정 비용이 중요하면 저는 Sol부터 권합니다.",
    body: "실제 코드베이스의 변경이 유지보수자의 병합 기준에 맞는지 평가했습니다. 두 모델 모두 추론 강도를 최대로 설정했을 때, GPT-6.2 Sol은 제 점수와 0.5점 이내였고 비용은 약 5분의 1이었습니다.",
    detail:
      "이 비용 비율은 FrontierCode 2.0 과제에서 측정했습니다. 다른 작업의 견적에는 그 작업의 입력량과 출력량이 필요합니다.",
  },
  reports: {
    name: "GDPval v2",
    value: "+6.2",
    unit: "%p",
    title: "전문 실무 점수는 올랐고, 출력 토큰은 22% 줄었습니다.",
    body: "OpenAI가 금융·컨설팅·디자인 등의 실제 프로젝트로 만든 내부 평가입니다. 전작 GPT-6 Astra와 비교해 결과물의 점수는 높았고, 답을 만드는 데 사용한 출력 토큰은 적었습니다.",
    detail:
      "토큰은 모델이 글이나 코드를 나누어 처리하는 단위입니다. 22%는 출력량 차이이며 작업 시간의 차이와는 구분됩니다.",
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
let animation = 0;
for (const input of [ribs, height, fold])
  input.addEventListener("input", () => {
    cancelAnimationFrame(animation);
    if (input === ribs || input === height) {
      const ending = document.createElement("em");
      ending.textContent = "이제 당신의 판본입니다.";
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
  cancelAnimationFrame(animation);
  const from = Number(fold.value),
    to = from >= 50 ? 0 : 100,
    start = performance.now();
  const tick = (now) => {
    const t = moving ? clamp((now - start) / 850, 0, 1) : 1;
    fold.value = Math.round(from + (to - from) * t * t * (3 - 2 * t));
    drawModel();
    if (t < 1) animation = requestAnimationFrame(tick);
  };
  animation = requestAnimationFrame(tick);
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
  followPage();
  redrawCover();
}).observe(art);
new ResizeObserver(() => Paper.sketch($("#case-art"), step)).observe(
  $(".study-plate"),
);
new ResizeObserver(drawModel).observe($(".bench figure"));
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
    ? "맞습니다. 두 지급 내역 $480와 $260을 합친 $740입니다. 예산 잔액은 아직 지출한 돈이 아닙니다."
    : "원자료의 지급 합계는 $740입니다. ‘지급 완료’ 두 줄을 합산하고 ‘예산 잔액’은 제외하세요.";
});

const briefPairs = {
  merch: [
    "네 팀, 팀마다 시안 하나.",
    "네 팀의 동물 굿즈를 기획하는 과제였습니다. 전작이 만든 목업에서는 팀마다 한 가지 디자인의 모습을 볼 수 있었습니다.",
    "여덟 디자인을 제작 파일까지.",
    "저는 여덟 디자인 각각을 핀, 티셔츠, 가방 패치에 얹었습니다. 제작자가 크기를 정하고 색을 대조할 수 있게 벡터 원본, 권장 치수, 실물 샘플 확인 지침도 함께 건넸습니다.",
  ],
  book: [
    "매출 구성은 별도 탭에.",
    "같은 가상 기업의 재무제표로 2031년까지를 예측하는 과제였습니다. 전작은 매출 구성을 별도 탭에 놓고, 기업가치에서 주당 가치로 이어지는 계산을 시트 아래쪽에 놓았습니다.",
    "주당 가치의 근거를 한눈에.",
    "저는 사업별 매출 구성과 주당 가치 계산을 민감도 표 옆에 두었습니다. 가정을 바꾸는 사람이 어느 사업의 매출이 움직였고, 그 변화가 주당 가치에 어떻게 이어졌는지 바로 따라갈 수 있습니다.",
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
