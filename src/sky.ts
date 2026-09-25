// Céu estrelado animado no fundo (canvas). No fim da história as estrelas
// saem do lugar e formam um coração.

export interface Point {
  x: number;
  y: number;
}

/** Ponto da curva do coração para t em [0, 2π). y cresce para baixo (como na tela). */
export function heartPoint(t: number): Point {
  return {
    x: 16 * Math.sin(t) ** 3,
    y: -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)),
  };
}

/** Distribui `count` pontos pela curva do coração, centrado em `center` e com a escala dada. */
export function heartShape(count: number, center: Point, scale: number): Point[] {
  return Array.from({ length: count }, (_, i) => {
    const p = heartPoint((i / count) * Math.PI * 2);
    return { x: center.x + p.x * scale, y: center.y + p.y * scale };
  });
}

interface Star {
  homeX: number;
  homeY: number;
  x: number;
  y: number;
  target: Point | null;
  r: number;
  phase: number;
  speed: number;
  depth: number;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

const HEART_STARS = 90;

export class Sky {
  private readonly ctx: CanvasRenderingContext2D;
  private stars: Star[] = [];
  private shooting: ShootingStar[] = [];
  private w = 0;
  private h = 0;
  private pointer: Point = { x: 0, y: 0 };
  private heart = false;
  private heartGlow = 0;
  private nextShootAt = 2000;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly reducedMotion = false,
  ) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D indisponível");
    this.ctx = ctx;
  }

  start(): void {
    this.resize();
    window.addEventListener("resize", () => this.resize());
    window.addEventListener("pointermove", (e) => {
      this.pointer = { x: e.clientX / this.w - 0.5, y: e.clientY / this.h - 0.5 };
    });
    if (!this.reducedMotion) requestAnimationFrame(this.frame);
  }

  /** Junta parte das estrelas no formato de um coração. */
  formHeart(): void {
    this.heart = true;
    this.assignHeartTargets();
    if (this.reducedMotion) {
      for (const s of this.stars) if (s.target) Object.assign(s, s.target);
      this.heartGlow = 1;
      this.draw(0);
    }
  }

  private resize(): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    this.canvas.width = this.w * dpr;
    this.canvas.height = this.h * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.min(320, Math.round((this.w * this.h) / 3500));
    this.stars = Array.from({ length: Math.max(count, HEART_STARS + 20) }, () => {
      const x = Math.random() * this.w;
      const y = Math.random() * this.h;
      return {
        homeX: x,
        homeY: y,
        x,
        y,
        target: null,
        r: Math.random() * 1.3 + 0.3,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.002 + 0.0006,
        depth: Math.random() * 18 + 4,
      };
    });
    if (this.heart) this.formHeart();
    else this.draw(0);
  }

  private assignHeartTargets(): void {
    // O coração fica na parte de cima da tela, acima do texto final.
    const size = Math.min(this.w * 0.8, this.h * 0.42);
    const points = heartShape(HEART_STARS, { x: this.w / 2, y: this.h * 0.26 }, size / 34);
    this.stars.forEach((s, i) => (s.target = points[i] ?? null));
  }

  private frame = (now: number): void => {
    this.update(now);
    this.draw(now);
    requestAnimationFrame(this.frame);
  };

  private update(now: number): void {
    for (const s of this.stars) {
      const goal = s.target ?? {
        x: s.homeX + this.pointer.x * s.depth,
        y: s.homeY + this.pointer.y * s.depth,
      };
      const ease = s.target ? 0.03 : 0.08;
      s.x += (goal.x - s.x) * ease;
      s.y += (goal.y - s.y) * ease;
    }
    if (this.heart) this.heartGlow = Math.min(1, this.heartGlow + 0.006);

    if (now > this.nextShootAt) {
      this.nextShootAt = now + 2500 + Math.random() * 5000;
      const fromLeft = Math.random() < 0.5;
      this.shooting.push({
        x: fromLeft ? Math.random() * this.w * 0.5 : this.w * (0.5 + Math.random() * 0.5),
        y: Math.random() * this.h * 0.4,
        vx: (fromLeft ? 1 : -1) * (7 + Math.random() * 4),
        vy: 3 + Math.random() * 2,
        life: 1,
      });
    }
    for (const s of this.shooting) {
      s.x += s.vx;
      s.y += s.vy;
      s.life -= 0.018;
    }
    this.shooting = this.shooting.filter((s) => s.life > 0);
  }

  private draw(now: number): void {
    const { ctx } = this;
    ctx.clearRect(0, 0, this.w, this.h);

    if (this.heart && this.heartGlow > 0) {
      ctx.strokeStyle = `rgba(255, 170, 200, ${0.28 * this.heartGlow})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      const inHeart = this.stars.filter((s) => s.target);
      inHeart.forEach((s, i) => (i ? ctx.lineTo(s.x, s.y) : ctx.moveTo(s.x, s.y)));
      ctx.closePath();
      ctx.stroke();
    }

    for (const s of this.stars) {
      const twinkle = 0.55 + 0.45 * Math.sin(now * s.speed + s.phase);
      const inHeart = s.target !== null;
      const r = inHeart ? s.r + 0.9 * this.heartGlow : s.r;
      ctx.fillStyle = inHeart
        ? `rgba(255, 190, 215, ${0.6 + 0.4 * twinkle})`
        : `rgba(235, 230, 255, ${0.25 + 0.6 * twinkle})`;
      if (inHeart || r > 1.2) {
        ctx.shadowColor = inHeart ? "rgba(255, 120, 170, 0.9)" : "rgba(200, 200, 255, 0.8)";
        ctx.shadowBlur = inHeart ? 10 : 6;
      } else {
        ctx.shadowBlur = 0;
      }
      ctx.beginPath();
      ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    for (const s of this.shooting) {
      const tail = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * 12, s.y - s.vy * 12);
      tail.addColorStop(0, `rgba(255, 255, 255, ${s.life})`);
      tail.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.strokeStyle = tail;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x - s.vx * 12, s.y - s.vy * 12);
      ctx.stroke();
    }
  }
}
