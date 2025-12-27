/**
 * TERRAIN GENERATOR - Realistic Heightmap with ImprovedNoise
 * Multi-octave Perlin noise for natural ski slope terrain
 */

import * as THREE from 'three';
import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise.js';

// ==================== TERRAIN CONFIGURATION ====================

export interface TerrainConfig {
  width: number;           // Total width (X axis)
  length: number;          // Course length (Z axis)
  segmentsX: number;       // Resolution X
  segmentsZ: number;       // Resolution Z
  slopeAngle: number;      // Degrees of descent
  courseWidth: number;     // Width of groomed ski corridor
  maxElevation: number;    // Maximum height variation
  seed?: number;           // Random seed
}

export const DEFAULT_TERRAIN_CONFIG: TerrainConfig = {
  width: 400,
  length: 8000,
  segmentsX: 256,
  segmentsZ: 512,
  slopeAngle: 22,
  courseWidth: 60,
  maxElevation: 150,
  seed: Math.random() * 10000,
};

// ==================== HEIGHTMAP GENERATOR ====================

/**
 * Generate heightmap data using multi-octave Perlin noise
 */
export function generateHeightmap(config: TerrainConfig = DEFAULT_TERRAIN_CONFIG): Float32Array {
  const { width, length, segmentsX, segmentsZ, slopeAngle, courseWidth, maxElevation, seed = 0 } = config;

  const perlin = new ImprovedNoise();
  const dataSize = (segmentsX + 1) * (segmentsZ + 1);
  const data = new Float32Array(dataSize);

  // Calculate slope drop per unit
  const slopeRadians = THREE.MathUtils.degToRad(slopeAngle);
  const slopeDropPerUnit = Math.tan(slopeRadians);

  // Noise parameters for different terrain features
  const noiseParams = {
    // Main terrain undulation
    terrain: { octaves: 6, persistence: 0.5, lacunarity: 2.0, scale: 0.002 },
    // Mountain ridges
    mountains: { octaves: 4, persistence: 0.6, lacunarity: 2.2, scale: 0.001 },
    // Micro detail (moguls, small bumps)
    detail: { octaves: 3, persistence: 0.4, lacunarity: 2.5, scale: 0.02 },
    // Large smooth variation
    broad: { octaves: 2, persistence: 0.7, lacunarity: 1.8, scale: 0.0005 },
  };

  // FBM (Fractal Brownian Motion) implementation
  const fbm = (
    x: number,
    z: number,
    params: typeof noiseParams.terrain
  ): number => {
    let value = 0;
    let amplitude = 1;
    let frequency = params.scale;
    let maxValue = 0;

    for (let o = 0; o < params.octaves; o++) {
      value += amplitude * perlin.noise(x * frequency + seed, z * frequency + seed, seed);
      maxValue += amplitude;
      amplitude *= params.persistence;
      frequency *= params.lacunarity;
    }

    return value / maxValue; // Normalize to [-1, 1]
  };

  // Ridged noise for mountain peaks
  const ridgedNoise = (x: number, z: number, scale: number): number => {
    const n = perlin.noise(x * scale + seed, z * scale + seed, seed * 1.5);
    return 1 - Math.abs(n) * 2; // Create ridges
  };

  for (let iz = 0; iz <= segmentsZ; iz++) {
    for (let ix = 0; ix <= segmentsX; ix++) {
      const index = iz * (segmentsX + 1) + ix;

      // World coordinates
      const worldX = (ix / segmentsX - 0.5) * width;
      const worldZ = (iz / segmentsZ) * length;

      // ===== 1. Main Slope =====
      // Progressive descent with slight curve for realism
      // Negative = descending slope (Y decreases as we go down the course)
      const progressRatio = iz / segmentsZ;
      const slopeBase = -worldZ * slopeDropPerUnit * 0.5; // Match 0.5 factor from main.ts
      // Add slight acceleration (steeper at end) - also negative
      const slopeCurve = -progressRatio * progressRatio * 20;

      // ===== 2. Course Corridor Detection =====
      const distFromCenter = Math.abs(worldX);
      const corridorFalloff = smoothstep(courseWidth * 0.4, courseWidth * 0.8, distFromCenter);
      const onCourse = 1 - corridorFalloff;

      // ===== 3. Terrain Noise =====
      // Broad sweeping variation
      const broadVariation = fbm(worldX, worldZ, noiseParams.broad) * 30;

      // Main terrain undulation (reduced on course)
      const terrainVariation = fbm(worldX, worldZ, noiseParams.terrain) * maxElevation;
      const terrainOnCourse = terrainVariation * (0.2 + 0.8 * corridorFalloff);

      // Micro detail (moguls on course, rougher off-course)
      const detailVariation = fbm(worldX, worldZ, noiseParams.detail) * 3;
      const detailOnCourse = detailVariation * (0.5 + 0.5 * onCourse);

      // ===== 4. Off-Piste Mountains =====
      // Side mountains rising dramatically off the course
      let mountainHeight = 0;
      if (distFromCenter > courseWidth * 0.5) {
        const mountainDist = distFromCenter - courseWidth * 0.5;
        // Exponential rise with noise modulation
        const riseBase = Math.pow(mountainDist * 0.01, 1.8);
        const ridgeNoise = ridgedNoise(worldX, worldZ, 0.003) * 0.5 + 0.5;
        const mountainNoise = fbm(worldX, worldZ, noiseParams.mountains);

        mountainHeight = riseBase * 80 * (0.7 + 0.3 * ridgeNoise);
        mountainHeight += mountainNoise * 40 * riseBase;
      }

      // ===== 5. Special Features =====
      // Random steeper sections
      const steepSections = perlin.noise(worldX * 0.0002, worldZ * 0.0003, seed * 2);
      const steepBonus = Math.max(0, steepSections) * 15 * onCourse;

      // Gentle mogul fields (periodic bumps)
      const mogulField = Math.sin(worldX * 0.5) * Math.sin(worldZ * 0.3) * 1.5;
      const mogulWeight = onCourse * smoothstep(0.3, 0.7, progressRatio) * (1 - smoothstep(0.7, 0.9, progressRatio));
      const moguls = mogulField * mogulWeight;

      // ===== 6. Combine All Heights =====
      let height = 0;
      height += slopeBase + slopeCurve;          // Main slope
      height += broadVariation;                    // Large variation
      height += terrainOnCourse;                   // Medium terrain
      height += detailOnCourse;                    // Small detail
      height += mountainHeight;                    // Side mountains
      height += steepBonus;                        // Steep sections
      height += moguls;                            // Mogul bumps

      // ===== 7. Edge Smoothing =====
      // Smooth transition at terrain edges
      const edgeX = smoothstep(0, width * 0.05, Math.abs(worldX - width * 0.5)) *
                    smoothstep(0, width * 0.05, Math.abs(worldX + width * 0.5));
      height *= edgeX;

      data[index] = height;
    }
  }

  return data;
}

// ==================== GEOMETRY BUILDER ====================

/**
 * Create terrain mesh geometry from heightmap
 */
export function createTerrainGeometry(
  heightmap: Float32Array,
  config: TerrainConfig = DEFAULT_TERRAIN_CONFIG
): THREE.PlaneGeometry {
  const { width, length, segmentsX, segmentsZ } = config;

  const geometry = new THREE.PlaneGeometry(width, length, segmentsX, segmentsZ);
  geometry.rotateX(-Math.PI / 2); // Lay flat

  const positions = geometry.attributes.position;

  // Apply heightmap to geometry with Z-axis flip
  // PlaneGeometry after rotateX(-PI/2) has inverted Z vertex order
  // We need to flip the heightmap index to match: vertex[iz=0] gets heightmap[rows-1-iz]
  const cols = segmentsX + 1;
  const rows = segmentsZ + 1;
  for (let iz = 0; iz < rows; iz++) {
    for (let ix = 0; ix < cols; ix++) {
      const vertexIdx = iz * cols + ix;
      const heightmapIdx = (rows - 1 - iz) * cols + ix; // Flip Z index
      positions.setY(vertexIdx, heightmap[heightmapIdx] || 0);
    }
  }

  // Recompute normals for proper lighting
  geometry.computeVertexNormals();

  // Generate tangents for normal mapping (if needed)
  // geometry.computeTangents();

  return geometry;
}

/**
 * Create complete terrain mesh with material
 */
export function createTerrainMesh(
  config: TerrainConfig = DEFAULT_TERRAIN_CONFIG,
  material?: THREE.Material
): { mesh: THREE.Mesh; heightmap: Float32Array } {
  const heightmap = generateHeightmap(config);
  const geometry = createTerrainGeometry(heightmap, config);

  const defaultMaterial = material || new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.8,
    metalness: 0.0,
    flatShading: false,
  });

  const mesh = new THREE.Mesh(geometry, defaultMaterial);
  mesh.receiveShadow = true;
  mesh.castShadow = false; // Terrain doesn't need to cast shadows

  // Position at origin, Z extends into scene
  mesh.position.set(0, 0, config.length / 2);

  return { mesh, heightmap };
}

// ==================== HEIGHT SAMPLING ====================

/**
 * Get height at world position from heightmap
 */
export function getHeightAt(
  worldX: number,
  worldZ: number,
  heightmap: Float32Array,
  config: TerrainConfig = DEFAULT_TERRAIN_CONFIG
): number {
  const { width, length, segmentsX, segmentsZ } = config;

  // Convert world coords to heightmap indices
  const localX = worldX + width / 2;
  const localZ = worldZ;

  // Normalize to [0, 1]
  const normalX = localX / width;
  const normalZ = localZ / length;

  // Get float indices
  const floatIX = normalX * segmentsX;
  const floatIZ = normalZ * segmentsZ;

  // Clamp to valid range
  const ix0 = Math.max(0, Math.min(segmentsX - 1, Math.floor(floatIX)));
  const iz0 = Math.max(0, Math.min(segmentsZ - 1, Math.floor(floatIZ)));
  const ix1 = Math.min(segmentsX, ix0 + 1);
  const iz1 = Math.min(segmentsZ, iz0 + 1);

  // Bilinear interpolation weights
  const fx = floatIX - ix0;
  const fz = floatIZ - iz0;

  // Sample four corners
  const h00 = heightmap[iz0 * (segmentsX + 1) + ix0] || 0;
  const h10 = heightmap[iz0 * (segmentsX + 1) + ix1] || 0;
  const h01 = heightmap[iz1 * (segmentsX + 1) + ix0] || 0;
  const h11 = heightmap[iz1 * (segmentsX + 1) + ix1] || 0;

  // Bilinear interpolation
  const h0 = h00 * (1 - fx) + h10 * fx;
  const h1 = h01 * (1 - fx) + h11 * fx;
  const height = h0 * (1 - fz) + h1 * fz;

  return height;
}

/**
 * Get terrain normal at world position
 */
export function getNormalAt(
  worldX: number,
  worldZ: number,
  heightmap: Float32Array,
  config: TerrainConfig = DEFAULT_TERRAIN_CONFIG
): THREE.Vector3 {
  const delta = 1.0; // Sample distance

  // Sample heights around point
  const hL = getHeightAt(worldX - delta, worldZ, heightmap, config);
  const hR = getHeightAt(worldX + delta, worldZ, heightmap, config);
  const hD = getHeightAt(worldX, worldZ - delta, heightmap, config);
  const hU = getHeightAt(worldX, worldZ + delta, heightmap, config);

  // Calculate normal from gradient
  const normal = new THREE.Vector3(
    hL - hR,
    2 * delta,
    hD - hU
  );

  return normal.normalize();
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Smooth interpolation function
 */
function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/**
 * Create terrain LOD levels
 */
export function createTerrainLOD(
  config: TerrainConfig = DEFAULT_TERRAIN_CONFIG
): THREE.LOD {
  const lod = new THREE.LOD();

  // High detail (near)
  const highConfig = { ...config, segmentsX: 256, segmentsZ: 512 };
  const { mesh: highMesh } = createTerrainMesh(highConfig);
  lod.addLevel(highMesh, 0);

  // Medium detail
  const medConfig = { ...config, segmentsX: 128, segmentsZ: 256 };
  const { mesh: medMesh } = createTerrainMesh(medConfig);
  lod.addLevel(medMesh, 200);

  // Low detail (far)
  const lowConfig = { ...config, segmentsX: 64, segmentsZ: 128 };
  const { mesh: lowMesh } = createTerrainMesh(lowConfig);
  lod.addLevel(lowMesh, 500);

  return lod;
}

/**
 * Export heightmap to texture for shader use
 */
export function heightmapToTexture(
  heightmap: Float32Array,
  config: TerrainConfig = DEFAULT_TERRAIN_CONFIG
): THREE.DataTexture {
  const { segmentsX, segmentsZ } = config;
  const width = segmentsX + 1;
  const height = segmentsZ + 1;

  // Normalize heights to [0, 1] for texture
  let minHeight = Infinity;
  let maxHeight = -Infinity;

  for (let i = 0; i < heightmap.length; i++) {
    minHeight = Math.min(minHeight, heightmap[i]);
    maxHeight = Math.max(maxHeight, heightmap[i]);
  }

  const range = maxHeight - minHeight || 1;
  const data = new Float32Array(width * height);

  for (let i = 0; i < heightmap.length; i++) {
    data[i] = (heightmap[i] - minHeight) / range;
  }

  const texture = new THREE.DataTexture(
    data,
    width,
    height,
    THREE.RedFormat,
    THREE.FloatType
  );

  texture.needsUpdate = true;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;

  return texture;
}

export default {
  generateHeightmap,
  createTerrainGeometry,
  createTerrainMesh,
  getHeightAt,
  getNormalAt,
  createTerrainLOD,
  heightmapToTexture,
  DEFAULT_TERRAIN_CONFIG,
};
