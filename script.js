const rewards = [
  {
    icon: "💸",
    value: "₹1,000",
    title: "₹1,000 Virtual Reward",
    description: "Your scratch card landed on a lucky virtual reward. Nice."
  },
  {
    icon: "🎁",
    value: "MYSTERY GIFT",
    title: "Mystery Gift",
    description: "You got the mystery box. What is inside? Nobody knows."
  },
  {
    icon: "🎟️",
    value: "GIFT CARD",
    title: "Virtual Gift Card",
    description: "A fun virtual gift-card reward for your collection."
  },
  {
    icon: "💎",
    value: "JACKPOT",
    title: "Virtual Jackpot",
    description: "You hit the shiny one. That's some serious imaginary luck."
  },
  {
    icon: "🍕",
    value: "FREE PIZZA",
    title: "Free Pizza",
    description: "The universe has decided you deserve pizza. Virtually, of course."
  },
  {
    icon: "🍀",
    value: "MAX LUCK",
    title: "Maximum Luck",
    description: "Your luck meter just went completely overboard."
  }
];

const hero = document.getElementById("hero");
const unlock = document.getElementById("unlock");
const result = document.getElementById("result");
const claimBtn = document.getElementById("claimBtn");
const whatsappBtn = document.getElementById("whatsappBtn");
const backBtn = document.getElementById("backBtn");
const shareCountEl = document.getElementById("shareCount");
const progressFill = document.getElementById("progressFill");
const scratchHint = document.getElementById("scratchHint");

const rewardIcon = document.getElementById("rewardIcon");
const rewardValue = document.getElementById("rewardValue");
const rewardNote = document.getElementById("rewardNote");
const resultTitle = document.getElementById("resultTitle");
const resultDescription = document.getElementById("resultDescription");

const canvas = document.getElementById("scratchCanvas");
const card = document.getElementById("scratchCard");
const ctx = canvas.getContext("2d", { willReadFrequently: true });

let drawing = false;
let revealed = false;
let lastPoint = null;
let shareCount = 0;
let selectedReward = rewards[Math.floor(Math.random() * rewards.length)];

function resizeCanvas() {
  const rect = card.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(rect.height * dpr);
  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  drawCover(rect.width, rect.height);
}

function drawCover(width, height) {
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#d7d9df");
  gradient.addColorStop(.45, "#8f949e");
  gradient.addColorStop(.65, "#c9ccd2");
  gradient.addColorStop(1, "#777d88");

  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "rgba(255,255,255,.13)";
  for (let i = -height; i < width + height; i += 20) {
    ctx.save();
    ctx.translate(i, 0);
    ctx.rotate(-0.45);
    ctx.fillRect(0, -height, 7, height * 3);
    ctx.restore();
  }

  ctx.fillStyle = "#ffffff";
  ctx.font = "800 16px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("SCRATCH HERE ✨", width / 2, height / 2);

  ctx.globalCompositeOperation = "destination-out";
}

function getPoint(event) {
  const rect = canvas.getBoundingClientRect();
  const source = event.touches ? event.touches[0] : event;
  return {
    x: source.clientX - rect.left,
    y: source.clientY - rect.top
  };
}

function scratchAt(point) {
  if (!lastPoint) lastPoint = point;

  ctx.lineWidth = 34;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.beginPath();
  ctx.moveTo(lastPoint.x, lastPoint.y);
  ctx.lineTo(point.x, point.y);
  ctx.stroke();

  lastPoint = point;
}

function revealIfEnough() {
  if (revealed) return;

  const width = canvas.width;
  const height = canvas.height;
  const pixels = ctx.getImageData(0, 0, width, height).data;

  let transparent = 0;
  const sampleStep = 16;

  for (let i = 3; i < pixels.length; i += 4 * sampleStep) {
    if (pixels[i] < 80) transparent++;
  }

  const totalSamples = Math.ceil(pixels.length / (4 * sampleStep));
  const percent = transparent / totalSamples;

  if (percent > 0.48) reveal();
}

function reveal() {
  revealed = true;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  scratchHint.textContent = "✨ Your result is revealed";
  result.hidden = false;

  resultTitle.textContent = selectedReward.title;
  resultDescription.textContent = selectedReward.description;

  rewardIcon.textContent = selectedReward.icon;
  rewardValue.textContent = selectedReward.value;
  rewardNote.textContent = "Your virtual surprise";

  result.scrollIntoView({ behavior: "smooth", block: "center" });
}

function startScratch(event) {
  if (revealed) return;
  drawing = true;
  lastPoint = getPoint(event);
  scratchAt(lastPoint);
  event.preventDefault();
}

function moveScratch(event) {
  if (!drawing || revealed) return;
  scratchAt(getPoint(event));
  revealIfEnough();
  event.preventDefault();
}

function stopScratch() {
  drawing = false;
  lastPoint = null;
  revealIfEnough();
}

canvas.addEventListener("mousedown", startScratch);
canvas.addEventListener("mousemove", moveScratch);
window.addEventListener("mouseup", stopScratch);

canvas.addEventListener("touchstart", startScratch, { passive: false });
canvas.addEventListener("touchmove", moveScratch, { passive: false });
canvas.addEventListener("touchend", stopScratch, { passive: false });

claimBtn.addEventListener("click", () => {
  hero.hidden = true;
  unlock.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
});

backBtn.addEventListener("click", () => {
  unlock.hidden = true;
  hero.hidden = false;
  result.scrollIntoView({ behavior: "smooth", block: "center" });
});

whatsappBtn.addEventListener("click", () => {
  shareCount = Math.min(5, shareCount + 1);
  shareCountEl.textContent = shareCount;
  progressFill.style.width = `${shareCount * 20}%`;

  const text =
    `🎁 I just scratched a Mystery Scratch Card and got ${selectedReward.value}! ` +
    `Try yours 👀`;

  const url = window.location.href;
  const shareUrl = `https://wa.me/?text=${encodeURIComponent(text + "\n" + url)}`;

  window.open(shareUrl, "_blank", "noopener,noreferrer");
});

window.addEventListener("resize", () => {
  if (!revealed) resizeCanvas();
});

resizeCanvas();
