// Drawings share a camera, but only the workshop uses the printable strip geometry.
const Paper = (() => {
  const turn = 2 * Math.PI;
  function surface(canvas, width, height) {
    const box = canvas.getBoundingClientRect();
    if (!box.width || !box.height) return null;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const w = Math.round(box.width * dpr),
      h = Math.round(box.height * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    const ctx = canvas.getContext("2d");
    const k = Math.min(w / width, h / height);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.setTransform(k, 0, 0, k, w / 2, h / 2);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    return ctx;
  }
  function line(ctx, points, color, weight = 1, closed = false) {
    ctx.beginPath();
    for (const [i, p] of points.entries()) {
      if (i === 0) ctx.moveTo(p[0], p[1]);
      else ctx.lineTo(p[0], p[1]);
    }
    if (closed) ctx.closePath();
    ctx.strokeStyle = color;
    ctx.lineWidth = weight;
    ctx.stroke();
  }
  function face(ctx, points, fill, edge) {
    ctx.beginPath();
    ctx.moveTo(...points[0]);
    for (const p of points.slice(1)) ctx.lineTo(...p);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = edge;
    ctx.lineWidth = 0.65;
    ctx.stroke();
  }
  const camera = (x, y, z, yaw, pitch) => {
    const across = x * Math.cos(yaw) - z * Math.sin(yaw);
    const depth = x * Math.sin(yaw) + z * Math.cos(yaw);
    return [
      across,
      y * Math.cos(pitch) + depth * Math.sin(pitch),
      depth * Math.cos(pitch) - y * Math.sin(pitch),
    ];
  };
  // A scalloped shade and a ribbed foot, redrawn from a revolved radial profile.
  function lamp(canvas, rotation = 0.45, explosion = 0) {
    const ctx = surface(canvas, 460, 330);
    if (!ctx) return;
    const profile = [
      [26, -132],
      [46, -113],
      [78, -94],
      [103, -78],
      [89, -81],
      [120, -56],
      [140, -45],
      [121, -51],
      [147, -27],
      [159, -18],
      [138, -21],
      [162, 0],
      [158, 7],
      [47, 2],
      [42, 10],
      [42, 94],
      [53, 103],
    ];
    const n = 104;
    const rows = profile.map(([r, y], k) =>
      Array.from({ length: n }, (_, j) => {
        const a = (turn * j) / n,
          ripple = k < 13 ? 4.5 : 2;
        const radius = r + (j % 2 ? -ripple : ripple);
        return camera(
          radius * Math.cos(a),
          y + (k > 12 ? 17 * explosion : -5 * explosion),
          radius * Math.sin(a),
          rotation,
          0.26,
        );
      }),
    );
    const faces = [];
    for (let k = 0; k < rows.length - 1; k++)
      for (let j = 0; j < n; j++) {
        const jj = (j + 1) % n,
          vertices = [rows[k][j], rows[k][jj], rows[k + 1][jj], rows[k + 1][j]];
        const depth = vertices.reduce((a, p) => a + p[2], 0) / 4;
        const shade =
          Math.cos((turn * j) / n - rotation) * (j % 2 ? 3 : 5) +
          (j % 2 ? 88 : 95);
        faces.push({
          points: vertices.map((p) => p.slice(0, 2)),
          depth,
          shade,
        });
      }
    faces.sort((a, b) => a.depth - b.depth);
    ctx.save();
    ctx.translate(0, 14);
    for (const f of faces)
      face(ctx, f.points, `hsl(48 46% ${f.shade}%)`, "rgba(48,66,126,.48)");
    line(
      ctx,
      [
        [-175, 133],
        [175, 133],
      ],
      "#475f9c",
      0.8,
    );
    for (const x of [-175, 175])
      line(
        ctx,
        [
          [x - 2, 137],
          [x + 2, 129],
        ],
        "#475f9c",
        1,
      );
    ctx.restore();
  }
  function sketch(canvas, step) {
    if (step === 1) {
      lamp(canvas, 0.87, 1);
      return;
    }
    const ctx = surface(canvas, 430, 230);
    if (!ctx) return;
    if (step === 0) {
      // An interpretive floor outline repeated up the tower.
      for (let level = 0; level < 7; level++) {
        const points = [];
        for (let i = 0; i <= 360; i++) {
          const a = (turn * i) / 360,
            r = 82 + 17 * Math.cos(12 * a);
          points.push([
            r * Math.cos(a) * 1.45,
            58 - level * 17 + r * Math.sin(a) * 0.35,
          ]);
        }
        ctx.beginPath();
        ctx.moveTo(...points[0]);
        for (const p of points.slice(1)) ctx.lineTo(...p);
        ctx.closePath();
        ctx.fillStyle = level === 6 ? "#dce4fb" : "#e8edf3";
        ctx.fill();
        line(
          ctx,
          points,
          level === 6 ? "#243fb0" : "#7788a8",
          level === 6 ? 2 : 1,
        );
      }
      ctx.setLineDash([3, 4]);
      line(
        ctx,
        [
          [-171, -44],
          [171, -44],
        ],
        "#697ea9",
        0.7,
      );
      ctx.setLineDash([]);
    } else {
      // Cut, crease, and join — three states of the introductory model.
      for (let n = 0; n < 3; n++) {
        ctx.save();
        ctx.translate((n - 1) * 127, -4);
        ctx.scale(0.52, 0.52);
        const points = strip(10, n * 0.5).points;
        const cells = paperFaces(points, 58, n * 0.5);
        paintPaper(ctx, cells, 195, 143);
        ctx.restore();
      }
      line(
        ctx,
        [
          [-181, 72],
          [180, 72],
        ],
        "#7b89a4",
        0.8,
      );
    }
  }
  function strip(ribs, closed) {
    const count = ribs * 2,
      width = 230 / count,
      ratio = 0.72;
    const radius =
      width / Math.sqrt(1 + ratio ** 2 - 2 * ratio * Math.cos(Math.PI / ribs));
    const points = [[0, 0]];
    for (let i = 0; i < count; i++) {
      const a = (turn * i) / count,
        b = (turn * (i + 1)) / count;
      const r0 = i % 2 ? radius * ratio : radius,
        r1 = i % 2 ? radius : radius * ratio;
      // Retain edge length throughout unfolding. Unwrap the tangent relative
      // to its angular sector so that the seam opens consistently.
      const tangent =
        a + Math.atan2(r1 * Math.sin(b - a), r1 * Math.cos(b - a) - r0);
      const heading = (tangent - Math.PI / 2) * closed;
      const last = points.at(-1);
      points.push([
        last[0] + width * Math.cos(heading),
        last[1] + width * Math.sin(heading),
      ]);
    }
    return { points, radius, width };
  }
  function paperFaces(points, height, closed) {
    const yaw = -0.18 - 0.5 * closed,
      pitch = 0.2 + 0.24 * closed;
    const top = points.map(([x, z]) => camera(x, -height / 2, z, yaw, pitch));
    const bottom = points.map(([x, z]) => camera(x, height / 2, z, yaw, pitch));
    return top
      .slice(0, -1)
      .map((p, i) => {
        const v = [p, top[i + 1], bottom[i + 1], bottom[i]];
        return {
          points: v.map((p) => p.slice(0, 2)),
          depth: v.reduce((a, p) => a + p[2], 0) / 4,
          shade: (i % 2 ? 86 : 96) + 3 * Math.sin(i * 0.7) * closed,
        };
      })
      .sort((a, b) => a.depth - b.depth);
  }
  function paintPaper(ctx, faces, maxW, maxH) {
    const vertices = faces.flatMap((f) => f.points);
    const xs = vertices.map((p) => p[0]),
      ys = vertices.map((p) => p[1]);
    const minX = Math.min(...xs),
      maxX = Math.max(...xs),
      minY = Math.min(...ys),
      maxY = Math.max(...ys);
    const scale = Math.min(maxW / (maxX - minX), maxH / (maxY - minY));
    ctx.save();
    ctx.scale(scale, scale);
    ctx.translate(-(minX + maxX) / 2, -(minY + maxY) / 2);
    for (const f of faces)
      face(ctx, f.points, `hsl(44 68% ${f.shade}%)`, "#8b6e3b");
    ctx.restore();
  }
  function model(canvas, ribs, height, fold) {
    const geometry = strip(ribs, fold);
    const ctx = surface(canvas, 440, 225);
    if (ctx) {
      ctx.setLineDash([3, 5]);
      line(
        ctx,
        [
          [-195, 87],
          [195, 87],
        ],
        "#b5a47e",
        0.8,
      );
      ctx.setLineDash([]);
      paintPaper(ctx, paperFaces(geometry.points, height, fold), 365, 165);
    }
    return geometry;
  }
  function net(canvas, ribs, height) {
    const w = 238,
      h = height;
    canvas.width = w * 10;
    canvas.height = h * 10;
    canvas.style.height = h + "mm";
    const ctx = canvas.getContext("2d");
    ctx.setTransform(10, 0, 0, 10, 0, 0);
    ctx.fillStyle = "#f0f0f0";
    ctx.fillRect(230, 0, 8, h);
    ctx.strokeStyle = "#111";
    ctx.lineWidth = 0.45;
    ctx.strokeRect(0.23, 0.23, w - 0.46, h - 0.46);
    for (let i = 1; i <= 2 * ribs; i++) {
      ctx.setLineDash(i % 2 ? [2.8, 1.2] : [0.6, 1.3]);
      ctx.lineWidth = 0.27;
      ctx.beginPath();
      ctx.moveTo((230 * i) / (2 * ribs), 0);
      ctx.lineTo((230 * i) / (2 * ribs), h);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.save();
    ctx.translate(234, h / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.font = "3px sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "#222";
    ctx.fillText("풀칠", 0, 1);
    ctx.restore();
  }
  return { lamp, sketch, model, net };
})();
