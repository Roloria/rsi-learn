import { useEffect, useRef } from "react";

/**
 * Hero 背景：递归环 —— 内环生成节点，节点沿螺旋流向外环，
 * 每一环更亮更快，隐喻「每一轮改进建立在上一轮之上」。
 */
export default function LoopCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let w = 0;
    let h = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const TAU = Math.PI * 2;
    // 环参数：[半径比例, 节点数, 角速度]
    const RINGS = [
      { r: 0.14, n: 5, sp: 0.5, hue: 190 },
      { r: 0.26, n: 7, sp: -0.32, hue: 205 },
      { r: 0.4, n: 9, sp: 0.22, hue: 225 },
      { r: 0.54, n: 12, sp: -0.15, hue: 250 },
      { r: 0.68, n: 16, sp: 0.1, hue: 270 },
    ];

    // 外流的粒子：从某环的某节点沿半径向外漂移
    interface P {
      ring: number;
      idx: number;
      prog: number; // 0..1 到达下一环
      speed: number;
    }
    const parts: P[] = [];
    const spawn = () => {
      if (parts.length > 60) return;
      const ring = Math.floor(Math.random() * (RINGS.length - 1));
      parts.push({
        ring,
        idx: Math.floor(Math.random() * RINGS[ring].n),
        prog: 0,
        speed: 0.15 + Math.random() * 0.2,
      });
    };
    for (let i = 0; i < 24; i++) spawn();

    // 脉冲：节点发射的扩散圆
    interface Pulse { x: number; y: number; r: number; a: number; hue: number }
    const pulses: Pulse[] = [];

    const ringRadius = (i: number) =>
      RINGS[i].r * Math.min(w, h) * 0.9 + 8;

    let t = 0;
    let mx = 0.5;
    let my = 0.5;
    const onMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mx = (e.clientX - rect.left) / rect.width;
      my = (e.clientY - rect.top) / rect.height;
    };
    window.addEventListener("mousemove", onMouse);

    const nodePos = (ringIdx: number, nodeIdx: number, time: number) => {
      const ring = RINGS[ringIdx];
      const R = ringRadius(ringIdx);
      const base = (TAU / ring.n) * nodeIdx + time * ring.sp;
      const wob = Math.sin(time * 1.3 + nodeIdx * 2.1 + ringIdx) * 0.04;
      const ang = base + wob;
      const px = 0.5 + (mx - 0.5) * 0.02;
      const py = 0.5 + (my - 0.5) * 0.02;
      return {
        x: (0.5 + px - 0.5 + Math.cos(ang) * (R / Math.min(w, h))) * w,
        y: (0.5 + py - 0.5 + Math.sin(ang) * (R / Math.min(w, h))) * h,
        ang,
      };
    };

    const draw = () => {
      t += reduced ? 0 : 0.016;
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;

      // 中心核
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, ringRadius(0) * 0.8);
      core.addColorStop(0, "rgba(34,211,238,0.20)");
      core.addColorStop(0.55, "rgba(120,110,250,0.06)");
      core.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = core;
      ctx.fillRect(0, 0, w, h);

      // 环轨道
      RINGS.forEach((ring, i) => {
        ctx.beginPath();
        ctx.arc(cx, cy, ringRadius(i), 0, TAU);
        ctx.strokeStyle = `hsla(${ring.hue}, 70%, 60%, ${0.1 + i * 0.02})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // 节点
      RINGS.forEach((ring, i) => {
        for (let j = 0; j < ring.n; j++) {
          const p = nodePos(i, j, t);
          const breathe = 0.5 + 0.5 * Math.sin(t * 2 + j + i * 1.7);
          const size = 1.6 + i * 0.5 + breathe * 0.8;
          ctx.beginPath();
          ctx.arc(p.x, p.y, size, 0, TAU);
          ctx.fillStyle = `hsla(${ring.hue}, 85%, 68%, ${0.35 + i * 0.09 + breathe * 0.15})`;
          ctx.fill();
          // 节点光晕
          ctx.beginPath();
          ctx.arc(p.x, p.y, size * 3, 0, TAU);
          ctx.fillStyle = `hsla(${ring.hue}, 85%, 65%, ${0.05 + breathe * 0.04})`;
          ctx.fill();

          // 随机脉冲
          if (!reduced && Math.random() < 0.0012) {
            pulses.push({ x: p.x, y: p.y, r: size, a: 0.5, hue: ring.hue });
          }
        }
      });

      // 螺旋连线：内环节点 → 相邻外环最近节点
      for (let i = 0; i < RINGS.length - 1; i++) {
        for (let j = 0; j < RINGS[i].n; j += 2) {
          const a = nodePos(i, j, t);
          const b = nodePos(i + 1, Math.floor(j * 1.5) % RINGS[i + 1].n, t);
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          const mxp = (a.x + b.x) / 2 + (b.y - a.y) * 0.18;
          const myp = (a.y + b.y) / 2 - (b.x - a.x) * 0.18;
          ctx.quadraticCurveTo(mxp, myp, b.x, b.y);
          ctx.strokeStyle = `hsla(${RINGS[i + 1].hue}, 80%, 65%, 0.07)`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // 外流粒子
      if (!reduced) {
        for (let i = parts.length - 1; i >= 0; i--) {
          const q = parts[i];
          q.prog += q.speed * 0.016;
          if (q.prog >= 1) {
            const nextRing = q.ring + 1;
            if (nextRing >= RINGS.length - 1) {
              parts.splice(i, 1);
              continue;
            }
            q.ring = nextRing;
            q.idx = Math.floor(Math.random() * RINGS[nextRing].n);
            q.prog = 0;
          }
          const from = nodePos(q.ring, q.idx, t);
          const to = nodePos(q.ring + 1, q.idx % RINGS[q.ring + 1].n, t);
          const x = from.x + (to.x - from.x) * q.prog;
          const y = from.y + (to.y - from.y) * q.prog;
          ctx.beginPath();
          ctx.arc(x, y, 1.8, 0, TAU);
          ctx.fillStyle = `hsla(${RINGS[q.ring + 1].hue}, 90%, 72%, ${0.25 + q.prog * 0.5})`;
          ctx.fill();
        }
        if (Math.random() < 0.3) spawn();
      }

      // 脉冲扩散
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.r += 0.7;
        p.a *= 0.965;
        if (p.a < 0.01) {
          pulses.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, TAU);
        ctx.strokeStyle = `hsla(${p.hue}, 85%, 70%, ${p.a})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("mousemove", onMouse);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
