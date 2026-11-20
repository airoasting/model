// A scroll-scrubbed study of the three nested gimbals in the cover photograph.
(() => {
  const stage = document.querySelector("#specimen-stage");
  const canvas = stage.querySelector(".orbit-drawing");
  const ctx = canvas.getContext("2d");
  const slider = document.querySelector("#orbit-angle");
  const control = slider.closest(".orbit-control");
  if (!ctx) {
    control.hidden = true;
    return;
  }

  const tau = Math.PI * 2;
  const palette = {
    solar: { hue: 15, line: "#b94320" },
    blue: { hue: 220, line: "#315ba5" },
    green: { hue: 161, line: "#217658" },
  };
  const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
  const sections = 96;
  const circle = Array.from({ length: sections }, (_, i) => [
    Math.cos((tau * i) / sections),
    Math.sin((tau * i) / sections),
  ]);
  const gimbals = [
    { radius: 198, tilt: 1.23, spin: -0.78, rate: 1.06, enamel: true },
    { radius: 164, tilt: -0.8, spin: 0.98, rate: -1.36 },
    { radius: 133, tilt: 1.08, spin: 0.26, rate: 1.82 },
  ];
  let angle = 0;
  let frame = 0;
  let tone = "solar";

  function project([x, y, z]) {
    const perspective = 1000 / (1000 - z);
    return [x * perspective, y * perspective];
  }

  function ringFaces(ring, turn, faces) {
    const pitch = ring.tilt + turn * ring.rate;
    const yaw = ring.spin + turn * ring.rate * 0.32;
    const cp = Math.cos(pitch),
      sp = Math.sin(pitch);
    const cy = Math.cos(yaw),
      sy = Math.sin(yaw);
    const radius = ring.radius;
    // Beveled sides catch different bands of the virtual studio softbox.
    const profile = [
      [12, -6],
      [12, 5],
      [9, 8],
      [-9, 8],
      [-12, 5],
      [-12, -6],
      [-9, -8],
      [9, -8],
    ];
    const curves = profile.map(([dr, depth]) =>
      circle.map(([cos, sin]) => {
        const x = (radius + dr) * cos;
        const y = (radius + dr) * sin * cp - depth * sp;
        const z = (radius + dr) * sin * sp + depth * cp;
        return [x * cy - y * sy, x * sy + y * cy, z];
      }),
    );
    for (let edge = 0; edge < curves.length; edge++) {
      const a = curves[edge],
        b = curves[(edge + 1) % curves.length];
      for (let i = 0; i < sections; i++) {
        const j = (i + 1) % sections;
        const vertices = [a[i], a[j], b[j], b[i]];
        const points = vertices.map(project);
        const [p, q, r] = points;
        if ((q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]) >= 0)
          continue;
        const phase = (tau * i) / sections + yaw + pitch * 0.37;
        const reflection = Math.sin(phase * 2.8 + edge * 0.57);
        const light = 0.5 + 0.5 * Math.tanh(3.4 * reflection);
        const enamel = ring.enamel && edge < 4;
        const fill = enamel
          ? `hsl(${palette[tone].hue} 83% ${36 + light * 49 + (edge === 1 ? 8 : 0)}%)`
          : `hsl(40 8% ${58 + light * 35 + (edge === 1 ? 5 : 0)}%)`;
        faces.push({
          points,
          depth: (a[i][2] + b[j][2]) / 2,
          fill,
          engraved: edge === 2 || edge === 6,
          tick: edge === 2 && i % 2 === 0 ? (i % 8 === 0 ? 0.85 : 0.35) : 0,
        });
      }
    }
  }

  function crystalFaces(turn, faces) {
    const sides = 16;
    const bands = [
      [0, -64],
      [41, -48],
      [61, -10],
      [56, 28],
      [33, 51],
      [0, 62],
    ];
    const loops = bands.map(([radius, y], k) =>
      Array.from({ length: sides }, (_, i) => {
        const longitude = ((i + 0.5 * (k % 2)) * tau) / sides + turn * 0.7;
        const x = radius * Math.cos(longitude),
          z = radius * Math.sin(longitude);
        return [x, y * 0.94 - z * 0.342, z * 0.94 + y * 0.342];
      }),
    );
    for (let row = 0; row < loops.length - 1; row++) {
      for (let i = 0; i < sides; i++) {
        const j = (i + 1) % sides;
        const a = loops[row],
          b = loops[row + 1];
        for (const tri of [
          [a[i], a[j], b[i]],
          [a[j], b[j], b[i]],
        ]) {
          const depth = (tri[0][2] + tri[1][2] + tri[2][2]) / 3;
          const gleam = Math.cos(i * 2.32 + row * 1.6 + turn);
          const points = tri.map(project);
          const [px, py] = points.reduce(
            ([sx, sy], [x, y]) => [sx + x / 3, sy + y / 3],
            [0, 0],
          );
          const rim = Math.min(1, Math.hypot(px, py) / 66);
          const lightness = 34 + 24 * gleam + 34 * rim;
          const shell = rim > 0.72 || (gleam > 0.87 && row < 3);
          faces.push({
            points,
            depth,
            fill: shell
              ? `hsl(38 20% ${79 + gleam * 15}%)`
              : `hsl(${palette[tone].hue + 12 * gleam} 93% ${lightness}%)`,
            facet: true,
          });
        }
      }
    }
  }

  function draw(turn) {
    const extent = Math.max(
      1,
      Math.round(
        Math.min(canvas.clientWidth, canvas.clientHeight) *
          Math.min(devicePixelRatio || 1, 2),
      ),
    );
    if (canvas.width !== extent || canvas.height !== extent)
      canvas.width = canvas.height = extent;
    ctx.setTransform(extent / 500, 0, 0, extent / 500, extent / 2, extent / 2);
    ctx.clearRect(-250, -250, 500, 500);
    ctx.strokeStyle = "#c6c1b3";
    ctx.lineWidth = 0.65;
    ctx.beginPath();
    ctx.arc(0, 0, 230, 0, tau);
    ctx.stroke();
    ctx.save();
    ctx.rotate(turn * 0.12);
    for (let i = 0; i < 96; i++) {
      ctx.beginPath();
      ctx.moveTo(230, 0);
      ctx.lineTo(i % 8 === 0 ? 238 : 233, 0);
      ctx.stroke();
      ctx.rotate(tau / 96);
    }
    ctx.restore();
    ctx.strokeStyle = "#b9b2a2";
    ctx.setLineDash([2, 5]);
    ctx.beginPath();
    ctx.moveTo(-242, 0);
    ctx.lineTo(242, 0);
    ctx.moveTo(0, -242);
    ctx.lineTo(0, 242);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = palette[tone].line;
    ctx.beginPath();
    ctx.arc(229 * Math.cos(turn), 229 * Math.sin(turn), 3, 0, tau);
    ctx.fill();
    const faces = [];
    for (const ring of gimbals) ringFaces(ring, turn, faces);
    crystalFaces(turn, faces);
    faces.sort((a, b) => a.depth - b.depth);
    for (const { points, fill, engraved, tick, facet } of faces) {
      ctx.beginPath();
      ctx.moveTo(...points[0]);
      for (let i = 1; i < points.length; i++) ctx.lineTo(...points[i]);
      ctx.closePath();
      ctx.fillStyle = ctx.strokeStyle = fill;
      ctx.lineWidth = 0.7;
      ctx.fill();
      ctx.stroke();
      if (facet) {
        ctx.strokeStyle = "rgba(255,249,231,.6)";
        ctx.lineWidth = 0.65;
        ctx.stroke();
      }
      if (engraved) {
        ctx.strokeStyle = "#5d594a";
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(...points[0]);
        ctx.lineTo(...points[1]);
        ctx.moveTo(...points[3]);
        ctx.lineTo(...points[2]);
        if (tick) {
          ctx.moveTo(...points[0]);
          ctx.lineTo(
            points[0][0] + (points[3][0] - points[0][0]) * tick,
            points[0][1] + (points[3][1] - points[0][1]) * tick,
          );
        }
        ctx.stroke();
      }
    }
  }

  function render() {
    frame = 0;
    const inspect = stage.classList.contains("inspecting");
    const displayed = inspect ? 0 : angle;
    const reveal = clamp((displayed - 4) / 36, 0, 1);
    const blend = reveal * reveal * (3 - 2 * reveal);
    const turn = (displayed * Math.PI) / 180;
    stage.style.setProperty("--portrait-opacity", 1 - blend);
    stage.style.setProperty("--portrait-turn", displayed * 0.42 + "deg");
    stage.style.setProperty("--portrait-scale", 1 + 0.04 * Math.sin(turn));
    canvas.style.opacity = blend;
    if (blend > 0) draw(turn);
    slider.value = displayed;
    slider.disabled = inspect;
    slider.setAttribute("aria-valuetext", Math.round(displayed) + "도");
    control.style.setProperty("--traveled", (displayed / 180) * 100 + "%");
    document.querySelector("#orbit-degrees").value =
      String(Math.round(displayed)).padStart(3, "0") + "°";
    document.querySelector("#orbit-view").textContent =
      displayed >= 24 ? "GIMBAL STUDY" : "OPTICAL CORE";
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(render);
  }
  function readScroll() {
    if (document.documentElement.dataset.motion !== "on") return;
    const { top, height } = stage.getBoundingClientRect();
    const start = Math.max(0, scrollY + top - innerHeight * 0.72);
    const next = Math.round(
      180 * clamp((scrollY - start) / Math.max(160, height * 0.83), 0, 1),
    );
    if (next !== angle) {
      angle = next;
      schedule();
    }
  }

  slider.addEventListener("input", () => {
    angle = Number(slider.value);
    schedule();
  });
  addEventListener("scroll", readScroll, { passive: true });
  new ResizeObserver(() => {
    readScroll();
    schedule();
  }).observe(stage);
  new MutationObserver(() => {
    angle = 0;
    readScroll();
    schedule();
  }).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-motion"],
  });
  document.querySelector("#inspect").addEventListener("click", schedule);
  for (const swatch of document.querySelectorAll("[data-tone]")) {
    swatch.addEventListener("click", () => {
      tone = swatch.dataset.tone;
      schedule();
    });
  }
  addEventListener("pageshow", readScroll);
  readScroll();
  schedule();
})();
