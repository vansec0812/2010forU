/**
 * ═════════════════════════════════════════════════════════════════
 * 🌸 CẢ MỘT VƯỜN THƯƠNG — 20/10 SPECIAL EDITION ENGINE
 * Mô phỏng y hệt phong cách video TikTok:
 * - Bầu trời sớm mai trong trẻo, ánh nắng xiên ấm áp
 * - Bông hoa hồng lớn nở trước (Pink Cabbage Rose xếp cánh)
 * - Cả khu vườn 50+ đóa hoa đa sắc (hồng, xanh bạc hà, xanh dương pastel, cam đào, vàng kem) thức giấc
 * - Hoa đồng nội vươn cao trên cành mảnh mai
 * - Gió thổi đung đưa tự nhiên, hạt phấn hoa & cánh hoa lơ lửng
 * - Web Audio API piano lofi không cần tải file ngoài
 * ═════════════════════════════════════════════════════════════════
 */

'use strict';

// ─── HẰNG SỐ BẢNG MÀU CHUẨN BOTANICAL PASTEL ───────────────────
const PALETTES = {
  // Hoa hồng phấn (như bông hồng tâm điểm trong video)
  rosePink: {
    name: 'rosePink',
    inner: '#e63968',
    mid: '#f77f98',
    outer: '#ffe5ec',
    outline: '#c72e54',
    center: '#ffb3c6',
    stamen: '#ffe082',
    weight: 35
  },
  // Hoa hồng xanh bạc hà / Sage mint (bên trái và dưới đáy trong video)
  roseMint: {
    name: 'roseMint',
    inner: '#388e63',
    mid: '#66bb89',
    outer: '#d8f3e5',
    outline: '#2d7a52',
    center: '#a3e4c1',
    stamen: '#fff59d',
    weight: 22
  },
  // Hoa hồng xanh dương pastel / Baby blue (bên phải trong video)
  roseBlue: {
    name: 'roseBlue',
    inner: '#2980b9',
    mid: '#64b5f6',
    outer: '#e1f5fe',
    outline: '#1f6594',
    center: '#90caf9',
    stamen: '#fff9c4',
    weight: 20
  },
  // Hoa hồng cam đào / Coral peach
  rosePeach: {
    name: 'rosePeach',
    inner: '#e65100',
    mid: '#ff9800',
    outer: '#ffe0b2',
    outline: '#c94500',
    center: '#ffb74d',
    stamen: '#fffde7',
    weight: 15
  },
  // Hoa hồng vàng kem / Buttercream
  roseYellow: {
    name: 'roseYellow',
    inner: '#f57f17',
    mid: '#fbc02d',
    outer: '#fff9c4',
    outline: '#d46b08',
    center: '#fff176',
    stamen: '#ffecb3',
    weight: 8
  }
};

// Màu hoa đồng nội vươn cao (Wildflower Pom-pom)
const POMPOM_COLORS = [
  { core: '#81d4fa', fluff: '#e1f5fe', outline: '#4fc3f7' }, // xanh pastel
  { core: '#ff8a80', fluff: '#ffebee', outline: '#ff5252' }, // hồng pastel
  { core: '#ffcc80', fluff: '#fff3e0', outline: '#ffa726' }, // cam dịu
  { core: '#ce93d8', fluff: '#f3e5f5', outline: '#ba68c8' }, // tím oải hương
  { core: '#a5d6a7', fluff: '#e8f5e9', outline: '#81c784' }  // bạc hà
];

// ─── BIẾN TOÀN CỤC & THIẾT LẬP CANVAS ─────────────────────────
const canvas = document.getElementById('garden-canvas');
const ctx = canvas.getContext('2d');
const awakeningContainer = document.getElementById('awakeningContainer');

let width = window.innerWidth;
let height = window.innerHeight;
let dpr = Math.min(window.devicePixelRatio || 1, 2);

let flowers = [];
let particles = [];
let floatingPetals = [];
let clouds = [];

let mouse = { x: -1000, y: -1000, active: false };
let startTime = performance.now();
let primaryFlower = null;
let awakeningTriggered = false;
let isReblooming = false;

// ─── TỰ ĐỘNG THAY ĐỔI KÍCH THƯỚC CANVAS CHUẨN RETINA ─────────
function resizeCanvas() {
  width = window.innerWidth;
  height = window.innerHeight;
  dpr = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
}

// ─── MÂY TRỜI TRÔI NHẸ (CLOUDS) ────────────────────────────────
function initClouds() {
  clouds = [];
  const count = 5;
  for (let i = 0; i < count; i++) {
    clouds.push({
      x: (width / count) * i + Math.random() * 100,
      y: Math.random() * (height * 0.35) + 30,
      radius: Math.random() * 60 + 50,
      speed: Math.random() * 0.08 + 0.03,
      opacity: Math.random() * 0.25 + 0.2
    });
  }
}

function updateAndDrawClouds(now) {
  clouds.forEach(c => {
    c.x += c.speed;
    if (c.x - c.radius * 2 > width) c.x = -c.radius * 2;

    const grad = ctx.createRadialGradient(c.x, c.y, 10, c.x, c.y, c.radius);
    grad.addColorStop(0, `rgba(255, 255, 255, ${c.opacity})`);
    grad.addColorStop(0.6, `rgba(255, 255, 255, ${c.opacity * 0.5})`);
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.save();
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(c.x, c.y, c.radius * 1.8, c.radius * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

// ─── LỚP HOA: ENGLISH CABBAGE ROSE & POM-POM ───────────────────
class Flower {
  constructor(options) {
    this.type = options.type || 'rose'; // 'rose' hoặc 'pompom'
    this.isPrimary = options.isPrimary || false;

    // Vị trí hoa trên màn hình
    this.targetX = options.targetX;
    this.targetY = options.targetY;
    this.startX = options.startX || this.targetX + (Math.random() - 0.5) * 40;
    this.startY = height + 40;

    // Kích thước
    this.radius = options.radius || (this.isPrimary ? 68 : Math.random() * 26 + 34);
    this.palette = options.palette || PALETTES.rosePink;
    this.pompomColor = options.pompomColor || POMPOM_COLORS[0];

    // Cành & lá
    this.curveOffset = (Math.random() - 0.5) * (this.isPrimary ? 60 : 120);
    this.stemColor = options.stemColor || '#60993e';
    this.stemWidth = options.stemWidth || (this.isPrimary ? 4.8 : Math.random() * 1.8 + 2.2);

    // Sinh lá theo cành
    this.leaves = [];
    const leafCount = Math.floor(Math.random() * 3) + 2;
    for (let i = 0; i < leafCount; i++) {
      this.leaves.push({
        t: 0.3 + (i / leafCount) * 0.5 + (Math.random() - 0.5) * 0.1,
        side: i % 2 === 0 ? 1 : -1,
        size: Math.random() * 10 + 16,
        angle: (Math.random() * 0.4 + 0.4) * (i % 2 === 0 ? 1 : -1),
        green: Math.random() > 0.5 ? '#70a94e' : '#5b933d'
      });
    }

    // Thời gian sinh trưởng & nở
    this.birthDelay = options.delay || 0; // ms
    this.growDuration = options.growDuration || 2200;
    this.bloomDuration = options.bloomDuration || 2000;
    this.spawnTimestamp = null;

    // Trạng thái (0 -> 1)
    this.growProgress = 0;
    this.bloomProgress = 0;
    this.swayPhase = Math.random() * Math.PI * 2;
    this.swaySpeed = Math.random() * 0.0012 + 0.001;

    // Cánh hoa tạo hình cánh xếp (petal geometry)
    this.petalRings = this.generatePetalRings();

    // Giọt sương sớm đọng trên cánh
    this.dewDrops = [];
    if (Math.random() < 0.65 || this.isPrimary) {
      const dropCount = Math.floor(Math.random() * 3) + 1;
      for (let d = 0; d < dropCount; d++) {
        this.dewDrops.push({
          angle: Math.random() * Math.PI * 2,
          distRatio: Math.random() * 0.4 + 0.45,
          size: Math.random() * 2 + 1.8
        });
      }
    }
  }

  generatePetalRings() {
    const rings = [];
    if (this.type === 'pompom') return rings;

    // Số tầng cánh: 5 đến 7 tầng cuộn xoáy
    const ringCount = this.isPrimary ? 7 : 6;
    for (let r = 0; r < ringCount; r++) {
      const ringRatio = 1 - (r / (ringCount + 0.8)); // từ ngoài vào trong
      const petalCount = Math.max(4, Math.floor(8 - r * 0.6));
      const petals = [];
      const baseAngleOffset = (r * 0.45) + (Math.random() * 0.1);

      for (let p = 0; p < petalCount; p++) {
        const angle = baseAngleOffset + (p / petalCount) * Math.PI * 2;
        petals.push({
          angle: angle,
          spread: (Math.PI * 2 / petalCount) * 1.35,
          wobbleFreq: Math.floor(Math.random() * 2) + 2,
          wobbleAmp: Math.random() * 0.08 + 0.05
        });
      }
      rings.push({ ratio: ringRatio, petals, ringIndex: r });
    }
    return rings;
  }

  update(now, wind) {
    if (this.spawnTimestamp === null) {
      this.spawnTimestamp = now + this.birthDelay;
    }

    if (now < this.spawnTimestamp) return;

    const elapsed = now - this.spawnTimestamp;

    // Tiến trình mọc cành
    this.growProgress = Math.min(1, elapsed / this.growDuration);
    // Hàm easing tự nhiên
    const easeGrow = easeOutCubic(this.growProgress);

    // Tiến trình hoa nở (bắt đầu khi cành mọc được 60%)
    if (this.growProgress > 0.55) {
      const bloomElapsed = elapsed - (this.growDuration * 0.55);
      this.bloomProgress = Math.min(1, bloomElapsed / this.bloomDuration);
    }

    // Tính toán độ đung đưa theo gió
    const naturalSway = Math.sin(now * this.swaySpeed + this.swayPhase) * (this.isPrimary ? 6 : 14);
    const windEffect = wind * (this.targetY / height) * 22;

    // Tương tác chuột
    let mouseInfluence = 0;
    if (mouse.active) {
      const dx = mouse.x - this.currentHeadX;
      const dy = mouse.y - this.currentHeadY;
      const dist = Math.hypot(dx, dy);
      if (dist < 180) {
        const force = (1 - dist / 180) * 18;
        mouseInfluence = (dx > 0 ? -1 : 1) * force;
      }
    }

    this.currentSway = (naturalSway + windEffect + mouseInfluence) * easeGrow;
  }

  draw(ctx) {
    if (this.growProgress <= 0) return;

    const easeG = easeOutCubic(this.growProgress);
    const easeB = easeOutBack(this.bloomProgress);

    // Điểm đầu và điểm cuối cành hoa
    const startX = this.startX;
    const startY = this.startY;
    const endX = this.startX + (this.targetX - this.startX) * easeG + this.currentSway;
    const endY = this.startY + (this.targetY - this.startY) * easeG;

    // Điểm điều khiển Bezier của cành
    const ctrlX = (startX + endX) / 2 + this.curveOffset + this.currentSway * 0.4;
    const ctrlY = (startY + endY) / 2;

    this.currentHeadX = endX;
    this.currentHeadY = endY;

    // ── 1. VẼ CÀNH HOA XANH TƯƠI ──
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(ctrlX, ctrlY, endX, endY);
    ctx.lineWidth = this.stemWidth;
    ctx.strokeStyle = this.stemColor;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // ── 2. VẼ CÁC LÁ TRÊN CÀNH ──
    if (this.growProgress > 0.25) {
      this.leaves.forEach(leaf => {
        if (leaf.t <= easeG) {
          // Vị trí của lá trên đường cong Bezier
          const t = leaf.t / easeG;
          const lx = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * ctrlX + t * t * endX;
          const ly = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * ctrlY + t * t * endY;

          ctx.save();
          ctx.translate(lx, ly);
          ctx.rotate(leaf.angle + (this.currentSway * 0.015));

          const leafScale = Math.min(1, (easeG - leaf.t) * 4);
          ctx.scale(leafScale, leafScale);

          // Vẽ chiếc lá bầu dục có gân
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.bezierCurveTo(leaf.side * leaf.size * 0.7, -leaf.size * 0.4, leaf.side * leaf.size * 1.2, -leaf.size * 0.2, leaf.side * leaf.size * 1.4, 0);
          ctx.bezierCurveTo(leaf.side * leaf.size * 1.2, leaf.size * 0.2, leaf.side * leaf.size * 0.7, leaf.size * 0.4, 0, 0);
          ctx.fillStyle = leaf.green;
          ctx.fill();

          // Viền lá & gân lá thanh mảnh
          ctx.strokeStyle = '#43752c';
          ctx.lineWidth = 0.8;
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(leaf.side * leaf.size * 1.2, 0);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.stroke();

          ctx.restore();
        }
      });
    }

    ctx.restore();

    // ── 3. VẼ ĐÓA HOA NỞ TẠI ĐỈNH CÀNH ──
    if (this.bloomProgress > 0.02) {
      ctx.save();
      ctx.translate(endX, endY);
      // Xoay đầu hoa theo hướng uốn cành
      const tipAngle = Math.atan2(endY - ctrlY, endX - ctrlX) - Math.PI / 2;
      ctx.rotate(tipAngle * 0.35);

      if (this.type === 'pompom') {
        this.drawPompomFlower(ctx, easeB);
      } else {
        this.drawCabbageRose(ctx, easeB);
      }

      ctx.restore();
    }
  }

  // ─── HOA HỒNG XẾP CÁNH CABBAGE ROSE CHUẨN VIDEO ────────────
  drawCabbageRose(ctx, scale) {
    const R = this.radius * scale;
    if (R <= 1) return;

    // ĐÀI HOA (Sepals xanh đỡ bên dưới)
    ctx.save();
    for (let s = 0; s < 5; s++) {
      const sa = (s / 5) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      const sx1 = Math.cos(sa - 0.2) * R * 0.7;
      const sy1 = Math.sin(sa - 0.2) * R * 0.7;
      const sx2 = Math.cos(sa) * R * 1.15;
      const sy2 = Math.sin(sa) * R * 1.15;
      const sx3 = Math.cos(sa + 0.2) * R * 0.7;
      const sy3 = Math.sin(sa + 0.2) * R * 0.7;
      ctx.lineTo(sx1, sy1);
      ctx.lineTo(sx2, sy2);
      ctx.lineTo(sx3, sy3);
      ctx.closePath();
      ctx.fillStyle = '#548c3b';
      ctx.fill();
    }
    ctx.restore();

    // LỚP NỀN TỎA HÀO QUANG NHẸ
    const halo = ctx.createRadialGradient(0, 0, R * 0.3, 0, 0, R * 1.05);
    halo.addColorStop(0, this.palette.outer);
    halo.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(0, 0, R * 1.05, 0, Math.PI * 2);
    ctx.fill();

    // CÁC TẦNG CÁNH HOA XẾP LỒNG NHAU (từ ngoài vào trong)
    for (let ringIdx = 0; ringIdx < this.petalRings.length; ringIdx++) {
      const ring = this.petalRings[ringIdx];
      const ringR = R * ring.ratio;
      const ringProgress = Math.min(1, Math.max(0, (scale - ringIdx * 0.08) * 1.8));
      if (ringProgress <= 0.05) continue;

      const currentRingR = ringR * ringProgress;

      ring.petals.forEach(petal => {
        ctx.save();
        ctx.rotate(petal.angle);

        // Tạo cánh hoa có viền uốn lượn tự nhiên (scalloped ruffled petals)
        ctx.beginPath();
        const halfSpread = petal.spread / 2;
        const steps = 14;

        ctx.moveTo(0, 0);
        for (let st = -steps; st <= steps; st++) {
          const t = st / steps; // -1 -> 1
          const theta = t * halfSpread;
          // Độ nhăn gợn sóng của cánh hoa
          const ruffle = 1 + Math.sin(theta * 5 + petal.angle) * petal.wobbleAmp;
          const pr = currentRingR * (1 - Math.abs(t) * 0.2) * ruffle;
          const px = Math.sin(theta) * pr;
          const py = -Math.cos(theta) * pr;
          ctx.lineTo(px, py);
        }
        ctx.closePath();

        // Gradient màu cánh hoa: lòng cánh đậm, mép ngoài pastel rực rỡ
        const grad = ctx.createRadialGradient(0, -currentRingR * 0.35, currentRingR * 0.1, 0, -currentRingR * 0.6, currentRingR);
        grad.addColorStop(0, this.palette.inner);
        grad.addColorStop(0.55, this.palette.mid);
        grad.addColorStop(1, this.palette.outer);

        ctx.fillStyle = grad;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.06)';
        ctx.shadowBlur = 4;
        ctx.fill();

        // ĐƯỜNG VIỀN SẮC NÉT ĐẶC TRƯNG NHƯ TRANH MINH HỌA
        ctx.strokeStyle = this.palette.outline;
        ctx.lineWidth = this.isPrimary ? 1.4 : 1.1;
        ctx.stroke();

        ctx.restore();
      });
    }

    // NHỤY XOẮN ROSETTE CHÍNH GIỮA (tâm đóa hoa)
    const coreR = R * 0.22;
    ctx.save();
    const coreGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, coreR);
    coreGrad.addColorStop(0, this.palette.inner);
    coreGrad.addColorStop(0.7, this.palette.mid);
    coreGrad.addColorStop(1, this.palette.outline);

    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(0, 0, coreR, 0, Math.PI * 2);
    ctx.fill();

    // Vết xoáy cánh cuộn ốc ốc bên trong
    ctx.strokeStyle = this.palette.outline;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let a = 0; a < Math.PI * 4; a += 0.2) {
      const r = (a / (Math.PI * 4)) * (coreR * 0.95);
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (a === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Chấm nhụy vàng li ti phát sáng
    ctx.fillStyle = this.palette.stamen;
    for (let d = 0; d < 6; d++) {
      const da = (d / 6) * Math.PI * 2;
      const dr = coreR * 0.45;
      ctx.beginPath();
      ctx.arc(Math.cos(da) * dr, Math.sin(da) * dr, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // ── GIỌT SƯƠNG ĐỌNG TRÊN CÁNH HOA ──
    if (this.dewDrops.length > 0 && scale > 0.8) {
      this.dewDrops.forEach(drop => {
        const dx = Math.cos(drop.angle) * R * drop.distRatio;
        const dy = Math.sin(drop.angle) * R * drop.distRatio;

        ctx.save();
        ctx.translate(dx, dy);

        // Bóng giọt nước
        ctx.beginPath();
        ctx.ellipse(0, 0, drop.size * 1.2, drop.size, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.fill();

        // Điểm phản quang mặt trời (lấp lánh)
        ctx.beginPath();
        ctx.arc(-drop.size * 0.35, -drop.size * 0.35, drop.size * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        ctx.restore();
      });
    }
  }

  // ─── HOA ĐỒNG NỘI POM-POM VƯƠN CAO TRONG NỀN ────────────────
  drawPompomFlower(ctx, scale) {
    const R = (this.radius * 0.65) * scale;
    if (R <= 1) return;

    ctx.save();
    // Vòng tỏa cánh tia
    const rays = 28;
    for (let i = 0; i < rays; i++) {
      const a = (i / rays) * Math.PI * 2;
      const rayLen = R * (0.85 + Math.sin(i * 3) * 0.2);

      ctx.save();
      ctx.rotate(a);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -rayLen);
      ctx.strokeStyle = this.pompomColor.outline;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Hạt tròn nhỏ ở đầu cánh
      ctx.beginPath();
      ctx.arc(0, -rayLen, 2.4 * scale, 0, Math.PI * 2);
      ctx.fillStyle = this.pompomColor.fluff;
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    }

    // Lõi bông tròn mềm mại
    const coreGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, R * 0.5);
    coreGrad.addColorStop(0, this.pompomColor.core);
    coreGrad.addColorStop(0.8, this.pompomColor.fluff);
    coreGrad.addColorStop(1, 'rgba(255, 255, 255, 0.4)');

    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(0, 0, R * 0.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = this.pompomColor.outline;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }
}

// ─── CÁNH HOA BAY TRONG GIÓ (PETALS) & PHẤN HOA ────────────────
class FloatingPetal {
  constructor() {
    this.reset();
    this.y = Math.random() * height; // Phủ đều lúc đầu
  }

  reset() {
    this.x = Math.random() * (width + 100) - 50;
    this.y = -30;
    this.size = Math.random() * 8 + 6;
    this.vx = (Math.random() - 0.2) * 1.2;
    this.vy = Math.random() * 1.2 + 0.8;
    this.rot = Math.random() * Math.PI * 2;
    this.vRot = (Math.random() - 0.5) * 0.03;
    this.opacity = Math.random() * 0.5 + 0.35;
    this.color = Math.random() > 0.4 ? '#ffccd5' : '#fff0f3';
  }

  update(wind) {
    this.x += this.vx + wind * 1.5;
    this.y += this.vy;
    this.rot += this.vRot;

    if (this.y > height + 40 || this.x > width + 80 || this.x < -80) {
      this.reset();
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    ctx.scale(Math.sin(this.rot * 1.5), 1);

    ctx.beginPath();
    ctx.moveTo(0, -this.size);
    ctx.bezierCurveTo(this.size * 0.8, -this.size * 0.5, this.size * 0.8, this.size * 0.5, 0, this.size);
    ctx.bezierCurveTo(-this.size * 0.8, this.size * 0.5, -this.size * 0.8, -this.size * 0.5, 0, -this.size);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.opacity;
    ctx.fill();

    ctx.restore();
  }
}

// Hạt bụi nắng lấp lánh (Sunlight Dust / Pollen)
class PollenSparkle {
  constructor() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.size = Math.random() * 2 + 1;
    this.vx = (Math.random() - 0.5) * 0.4;
    this.vy = (Math.random() - 0.5) * 0.3;
    this.alpha = Math.random();
    this.dAlpha = (Math.random() * 0.02 + 0.01) * (Math.random() > 0.5 ? 1 : -1);
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha += this.dAlpha;

    if (this.alpha <= 0.1 || this.alpha >= 0.9) this.dAlpha = -this.dAlpha;
    if (this.x < 0) this.x = width;
    if (this.x > width) this.x = 0;
    if (this.y < 0) this.y = height;
    if (this.y > height) this.y = 0;
  }

  draw(ctx) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 248, 220, ${this.alpha * 0.8})`;
    ctx.shadowColor = '#fff59d';
    ctx.shadowBlur = 6;
    ctx.fill();
    ctx.restore();
  }
}

// ─── TẠO BẦU TRỜI & BỐ CỤC VƯỜN HOA HOÀN CHỈNH ────────────────
function generateGardenScene() {
  flowers = [];

  // BÔNG HOA ĐẦU TIÊN (TÂM ĐIỂM) — Đúng góc giữa-phải như ảnh mẫu
  primaryFlower = new Flower({
    type: 'rose',
    isPrimary: true,
    targetX: width * (width < 768 ? 0.5 : 0.55),
    targetY: height * (width < 768 ? 0.44 : 0.48),
    radius: width < 768 ? 58 : 72,
    palette: PALETTES.rosePink,
    delay: 800,
    growDuration: 2600,
    bloomDuration: 2400
  });

  // TẦNG 1: HOA ĐỒNG NỘI POM-POM VƯƠN CAO TRONG NỀN TRỜI (14 - 20 bông)
  const pompomCount = Math.floor(width / 75);
  for (let i = 0; i < pompomCount; i++) {
    const px = (width / pompomCount) * i + (Math.random() - 0.5) * 40;
    const py = height * 0.28 + (Math.random() * height * 0.26);
    const col = POMPOM_COLORS[i % POMPOM_COLORS.length];

    flowers.push(new Flower({
      type: 'pompom',
      targetX: px,
      targetY: py,
      radius: Math.random() * 12 + 18,
      pompomColor: col,
      stemWidth: 1.6,
      stemColor: '#7cb342',
      delay: 4200 + Math.random() * 2500,
      growDuration: 2200,
      bloomDuration: 1800
    }));
  }

  // TẦNG 2: HOA HỒNG XẾP CÁNH TRUNG CẢNH & TIỀN CẢNH ĐA SẮC (35 - 50 bông)
  const roseCount = Math.floor(width / 36);
  const paletteKeys = [
    'rosePink', 'roseMint', 'roseBlue', 'rosePeach', 'roseYellow',
    'rosePink', 'roseMint', 'roseBlue'
  ];

  for (let i = 0; i < roseCount; i++) {
    const rx = (width / roseCount) * i + (Math.random() - 0.5) * 35;
    // Bố trí hoa tầng thấp và tầng vừa
    const row = i % 3;
    let ry;
    if (row === 0) ry = height * 0.52 + Math.random() * (height * 0.12);
    else if (row === 1) ry = height * 0.64 + Math.random() * (height * 0.14);
    else ry = height * 0.78 + Math.random() * (height * 0.16);

    // Không đè lên quá sát tâm hoa chính
    const distToPrimary = Math.hypot(rx - primaryFlower.targetX, ry - primaryFlower.targetY);
    if (distToPrimary < 60) continue;

    const pKey = paletteKeys[(i + Math.floor(Math.random() * 3)) % paletteKeys.length];

    flowers.push(new Flower({
      type: 'rose',
      targetX: rx,
      targetY: ry,
      radius: Math.random() * 24 + 32,
      palette: PALETTES[pKey],
      delay: 4400 + Math.random() * 3200 + (distToPrimary * 3.5), // Nở lan tỏa từ tâm ra ngoài
      growDuration: 2200,
      bloomDuration: 2000
    }));
  }

  // Sắp xếp thứ tự vẽ theo trục Y (hoa xa vẽ trước, hoa gần vẽ sau đè lên tự nhiên)
  flowers.sort((a, b) => a.targetY - b.targetY);

  // Đưa hoa chính vào đúng vị trí theo targetY
  const insertIdx = flowers.findIndex(f => f.targetY > primaryFlower.targetY);
  if (insertIdx !== -1) flowers.splice(insertIdx, 0, primaryFlower);
  else flowers.push(primaryFlower);
}

// ─── TẠO HẠT PHẤN & CÁNH HOA BAY ─────────────────────────────
function initAtmosphere() {
  particles = [];
  floatingPetals = [];

  for (let i = 0; i < 45; i++) {
    particles.push(new PollenSparkle());
  }

  for (let i = 0; i < 24; i++) {
    floatingPetals.push(new FloatingPetal());
  }
}

// ─── HÀM VẼ BẦU TRỜI Gradient & ÁNH NẮNG ──────────────────────
function drawSky(ctx) {
  // Bầu trời sớm mai trong vắt như ảnh chụp
  const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
  skyGrad.addColorStop(0, '#8ec5fc');    // Xanh thiên thanh
  skyGrad.addColorStop(0.35, '#c5e3f6'); // Xanh pastel nhạt
  skyGrad.addColorStop(0.65, '#f4e9ed'); // Sương mai ửng hồng
  skyGrad.addColorStop(1, '#ffeada');    // Vàng cam ấm chân trời

  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, height);

  // Vệt sáng mềm mai chiếu xiên
  const sunBeam = ctx.createRadialGradient(width * 0.75, height * 0.15, 20, width * 0.75, height * 0.15, width * 0.85);
  sunBeam.addColorStop(0, 'rgba(255, 252, 235, 0.45)');
  sunBeam.addColorStop(0.4, 'rgba(255, 240, 225, 0.18)');
  sunBeam.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = sunBeam;
  ctx.fillRect(0, 0, width, height);
}

// ─── VÒNG LẶP RENDER CHÍNH (60 FPS) ───────────────────────────
function renderLoop(now) {
  ctx.clearRect(0, 0, width, height);

  // 1. Vẽ nền trời trong trẻo
  drawSky(ctx);

  // 2. Mây trôi nhẹ
  updateAndDrawClouds(now);

  // 3. Tính toán gió toàn cục
  const globalWind = Math.sin(now * 0.001) * 0.35 + Math.cos(now * 0.0022) * 0.2;

  // 4. Kích hoạt thông điệp "Từ một bông hoa, cả khu vườn đang thức giấc..."
  if (!awakeningTriggered && primaryFlower && primaryFlower.bloomProgress > 0.45) {
    awakeningTriggered = true;
    awakeningContainer.classList.add('show');
    spawnLoveBurst(primaryFlower.targetX, primaryFlower.targetY, 8);
  }

  // 5. Cập nhật & Vẽ từng bông hoa theo tầng
  flowers.forEach(flower => {
    flower.update(now, globalWind);
    flower.draw(ctx);
  });

  // 6. Cánh hoa rơi lơ lửng trong gió
  floatingPetals.forEach(petal => {
    petal.update(globalWind);
    petal.draw(ctx);
  });

  // 7. Hạt phấn hoa nắng lấp lánh
  particles.forEach(p => {
    p.update();
    p.draw(ctx);
  });

  requestAnimationFrame(renderLoop);
}

// ─── TƯƠNG TÁC: GIEO THÊM MỘT ĐÓA HOA KHI CLICK/CHẠM ─────────
function plantFlowerAt(x, y) {
  const pKeys = ['rosePink', 'roseMint', 'roseBlue', 'rosePeach', 'roseYellow'];
  const chosenKey = pKeys[Math.floor(Math.random() * pKeys.length)];

  const newFlower = new Flower({
    type: Math.random() < 0.25 && y < height * 0.5 ? 'pompom' : 'rose',
    targetX: x,
    targetY: y,
    radius: Math.random() * 22 + 34,
    palette: PALETTES[chosenKey],
    pompomColor: POMPOM_COLORS[Math.floor(Math.random() * POMPOM_COLORS.length)],
    delay: 0,
    growDuration: 1800,
    bloomDuration: 1600
  });

  // Đưa vào mảng và sắp xếp lại theo Y
  flowers.push(newFlower);
  flowers.sort((a, b) => a.targetY - b.targetY);

  // Hiệu ứng tim/hoa bay nhẹ tại vị trí click
  spawnLoveBurst(x, y, 4);

  // Ẩn dòng gợi ý click sau lần click đầu tiên
  const hint = document.getElementById('clickHint');
  if (hint) hint.style.opacity = '0';
}

// ─── HIỆU ỨNG PHÁO TIM / EMOJI BAY LÊN ────────────────────────
function spawnLoveBurst(x, y, count = 6) {
  const emojis = ['🌸', '💖', '💕', '🌷', '✨', '🌹', '🤍'];
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'floating-heart';
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];

    const dx = (Math.random() - 0.5) * 120 + 'px';
    const rot = (Math.random() - 0.5) * 60 + 'deg';

    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.setProperty('--dx', dx);
    el.style.setProperty('--rot', rot);

    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1600);
  }
}

// ─── WEB AUDIO API: PIANO LOFI TỰ TỔNG HỢP (ZERO EXTERNAL MP3) ─
class SimplePiano {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.timer = null;
    this.step = 0;

    // Giai điệu Canon in D lãng mạn nhẹ nhàng (tần số nốt nhạc Hz)
    this.melody = [
      // D4, F#4, A4, D5
      293.66, 369.99, 440.00, 587.33,
      // A3, C#4, E4, A4
      220.00, 277.18, 329.63, 440.00,
      // B3, D4, F#4, B4
      246.94, 293.66, 369.99, 493.88,
      // F#3, A3, C#4, F#4
      185.00, 220.00, 277.18, 369.99,
      // G3, B3, D4, G4
      196.00, 246.94, 293.66, 392.00,
      // D3, F#3, A3, D4
      146.83, 185.00, 220.00, 293.66,
      // G3, B3, D4, G4
      196.00, 246.94, 293.66, 392.00,
      // A3, C#4, E4, A4
      220.00, 277.18, 329.63, 440.00
    ];
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playNote(freq) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    // Dạng sóng ấm áp như đàn Rhodes/Piano
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2, now); // Họa âm nhẹ

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, now);

    // ADSR phong cách piano dịu êm
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(filter);
    filter.connect(this.ctx.destination);

    osc.start(now);
    osc2.start(now);
    osc.stop(now + 1.8);
    osc2.stop(now + 1.8);
  }

  start() {
    this.init();
    this.isPlaying = true;
    this.step = 0;

    const playNext = () => {
      if (!this.isPlaying) return;
      const freq = this.melody[this.step % this.melody.length];
      this.playNote(freq);
      this.step++;
      this.timer = setTimeout(playNext, 460); // Nhịp điệu thong thả
    };

    playNext();
  }

  stop() {
    this.isPlaying = false;
    if (this.timer) clearTimeout(this.timer);
  }

  toggle() {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }
}

// ─── EASING FUNCTIONS TỰ NHIÊN ───────────────────────────────
function easeOutCubic(x) {
  return 1 - Math.pow(1 - x, 3);
}

function easeOutBack(x) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

// ─── CHỤP ẢNH CANVAS LÀM THIỆP KỶ NIỆM ────────────────────────
function captureGardenSnapshot() {
  // Tạo canvas tạm để đóng dấu mộc kỷ niệm
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = canvas.width;
  exportCanvas.height = canvas.height;
  const eCtx = exportCanvas.getContext('2d');

  // Sao chép nội dung canvas chính
  eCtx.drawImage(canvas, 0, 0);

  // Đóng dấu chữ "20/10 — Cả một vườn thương"
  const scale = exportCanvas.width / width;
  eCtx.save();
  eCtx.font = `italic 600 ${Math.floor(28 * scale)}px 'Cormorant Garamond', serif`;
  eCtx.fillStyle = '#592534';
  eCtx.shadowColor = 'rgba(255, 255, 255, 0.9)';
  eCtx.shadowBlur = 10;
  eCtx.fillText('Dành bạn, cả một vườn thương. — 20/10', 40 * scale, exportCanvas.height - (40 * scale));
  eCtx.restore();

  // Tải về máy
  const link = document.createElement('a');
  link.download = `ca-mot-vuon-thuong-2010.png`;
  link.href = exportCanvas.toDataURL('image/png');
  link.click();
}

// ─── KHỞI TẠO TẤT CẢ SỰ KIỆN KHI TẢI TRANG ────────────────────
document.addEventListener('DOMContentLoaded', () => {
  resizeCanvas();
  window.addEventListener('resize', () => {
    resizeCanvas();
    initClouds();
  });

  initClouds();
  initAtmosphere();
  generateGardenScene();

  // Bắt đầu vòng lặp đồ họa
  requestAnimationFrame(renderLoop);

  // Nhạc nền piano
  const piano = new SimplePiano();
  const btnMusic = document.getElementById('btn-music');
  btnMusic.addEventListener('click', (e) => {
    e.stopPropagation();
    const isPlaying = piano.toggle();
    btnMusic.classList.toggle('playing', isPlaying);
    btnMusic.querySelector('.btn-label').textContent = isPlaying ? 'Tắt nhạc' : 'Bật nhạc';
  });

  // Tự động bật nhạc sau tương tác đầu tiên (tránh chặn autoplay)
  const unlockAudio = () => {
    if (!piano.isPlaying) {
      piano.start();
      btnMusic.classList.add('playing');
      btnMusic.querySelector('.btn-label').textContent = 'Tắt nhạc';
    }
    window.removeEventListener('click', unlockAudio);
    window.removeEventListener('touchstart', unlockAudio);
  };
  window.addEventListener('click', unlockAudio, { once: true });
  window.addEventListener('touchstart', unlockAudio, { once: true });

  // Tương tác chuột đung đưa hoa
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  });

  window.addEventListener('mouseleave', () => {
    mouse.active = false;
  });

  // Click vào màn hình để trồng thêm hoa
  canvas.addEventListener('click', (e) => {
    plantFlowerAt(e.clientX, e.clientY);
  });

  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length > 0) {
      const t = e.touches[0];
      mouse.x = t.clientX;
      mouse.y = t.clientY;
      mouse.active = true;
      plantFlowerAt(t.clientX, t.clientY);
    }
  }, { passive: true });

  // Nút Nở lại từ đầu (Re-bloom)
  const btnRebloom = document.getElementById('btn-rebloom');
  btnRebloom.addEventListener('click', (e) => {
    e.stopPropagation();
    awakeningTriggered = false;
    awakeningContainer.classList.remove('show');
    generateGardenScene();
  });

  // Nút Chụp ảnh kỷ niệm
  const btnSnapshot = document.getElementById('btn-snapshot');
  btnSnapshot.addEventListener('click', (e) => {
    e.stopPropagation();
    captureGardenSnapshot();
  });

  // ── MODAL THIỆP TẦNG TẦNG LỚP LỚP (MULTI-LAYER UNPEELING) ──
  const btnLetter = document.getElementById('btn-letter');
  const letterModal = document.getElementById('letterModal');
  const closeLetterBtn = document.getElementById('closeLetterBtn');
  const modalBackdrop = document.getElementById('modalBackdrop');

  let currentLayer = 1;
  let maxUnlockedLayer = 1; // Chỉ mở khóa tầng khi người dùng đã click bóc lớp
  const totalLayers = 4;

  // Âm thanh bóc lớp nhẹ nhàng (Web Audio API)
  function playPeelChime(layerNum) {
    if (!piano || !piano.ctx) return;
    try {
      if (piano.ctx.state === 'suspended') piano.ctx.resume();
      const now = piano.ctx.currentTime;
      const osc = piano.ctx.createOscillator();
      const gain = piano.ctx.createGain();
      
      const freqs = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
      const f = freqs[(layerNum - 1) % freqs.length] || 587.33;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now);
      osc.frequency.exponentialRampToValueAtTime(f * 1.5, now + 0.18);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(piano.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    } catch (err) {}
  }

  // Chuyển tầng hiển thị (chỉ hiện duy nhất tầng đang chọn)
  function goToLayer(target) {
    if (target < 1 || target > totalLayers) return;
    currentLayer = target;
    playPeelChime(target);

    // Cập nhật giao diện các tầng: ẩn hoàn toàn các tầng khác
    for (let i = 1; i <= totalLayers; i++) {
      const layerEl = document.getElementById(`layer${i}`);
      const stepNode = document.getElementById(`stepNode${i}`);
      const stepConn = document.getElementById(`stepConn${i}`);

      if (layerEl) {
        if (i === target) {
          layerEl.classList.remove('peeling-out');
          layerEl.classList.add('active');
        } else {
          layerEl.classList.remove('active', 'peeling-out');
        }
      }

      // Cập nhật thanh Stepper: khóa các tầng chưa click bóc đến
      if (stepNode) {
        stepNode.classList.remove('active', 'completed', 'locked');
        if (i > maxUnlockedLayer) {
          stepNode.classList.add('locked');
        } else if (i < target) {
          stepNode.classList.add('completed');
        } else if (i === target) {
          stepNode.classList.add('active');
        }
      }

      if (stepConn) {
        if (i < target) stepConn.classList.add('filled');
        else stepConn.classList.remove('filled');
      }
    }
  }

  // Hàm bóc lớp có hiệu ứng bay lớp cũ rồi mới hiện lớp mới
  function peelToNextLayer(nextLayer) {
    const currentEl = document.getElementById(`layer${currentLayer}`);
    if (currentEl) {
      currentEl.classList.add('peeling-out');
    }
    setTimeout(() => {
      maxUnlockedLayer = Math.max(maxUnlockedLayer, nextLayer);
      goToLayer(nextLayer);
    }, 320);
  }

  // Mở modal: BẮT BUỘC BẮT ĐẦU TỪ TẦNG 1 (KHÔNG ĐƯỢC NHẢY CÓC)
  function openLetter() {
    letterModal.classList.add('active');
    maxUnlockedLayer = 1; // Khóa các tầng 2, 3, 4 lại
    goToLayer(1);
    spawnLoveBurst(window.innerWidth / 2, window.innerHeight / 2, 8);
  }

  function closeLetter() {
    letterModal.classList.remove('active');
  }

  btnLetter.addEventListener('click', (e) => {
    e.stopPropagation();
    openLetter();
  });

  closeLetterBtn.addEventListener('click', closeLetter);
  modalBackdrop.addEventListener('click', closeLetter);

  // Chỉ cho phép click trên thanh Stepper với các tầng ĐÃ BÓC QUA
  for (let s = 1; s <= totalLayers; s++) {
    const node = document.getElementById(`stepNode${s}`);
    if (node) {
      node.addEventListener('click', () => {
        if (s <= maxUnlockedLayer) {
          goToLayer(s);
          spawnLoveBurst(window.innerWidth / 2, window.innerHeight * 0.4, 4);
        }
      });
    }
  }

  // TẦNG 1: Bắt buộc Click con dấu sáp hoặc nút bóc để sang Tầng 2
  const waxSealBtn = document.getElementById('waxSealBtn');
  const peelBtn1 = document.getElementById('peelBtn1');

  function peelLayer1(e) {
    const rect = waxSealBtn ? waxSealBtn.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight / 2 };
    spawnLoveBurst(rect.left + 40, rect.top + 40, 10);
    peelToNextLayer(2);
  }

  if (waxSealBtn) waxSealBtn.addEventListener('click', peelLayer1);
  if (peelBtn1) peelBtn1.addEventListener('click', peelLayer1);

  // TẦNG 2: Bắt buộc Click nút bóc lớp giấy hoa để sang Tầng 3
  const peelBtn2 = document.getElementById('peelBtn2');
  const backBtn2 = document.getElementById('backBtn2');
  if (peelBtn2) {
    peelBtn2.addEventListener('click', () => {
      spawnLoveBurst(window.innerWidth / 2, window.innerHeight * 0.45, 10);
      peelToNextLayer(3);
    });
  }
  if (backBtn2) {
    backBtn2.addEventListener('click', () => goToLayer(1));
  }

  // TẦNG 3: Bắt buộc Click nút bóc tầng bí mật để sang Tầng 4
  const peelBtn3 = document.getElementById('peelBtn3');
  const backBtn3 = document.getElementById('backBtn3');
  if (peelBtn3) {
    peelBtn3.addEventListener('click', () => {
      spawnLoveBurst(window.innerWidth / 2, window.innerHeight * 0.5, 12);
      peelToNextLayer(4);
    });
  }
  if (backBtn3) {
    backBtn3.addEventListener('click', () => goToLayer(2));
  }

  // TẦNG 4: Hộp quẻ điều ước & Gấp lại
  const restartLayersBtn = document.getElementById('restartLayersBtn');
  const finishBtn = document.getElementById('finishBtn');
  const drawFortuneBtn = document.getElementById('drawFortuneBtn');
  const fortuneResult = document.getElementById('fortuneResult');

  const fortuneWishes = [
    "🌟 Quẻ Đại Cát: Hôm nay mọi điều em làm đều sẽ thuận buồm xuôi gió, gặt hái kết quả ngoài mong đợi!",
    "🌸 Quẻ Dịu Dàng: Chúc em luôn giữ được nụ cười trong trẻo, rạng rỡ và nhận được thật nhiều sự quan tâm ấm áp!",
    "🍀 Quẻ May Mắn: Việc học và công việc sẽ cực kỳ hanh thông, mọi bài tập và deadline đều vượt qua nhẹ tênh!",
    "💖 Quẻ Bình An: Cuộc sống sẽ luôn thật nhẹ nhàng và đối xử với em bằng những điều dễ thương nhất!",
    "✨ Quẻ Tỏa Sáng: Chúc em luôn tự tin, xinh đẹp và tỏa sáng rực rỡ theo cách của riêng mình!",
    "☕ Quẻ Thảnh Thơi: Hôm nay em sẽ có một ngày nghỉ ngơi trọn vẹn, không áp lực, chỉ toàn niềm vui!",
    "🌷 Quẻ Ngọt Ngào: Có một người luôn chúc em mỗi ngày đều bình an, vui vẻ và ngập tràn năng lượng tích cực!",
    "🎁 Quẻ Bất Ngờ: Hôm nay em sẽ đón nhận một tin vui hoặc một điều bất ngờ cực kỳ đáng yêu!"
  ];

  let lastFortuneIdx = -1;
  if (drawFortuneBtn && fortuneResult) {
    drawFortuneBtn.addEventListener('click', () => {
      let idx;
      do {
        idx = Math.floor(Math.random() * fortuneWishes.length);
      } while (idx === lastFortuneIdx && fortuneWishes.length > 1);
      lastFortuneIdx = idx;

      fortuneResult.style.opacity = '0';
      fortuneResult.style.transform = 'scale(0.95)';
      setTimeout(() => {
        fortuneResult.textContent = fortuneWishes[idx];
        fortuneResult.style.transition = 'all 0.3s ease';
        fortuneResult.style.opacity = '1';
        fortuneResult.style.transform = 'scale(1)';
      }, 150);

      const rect = drawFortuneBtn.getBoundingClientRect();
      spawnLoveBurst(rect.left + rect.width / 2, rect.top, 8);
    });
  }

  if (restartLayersBtn) {
    restartLayersBtn.addEventListener('click', () => {
      maxUnlockedLayer = 1;
      goToLayer(1);
      spawnLoveBurst(window.innerWidth / 2, window.innerHeight / 2, 8);
    });
  }

  if (finishBtn) {
    finishBtn.addEventListener('click', () => {
      closeLetter();
      spawnLoveBurst(window.innerWidth / 2, window.innerHeight * 0.7, 12);
    });
  }

  // Đổi tên người nhận khi gõ (lưu vào localStorage)
  const recipientNameEl = document.getElementById('recipientName');
  const savedName = localStorage.getItem('recipient_2010');
  if (savedName && !savedName.toLowerCase().includes('yêu dấu')) {
    recipientNameEl.textContent = savedName;
  } else {
    recipientNameEl.textContent = 'em';
    localStorage.removeItem('recipient_2010');
  }

  recipientNameEl.addEventListener('blur', () => {
    let name = recipientNameEl.textContent.trim() || 'em';
    name = name.replace(/yêu dấu/gi, '').trim() || 'em';
    recipientNameEl.textContent = name;
    localStorage.setItem('recipient_2010', name);
  });
});
