<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { PhBird, PhArrowRight, PhStar, PhTrophy, PhHeartBreak, PhTimer } from '@phosphor-icons/vue';
import { FlappyBirdContent } from '@/types/game';
import { soundEngine } from '@/lib/sound';
import { useGameStore } from '@/store/gameStore';
import PixelBadge from '@/components/ui/PixelBadge.vue';

// ───────────────────────── Props & Emits ──────────────────────────
interface Props {
  content?: FlappyBirdContent;
  isCompleted?: boolean;
}
const props = withDefaults(defineProps<Props>(), { isCompleted: false });
const emit = defineEmits<{ (e: 'complete', score: number, totalQuestions: number): void }>();

const gameStore = useGameStore();

// ───────────────────────── Config (admin-tunable) ──────────────────
const cfg = computed(() => {
  const c = props.content?.config ?? {};
  return {
    pipeSpeed:       c.pipeSpeed       ?? 200,
    gapSize:         c.gapSize         ?? 140,
    pipeInterval:    c.pipeInterval    ?? 1800,
    gravity:         c.gravity         ?? 800,
    jumpForce:       c.jumpForce       ?? -360,
    durationSeconds: c.durationSeconds ?? 60,
    xpPerPipe:       c.xpPerPipe       ?? 5,
    maxScore:        c.maxScore        ?? 100,
    pipeLabels:      c.pipeLabels      ?? ['Tasamuh', 'Tawasuth', 'I\'tidal', 'Tawazun', 'Amar Ma\'ruf'],
  };
});

const gameOverMessages = computed(() =>
  props.content?.gameOverMessages ?? [
    'Bangkit kembali, Maba Genius! 🔥',
    'Setiap jatuh adalah pelajaran berharga!',
    'Coba lagi — persisten adalah kunci!',
    'UNU Yogyakarta bangga dengan semangatmu!',
  ]
);

// ───────────────────────── Canvas & Game State ────────────────────
const canvasRef = ref<HTMLCanvasElement | null>(null);
const containerRef = ref<HTMLDivElement | null>(null);

const CANVAS_W = 380;
const CANVAS_H = 480;
const BIRD_SIZE = 28;
const PIPE_W = 52;
const GROUND_H = 56;

type GamePhase = 'idle' | 'playing' | 'dead' | 'finished';
const phase = ref<GamePhase>('idle');
const pipeCount = ref(0);   // pipes passed = score unit
const timeLeft = ref(cfg.value.durationSeconds);
const totalScore = ref(0);
const deathMessage = ref('');

// Bird physics
let birdY = 0;
let birdVY = 0;

// Pipes
interface Pipe { x: number; gapY: number; passed: boolean; label: string }
let pipes: Pipe[] = [];

// Timing
let lastTime = 0;
let pipeTimer = 0;
let countdownTimer: ReturnType<typeof setInterval> | null = null;
let rafId = 0;

// ───────────────────────── Helpers ────────────────────────────────
function randomGapY() {
  const min = 60;
  const max = CANVAS_H - GROUND_H - cfg.value.gapSize - 60;
  return min + Math.random() * (max - min);
}

function randomLabel() {
  const arr = cfg.value.pipeLabels;
  return arr[Math.floor(Math.random() * arr.length)];
}

function resetBird() {
  birdY = CANVAS_H / 2 - 40;
  birdVY = 0;
}

// ───────────────────────── Drawing helpers ────────────────────────
function drawBackground(ctx: CanvasRenderingContext2D) {
  // Sky gradient
  const sky = ctx.createLinearGradient(0, 0, 0, CANVAS_H - GROUND_H);
  sky.addColorStop(0, '#1a0f08');
  sky.addColorStop(1, '#3a1f0d');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H - GROUND_H);

  // Stars (static decorative dots)
  ctx.fillStyle = 'rgba(251,246,233,0.35)';
  const starPositions = [[30,25],[80,60],[140,18],[200,45],[270,15],[320,55],[360,30],[50,90],[170,80],[300,90]];
  for (const [sx, sy] of starPositions) {
    ctx.fillRect(sx, sy, 2, 2);
  }

  // Ground
  const ground = ctx.createLinearGradient(0, CANVAS_H - GROUND_H, 0, CANVAS_H);
  ground.addColorStop(0, '#38761d');
  ground.addColorStop(0.4, '#2d5e16');
  ground.addColorStop(1, '#1a3a0e');
  ctx.fillStyle = ground;
  ctx.fillRect(0, CANVAS_H - GROUND_H, CANVAS_W, GROUND_H);

  // Ground top border (pixel)
  ctx.fillStyle = '#4caf50';
  ctx.fillRect(0, CANVAS_H - GROUND_H, CANVAS_W, 4);

  // Ground tile pattern
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  for (let tx = 0; tx < CANVAS_W; tx += 32) {
    ctx.fillRect(tx, CANVAS_H - GROUND_H + 4, 1, GROUND_H - 4);
  }
}

function drawPipe(ctx: CanvasRenderingContext2D, pipe: Pipe) {
  const gap = cfg.value.gapSize;
  const topH = pipe.gapY;
  const botY = pipe.gapY + gap;
  const botH = CANVAS_H - GROUND_H - botY;

  // Top pipe body
  const pipeGrad = ctx.createLinearGradient(pipe.x, 0, pipe.x + PIPE_W, 0);
  pipeGrad.addColorStop(0, '#2d6a0e');
  pipeGrad.addColorStop(0.4, '#38871a');
  pipeGrad.addColorStop(1, '#1a4208');
  ctx.fillStyle = pipeGrad;
  ctx.fillRect(pipe.x, 0, PIPE_W, topH - 14);

  // Top pipe cap
  ctx.fillStyle = '#4caf50';
  ctx.fillRect(pipe.x - 5, topH - 14, PIPE_W + 10, 14);
  ctx.fillStyle = '#2d6a0e';
  ctx.fillRect(pipe.x - 5, topH - 14, 3, 14);
  ctx.fillRect(pipe.x + PIPE_W + 2, topH - 14, 3, 14);

  // Bottom pipe cap
  ctx.fillStyle = '#4caf50';
  ctx.fillRect(pipe.x - 5, botY, PIPE_W + 10, 14);
  ctx.fillStyle = '#2d6a0e';
  ctx.fillRect(pipe.x - 5, botY, 3, 14);
  ctx.fillRect(pipe.x + PIPE_W + 2, botY, 3, 14);

  // Bottom pipe body
  ctx.fillStyle = pipeGrad;
  ctx.fillRect(pipe.x, botY + 14, PIPE_W, botH - 14);

  // Pipe label in gap center
  if (pipe.label) {
    ctx.save();
    ctx.font = 'bold 9px monospace';
    ctx.fillStyle = '#facc15';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 4;
    const midY = pipe.gapY + gap / 2;
    // pill bg
    const tw = ctx.measureText(pipe.label).width + 10;
    ctx.fillStyle = 'rgba(20,12,6,0.75)';
    ctx.fillRect(pipe.x + PIPE_W / 2 - tw / 2, midY - 8, tw, 16);
    ctx.fillStyle = '#facc15';
    ctx.fillText(pipe.label, pipe.x + PIPE_W / 2, midY + 4);
    ctx.restore();
  }
}

function drawBird(ctx: CanvasRenderingContext2D) {
  const cx = 80;
  const cy = birdY;
  const tilt = Math.max(-30, Math.min(45, birdVY * 0.08));

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((tilt * Math.PI) / 180);

  // Body (parchment pixel bird)
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(-BIRD_SIZE / 2, -BIRD_SIZE / 2, BIRD_SIZE, BIRD_SIZE);

  // Wing
  ctx.fillStyle = '#d97706';
  ctx.fillRect(-BIRD_SIZE / 2, 0, BIRD_SIZE / 2, BIRD_SIZE / 3);

  // Eye
  ctx.fillStyle = '#16110d';
  ctx.fillRect(4, -6, 6, 6);
  ctx.fillStyle = '#fff';
  ctx.fillRect(6, -5, 3, 3);

  // Beak
  ctx.fillStyle = '#ea580c';
  ctx.fillRect(BIRD_SIZE / 2, -2, 10, 6);

  ctx.restore();
}

function drawHUD(ctx: CanvasRenderingContext2D) {
  // Top HUD bar
  ctx.fillStyle = 'rgba(16,10,5,0.75)';
  ctx.fillRect(0, 0, CANVAS_W, 36);

  // Score (pipes passed)
  ctx.font = 'bold 14px monospace';
  ctx.fillStyle = '#facc15';
  ctx.textAlign = 'left';
  ctx.fillText(`⭐ ${pipeCount.value} PIPA`, 10, 22);

  // Timer
  ctx.textAlign = 'right';
  if (cfg.value.durationSeconds > 0) {
    ctx.fillStyle = timeLeft.value <= 10 ? '#f87171' : '#86efac';
    ctx.fillText(`⏱ ${timeLeft.value}s`, CANVAS_W - 10, 22);
  } else {
    ctx.fillStyle = '#86efac';
    ctx.fillText('∞', CANVAS_W - 10, 22);
  }
}

function drawOverlay(ctx: CanvasRenderingContext2D, title: string, sub: string, color: string) {
  ctx.fillStyle = 'rgba(10,6,3,0.82)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = color;
  ctx.font = 'bold 26px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(title, CANVAS_W / 2, CANVAS_H / 2 - 30);
  ctx.fillStyle = '#fbf6e9';
  ctx.font = '13px monospace';
  const words = sub.split(' ');
  let line = '';
  let lineY = CANVAS_H / 2 + 5;
  for (const word of words) {
    const test = line + word + ' ';
    if (ctx.measureText(test).width > CANVAS_W - 40 && line !== '') {
      ctx.fillText(line, CANVAS_W / 2, lineY);
      line = word + ' ';
      lineY += 20;
    } else {
      line = test;
    }
  }
  ctx.fillText(line, CANVAS_W / 2, lineY);
}

// ───────────────────────── Game Loop ──────────────────────────────
function gameLoop(ts: number) {
  const ctx = canvasRef.value?.getContext('2d');
  if (!ctx) return;

  const dt = lastTime === 0 ? 0 : Math.min((ts - lastTime) / 1000, 0.05);
  lastTime = ts;

  // Update physics
  if (phase.value === 'playing') {
    birdVY += cfg.value.gravity * dt;
    birdY += birdVY * dt;

    // Ground / ceiling collision
    if (birdY + BIRD_SIZE / 2 >= CANVAS_H - GROUND_H || birdY - BIRD_SIZE / 2 <= 36) {
      die();
    }

    // Pipe movement
    const speed = cfg.value.pipeSpeed;
    pipeTimer += dt * 1000;
    if (pipeTimer >= cfg.value.pipeInterval) {
      pipes.push({ x: CANVAS_W + 20, gapY: randomGapY(), passed: false, label: randomLabel() });
      pipeTimer = 0;
    }

    for (const pipe of pipes) {
      pipe.x -= speed * dt;

      // Score pass
      if (!pipe.passed && pipe.x + PIPE_W < 80 - BIRD_SIZE / 2) {
        pipe.passed = true;
        pipeCount.value++;
        try { soundEngine.play('correct'); } catch (_) { /* silent */ }
      }

      // Collision (AABB)
      const bx = 80;
      const by = birdY;
      const bHalf = BIRD_SIZE / 2 - 3; // shrink hitbox slightly
      const gap = cfg.value.gapSize;
      const inXRange = bx + bHalf > pipe.x + 5 && bx - bHalf < pipe.x + PIPE_W - 5;
      if (inXRange) {
        if (by - bHalf < pipe.gapY || by + bHalf > pipe.gapY + gap) {
          die();
        }
      }
    }

    // Remove off-screen pipes
    pipes = pipes.filter(p => p.x + PIPE_W > -10);
  }

  // ── Draw ──
  drawBackground(ctx);
  for (const p of pipes) drawPipe(ctx, p);
  drawBird(ctx);
  drawHUD(ctx);

  if (phase.value === 'idle') {
    drawOverlay(ctx, '🐦 FLAPPY GENIUS', 'Tap / Tekan SPACE atau klik untuk mulai!', '#facc15');
  } else if (phase.value === 'dead') {
    drawOverlay(ctx, '💥 GAME OVER!', deathMessage.value, '#f87171');
  } else if (phase.value === 'finished') {
    drawOverlay(ctx, '🏆 WAKTU HABIS!', `Kamu melewati ${pipeCount.value} pipa! Luar biasa!`, '#4ade80');
  }

  rafId = requestAnimationFrame(gameLoop);
}

// ───────────────────────── Actions ────────────────────────────────
function jump() {
  if (phase.value === 'idle') {
    startGame();
    return;
  }
  if (phase.value === 'dead' || phase.value === 'finished') return;
  birdVY = cfg.value.jumpForce;
  try { soundEngine.play('select'); } catch (_) { /* silent */ }
}

function startGame() {
  if (props.isCompleted) return;
  pipes = [];
  pipeTimer = 0;
  pipeCount.value = 0;
  resetBird();
  lastTime = 0;
  timeLeft.value = cfg.value.durationSeconds;
  phase.value = 'playing';

  if (cfg.value.durationSeconds > 0) {
    countdownTimer = setInterval(() => {
      timeLeft.value--;
      if (timeLeft.value <= 0) {
        clearInterval(countdownTimer!);
        finish();
      }
    }, 1000);
  }
}

function die() {
  if (phase.value !== 'playing') return;
  phase.value = 'dead';
  if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; }
  const msgs = gameOverMessages.value;
  deathMessage.value = msgs[Math.floor(Math.random() * msgs.length)];
  try { soundEngine.play('wrong'); } catch (_) { /* silent */ }

  // Emit score so far (partial credit)
  const rawScore = computeScore();
  totalScore.value = rawScore;
  gameStore.recordActivity(`Flappy Bird: ${pipeCount.value} pipa (game over)`);

  // Auto-restart prompt handled by overlay + button
}

function finish() {
  if (phase.value !== 'playing') return;
  phase.value = 'finished';
  if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; }
  const rawScore = computeScore();
  totalScore.value = rawScore;
  gameStore.recordActivity(`Flappy Bird selesai: ${pipeCount.value} pipa, skor ${rawScore}`);
  emit('complete', rawScore, cfg.value.maxScore);
}

function computeScore(): number {
  // Score = min(pipesPassed * xpPerPipe, maxScore)
  return Math.min(pipeCount.value * cfg.value.xpPerPipe, cfg.value.maxScore);
}

function handleRetry() {
  phase.value = 'idle';
  pipes = [];
  pipeCount.value = 0;
  resetBird();
}

function handleSubmit() {
  if (phase.value === 'playing') finish();
  else emit('complete', totalScore.value, cfg.value.maxScore);
}

// ───────────────────────── Keyboard / Touch ───────────────────────
function onKeyDown(e: KeyboardEvent) {
  if (e.code === 'Space' || e.code === 'ArrowUp') {
    e.preventDefault();
    jump();
  }
}

// ───────────────────────── Lifecycle ──────────────────────────────
onMounted(() => {
  resetBird();
  window.addEventListener('keydown', onKeyDown);
  rafId = requestAnimationFrame(gameLoop);
});

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown);
  cancelAnimationFrame(rafId);
  if (countdownTimer) clearInterval(countdownTimer);
});

watch(() => props.isCompleted, (val) => {
  if (val && phase.value === 'playing') finish();
});
</script>

<template>
  <div class="flex flex-col items-center gap-3 w-full select-none" ref="containerRef">
    <!-- Completed state -->
    <div v-if="props.isCompleted" class="pixel-card p-6 text-center w-full max-w-sm border-2 border-amber-500/40 bg-[#120f0c]">
      <PhTrophy class="h-12 w-12 text-amber-400 mx-auto mb-3" />
      <p class="font-pixel text-amber-300 text-sm">Game Sudah Diselesaikan!</p>
      <p class="font-mono text-xs text-gray-400 mt-1">Kamu sudah mendapatkan stempel dari Flappy Genius.</p>
    </div>

    <!-- Game Canvas -->
    <div v-else class="flex flex-col items-center gap-2 w-full">
      <!-- Header bar -->
      <div class="flex items-center justify-between w-full max-w-[380px] px-1">
        <div class="flex items-center gap-1.5">
          <PhBird class="h-4 w-4 text-amber-400" />
          <span class="font-pixel text-[10px] text-amber-300">FLAPPY GENIUS</span>
        </div>
        <PixelBadge v-if="phase === 'finished' || phase === 'dead'" color="amber">
          ⭐ {{ pipeCount }} PIPA
        </PixelBadge>
        <div v-else class="font-mono text-[10px] text-gray-400">
          Tap / SPACE = Loncat
        </div>
      </div>

      <!-- Canvas -->
      <canvas
        ref="canvasRef"
        :width="CANVAS_W"
        :height="CANVAS_H"
        class="border-2 border-[#523e2b] rounded pixel-shadow cursor-pointer w-full max-w-[380px] touch-none"
        style="image-rendering: pixelated; max-height: 480px;"
        @click="jump"
        @touchstart.prevent="jump"
      />

      <!-- Controls row -->
      <div class="flex items-center gap-2 w-full max-w-[380px]">
        <!-- Playing -->
        <template v-if="phase === 'playing'">
          <button
            class="pixel-btn flex-1 h-9 text-xs font-pixel bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30"
            @click="jump"
          >
            🐦 LONCAT (SPACE)
          </button>
          <button
            class="pixel-btn h-9 px-3 text-xs font-mono bg-[#271d15] text-gray-400 border-[#523e2b] hover:text-amber-300"
            @click="handleSubmit"
          >
            Selesai
          </button>
        </template>

        <!-- Dead -->
        <template v-else-if="phase === 'dead'">
          <button
            class="pixel-btn flex-1 h-9 text-xs font-pixel bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30"
            @click="handleRetry"
          >
            🔄 COBA LAGI
          </button>
          <button
            class="pixel-btn h-9 px-3 text-xs font-pixel bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30"
            @click="handleSubmit"
            :disabled="pipeCount === 0"
          >
            <PhArrowRight class="h-4 w-4" />
          </button>
        </template>

        <!-- Finished -->
        <template v-else-if="phase === 'finished'">
          <div class="flex-1 flex items-center justify-center gap-2 font-mono text-xs text-emerald-400">
            <PhStar class="h-4 w-4" />
            Skor: {{ totalScore }} / {{ cfg.maxScore }} XP
          </div>
          <button
            class="pixel-btn h-9 px-4 text-xs font-pixel bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30"
            @click="handleSubmit"
          >
            Kumpulkan <PhArrowRight class="h-3.5 w-3.5 inline" />
          </button>
        </template>

        <!-- Idle -->
        <template v-else>
          <button
            class="pixel-btn flex-1 h-9 text-xs font-pixel bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30 animate-pulse"
            @click="startGame"
          >
            🐦 MULAI TERBANG!
          </button>
        </template>
      </div>

      <!-- Info row -->
      <div class="flex items-center justify-between w-full max-w-[380px] font-mono text-[10px] text-gray-500 px-1">
        <span>{{ cfg.xpPerPipe }} XP/pipa · Maks {{ cfg.maxScore }} XP</span>
        <span v-if="cfg.durationSeconds > 0">Durasi: {{ cfg.durationSeconds }}s</span>
        <span v-else>Tanpa batas waktu</span>
      </div>
    </div>
  </div>
</template>
