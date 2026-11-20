"use strict";

const select = (selector) => document.querySelector(selector);
const all = (selector) => Array.from(document.querySelectorAll(selector));
const tones = {
  solar: { name: "Solar", hue: "0deg", ink: "#d64218", paper: "#f7ede0" },
  blue: { name: "Cobalt", hue: "206deg", ink: "#294eaa", paper: "#e9edf5" },
  green: { name: "Viridian", hue: "133deg", ink: "#14775e", paper: "#e6f0e7" },
};

const media = matchMedia("(prefers-reduced-motion: reduce)");
let moving = !media.matches;
function applyMotion(enabled) {
  moving = enabled;
  document.documentElement.dataset.motion = enabled ? "on" : "off";
  select("#motion").setAttribute("aria-pressed", String(enabled));
  select("#motion-name").textContent = enabled ? "Motion on" : "Motion off";
  resetPerspective();
}
function resetPerspective() {
  for (const property of ["--rx", "--ry", "--rz"])
    select(".object").style.removeProperty(property);
}
applyMotion(moving);
select("#motion").addEventListener("click", () => applyMotion(!moving));
media.addEventListener("change", (event) => applyMotion(!event.matches));
const stage = select("#specimen-stage");
stage.addEventListener("pointermove", (event) => {
  if (!moving || event.pointerType === "touch") return;
  const bounds = stage.getBoundingClientRect();
  const x = (event.clientX - bounds.left) / bounds.width - 0.5;
  const y = (event.clientY - bounds.top) / bounds.height - 0.5;
  const image = select(".object");
  image.style.setProperty("--rx", -y * 14 + "deg");
  image.style.setProperty("--ry", x * 16 + "deg");
  image.style.setProperty("--rz", x * 5 + "deg");
});
stage.addEventListener("pointerleave", resetPerspective);
function markSelection(buttons, selected) {
  for (const button of buttons)
    button.setAttribute("aria-pressed", String(button === selected));
}
const swatches = all("[data-tone]");
for (const button of swatches) {
  button.addEventListener("click", () => {
    const color = tones[button.dataset.tone];
    select(".object").style.setProperty("--hue", color.hue);
    stage.setAttribute(
      "aria-label",
      button.getAttribute("aria-label") +
        " 색상의 광학 유리와 크롬 궤도로 구성한 Astra의 자화상",
    );
    select("#material-name").textContent = color.name;
    markSelection(swatches, button);
  });
}

const benchmarks = {
  design: {
    measure: "AA-3D / 선호도 평점",
    score: "1,318",
    unit: "Elo",
    description:
      "평가자가 모델 이름을 가린 두 3D 결과물을 직접 조작한 뒤 선호하는 쪽을 골랐습니다.",
    ranking: [
      ["GPT-6.2 Astra", "1,318"],
      ["Claude Fable 5.2", "1,271"],
      ["GPT-6.2 Sol", "1,259"],
    ],
  },
  analysis: {
    measure: "AA-AnalystAgent / 5회 연속 정답률",
    score: "62.5",
    unit: "%",
    description:
      "실제 스프레드시트와 보고서를 읽고 답하는 평가입니다. Astra는 전체 문항의 62.5%에서 다섯 번의 독립 시도 모두 정답을 냈습니다.",
    note: "예시 과제 · 캘리포니아 메디케이드 지출 보고서에서 의료 수송에 쓴 총액 구하기.",
  },
  science: {
    measure: "Terminal-Bench-Science 0.1 / 전작 대비 향상",
    score: "+9",
    unit: "%p",
    description:
      "터미널에서 과학 과제를 수행하는 평가에서 GPT-6 Astra보다 점수가 9%포인트 올랐습니다.",
    note: "같은 평가에서 과제당 비용은 전작의 3분의 1 미만이었습니다.",
  },
  work: {
    measure: "GDPval v2 / 전작 대비 향상",
    score: "+6.2",
    unit: "%p",
    description:
      "금융·컨설팅·디자인 분야의 실제 프로젝트를 토대로 여러 단계의 업무를 맡기는 OpenAI 내부 평가입니다.",
    note: "GPT-6 Astra보다 점수가 6.2%포인트 높았고 출력 토큰은 22% 적었습니다.",
  },
};
const benchButtons = all("[data-bench]");
function showBenchmark(button) {
  const data = benchmarks[button.dataset.bench];
  markSelection(benchButtons, button);
  for (const key of ["measure", "score", "unit"])
    select("#" + key).textContent = data[key];
  select("#measure-desc").textContent = data.description;
  const extra = document.createElement(data.ranking ? "ol" : "p");
  if (data.ranking) {
    for (const pair of data.ranking) {
      const row = document.createElement("li");
      for (const field of pair) {
        const value = document.createElement("span");
        value.textContent = field;
        row.append(value);
      }
      extra.append(row);
    }
  } else {
    extra.className = "note";
    extra.textContent = data.note;
  }
  select("#comparison").replaceChildren(extra);
}
for (const button of benchButtons)
  button.addEventListener("click", () => showBenchmark(button));
showBenchmark(benchButtons[0]);

// Build a ruled torus from closed ink paths. A three-lobed twist changes each
// meridian's radius and depth before its projection onto the print surface.
const canvas = select("#print");
const ctx = canvas.getContext("2d");
const tau = Math.PI * 2;
const rings = select("#rings");
const tilt = select("#tilt");
const inks = all("[data-ink]");
let ink = "solar";
function drawPrint() {
  const count = Number(rings.value);
  const angle = (Number(tilt.value) * Math.PI) / 180;
  const { name, paper, ink: pigment } = tones[ink];
  const w = canvas.width,
    h = canvas.height;
  select("#rings-value").value = String(count);
  select("#tilt-value").value = tilt.value + "°";
  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, w, h);
  ctx.save();
  ctx.translate(w * 0.5, h * 0.49);
  ctx.strokeStyle = "#63635a";
  ctx.globalAlpha = 0.17;
  ctx.lineWidth = 1;
  for (const radius of [220, 346]) {
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, tau);
    ctx.stroke();
  }
  for (let tick = 0; tick < 120; tick++) {
    ctx.save();
    ctx.rotate((tau * tick) / 120);
    ctx.beginPath();
    ctx.moveTo(346, 0);
    ctx.lineTo(tick % 5 ? 350 : 358, 0);
    ctx.stroke();
    ctx.restore();
  }
  ctx.globalAlpha = 0.88;
  ctx.rotate(angle);
  const project = (x, y, z) => [x * 1.1, (z * 0.84 + y * 0.58) * 1.1];
  for (let ring = 0; ring < count; ring++) {
    const v = (tau * ring) / count;
    ctx.beginPath();
    for (let step = 0; step <= 280; step++) {
      const u = (tau * step) / 280;
      const phase = v + 2 * u;
      const radius = 208 + 72 * Math.cos(phase) + 31 * Math.sin(3 * u + angle);
      const z = 87 * Math.sin(phase) + 85 * Math.cos(2 * u + angle);
      const [px, py] = project(radius * Math.cos(u), radius * Math.sin(u), z);
      if (step === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = pigment;
    ctx.lineWidth = ring % 6 === 0 ? 2.7 : 1.55;
    ctx.closePath();
    ctx.stroke();
  }
  ctx.restore();
  ctx.fillStyle = "#393a33";
  ctx.font = "18px monospace";
  ctx.textAlign = "left";
  ctx.fillText("ASTRA / ORBIT PRINT", 34, 47);
  ctx.fillText(
    name.toUpperCase() + "  /  " + count + " RINGS  /  " + tilt.value + "°",
    34,
    h - 32,
  );
  ctx.textAlign = "right";
  ctx.fillText("GPT-6.2", w - 34, h - 32);
}
function setInk(button) {
  ink = button.dataset.ink;
  markSelection(inks, button);
}
for (const button of inks)
  button.addEventListener("click", () => {
    setInk(button);
    drawPrint();
  });
for (const slider of [rings, tilt]) slider.addEventListener("input", drawPrint);
select("#mix").addEventListener("click", () => {
  rings.value = 12 + Math.floor(Math.random() * 73);
  tilt.value = -75 + Math.floor(Math.random() * 151);
  setInk(inks[Math.floor(Math.random() * inks.length)]);
  drawPrint();
});
select("#save").addEventListener("click", () => {
  const link = document.createElement("a");
  link.download =
    "astra-orbit-" + ink + "-" + rings.value + "-" + tilt.value + ".png";
  link.href = canvas.toDataURL("image/png");
  document.body.append(link);
  link.click();
  link.remove();
  select("#save-status").textContent = "1,200 × 900 PNG를 내보냈습니다.";
});
drawPrint();

const navLinks = all("nav a");
function updateNav() {
  const threshold = Math.min(innerHeight * 0.45, 320);
  let current = navLinks[0];
  for (const link of navLinks) {
    if (
      document.querySelector(link.hash).getBoundingClientRect().top <= threshold
    )
      current = link;
  }
  for (const link of navLinks) {
    link.classList.toggle("active", link === current);
    if (link === current) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  }
}
let navPending = false;
addEventListener(
  "scroll",
  () => {
    if (navPending) return;
    navPending = true;
    requestAnimationFrame(() => {
      updateNav();
      navPending = false;
    });
  },
  { passive: true },
);
updateNav();

// The loupe samples the original artwork at the same point on the uncropped image.
const loupe = select(".loupe");
const inspect = select("#inspect");
function positionLoupe(clientX, clientY) {
  const panel = stage.getBoundingClientRect();
  const art = select(".object").getBoundingClientRect();
  const radius = loupe.offsetWidth / 2;
  const zoom = 2.15;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const x = clamp(
    clientX ?? art.left + art.width / 2,
    art.left + radius,
    art.right - radius,
  );
  const y = clamp(
    clientY ?? art.top + art.height / 2,
    art.top + radius,
    art.bottom - radius,
  );
  loupe.style.left = x - panel.left + "px";
  loupe.style.top = y - panel.top + "px";
  loupe.style.backgroundSize =
    art.width * zoom + "px " + art.height * zoom + "px";
  loupe.style.backgroundPosition =
    radius -
    (x - art.left) * zoom +
    "px " +
    (radius - (y - art.top) * zoom) +
    "px";
  loupe.style.filter =
    "hue-rotate(" +
    tones[select("[data-tone][aria-pressed=true]").dataset.tone].hue +
    ")";
}
inspect.addEventListener("click", () => {
  const on = stage.classList.toggle("inspecting");
  inspect.setAttribute("aria-pressed", String(on));
  if (on) positionLoupe();
});
for (const event of ["pointermove", "pointerdown"]) {
  stage.addEventListener(event, (e) => {
    if (stage.classList.contains("inspecting"))
      positionLoupe(e.clientX, e.clientY);
  });
}
for (const swatch of swatches)
  swatch.addEventListener("click", () => {
    if (stage.classList.contains("inspecting")) positionLoupe();
  });
addEventListener("resize", () => {
  if (stage.classList.contains("inspecting")) positionLoupe();
});

const peerButtons = all("[data-peer]");
const comparisons = {
  previous: [
    "GPT-6 Astra보다 실무 평가 GDPval v2 점수가 ",
    "6.2%p",
    " 높았습니다. 같은 과제를 수행하는 데 쓴 출력 토큰은 ",
    "22% 줄었습니다.",
    "",
  ],
  sol: [
    "같은 요청으로 만든 3D를 사람이 직접 써 보고 고른 AA-3D 평가에서 저는 ",
    "1,318 Elo",
    "로 1위에 올랐습니다. 같은 세대의 Sol은 ",
    "1,259 Elo",
    "였습니다.",
  ],
};
for (const button of peerButtons) {
  button.addEventListener("click", () => {
    markSelection(peerButtons, button);
    const fragments = comparisons[button.dataset.peer].map((part, index) => {
      if (index % 2 === 0) return part;
      const strong = document.createElement("strong");
      strong.textContent = part;
      return strong;
    });
    select("#peer-copy").replaceChildren(...fragments);
  });
}
