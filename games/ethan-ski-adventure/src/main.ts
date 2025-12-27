/**
 * SKI CHALLENGE PRO - Professional Level Graphics
 * Complete rewrite with advanced rendering techniques
 */

import * as THREE from 'three';

// New professional systems v3.0
import {
  createInstancedForest,
  createLODMountainRange,
  createInstancedRocks,
  updateLODs,
  updateTreeShader,
  updateEnvironmentLighting,
} from './instanced-environment';

import {
  createProceduralEnvMap,
  createAllMaterials,
  applyEnvMapToMaterials,
} from './materials';
import type { MaterialSet } from './materials';

import {
  createProPostProcessing,
  updatePostProcessing,
  resizePostProcessing,
} from './post-processing';
import type { ProPostProcessing } from './post-processing';

import {
  createAdvancedTerrainMaterial,
  updateTerrainShader,
} from './terrain-shader';

import {
  setupCompleteAtmosphere,
  updateAtmosphere,
} from './atmosphere';
import type { AtmosphereSystem } from './atmosphere';

// New terrain and lighting systems
import {
  generateHeightmap,
  createTerrainGeometry,
  getHeightAt,
  DEFAULT_TERRAIN_CONFIG,
  type TerrainConfig,
} from './terrain-generator';

import {
  LightingSystem,
  configureRendererForShadows,
  setupAlpineLighting,
  LIGHTING_PRESETS,
} from './lighting';

// Audio system
import {
  initAudio,
  startGameAudio,
  stopGameAudio,
  updateGameAudio,
  playGatePass,
  playGateMiss,
  playCountdownBeep,
  playStartSound,
  playFinishSound,
  playButtonClick,
  toggleMute,
  toggleMusic,
} from './audio-system';

// GLTF Asset Loader - Professional 3D Models
import {
  ensureAssetsLoaded,
  applyEnvironment,
  createSnowMaterial,
  type GameAssets,
  type LoadingProgress,
} from './gltf-loader';

// ==================== SUPABASE CONFIG ====================
const SUPABASE_URL = 'https://sxoofzxgqqfchjpwyxde.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4b29menhncXFmY2hqcHd5eGRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MTgyODEsImV4cCI6MjA4MDE5NDI4MX0.oS1hwD_uhYxOC-hcZtZCAwzgs_gsEBPCark2Gor_p6A';

// ==================== FULLSCREEN HELPER ====================
function toggleFullscreen(): void {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch((e) => {
      console.warn('Fullscreen not supported:', e);
    });
  } else {
    document.exitFullscreen();
  }
}

// Initialize fullscreen button
const fullscreenBtn = document.getElementById('fullscreen-btn');
if (fullscreenBtn) {
  fullscreenBtn.addEventListener('click', toggleFullscreen);
}

// ==================== SKI CHALLENGE STYLE CONFIG ====================
const GAME = {
  // Course - Inspired by real World Cup tracks
  COURSE_LENGTH: 8000,
  COURSE_WIDTH: 60,
  SLOPE_STEEPNESS: 22, // degrees - steeper for more speed

  // Gates - Professional slalom setup
  GATE_COUNT: 55,
  GATE_SPACING_MIN: 80,
  GATE_SPACING_MAX: 140,
  GATE_WIDTH: 10,
  GATE_OFFSET_MAX: 18,
  GATE_PENALTY_TIME: 2.0, // seconds added for missing gate
  GATE_SPEED_BOOST: 8.0, // km/h added for each gate passed (very noticeable boost)

  // Physics - FAST arcade feel
  MAX_SPEED: 250, // km/h - allows progressive speed increase from gate boosts
  ACCELERATION: 0.35, // 3x faster acceleration
  FRICTION: 0.001, // Less friction
  AIR_RESISTANCE: 0.00005, // Less air drag
  TURN_RATE: 0.065, // Faster turning
  CARVING_GRIP: 0.88,
  DRIFT_THRESHOLD: 0.6,
  EDGE_ANGLE_MAX: 50,
  TUCK_SPEED_BONUS: 1.25, // More tuck bonus

  // Camera - Broadcast TV style
  CAMERA_DISTANCE: 14,
  CAMERA_HEIGHT: 5,
  CAMERA_LAG: 0.06, // More responsive camera
  CAMERA_LOOK_AHEAD: 12,

  // Splits
  SPLIT_COUNT: 5,
};

const GRAPHICS = {
  // Alpine environment - Vibrant blue sky
  SKY_ZENITH: new THREE.Color(0x1e90ff),    // Deep sky blue
  SKY_HORIZON: new THREE.Color(0x87CEEB),   // Light sky blue
  SUN_COLOR: new THREE.Color(0xfffaf0),     // Warm white sun

  // Snow - Bright white with contrast
  SNOW_COLOR: new THREE.Color(0xffffff),
  SNOW_SHADOW: new THREE.Color(0x9eb8d9),  // More blue shadows for contrast
  SNOW_SPARKLE: new THREE.Color(0xffffff),

  // Course markings
  GATE_RED: new THREE.Color(0xe53935),
  GATE_BLUE: new THREE.Color(0x1e88e5),
  COURSE_LINE_COLOR: new THREE.Color(0x2196f3),

  // Fog for depth - matches sky horizon
  FOG_COLOR: new THREE.Color(0xc8e0f8),
  FOG_NEAR: 500,
  FOG_FAR: 2500,

  // Post-processing
  BLOOM_STRENGTH: 0.25,
  BLOOM_RADIUS: 0.4,
  BLOOM_THRESHOLD: 0.95,
};

// ==================== GAME STATE ====================
interface Split {
  distance: number;
  time: number | null;
  passed: boolean;
}

interface Gate {
  position: THREE.Vector3;
  leftPole: THREE.Mesh;
  rightPole: THREE.Mesh;
  panel: THREE.Mesh;
  isRed: boolean;
  passed: boolean;
  missed: boolean;
}

interface GameState {
  phase: 'title' | 'countdown' | 'racing' | 'celebrating' | 'finished';
  time: number;
  speed: number;
  maxSpeed: number;
  distance: number;
  penalties: number;
  gatesPassed: number;
  gatesMissed: number;
  splits: Split[];

  // Physics state
  velocity: THREE.Vector3;
  lateralSpeed: number;
  edgeAngle: number;
  isTucking: boolean;
  isCarving: boolean;
  isDrifting: boolean;
  gateSpeedBonus: number; // Cumulative speed bonus from passing gates

  // Input
  input: {
    left: boolean;
    right: boolean;
    tuck: boolean;
  };

  // Timing
  countdownValue: number;
  lastGateIndex: number;
}

const state: GameState = {
  phase: 'title',
  time: 0,
  speed: 0,
  maxSpeed: 0,
  distance: 0,
  penalties: 0,
  gatesPassed: 0,
  gatesMissed: 0,
  splits: [],

  velocity: new THREE.Vector3(),
  lateralSpeed: 0,
  edgeAngle: 0,
  isTucking: false,
  isCarving: false,
  isDrifting: false,
  gateSpeedBonus: 0, // Cumulative speed bonus from gates - acts as minimum speed floor

  input: { left: false, right: false, tuck: false },

  countdownValue: 3,
  lastGateIndex: -1,
};

// Initialize splits
for (let i = 0; i < GAME.SPLIT_COUNT; i++) {
  state.splits.push({
    distance: ((i + 1) / (GAME.SPLIT_COUNT + 1)) * GAME.COURSE_LENGTH,
    time: null,
    passed: false,
  });
}

// ==================== LEADERBOARD SYSTEM ====================

interface LeaderboardEntry {
  name: string;
  time: number; // Total time including penalties
  date: string;
}

const MAX_LEADERBOARD_ENTRIES = 10;

// Cache pour éviter les appels répétés
let leaderboardCache: LeaderboardEntry[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 5000; // 5 secondes

async function loadLeaderboard(): Promise<LeaderboardEntry[]> {
  // Retourner le cache si récent
  if (Date.now() - lastFetchTime < CACHE_DURATION && leaderboardCache.length > 0) {
    return leaderboardCache;
  }

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/ski_leaderboard?select=name,time,date&order=time.asc&limit=${MAX_LEADERBOARD_ENTRIES}`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    leaderboardCache = data;
    lastFetchTime = Date.now();
    return data;
  } catch (e) {
    console.warn('Could not load leaderboard from Supabase:', e);
    return leaderboardCache; // Retourner le cache en cas d'erreur
  }
}

async function isNewRecord(totalTime: number): Promise<boolean> {
  const leaderboard = await loadLeaderboard();
  if (leaderboard.length < MAX_LEADERBOARD_ENTRIES) {
    return true;
  }
  // Vérifier si ce temps bat un record existant
  return leaderboard.some(entry => totalTime < entry.time);
}

function getLeaderboardPosition(totalTime: number): number {
  let position = 1;
  for (const entry of leaderboardCache) {
    if (totalTime >= entry.time) {
      position++;
    }
  }
  return position;
}

async function addToLeaderboard(name: string, totalTime: number): Promise<LeaderboardEntry[]> {
  const newEntry = {
    name: (name.trim() || 'Anonyme').substring(0, 15),
    time: totalTime,
    date: new Date().toLocaleDateString('fr-FR'),
  };

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/ski_leaderboard`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify(newEntry),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    // Invalider le cache et recharger
    lastFetchTime = 0;
    return await loadLeaderboard();
  } catch (e) {
    console.warn('Could not save to Supabase leaderboard:', e);
    // Ajouter localement au cache en cas d'erreur
    leaderboardCache.push(newEntry);
    leaderboardCache.sort((a, b) => a.time - b.time);
    leaderboardCache = leaderboardCache.slice(0, MAX_LEADERBOARD_ENTRIES);
    return leaderboardCache;
  }
}

// ==================== THREE.JS SETUP ====================
const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: false, // Using SMAA post-process instead
  powerPreference: 'high-performance',
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;  // Réduit pour meilleure fidélité des couleurs

const camera = new THREE.PerspectiveCamera(
  50, // Narrower FOV for broadcast feel
  window.innerWidth / window.innerHeight,
  0.1,
  2500
);

// ==================== PROFESSIONAL SYSTEMS ====================
let postProcess: ProPostProcessing;
let atmosphere: AtmosphereSystem;
let lodMountains: THREE.LOD[] = [];
let materials: MaterialSet;
let envMap: THREE.CubeTexture;

// New v3.0 systems
let heightmapData: Float32Array | null = null;
let lightingSystem: LightingSystem;
let terrainConfig: TerrainConfig;

// GLTF Assets v4.0 - Professional 3D Models
let gameAssets: GameAssets | null = null;

// ==================== LIGHTING ====================
function setupLighting() {
  // Configure renderer for high-quality shadows
  configureRendererForShadows(renderer);

  // Create professional lighting system with 4K shadows
  lightingSystem = setupAlpineLighting(scene);

  // Optionally apply a preset (noon, goldenMorning, goldenEvening, overcast, blueHour)
  // lightingSystem.applyPreset('goldenMorning');

  console.log('  ✓ 4K Shadow Mapping enabled');
}

// ==================== TERRAIN ====================
let terrain: THREE.Mesh;
let terrainMaterial: THREE.ShaderMaterial;

function createTerrain() {
  // Configure terrain with new heightmap generator
  terrainConfig = {
    ...DEFAULT_TERRAIN_CONFIG,
    width: GAME.COURSE_WIDTH * 6,
    length: GAME.COURSE_LENGTH * 1.3,
    segmentsX: 256,
    segmentsZ: 512,
    slopeAngle: GAME.SLOPE_STEEPNESS,
    courseWidth: GAME.COURSE_WIDTH,
    maxElevation: 150,
  };

  // Generate ImprovedNoise heightmap (multi-octave Perlin)
  heightmapData = generateHeightmap(terrainConfig);

  // Create geometry from heightmap
  const geo = createTerrainGeometry(heightmapData, terrainConfig);

  // Use advanced terrain shader
  terrainMaterial = createAdvancedTerrainMaterial(GAME.COURSE_WIDTH);

  terrain = new THREE.Mesh(geo, terrainMaterial);
  terrain.receiveShadow = true;
  terrain.castShadow = false;

  // Position terrain so course starts at origin
  // Skier moves toward -Z, so terrain must be in -Z direction
  terrain.position.set(0, 0, -terrainConfig.length / 2);

  scene.add(terrain);
}

// ==================== OLYMPIC START PODIUM ====================
let startPodium: THREE.Group;

function createStartPodium() {
  startPodium = new THREE.Group();

  // Get terrain height at start position
  const startTerrainY = heightmapData && terrainConfig
    ? getHeightAt(0, 0, heightmapData, terrainConfig)
    : 0;

  // ===== 1. Start Platform (elevated ramp) =====
  const platformMat = new THREE.MeshStandardMaterial({
    color: 0x2d4a6f,  // Dark blue
    roughness: 0.7,
    metalness: 0.3,
  });
  const platformAccentMat = new THREE.MeshStandardMaterial({
    color: 0xf0f0f0,  // White
    roughness: 0.5,
  });

  // Main platform deck
  const platformWidth = 6;
  const platformLength = 8;
  const platformHeight = 0.4;
  const platform = new THREE.Mesh(
    new THREE.BoxGeometry(platformWidth, platformHeight, platformLength),
    platformMat
  );
  platform.position.set(0, startTerrainY + platformHeight / 2 + 0.8, 2);
  platform.receiveShadow = true;
  platform.castShadow = true;
  startPodium.add(platform);

  // Ramp going down from platform
  const rampGeo = new THREE.BoxGeometry(platformWidth - 0.5, 0.15, 4);
  const ramp = new THREE.Mesh(rampGeo, platformAccentMat);
  ramp.position.set(0, startTerrainY + 0.5, -1);
  ramp.rotation.x = Math.PI * 0.08; // Slight downward angle
  ramp.receiveShadow = true;
  startPodium.add(ramp);

  // ===== 2. Olympic Timing Gate Portal =====
  const gateMat = new THREE.MeshStandardMaterial({
    color: 0xe53935,  // Olympic red
    roughness: 0.3,
    metalness: 0.5,
    emissive: 0xe53935,
    emissiveIntensity: 0.1,
  });
  const gateAccentMat = new THREE.MeshStandardMaterial({
    color: 0xffd700,  // Gold accents
    roughness: 0.2,
    metalness: 0.8,
  });

  const gateHeight = 4.5;
  const gateWidth = 5;
  const poleRadius = 0.15;

  // Left pole
  const leftPole = new THREE.Mesh(
    new THREE.CylinderGeometry(poleRadius, poleRadius * 1.2, gateHeight, 12),
    gateMat
  );
  leftPole.position.set(-gateWidth / 2, startTerrainY + gateHeight / 2 + 0.8, 0);
  leftPole.castShadow = true;
  startPodium.add(leftPole);

  // Right pole
  const rightPole = new THREE.Mesh(
    new THREE.CylinderGeometry(poleRadius, poleRadius * 1.2, gateHeight, 12),
    gateMat
  );
  rightPole.position.set(gateWidth / 2, startTerrainY + gateHeight / 2 + 0.8, 0);
  rightPole.castShadow = true;
  startPodium.add(rightPole);

  // Top crossbar
  const crossbar = new THREE.Mesh(
    new THREE.BoxGeometry(gateWidth + 0.4, 0.35, 0.35),
    gateMat
  );
  crossbar.position.set(0, startTerrainY + gateHeight + 0.8, 0);
  crossbar.castShadow = true;
  startPodium.add(crossbar);

  // Timing display panel on crossbar
  const displayMat = new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.1,
    metalness: 0.9,
  });
  const display = new THREE.Mesh(
    new THREE.BoxGeometry(2.5, 0.6, 0.15),
    displayMat
  );
  display.position.set(0, startTerrainY + gateHeight + 0.3, 0.25);
  startPodium.add(display);

  // "START" text indicator (colored bar)
  const startIndicator = new THREE.Mesh(
    new THREE.BoxGeometry(2.3, 0.1, 0.02),
    new THREE.MeshStandardMaterial({
      color: 0x00ff00,
      emissive: 0x00ff00,
      emissiveIntensity: 0.5,
    })
  );
  startIndicator.position.set(0, startTerrainY + gateHeight + 0.3, 0.34);
  startPodium.add(startIndicator);

  // ===== 3. Side Barriers =====
  const barrierMat = new THREE.MeshStandardMaterial({
    color: 0x1565c0,  // Blue barriers
    roughness: 0.6,
  });
  const barrierWhiteMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.5,
  });

  [-1, 1].forEach(side => {
    // Barrier posts
    for (let i = 0; i < 4; i++) {
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.08, 1.2, 8),
        barrierMat
      );
      post.position.set(
        side * (platformWidth / 2 + 0.3),
        startTerrainY + 1.4,
        3 - i * 1.5
      );
      post.castShadow = true;
      startPodium.add(post);
    }

    // Horizontal rails
    const rail = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 5, 8),
      barrierWhiteMat
    );
    rail.rotation.z = Math.PI / 2;
    rail.rotation.y = Math.PI / 2;
    rail.position.set(side * (platformWidth / 2 + 0.3), startTerrainY + 1.8, 0.75);
    startPodium.add(rail);
  });

  // ===== 4. Start Hut (small shelter) =====
  const hutMat = new THREE.MeshStandardMaterial({
    color: 0x5d4037,  // Wood brown
    roughness: 0.8,
  });
  const hutRoofMat = new THREE.MeshStandardMaterial({
    color: 0x424242,  // Dark gray roof
    roughness: 0.6,
  });

  // Hut structure (right side)
  const hut = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2.5, 2),
    hutMat
  );
  hut.position.set(5, startTerrainY + 2.05, 2);
  hut.castShadow = true;
  hut.receiveShadow = true;
  startPodium.add(hut);

  // Hut roof
  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(1.8, 1.2, 4),
    hutRoofMat
  );
  roof.position.set(5, startTerrainY + 3.9, 2);
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;
  startPodium.add(roof);

  // ===== 5. Olympic Rings (decorative) =====
  const ringColors = [0x0081C8, 0x000000, 0xEE334E, 0xFCB131, 0x00A651];
  const ringRadius = 0.3;

  ringColors.forEach((color, i) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(ringRadius, 0.04, 8, 24),
      new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.3,
        metalness: 0.6,
      })
    );
    // Position rings in Olympic pattern
    const row = i < 3 ? 0 : 1;
    const col = i < 3 ? i : i - 3;
    ring.position.set(
      -0.8 + col * 0.7 + (row * 0.35),
      startTerrainY + gateHeight + 0.9 - row * 0.5,
      -0.2
    );
    startPodium.add(ring);
  });

  // ===== 6. Number display "1" for first racer =====
  const numberMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.4,
  });
  const numberBg = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 1, 0.1),
    new THREE.MeshStandardMaterial({ color: 0xe53935 })
  );
  numberBg.position.set(-5, startTerrainY + 2, 2);
  startPodium.add(numberBg);

  // "1" shape using simple geometry
  const one = new THREE.Mesh(
    new THREE.BoxGeometry(0.15, 0.7, 0.05),
    numberMat
  );
  one.position.set(-5, startTerrainY + 2, 2.08);
  startPodium.add(one);

  scene.add(startPodium);
  console.log('  ✓ Olympic Start Podium');
}

// ==================== COURSE BOUNDARY MARKERS ====================
function createSafetyNets() {
  // Simple boundary poles instead of confusing large nets
  const poleMaterial = new THREE.MeshStandardMaterial({
    color: 0xff6b35, // Orange
    roughness: 0.5,
    metalness: 0.2,
    emissive: 0xff6b35,
    emissiveIntensity: 0.1,
  });

  const stripeMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff, // White stripes
    roughness: 0.6,
  });

  const slopeAngle = GAME.SLOPE_STEEPNESS;

  // Create simple boundary poles every 100m (less cluttered)
  for (let z = 100; z < GAME.COURSE_LENGTH; z += 100) {
    const slopeY = -z * Math.tan(THREE.MathUtils.degToRad(slopeAngle)) * 0.5;

    [-1, 1].forEach(side => {
      const x = side * (GAME.COURSE_WIDTH / 2 + 1);

      // Main pole - taller and more visible
      const poleHeight = 2.0;
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.1, poleHeight, 8),
        poleMaterial
      );
      pole.position.set(x, slopeY + poleHeight / 2, -z);
      pole.castShadow = true;
      scene.add(pole);

      // Top stripe for visibility
      const stripe = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.11, 0.3, 8),
        stripeMaterial
      );
      stripe.position.set(x, slopeY + poleHeight - 0.15, -z);
      scene.add(stripe);
    });
  }
}

function createCourseMarkers() {
  const markerMaterial = new THREE.MeshStandardMaterial({
    color: 0x2196f3,
    emissive: 0x1565c0,
    emissiveIntensity: 0.3,
    roughness: 0.5,
  });

  const slopeAngle = GAME.SLOPE_STEEPNESS;

  // Blue course boundary markers
  for (let z = 50; z < GAME.COURSE_LENGTH; z += 30) {
    const slopeY = -z * Math.tan(THREE.MathUtils.degToRad(slopeAngle)) * 0.5;

    [-1, 1].forEach(side => {
      const x = side * (GAME.COURSE_WIDTH / 2 - 1);

      const marker = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.1, 0.8, 6),
        markerMaterial
      );
      marker.position.set(x, slopeY + 0.4, -z);
      marker.castShadow = true;
      scene.add(marker);
    });
  }
}

// ==================== GATES (SLALOM) ====================
const gates: Gate[] = [];

function createGates() {
  gates.forEach(g => {
    scene.remove(g.leftPole);
    scene.remove(g.rightPole);
    scene.remove(g.panel);
  });
  gates.length = 0;

  let currentZ = 100;
  let lastOffset = 0;
  let gateIndex = 0;

  // Place gates until 150m before the finish line
  const finishBuffer = 150;
  while (currentZ < GAME.COURSE_LENGTH - finishBuffer) {
    const isRed = gateIndex % 2 === 0;
    const color = isRed ? GRAPHICS.GATE_RED : GRAPHICS.GATE_BLUE;

    // Alternating gate positions (slalom style)
    const direction = gateIndex % 2 === 0 ? 1 : -1;
    const offset = direction * (GAME.GATE_OFFSET_MAX * 0.5 + Math.random() * GAME.GATE_OFFSET_MAX * 0.5);

    // Prevent too abrupt changes
    const smoothOffset = lastOffset * 0.3 + offset * 0.7;
    lastOffset = smoothOffset;

    // Get actual terrain height at gate position from heightmap
    const terrainY = heightmapData && terrainConfig
      ? getHeightAt(smoothOffset, currentZ, heightmapData, terrainConfig)
      : 0;

    // Gate poles
    const poleMat = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.4,
      emissive: color,
      emissiveIntensity: 0.1,
    });

    const poleHeight = 3.0; // Taller poles for better visibility
    const leftX = smoothOffset - GAME.GATE_WIDTH / 2;
    const rightX = smoothOffset + GAME.GATE_WIDTH / 2;

    // Much thicker poles for visibility (0.12-0.16 radius instead of 0.04-0.06)
    const leftPole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.16, poleHeight, 12),
      poleMat
    );
    leftPole.position.set(leftX, terrainY + poleHeight / 2, -currentZ);
    leftPole.castShadow = true;
    scene.add(leftPole);

    const rightPole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.16, poleHeight, 12),
      poleMat
    );
    rightPole.position.set(rightX, terrainY + poleHeight / 2, -currentZ);
    rightPole.castShadow = true;
    scene.add(rightPole);

    // Larger, more visible flag/panel (1.2x0.8 instead of 0.6x0.4)
    const panelMat = new THREE.MeshStandardMaterial({
      color: color,
      side: THREE.DoubleSide,
      roughness: 0.5,
      emissive: color,
      emissiveIntensity: 0.15, // Slight glow for visibility
    });
    const panel = new THREE.Mesh(
      new THREE.PlaneGeometry(1.2, 0.8),
      panelMat
    );
    const outerPoleX = Math.abs(leftX) > Math.abs(rightX) ? leftX : rightX;
    panel.position.set(
      outerPoleX + (outerPoleX > 0 ? 0.6 : -0.6),
      terrainY + poleHeight - 0.5,
      -currentZ
    );
    scene.add(panel);

    gates.push({
      position: new THREE.Vector3(smoothOffset, terrainY, -currentZ),
      leftPole,
      rightPole,
      panel,
      isRed,
      passed: false,
      missed: false,
    });

    currentZ += GAME.GATE_SPACING_MIN + Math.random() * (GAME.GATE_SPACING_MAX - GAME.GATE_SPACING_MIN);
    gateIndex++;
  }

  // Update gate count for UI
  console.log(`  ✓ ${gates.length} gates created`);
}

// ==================== OLYMPIC FINISH ARENA ====================
interface Spectator {
  group: THREE.Group;
  baseY: number;
  armLeft: THREE.Mesh;
  armRight: THREE.Mesh;
  flag?: THREE.Group;
  phase: number;
  hasFlag: boolean;
}

let spectators: Spectator[] = [];
let finishArena: THREE.Group;
let confettiParticles: THREE.Points | null = null;
let confettiVelocities: Float32Array | null = null;

function createOlympicFinishArena() {
  spectators = [];
  finishArena = new THREE.Group();

  const finishZ = GAME.COURSE_LENGTH;
  const finishTerrainY = heightmapData && terrainConfig
    ? getHeightAt(0, finishZ, heightmapData, terrainConfig)
    : 0;

  // ===== MATERIALS =====
  const standMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.8 });
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x7f8c8d, roughness: 0.3, metalness: 0.7 });
  const redMat = new THREE.MeshStandardMaterial({ color: 0xe74c3c, roughness: 0.6 });
  const blueMat = new THREE.MeshStandardMaterial({ color: 0x3498db, roughness: 0.6 });
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xecf0f1, roughness: 0.5 });

  // Spectator jacket colors - Olympic/winter sports theme
  const jacketColors = [
    0xe74c3c, 0x3498db, 0xf39c12, 0x27ae60, 0x9b59b6,
    0x1abc9c, 0xe91e63, 0x00bcd4, 0xff5722, 0x8bc34a,
  ];

  // Country flag colors for flags
  const flagColors = [
    { main: 0xff0000, accent: 0xffffff }, // Switzerland
    { main: 0x0055a4, accent: 0xffffff }, // France
    { main: 0x000000, accent: 0xffcc00 }, // Germany
    { main: 0x009246, accent: 0xffffff }, // Italy
    { main: 0xed2939, accent: 0xffffff }, // Austria
    { main: 0x002868, accent: 0xbf0a30 }, // USA
    { main: 0xff0000, accent: 0xffffff }, // Canada
    { main: 0x012169, accent: 0xffffff }, // Norway
  ];

  // ===== HELPER: Create single spectator =====
  function createSpectator(x: number, y: number, z: number, colorIdx: number, withFlag: boolean): Spectator {
    const group = new THREE.Group();
    const scale = 0.8 + Math.random() * 0.25;
    const height = 1.6 * scale;

    const jacketMat = new THREE.MeshStandardMaterial({
      color: jacketColors[colorIdx % jacketColors.length],
      roughness: 0.7,
    });

    // Body
    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.2 * scale, height * 0.35, 4, 8),
      jacketMat
    );
    body.position.y = height * 0.4;
    group.add(body);

    // Head
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.14 * scale, 8, 6),
      new THREE.MeshStandardMaterial({ color: 0xffdbac, roughness: 0.6 })
    );
    head.position.y = height * 0.7;
    group.add(head);

    // Hat/Beanie
    const hat = new THREE.Mesh(
      new THREE.SphereGeometry(0.16 * scale, 8, 6),
      new THREE.MeshStandardMaterial({
        color: Math.random() > 0.5 ? 0x222222 : jacketColors[(colorIdx + 4) % jacketColors.length],
        roughness: 0.8,
      })
    );
    hat.scale.set(1, 0.6, 1);
    hat.position.y = height * 0.78;
    group.add(hat);

    // Arms
    const armGeo = new THREE.CapsuleGeometry(0.05 * scale, 0.35 * scale, 4, 6);
    const armLeft = new THREE.Mesh(armGeo, jacketMat);
    armLeft.position.set(-0.25 * scale, height * 0.5, 0);
    armLeft.rotation.z = 0.4;
    group.add(armLeft);

    const armRight = new THREE.Mesh(armGeo, jacketMat);
    armRight.position.set(0.25 * scale, height * 0.5, 0);
    armRight.rotation.z = -0.4;
    group.add(armRight);

    // Flag (for some spectators)
    let flag: THREE.Group | undefined;
    if (withFlag) {
      flag = new THREE.Group();
      const flagColor = flagColors[Math.floor(Math.random() * flagColors.length)];

      // Pole
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.015, 0.8, 6),
        new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.7 })
      );
      pole.position.y = 0.4;
      flag.add(pole);

      // Flag cloth
      const flagCloth = new THREE.Mesh(
        new THREE.PlaneGeometry(0.4, 0.25),
        new THREE.MeshStandardMaterial({
          color: flagColor.main,
          side: THREE.DoubleSide,
          roughness: 0.8,
        })
      );
      flagCloth.position.set(0.22, 0.7, 0);
      flag.add(flagCloth);

      // Flag stripe
      const stripe = new THREE.Mesh(
        new THREE.PlaneGeometry(0.4, 0.08),
        new THREE.MeshStandardMaterial({
          color: flagColor.accent,
          side: THREE.DoubleSide,
          roughness: 0.8,
        })
      );
      stripe.position.set(0.22, 0.7, 0.01);
      flag.add(stripe);

      flag.position.set(0.3 * scale, height * 0.5, 0);
      group.add(flag);
    }

    group.position.set(x, y, -z);
    group.rotation.y = (Math.random() - 0.5) * 0.3;

    return {
      group,
      baseY: y,
      armLeft,
      armRight,
      flag,
      phase: Math.random() * Math.PI * 2,
      hasFlag: withFlag,
    };
  }

  // ===== GRANDSTANDS (Tribunes) =====
  [-1, 1].forEach(side => {
    const standGroup = new THREE.Group();
    const standX = side * (GAME.COURSE_WIDTH / 2 + 12);

    // Tiered seating structure - 5 rows
    for (let row = 0; row < 5; row++) {
      const rowY = finishTerrainY + row * 1.2 + 0.5;
      const rowX = standX + side * row * 0.8;
      const rowDepth = 25; // Length along Z axis

      // Seating platform
      const platform = new THREE.Mesh(
        new THREE.BoxGeometry(3, 0.3, rowDepth),
        standMat
      );
      platform.position.set(rowX, rowY, -finishZ + 5);
      platform.receiveShadow = true;
      standGroup.add(platform);

      // Back support
      if (row === 4) {
        const backWall = new THREE.Mesh(
          new THREE.BoxGeometry(0.2, 6, rowDepth),
          standMat
        );
        backWall.position.set(rowX + side * 1.6, rowY + 2.5, -finishZ + 5);
        standGroup.add(backWall);
      }

      // Add spectators on this row
      const spectatorsPerRow = 20;
      for (let i = 0; i < spectatorsPerRow; i++) {
        const specX = rowX + (Math.random() - 0.5) * 2;
        const specZ = finishZ - 7 + i * 1.2 + (Math.random() - 0.5) * 0.3;
        const specY = rowY + 0.15;

        // More flags in front rows
        const hasFlag = Math.random() < (0.4 - row * 0.05);

        const spec = createSpectator(specX, specY, specZ, row * spectatorsPerRow + i, hasFlag);
        // Face toward the track
        spec.group.rotation.y = -side * Math.PI / 2 + (Math.random() - 0.5) * 0.3;
        spectators.push(spec);
        standGroup.add(spec.group);
      }
    }

    // Front barrier/railing
    const railing = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 1, 25),
      metalMat
    );
    railing.position.set(standX - side * 0.5, finishTerrainY + 1, -finishZ + 5);
    standGroup.add(railing);

    // Sponsor banners on grandstand
    const bannerColors = [redMat, blueMat, whiteMat];
    for (let b = 0; b < 3; b++) {
      const banner = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 1.5, 7),
        bannerColors[b]
      );
      banner.position.set(standX - side * 0.6, finishTerrainY + 0.8, -finishZ + 2 - b * 8);
      standGroup.add(banner);
    }

    finishArena.add(standGroup);
  });

  // ===== FINISH CORRAL - Dense crowd at finish =====
  // Behind finish line - the "hot zone"
  for (let row = 0; row < 3; row++) {
    for (let i = 0; i < 15; i++) {
      [-1, 1].forEach(side => {
        const x = side * (GAME.COURSE_WIDTH / 2 + 3 + row * 1.5) + (Math.random() - 0.5) * 0.5;
        const z = finishZ + 3 + i * 1.5 + (Math.random() - 0.5) * 0.5;
        const y = finishTerrainY;

        const hasFlag = Math.random() < 0.35;
        const spec = createSpectator(x, y, z, 50 + row * 15 + i, hasFlag);
        spec.group.rotation.y = -side * Math.PI * 0.4;
        spectators.push(spec);
        finishArena.add(spec.group);
      });
    }
  }

  // ===== MEDIA/PHOTOGRAPHERS AREA =====
  const mediaX = GAME.COURSE_WIDTH / 2 + 2;
  for (let i = 0; i < 6; i++) {
    const photographer = new THREE.Group();

    // Body (darker colors for media)
    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.2, 0.6, 4, 8),
      new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.7 })
    );
    body.position.y = 0.6;
    photographer.add(body);

    // Head
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 8, 6),
      new THREE.MeshStandardMaterial({ color: 0xffdbac, roughness: 0.6 })
    );
    head.position.y = 1.1;
    photographer.add(head);

    // Camera
    const camera = new THREE.Mesh(
      new THREE.BoxGeometry(0.25, 0.15, 0.3),
      new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.3, metalness: 0.8 })
    );
    camera.position.set(0, 0.9, 0.25);
    photographer.add(camera);

    // Lens
    const lens = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.08, 0.2, 8),
      new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.9 })
    );
    lens.rotation.x = Math.PI / 2;
    lens.position.set(0, 0.9, 0.45);
    photographer.add(lens);

    photographer.position.set(
      mediaX + (Math.random() - 0.5) * 2,
      finishTerrainY,
      -finishZ + i * 2.5
    );
    photographer.rotation.y = -Math.PI / 2;
    finishArena.add(photographer);
  }

  // ===== CONFETTI SYSTEM =====
  const confettiCount = 2000;
  const confettiGeo = new THREE.BufferGeometry();
  const confettiPositions = new Float32Array(confettiCount * 3);
  const confettiColors = new Float32Array(confettiCount * 3);
  confettiVelocities = new Float32Array(confettiCount * 3);

  const confettiColorOptions = [
    new THREE.Color(0xff0000),
    new THREE.Color(0x00ff00),
    new THREE.Color(0x0000ff),
    new THREE.Color(0xffff00),
    new THREE.Color(0xff00ff),
    new THREE.Color(0x00ffff),
    new THREE.Color(0xffffff),
    new THREE.Color(0xffd700),
  ];

  for (let i = 0; i < confettiCount; i++) {
    // Start above finish line area
    confettiPositions[i * 3] = (Math.random() - 0.5) * 40;
    confettiPositions[i * 3 + 1] = finishTerrainY + 8 + Math.random() * 10;
    confettiPositions[i * 3 + 2] = -finishZ + (Math.random() - 0.5) * 20;

    // Random velocities
    confettiVelocities[i * 3] = (Math.random() - 0.5) * 2;
    confettiVelocities[i * 3 + 1] = -Math.random() * 3 - 1;
    confettiVelocities[i * 3 + 2] = (Math.random() - 0.5) * 2;

    // Random colors
    const color = confettiColorOptions[Math.floor(Math.random() * confettiColorOptions.length)];
    confettiColors[i * 3] = color.r;
    confettiColors[i * 3 + 1] = color.g;
    confettiColors[i * 3 + 2] = color.b;
  }

  confettiGeo.setAttribute('position', new THREE.BufferAttribute(confettiPositions, 3));
  confettiGeo.setAttribute('color', new THREE.BufferAttribute(confettiColors, 3));

  const confettiMat = new THREE.PointsMaterial({
    size: 0.15,
    vertexColors: true,
    transparent: true,
    opacity: 0,
  });

  confettiParticles = new THREE.Points(confettiGeo, confettiMat);
  confettiParticles.visible = false;
  finishArena.add(confettiParticles);

  scene.add(finishArena);
  console.log(`  ✓ Olympic Finish Arena (${spectators.length} spectators, grandstands, confetti)`);
}

// Animate spectators and confetti
let spectatorsCheering = false;
let confettiActive = false;

function updateSpectators(time: number) {
  if (!spectatorsCheering) return;

  // Animate spectators
  spectators.forEach((spec, index) => {
    const t = time + spec.phase;
    const intensity = 1.0;

    // Enthusiastic arm waving - raised high
    const waveSpeed = 10 + (index % 4) * 2;
    const armRaise = 1.8 + Math.sin(t * waveSpeed) * 0.6;

    spec.armLeft.rotation.z = armRaise;
    spec.armLeft.rotation.x = Math.sin(t * waveSpeed * 0.7) * 0.3;
    spec.armRight.rotation.z = -armRaise;
    spec.armRight.rotation.x = Math.sin(t * waveSpeed * 0.7 + Math.PI) * 0.3;

    // Jumping - more spectators jump
    if (index % 2 === 0) {
      const jumpPhase = (t * 8 + spec.phase) % (Math.PI * 2);
      const jumpHeight = Math.max(0, Math.sin(jumpPhase)) * 0.25 * intensity;
      spec.group.position.y = spec.baseY + jumpHeight;
    }

    // Body excitement - lean and sway
    spec.group.rotation.z = Math.sin(t * 6 + spec.phase) * 0.08;
    spec.group.rotation.x = Math.sin(t * 4 + spec.phase * 0.5) * 0.05;

    // Wave flags
    if (spec.flag) {
      spec.flag.rotation.z = Math.sin(t * 12 + spec.phase) * 0.4;
      spec.flag.rotation.y = Math.sin(t * 8 + spec.phase) * 0.2;
    }
  });

  // Animate confetti
  if (confettiActive && confettiParticles && confettiVelocities) {
    const positions = confettiParticles.geometry.attributes.position.array as Float32Array;
    const material = confettiParticles.material as THREE.PointsMaterial;

    // Fade in confetti
    if (material.opacity < 1) {
      material.opacity = Math.min(1, material.opacity + 0.02);
    }

    const finishTerrainY = heightmapData && terrainConfig
      ? getHeightAt(0, GAME.COURSE_LENGTH, heightmapData, terrainConfig)
      : 0;

    for (let i = 0; i < positions.length / 3; i++) {
      // Apply velocity
      positions[i * 3] += confettiVelocities[i * 3] * 0.016;
      positions[i * 3 + 1] += confettiVelocities[i * 3 + 1] * 0.016;
      positions[i * 3 + 2] += confettiVelocities[i * 3 + 2] * 0.016;

      // Add flutter
      positions[i * 3] += Math.sin(time * 10 + i) * 0.01;

      // Reset if below ground
      if (positions[i * 3 + 1] < finishTerrainY) {
        positions[i * 3] = (Math.random() - 0.5) * 40;
        positions[i * 3 + 1] = finishTerrainY + 12 + Math.random() * 5;
        positions[i * 3 + 2] = -GAME.COURSE_LENGTH + (Math.random() - 0.5) * 20;
      }
    }

    confettiParticles.geometry.attributes.position.needsUpdate = true;
  }
}

function startSpectatorsCheering() {
  spectatorsCheering = true;
  confettiActive = true;

  if (confettiParticles) {
    confettiParticles.visible = true;
    (confettiParticles.material as THREE.PointsMaterial).opacity = 0;
  }
}

function stopSpectatorsCheering() {
  spectatorsCheering = false;
  confettiActive = false;

  // Reset spectator poses
  spectators.forEach(spec => {
    spec.armLeft.rotation.set(0, 0, 0.4);
    spec.armRight.rotation.set(0, 0, -0.4);
    spec.group.position.y = spec.baseY;
    spec.group.rotation.set(0, spec.group.rotation.y, 0);
    if (spec.flag) {
      spec.flag.rotation.set(0, 0, 0);
    }
  });

  // Hide confetti
  if (confettiParticles) {
    confettiParticles.visible = false;
  }
}

// ==================== FINISH LINE ====================
let finishLine: THREE.Group;

function createFinishLine() {
  finishLine = new THREE.Group();

  const finishZ = GAME.COURSE_LENGTH;
  const finishTerrainY = heightmapData && terrainConfig
    ? getHeightAt(0, finishZ, heightmapData, terrainConfig)
    : 0;

  // ===== 1. Finish Line on Ground =====
  // Red line across the track
  const lineMat = new THREE.MeshStandardMaterial({
    color: 0xff0000,
    emissive: 0xff0000,
    emissiveIntensity: 0.3,
    roughness: 0.5,
  });
  const finishLineGround = new THREE.Mesh(
    new THREE.BoxGeometry(GAME.COURSE_WIDTH + 10, 0.1, 1.5),
    lineMat
  );
  finishLineGround.position.set(0, finishTerrainY + 0.05, -finishZ);
  finishLineGround.receiveShadow = true;
  finishLine.add(finishLineGround);

  // White stripes (checkered pattern)
  for (let i = -6; i <= 6; i++) {
    if (i % 2 === 0) {
      const stripe = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 0.12, 1.5),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 })
      );
      stripe.position.set(i * 2.8, finishTerrainY + 0.07, -finishZ);
      finishLine.add(stripe);
    }
  }

  // ===== 2. Finish Arch/Banner =====
  const archMat = new THREE.MeshStandardMaterial({
    color: 0x1565c0,  // Blue
    roughness: 0.3,
    metalness: 0.5,
  });
  const archAccentMat = new THREE.MeshStandardMaterial({
    color: 0xffd700,  // Gold
    roughness: 0.2,
    metalness: 0.8,
    emissive: 0xffd700,
    emissiveIntensity: 0.2,
  });

  const archHeight = 6;
  const archWidth = GAME.COURSE_WIDTH + 8;
  const poleRadius = 0.25;

  // Left arch pole
  const leftArchPole = new THREE.Mesh(
    new THREE.CylinderGeometry(poleRadius, poleRadius * 1.3, archHeight, 16),
    archMat
  );
  leftArchPole.position.set(-archWidth / 2, finishTerrainY + archHeight / 2, -finishZ);
  leftArchPole.castShadow = true;
  finishLine.add(leftArchPole);

  // Right arch pole
  const rightArchPole = new THREE.Mesh(
    new THREE.CylinderGeometry(poleRadius, poleRadius * 1.3, archHeight, 16),
    archMat
  );
  rightArchPole.position.set(archWidth / 2, finishTerrainY + archHeight / 2, -finishZ);
  rightArchPole.castShadow = true;
  finishLine.add(rightArchPole);

  // Top crossbar
  const topCrossbar = new THREE.Mesh(
    new THREE.BoxGeometry(archWidth + 1, 0.6, 0.6),
    archMat
  );
  topCrossbar.position.set(0, finishTerrainY + archHeight, -finishZ);
  topCrossbar.castShadow = true;
  finishLine.add(topCrossbar);

  // ===== 3. FINISH Banner =====
  const bannerMat = new THREE.MeshStandardMaterial({
    color: 0xe53935,  // Red
    roughness: 0.4,
    side: THREE.DoubleSide,
  });
  const banner = new THREE.Mesh(
    new THREE.BoxGeometry(archWidth * 0.7, 1.8, 0.15),
    bannerMat
  );
  banner.position.set(0, finishTerrainY + archHeight - 1.2, -finishZ + 0.4);
  finishLine.add(banner);

  // "ARRIVÉE" text placeholder (white bar)
  const textBar = new THREE.Mesh(
    new THREE.BoxGeometry(archWidth * 0.5, 0.8, 0.05),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 0.3,
    })
  );
  textBar.position.set(0, finishTerrainY + archHeight - 1.2, -finishZ + 0.5);
  finishLine.add(textBar);

  // ===== 4. Timing Display =====
  const displayMat = new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.1,
    metalness: 0.9,
  });
  const timingDisplay = new THREE.Mesh(
    new THREE.BoxGeometry(4, 1.5, 0.3),
    displayMat
  );
  timingDisplay.position.set(0, finishTerrainY + archHeight + 1.2, -finishZ);
  finishLine.add(timingDisplay);

  // Display screen (green glow)
  const screenGlow = new THREE.Mesh(
    new THREE.BoxGeometry(3.6, 1.1, 0.05),
    new THREE.MeshStandardMaterial({
      color: 0x00ff00,
      emissive: 0x00ff00,
      emissiveIntensity: 0.5,
    })
  );
  screenGlow.position.set(0, finishTerrainY + archHeight + 1.2, -finishZ + 0.18);
  finishLine.add(screenGlow);

  // ===== 5. Side Barriers with Sponsor Boards =====
  const barrierMat = new THREE.MeshStandardMaterial({
    color: 0x1565c0,
    roughness: 0.6,
  });

  [-1, 1].forEach(side => {
    // Barrier fence
    for (let i = 0; i < 8; i++) {
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.1, 1.5, 8),
        barrierMat
      );
      post.position.set(
        side * (GAME.COURSE_WIDTH / 2 + 3),
        finishTerrainY + 0.75,
        -finishZ + 15 - i * 4
      );
      post.castShadow = true;
      finishLine.add(post);
    }

    // Sponsor board panels
    for (let i = 0; i < 3; i++) {
      const sponsorBoard = new THREE.Mesh(
        new THREE.BoxGeometry(8, 1.2, 0.1),
        new THREE.MeshStandardMaterial({
          color: i % 2 === 0 ? 0xe53935 : 0x1565c0,
          roughness: 0.5,
        })
      );
      sponsorBoard.position.set(
        side * (GAME.COURSE_WIDTH / 2 + 5),
        finishTerrainY + 0.8,
        -finishZ + 8 - i * 10
      );
      sponsorBoard.rotation.y = side * Math.PI * 0.1;
      finishLine.add(sponsorBoard);
    }
  });

  // ===== 6. Checkered Flags on poles =====
  [-1, 1].forEach(side => {
    const flagPole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 4, 8),
      new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8 })
    );
    flagPole.position.set(side * (archWidth / 2 + 2), finishTerrainY + 2, -finishZ);
    finishLine.add(flagPole);

    // Checkered flag (simplified as two-tone)
    const flag = new THREE.Group();
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 4; col++) {
        const square = new THREE.Mesh(
          new THREE.BoxGeometry(0.25, 0.25, 0.02),
          new THREE.MeshStandardMaterial({
            color: (row + col) % 2 === 0 ? 0x000000 : 0xffffff,
          })
        );
        square.position.set(col * 0.25, -row * 0.25, 0);
        flag.add(square);
      }
    }
    flag.position.set(side * (archWidth / 2 + 2) + side * 0.6, finishTerrainY + 3.5, -finishZ);
    finishLine.add(flag);
  });

  // ===== 7. Photo Finish Camera =====
  const cameraMat = new THREE.MeshStandardMaterial({
    color: 0x222222,
    roughness: 0.3,
    metalness: 0.7,
  });
  const photoCamera = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.5, 1.2),
    cameraMat
  );
  photoCamera.position.set(archWidth / 2 + 1, finishTerrainY + archHeight - 0.5, -finishZ);
  finishLine.add(photoCamera);

  // Camera lens
  const lens = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.2, 0.3, 16),
    new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.9 })
  );
  lens.rotation.z = Math.PI / 2;
  lens.position.set(archWidth / 2 + 0.5, finishTerrainY + archHeight - 0.5, -finishZ);
  finishLine.add(lens);

  scene.add(finishLine);
  console.log('  ✓ Finish Line');
}

// ==================== SKI RESORT VILLAGE ====================
let skiResort: THREE.Group;

function createSkiResortVillage() {
  skiResort = new THREE.Group();

  const finishZ = GAME.COURSE_LENGTH;
  const finishTerrainY = heightmapData && terrainConfig
    ? getHeightAt(0, finishZ, heightmapData, terrainConfig)
    : 0;

  // Resort is below and behind the finish line - MUCH CLOSER and LARGER
  const resortBaseY = finishTerrainY - 40; // Only 40m below finish line (more visible)
  const resortStartZ = finishZ + 30; // Only 30m behind finish (visible immediately)

  // ===== MATERIALS =====
  const woodMat = new THREE.MeshStandardMaterial({
    color: 0x8B4513, // Saddle brown
    roughness: 0.8,
    metalness: 0.0,
  });
  const darkWoodMat = new THREE.MeshStandardMaterial({
    color: 0x5D4037, // Dark wood
    roughness: 0.7,
    metalness: 0.0,
  });
  const stoneMat = new THREE.MeshStandardMaterial({
    color: 0x808080, // Gray stone
    roughness: 0.9,
    metalness: 0.0,
  });
  const snowRoofMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.8,
    metalness: 0.0,
  });
  const redRoofMat = new THREE.MeshStandardMaterial({
    color: 0x8B0000, // Dark red
    roughness: 0.6,
    metalness: 0.1,
  });
  const yellowLightMat = new THREE.MeshStandardMaterial({
    color: 0xffcc00,
    emissive: 0xffaa00,
    emissiveIntensity: 0.8,
    roughness: 0.3,
  });
  const whitePlasterMat = new THREE.MeshStandardMaterial({
    color: 0xFFFAF0, // Floral white
    roughness: 0.7,
    metalness: 0.0,
  });
  const metalMat = new THREE.MeshStandardMaterial({
    color: 0x555555,
    roughness: 0.3,
    metalness: 0.8,
  });

  // ===== HELPER: Create Chalet =====
  function createChalet(x: number, z: number, scale: number = 1, variant: number = 0) {
    const chalet = new THREE.Group();

    const baseWidth = 12 * scale;
    const baseDepth = 10 * scale;
    const baseHeight = 6 * scale;
    const roofHeight = 5 * scale;

    // Main body - stone base
    const stoneBase = new THREE.Mesh(
      new THREE.BoxGeometry(baseWidth, baseHeight * 0.4, baseDepth),
      stoneMat
    );
    stoneBase.position.y = baseHeight * 0.2;
    stoneBase.castShadow = true;
    stoneBase.receiveShadow = true;
    chalet.add(stoneBase);

    // Wooden upper part
    const woodenUpper = new THREE.Mesh(
      new THREE.BoxGeometry(baseWidth, baseHeight * 0.6, baseDepth),
      variant % 2 === 0 ? woodMat : darkWoodMat
    );
    woodenUpper.position.y = baseHeight * 0.7;
    woodenUpper.castShadow = true;
    chalet.add(woodenUpper);

    // Balcony (front)
    const balcony = new THREE.Mesh(
      new THREE.BoxGeometry(baseWidth * 0.8, 0.3 * scale, 2 * scale),
      darkWoodMat
    );
    balcony.position.set(0, baseHeight * 0.5, baseDepth / 2 + 0.8 * scale);
    chalet.add(balcony);

    // Balcony railing
    for (let i = -3; i <= 3; i++) {
      const post = new THREE.Mesh(
        new THREE.BoxGeometry(0.2 * scale, 1 * scale, 0.2 * scale),
        darkWoodMat
      );
      post.position.set(i * 1.3 * scale, baseHeight * 0.5 + 0.5 * scale, baseDepth / 2 + 1.5 * scale);
      chalet.add(post);
    }

    // Roof (A-frame)
    const roofGeo = new THREE.ConeGeometry(baseWidth * 0.8, roofHeight, 4);
    roofGeo.rotateY(Math.PI / 4);
    const roof = new THREE.Mesh(roofGeo, variant % 3 === 0 ? redRoofMat : snowRoofMat);
    roof.position.y = baseHeight + roofHeight / 2;
    roof.castShadow = true;
    chalet.add(roof);

    // Chimney
    const chimney = new THREE.Mesh(
      new THREE.BoxGeometry(1.2 * scale, 3 * scale, 1.2 * scale),
      stoneMat
    );
    chimney.position.set(baseWidth * 0.25, baseHeight + roofHeight * 0.6, 0);
    chimney.castShadow = true;
    chalet.add(chimney);

    // Windows (illuminated)
    const windowPositions = [
      { x: -baseWidth * 0.25, y: baseHeight * 0.7, z: baseDepth / 2 + 0.1 },
      { x: baseWidth * 0.25, y: baseHeight * 0.7, z: baseDepth / 2 + 0.1 },
      { x: -baseWidth * 0.25, y: baseHeight * 0.35, z: baseDepth / 2 + 0.1 },
      { x: baseWidth * 0.25, y: baseHeight * 0.35, z: baseDepth / 2 + 0.1 },
    ];

    windowPositions.forEach(pos => {
      const windowFrame = new THREE.Mesh(
        new THREE.BoxGeometry(1.8 * scale, 1.5 * scale, 0.1),
        yellowLightMat
      );
      windowFrame.position.set(pos.x, pos.y, pos.z);
      chalet.add(windowFrame);
    });

    // Position chalet
    const chaletY = resortBaseY + Math.random() * 10;
    chalet.position.set(x, chaletY, -resortStartZ - z);

    // Random rotation for variety
    chalet.rotation.y = (Math.random() - 0.5) * 0.4;

    return chalet;
  }

  // ===== HELPER: Create Church =====
  function createChurch(x: number, z: number) {
    const church = new THREE.Group();

    const bodyWidth = 15;
    const bodyDepth = 25;
    const bodyHeight = 12;

    // Main body
    const mainBody = new THREE.Mesh(
      new THREE.BoxGeometry(bodyWidth, bodyHeight, bodyDepth),
      whitePlasterMat
    );
    mainBody.position.y = bodyHeight / 2;
    mainBody.castShadow = true;
    mainBody.receiveShadow = true;
    church.add(mainBody);

    // Roof
    const roofGeo = new THREE.ConeGeometry(bodyWidth * 0.75, 8, 4);
    roofGeo.rotateY(Math.PI / 4);
    const roof = new THREE.Mesh(roofGeo, redRoofMat);
    roof.position.y = bodyHeight + 4;
    roof.scale.z = bodyDepth / bodyWidth;
    church.add(roof);

    // Bell tower (steeple)
    const towerBase = new THREE.Mesh(
      new THREE.BoxGeometry(6, 20, 6),
      whitePlasterMat
    );
    towerBase.position.set(0, 10, -bodyDepth / 2 + 5);
    towerBase.castShadow = true;
    church.add(towerBase);

    // Steeple top
    const steeple = new THREE.Mesh(
      new THREE.ConeGeometry(4, 12, 8),
      redRoofMat
    );
    steeple.position.set(0, 26, -bodyDepth / 2 + 5);
    church.add(steeple);

    // Cross on top
    const crossVertical = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 4, 0.5),
      metalMat
    );
    crossVertical.position.set(0, 34, -bodyDepth / 2 + 5);
    church.add(crossVertical);

    const crossHorizontal = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, 0.5, 0.5),
      metalMat
    );
    crossHorizontal.position.set(0, 33, -bodyDepth / 2 + 5);
    church.add(crossHorizontal);

    // Bell tower windows
    for (let i = 0; i < 4; i++) {
      const bellWindow = new THREE.Mesh(
        new THREE.BoxGeometry(2, 3, 0.5),
        new THREE.MeshStandardMaterial({ color: 0x333333 })
      );
      bellWindow.position.set(0, 18, -bodyDepth / 2 + 5);
      bellWindow.rotation.y = (i * Math.PI) / 2;
      bellWindow.translateZ(3.1);
      church.add(bellWindow);
    }

    // Front door
    const door = new THREE.Mesh(
      new THREE.BoxGeometry(3, 5, 0.3),
      darkWoodMat
    );
    door.position.set(0, 2.5, bodyDepth / 2 + 0.15);
    church.add(door);

    // Round window above door
    const roundWindow = new THREE.Mesh(
      new THREE.CircleGeometry(2, 16),
      yellowLightMat
    );
    roundWindow.position.set(0, 8, bodyDepth / 2 + 0.1);
    church.add(roundWindow);

    church.position.set(x, resortBaseY, -resortStartZ - z);

    return church;
  }

  // ===== HELPER: Create Hotel/Restaurant =====
  function createHotel(x: number, z: number, floors: number = 3) {
    const hotel = new THREE.Group();

    const floorHeight = 4;
    const width = 20;
    const depth = 15;
    const totalHeight = floors * floorHeight;

    // Main building
    const building = new THREE.Mesh(
      new THREE.BoxGeometry(width, totalHeight, depth),
      whitePlasterMat
    );
    building.position.y = totalHeight / 2;
    building.castShadow = true;
    building.receiveShadow = true;
    hotel.add(building);

    // Wooden trim
    const trim = new THREE.Mesh(
      new THREE.BoxGeometry(width + 1, 0.5, depth + 1),
      darkWoodMat
    );
    trim.position.y = totalHeight;
    hotel.add(trim);

    // Roof
    const roofGeo = new THREE.ConeGeometry(width * 0.7, 6, 4);
    roofGeo.rotateY(Math.PI / 4);
    const roof = new THREE.Mesh(roofGeo, snowRoofMat);
    roof.position.y = totalHeight + 3;
    roof.scale.z = depth / width;
    hotel.add(roof);

    // Windows per floor
    for (let floor = 0; floor < floors; floor++) {
      for (let w = -2; w <= 2; w++) {
        const window = new THREE.Mesh(
          new THREE.BoxGeometry(2.5, 2, 0.1),
          yellowLightMat
        );
        window.position.set(w * 3.5, floor * floorHeight + 2.5, depth / 2 + 0.1);
        hotel.add(window);
      }
    }

    // Balconies
    for (let floor = 1; floor < floors; floor++) {
      const balcony = new THREE.Mesh(
        new THREE.BoxGeometry(width * 0.9, 0.3, 2),
        darkWoodMat
      );
      balcony.position.set(0, floor * floorHeight + 0.15, depth / 2 + 1);
      hotel.add(balcony);
    }

    // Sign "HOTEL"
    const sign = new THREE.Mesh(
      new THREE.BoxGeometry(8, 1.5, 0.2),
      new THREE.MeshStandardMaterial({
        color: 0x1565c0,
        emissive: 0x1565c0,
        emissiveIntensity: 0.3,
      })
    );
    sign.position.set(0, totalHeight - 1, depth / 2 + 0.2);
    hotel.add(sign);

    hotel.position.set(x, resortBaseY - 5, -resortStartZ - z);

    return hotel;
  }

  // ===== HELPER: Create Ski Lift Pylon =====
  function createLiftPylon(x: number, z: number, height: number = 15) {
    const pylon = new THREE.Group();

    // Main pole
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.6, height, 8),
      metalMat
    );
    pole.position.y = height / 2;
    pole.castShadow = true;
    pylon.add(pole);

    // Cross arm
    const crossArm = new THREE.Mesh(
      new THREE.BoxGeometry(8, 0.5, 0.5),
      metalMat
    );
    crossArm.position.y = height - 0.5;
    pylon.add(crossArm);

    // Pulleys
    [-3.5, 3.5].forEach(offset => {
      const pulley = new THREE.Mesh(
        new THREE.TorusGeometry(0.6, 0.15, 8, 16),
        metalMat
      );
      pulley.position.set(offset, height - 0.5, 0);
      pulley.rotation.y = Math.PI / 2;
      pylon.add(pulley);
    });

    // Cable (simplified as thin cylinder)
    const cable = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 100, 4),
      new THREE.MeshStandardMaterial({ color: 0x222222 })
    );
    cable.rotation.z = Math.PI / 2;
    cable.position.y = height - 0.5;
    pylon.add(cable);

    const pylonY = resortBaseY + 30 + Math.random() * 20;
    pylon.position.set(x, pylonY, -resortStartZ - z);

    return pylon;
  }

  // ===== CREATE LARGE MOUNTAIN VILLAGE =====

  // === FRONT ROW - Visible immediately from finish line ===
  // Large chalets right behind finish (left side)
  for (let i = 0; i < 5; i++) {
    const chalet = createChalet(
      -120 + i * 25,
      20 + Math.random() * 15,
      1.2 + Math.random() * 0.3,
      i
    );
    skiResort.add(chalet);
  }

  // Large chalets right behind finish (right side)
  for (let i = 0; i < 5; i++) {
    const chalet = createChalet(
      30 + i * 25,
      25 + Math.random() * 15,
      1.1 + Math.random() * 0.4,
      i + 5
    );
    skiResort.add(chalet);
  }

  // === SECOND ROW - Main village center ===
  for (let i = 0; i < 8; i++) {
    const chalet = createChalet(
      -140 + i * 35,
      70 + Math.random() * 20,
      1.0 + Math.random() * 0.4,
      i + 10
    );
    skiResort.add(chalet);
  }

  // === THIRD ROW ===
  for (let i = 0; i < 10; i++) {
    const chalet = createChalet(
      -160 + i * 35,
      130 + Math.random() * 25,
      0.9 + Math.random() * 0.5,
      i + 20
    );
    skiResort.add(chalet);
  }

  // === FOURTH ROW - Back of village ===
  for (let i = 0; i < 12; i++) {
    const chalet = createChalet(
      -180 + i * 32,
      200 + Math.random() * 30,
      0.8 + Math.random() * 0.5,
      i + 30
    );
    skiResort.add(chalet);
  }

  // === SIDE CLUSTERS (left) ===
  for (let i = 0; i < 8; i++) {
    const chalet = createChalet(
      -200 - Math.random() * 40,
      50 + i * 35 + Math.random() * 20,
      0.9 + Math.random() * 0.4,
      i + 50
    );
    skiResort.add(chalet);
  }

  // === SIDE CLUSTERS (right) ===
  for (let i = 0; i < 8; i++) {
    const chalet = createChalet(
      180 + Math.random() * 40,
      60 + i * 35 + Math.random() * 20,
      0.9 + Math.random() * 0.4,
      i + 60
    );
    skiResort.add(chalet);
  }

  // === CHURCH - Central landmark (larger) ===
  const church = createChurch(0, 90);
  church.scale.setScalar(1.3);
  skiResort.add(church);

  // === HOTELS - Multiple large buildings ===
  const hotel1 = createHotel(-80, 50, 5); // 5 floors
  hotel1.scale.setScalar(1.2);
  skiResort.add(hotel1);

  const hotel2 = createHotel(90, 60, 4);
  hotel2.scale.setScalar(1.2);
  skiResort.add(hotel2);

  const hotel3 = createHotel(-50, 160, 4);
  skiResort.add(hotel3);

  const hotel4 = createHotel(60, 180, 5);
  hotel4.scale.setScalar(1.1);
  skiResort.add(hotel4);

  // === RESTAURANTS/SHOPS ===
  const restaurant1 = createHotel(30, 40, 2);
  restaurant1.scale.set(0.8, 0.8, 0.8);
  skiResort.add(restaurant1);

  const restaurant2 = createHotel(-35, 45, 2);
  restaurant2.scale.set(0.8, 0.8, 0.8);
  skiResort.add(restaurant2);

  const shop1 = createHotel(0, 150, 2);
  shop1.scale.set(0.7, 0.7, 0.7);
  skiResort.add(shop1);

  // === SKI LIFT STATION at village center ===
  // Main lift station building
  const liftStation = new THREE.Group();
  const stationBase = new THREE.Mesh(
    new THREE.BoxGeometry(25, 8, 15),
    whitePlasterMat
  );
  stationBase.position.y = 4;
  liftStation.add(stationBase);

  const stationRoof = new THREE.Mesh(
    new THREE.BoxGeometry(28, 1, 18),
    metalMat
  );
  stationRoof.position.y = 8.5;
  liftStation.add(stationRoof);

  // "TÉLÉSIÈGE" sign
  const liftSign = new THREE.Mesh(
    new THREE.BoxGeometry(12, 2, 0.3),
    new THREE.MeshStandardMaterial({
      color: 0x1565c0,
      emissive: 0x1565c0,
      emissiveIntensity: 0.4,
    })
  );
  liftSign.position.set(0, 6, 7.7);
  liftStation.add(liftSign);

  liftStation.position.set(-150, resortBaseY, -resortStartZ - 100);
  skiResort.add(liftStation);

  // === SKI LIFT PYLONS - Just a few visible from the village ===
  // Main lift line (left) - only 4 pylons
  for (let i = 0; i < 4; i++) {
    const pylon = createLiftPylon(
      -140 + i * 35,
      50 + i * 80,
      16 + Math.random() * 6
    );
    skiResort.add(pylon);
  }

  // Second lift line (right) - only 3 pylons
  for (let i = 0; i < 3; i++) {
    const pylon = createLiftPylon(
      120 + i * 30,
      80 + i * 90,
      15 + Math.random() * 5
    );
    skiResort.add(pylon);
  }

  // === STREET LIGHTS - More throughout village ===
  for (let i = 0; i < 30; i++) {
    const lampPost = new THREE.Group();

    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.2, 6, 8),
      metalMat
    );
    post.position.y = 3;
    lampPost.add(post);

    const arm = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.15, 0.15),
      metalMat
    );
    arm.position.set(0.9, 6, 0);
    lampPost.add(arm);

    const lamp = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 8, 8),
      yellowLightMat
    );
    lamp.position.set(1.8, 5.8, 0);
    lampPost.add(lamp);

    // Distribute lights throughout village
    const row = Math.floor(i / 6);
    const col = i % 6;
    lampPost.position.set(
      -100 + col * 40 + (Math.random() - 0.5) * 15,
      resortBaseY,
      -resortStartZ - 30 - row * 50
    );
    skiResort.add(lampPost);
  }

  // === VILLAGE SQUARE / PLAZA ===
  const villageSquare = new THREE.Mesh(
    new THREE.CircleGeometry(25, 32),
    new THREE.MeshStandardMaterial({
      color: 0xd4d4d4,
      roughness: 0.7,
    })
  );
  villageSquare.rotation.x = -Math.PI / 2;
  villageSquare.position.set(0, resortBaseY + 0.1, -resortStartZ - 90);
  skiResort.add(villageSquare);

  // Fountain in square
  const fountain = new THREE.Mesh(
    new THREE.CylinderGeometry(4, 5, 2, 16),
    stoneMat
  );
  fountain.position.set(0, resortBaseY + 1, -resortStartZ - 90);
  skiResort.add(fountain);

  // === SNOW-COVERED GROUND - Larger area ===
  const villageGround = new THREE.Mesh(
    new THREE.PlaneGeometry(600, 500),
    new THREE.MeshStandardMaterial({
      color: 0xf8f8f8,
      roughness: 0.85,
    })
  );
  villageGround.rotation.x = -Math.PI / 2;
  villageGround.position.set(0, resortBaseY - 0.5, -resortStartZ - 150);
  villageGround.receiveShadow = true;
  skiResort.add(villageGround);

  // === TREES - Many more around village ===
  const treeGeo = new THREE.ConeGeometry(3, 12, 8);
  const treeMat = new THREE.MeshStandardMaterial({ color: 0x2d5a27, roughness: 0.8 });
  const trunkGeo = new THREE.CylinderGeometry(0.5, 0.7, 4, 8);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3728, roughness: 0.9 });

  for (let i = 0; i < 80; i++) {
    const tree = new THREE.Group();

    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 2;
    tree.add(trunk);

    const foliage = new THREE.Mesh(treeGeo, treeMat);
    foliage.position.y = 10;
    tree.add(foliage);

    // Snow cap on tree
    const snowCap = new THREE.Mesh(
      new THREE.ConeGeometry(2.8, 4, 8),
      snowRoofMat
    );
    snowCap.position.y = 13;
    tree.add(snowCap);

    // Position trees around village edges and in clusters
    let treeX, treeZ;
    if (i < 20) {
      // Left edge
      treeX = -220 - Math.random() * 50;
      treeZ = Math.random() * 350;
    } else if (i < 40) {
      // Right edge
      treeX = 220 + Math.random() * 50;
      treeZ = Math.random() * 350;
    } else if (i < 60) {
      // Back of village
      treeX = -200 + Math.random() * 400;
      treeZ = 280 + Math.random() * 100;
    } else {
      // Scattered in village
      treeX = -180 + Math.random() * 360;
      treeZ = Math.random() * 250;
    }

    tree.position.set(
      treeX,
      resortBaseY,
      -resortStartZ - treeZ
    );
    tree.scale.setScalar(0.7 + Math.random() * 0.8);
    skiResort.add(tree);
  }

  // === PARKING LOT with cars (side of village) ===
  const parkingLot = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 40),
    new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.9 })
  );
  parkingLot.rotation.x = -Math.PI / 2;
  parkingLot.position.set(160, resortBaseY + 0.1, -resortStartZ - 50);
  skiResort.add(parkingLot);

  // Parked cars
  const carColors = [0xcc0000, 0x0066cc, 0x333333, 0xffffff, 0x006600];
  for (let i = 0; i < 12; i++) {
    const car = new THREE.Mesh(
      new THREE.BoxGeometry(4, 1.5, 2),
      new THREE.MeshStandardMaterial({
        color: carColors[i % carColors.length],
        roughness: 0.3,
        metalness: 0.6
      })
    );
    car.position.set(
      140 + (i % 4) * 12,
      resortBaseY + 0.75,
      -resortStartZ - 35 - Math.floor(i / 4) * 8
    );
    car.castShadow = true;
    skiResort.add(car);
  }

  // === WELCOME SIGN at village entrance ===
  const welcomeSign = new THREE.Group();
  const signPost1 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.3, 6, 8),
    darkWoodMat
  );
  signPost1.position.set(-3, 3, 0);
  welcomeSign.add(signPost1);

  const signPost2 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.3, 6, 8),
    darkWoodMat
  );
  signPost2.position.set(3, 3, 0);
  welcomeSign.add(signPost2);

  const signBoard = new THREE.Mesh(
    new THREE.BoxGeometry(8, 2, 0.3),
    new THREE.MeshStandardMaterial({
      color: 0x8B4513,
      roughness: 0.7,
    })
  );
  signBoard.position.set(0, 5.5, 0);
  welcomeSign.add(signBoard);

  // White text area on sign
  const signText = new THREE.Mesh(
    new THREE.BoxGeometry(7, 1.5, 0.1),
    new THREE.MeshStandardMaterial({
      color: 0xFFFAF0,
      roughness: 0.5,
    })
  );
  signText.position.set(0, 5.5, 0.2);
  welcomeSign.add(signText);

  welcomeSign.position.set(0, resortBaseY, -resortStartZ - 10);
  skiResort.add(welcomeSign)

  scene.add(skiResort);
  console.log('  ✓ French Ski Resort Village');
}

// ==================== COURSE OBSTACLES ====================
let courseObstacles: THREE.Group;

function createCourseObstacles() {
  courseObstacles = new THREE.Group();

  // ===== MATERIALS =====
  const metalMat = new THREE.MeshStandardMaterial({
    color: 0x555555,
    roughness: 0.3,
    metalness: 0.8,
  });
  const darkMetalMat = new THREE.MeshStandardMaterial({
    color: 0x333333,
    roughness: 0.4,
    metalness: 0.7,
  });
  const rockMat = new THREE.MeshStandardMaterial({
    color: 0x6b6b6b,
    roughness: 0.9,
    metalness: 0.0,
  });
  const darkRockMat = new THREE.MeshStandardMaterial({
    color: 0x4a4a4a,
    roughness: 0.95,
    metalness: 0.0,
  });
  const snowMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.8,
    metalness: 0.0,
  });
  const redMat = new THREE.MeshStandardMaterial({
    color: 0xcc0000,
    roughness: 0.5,
    metalness: 0.2,
  });
  const yellowMat = new THREE.MeshStandardMaterial({
    color: 0xffcc00,
    roughness: 0.5,
    metalness: 0.2,
  });
  const blackMat = new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.6,
    metalness: 0.1,
  });
  const blueMat = new THREE.MeshStandardMaterial({
    color: 0x1565c0,
    roughness: 0.5,
    metalness: 0.2,
  });

  // ===== HELPER: Create Ski Lift Pylon =====
  function createObstaclePylon(x: number, z: number, height: number = 12) {
    const pylon = new THREE.Group();

    // Main pole
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.5, height, 8),
      metalMat
    );
    pole.position.y = height / 2;
    pole.castShadow = true;
    pylon.add(pole);

    // Cross arm
    const arm = new THREE.Mesh(
      new THREE.BoxGeometry(6, 0.4, 0.4),
      darkMetalMat
    );
    arm.position.y = height - 0.5;
    arm.castShadow = true;
    pylon.add(arm);

    // Cable wheels (simplified)
    [-2.5, 2.5].forEach(offset => {
      const wheel = new THREE.Mesh(
        new THREE.TorusGeometry(0.4, 0.1, 8, 16),
        darkMetalMat
      );
      wheel.position.set(offset, height - 0.5, 0);
      wheel.rotation.y = Math.PI / 2;
      pylon.add(wheel);
    });

    // Warning markers (red/white stripes)
    for (let i = 0; i < 3; i++) {
      const marker = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.4, 0.6),
        i % 2 === 0 ? redMat : snowMat
      );
      marker.position.y = 1 + i * 0.4;
      pylon.add(marker);
    }

    // Position on terrain
    const terrainY = heightmapData && terrainConfig
      ? getHeightAt(x, z, heightmapData, terrainConfig)
      : 0;
    pylon.position.set(x, terrainY, -z);

    return pylon;
  }

  // ===== HELPER: Create Rock =====
  function createRock(x: number, z: number, size: number = 1) {
    const rock = new THREE.Group();

    // Irregular rock shape using multiple overlapping geometries
    const mainRock = new THREE.Mesh(
      new THREE.DodecahedronGeometry(size * 1.5, 0),
      Math.random() > 0.5 ? rockMat : darkRockMat
    );
    mainRock.scale.set(1 + Math.random() * 0.4, 0.6 + Math.random() * 0.3, 1 + Math.random() * 0.4);
    mainRock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    mainRock.castShadow = true;
    rock.add(mainRock);

    // Add some smaller attached rocks
    for (let i = 0; i < 2; i++) {
      const smallRock = new THREE.Mesh(
        new THREE.DodecahedronGeometry(size * 0.6, 0),
        Math.random() > 0.5 ? rockMat : darkRockMat
      );
      smallRock.position.set(
        (Math.random() - 0.5) * size * 2,
        (Math.random() - 0.5) * size * 0.5,
        (Math.random() - 0.5) * size * 2
      );
      smallRock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      smallRock.castShadow = true;
      rock.add(smallRock);
    }

    // Snow on top
    const snowCap = new THREE.Mesh(
      new THREE.SphereGeometry(size * 0.8, 8, 4, 0, Math.PI * 2, 0, Math.PI * 0.4),
      snowMat
    );
    snowCap.position.y = size * 0.8;
    rock.add(snowCap);

    // Position on terrain
    const terrainY = heightmapData && terrainConfig
      ? getHeightAt(x, z, heightmapData, terrainConfig)
      : 0;
    rock.position.set(x, terrainY, -z);

    return rock;
  }

  // ===== HELPER: Create Snow Cannon =====
  function createSnowCannon(x: number, z: number) {
    const cannon = new THREE.Group();

    // Base/tripod
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.8, 1, 0.5, 6),
      metalMat
    );
    base.position.y = 0.25;
    base.castShadow = true;
    cannon.add(base);

    // Main body
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.5, 2, 8),
      blueMat
    );
    body.position.y = 1.5;
    body.castShadow = true;
    cannon.add(body);

    // Nozzle
    const nozzle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.25, 1.5, 8),
      metalMat
    );
    nozzle.position.set(0, 2.5, 0.8);
    nozzle.rotation.x = Math.PI / 4;
    nozzle.castShadow = true;
    cannon.add(nozzle);

    // Control box
    const controlBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.4, 0.3),
      darkMetalMat
    );
    controlBox.position.set(0.5, 1.2, 0);
    cannon.add(controlBox);

    // Warning light (orange)
    const light = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 8, 8),
      new THREE.MeshStandardMaterial({
        color: 0xff6600,
        emissive: 0xff6600,
        emissiveIntensity: 0.5
      })
    );
    light.position.set(0, 2.7, 0);
    cannon.add(light);

    // Position on terrain
    const terrainY = heightmapData && terrainConfig
      ? getHeightAt(x, z, heightmapData, terrainConfig)
      : 0;
    cannon.position.set(x, terrainY, -z);
    cannon.rotation.y = Math.random() * Math.PI * 2;

    return cannon;
  }

  // ===== HELPER: Create Snowmobile =====
  function createSnowmobile(x: number, z: number, rotation: number = 0) {
    const snowmobile = new THREE.Group();

    // Main body
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.8, 2.8),
      blackMat
    );
    body.position.y = 0.6;
    body.castShadow = true;
    snowmobile.add(body);

    // Hood (front)
    const hood = new THREE.Mesh(
      new THREE.BoxGeometry(1, 0.5, 1),
      redMat
    );
    hood.position.set(0, 0.7, -1.2);
    hood.rotation.x = -0.2;
    hood.castShadow = true;
    snowmobile.add(hood);

    // Seat
    const seat = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.3, 1.2),
      blackMat
    );
    seat.position.set(0, 1.1, 0.3);
    snowmobile.add(seat);

    // Handlebars
    const handlebar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.8, 8),
      metalMat
    );
    handlebar.position.set(0, 1.1, -0.6);
    handlebar.rotation.z = Math.PI / 2;
    snowmobile.add(handlebar);

    // Front ski
    const frontSki = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.05, 1),
      metalMat
    );
    frontSki.position.set(0, 0.05, -1.5);
    snowmobile.add(frontSki);

    // Track (rear)
    const track = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.4, 1.8),
      blackMat
    );
    track.position.set(0, 0.25, 0.6);
    snowmobile.add(track);

    // Headlight
    const headlight = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 8, 8),
      new THREE.MeshStandardMaterial({
        color: 0xffffcc,
        emissive: 0xffffcc,
        emissiveIntensity: 0.3
      })
    );
    headlight.position.set(0, 0.8, -1.7);
    snowmobile.add(headlight);

    // Position on terrain
    const terrainY = heightmapData && terrainConfig
      ? getHeightAt(x, z, heightmapData, terrainConfig)
      : 0;
    snowmobile.position.set(x, terrainY, -z);
    snowmobile.rotation.y = rotation;

    return snowmobile;
  }

  // ===== HELPER: Create Snow Groomer (Dameuse) =====
  function createDameuse(x: number, z: number, rotation: number = 0) {
    const dameuse = new THREE.Group();

    // Main cabin
    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(3, 2.5, 3),
      redMat
    );
    cabin.position.y = 2.5;
    cabin.castShadow = true;
    dameuse.add(cabin);

    // Windows
    const windowMat = new THREE.MeshStandardMaterial({
      color: 0x88ccff,
      roughness: 0.1,
      metalness: 0.3,
      transparent: true,
      opacity: 0.7
    });
    const frontWindow = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, 1.2, 0.1),
      windowMat
    );
    frontWindow.position.set(0, 2.8, -1.5);
    dameuse.add(frontWindow);

    // Side windows
    [-1, 1].forEach(side => {
      const sideWindow = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 1.2, 1.5),
        windowMat
      );
      sideWindow.position.set(side * 1.5, 2.8, -0.5);
      dameuse.add(sideWindow);
    });

    // Engine hood
    const hood = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 1.5, 2),
      redMat
    );
    hood.position.set(0, 1.5, -2);
    hood.castShadow = true;
    dameuse.add(hood);

    // Tracks (two caterpillar tracks)
    [-1.2, 1.2].forEach(side => {
      const track = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 1.2, 5),
        blackMat
      );
      track.position.set(side, 0.6, 0);
      track.castShadow = true;
      dameuse.add(track);

      // Track wheels
      for (let i = 0; i < 4; i++) {
        const wheel = new THREE.Mesh(
          new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16),
          darkMetalMat
        );
        wheel.position.set(side, 0.5, -1.8 + i * 1.2);
        wheel.rotation.z = Math.PI / 2;
        dameuse.add(wheel);
      }
    });

    // Front blade
    const blade = new THREE.Mesh(
      new THREE.BoxGeometry(4, 1, 0.3),
      yellowMat
    );
    blade.position.set(0, 0.5, -3.2);
    blade.castShadow = true;
    dameuse.add(blade);

    // Exhaust pipe
    const exhaust = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.12, 1, 8),
      darkMetalMat
    );
    exhaust.position.set(1.2, 3.5, 0);
    dameuse.add(exhaust);

    // Warning lights on top
    const warningLight = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, 0.3, 8),
      new THREE.MeshStandardMaterial({
        color: 0xff6600,
        emissive: 0xff6600,
        emissiveIntensity: 0.6
      })
    );
    warningLight.position.set(0, 3.9, 0);
    dameuse.add(warningLight);

    // Position on terrain
    const terrainY = heightmapData && terrainConfig
      ? getHeightAt(x, z, heightmapData, terrainConfig)
      : 0;
    dameuse.position.set(x, terrainY, -z);
    dameuse.rotation.y = rotation;

    return dameuse;
  }

  // ===== PLACE OBSTACLES ALONG THE COURSE =====
  // Course is 8000m long, we want obstacles distributed but not too frequent

  // 1. SKI LIFT PYLONS - Along the sides of the course (6-8 pylons)
  const pylonPositions = [
    { x: -45, z: 600 },   // Left side, early course
    { x: 42, z: 1400 },   // Right side
    { x: -48, z: 2200 },  // Left side
    { x: 45, z: 3200 },   // Right side
    { x: -44, z: 4400 },  // Left side
    { x: 46, z: 5500 },   // Right side
    { x: -47, z: 6600 },  // Left side
  ];

  pylonPositions.forEach(pos => {
    const pylon = createObstaclePylon(pos.x, pos.z, 10 + Math.random() * 5);
    courseObstacles.add(pylon);
  });

  // 2. ROCKS - Scattered along course sides and some near center (12-15 rocks)
  const rockPositions = [
    { x: -32, z: 400, size: 1.5 },
    { x: 28, z: 850, size: 2 },
    { x: -25, z: 1200, size: 1.2 },
    { x: 35, z: 1800, size: 1.8 },
    { x: -30, z: 2400, size: 2.2 },
    { x: 22, z: 2900, size: 1.4 },
    { x: -28, z: 3500, size: 1.6 },
    { x: 33, z: 4100, size: 2 },
    { x: -35, z: 4700, size: 1.3 },
    { x: 26, z: 5200, size: 1.9 },
    { x: -24, z: 5800, size: 1.5 },
    { x: 30, z: 6400, size: 2.1 },
    { x: -33, z: 7000, size: 1.7 },
    { x: 27, z: 7500, size: 1.4 },
  ];

  rockPositions.forEach(pos => {
    const rock = createRock(pos.x, pos.z, pos.size);
    courseObstacles.add(rock);
  });

  // 3. SNOW CANNONS - On the sides (5-6 cannons)
  const cannonPositions = [
    { x: -40, z: 800 },
    { x: 38, z: 1900 },
    { x: -42, z: 3100 },
    { x: 40, z: 4300 },
    { x: -38, z: 5600 },
    { x: 41, z: 6900 },
  ];

  cannonPositions.forEach(pos => {
    const cannon = createSnowCannon(pos.x, pos.z);
    courseObstacles.add(cannon);
  });

  // 4. SNOWMOBILES - Parked on sides or crossing angle (4-5 snowmobiles)
  const snowmobilePositions = [
    { x: -35, z: 1100, rot: Math.PI * 0.3 },
    { x: 32, z: 2600, rot: -Math.PI * 0.2 },
    { x: -30, z: 4000, rot: Math.PI * 0.4 },
    { x: 36, z: 5400, rot: -Math.PI * 0.25 },
    { x: -34, z: 7200, rot: Math.PI * 0.15 },
  ];

  snowmobilePositions.forEach(pos => {
    const snowmobile = createSnowmobile(pos.x, pos.z, pos.rot);
    courseObstacles.add(snowmobile);
  });

  // 5. DAMEUSES (Snow Groomers) - Parked on sides (3-4 dameuses)
  const dameusePositions = [
    { x: -50, z: 1600, rot: Math.PI * 0.1 },
    { x: 48, z: 3600, rot: -Math.PI * 0.15 },
    { x: -52, z: 5900, rot: Math.PI * 0.2 },
    { x: 50, z: 7400, rot: -Math.PI * 0.05 },
  ];

  dameusePositions.forEach(pos => {
    const dameuse = createDameuse(pos.x, pos.z, pos.rot);
    courseObstacles.add(dameuse);
  });

  scene.add(courseObstacles);
  console.log('  ✓ Course Obstacles (pylons, rocks, cannons, snowmobiles, dameuses)');
}

// ==================== ORGANIC CAMO TEXTURE ====================

/**
 * Draw an organic blob shape using Bézier curves
 */
function drawOrganicBlob(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  color: string,
  sizeMultiplier: number = 1
): void {
  const cx = Math.random() * width;
  const cy = Math.random() * height;
  const baseSize = (25 + Math.random() * 45) * sizeMultiplier;

  ctx.beginPath();

  // Start point
  const startAngle = Math.random() * Math.PI * 2;
  const startRadius = baseSize * (0.6 + Math.random() * 0.5);
  const startX = cx + Math.cos(startAngle) * startRadius;
  const startY = cy + Math.sin(startAngle) * startRadius;
  ctx.moveTo(startX, startY);

  // Create organic shape with 6-8 control points using quadratic curves
  const numPoints = 6 + Math.floor(Math.random() * 3);
  for (let i = 1; i <= numPoints; i++) {
    const angle = startAngle + (i / numPoints) * Math.PI * 2;
    const nextAngle = startAngle + ((i + 1) / numPoints) * Math.PI * 2;

    const radius = baseSize * (0.5 + Math.random() * 0.7);
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;

    // Control point between current and next
    const cpAngle = (angle + nextAngle) / 2 + (Math.random() - 0.5) * 0.4;
    const cpRadius = baseSize * (0.8 + Math.random() * 0.6);
    const cpx = cx + Math.cos(cpAngle) * cpRadius;
    const cpy = cy + Math.sin(cpAngle) * cpRadius;

    ctx.quadraticCurveTo(cpx, cpy, x, y);
  }

  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

/**
 * Create organic alpine camouflage texture using Canvas2D
 * Generates flowing, natural-looking patterns instead of rectangles
 */
function createCamoTexture(width: number = 512, height: number = 512): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Alpine camo color palette
  const baseColor = '#4A5852';      // Sage green-gray (base)
  const lightColor = '#8A9A94';     // Light gray (highlights)
  const darkColor = '#3A4842';      // Dark green (shadows)
  const midColor = '#5A6862';       // Mid-tone for transitions

  // Fill with base color
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, width, height);

  // Layer 1: Large dark blobs (background depth)
  for (let i = 0; i < 5; i++) {
    drawOrganicBlob(ctx, width, height, darkColor, 1.4);
  }

  // Layer 2: Medium mid-tone blobs
  for (let i = 0; i < 6; i++) {
    drawOrganicBlob(ctx, width, height, midColor, 1.0);
  }

  // Layer 3: Light patches (highlights)
  for (let i = 0; i < 7; i++) {
    drawOrganicBlob(ctx, width, height, lightColor, 0.9);
  }

  // Layer 4: Small dark accents
  for (let i = 0; i < 4; i++) {
    drawOrganicBlob(ctx, width, height, darkColor, 0.6);
  }

  // Layer 5: Subtle light accents
  for (let i = 0; i < 3; i++) {
    drawOrganicBlob(ctx, width, height, lightColor, 0.5);
  }

  // Create texture
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 3); // Repeat for better coverage on capsule geometry
  texture.colorSpace = THREE.SRGBColorSpace;

  console.log('🎨 Created organic alpine camouflage texture');
  return texture;
}

// ==================== SKIER ====================
let skier: THREE.Group;

// Body parts for animation
interface SkierParts {
  torso: THREE.Mesh;
  head: THREE.Mesh;
  leftArm: THREE.Mesh;
  rightArm: THREE.Mesh;
  leftGlove: THREE.Mesh;
  rightGlove: THREE.Mesh;
  leftPole: THREE.Mesh;
  rightPole: THREE.Mesh;
  leftBasket: THREE.Mesh;
  rightBasket: THREE.Mesh;
}
let skierParts: SkierParts;

function createSkier() {
  skier = new THREE.Group();

  // Ethan's outfit - EXACT colors from photo
  // Light khaki jacket with organic alpine camo, fluorescent GREEN helmet, black pants
  // Veste - Vert sauge désaturé avec camouflage organique généré procéduralement
  const camoTexture = createCamoTexture(512, 512);
  const jacketMat = new THREE.MeshStandardMaterial({
    map: camoTexture,           // Organic camo texture
    roughness: 0.75,
    metalness: 0.05,
  });
  const pantsMat = new THREE.MeshStandardMaterial({
    color: 0x0a0a0a,  // Pure black pants
    roughness: 0.5,
    metalness: 0.0,
  });
  const suitAccentMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,  // Black accents
    roughness: 0.3,
  });
  // Helmet - VERT FLUO (green, not yellow!)
  const helmetMat = new THREE.MeshStandardMaterial({
    color: 0x66FF00,  // Vert fluo pur (pure fluorescent GREEN)
    roughness: 0.2,
    metalness: 0.1,
    emissive: 0x225500,
    emissiveIntensity: 0.25,
  });
  // Goggles - SAME fluorescent GREEN frame as helmet
  const gogglesFrameMat = new THREE.MeshStandardMaterial({
    color: 0x66FF00,  // Même vert fluo que le casque
    roughness: 0.2,
    metalness: 0.1,
    emissive: 0x225500,
    emissiveIntensity: 0.25,
  });
  const gogglesLensMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,  // Dark reflective lens
    metalness: 0.8,
    roughness: 0.1,
  });
  const neckWarmerMat = new THREE.MeshStandardMaterial({
    color: 0x0a0a0a,  // Black neck warmer/balaclava
    roughness: 0.9,
  });
  const skiMat = new THREE.MeshStandardMaterial({
    color: 0x1d3557,  // Dark blue skis
    metalness: 0.6,
    roughness: 0.15,
  });
  const bootMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,  // Black boots
    roughness: 0.3,
  });
  const poleMat = new THREE.MeshStandardMaterial({
    color: 0xcccccc,  // Silver poles
    metalness: 0.9,
    roughness: 0.1,
  });

  // Torso - light khaki jacket
  const torso = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.3, 0.6, 8, 16),
    jacketMat
  );
  torso.position.y = 1.1;
  torso.castShadow = true;
  skier.add(torso);

  // Neck warmer / balaclava (black)
  const neckWarmer = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.22, 0.25, 16),
    neckWarmerMat
  );
  neckWarmer.position.y = 1.45;
  skier.add(neckWarmer);

  // Head (face visible above neck warmer) - Ethan's fair skin with rosy cheeks
  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xF5D5C8,  // Fair skin tone like Ethan
    roughness: 0.9,
    metalness: 0.0
  });
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 16, 16),
    skinMat
  );
  head.position.y = 1.62;
  head.castShadow = true;
  skier.add(head);

  // Rosy cheeks
  const cheekMat = new THREE.MeshStandardMaterial({
    color: 0xE8A090,  // Rosy pink
    roughness: 1.0,
    transparent: true,
    opacity: 0.4
  });
  const leftCheek = new THREE.Mesh(
    new THREE.SphereGeometry(0.04, 8, 8),
    cheekMat
  );
  leftCheek.position.set(-0.1, 1.6, 0.14);
  skier.add(leftCheek);

  const rightCheek = new THREE.Mesh(
    new THREE.SphereGeometry(0.04, 8, 8),
    cheekMat
  );
  rightCheek.position.set(0.1, 1.6, 0.14);
  skier.add(rightCheek);

  // Helmet
  const helmet = new THREE.Mesh(
    new THREE.SphereGeometry(0.24, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.55),
    helmetMat
  );
  helmet.position.y = 1.72;
  helmet.castShadow = true;
  skier.add(helmet);

  // Goggles - lime green frame like helmet + dark lens
  const gogglesFrame = new THREE.Mesh(
    new THREE.TorusGeometry(0.18, 0.025, 8, 24, Math.PI),
    gogglesFrameMat
  );
  gogglesFrame.position.set(0, 1.68, 0.16);
  gogglesFrame.rotation.x = Math.PI / 2;
  gogglesFrame.rotation.z = Math.PI;
  skier.add(gogglesFrame);

  // Goggle lens (dark)
  const gogglesLens = new THREE.Mesh(
    new THREE.BoxGeometry(0.36, 0.09, 0.04),
    gogglesLensMat
  );
  gogglesLens.position.set(0, 1.68, 0.19);
  skier.add(gogglesLens);

  // Top frame bar (lime green)
  const gogglesTopBar = new THREE.Mesh(
    new THREE.BoxGeometry(0.38, 0.025, 0.03),
    gogglesFrameMat
  );
  gogglesTopBar.position.set(0, 1.725, 0.18);
  skier.add(gogglesTopBar);

  // Arms - light khaki jacket sleeves
  const leftArm = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.08, 0.25, 4, 8),
    jacketMat
  );
  leftArm.position.set(-0.38, 1.2, 0);
  leftArm.rotation.z = -0.4;
  leftArm.rotation.x = 0.3;
  leftArm.castShadow = true;
  skier.add(leftArm);

  const rightArm = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.08, 0.25, 4, 8),
    jacketMat
  );
  rightArm.position.set(0.38, 1.2, 0);
  rightArm.rotation.z = 0.4;
  rightArm.rotation.x = 0.3;
  rightArm.castShadow = true;
  skier.add(rightArm);

  const leftGlove = new THREE.Mesh(
    new THREE.SphereGeometry(0.07, 8, 8),
    bootMat
  );
  leftGlove.position.set(-0.55, 0.95, 0.12);
  skier.add(leftGlove);

  const rightGlove = new THREE.Mesh(
    new THREE.SphereGeometry(0.07, 8, 8),
    bootMat
  );
  rightGlove.position.set(0.55, 0.95, 0.12);
  skier.add(rightGlove);

  const leftPole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.012, 1.2, 8),
    poleMat
  );
  leftPole.position.set(-0.58, 0.4, 0.15);
  leftPole.rotation.x = 0.3;
  leftPole.rotation.z = -0.1;
  skier.add(leftPole);

  const rightPole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.012, 1.2, 8),
    poleMat
  );
  rightPole.position.set(0.58, 0.4, 0.15);
  rightPole.rotation.x = 0.3;
  rightPole.rotation.z = 0.1;
  skier.add(rightPole);

  const leftBasket = new THREE.Mesh(
    new THREE.RingGeometry(0.03, 0.1, 8),
    suitAccentMat
  );
  leftBasket.position.set(-0.62, -0.15, 0.28);
  leftBasket.rotation.x = -Math.PI / 2 + 0.3;
  skier.add(leftBasket);

  const rightBasket = new THREE.Mesh(
    new THREE.RingGeometry(0.03, 0.1, 8),
    suitAccentMat
  );
  rightBasket.position.set(0.62, -0.15, 0.28);
  rightBasket.rotation.x = -Math.PI / 2 + 0.3;
  skier.add(rightBasket);

  // Legs - BLACK pants
  [-0.14, 0.14].forEach(side => {
    const leg = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.1, 0.45, 4, 8),
      pantsMat
    );
    leg.position.set(side, 0.35, 0);
    leg.castShadow = true;
    skier.add(leg);

    const boot = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.12, 0.24),
      bootMat
    );
    boot.position.set(side, 0.06, 0.02);
    boot.castShadow = true;
    skier.add(boot);
  });

  // Skis
  [-0.18, 0.18].forEach(side => {
    const ski = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.025, 1.7),
      skiMat
    );
    ski.position.set(side, 0.012, 0);
    ski.castShadow = true;
    skier.add(ski);

    const tip = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.1, 8, 1, false, 0, Math.PI),
      skiMat
    );
    tip.position.set(side, 0.03, -0.85);
    tip.rotation.z = Math.PI / 2;
    tip.rotation.y = Math.PI / 2;
    skier.add(tip);

    const binding = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.04, 0.12),
      bootMat
    );
    binding.position.set(side, 0.04, 0);
    skier.add(binding);
  });

  skier.position.set(0, 0, 0);
  scene.add(skier);

  // Store references for celebration animation
  skierParts = {
    torso,
    head,
    leftArm,
    rightArm,
    leftGlove,
    rightGlove,
    leftPole,
    rightPole,
    leftBasket,
    rightBasket,
  };
}

// ==================== CELEBRATION ANIMATION ====================
let celebrationTime = 0;
let isCelebrating = false;

function playCelebrationAnimation() {
  isCelebrating = true;
  celebrationTime = 0;

  // Initial pose - slow down and prepare
  state.speed = Math.max(state.speed * 0.3, 20); // Slow down dramatically

  // Start crowd cheering!
  startSpectatorsCheering();

  // Animation will be updated in updateCelebration()
}

function updateCelebration(delta: number) {
  if (!isCelebrating) return;

  celebrationTime += delta;

  const t = celebrationTime;

  // Keep moving forward slowly during celebration
  if (state.speed > 5) {
    state.speed *= 0.98;
  }
  const moveZ = state.speed * delta * 0.3;
  skier.position.z -= moveZ;

  // Get terrain height at skier's current position
  // Use finish line height as fallback for the celebration area
  const finishZ = GAME.COURSE_LENGTH;
  const finishTerrainY = heightmapData && terrainConfig
    ? getHeightAt(0, finishZ, heightmapData, terrainConfig)
    : 0;

  let terrainY = heightmapData && terrainConfig
    ? getHeightAt(skier.position.x, -skier.position.z, heightmapData, terrainConfig)
    : finishTerrainY;

  // Safety: if terrain height is NaN or way off, use finish line height
  if (isNaN(terrainY) || terrainY < finishTerrainY - 50 || terrainY > finishTerrainY + 50) {
    terrainY = finishTerrainY;
  }

  // Calculate jump height for victory jumps
  let jumpOffset = 0;

  // Phase 1: Raise arms in victory (0-1s)
  if (t < 1.0) {
    const progress = t / 1.0;
    const easeOut = 1 - Math.pow(1 - progress, 3);

    // Raise arms up in V shape
    skierParts.leftArm.rotation.z = THREE.MathUtils.lerp(-0.4, -2.5, easeOut);
    skierParts.leftArm.rotation.x = THREE.MathUtils.lerp(0.3, -0.3, easeOut);
    skierParts.rightArm.rotation.z = THREE.MathUtils.lerp(0.4, 2.5, easeOut);
    skierParts.rightArm.rotation.x = THREE.MathUtils.lerp(0.3, -0.3, easeOut);

    // Move gloves up with arms
    skierParts.leftGlove.position.y = THREE.MathUtils.lerp(0.95, 1.9, easeOut);
    skierParts.leftGlove.position.x = THREE.MathUtils.lerp(-0.55, -0.7, easeOut);
    skierParts.rightGlove.position.y = THREE.MathUtils.lerp(0.95, 1.9, easeOut);
    skierParts.rightGlove.position.x = THREE.MathUtils.lerp(0.55, 0.7, easeOut);

    // Raise poles triumphantly
    skierParts.leftPole.position.y = THREE.MathUtils.lerp(0.4, 1.8, easeOut);
    skierParts.leftPole.rotation.z = THREE.MathUtils.lerp(-0.1, -0.8, easeOut);
    skierParts.rightPole.position.y = THREE.MathUtils.lerp(0.4, 1.8, easeOut);
    skierParts.rightPole.rotation.z = THREE.MathUtils.lerp(0.1, 0.8, easeOut);

    skierParts.leftBasket.position.y = THREE.MathUtils.lerp(-0.15, 1.3, easeOut);
    skierParts.rightBasket.position.y = THREE.MathUtils.lerp(-0.15, 1.3, easeOut);
  }

  // Phase 2: Victory jumps and fist pumps (1-3.5s)
  if (t >= 1.0 && t < 3.5) {
    const jumpT = (t - 1.0) * 3; // Faster jumps
    jumpOffset = Math.abs(Math.sin(jumpT * Math.PI)) * 0.5; // Jump height

    // Pump fists
    const pump = Math.sin(jumpT * Math.PI * 2) * 0.2;
    skierParts.leftArm.rotation.x = -0.3 + pump;
    skierParts.rightArm.rotation.x = -0.3 - pump;

    // Slight body rotation (looking around triumphantly)
    skier.rotation.y = Math.sin(t * 2) * 0.3;
  }

  // Phase 3: Turn to camera and final pose (3.5-4s)
  if (t >= 3.5 && t < 4.5) {
    const progress = (t - 3.5) / 1.0;
    const easeInOut = progress < 0.5
      ? 2 * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 2) / 2;

    // Turn to face more towards camera
    skier.rotation.y = THREE.MathUtils.lerp(skier.rotation.y, 0.5, easeInOut * 0.1);
  }

  // Set skier Y position based on terrain + jump offset
  // Note: skier model has feet at origin, so terrainY is the ground level
  skier.position.y = terrainY + jumpOffset;

  // End celebration and show results (after 4s)
  if (t >= 4.0) {
    isCelebrating = false;
    showFinishScreen();
  }
}

// Track if current score was saved (to avoid duplicates)
let currentScoreSaved = false;

async function showFinishScreen() {
  state.phase = 'finished';
  currentScoreSaved = false;

  // Stop game audio after celebration
  stopGameAudio();

  const totalTime = state.time + state.penalties;

  document.getElementById('final-time')!.textContent = formatTime(state.time);
  document.getElementById('final-penalties')!.textContent = `+${state.penalties.toFixed(1)}s`;
  document.getElementById('final-total')!.textContent = formatTime(totalTime);
  document.getElementById('final-speed')!.textContent = `${Math.round(state.maxSpeed)} km/h`;
  document.getElementById('final-gates')!.textContent = `${state.gatesPassed}/${gates.length}`;

  // Check if it's a new record
  const isRecord = await isNewRecord(totalTime);
  const newRecordSection = document.getElementById('new-record-section');
  const playerNameInput = document.getElementById('player-name-input') as HTMLInputElement;

  if (isRecord) {
    newRecordSection?.classList.remove('hidden');
    playerNameInput?.focus();
  } else {
    newRecordSection?.classList.add('hidden');
  }

  // Display the current leaderboard
  await renderLeaderboard(totalTime, isRecord);

  document.getElementById('hud')?.classList.add('hidden');
  document.getElementById('finish-screen')?.classList.remove('hidden');
  document.getElementById('finish-screen')?.classList.add('active');
}

async function renderLeaderboard(currentTime: number, isNewRecordPending: boolean): Promise<void> {
  const leaderboard = await loadLeaderboard();
  const listEl = document.getElementById('leaderboard-list');
  if (!listEl) return;

  // If no records and not a pending new record, show empty message
  if (leaderboard.length === 0 && !isNewRecordPending) {
    listEl.innerHTML = '<div class="leaderboard-empty">Aucun record pour l\'instant</div>';
    return;
  }

  // Generate leaderboard HTML
  let html = '';
  const rankClasses = ['gold', 'silver', 'bronze'];
  const rankEmojis = ['🥇', '🥈', '🥉'];

  leaderboard.forEach((entry, index) => {
    const rankClass = rankClasses[index] || '';
    const rankEmoji = rankEmojis[index] || `${index + 1}`;

    html += `
      <div class="leaderboard-entry">
        <span class="leaderboard-rank ${rankClass}">${rankEmoji}</span>
        <div class="leaderboard-info">
          <span class="leaderboard-name">${escapeHtml(entry.name)}</span>
          <span class="leaderboard-date">${entry.date}</span>
        </div>
        <span class="leaderboard-time">${formatTime(entry.time)}</span>
      </div>
    `;
  });

  // If there are fewer than 3 entries and this would be a record, show placeholder
  if (leaderboard.length < MAX_LEADERBOARD_ENTRIES && isNewRecordPending) {
    const position = getLeaderboardPosition(currentTime);
    // We'll show where the new record will appear after saving
  }

  listEl.innerHTML = html || '<div class="leaderboard-empty">Aucun record pour l\'instant</div>';
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

async function saveCurrentRecord(): Promise<void> {
  if (currentScoreSaved) return;

  const totalTime = state.time + state.penalties;
  const playerNameInput = document.getElementById('player-name-input') as HTMLInputElement;
  const playerName = playerNameInput?.value.trim() || 'Anonyme';

  // Save to leaderboard
  await addToLeaderboard(playerName, totalTime);
  currentScoreSaved = true;

  // Hide the new record section
  document.getElementById('new-record-section')?.classList.add('hidden');

  // Re-render leaderboard with the new entry
  await renderLeaderboard(totalTime, false);
}

// ==================== SPRAY PARTICLES ====================
let sprayParticles: THREE.Points;
let sprayIndex = 0;

function createSprayParticles() {
  const count = 300;
  const positions = new Float32Array(count * 3);
  const lifetimes = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = 0;
    positions[i * 3 + 1] = -100;
    positions[i * 3 + 2] = 0;
    lifetimes[i] = 0;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('lifetime', new THREE.BufferAttribute(lifetimes, 1));

  const mat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.2,
    transparent: true,
    opacity: 0.8,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  sprayParticles = new THREE.Points(geo, mat);
  scene.add(sprayParticles);
}

function updateSprayParticles() {
  if (!sprayParticles || state.phase !== 'racing') return;

  const positions = sprayParticles.geometry.attributes.position.array as Float32Array;
  const lifetimes = sprayParticles.geometry.attributes.lifetime.array as Float32Array;

  // Spawn spray when turning fast
  if (Math.abs(state.lateralSpeed) > 0.3 && state.speed > 20) {
    for (let i = 0; i < 3; i++) {
      const idx = sprayIndex % 300;
      const side = state.lateralSpeed > 0 ? -1 : 1;
      positions[idx * 3] = skier.position.x + side * 0.3 + (Math.random() - 0.5) * 0.2;
      positions[idx * 3 + 1] = skier.position.y + 0.1 + Math.random() * 0.2;
      positions[idx * 3 + 2] = skier.position.z + 0.3;
      lifetimes[idx] = 1.0;
      sprayIndex++;
    }
  }

  // Update existing particles
  for (let i = 0; i < 300; i++) {
    if (lifetimes[i] > 0) {
      lifetimes[i] -= 0.03;
      positions[i * 3 + 1] += 0.02;
      positions[i * 3 + 2] += 0.02;
    }
  }

  sprayParticles.geometry.attributes.position.needsUpdate = true;
}

// ==================== GAME LOGIC ====================
function resetGame() {
  state.phase = 'title';
  state.time = 0;
  state.speed = 0;
  state.maxSpeed = 0;
  state.distance = 0;
  state.penalties = 0;
  state.gatesPassed = 0;
  state.gatesMissed = 0;
  state.countdownValue = 3;
  state.lastGateIndex = -1;

  state.velocity.set(0, 0, 0);
  state.lateralSpeed = 0;
  state.edgeAngle = 0;
  state.isTucking = false;
  state.isCarving = false;
  state.isDrifting = false;
  state.gateSpeedBonus = 0; // Reset progressive speed bonus

  // Reset splits
  state.splits.forEach(s => {
    s.time = null;
    s.passed = false;
  });

  // Reset gates
  gates.forEach(g => {
    g.passed = false;
    g.missed = false;
  });

  // Position skier on the start platform
  // Get terrain height at start position and add platform surface height
  const startTerrainY = heightmapData && terrainConfig
    ? getHeightAt(0, 0, heightmapData, terrainConfig)
    : 0;
  // Platform is at Y = startTerrainY + 0.8 + 0.2 (center + half thickness)
  // Platform top surface = startTerrainY + 1.2
  const platformSurfaceY = startTerrainY + 1.2;
  skier.position.set(0, platformSurfaceY, 2); // Start on platform (Z=2)
  skier.rotation.set(0, 0, 0);

  // Reset celebration animation state
  isCelebrating = false;
  celebrationTime = 0;

  // Stop spectators cheering
  stopSpectatorsCheering();

  // Reset skier pose (in case celebration was interrupted)
  if (skierParts) {
    skierParts.leftArm.rotation.set(0.3, 0, -0.4);
    skierParts.rightArm.rotation.set(0.3, 0, 0.4);
    skierParts.leftGlove.position.set(-0.55, 0.95, 0.12);
    skierParts.rightGlove.position.set(0.55, 0.95, 0.12);
    skierParts.leftPole.position.set(-0.58, 0.4, 0.15);
    skierParts.leftPole.rotation.set(0.3, 0, -0.1);
    skierParts.rightPole.position.set(0.58, 0.4, 0.15);
    skierParts.rightPole.rotation.set(0.3, 0, 0.1);
    skierParts.leftBasket.position.set(-0.62, -0.15, 0.28);
    skierParts.rightBasket.position.set(0.62, -0.15, 0.28);
  }

  camera.position.set(0, platformSurfaceY + 6, 17);

  updateUI();
}

function startCountdown() {
  resetGame();
  state.phase = 'countdown';
  state.countdownValue = 3;

  // Initialize audio on first user interaction
  initAudio();
  playButtonClick();

  document.getElementById('title-screen')?.classList.remove('active');
  document.getElementById('hud')?.classList.remove('hidden');

  showCountdown();
}

function showCountdown() {
  const countdownEl = document.getElementById('countdown');
  if (countdownEl) {
    countdownEl.textContent = state.countdownValue.toString();
    countdownEl.classList.remove('hidden');
    countdownEl.classList.add('pulse');
  }

  // Play countdown beep
  playCountdownBeep(false);

  if (state.countdownValue > 0) {
    setTimeout(() => {
      state.countdownValue--;
      if (state.countdownValue > 0) {
        showCountdown();
      } else {
        // GO!
        playCountdownBeep(true); // Final beep (higher pitch)
        playStartSound();
        startGameAudio(); // Start ambient sounds

        if (countdownEl) {
          countdownEl.textContent = 'GO!';
          setTimeout(() => {
            countdownEl.classList.add('hidden');
            state.phase = 'racing';
          }, 500);
        }
      }
    }, 1000);
  }
}

function checkGates() {
  const skierZ = -skier.position.z;

  for (let i = state.lastGateIndex + 1; i < gates.length; i++) {
    const gate = gates[i];
    const gateZ = -gate.position.z;

    // Check if we've passed this gate
    if (skierZ > gateZ + 2) {
      if (!gate.passed && !gate.missed) {
        // Check if we went through the gate
        const gateLeft = gate.position.x - GAME.GATE_WIDTH / 2;
        const gateRight = gate.position.x + GAME.GATE_WIDTH / 2;

        if (skier.position.x >= gateLeft && skier.position.x <= gateRight) {
          gate.passed = true;
          state.gatesPassed++;
          playGatePass(); // Success sound

          // SPEED BOOST - Progressive difficulty!
          // 1. Accumulate gate bonus - this raises the MINIMUM speed floor permanently
          state.gateSpeedBonus += GAME.GATE_SPEED_BOOST;
          // 2. Immediate speed kick - player feels the boost right away!
          // Full boost amount for noticeable acceleration
          state.speed += GAME.GATE_SPEED_BOOST;

          // 3. Visual feedback - flash speed indicator
          showSpeedBoost();

          // Flash gate green
          const successColor = new THREE.Color(0x4CAF50);
          (gate.leftPole.material as THREE.MeshStandardMaterial).emissive = successColor;
          (gate.rightPole.material as THREE.MeshStandardMaterial).emissive = successColor;
          setTimeout(() => {
            const originalColor = gate.isRed ? GRAPHICS.GATE_RED : GRAPHICS.GATE_BLUE;
            (gate.leftPole.material as THREE.MeshStandardMaterial).emissive = originalColor;
            (gate.rightPole.material as THREE.MeshStandardMaterial).emissive = originalColor;
          }, 200);
        } else {
          gate.missed = true;
          state.gatesMissed++;
          state.penalties += GAME.GATE_PENALTY_TIME;
          playGateMiss(); // Penalty sound

          // SPEED PENALTY - Missing gates slows you down!
          // 1. Reduce the accumulated bonus (minimum floor drops)
          state.gateSpeedBonus = Math.max(0, state.gateSpeedBonus - GAME.GATE_SPEED_BOOST * 1.5);
          // 2. Immediate speed reduction - player feels the penalty!
          state.speed *= 0.85; // Lose 15% of current speed

          // Flash gate red
          (gate.leftPole.material as THREE.MeshStandardMaterial).emissive = new THREE.Color(0xff0000);
          (gate.rightPole.material as THREE.MeshStandardMaterial).emissive = new THREE.Color(0xff0000);

          // Show penalty
          showPenalty();
        }
        state.lastGateIndex = i;
      }
    }
  }
}

function showPenalty() {
  const penaltyEl = document.getElementById('penalty');
  if (penaltyEl) {
    penaltyEl.classList.remove('hidden');
    penaltyEl.classList.add('show');
    setTimeout(() => {
      penaltyEl.classList.remove('show');
      penaltyEl.classList.add('hidden');
    }, 1500);
  }
}

function showSpeedBoost() {
  // Flash the speed indicator green to show boost
  const speedBox = document.querySelector('.speed-box') as HTMLElement;
  const speedValue = document.getElementById('speed-value');
  if (speedBox && speedValue) {
    speedBox.classList.add('speed-boost');
    speedValue.style.color = '#4CAF50';
    speedValue.style.textShadow = '0 0 20px #4CAF50, 0 0 40px #4CAF50';
    speedValue.style.transform = 'scale(1.2)';

    setTimeout(() => {
      speedBox.classList.remove('speed-boost');
      speedValue.style.color = '';
      speedValue.style.textShadow = '';
      speedValue.style.transform = '';
    }, 300);
  }
}

function checkSplits() {
  for (const split of state.splits) {
    if (!split.passed && state.distance >= split.distance) {
      split.time = state.time;
      split.passed = true;
      showSplit(split);
    }
  }
}

function showSplit(split: Split) {
  const splitEl = document.getElementById('split-time');
  if (splitEl && split.time !== null) {
    splitEl.textContent = formatTime(split.time);
    splitEl.classList.remove('hidden');
    setTimeout(() => {
      splitEl.classList.add('hidden');
    }, 2000);
  }
}

function finishRace() {
  state.phase = 'celebrating';

  // Play finish sound
  playFinishSound();

  // Start victory celebration animation!
  playCelebrationAnimation();

  // Audio will stop when celebration ends
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(2);
  return `${mins}:${secs.padStart(5, '0')}`;
}

function updateUI() {
  // Time
  document.getElementById('time-value')!.textContent = formatTime(state.time);

  // Speed
  document.getElementById('speed-value')!.textContent = Math.round(state.speed).toString();

  // Gates - show passed vs total gates
  document.getElementById('gates-value')!.textContent =
    `${state.gatesPassed}/${gates.length}`;

  // Penalties
  if (state.penalties > 0) {
    document.getElementById('penalties-value')!.textContent = `+${state.penalties.toFixed(1)}s`;
    document.getElementById('penalties-box')!.classList.remove('hidden');
  }

  // Progress
  const progress = Math.min(state.distance / GAME.COURSE_LENGTH * 100, 100);
  document.getElementById('progress-fill')!.style.width = `${progress}%`;
}

// ==================== PHYSICS ====================
function updatePhysics(delta: number) {
  if (state.phase !== 'racing') return;

  state.time += delta;

  // Acceleration based on slope (time-scaled)
  const slopeAccel = GAME.ACCELERATION * (1 + Math.sin(THREE.MathUtils.degToRad(GAME.SLOPE_STEEPNESS))) * 60;

  // Tuck bonus
  const speedMultiplier = state.isTucking ? GAME.TUCK_SPEED_BONUS : 1.0;

  // Apply acceleration (multiplied by delta for framerate independence)
  state.speed += slopeAccel * speedMultiplier * delta;

  // Air resistance (increases with speed squared) - time-scaled
  const airDrag = state.speed * state.speed * GAME.AIR_RESISTANCE * 60;
  state.speed -= airDrag * delta;

  // Friction - time-scaled
  state.speed -= GAME.FRICTION * state.speed * 60 * delta;

  // PROGRESSIVE DIFFICULTY: Gate bonus creates minimum speed floor
  // Each gate passed permanently raises the minimum speed (bonus accumulates)
  // At 55 gates × 5 km/h = up to 275 km/h bonus (capped at MAX_SPEED)
  // This makes the game MUCH harder as you progress!
  const minSpeed = state.gateSpeedBonus; // 100% of accumulated bonus as floor
  state.speed = Math.max(state.speed, minSpeed);

  // Clamp speed
  state.speed = Math.min(state.speed, GAME.MAX_SPEED);
  state.speed = Math.max(state.speed, 0);
  state.maxSpeed = Math.max(state.maxSpeed, state.speed);

  // Steering
  let targetLateral = 0;
  if (state.input.left) {
    targetLateral = GAME.TURN_RATE * (state.speed / 50);
    state.edgeAngle = Math.min(state.edgeAngle + 3, GAME.EDGE_ANGLE_MAX);
  } else if (state.input.right) {
    targetLateral = -GAME.TURN_RATE * (state.speed / 50);
    state.edgeAngle = Math.max(state.edgeAngle - 3, -GAME.EDGE_ANGLE_MAX);
  } else {
    state.edgeAngle *= 0.9; // Return to neutral
  }

  // Carving vs drifting
  const turnIntensity = Math.abs(targetLateral);
  state.isCarving = turnIntensity > 0 && turnIntensity < GAME.DRIFT_THRESHOLD;
  state.isDrifting = turnIntensity >= GAME.DRIFT_THRESHOLD;

  // Apply lateral movement with grip
  const grip = state.isCarving ? GAME.CARVING_GRIP : 0.75;
  state.lateralSpeed = state.lateralSpeed * grip + targetLateral * (1 - grip);

  // Speed penalty when turning hard
  if (state.isDrifting) {
    state.speed *= 0.995;
  }

  // Move skier
  const moveZ = state.speed * delta * 0.3; // Scale for feel
  skier.position.z -= moveZ;
  state.distance += moveZ;

  skier.position.x += state.lateralSpeed;
  skier.position.x = THREE.MathUtils.clamp(
    skier.position.x,
    -GAME.COURSE_WIDTH / 2 + 1,
    GAME.COURSE_WIDTH / 2 - 1
  );

  // Update Y for terrain - handle podium transition
  const startTerrainY = heightmapData && terrainConfig
    ? getHeightAt(0, 0, heightmapData, terrainConfig)
    : 0;

  // Podium zone: Z from 4 (back of platform) to -3 (end of ramp)
  const podiumStart = 4;    // Back of platform
  const podiumEnd = -3;     // Where ramp meets terrain
  const platformSurfaceY = startTerrainY + 1.2;  // Top of platform

  if (skier.position.z > podiumEnd) {
    // On podium or ramp - calculate height based on position
    if (skier.position.z > 0) {
      // On the flat platform section
      skier.position.y = platformSurfaceY;
    } else {
      // On the ramp - interpolate from platform to terrain
      const rampProgress = -skier.position.z / (-podiumEnd); // 0 at Z=0, 1 at Z=podiumEnd
      const terrainY = heightmapData && terrainConfig
        ? getHeightAt(skier.position.x, -skier.position.z, heightmapData, terrainConfig)
        : startTerrainY;
      // Smooth interpolation from platform height to terrain height
      const smoothProgress = rampProgress * rampProgress * (3 - 2 * rampProgress); // smoothstep
      skier.position.y = platformSurfaceY * (1 - smoothProgress) + terrainY * smoothProgress;
    }
  } else if (heightmapData && terrainConfig) {
    // Past the podium - use normal terrain heightmap
    const terrainY = getHeightAt(
      skier.position.x,
      -skier.position.z, // Convert to terrain space
      heightmapData,
      terrainConfig
    );
    skier.position.y = terrainY;
  } else {
    // Fallback to simple slope calculation
    const slopeY = skier.position.z * Math.tan(THREE.MathUtils.degToRad(GAME.SLOPE_STEEPNESS)) * 0.5;
    skier.position.y = slopeY;
  }

  // Skier rotation
  skier.rotation.z = THREE.MathUtils.degToRad(-state.edgeAngle * 0.5);
  skier.rotation.y = state.lateralSpeed * 0.8;

  // Tuck pose - realistic aerodynamic position
  state.isTucking = state.input.tuck;
  const tuckLerp = 0.15; // Smooth transition speed

  if (state.isTucking) {
    // Body crouches down
    skier.scale.y = THREE.MathUtils.lerp(skier.scale.y, 0.85, tuckLerp);

    // === POLES UNDER ARMS - Pointing backward ===
    // Left pole: horizontal, under left arm, pointing backward-up
    skierParts.leftPole.position.lerp(
      new THREE.Vector3(-0.25, 1.0, 0.1), tuckLerp
    );
    skierParts.leftPole.rotation.x = THREE.MathUtils.lerp(
      skierParts.leftPole.rotation.x, Math.PI * 0.45, tuckLerp  // ~81° - almost horizontal backward
    );
    skierParts.leftPole.rotation.z = THREE.MathUtils.lerp(
      skierParts.leftPole.rotation.z, 0.1, tuckLerp  // Slight inward tilt
    );
    skierParts.leftPole.rotation.y = THREE.MathUtils.lerp(
      skierParts.leftPole.rotation.y, -0.15, tuckLerp  // Slight outward angle
    );

    // Right pole: mirror of left
    skierParts.rightPole.position.lerp(
      new THREE.Vector3(0.25, 1.0, 0.1), tuckLerp
    );
    skierParts.rightPole.rotation.x = THREE.MathUtils.lerp(
      skierParts.rightPole.rotation.x, Math.PI * 0.45, tuckLerp
    );
    skierParts.rightPole.rotation.z = THREE.MathUtils.lerp(
      skierParts.rightPole.rotation.z, -0.1, tuckLerp
    );
    skierParts.rightPole.rotation.y = THREE.MathUtils.lerp(
      skierParts.rightPole.rotation.y, 0.15, tuckLerp
    );

    // === BASKETS follow poles ===
    skierParts.leftBasket.position.lerp(
      new THREE.Vector3(-0.15, 1.45, -0.55), tuckLerp  // Behind and up
    );
    skierParts.leftBasket.rotation.x = THREE.MathUtils.lerp(
      skierParts.leftBasket.rotation.x, -Math.PI * 0.55, tuckLerp
    );

    skierParts.rightBasket.position.lerp(
      new THREE.Vector3(0.15, 1.45, -0.55), tuckLerp
    );
    skierParts.rightBasket.rotation.x = THREE.MathUtils.lerp(
      skierParts.rightBasket.rotation.x, -Math.PI * 0.55, tuckLerp
    );

    // === ARMS tucked in, holding poles ===
    skierParts.leftArm.position.lerp(
      new THREE.Vector3(-0.28, 1.1, 0.15), tuckLerp
    );
    skierParts.leftArm.rotation.x = THREE.MathUtils.lerp(
      skierParts.leftArm.rotation.x, 0.8, tuckLerp  // Bent forward
    );
    skierParts.leftArm.rotation.z = THREE.MathUtils.lerp(
      skierParts.leftArm.rotation.z, -0.2, tuckLerp
    );

    skierParts.rightArm.position.lerp(
      new THREE.Vector3(0.28, 1.1, 0.15), tuckLerp
    );
    skierParts.rightArm.rotation.x = THREE.MathUtils.lerp(
      skierParts.rightArm.rotation.x, 0.8, tuckLerp
    );
    skierParts.rightArm.rotation.z = THREE.MathUtils.lerp(
      skierParts.rightArm.rotation.z, 0.2, tuckLerp
    );

    // Gloves follow arms
    skierParts.leftGlove.position.lerp(
      new THREE.Vector3(-0.35, 0.95, 0.25), tuckLerp
    );
    skierParts.rightGlove.position.lerp(
      new THREE.Vector3(0.35, 0.95, 0.25), tuckLerp
    );

  } else {
    // Return to normal standing pose
    skier.scale.y = THREE.MathUtils.lerp(skier.scale.y, 1.0, tuckLerp);

    // Poles back to normal position (down at sides)
    skierParts.leftPole.position.lerp(
      new THREE.Vector3(-0.58, 0.4, 0.15), tuckLerp
    );
    skierParts.leftPole.rotation.x = THREE.MathUtils.lerp(
      skierParts.leftPole.rotation.x, 0.3, tuckLerp
    );
    skierParts.leftPole.rotation.z = THREE.MathUtils.lerp(
      skierParts.leftPole.rotation.z, -0.1, tuckLerp
    );
    skierParts.leftPole.rotation.y = THREE.MathUtils.lerp(
      skierParts.leftPole.rotation.y, 0, tuckLerp
    );

    skierParts.rightPole.position.lerp(
      new THREE.Vector3(0.58, 0.4, 0.15), tuckLerp
    );
    skierParts.rightPole.rotation.x = THREE.MathUtils.lerp(
      skierParts.rightPole.rotation.x, 0.3, tuckLerp
    );
    skierParts.rightPole.rotation.z = THREE.MathUtils.lerp(
      skierParts.rightPole.rotation.z, 0.1, tuckLerp
    );
    skierParts.rightPole.rotation.y = THREE.MathUtils.lerp(
      skierParts.rightPole.rotation.y, 0, tuckLerp
    );

    // Baskets back to normal
    skierParts.leftBasket.position.lerp(
      new THREE.Vector3(-0.62, -0.15, 0.28), tuckLerp
    );
    skierParts.leftBasket.rotation.x = THREE.MathUtils.lerp(
      skierParts.leftBasket.rotation.x, -Math.PI / 2 + 0.3, tuckLerp
    );

    skierParts.rightBasket.position.lerp(
      new THREE.Vector3(0.62, -0.15, 0.28), tuckLerp
    );
    skierParts.rightBasket.rotation.x = THREE.MathUtils.lerp(
      skierParts.rightBasket.rotation.x, -Math.PI / 2 + 0.3, tuckLerp
    );

    // Arms back to normal
    skierParts.leftArm.position.lerp(
      new THREE.Vector3(-0.38, 1.2, 0), tuckLerp
    );
    skierParts.leftArm.rotation.x = THREE.MathUtils.lerp(
      skierParts.leftArm.rotation.x, 0.3, tuckLerp
    );
    skierParts.leftArm.rotation.z = THREE.MathUtils.lerp(
      skierParts.leftArm.rotation.z, -0.4, tuckLerp
    );

    skierParts.rightArm.position.lerp(
      new THREE.Vector3(0.38, 1.2, 0), tuckLerp
    );
    skierParts.rightArm.rotation.x = THREE.MathUtils.lerp(
      skierParts.rightArm.rotation.x, 0.3, tuckLerp
    );
    skierParts.rightArm.rotation.z = THREE.MathUtils.lerp(
      skierParts.rightArm.rotation.z, 0.4, tuckLerp
    );

    // Gloves back to normal
    skierParts.leftGlove.position.lerp(
      new THREE.Vector3(-0.55, 0.95, 0.12), tuckLerp
    );
    skierParts.rightGlove.position.lerp(
      new THREE.Vector3(0.55, 0.95, 0.12), tuckLerp
    );
  }

  // Check gates and splits
  checkGates();
  checkSplits();

  // Check finish
  if (state.distance >= GAME.COURSE_LENGTH) {
    finishRace();
  }

  updateUI();
}

// ==================== CAMERA ====================
function updateCamera() {
  // Broadcast-style camera - follows behind and slightly above
  const targetX = skier.position.x * 0.4;
  const targetY = skier.position.y + GAME.CAMERA_HEIGHT;

  // Dynamic distance: closer at high speed (reduces from 14 to 10 at max speed)
  const speedRatio = state.speed / GAME.MAX_SPEED;
  const dynamicDistance = GAME.CAMERA_DISTANCE - speedRatio * 4;
  const targetZ = skier.position.z + dynamicDistance;

  // Faster camera follow at high speed
  const dynamicLag = GAME.CAMERA_LAG + speedRatio * 0.04;

  camera.position.lerp(
    new THREE.Vector3(targetX, targetY, targetZ),
    dynamicLag
  );

  // Look ahead of the skier
  const lookTarget = new THREE.Vector3(
    skier.position.x * 0.7,
    skier.position.y + 1.5,
    skier.position.z - GAME.CAMERA_LOOK_AHEAD
  );

  camera.lookAt(lookTarget);
}

// ==================== MAIN LOOP ====================
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  const elapsed = clock.getElapsedTime();

  // Update terrain shader
  if (terrainMaterial) {
    updateTerrainShader(terrainMaterial, elapsed, camera.position);
  }

  // Update lighting - follow player for consistent shadows
  if (lightingSystem && state.phase === 'racing') {
    lightingSystem.updateSunTarget(skier.position);

    // Sync lighting to environment shaders (trees, rocks)
    const fog = scene.fog as THREE.Fog;
    if (fog) {
      updateEnvironmentLighting(
        lightingSystem.sun.position.clone().normalize(),
        lightingSystem.sun.color,
        fog.color,
        fog.near,
        fog.far
      );
    }
  }

  // Update atmosphere
  if (atmosphere) {
    updateAtmosphere(atmosphere, skier.position, elapsed);
  }

  // Update LOD mountains
  if (lodMountains.length > 0) {
    updateLODs(camera, lodMountains);
  }

  // Update tree wind animation
  updateTreeShader(elapsed);

  // Physics
  updatePhysics(delta);

  // Celebration animation (after finish line)
  if (state.phase === 'celebrating') {
    updateCelebration(delta);
    updateSpectators(elapsed);
  }

  // Camera
  updateCamera();

  // Particles
  updateSprayParticles();

  // Update audio based on game state
  if (state.phase === 'racing') {
    updateGameAudio(state.speed, GAME.MAX_SPEED, state.lateralSpeed, state.isTucking);
  }

  // Update post-processing effects based on speed
  if (postProcess) {
    updatePostProcessing(postProcess, state.speed, GAME.MAX_SPEED, delta);
    postProcess.composer.render();
  } else {
    renderer.render(scene, camera);
  }
}

// ==================== INPUT ====================
function setupInput() {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      state.input.left = true;
    }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      state.input.right = true;
    }
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
      state.input.tuck = true;
    }
    if (e.key === ' ' || e.key === 'Enter') {
      if (state.phase === 'title') {
        startCountdown();
      }
    }
    // Mute toggle
    if (e.key === 'm' || e.key === 'M') {
      const isMuted = toggleMute();
      showMuteStatus(isMuted);
    }
    // Music toggle
    if (e.key === 'n' || e.key === 'N') {
      const musicEnabled = toggleMusic();
      showMusicStatus(musicEnabled);
    }
  });

  window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      state.input.left = false;
    }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      state.input.right = false;
    }
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
      state.input.tuck = false;
    }
  });

  // Touch controls
  let touchStartX = 0;
  canvas.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    if (state.phase === 'title') {
      startCountdown();
    }
  });

  canvas.addEventListener('touchmove', (e) => {
    const diff = e.touches[0].clientX - touchStartX;
    const threshold = window.innerWidth * 0.05;
    state.input.left = diff < -threshold;
    state.input.right = diff > threshold;
  });

  canvas.addEventListener('touchend', () => {
    state.input.left = false;
    state.input.right = false;
  });
}

// ==================== UI SETUP ====================
function setupUI() {
  document.getElementById('start-btn')?.addEventListener('click', startCountdown);
  document.getElementById('retry-btn')?.addEventListener('click', () => {
    playButtonClick();
    document.getElementById('finish-screen')?.classList.add('hidden');
    document.getElementById('finish-screen')?.classList.remove('active');
    // Reset name input for next run
    const nameInput = document.getElementById('player-name-input') as HTMLInputElement;
    if (nameInput) nameInput.value = '';
    startCountdown();
  });

  // Leaderboard: Save record button
  document.getElementById('save-record-btn')?.addEventListener('click', saveCurrentRecord);

  // Leaderboard: Save on Enter key
  document.getElementById('player-name-input')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      saveCurrentRecord();
    }
  });
}

// Show mute status briefly
function showMuteStatus(isMuted: boolean) {
  // Create or get mute indicator
  let indicator = document.getElementById('mute-indicator');
  if (!indicator) {
    indicator = document.createElement('div');
    indicator.id = 'mute-indicator';
    indicator.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0,0,0,0.7);
      color: white;
      padding: 10px 20px;
      border-radius: 8px;
      font-family: sans-serif;
      font-size: 14px;
      z-index: 1000;
      transition: opacity 0.3s;
    `;
    document.body.appendChild(indicator);
  }

  indicator.textContent = isMuted ? '🔇 Son désactivé' : '🔊 Son activé';
  indicator.style.opacity = '1';

  setTimeout(() => {
    indicator!.style.opacity = '0';
  }, 1500);
}

function showMusicStatus(musicEnabled: boolean) {
  // Create or get music indicator
  let indicator = document.getElementById('music-indicator');
  if (!indicator) {
    indicator = document.createElement('div');
    indicator.id = 'music-indicator';
    indicator.style.cssText = `
      position: fixed;
      top: 60px;
      right: 20px;
      background: rgba(0,0,0,0.7);
      color: white;
      padding: 10px 20px;
      border-radius: 8px;
      font-family: sans-serif;
      font-size: 14px;
      z-index: 1000;
      transition: opacity 0.3s;
    `;
    document.body.appendChild(indicator);
  }

  indicator.textContent = musicEnabled ? '🎿 MUSIC ON' : '🎿 MUSIC OFF';
  indicator.style.opacity = '1';

  setTimeout(() => {
    indicator!.style.opacity = '0';
  }, 1500);
}

// ==================== RESIZE ====================
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);

  if (postProcess) {
    resizePostProcessing(postProcess, window.innerWidth, window.innerHeight);
  }
});

// ==================== LOADING PROGRESS UI ====================
function updateLoadingProgress(progress: LoadingProgress) {
  const loadingText = document.getElementById('loading-text');
  const loadingBar = document.getElementById('loading-bar-fill');

  if (loadingText) {
    loadingText.textContent = `Loading ${progress.currentItem}...`;
  }
  if (loadingBar) {
    const percent = (progress.loaded / progress.total) * 100;
    loadingBar.style.width = `${percent}%`;
  }
}

// ==================== INIT ====================
async function init() {
  console.log('🎿 Initializing Ski Challenge Pro with Professional Graphics...');
  console.log('📊 Systems loading:');

  // 0. Load GLTF Assets first (trees, rocks, textures, HDRI)
  console.log('  ⏳ Loading GLTF Assets...');
  try {
    gameAssets = await ensureAssetsLoaded(updateLoadingProgress);
    console.log(`  ✓ GLTF Assets (${gameAssets.trees.length} trees, ${gameAssets.rocks.length} rocks)`);

    // Apply HDRI environment if loaded
    if (gameAssets.hdri) {
      applyEnvironment(scene, gameAssets.hdri, 0.6);
      console.log('  ✓ HDRI Environment Map (Snowy Field)');
    }
  } catch (error) {
    console.warn('  ⚠ GLTF Assets failed to load, using procedural fallback:', error);
  }

  // 1. Setup lighting first
  setupLighting();
  console.log('  ✓ Lighting');

  // 2. Create materials
  materials = createAllMaterials();
  console.log('  ✓ PBR Materials');

  // 3. Setup atmosphere (sky + fog + snow) - only if no HDRI
  if (!gameAssets?.hdri) {
    atmosphere = setupCompleteAtmosphere(scene);
    console.log('  ✓ Volumetric Atmosphere');
  }

  // 4. Create advanced terrain with ImprovedNoise heightmap
  createTerrain();

  // Apply PBR snow textures if loaded
  if (gameAssets?.snowTextures && terrain) {
    const pbrSnowMaterial = createSnowMaterial(gameAssets.snowTextures);
    terrain.material = pbrSnowMaterial;
    console.log('  ✓ PBR Snow Terrain (Albedo + Normal + Roughness)');
  } else {
    console.log('  ✓ ImprovedNoise Terrain (6-octave Perlin)');
  }

  // 5. Create environment with instancing - pass heightmap AND GLTF assets
  createInstancedForest(scene, heightmapData, {
    courseLength: GAME.COURSE_LENGTH,
    courseWidth: GAME.COURSE_WIDTH,
    terrainConfig: terrainConfig,
    gltfTrees: gameAssets?.trees,
  });
  lodMountains = createLODMountainRange(scene, GAME.COURSE_LENGTH);
  createInstancedRocks(scene, heightmapData, {
    courseLength: GAME.COURSE_LENGTH,
    courseWidth: GAME.COURSE_WIDTH,
    terrainConfig: terrainConfig,
    gltfRocks: gameAssets?.rocks,
  });
  console.log('  ✓ Instanced Environment (GLTF models + terrain-aware)');

  // 6. Course elements
  createStartPodium();
  createSafetyNets();
  createCourseMarkers();
  createGates();
  createFinishLine();
  createOlympicFinishArena();
  createSkiResortVillage();
  createCourseObstacles();
  console.log('  ✓ Course Elements');

  // 7. Create skier
  createSkier();
  console.log('  ✓ Skier');

  // 8. Particles
  createSprayParticles();
  console.log('  ✓ Particles');

  // 9. Setup post-processing
  postProcess = createProPostProcessing(renderer, scene, camera);
  console.log('  ✓ Advanced Post-Processing (SSAO, Motion Blur, DOF)');

  // 10. Generate environment map for reflections (only if no HDRI)
  if (!gameAssets?.hdri) {
    envMap = createProceduralEnvMap(renderer);
    applyEnvMapToMaterials(materials, envMap);
    scene.environment = envMap;
    console.log('  ✓ Procedural Environment Map');
  }

  // 11. Input and UI
  setupInput();
  setupUI();

  console.log('🏔️ Ski Challenge Pro ready!');
  console.log('   Performance: Instanced rendering, LOD, Frustum culling');
  console.log('   Graphics: GLTF Models, HDRI Skybox, PBR Textures, SSAO');
  console.log('   Audio: Wind ambiance, ski sounds, speed whoosh, gate chimes');
  console.log('   Tip: Press M to toggle sound mute');

  setTimeout(() => {
    document.getElementById('loading-screen')?.classList.add('hidden');
  }, 1500);

  animate();
}

init();
