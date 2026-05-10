const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const levelEl = document.getElementById("level");
const messageEl = document.getElementById("message");
const shellEl = document.querySelector(".shell");
const overlayEl = document.getElementById("overlay");
const overlayTitleEl = document.getElementById("overlay-title");
const overlayCopyEl = document.getElementById("overlay-copy");
const overlayActionEl = document.getElementById("overlay-action");
const overlaySecondaryEl = document.getElementById("overlay-secondary");
const plannedControlsEl = document.getElementById("planned-controls");
const launchButton = document.getElementById("launch");
const activateButton = document.getElementById("activate");

const BACKGROUND_COUNT = 7;
const MAX_PARTICLE_SPEED = 12;
const MIN_CAPTURE_SPEED = 1.4;
const MIN_ATTRACTOR_RADIUS = 28;
const MAX_ATTRACTOR_RADIUS = 92;
const TOUCH_DEVICE = matchMedia("(pointer: coarse)").matches;
const MAX_RENDER_DPR = 1;

const levelConfigs = [
  { targetSpeed: 4.2, goal: { edge: "bottom", align: 0.76, length: 1.18 }, obstacles: [] },
  {
    targetSpeed: 5.2,
    goal: { edge: "right", align: 0.72, length: 1.05 },
    obstacles: [
      { kind: "destructible", breakSpeed: 3.4, x: 0.38, y: 0.35, width: 0.27, height: 18 },
      { kind: "destructible", breakSpeed: 4.2, x: 0.5, y: 0.62, width: 18, height: 0.24 }
    ]
  },
  {
    targetSpeed: 6.4,
    goal: { edge: "left", align: 0.28, length: 0.92 },
    obstacles: [
      { kind: "destructible", breakSpeed: 4.6, x: 0.24, y: 0.35, width: 0.18, height: 18 },
      { kind: "solid", x: 0.57, y: 0.48, width: 0.25, height: 18 },
      { kind: "destructible", breakSpeed: 5.2, x: 0.42, y: 0.7, width: 18, height: 0.22 }
    ]
  },
  {
    targetSpeed: 7.1,
    goal: { edge: "top", align: 0.72, length: 0.82, thickness: 1.1 },
    obstacles: [
      { kind: "destructible", breakSpeed: 4.8, x: 0.36, y: 0.23, width: 0.18, height: 18 },
      { kind: "destructible", breakSpeed: 5.8, x: 0.58, y: 0.34, width: 0.2, height: 18 },
      { kind: "destructible", breakSpeed: 6.4, x: 0.46, y: 0.6, width: 0.18, height: 18 },
      { kind: "solid", x: 0.74, y: 0.62, width: 18, height: 0.22 }
    ]
  },
  {
    targetSpeed: 7.8,
    goal: { edge: "bottom", align: 0.34, length: 0.74 },
    obstacles: [
      { kind: "solid", x: 0.29, y: 0.4, width: 18, height: 0.34 },
      { kind: "destructible", breakSpeed: 5.5, x: 0.47, y: 0.28, width: 0.16, height: 20 },
      { kind: "destructible", breakSpeed: 6.8, x: 0.58, y: 0.48, width: 0.18, height: 20 },
      { kind: "destructible", breakSpeed: 7.6, x: 0.69, y: 0.68, width: 0.16, height: 20 }
    ]
  },
  {
    targetSpeed: 8.4,
    goal: { edge: "top", align: 0.88, length: 0.62 },
    obstacles: [
      { kind: "destructible", breakSpeed: 5.8, x: 0.3, y: 0.25, width: 0.18, height: 18 },
      { kind: "destructible", breakSpeed: 7.1, x: 0.48, y: 0.37, width: 0.18, height: 18 },
      { kind: "destructible", breakSpeed: 8.3, x: 0.66, y: 0.49, width: 0.18, height: 18 },
      { kind: "solid", x: 0.37, y: 0.67, width: 0.22, height: 18 },
      { kind: "solid", x: 0.72, y: 0.76, width: 18, height: 0.2 }
    ]
  },
  {
    targetSpeed: 8.9,
    goal: { edge: "right", align: 0.18, length: 0.86, motion: { axis: "edge", center: 0.5, range: 0.34, speed: 0.72 } },
    obstacles: []
  },
  {
    targetSpeed: 5.9,
    goal: { edge: "left", align: 0.68, length: 0.7 },
    obstacles: [
      { kind: "destructible", breakSpeed: 4.2, x: 0.32, y: 0.42, width: 0.2, height: 18 },
      { kind: "solid", x: 0.62, y: 0.56, width: 0.22, height: 18 }
    ]
  },
  {
    targetSpeed: 6.8,
    goal: { edge: "bottom", align: 0.58, length: 0.58, thickness: 1.18 },
    obstacles: [
      { kind: "destructible", breakSpeed: 5.2, x: 0.42, y: 0.3, width: 18, height: 0.22 },
      { kind: "destructible", breakSpeed: 5.9, x: 0.63, y: 0.5, width: 0.2, height: 18 },
      { kind: "solid", x: 0.3, y: 0.69, width: 0.2, height: 18 }
    ]
  },
  {
    targetSpeed: 7.6,
    goal: { edge: "right", align: 0.32, length: 0.52 },
    obstacles: [
      { kind: "solid", x: 0.47, y: 0.34, width: 0.2, height: 18 },
      { kind: "destructible", breakSpeed: 6.4, x: 0.58, y: 0.63, width: 18, height: 0.24 }
    ]
  },
  {
    targetSpeed: 8.2,
    goal: { edge: "top", align: 0.42, length: 0.5 },
    obstacles: [
      { kind: "destructible", breakSpeed: 6.2, x: 0.28, y: 0.3, width: 0.16, height: 18 },
      { kind: "destructible", breakSpeed: 7.2, x: 0.52, y: 0.48, width: 0.18, height: 18 },
      { kind: "solid", x: 0.72, y: 0.62, width: 18, height: 0.22 }
    ]
  },
  {
    targetSpeed: 9.0,
    goal: { edge: "bottom", align: 0.16, length: 0.46, motion: { center: 0.42, range: 0.28, speed: 0.48 } },
    obstacles: [
      { kind: "solid", x: 0.35, y: 0.44, width: 18, height: 0.3 },
      { kind: "destructible", breakSpeed: 7.6, x: 0.59, y: 0.36, width: 0.18, height: 18 }
    ]
  },
  {
    targetSpeed: 9.6,
    goal: { edge: "left", align: 0.42, length: 0.44, thickness: 1.22 },
    obstacles: [
      { kind: "destructible", breakSpeed: 6.8, x: 0.38, y: 0.27, width: 0.16, height: 18 },
      { kind: "solid", x: 0.55, y: 0.5, width: 0.24, height: 18 },
      { kind: "destructible", breakSpeed: 8.5, x: 0.68, y: 0.72, width: 18, height: 0.2 }
    ]
  },
  {
    targetSpeed: 10.2,
    goal: { edge: "right", align: 0.78, length: 0.4 },
    obstacles: [
      { kind: "solid", x: 0.4, y: 0.32, width: 18, height: 0.24 },
      { kind: "destructible", breakSpeed: 8.1, x: 0.54, y: 0.48, width: 0.16, height: 18 },
      { kind: "solid", x: 0.72, y: 0.68, width: 0.18, height: 18 }
    ]
  },
  {
    targetSpeed: 10.8,
    goal: { edge: "top", align: 0.18, length: 0.38, motion: { center: 0.48, range: 0.34, speed: 0.62 } },
    obstacles: [
      { kind: "destructible", breakSpeed: 8.4, x: 0.36, y: 0.42, width: 0.18, height: 18 },
      { kind: "destructible", breakSpeed: 9.4, x: 0.62, y: 0.58, width: 18, height: 0.23 }
    ]
  },
  {
    targetSpeed: 11.2,
    goal: { edge: "bottom", align: 0.86, length: 0.36 },
    obstacles: [
      { kind: "solid", x: 0.33, y: 0.52, width: 0.2, height: 18 },
      { kind: "destructible", breakSpeed: 9.2, x: 0.55, y: 0.34, width: 18, height: 0.2 },
      { kind: "solid", x: 0.72, y: 0.62, width: 18, height: 0.22 }
    ]
  },
  {
    targetSpeed: 11.6,
    goal: { edge: "left", align: 0.18, length: 0.34, thickness: 1.28 },
    obstacles: [
      { kind: "destructible", breakSpeed: 8.9, x: 0.34, y: 0.36, width: 0.15, height: 18 },
      { kind: "destructible", breakSpeed: 10.2, x: 0.58, y: 0.5, width: 0.16, height: 18 },
      { kind: "solid", x: 0.7, y: 0.72, width: 0.18, height: 18 }
    ]
  },
  {
    targetSpeed: 11.9,
    goal: { edge: "right", align: 0.5, length: 0.32, motion: { center: 0.5, range: 0.28, speed: 0.86 } },
    obstacles: [
      { kind: "solid", x: 0.36, y: 0.3, width: 0.18, height: 18 },
      { kind: "solid", x: 0.54, y: 0.55, width: 18, height: 0.26 },
      { kind: "destructible", breakSpeed: 10.6, x: 0.72, y: 0.38, width: 0.14, height: 18 }
    ]
  },
  {
    targetSpeed: 12.0,
    goal: { edge: "top", align: 0.9, length: 0.3, thickness: 1.35, motion: { center: 0.52, range: 0.38, speed: 0.72 } },
    obstacles: [
      { kind: "destructible", breakSpeed: 9.8, x: 0.32, y: 0.28, width: 18, height: 0.2 },
      { kind: "solid", x: 0.5, y: 0.48, width: 0.22, height: 18 },
      { kind: "destructible", breakSpeed: 11.2, x: 0.7, y: 0.7, width: 0.14, height: 18 }
    ]
  }
];

const level = {
  index: 0,
  targetSpeed: levelConfigs[0].targetSpeed,
  obstacles: []
};

const world = {
  width: 0,
  height: 0,
  dpr: 1,
  won: false,
  transitioning: false,
  nextLevelAt: 0,
  mode: "start",
  playStyle: "fast",
  attractorsActive: false,
  spaceDown: false,
  pendingRestartAt: 0,
  runStartedAt: 0,
  losses: 0,
  pausedUntil: 0,
  messageTimer: 0,
  lastTime: performance.now(),
  frameCost: 0,
  fastRender: true
};

const particle = {
  x: 0,
  y: 0,
  radius: 7,
  vx: 2.0,
  vy: -0.35,
  capturedBy: null,
  orbitAngle: 0,
  orbitDirection: 1,
  orbitRadius: 42,
  speed: 2.03
};

const goal = {
  x: 0,
  y: 0,
  width: 118,
  height: 18
};

const attractors = new Map();
const smashShards = [];
const particleTrail = [];

function speedColor(speed) {
  const t = Math.max(0, Math.min(1, speed / MAX_PARTICLE_SPEED));
  const hue = 142 - t * 142;
  const light = 62 + t * 3;
  return `hsl(${hue} 86% ${light}%)`;
}

function showMessage(text, duration = 1300) {
  messageEl.textContent = text;
  messageEl.classList.add("show");
  world.messageTimer = duration;
}

function resize() {
  world.dpr = Math.max(1, Math.min(MAX_RENDER_DPR, window.devicePixelRatio || 1));
  world.width = window.innerWidth;
  world.height = window.innerHeight;
  particle.radius = Math.max(5, Math.min(7, Math.min(world.width, world.height) * 0.018));
  canvas.width = Math.floor(world.width * world.dpr);
  canvas.height = Math.floor(world.height * world.dpr);
  canvas.style.width = `${world.width}px`;
  canvas.style.height = `${world.height}px`;
  ctx.setTransform(world.dpr, 0, 0, world.dpr, 0, 0);

  positionGoal();

  if (!particle.x || !particle.y) {
    resetParticle();
  }

  buildObstacles();
}

function positionGoal() {
  const config = levelConfigs[level.index % levelConfigs.length];
  const edge = config.goal?.edge || "top";
  const align = movingGoalAlign(config.goal || {});
  const inset = Math.max(26, Math.min(world.width, world.height) * 0.045);
  const lengthScale = config.goal?.length ?? 1;
  const thicknessScale = config.goal?.thickness ?? 1;
  const baseLongSide = Math.min(134, Math.max(58, Math.min(world.width, world.height) * 0.18));
  const baseShortSide = Math.max(14, Math.min(18, Math.min(world.width, world.height) * 0.042));

  if (edge === "left" || edge === "right") {
    goal.width = baseShortSide * thicknessScale;
    goal.height = Math.max(34, Math.min(world.height - inset * 2, baseLongSide * lengthScale));
    goal.x = edge === "left" ? inset : world.width - inset - goal.width;
    goal.y = inset + (world.height - inset * 2 - goal.height) * align;
  } else {
    goal.width = Math.max(34, Math.min(world.width - inset * 2, baseLongSide * lengthScale));
    goal.height = baseShortSide * thicknessScale;
    goal.x = inset + (world.width - inset * 2 - goal.width) * align;
    goal.y = edge === "top" ? inset : world.height - inset - goal.height;
  }
}

function movingGoalAlign(goalConfig) {
  if (!goalConfig.motion || world.transitioning) {
    return goalConfig.align ?? 0.82;
  }

  const motion = goalConfig.motion;
  const elapsed = performance.now() * 0.001;
  const center = motion.center ?? goalConfig.align ?? 0.5;
  const range = motion.range ?? 0.25;
  return Math.max(0, Math.min(1, center + Math.sin(elapsed * motion.speed * Math.PI * 2) * range));
}

function buildObstacles() {
  const config = levelConfigs[level.index % levelConfigs.length];
  level.obstacles = config.obstacles.map((obstacle, index) => {
    const width = obstacle.width < 1 ? obstacle.width * world.width : obstacle.width;
    const height = obstacle.height < 1 ? obstacle.height * world.height : obstacle.height;
    return {
      kind: obstacle.kind || "solid",
      breakSpeed: obstacle.breakSpeed ? obstacle.breakSpeed + Math.floor(level.index / levelConfigs.length) * 0.6 : null,
      x: obstacle.x * world.width - width / 2,
      y: obstacle.y * world.height - height / 2,
      width,
      height,
      shape: makeObstacleShape(width, height, index)
    };
  });
}

function makeObstacleShape(width, height, index) {
  const chip = Math.min(14, Math.max(5, Math.min(width, height) * 0.42));
  const a = 0.28 + (index % 3) * 0.07;
  const b = 0.66 - (index % 2) * 0.08;

  return [
    { x: chip * 0.9, y: 0 },
    { x: width * a, y: chip * 0.35 },
    { x: width - chip * 0.55, y: 0 },
    { x: width, y: chip * 1.05 },
    { x: width - chip * 0.38, y: height * 0.38 },
    { x: width, y: height - chip * 0.9 },
    { x: width - chip * 1.1, y: height },
    { x: width * b, y: height - chip * 0.42 },
    { x: chip * 0.72, y: height },
    { x: 0, y: height - chip * 1.15 },
    { x: chip * 0.32, y: height * 0.58 },
    { x: 0, y: chip * 0.75 }
  ];
}

function resetParticle() {
  particle.capturedBy = null;
  particle.x = Math.max(28, world.width * 0.16);
  particle.y = Math.max(80, world.height * 0.66);
  const angle = -0.22;
  const speed = 2.05;
  particle.vx = Math.cos(angle) * speed;
  particle.vy = Math.sin(angle) * speed;
  particle.speed = speed;
}

function startLevel(index = 0, message) {
  const config = levelConfigs[index % levelConfigs.length];
  level.index = index;
  level.targetSpeed = config.targetSpeed + Math.floor(index / levelConfigs.length) * 0.8;
  updateLevelBackground();
  positionGoal();
  buildObstacles();

  world.won = false;
  world.transitioning = false;
  world.pausedUntil = 0;
  world.nextLevelAt = 0;
  smashShards.length = 0;
  particleTrail.length = 0;
  attractors.clear();
  world.attractorsActive = false;
  syncPlannedControls();
  resetParticle();
  updateHud();
  if (message !== null) {
    showMessage(message || `LEVEL ${level.index + 1}`, 900);
  }
}

function updateLevelBackground() {
  const backgroundIndex = (level.index % BACKGROUND_COUNT) + 1;
  shellEl.style.setProperty("--level-bg", `url("assets/level-${backgroundIndex}-bg.png")`);
}

function updateHud() {
  levelEl.textContent = String(level.index + 1);
}

function showOverlay(kind, title, copy, primaryText = "", secondaryText = "") {
  overlayEl.className = `overlay show ${kind}`;
  overlayTitleEl.textContent = title;
  overlayCopyEl.textContent = copy;
  overlayActionEl.textContent = primaryText;
  overlayActionEl.hidden = !primaryText;
  overlaySecondaryEl.textContent = secondaryText;
  overlaySecondaryEl.hidden = !secondaryText;
  overlaySecondaryEl.classList.toggle("secondary", Boolean(secondaryText));
}

function hideOverlay() {
  overlayEl.className = "overlay";
}

function startFastGame() {
  world.playStyle = "fast";
  world.mode = "playing";
  world.losses = 0;
  world.runStartedAt = performance.now();
  hideOverlay();
  plannedControlsEl.hidden = true;
  startLevel(0);
}

function startPlannedGame() {
  world.playStyle = "planned";
  world.mode = "planning";
  world.losses = 0;
  world.runStartedAt = performance.now();
  hideOverlay();
  startLevel(0);
  showMessage("PLACE UP TO 5", 1200);
  syncPlannedControls();
}

function showStartScreen() {
  world.mode = "start";
  plannedControlsEl.hidden = true;
  showOverlay(
    "start",
    "Orbiter",
    "Choose fast touch play, or planned play where you place up to five attractors before launching and hold Attract or Space to turn them on.",
    "Fast",
    "Planned"
  );
}

function completeGame() {
  world.mode = "complete";
  const elapsedSeconds = Math.max(0, Math.round((performance.now() - world.runStartedAt) / 1000));
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const timeText = `${minutes}:${String(seconds).padStart(2, "0")}`;
  showOverlay(
    "complete",
    "Congratulations!",
    `You beat all ${levelConfigs.length} levels in ${timeText}. Losses: ${world.losses}.`,
    "Fast",
    "Planned"
  );
}

function syncPlannedControls() {
  const planned = world.playStyle === "planned" && (world.mode === "planning" || world.mode === "playing");
  plannedControlsEl.hidden = !planned;
  launchButton.hidden = world.mode !== "planning";
  activateButton.hidden = world.mode !== "playing";
  activateButton.classList.toggle("active", world.attractorsActive);
}

function launchPlannedLevel() {
  if (world.playStyle !== "planned" || world.mode !== "planning") return;
  world.mode = "playing";
  world.attractorsActive = false;
  showMessage(`LEVEL ${level.index + 1}`, 700);
  syncPlannedControls();
}

function setAttractorsActive(active) {
  if (world.playStyle !== "planned" || world.mode !== "playing") return;
  if (world.attractorsActive === active) return;
  world.attractorsActive = active;
  activateButton.classList.toggle("active", active);

  if (!active && particle.capturedBy !== null) {
    const tangent = particle.orbitAngle + particle.orbitDirection * Math.PI / 2;
    particle.vx = Math.cos(tangent) * particle.speed;
    particle.vy = Math.sin(tangent) * particle.speed;
    particle.capturedBy = null;
  }
}

function pointerPosition(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
}

function addAttractor(event) {
  if (world.playStyle === "planned" && world.mode === "planning") {
    if (attractors.size >= 5) {
      showMessage("MAX 5", 650);
      return;
    }
    const pos = pointerPosition(event);
    const id = `planned-${attractors.size}-${Math.round(performance.now())}`;
    attractors.set(id, {
      id,
      x: pos.x,
      y: pos.y,
      radius: MIN_ATTRACTOR_RADIUS,
      age: 0,
      pulse: 0,
      planned: true
    });
    showMessage(`${attractors.size}/5`, 520);
    return;
  }

  if (world.playStyle !== "fast" || world.mode !== "playing" || world.won) return;
  canvas.setPointerCapture(event.pointerId);
  const pos = pointerPosition(event);
  attractors.set(event.pointerId, {
    id: event.pointerId,
    x: pos.x,
    y: pos.y,
    radius: 28,
    age: 0,
    pulse: 0
  });
}

function moveAttractor(event) {
  if (!attractors.has(event.pointerId)) return;
  event.preventDefault();
}

function releaseAttractor(event) {
  if (world.playStyle !== "fast") return;
  const attractor = attractors.get(event.pointerId);
  if (!attractor) return;

  if (particle.capturedBy === attractor.id) {
    const tangent = particle.orbitAngle + particle.orbitDirection * Math.PI / 2;
    particle.vx = Math.cos(tangent) * particle.speed;
    particle.vy = Math.sin(tangent) * particle.speed;
    particle.capturedBy = null;
  }

  attractors.delete(event.pointerId);
}

function restartLevel() {
  if (world.mode !== "playing" || world.won || world.transitioning || performance.now() < world.pausedUntil) return;
  world.mode = "lost";
  world.losses += 1;
  world.pausedUntil = performance.now() + 650;
  world.pendingRestartAt = performance.now() + 900;
  attractors.clear();
  showOverlay("loss", "You lost", "Restarting level...", "");
}

function goalHit() {
  return (
    particle.x + particle.radius >= goal.x &&
    particle.x - particle.radius <= goal.x + goal.width &&
    particle.y + particle.radius >= goal.y &&
    particle.y - particle.radius <= goal.y + goal.height
  );
}

function obstacleHit() {
  return level.obstacles.find((obstacle) => circleRectHit(particle, obstacle));
}

function circleRectHit(circle, rect) {
  const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
  const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
  return Math.hypot(circle.x - closestX, circle.y - closestY) <= circle.radius;
}

function borderHit() {
  return (
    particle.x - particle.radius <= 0 ||
    particle.x + particle.radius >= world.width ||
    particle.y - particle.radius <= 0 ||
    particle.y + particle.radius >= world.height
  );
}

function maybeCapture() {
  if (particle.capturedBy !== null) return;
  if (world.playStyle === "planned" && !world.attractorsActive) return;

  for (const attractor of attractors.values()) {
    const dx = particle.x - attractor.x;
    const dy = particle.y - attractor.y;
    const distance = Math.hypot(dx, dy);
    const orbitRadius = Math.max(26, attractor.radius * 1.35);

    if (distance <= orbitRadius + particle.radius) {
      const cross = dx * particle.vy - dy * particle.vx;
      particle.capturedBy = attractor.id;
      particle.orbitRadius = orbitRadius;
      particle.orbitAngle = Math.atan2(dy, dx);
      particle.orbitDirection = cross >= 0 ? 1 : -1;
      particle.speed = speedFromAttractor(attractor);
      attractor.pulse = 1;
      return;
    }
  }
}

function speedFromAttractor(attractor) {
  const t = Math.max(0, Math.min(1, (attractor.radius - MIN_ATTRACTOR_RADIUS) / (MAX_ATTRACTOR_RADIUS - MIN_ATTRACTOR_RADIUS)));
  return MIN_CAPTURE_SPEED + t * (MAX_PARTICLE_SPEED - MIN_CAPTURE_SPEED);
}

function updateCaptured(dt) {
  const attractor = attractors.get(particle.capturedBy);
  if (!attractor) {
    particle.capturedBy = null;
    return;
  }

  particle.orbitRadius = Math.max(26, attractor.radius * 1.35);
  particle.speed = speedFromAttractor(attractor);
  particle.orbitAngle += particle.orbitDirection * (particle.speed / particle.orbitRadius) * dt * 60;
  particle.x = attractor.x + Math.cos(particle.orbitAngle) * particle.orbitRadius;
  particle.y = attractor.y + Math.sin(particle.orbitAngle) * particle.orbitRadius;
}

function smashGoal() {
  const now = performance.now();
  const color = speedColor(level.targetSpeed);
  const columns = 10;
  const rows = 3;
  const shardWidth = goal.width / columns;
  const shardHeight = goal.height / rows;
  const impactAngle = Math.atan2(particle.vy, particle.vx);

  smashShards.length = 0;
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const x = goal.x + column * shardWidth + shardWidth / 2;
      const y = goal.y + row * shardHeight + shardHeight / 2;
      const spread = (Math.random() - 0.5) * 1.6;
      const force = 3.8 + Math.random() * 5 + particle.speed * 0.5;
      smashShards.push({
        x,
        y,
        width: shardWidth * (0.65 + Math.random() * 0.55),
        height: shardHeight * (0.7 + Math.random() * 0.8),
        vx: Math.cos(impactAngle + spread) * force + (Math.random() - 0.5) * 3,
        vy: Math.sin(impactAngle + spread) * force + (Math.random() - 0.5) * 3,
        rotation: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 0.34,
        color,
        alpha: 1
      });
    }
  }

  world.won = true;
  world.transitioning = true;
  world.nextLevelAt = now + 1200;
  attractors.clear();
  showMessage("SMASH", 900);
}

function advanceAfterSmash() {
  if (level.index + 1 >= levelConfigs.length) {
    completeGame();
  } else {
    startLevel(level.index + 1);
  }
}

function smashObstacle(obstacle) {
  const color = speedColor(obstacle.breakSpeed || particle.speed);
  const columns = Math.min(6, Math.max(2, Math.round(obstacle.width / 24)));
  const rows = Math.min(4, Math.max(2, Math.round(obstacle.height / 24)));
  const shardWidth = obstacle.width / columns;
  const shardHeight = obstacle.height / rows;
  const impactAngle = Math.atan2(particle.vy, particle.vx);

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const x = obstacle.x + column * shardWidth + shardWidth / 2;
      const y = obstacle.y + row * shardHeight + shardHeight / 2;
      const spread = (Math.random() - 0.5) * 2.1;
      const force = 2.6 + Math.random() * 4.2 + particle.speed * 0.28;
      smashShards.push({
        x,
        y,
        width: shardWidth * (0.55 + Math.random() * 0.55),
        height: shardHeight * (0.55 + Math.random() * 0.65),
        vx: Math.cos(impactAngle + spread) * force + (Math.random() - 0.5) * 2.5,
        vy: Math.sin(impactAngle + spread) * force + (Math.random() - 0.5) * 2.5,
        rotation: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 0.42,
        color,
        alpha: 0.95
      });
    }
  }
}

function breakObstacle(obstacle) {
  smashObstacle(obstacle);
  level.obstacles = level.obstacles.filter((candidate) => candidate !== obstacle);

  let angle = Math.atan2(particle.vy, particle.vx);
  if (particle.capturedBy !== null) {
    angle = particle.orbitAngle + particle.orbitDirection * Math.PI / 2;
    particle.capturedBy = null;
  }

  const speed = Math.max(1.3, particle.speed * 0.82);
  particle.vx = Math.cos(angle) * speed;
  particle.vy = Math.sin(angle) * speed;
  particle.speed = speed;
  showMessage("BREAK", 520);
}

function updateSmash(dt) {
  for (let index = smashShards.length - 1; index >= 0; index -= 1) {
    const shard = smashShards[index];
    shard.x += shard.vx * dt * 60;
    shard.y += shard.vy * dt * 60;
    shard.vy += 0.09 * dt * 60;
    shard.rotation += shard.spin * dt * 60;
    shard.alpha = Math.max(0, shard.alpha - dt * 0.85);
    if (shard.alpha <= 0) {
      smashShards.splice(index, 1);
    }
  }
}

function updateTrail(dt) {
  particleTrail.push({
    x: particle.x,
    y: particle.y,
    radius: particle.radius,
    color: speedColor(particle.speed),
    alpha: world.fastRender ? 0.38 : 0.68
  });

  const maxTrail = world.fastRender ? 16 : 34;
  if (particleTrail.length > maxTrail) {
    particleTrail.shift();
  }

  for (let index = particleTrail.length - 1; index >= 0; index -= 1) {
    const point = particleTrail[index];
    point.alpha -= dt * (world.fastRender ? 2.7 : 1.8);
    point.radius += dt * (world.fastRender ? 10 : 16);
    if (point.alpha <= 0) {
      particleTrail.splice(index, 1);
    }
  }
}

function update(dt) {
  if (world.mode === "lost") {
    updateSmash(dt);
    if (performance.now() >= world.pendingRestartAt) {
      hideOverlay();
      world.mode = world.playStyle === "planned" ? "planning" : "playing";
      startLevel(level.index, null);
      if (world.playStyle === "planned") {
        showMessage("PLACE UP TO 5", 900);
      }
    }
    return;
  }

  if (world.mode !== "playing") {
    updateSmash(dt);
    return;
  }

  for (const attractor of attractors.values()) {
    const active = world.playStyle === "fast" || world.attractorsActive;
    if (active) {
      attractor.age += dt;
      attractor.radius = Math.min(MAX_ATTRACTOR_RADIUS, attractor.radius + dt * 21);
    }
    attractor.pulse = Math.max(0, attractor.pulse - dt * 2.8);
  }

  updateSmash(dt);
  positionGoal();

  if (world.transitioning) {
    particle.x += particle.vx * dt * 60;
    particle.y += particle.vy * dt * 60;
    particle.speed = Math.hypot(particle.vx, particle.vy);
    updateTrail(dt);

    if (performance.now() >= world.nextLevelAt || borderHit()) {
      advanceAfterSmash();
    }
    return;
  }

  if (performance.now() < world.pausedUntil || world.won) return;

  if (particle.capturedBy !== null) {
    updateCaptured(dt);
  } else {
    particle.x += particle.vx * dt * 60;
    particle.y += particle.vy * dt * 60;
    particle.speed = Math.hypot(particle.vx, particle.vy);
    maybeCapture();
  }
  updateTrail(dt);

  if (goalHit()) {
    if (particle.speed >= level.targetSpeed) {
      smashGoal();
    } else {
      restartLevel();
    }
    return;
  }

  const obstacle = obstacleHit();
  if (obstacle) {
    if (obstacle.kind === "destructible") {
      if (particle.speed >= obstacle.breakSpeed) {
        breakObstacle(obstacle);
      } else {
        restartLevel();
      }
    } else {
      restartLevel();
    }
    return;
  }

  if (borderHit()) {
    restartLevel();
  }
}

function drawGrid() {
  if (world.fastRender) return;
  ctx.save();
  ctx.globalAlpha = 0.14;
  ctx.strokeStyle = "#ecf7ef";
  ctx.lineWidth = 1;
  const step = 44;
  const drift = (performance.now() * 0.012) % step;

  for (let x = -step + drift; x < world.width + step; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, world.height);
    ctx.stroke();
  }

  for (let y = -step + drift; y < world.height + step; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(world.width, y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawGoal() {
  if (world.transitioning) return;
  const color = speedColor(level.targetSpeed);
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = color;
  ctx.lineWidth = 9;
  ctx.globalAlpha = 0.18;
  ctx.strokeRect(goal.x - 7, goal.y - 7, goal.width + 14, goal.height + 14);
  ctx.globalAlpha = 0.34;
  ctx.lineWidth = 4;
  ctx.strokeRect(goal.x - 3, goal.y - 3, goal.width + 6, goal.height + 6);
  ctx.globalAlpha = 1;
  ctx.fillStyle = color;
  ctx.fillRect(goal.x, goal.y, goal.width, goal.height);
  ctx.strokeStyle = "rgba(236, 247, 239, 0.82)";
  ctx.lineWidth = 2;
  ctx.strokeRect(goal.x - 4, goal.y - 4, goal.width + 8, goal.height + 8);
  ctx.restore();
}

function drawObstacles() {
  ctx.save();
  for (const obstacle of level.obstacles) {
    const destructible = obstacle.kind === "destructible";
    drawObstacleShape(obstacle, destructible);
  }
  ctx.restore();
}

function drawObstacleShape(obstacle, destructible) {
  const obstacleColor = destructible ? speedColor(obstacle.breakSpeed) : "rgba(232, 242, 236, 0.82)";
  ctx.save();
  ctx.translate(obstacle.x, obstacle.y);
  ctx.globalCompositeOperation = destructible ? "lighter" : "source-over";
  ctx.fillStyle = obstacleColor;
  traceObstaclePath(obstacle);
  ctx.fill();
  ctx.restore();
}

function traceObstaclePath(obstacle) {
  const [first, ...rest] = obstacle.shape;
  ctx.beginPath();
  ctx.moveTo(first.x, first.y);
  for (const point of rest) {
    ctx.lineTo(point.x, point.y);
  }
  ctx.closePath();
}

function drawSmash() {
  for (const shard of smashShards) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = shard.alpha;
    ctx.translate(shard.x, shard.y);
    ctx.rotate(shard.rotation);
    ctx.fillStyle = shard.color;
    ctx.fillRect(-shard.width / 2, -shard.height / 2, shard.width, shard.height);
    ctx.restore();
  }
}

function drawAttractors() {
  for (const attractor of attractors.values()) {
    const captureRadius = Math.max(26, attractor.radius * 1.35);
    const active = world.playStyle === "fast" || world.attractorsActive;

    ctx.save();
    ctx.translate(attractor.x, attractor.y);
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = active ? 0.1 + attractor.pulse * 0.08 : 0.04;
    ctx.fillStyle = "rgba(98, 227, 140, 0.32)";
    ctx.beginPath();
    ctx.arc(0, 0, captureRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.strokeStyle = active ? "rgba(98, 227, 140, 0.34)" : "rgba(236, 247, 239, 0.28)";
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 10]);
    ctx.beginPath();
    ctx.arc(0, 0, captureRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = active ? "rgba(98, 227, 140, 0.16)" : "rgba(236, 247, 239, 0.08)";
    ctx.beginPath();
    ctx.arc(0, 0, attractor.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(236, 247, 239, 0.9)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, attractor.radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#ecf7ef";
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawParticleTrail() {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (const point of particleTrail) {
    ctx.globalAlpha = point.alpha;
    ctx.fillStyle = point.color;
    ctx.beginPath();
    ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawParticle() {
  const color = speedColor(particle.speed);
  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  if (particle.capturedBy !== null) {
    const tangent = particle.orbitAngle + particle.orbitDirection * Math.PI / 2;
    const length = 34 + particle.speed * 9;
    const endX = particle.x + Math.cos(tangent) * length;
    const endY = particle.y + Math.sin(tangent) * length;

    ctx.globalAlpha = 0.86;
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(particle.x, particle.y);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - Math.cos(tangent - 0.45) * 11,
      endY - Math.sin(tangent - 0.45) * 11
    );
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - Math.cos(tangent + 0.45) * 11,
      endY - Math.sin(tangent + 0.45) * 11
    );
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  ctx.globalAlpha = 0.2;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(particle.x, particle.y, particle.radius * 4.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.32;
  ctx.beginPath();
  ctx.arc(particle.x, particle.y, particle.radius * 2.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.92)";
  ctx.lineWidth = 2;
  ctx.stroke();

  if (particle.capturedBy === null) {
    ctx.globalAlpha = 0.58;
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(particle.x, particle.y);
    ctx.lineTo(particle.x - particle.vx * 18, particle.y - particle.vy * 18);
    ctx.stroke();
  }
  ctx.restore();
}

function draw() {
  ctx.clearRect(0, 0, world.width, world.height);
  drawGrid();
  drawObstacles();
  drawGoal();
  drawSmash();
  drawAttractors();
  drawParticleTrail();
  drawParticle();
}

function loop(now) {
  const dt = Math.min(0.033, (now - world.lastTime) / 1000 || 0);
  world.lastTime = now;

  if (world.messageTimer > 0) {
    world.messageTimer -= dt * 1000;
    if (world.messageTimer <= 0) {
      messageEl.classList.remove("show");
    }
  }

  update(dt);
  updateHud();
  draw();
  requestAnimationFrame(loop);
}

window.addEventListener("resize", resize);
canvas.addEventListener("pointerdown", addAttractor);
canvas.addEventListener("pointermove", moveAttractor);
canvas.addEventListener("pointerup", releaseAttractor);
canvas.addEventListener("pointercancel", releaseAttractor);
overlayActionEl.addEventListener("click", startFastGame);
overlaySecondaryEl.addEventListener("click", startPlannedGame);
launchButton.addEventListener("click", launchPlannedLevel);
activateButton.addEventListener("pointerdown", () => setAttractorsActive(true));
activateButton.addEventListener("pointerup", () => setAttractorsActive(false));
activateButton.addEventListener("pointercancel", () => setAttractorsActive(false));
activateButton.addEventListener("pointerleave", () => setAttractorsActive(false));
window.addEventListener("keydown", (event) => {
  if (event.code !== "Space" || world.spaceDown) return;
  world.spaceDown = true;
  event.preventDefault();
  setAttractorsActive(true);
});
window.addEventListener("keyup", (event) => {
  if (event.code !== "Space") return;
  world.spaceDown = false;
  event.preventDefault();
  setAttractorsActive(false);
});

resize();
startLevel(0, null);
showStartScreen();
requestAnimationFrame(loop);
