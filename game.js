const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const levelEl = document.getElementById("level");
const messageEl = document.getElementById("message");
const shellEl = document.querySelector(".shell");
const overlayEl = document.getElementById("overlay");
const overlayTitleEl = document.getElementById("overlay-title");
const overlayCopyEl = document.getElementById("overlay-copy");
const overlayFastCopyEl = document.getElementById("overlay-fast-copy");
const overlayPlannedCopyEl = document.getElementById("overlay-planned-copy");
const overlayActionEl = document.getElementById("overlay-action");
const overlaySecondaryEl = document.getElementById("overlay-secondary");
const levelSelectWrapEl = document.getElementById("level-select-wrap");
const levelSelectEl = document.getElementById("level-select");
const plannedControlsEl = document.getElementById("planned-controls");
const launchButton = document.getElementById("launch");
const radioToggleEl = document.getElementById("radio-toggle");
const radioNextEl = document.getElementById("radio-next");

const BACKGROUND_COUNT = 7;
const MAX_PARTICLE_SPEED = 12;
const MIN_CAPTURE_SPEED = 1.4;
const MIN_ATTRACTOR_RADIUS = 28;
const MAX_ATTRACTOR_RADIUS = 92;
const ATTRACTOR_SHRINK_SPEED = MAX_ATTRACTOR_RADIUS - MIN_ATTRACTOR_RADIUS;
const START_GRACE_MS = 1250;
const TOUCH_DEVICE = matchMedia("(pointer: coarse)").matches;
const MAX_RENDER_DPR = 1;
const RADIO_TRACKS = [
  {
    title: "Apogee",
    src: "https://raw.githubusercontent.com/jona-sassenhagen/kessleract/main/music/Kessleract%2BOST%2B-%2BApogee.MP3"
  },
  {
    title: "Dark Side Passage",
    src: "https://raw.githubusercontent.com/jona-sassenhagen/kessleract/main/music/Kessleract%2BOST%2B-%2BDark%2BSide%2BPassage.MP3"
  },
  {
    title: "Debris Forecast",
    src: "https://raw.githubusercontent.com/jona-sassenhagen/kessleract/main/music/Kessleract%2BOST%2B-%2BDebris%2BForecast.MP3"
  },
  {
    title: "Low Earth Window",
    src: "https://raw.githubusercontent.com/jona-sassenhagen/kessleract/main/music/Kessleract%2BOST%2B-%2BLow%2BEarth%2BWindow.MP3"
  }
];

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
    targetSpeed: 7.6,
    goal: { edge: "right", align: 0.32, length: 0.52 },
    obstacles: [
      { kind: "solid", x: 0.47, y: 0.34, width: 0.2, height: 18 },
      { kind: "destructible", breakSpeed: 6.4, x: 0.58, y: 0.63, width: 18, height: 0.24 }
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
    targetSpeed: 5.8,
    goal: { edge: "right", align: 0.5, length: 1.6, thickness: 1.18 },
    obstacles: [
      { kind: "solid", x: 0.82, y: 0.24, width: 0.1, height: 0.34 },
      { kind: "solid", x: 0.82, y: 0.76, width: 0.1, height: 0.34 }
    ]
  },
  {
    targetSpeed: 8.9,
    goal: { edge: "right", align: 0.18, length: 0.86, motion: { axis: "edge", center: 0.5, range: 0.34, speed: 0.72 } },
    obstacles: []
  },
  {
    targetSpeed: 5.9,
    goal: { edge: "left", align: 0.24, length: 0.7 },
    obstacles: [
      { kind: "destructible", breakSpeed: 4.2, x: 0.22, y: 0.28, width: 0.18, height: 18 },
      { kind: "solid", x: 0.36, y: 0.2, width: 18, height: 0.18 },
      { kind: "solid", x: 0.36, y: 0.42, width: 18, height: 0.18 }
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
    goal: { edge: "bottom", align: 0.42, length: 0.5 },
    obstacles: [
      { kind: "solid", x: 0.35, y: 0.44, width: 18, height: 0.3 },
      { kind: "destructible", breakSpeed: 7.6, x: 0.59, y: 0.36, width: 0.18, height: 18 },
      { kind: "solid", x: 0.24, y: 0.72, width: 0.16, height: 18 },
      { kind: "solid", x: 0.68, y: 0.72, width: 0.16, height: 18 }
    ]
  },
  {
    targetSpeed: 9.6,
    goal: { edge: "top", align: 0.5, length: 0.56, thickness: 1.22 },
    obstacles: [
      { kind: "destructible", breakSpeed: 6.8, x: 0.34, y: 0.32, width: 0.16, height: 18 },
      { kind: "solid", x: 0.48, y: 0.5, width: 0.18, height: 18 },
      { kind: "destructible", breakSpeed: 8.5, x: 0.58, y: 0.28, width: 18, height: 0.18 }
    ]
  },
  {
    targetSpeed: 10.6,
    goal: { edge: "right", align: 0.62, length: 0.42 },
    obstacles: [
      { kind: "solid", x: 0.4, y: 0.32, width: 18, height: 0.24 },
      { kind: "destructible", breakSpeed: 8.1, x: 0.54, y: 0.48, width: 0.16, height: 18 },
      { kind: "destructible", breakSpeed: 9.8, x: 0.66, y: 0.62, width: 18, height: 0.19 },
      { kind: "solid", x: 0.76, y: 0.72, width: 0.16, height: 18 },
      { kind: "solid", x: 0.86, y: 0.42, width: 18, height: 0.18 },
      { kind: "solid", x: 0.86, y: 0.82, width: 18, height: 0.18 }
    ]
  },
  {
    targetSpeed: 10.8,
    goal: { edge: "top", align: 0.34, length: 0.48 },
    obstacles: [
      { kind: "destructible", breakSpeed: 8.4, x: 0.36, y: 0.42, width: 0.18, height: 18 },
      { kind: "destructible", breakSpeed: 9.4, x: 0.62, y: 0.58, width: 18, height: 0.23 },
      { kind: "solid", x: 0.24, y: 0.2, width: 0.14, height: 18 },
      { kind: "solid", x: 0.58, y: 0.22, width: 0.14, height: 18 }
    ]
  },
  {
    targetSpeed: 11.2,
    goal: { edge: "bottom", align: 0.86, length: 0.36 },
    obstacles: [
      { kind: "solid", x: 0.33, y: 0.52, width: 0.2, height: 18 },
      { kind: "destructible", breakSpeed: 9.2, x: 0.55, y: 0.34, width: 18, height: 0.2 },
      { kind: "destructible", breakSpeed: 10.7, x: 0.65, y: 0.52, width: 0.14, height: 18 },
      { kind: "solid", x: 0.72, y: 0.62, width: 18, height: 0.22 },
      { kind: "destructible", breakSpeed: 11.0, x: 0.82, y: 0.78, width: 0.16, height: 18 }
    ]
  },
  {
    targetSpeed: 11.6,
    goal: { edge: "right", align: 0.45, length: 0.44, thickness: 1.28 },
    obstacles: [
      { kind: "destructible", breakSpeed: 8.9, x: 0.34, y: 0.34, width: 0.15, height: 18 },
      { kind: "destructible", breakSpeed: 10.2, x: 0.58, y: 0.5, width: 0.16, height: 18 },
      { kind: "solid", x: 0.7, y: 0.66, width: 0.16, height: 18 },
      { kind: "destructible", breakSpeed: 11.1, x: 0.6, y: 0.24, width: 18, height: 0.18 },
      { kind: "solid", x: 0.82, y: 0.28, width: 18, height: 0.18 }
    ]
  },
  {
    targetSpeed: 11.9,
    goal: { edge: "right", align: 0.5, length: 0.32, motion: { center: 0.5, range: 0.28, speed: 0.86 } },
    obstacles: [
      { kind: "solid", x: 0.36, y: 0.3, width: 0.18, height: 18 },
      { kind: "solid", x: 0.54, y: 0.55, width: 18, height: 0.26 },
      { kind: "destructible", breakSpeed: 10.6, x: 0.72, y: 0.38, width: 0.14, height: 18 },
      { kind: "destructible", breakSpeed: 11.4, x: 0.78, y: 0.66, width: 18, height: 0.18 },
      { kind: "solid", x: 0.25, y: 0.72, width: 0.16, height: 18 }
    ]
  },
  {
    targetSpeed: 12.0,
    goal: { edge: "top", align: 0.74, length: 0.5, thickness: 1.35 },
    obstacles: [
      { kind: "destructible", breakSpeed: 9.8, x: 0.32, y: 0.28, width: 18, height: 0.2 },
      { kind: "solid", x: 0.5, y: 0.48, width: 0.22, height: 18 },
      { kind: "destructible", breakSpeed: 11.2, x: 0.7, y: 0.7, width: 0.14, height: 18 },
      { kind: "destructible", breakSpeed: 11.7, x: 0.82, y: 0.44, width: 18, height: 0.18 },
      { kind: "destructible", breakSpeed: 11.4, x: 0.62, y: 0.2, width: 18, height: 0.15 },
      { kind: "solid", x: 0.3, y: 0.78, width: 18, height: 0.18 },
      { kind: "solid", x: 0.5, y: 0.22, width: 0.12, height: 18 },
      { kind: "solid", x: 0.86, y: 0.24, width: 0.12, height: 18 },
      { kind: "solid", x: 0.74, y: 0.09, width: 0.28, height: 0.1 }
    ]
  },
  {
    targetSpeed: 12.0,
    goal: { edge: "bottom", align: 0.24, length: 0.5, thickness: 1.38 },
    obstacles: [
      { kind: "destructible", breakSpeed: 10.4, x: 0.28, y: 0.34, width: 18, height: 0.2 },
      { kind: "solid", x: 0.47, y: 0.43, width: 0.16, height: 18 },
      { kind: "destructible", breakSpeed: 11.2, x: 0.6, y: 0.6, width: 18, height: 0.18 },
      { kind: "solid", x: 0.75, y: 0.32, width: 0.15, height: 18 },
      { kind: "destructible", breakSpeed: 11.7, x: 0.82, y: 0.74, width: 0.13, height: 18 },
      { kind: "destructible", breakSpeed: 11.5, x: 0.36, y: 0.78, width: 18, height: 0.15 },
      { kind: "solid", x: 0.18, y: 0.74, width: 0.12, height: 18 },
      { kind: "solid", x: 0.58, y: 0.82, width: 0.12, height: 18 },
      { kind: "solid", x: 0.24, y: 0.91, width: 0.28, height: 0.1 }
    ]
  },
  {
    targetSpeed: 12.0,
    goal: { edge: "right", align: 0.3, length: 0.5, thickness: 1.42 },
    obstacles: [
      { kind: "solid", x: 0.28, y: 0.3, width: 18, height: 0.22 },
      { kind: "destructible", breakSpeed: 10.8, x: 0.42, y: 0.48, width: 0.14, height: 18 },
      { kind: "solid", x: 0.58, y: 0.66, width: 18, height: 0.22 },
      { kind: "destructible", breakSpeed: 11.5, x: 0.68, y: 0.34, width: 0.13, height: 18 },
      { kind: "destructible", breakSpeed: 11.9, x: 0.8, y: 0.58, width: 18, height: 0.17 },
      { kind: "destructible", breakSpeed: 11.2, x: 0.53, y: 0.24, width: 18, height: 0.16 },
      { kind: "destructible", breakSpeed: 12.0, x: 0.86, y: 0.42, width: 0.11, height: 18 },
      { kind: "solid", x: 0.35, y: 0.76, width: 0.15, height: 18 },
      { kind: "solid", x: 0.9, y: 0.18, width: 18, height: 0.16 },
      { kind: "solid", x: 0.9, y: 0.54, width: 18, height: 0.16 },
      { kind: "solid", x: 0.78, y: 0.36, width: 0.12, height: 18 },
      { kind: "solid", x: 0.94, y: 0.3, width: 0.1, height: 0.28 }
    ]
  },
  {
    targetSpeed: 12.0,
    goal: { edge: "top", align: 0.18, length: 0.5, thickness: 1.45 },
    obstacles: [
      { kind: "destructible", breakSpeed: 10.7, x: 0.26, y: 0.27, width: 0.13, height: 18 },
      { kind: "solid", x: 0.42, y: 0.42, width: 18, height: 0.22 },
      { kind: "destructible", breakSpeed: 11.4, x: 0.58, y: 0.3, width: 0.13, height: 18 },
      { kind: "solid", x: 0.72, y: 0.5, width: 0.15, height: 18 },
      { kind: "destructible", breakSpeed: 11.8, x: 0.52, y: 0.72, width: 18, height: 0.18 },
      { kind: "destructible", breakSpeed: 12.0, x: 0.34, y: 0.62, width: 0.12, height: 18 },
      { kind: "destructible", breakSpeed: 11.2, x: 0.76, y: 0.26, width: 18, height: 0.16 },
      { kind: "solid", x: 0.82, y: 0.76, width: 18, height: 0.18 },
      { kind: "solid", x: 0.16, y: 0.22, width: 0.12, height: 18 },
      { kind: "solid", x: 0.48, y: 0.22, width: 0.12, height: 18 }
    ]
  },
  {
    targetSpeed: 12.0,
    goal: { edge: "bottom", align: 0.32, length: 0.82, thickness: 1.5 },
    obstacles: [
      { kind: "solid", x: 0.26, y: 0.34, width: 18, height: 0.2 },
      { kind: "destructible", breakSpeed: 10.9, x: 0.36, y: 0.22, width: 0.13, height: 18 },
      { kind: "destructible", breakSpeed: 11.6, x: 0.42, y: 0.46, width: 18, height: 0.17 },
      { kind: "solid", x: 0.32, y: 0.62, width: 0.14, height: 18 },
      { kind: "destructible", breakSpeed: 11.9, x: 0.24, y: 0.52, width: 0.12, height: 18 },
      { kind: "solid", x: 0.55, y: 0.72, width: 0.12, height: 0.18 },
      { kind: "destructible", breakSpeed: 11.3, x: 0.2, y: 0.4, width: 0.11, height: 18 },
      { kind: "destructible", breakSpeed: 12.0, x: 0.36, y: 0.58, width: 18, height: 0.15 },
      { kind: "solid", x: 0.2, y: 0.84, width: 0.26, height: 0.11 },
      { kind: "solid", x: 0.62, y: 0.84, width: 0.42, height: 0.11 }
    ]
  },
  {
    targetSpeed: 12.0,
    goal: { edge: "right", align: 0.58, length: 0.62, thickness: 1.55 },
    obstacles: [
      { kind: "destructible", breakSpeed: 10.8, x: 0.25, y: 0.25, width: 18, height: 0.18 },
      { kind: "solid", x: 0.38, y: 0.42, width: 0.14, height: 18 },
      { kind: "destructible", breakSpeed: 11.4, x: 0.52, y: 0.58, width: 18, height: 0.17 },
      { kind: "solid", x: 0.64, y: 0.28, width: 0.13, height: 18 },
      { kind: "destructible", breakSpeed: 11.8, x: 0.76, y: 0.46, width: 0.12, height: 18 },
      { kind: "destructible", breakSpeed: 12.0, x: 0.82, y: 0.72, width: 18, height: 0.16 },
      { kind: "destructible", breakSpeed: 11.6, x: 0.58, y: 0.82, width: 18, height: 0.15 },
      { kind: "destructible", breakSpeed: 12.0, x: 0.72, y: 0.52, width: 0.22, height: 0.13 },
      { kind: "solid", x: 0.32, y: 0.78, width: 0.13, height: 18 },
      { kind: "solid", x: 0.84, y: 0.32, width: 0.11, height: 0.34 },
      { kind: "solid", x: 0.84, y: 0.77, width: 0.11, height: 0.32 }
    ]
  },
  {
    targetSpeed: 12.0,
    goal: { edge: "top", align: 0.68, length: 0.68, thickness: 1.6 },
    obstacles: [
      { kind: "solid", x: 0.24, y: 0.28, width: 0.13, height: 18 },
      { kind: "destructible", breakSpeed: 11.0, x: 0.36, y: 0.46, width: 18, height: 0.16 },
      { kind: "destructible", breakSpeed: 11.5, x: 0.5, y: 0.26, width: 0.12, height: 18 },
      { kind: "solid", x: 0.62, y: 0.56, width: 18, height: 0.18 },
      { kind: "destructible", breakSpeed: 11.8, x: 0.74, y: 0.36, width: 0.12, height: 18 },
      { kind: "destructible", breakSpeed: 12.0, x: 0.86, y: 0.66, width: 0.12, height: 18 },
      { kind: "solid", x: 0.46, y: 0.8, width: 0.16, height: 18 },
      { kind: "destructible", breakSpeed: 11.4, x: 0.56, y: 0.34, width: 0.28, height: 0.13 },
      { kind: "destructible", breakSpeed: 12.0, x: 0.72, y: 0.74, width: 18, height: 0.14 },
      { kind: "solid", x: 0.9, y: 0.44, width: 0.1, height: 18 },
      { kind: "solid", x: 0.43, y: 0.16, width: 0.36, height: 0.11 },
      { kind: "solid", x: 0.88, y: 0.16, width: 0.26, height: 0.11 }
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
  enterDown: false,
  pendingRestartAt: 0,
  graceUntil: 0,
  runStartedAt: 0,
  losses: 0,
  hardLevel: 0,
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
  alive: true,
  capturedBy: null,
  orbitAngle: 0,
  orbitDirection: 1,
  orbitRadius: 42,
  speed: 2.03
};

const radio = {
  audio: new Audio(),
  trackIndex: 0,
  enabled: false,
  started: false
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

function speedColorAlpha(speed, alpha, lightBoost = 0) {
  const t = Math.max(0, Math.min(1, speed / MAX_PARTICLE_SPEED));
  const hue = 142 - t * 142;
  const light = Math.max(48, Math.min(74, 62 + t * 3 + lightBoost));
  return `hsl(${hue} 86% ${light}% / ${alpha})`;
}

function attractorColor(attractor, alpha = 1, lightBoost = 0) {
  const t = Math.max(0, Math.min(1, (attractor.radius - MIN_ATTRACTOR_RADIUS) / (MAX_ATTRACTOR_RADIUS - MIN_ATTRACTOR_RADIUS)));
  const hue = 142 - t * 142;
  const light = Math.max(48, Math.min(72, 60 + t * 4 + lightBoost));
  return `hsl(${hue} 92% ${light}% / ${alpha})`;
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
    const built = {
      kind: obstacle.kind || "solid",
      breakSpeed: obstacle.breakSpeed ? obstacle.breakSpeed + Math.floor(level.index / levelConfigs.length) * 0.6 : null,
      x: obstacle.x * world.width - width / 2,
      y: obstacle.y * world.height - height / 2,
      width,
      height,
      shape: makeObstacleShape(width, height, index)
    };
    return moveObstacleOutOfStartCorridor(built);
  });
}

function moveObstacleOutOfStartCorridor(obstacle) {
  const spawn = particleStartState();
  const graceFrames = START_GRACE_MS / (1000 / 60);
  const endX = spawn.x + Math.cos(spawn.angle) * spawn.speed * graceFrames;
  const endY = spawn.y + Math.sin(spawn.angle) * spawn.speed * graceFrames;
  const padding = Math.max(46, Math.min(world.width, world.height) * 0.13);
  const minX = Math.min(spawn.x, endX) - padding;
  const maxX = Math.max(spawn.x, endX) + padding;
  const minY = Math.min(spawn.y, endY) - padding;
  const maxY = Math.max(spawn.y, endY) + padding;

  if (
    obstacle.x + obstacle.width < minX ||
    obstacle.x > maxX ||
    obstacle.y + obstacle.height < minY ||
    obstacle.y > maxY
  ) {
    return obstacle;
  }

  const targetX = maxX + padding * 0.25;
  const targetY = minY - obstacle.height - padding * 0.2;
  const canMoveRight = targetX + obstacle.width < world.width - 24;
  obstacle.x = canMoveRight ? targetX : Math.max(24, obstacle.x);
  obstacle.y = canMoveRight ? obstacle.y : Math.max(24, targetY);
  return obstacle;
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
  particle.alive = true;
  particle.capturedBy = null;
  const start = particleStartState();
  particle.x = start.x;
  particle.y = start.y;
  const angle = start.angle;
  const speed = start.speed;
  particle.vx = Math.cos(angle) * speed;
  particle.vy = Math.sin(angle) * speed;
  particle.speed = speed;
}

function particleStartState() {
  return {
    x: Math.max(28, world.width * 0.16),
    y: Math.max(80, world.height * 0.66),
    angle: -0.22,
    speed: 2.05
  };
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
  world.graceUntil = 0;
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
  overlayFastCopyEl.textContent = "";
  overlayPlannedCopyEl.textContent = "";
  levelSelectWrapEl.hidden = true;
  overlayActionEl.textContent = primaryText;
  overlayActionEl.hidden = !primaryText;
  overlaySecondaryEl.textContent = secondaryText;
  overlaySecondaryEl.hidden = !secondaryText;
  overlaySecondaryEl.classList.toggle("secondary", Boolean(secondaryText));
}

function hideOverlay() {
  overlayEl.className = "overlay";
}

function setupRadio() {
  radio.audio.volume = 0.34;
  radio.audio.preload = "none";
  radio.audio.addEventListener("ended", playNextRadioTrack);
  radio.audio.addEventListener("error", playNextRadioTrack);
  updateRadioLabel();
}

function updateRadioLabel() {
  const track = RADIO_TRACKS[radio.trackIndex];
  radioToggleEl.setAttribute("aria-pressed", String(radio.enabled));
  radioToggleEl.querySelector("span").textContent = radio.enabled ? `Radio: ${track.title}` : "Radio off";
}

function loadRadioTrack(index) {
  radio.trackIndex = (index + RADIO_TRACKS.length) % RADIO_TRACKS.length;
  radio.audio.src = RADIO_TRACKS[radio.trackIndex].src;
  updateRadioLabel();
}

function playRadio() {
  if (!radio.audio.src) {
    loadRadioTrack(radio.trackIndex);
  }
  radio.enabled = true;
  radio.started = true;
  updateRadioLabel();
  radio.audio.play().catch(() => {
    radio.enabled = false;
    updateRadioLabel();
  });
}

function stopRadio() {
  radio.enabled = false;
  radio.audio.pause();
  updateRadioLabel();
}

function toggleRadio() {
  if (radio.enabled) {
    stopRadio();
  } else {
    playRadio();
  }
}

function playNextRadioTrack() {
  const wasEnabled = radio.enabled;
  loadRadioTrack(radio.trackIndex + 1);
  radio.started = true;
  radio.enabled = true;
  updateRadioLabel();
  radio.audio.play().catch(() => {
    radio.enabled = wasEnabled;
    updateRadioLabel();
  });
}

function startRadioAfterUserGesture() {
  if (!radio.started) {
    playRadio();
  }
}

function selectedStartLevel() {
  return Math.max(0, Math.min(levelConfigs.length - 1, Number(levelSelectEl.value) || 0));
}

function populateLevelSelector() {
  levelSelectEl.replaceChildren();
  for (let index = 0; index < levelConfigs.length; index += 1) {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = `Level ${index + 1}`;
    levelSelectEl.append(option);
  }
}

function attractorDecayMultiplier() {
  return 1.5 ** world.hardLevel;
}

function beginFastRun(startIndex = 0) {
  world.playStyle = "fast";
  world.mode = "playing";
  world.losses = 0;
  world.runStartedAt = performance.now();
  hideOverlay();
  plannedControlsEl.hidden = true;
  startLevel(startIndex);
  world.graceUntil = performance.now() + START_GRACE_MS;
}

function beginPlannedRun(startIndex = 0) {
  world.playStyle = "planned";
  world.mode = "planning";
  world.losses = 0;
  world.runStartedAt = performance.now();
  hideOverlay();
  startLevel(startIndex);
  showMessage("PLACE UP TO 5", 1200);
  syncPlannedControls();
}

function startFastGame() {
  startRadioAfterUserGesture();
  world.hardLevel = 0;
  beginFastRun(selectedStartLevel());
}

function startPlannedGame() {
  startRadioAfterUserGesture();
  world.hardLevel = 0;
  beginPlannedRun(selectedStartLevel());
}

function startHarderGame() {
  if (world.mode !== "complete") return;
  startRadioAfterUserGesture();
  world.hardLevel += 1;
  if (world.playStyle === "planned") {
    beginPlannedRun();
  } else {
    beginFastRun();
  }
  showMessage(`HARDER x${attractorDecayMultiplier().toFixed(2)}`, 1100);
}

function showStartScreen() {
  world.mode = "start";
  plannedControlsEl.hidden = true;
  showOverlay(
    "start",
    "Orbiter",
    "Guide the particle into the goal.",
    "Fast",
    "Planned"
  );
  populateLevelSelector();
  levelSelectWrapEl.hidden = false;
  overlayCopyEl.innerHTML = "Guide the particle into the goal.<br>Control direction and speed of the particle by capturing it into the orbit of <em>attractors</em>.<br>The speed of the particle is indicated by its color.<br>Obstacles and the goal advertise their robustness with their color; only if the speed of the particle matches or exceeds that of the obstacle or goal can it pass. Otherwise it is destroyed.<br>If the particle is destroyed or leaves the game screen without being caught by an attractor, the level restarts.";
  overlayFastCopyEl.textContent = "Fast mode: touch and hold anywhere on the playfield to create an attractor while the particle is already moving. Keep holding to pull the particle into orbit, then release to launch it toward the goal.";
  overlayPlannedCopyEl.textContent = "Planned mode: place up to five attractors before launch. Press Start or Enter to release the particle, then hold Space or press and hold anywhere on the playfield to turn all attractors on.";
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
    "Start again (harder)",
    ""
  );
}

function syncPlannedControls() {
  const planned = world.playStyle === "planned" && (world.mode === "planning" || world.mode === "playing");
  plannedControlsEl.hidden = !planned || world.mode !== "planning";
  launchButton.hidden = world.mode !== "planning";
}

function launchPlannedLevel() {
  if (world.playStyle !== "planned" || world.mode !== "planning") return;
  if (attractors.size === 0) {
    showMessage("PLACE ATTRACTOR", 900);
    return;
  }
  world.mode = "playing";
  world.attractorsActive = false;
  world.graceUntil = performance.now() + START_GRACE_MS;
  showMessage(`LEVEL ${level.index + 1}`, 700);
  syncPlannedControls();
}

function setAttractorsActive(active) {
  if (world.playStyle !== "planned" || world.mode !== "playing") return;
  if (world.attractorsActive === active) return;
  world.attractorsActive = active;

  if (!active && particle.capturedBy !== null) {
    const tangent = particle.orbitAngle + particle.orbitDirection * Math.PI / 2;
    particle.vx = Math.cos(tangent) * particle.speed;
    particle.vy = Math.sin(tangent) * particle.speed;
    particle.capturedBy = null;
  }

  if (!active) {
    shrinkAttractors();
  }
}

function shrinkAttractors() {
  for (const attractor of attractors.values()) {
    attractor.shrinking = true;
  }
}

function isAttractorActive(attractor) {
  if (world.playStyle === "planned") return world.attractorsActive;
  return !attractor.shrinking;
}

function pointerPosition(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
}

function addAttractor(event) {
  if (world.playStyle === "planned" && world.mode === "playing") {
    event.preventDefault();
    setAttractorsActive(true);
    return;
  }

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
    radius: MIN_ATTRACTOR_RADIUS,
    age: 0,
    pulse: 0
  });
}

function moveAttractor(event) {
  if (!attractors.has(event.pointerId)) return;
  event.preventDefault();
}

function releaseAttractor(event) {
  if (world.playStyle === "planned" && world.mode === "playing") {
    event.preventDefault();
    setAttractorsActive(false);
    return;
  }

  if (world.playStyle !== "fast") return;
  const attractor = attractors.get(event.pointerId);
  if (!attractor) return;

  if (particle.capturedBy === attractor.id) {
    const tangent = particle.orbitAngle + particle.orbitDirection * Math.PI / 2;
    particle.vx = Math.cos(tangent) * particle.speed;
    particle.vy = Math.sin(tangent) * particle.speed;
    particle.capturedBy = null;
  }

  attractor.shrinking = true;
}

function restartLevel(delay = 900) {
  if (world.mode !== "playing" || world.won || world.transitioning || performance.now() < world.pausedUntil) return;
  world.mode = "lost";
  world.losses += 1;
  world.pausedUntil = performance.now() + 650;
  world.pendingRestartAt = performance.now() + delay;
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

function obstacleImpactPoint(obstacle) {
  return {
    x: Math.max(obstacle.x, Math.min(particle.x, obstacle.x + obstacle.width)),
    y: Math.max(obstacle.y, Math.min(particle.y, obstacle.y + obstacle.height))
  };
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
    if (!isAttractorActive(attractor)) continue;
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

  destroyParticleAt({ x: particle.x, y: particle.y }, color, 18);
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
    startLevel(level.index + 1, null);
    if (world.playStyle === "planned") {
      world.mode = "planning";
      showMessage("PLACE UP TO 5", 900);
      syncPlannedControls();
    } else {
      world.graceUntil = performance.now() + START_GRACE_MS;
      showMessage(`LEVEL ${level.index + 1}`, 900);
    }
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

function crashIntoObstacle(obstacle) {
  const impact = obstacleImpactPoint(obstacle);
  const particleColor = speedColor(particle.speed);
  const obstacleColor = obstacle.kind === "destructible"
    ? speedColor(obstacle.breakSpeed)
    : "rgba(232, 242, 236, 0.92)";
  const impactAngle = Math.atan2(particle.vy, particle.vx);

  for (let index = 0; index < 28; index += 1) {
    const spread = (Math.random() - 0.5) * Math.PI * 1.35;
    const angle = impactAngle + Math.PI + spread;
    const force = 2.8 + Math.random() * 6.2 + particle.speed * 0.18;
    const size = 2.5 + Math.random() * 8;
    smashShards.push({
      x: impact.x + (Math.random() - 0.5) * particle.radius * 2,
      y: impact.y + (Math.random() - 0.5) * particle.radius * 2,
      width: size * (0.55 + Math.random() * 0.75),
      height: size * (0.35 + Math.random() * 0.55),
      vx: Math.cos(angle) * force + (Math.random() - 0.5) * 1.7,
      vy: Math.sin(angle) * force + (Math.random() - 0.5) * 1.7,
      rotation: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.58,
      color: index % 3 === 0 ? obstacleColor : particleColor,
      alpha: 1
    });
  }

  for (let index = 0; index < 10; index += 1) {
    const angle = impactAngle + (Math.random() - 0.5) * 0.9;
    const force = 1.2 + Math.random() * 3;
    smashShards.push({
      x: impact.x,
      y: impact.y,
      width: 10 + Math.random() * 16,
      height: 2 + Math.random() * 3,
      vx: Math.cos(angle) * force,
      vy: Math.sin(angle) * force,
      rotation: angle,
      spin: (Math.random() - 0.5) * 0.2,
      color: obstacleColor,
      alpha: 0.9
    });
  }

  particle.alive = false;
  particle.capturedBy = null;
  particleTrail.length = 0;
  showMessage("CRASH", 520);
}

function crashIntoGoal() {
  const impact = {
    x: Math.max(goal.x, Math.min(particle.x, goal.x + goal.width)),
    y: Math.max(goal.y, Math.min(particle.y, goal.y + goal.height))
  };
  destroyParticleAt(impact, speedColor(level.targetSpeed), 34);
  particleTrail.length = 0;
  showMessage("CRASH", 520);
}

function destroyParticleAt(impact, barrierColor, count) {
  const particleColor = speedColor(particle.speed);
  const impactAngle = Math.atan2(particle.vy, particle.vx);

  particle.alive = false;
  particle.capturedBy = null;

  for (let index = 0; index < count; index += 1) {
    const spread = (Math.random() - 0.5) * Math.PI * 1.45;
    const angle = impactAngle + Math.PI + spread;
    const force = 2.2 + Math.random() * 5.4 + particle.speed * 0.22;
    const size = 2.2 + Math.random() * 7;
    smashShards.push({
      x: impact.x + (Math.random() - 0.5) * particle.radius * 2,
      y: impact.y + (Math.random() - 0.5) * particle.radius * 2,
      width: size * (0.5 + Math.random() * 0.8),
      height: size * (0.35 + Math.random() * 0.6),
      vx: Math.cos(angle) * force + (Math.random() - 0.5) * 1.6,
      vy: Math.sin(angle) * force + (Math.random() - 0.5) * 1.6,
      rotation: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.62,
      color: index % 4 === 0 ? barrierColor : particleColor,
      alpha: 1
    });
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
  if (particle.alive) {
    particleTrail.push({
      x: particle.x,
      y: particle.y,
      radius: particle.radius,
      color: speedColor(particle.speed),
      alpha: world.fastRender ? 0.38 : 0.68
    });
  }

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
      } else {
        world.graceUntil = performance.now() + START_GRACE_MS;
      }
    }
    return;
  }

  if (world.mode !== "playing") {
    updateSmash(dt);
    return;
  }

  for (const attractor of attractors.values()) {
    const active = isAttractorActive(attractor);
    attractor.age += dt;
    if (active) {
      attractor.shrinking = false;
      attractor.radius = Math.min(MAX_ATTRACTOR_RADIUS, attractor.radius + dt * 21);
    } else if (attractor.shrinking) {
      attractor.radius = Math.max(MIN_ATTRACTOR_RADIUS, attractor.radius - dt * ATTRACTOR_SHRINK_SPEED * attractorDecayMultiplier());
      if (attractor.radius <= MIN_ATTRACTOR_RADIUS) {
        attractor.radius = MIN_ATTRACTOR_RADIUS;
        attractor.shrinking = false;
        if (world.playStyle === "fast") {
          attractors.delete(attractor.id);
        }
      }
    }
    attractor.pulse = Math.max(0, attractor.pulse - dt * 2.8);
  }

  updateSmash(dt);
  positionGoal();

  if (world.transitioning) {
    if (particle.alive) {
      particle.x += particle.vx * dt * 60;
      particle.y += particle.vy * dt * 60;
      particle.speed = Math.hypot(particle.vx, particle.vy);
    }
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

  const inGrace = performance.now() < world.graceUntil;

  if (goalHit()) {
    if (particle.speed >= level.targetSpeed) {
      smashGoal();
    } else if (!inGrace) {
      crashIntoGoal();
      restartLevel();
    }
    return;
  }

  const obstacle = inGrace ? null : obstacleHit();
  if (obstacle) {
    if (obstacle.kind === "destructible") {
      if (particle.speed >= obstacle.breakSpeed) {
        breakObstacle(obstacle);
      } else {
        crashIntoObstacle(obstacle);
        restartLevel(1100);
      }
    } else {
      crashIntoObstacle(obstacle);
      restartLevel(1100);
    }
    return;
  }

  if (!inGrace && particle.capturedBy === null && borderHit()) {
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
  const bodyColor = destructible ? speedColorAlpha(obstacle.breakSpeed, 0.28) : "rgba(216, 232, 223, 0.22)";
  const edgeColor = destructible ? speedColorAlpha(obstacle.breakSpeed, 0.96, 6) : "rgba(232, 242, 236, 0.88)";
  const coreColor = destructible ? speedColorAlpha(obstacle.breakSpeed, 0.9, 10) : "rgba(236, 247, 239, 0.92)";
  const shadowColor = destructible ? speedColorAlpha(obstacle.breakSpeed, 0.7, 8) : "rgba(216, 232, 223, 0.42)";
  ctx.save();
  ctx.translate(obstacle.x, obstacle.y);
  ctx.globalCompositeOperation = "lighter";

  ctx.shadowColor = shadowColor;
  ctx.shadowBlur = destructible ? 14 : 8;
  ctx.fillStyle = bodyColor;
  traceObstaclePath(obstacle);
  ctx.fill();

  ctx.shadowBlur = destructible ? 9 : 5;
  ctx.strokeStyle = edgeColor;
  ctx.lineWidth = Math.max(2, Math.min(4, Math.min(obstacle.width, obstacle.height) * 0.08));
  traceObstaclePath(obstacle);
  ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.globalCompositeOperation = "source-over";
  ctx.strokeStyle = "rgba(7, 17, 13, 0.62)";
  ctx.lineWidth = Math.max(1.5, Math.min(3, Math.min(obstacle.width, obstacle.height) * 0.055));
  traceObstaclePath(obstacle);
  ctx.stroke();

  drawObstacleAnchorNodes(obstacle, coreColor, destructible);
  ctx.restore();
}

function drawObstacleAnchorNodes(obstacle, color, destructible) {
  const points = obstacle.shape;
  const nodeRadius = Math.max(2.2, Math.min(4.2, Math.min(obstacle.width, obstacle.height) * 0.12));
  const selected = [
    points[0],
    points[Math.floor(points.length / 3)],
    points[Math.floor(points.length * 2 / 3)],
    points[points.length - 1]
  ];

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = destructible ? 8 : 5;
  for (const point of selected) {
    ctx.beginPath();
    ctx.arc(point.x, point.y, nodeRadius, 0, Math.PI * 2);
    ctx.fill();
  }
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
    const active = isAttractorActive(attractor);
    const phase = attractor.age * (active ? 2.7 : 1.4);
    const breathe = 0.5 + 0.5 * Math.sin(phase * 2.1);
    const glowColor = attractorColor(attractor, active ? 0.22 + breathe * 0.12 : 0.08);
    const ringColor = attractorColor(attractor, active ? 0.44 : 0.2, active ? 4 : -5);
    const coreColor = attractorColor(attractor, active ? 0.2 : 0.09);
    const arcColor = attractorColor(attractor, active ? 0.95 : 0.36, 8);

    ctx.save();
    ctx.translate(attractor.x, attractor.y);
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 1;
    drawAttractorOrbitBounds(attractor, phase);

    ctx.fillStyle = glowColor;
    ctx.beginPath();
    ctx.arc(0, 0, captureRadius + breathe * 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = ringColor;
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 10]);
    ctx.lineDashOffset = -phase * 16;
    ctx.beginPath();
    ctx.arc(0, 0, captureRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.lineDashOffset = 0;

    ctx.strokeStyle = arcColor;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    for (let i = 0; i < 3; i += 1) {
      const start = phase + i * Math.PI * 2 / 3;
      ctx.beginPath();
      ctx.arc(0, 0, attractor.radius + 3, start, start + 0.54 + breathe * 0.14);
      ctx.stroke();
    }
    ctx.lineCap = "butt";

    ctx.fillStyle = coreColor;
    ctx.beginPath();
    ctx.arc(0, 0, attractor.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = attractorColor(attractor, 0.78 + attractor.pulse * 0.16, 8);
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, attractor.radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = attractorColor(attractor, 1, 10);
    ctx.beginPath();
    ctx.arc(0, 0, 3 + breathe * 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawAttractorOrbitBounds(attractor, phase) {
  const minOrbitRadius = Math.max(26, MIN_ATTRACTOR_RADIUS * 1.35);
  const maxOrbitRadius = Math.max(26, MAX_ATTRACTOR_RADIUS * 1.35);
  const minColor = attractorColor({ radius: MIN_ATTRACTOR_RADIUS }, 0.24, -2);
  const maxColor = attractorColor({ radius: MAX_ATTRACTOR_RADIUS }, 0.26, 4);

  ctx.save();
  ctx.lineWidth = 1.3;
  ctx.setLineDash([3, 8]);
  ctx.lineDashOffset = -phase * 8;
  ctx.strokeStyle = minColor;
  ctx.beginPath();
  ctx.arc(0, 0, minOrbitRadius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.lineWidth = 1.7;
  ctx.setLineDash([9, 12]);
  ctx.lineDashOffset = phase * 10;
  ctx.strokeStyle = maxColor;
  ctx.beginPath();
  ctx.arc(0, 0, maxOrbitRadius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawParticleTrail() {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (let index = 0; index < particleTrail.length; index += 1) {
    const point = particleTrail[index];
    const taper = (index + 1) / particleTrail.length;
    ctx.globalAlpha = point.alpha * 0.62;
    ctx.fillStyle = point.color;
    ctx.beginPath();
    ctx.arc(point.x, point.y, point.radius * (1 + taper * 1.9), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawParticle() {
  if (!particle.alive) return;

  const color = speedColor(particle.speed);
  const motionAngle = Math.hypot(particle.vx, particle.vy) > 0.01 ? Math.atan2(particle.vy, particle.vx) : 0;
  const direction = particle.capturedBy !== null
    ? particle.orbitAngle + particle.orbitDirection * Math.PI / 2
    : motionAngle;
  const radius = particle.radius;
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

  ctx.save();
  ctx.translate(particle.x, particle.y);
  ctx.rotate(direction);

  ctx.globalAlpha = 0.1;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(-radius * 0.35, 0, radius * 5.8, radius * 3.8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.2;
  ctx.beginPath();
  ctx.ellipse(-radius * 0.2, 0, radius * 3.4, radius * 2.25, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 0.9;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(radius * 1.75, 0);
  ctx.bezierCurveTo(radius * 0.95, -radius * 1.25, -radius * 1.2, -radius * 1.25, -radius * 2.35, 0);
  ctx.bezierCurveTo(-radius * 1.2, radius * 1.25, radius * 0.95, radius * 1.25, radius * 1.75, 0);
  ctx.fill();

  ctx.globalAlpha = 0.88;
  ctx.fillStyle = "rgba(255, 255, 255, 0.88)";
  ctx.beginPath();
  ctx.ellipse(radius * 0.42, -radius * 0.34, radius * 0.44, radius * 0.26, -0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();

  if (particle.capturedBy === null) {
    ctx.globalAlpha = 0.42;
    ctx.strokeStyle = color;
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(particle.x, particle.y);
    ctx.lineTo(particle.x - particle.vx * 22, particle.y - particle.vy * 22);
    ctx.stroke();
    ctx.globalAlpha = 0.7;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(particle.x, particle.y);
    ctx.lineTo(particle.x - particle.vx * 13, particle.y - particle.vy * 13);
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
overlayActionEl.addEventListener("click", () => {
  if (world.mode === "complete") {
    startHarderGame();
  } else {
    startFastGame();
  }
});
overlaySecondaryEl.addEventListener("click", startPlannedGame);
launchButton.addEventListener("click", launchPlannedLevel);
radioToggleEl.addEventListener("click", toggleRadio);
radioNextEl.addEventListener("click", playNextRadioTrack);
window.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    if (world.spaceDown) return;
    world.spaceDown = true;
    event.preventDefault();
    setAttractorsActive(true);
  }

  if (event.code === "Enter") {
    if (world.enterDown) return;
    world.enterDown = true;
    event.preventDefault();
    launchPlannedLevel();
  }
});
window.addEventListener("keyup", (event) => {
  if (event.code === "Space") {
    world.spaceDown = false;
    event.preventDefault();
    setAttractorsActive(false);
  }

  if (event.code === "Enter") {
    world.enterDown = false;
    event.preventDefault();
  }
});

setupRadio();
resize();
startLevel(0, null);
showStartScreen();
requestAnimationFrame(loop);
