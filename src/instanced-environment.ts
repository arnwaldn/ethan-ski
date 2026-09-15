/**
 * INSTANCED ENVIRONMENT v4.0 - Professional Alpine Environment with GLTF Support
 * GLTF models, terrain-aware placement, wind animation
 */

import * as THREE from 'three';
import { getHeightAt, DEFAULT_TERRAIN_CONFIG, type TerrainConfig } from './terrain-generator';
import type { TreeModel, RockModel } from './gltf-loader';

// ==================== CONFIGURATION ====================

export interface EnvironmentConfig {
  treeCount: number;
  rockCount: number;
  chaletCount: number;
  courseWidth: number;
  courseLength: number;
  terrainConfig: TerrainConfig;
  // GLTF Assets v4.0
  gltfTrees?: TreeModel[];
  gltfRocks?: RockModel[];
}

export const DEFAULT_ENV_CONFIG: EnvironmentConfig = {
  treeCount: 3000,
  rockCount: 800,
  chaletCount: 15,
  courseWidth: 60,
  courseLength: 8000,
  terrainConfig: DEFAULT_TERRAIN_CONFIG,
};

// Shared dummy for transforms
const dummy = new THREE.Object3D();

// ==================== TREE SHADER ====================

export const TreeShader = {
  uniforms: {
    time: { value: 0 },
    windStrength: { value: 0.12 },
    windFrequency: { value: 1.2 },
    sunDirection: { value: new THREE.Vector3(0.4, 0.7, 0.5).normalize() },
    sunColor: { value: new THREE.Color(0xfff8e0) },
    ambientColor: { value: new THREE.Color(0x6090c0) },
    fogColor: { value: new THREE.Color(0xd8eaf8) },
    fogNear: { value: 150 },
    fogFar: { value: 1000 },
  },

  vertexShader: `
    uniform float time;
    uniform float windStrength;
    uniform float windFrequency;

    attribute vec3 color;
    varying vec3 vColor;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying float vFogDepth;
    varying float vHeight;

    // Simplex noise for natural wind
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }

    float snoise(vec3 v) {
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      i = mod289(i);
      vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0))
        + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
      float n_ = 0.142857142857;
      vec3 ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);
      vec4 x = x_ * ns.x + ns.yyyy;
      vec4 y = y_ * ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);
      vec4 s0 = floor(b0) * 2.0 + 1.0;
      vec4 s1 = floor(b1) * 2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);
      vec4 norm = inversesqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
      p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }

    void main() {
      vColor = color;
      vNormal = normalize(normalMatrix * normal);

      vec4 worldPos = instanceMatrix * vec4(position, 1.0);

      // Height-based wind influence (more at top)
      float heightFactor = clamp((position.y - 1.5) / 8.0, 0.0, 1.0);
      heightFactor = heightFactor * heightFactor; // Quadratic falloff

      // Multi-layer wind with simplex noise
      float windTime = time * windFrequency;
      float wind1 = snoise(vec3(worldPos.xz * 0.02, windTime * 0.5)) * windStrength;
      float wind2 = snoise(vec3(worldPos.xz * 0.05, windTime * 0.8)) * windStrength * 0.5;
      float wind3 = sin(windTime + worldPos.x * 0.03) * windStrength * 0.3;

      float windOffset = (wind1 + wind2 + wind3) * heightFactor;

      worldPos.x += windOffset;
      worldPos.z += windOffset * 0.4;

      vWorldPosition = worldPos.xyz;
      vHeight = position.y;

      vec4 mvPosition = viewMatrix * worldPos;
      vFogDepth = -mvPosition.z;

      gl_Position = projectionMatrix * mvPosition;
    }
  `,

  fragmentShader: `
    uniform vec3 sunDirection;
    uniform vec3 sunColor;
    uniform vec3 ambientColor;
    uniform vec3 fogColor;
    uniform float fogNear;
    uniform float fogFar;

    varying vec3 vColor;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying float vFogDepth;
    varying float vHeight;

    void main() {
      vec3 normal = normalize(vNormal);

      // Enhanced diffuse with wrap lighting
      float NdotL = dot(normal, sunDirection);
      float wrapDiffuse = max(0.0, (NdotL + 0.5) / 1.5);
      vec3 diffuse = sunColor * wrapDiffuse * 0.9;

      // Hemisphere ambient
      float hemiBlend = normal.y * 0.5 + 0.5;
      vec3 ambient = mix(ambientColor * 0.35, ambientColor * 0.65, hemiBlend);

      // Translucency / rim lighting
      vec3 viewDir = normalize(cameraPosition - vWorldPosition);
      float rim = pow(1.0 - max(0.0, dot(normal, viewDir)), 3.5);
      float backLight = max(0.0, dot(-normal, sunDirection));
      vec3 rimColor = sunColor * rim * backLight * 0.35;

      // Subsurface scattering simulation
      float sss = pow(max(0.0, -dot(viewDir, sunDirection)), 5.0) * 0.2;
      vec3 subsurface = vec3(0.15, 0.4, 0.15) * sss;

      // Combine lighting
      vec3 color = vColor * (ambient + diffuse);
      color += rimColor;
      color += subsurface;

      // Snow accumulation on upper foliage
      if (vHeight > 3.5 && vColor.g > 0.12) {
        float snowAmount = smoothstep(3.5, 8.0, vHeight) * 0.45;
        snowAmount *= max(0.0, normal.y * 0.8 + 0.2);
        color = mix(color, vec3(0.96, 0.98, 1.0), snowAmount);
      }

      // Fog with color variation
      float fogFactor = smoothstep(fogNear, fogFar, vFogDepth);
      color = mix(color, fogColor, fogFactor);

      gl_FragColor = vec4(color, 1.0);
    }
  `,
};

// ==================== DETAILED TREE GEOMETRY ====================

/**
 * Create a highly detailed pine tree geometry
 * 6 foliage layers instead of 3, with proper branch tapering
 */
function createDetailedPineGeometry(): THREE.BufferGeometry {
  const geometries: THREE.BufferGeometry[] = [];

  // Trunk - tapered cylinder with bark detail
  const trunkGeometry = new THREE.CylinderGeometry(0.12, 0.22, 2.8, 12);
  trunkGeometry.translate(0, 1.4, 0);
  geometries.push(trunkGeometry);

  // 6 foliage layers with decreasing size
  const foliageLayers = [
    { radius: 2.2, height: 2.8, y: 3.8, segments: 12 },
    { radius: 1.9, height: 2.4, y: 5.2, segments: 12 },
    { radius: 1.6, height: 2.1, y: 6.4, segments: 10 },
    { radius: 1.3, height: 1.8, y: 7.4, segments: 10 },
    { radius: 1.0, height: 1.5, y: 8.2, segments: 8 },
    { radius: 0.6, height: 1.2, y: 8.9, segments: 8 },
  ];

  foliageLayers.forEach((layer) => {
    const foliage = new THREE.ConeGeometry(layer.radius, layer.height, layer.segments);
    foliage.translate(0, layer.y, 0);
    geometries.push(foliage);
  });

  // Merge all geometries
  let totalVertices = 0;
  geometries.forEach((g) => (totalVertices += g.attributes.position.count));

  const positions = new Float32Array(totalVertices * 3);
  const normals = new Float32Array(totalVertices * 3);
  const colors = new Float32Array(totalVertices * 3);

  let offset = 0;
  const trunkColor = new THREE.Color(0x3d2817);
  const foliageColors = [
    new THREE.Color(0x1a4528), // Deep green base
    new THREE.Color(0x1e5230),
    new THREE.Color(0x225a38),
    new THREE.Color(0x286342),
    new THREE.Color(0x2e6c4a),
    new THREE.Color(0x357552), // Lighter at top
  ];
  const snowColor = new THREE.Color(0xf0f6f8);

  geometries.forEach((geom, gIdx) => {
    const pos = geom.attributes.position;
    const norm = geom.attributes.normal;
    const isTrunk = gIdx === 0;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);

      positions[offset * 3] = x;
      positions[offset * 3 + 1] = y;
      positions[offset * 3 + 2] = z;

      normals[offset * 3] = norm.getX(i);
      normals[offset * 3 + 1] = norm.getY(i);
      normals[offset * 3 + 2] = norm.getZ(i);

      if (isTrunk) {
        colors[offset * 3] = trunkColor.r;
        colors[offset * 3 + 1] = trunkColor.g;
        colors[offset * 3 + 2] = trunkColor.b;
      } else {
        const foliageIdx = Math.min(gIdx - 1, foliageColors.length - 1);
        const baseColor = foliageColors[foliageIdx];

        // Snow on tips based on height and normal
        const normalY = norm.getY(i);
        const snowFactor = Math.max(0, (y - 6) / 4) * Math.max(0, normalY) * 0.5;
        const finalColor = baseColor.clone().lerp(snowColor, snowFactor);

        colors[offset * 3] = finalColor.r;
        colors[offset * 3 + 1] = finalColor.g;
        colors[offset * 3 + 2] = finalColor.b;
      }

      offset++;
    }

    geom.dispose();
  });

  const merged = new THREE.BufferGeometry();
  merged.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  merged.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  merged.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  return merged;
}

// ==================== INSTANCED FOREST ====================

let treeShaderMaterial: THREE.ShaderMaterial | null = null;

/**
 * Create instanced forest with terrain-aware placement
 * Supports GLTF models v4.0 or falls back to procedural geometry
 */
export function createInstancedForest(
  scene: THREE.Scene,
  heightmap: Float32Array | null,
  config: Partial<EnvironmentConfig> = {}
): THREE.InstancedMesh | THREE.InstancedMesh[] {
  const cfg = { ...DEFAULT_ENV_CONFIG, ...config };

  // GLTF Models v4.0 - Use real 3D models if available
  if (cfg.gltfTrees && cfg.gltfTrees.length > 0) {
    return createGLTFInstancedForest(scene, heightmap, cfg);
  }

  // Fallback to procedural geometry
  const geometry = createDetailedPineGeometry();

  treeShaderMaterial = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.clone(TreeShader.uniforms),
    vertexShader: TreeShader.vertexShader,
    fragmentShader: TreeShader.fragmentShader,
    side: THREE.DoubleSide,
  });

  const instancedTrees = new THREE.InstancedMesh(
    geometry,
    treeShaderMaterial,
    cfg.treeCount
  );
  instancedTrees.castShadow = true;
  instancedTrees.receiveShadow = true;
  instancedTrees.frustumCulled = true;
  instancedTrees.name = 'InstancedForest';

  let placedCount = 0;

  for (let i = 0; i < cfg.treeCount; i++) {
    const z = Math.random() * cfg.courseLength;
    const distFromCenter = Math.abs(Math.random() - 0.5) * 2;

    // Trees on sides of course with natural distribution
    let x: number;
    const side = Math.random() > 0.5 ? 1 : -1;
    const minDistance = cfg.courseWidth * 0.5 + 4;
    const maxDistance = cfg.courseWidth * 3;

    // Exponential distribution for natural forest density
    const t = Math.pow(distFromCenter, 0.6);
    x = side * (minDistance + t * (maxDistance - minDistance));

    // Add clustering for natural forest feel
    if (Math.random() < 0.35) {
      x += (Math.random() - 0.5) * 12;
    }

    // Get terrain height if available
    let y = 0;
    if (heightmap) {
      y = getHeightAt(x, z, heightmap, cfg.terrainConfig);
    } else {
      // Fallback slope calculation - negative for descending slope
      const slopeAngle = cfg.terrainConfig.slopeAngle || 22;
      y = -z * Math.tan(THREE.MathUtils.degToRad(slopeAngle)) * 0.5;
    }

    // Vary size naturally
    const baseScale = 0.7 + Math.random() * 0.6;
    // Bigger trees further from course
    const distanceScale = 1 + Math.abs(x) / cfg.courseWidth * 0.3;
    const scale = baseScale * distanceScale;

    // IMPORTANT: Place at -z because skier moves toward negative Z
    // Y is positive (height above slope baseline)
    dummy.position.set(x, y, -z);
    dummy.rotation.set(
      (Math.random() - 0.5) * 0.05, // Slight tilt
      Math.random() * Math.PI * 2,
      (Math.random() - 0.5) * 0.05
    );
    dummy.scale.setScalar(scale);
    dummy.updateMatrix();

    instancedTrees.setMatrixAt(placedCount, dummy.matrix);
    placedCount++;
  }

  instancedTrees.count = placedCount;
  instancedTrees.instanceMatrix.needsUpdate = true;
  scene.add(instancedTrees);

  console.log(`🌲 Created ${placedCount} detailed instanced trees (procedural)`);

  return instancedTrees;
}

/**
 * Create instanced forest using GLTF models v4.0
 * Multiple tree variants for visual variety
 */
function createGLTFInstancedForest(
  scene: THREE.Scene,
  heightmap: Float32Array | null,
  cfg: EnvironmentConfig
): THREE.InstancedMesh[] {
  const gltfTrees = cfg.gltfTrees!;
  const treesPerVariant = Math.floor(cfg.treeCount / gltfTrees.length);
  const instancedMeshes: THREE.InstancedMesh[] = [];

  console.log(`🌲 Creating GLTF forest with ${gltfTrees.length} tree variants...`);

  gltfTrees.forEach((treeModel, variantIndex) => {
    const instanceCount = variantIndex === gltfTrees.length - 1
      ? cfg.treeCount - (treesPerVariant * variantIndex) // Last variant gets remainder
      : treesPerVariant;

    const instancedMesh = new THREE.InstancedMesh(
      treeModel.geometry,
      treeModel.material,
      instanceCount
    );
    instancedMesh.castShadow = true;
    instancedMesh.receiveShadow = true;
    instancedMesh.frustumCulled = true;
    instancedMesh.name = `GLTFTrees_Variant${variantIndex}`;

    let placedCount = 0;

    for (let i = 0; i < instanceCount; i++) {
      const z = Math.random() * cfg.courseLength;
      const distFromCenter = Math.abs(Math.random() - 0.5) * 2;

      // Trees on sides of course with natural distribution
      let x: number;
      const side = Math.random() > 0.5 ? 1 : -1;
      const minDistance = cfg.courseWidth * 0.5 + 4;
      const maxDistance = cfg.courseWidth * 3;

      // Exponential distribution for natural forest density
      const t = Math.pow(distFromCenter, 0.6);
      x = side * (minDistance + t * (maxDistance - minDistance));

      // Add clustering for natural forest feel
      if (Math.random() < 0.35) {
        x += (Math.random() - 0.5) * 12;
      }

      // Get terrain height if available
      let y = 0;
      if (heightmap) {
        y = getHeightAt(x, z, heightmap, cfg.terrainConfig);
      } else {
        // Fallback slope calculation - negative for descending slope
        const slopeAngle = cfg.terrainConfig.slopeAngle || 22;
        y = -z * Math.tan(THREE.MathUtils.degToRad(slopeAngle)) * 0.5;
      }

      // Vary size naturally - use model's defined scale
      const baseScale = treeModel.scale * (0.7 + Math.random() * 0.6);
      // Bigger trees further from course
      const distanceScale = 1 + Math.abs(x) / cfg.courseWidth * 0.3;
      const scale = baseScale * distanceScale;

      // IMPORTANT: Place at -z because skier moves toward negative Z
      // Y is positive (height above slope baseline)
      dummy.position.set(x, y, -z);
      dummy.rotation.set(
        (Math.random() - 0.5) * 0.05, // Slight tilt
        Math.random() * Math.PI * 2, // Random rotation
        (Math.random() - 0.5) * 0.05
      );
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();

      instancedMesh.setMatrixAt(placedCount, dummy.matrix);
      placedCount++;
    }

    instancedMesh.count = placedCount;
    instancedMesh.instanceMatrix.needsUpdate = true;
    scene.add(instancedMesh);
    instancedMeshes.push(instancedMesh);

    console.log(`  └─ Variant ${variantIndex + 1}: ${placedCount} trees`);
  });

  console.log(`🌲 Created ${cfg.treeCount} GLTF instanced trees total`);

  return instancedMeshes;
}

// ==================== INSTANCED ROCKS ====================

const RockShader = {
  uniforms: {
    sunDirection: { value: new THREE.Vector3(0.4, 0.7, 0.5).normalize() },
    sunColor: { value: new THREE.Color(0xfff8e0) },
    rockColor: { value: new THREE.Color(0x5a4d42) },
    snowColor: { value: new THREE.Color(0xf8fcff) },
    fogColor: { value: new THREE.Color(0xd8eaf8) },
    fogNear: { value: 150 },
    fogFar: { value: 1000 },
  },

  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying float vFogDepth;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPos = instanceMatrix * vec4(position, 1.0);
      vPosition = worldPos.xyz;

      vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
      vFogDepth = -mvPosition.z;

      gl_Position = projectionMatrix * mvPosition;
    }
  `,

  fragmentShader: `
    uniform vec3 sunDirection;
    uniform vec3 sunColor;
    uniform vec3 rockColor;
    uniform vec3 snowColor;
    uniform vec3 fogColor;
    uniform float fogNear;
    uniform float fogFar;

    varying vec3 vNormal;
    varying vec3 vPosition;
    varying float vFogDepth;

    void main() {
      vec3 normal = normalize(vNormal);

      // Diffuse lighting
      float NdotL = max(0.0, dot(normal, sunDirection));
      vec3 diffuse = sunColor * NdotL * 0.7;
      vec3 ambient = vec3(0.35, 0.38, 0.42);

      // Snow on upward-facing surfaces
      float snowAmount = smoothstep(0.5, 0.9, normal.y) * 0.6;
      vec3 baseColor = mix(rockColor, snowColor, snowAmount);

      vec3 color = baseColor * (ambient + diffuse);

      // Fog
      float fogFactor = smoothstep(fogNear, fogFar, vFogDepth);
      color = mix(color, fogColor, fogFactor);

      gl_FragColor = vec4(color, 1.0);
    }
  `,
};

/**
 * Create varied rock geometry with natural deformation
 */
function createRockGeometry(): THREE.BufferGeometry {
  const geometry = new THREE.DodecahedronGeometry(1, 1);
  const positions = geometry.attributes.position;

  // Natural rock deformation
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);

    // Multi-frequency noise for natural look
    const noise1 = Math.sin(x * 2.5 + y * 1.8) * 0.15;
    const noise2 = Math.sin(y * 3.2 + z * 2.1) * 0.1;
    const noise3 = Math.cos(x * 1.5 + z * 2.8) * 0.12;
    const noise = noise1 + noise2 + noise3;

    // Flatten bottom for ground contact
    const flattenFactor = y < 0 ? 0.4 : 1.0;

    positions.setX(i, x * (1 + noise) * flattenFactor);
    positions.setY(i, y * (1 + noise * 0.5) * (y < 0 ? 0.3 : 1.0));
    positions.setZ(i, z * (1 + noise) * flattenFactor);
  }

  geometry.computeVertexNormals();
  return geometry;
}

let rockShaderMaterial: THREE.ShaderMaterial | null = null;

/**
 * Create instanced rocks with terrain-aware placement
 * Supports GLTF models v4.0 or falls back to procedural geometry
 */
export function createInstancedRocks(
  scene: THREE.Scene,
  heightmap: Float32Array | null,
  config: Partial<EnvironmentConfig> = {}
): THREE.InstancedMesh | THREE.InstancedMesh[] {
  const cfg = { ...DEFAULT_ENV_CONFIG, ...config };

  // GLTF Models v4.0 - Use real 3D models if available
  if (cfg.gltfRocks && cfg.gltfRocks.length > 0) {
    return createGLTFInstancedRocks(scene, heightmap, cfg);
  }

  // Fallback to procedural geometry
  const geometry = createRockGeometry();

  rockShaderMaterial = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.clone(RockShader.uniforms),
    vertexShader: RockShader.vertexShader,
    fragmentShader: RockShader.fragmentShader,
    side: THREE.DoubleSide,
  });

  const instancedRocks = new THREE.InstancedMesh(
    geometry,
    rockShaderMaterial,
    cfg.rockCount
  );
  instancedRocks.castShadow = true;
  instancedRocks.receiveShadow = true;
  instancedRocks.frustumCulled = true;
  instancedRocks.name = 'InstancedRocks';

  for (let i = 0; i < cfg.rockCount; i++) {
    const z = Math.random() * cfg.courseLength;

    // Rocks on edges and off-piste
    const side = Math.random() > 0.5 ? 1 : -1;
    const minDist = cfg.courseWidth * 0.5 + 2;
    const maxDist = cfg.courseWidth * 2;
    const x = side * (minDist + Math.random() * (maxDist - minDist));

    // Get terrain height
    let y = 0;
    if (heightmap) {
      y = getHeightAt(x, z, heightmap, cfg.terrainConfig);
    } else {
      // Fallback - negative for descending slope
      const slopeAngle = cfg.terrainConfig.slopeAngle || 22;
      y = -z * Math.tan(THREE.MathUtils.degToRad(slopeAngle)) * 0.5;
    }

    // Size variation
    const scale = 0.4 + Math.random() * 1.5;
    const flatScale = new THREE.Vector3(
      scale * (0.8 + Math.random() * 0.4),
      scale * (0.5 + Math.random() * 0.5),
      scale * (0.8 + Math.random() * 0.4)
    );

    // IMPORTANT: Place at -z because skier moves toward negative Z
    // Y is positive, offset slightly for partial burial
    const adjustedY = y - flatScale.y * 0.15;
    dummy.position.set(x, adjustedY, -z);
    dummy.rotation.set(
      Math.random() * 0.4,
      Math.random() * Math.PI * 2,
      Math.random() * 0.4
    );
    dummy.scale.copy(flatScale);
    dummy.updateMatrix();

    instancedRocks.setMatrixAt(i, dummy.matrix);
  }

  instancedRocks.instanceMatrix.needsUpdate = true;
  scene.add(instancedRocks);

  console.log(`🪨 Created ${cfg.rockCount} instanced rocks (procedural)`);

  return instancedRocks;
}

/**
 * Create instanced rocks using GLTF models v4.0
 * Multiple rock variants for visual variety
 */
function createGLTFInstancedRocks(
  scene: THREE.Scene,
  heightmap: Float32Array | null,
  cfg: EnvironmentConfig
): THREE.InstancedMesh[] {
  const gltfRocks = cfg.gltfRocks!;
  const rocksPerVariant = Math.floor(cfg.rockCount / gltfRocks.length);
  const instancedMeshes: THREE.InstancedMesh[] = [];

  console.log(`🪨 Creating GLTF rocks with ${gltfRocks.length} variants...`);

  gltfRocks.forEach((rockModel, variantIndex) => {
    const instanceCount = variantIndex === gltfRocks.length - 1
      ? cfg.rockCount - (rocksPerVariant * variantIndex)
      : rocksPerVariant;

    const instancedMesh = new THREE.InstancedMesh(
      rockModel.geometry,
      rockModel.material,
      instanceCount
    );
    instancedMesh.castShadow = true;
    instancedMesh.receiveShadow = true;
    instancedMesh.frustumCulled = true;
    instancedMesh.name = `GLTFRocks_Variant${variantIndex}`;

    for (let i = 0; i < instanceCount; i++) {
      const z = Math.random() * cfg.courseLength;

      // Rocks on edges and off-piste
      const side = Math.random() > 0.5 ? 1 : -1;
      const minDist = cfg.courseWidth * 0.5 + 2;
      const maxDist = cfg.courseWidth * 2;
      const x = side * (minDist + Math.random() * (maxDist - minDist));

      // Get terrain height
      let y = 0;
      if (heightmap) {
        y = getHeightAt(x, z, heightmap, cfg.terrainConfig);
      } else {
        // Fallback - negative for descending slope
        const slopeAngle = cfg.terrainConfig.slopeAngle || 22;
        y = -z * Math.tan(THREE.MathUtils.degToRad(slopeAngle)) * 0.5;
      }

      // Size variation using model's defined scale
      const baseScale = rockModel.scale * (0.4 + Math.random() * 1.5);
      const flatScale = new THREE.Vector3(
        baseScale * (0.8 + Math.random() * 0.4),
        baseScale * (0.5 + Math.random() * 0.5),
        baseScale * (0.8 + Math.random() * 0.4)
      );

      // IMPORTANT: Place at -z because skier moves toward negative Z
      // Y is positive, offset slightly for partial burial
      const adjustedY = y - flatScale.y * 0.15;
      dummy.position.set(x, adjustedY, -z);
      dummy.rotation.set(
        Math.random() * 0.4,
        Math.random() * Math.PI * 2,
        Math.random() * 0.4
      );
      dummy.scale.copy(flatScale);
      dummy.updateMatrix();

      instancedMesh.setMatrixAt(i, dummy.matrix);
    }

    instancedMesh.instanceMatrix.needsUpdate = true;
    scene.add(instancedMesh);
    instancedMeshes.push(instancedMesh);

    console.log(`  └─ Variant ${variantIndex + 1}: ${instanceCount} rocks`);
  });

  console.log(`🪨 Created ${cfg.rockCount} GLTF instanced rocks total`);

  return instancedMeshes;
}

// ==================== LOD MOUNTAINS ====================

/**
 * Create mountain material with snow gradient
 */
function createMountainMaterial(height: number): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      rockColor: { value: new THREE.Color(0x4a3d32) },
      snowColor: { value: new THREE.Color(0xfcfeff) },
      snowLine: { value: height * 0.35 },
      sunDirection: { value: new THREE.Vector3(0.4, 0.7, 0.5).normalize() },
      fogColor: { value: new THREE.Color(0xd8eaf8) },
      fogNear: { value: 300 },
      fogFar: { value: 1500 },
    },
    vertexShader: `
      varying vec3 vPosition;
      varying vec3 vNormal;
      varying float vFogDepth;

      void main() {
        vPosition = position;
        vNormal = normalize(normalMatrix * normal);

        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vFogDepth = -mvPosition.z;

        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 rockColor;
      uniform vec3 snowColor;
      uniform float snowLine;
      uniform vec3 sunDirection;
      uniform vec3 fogColor;
      uniform float fogNear;
      uniform float fogFar;

      varying vec3 vPosition;
      varying vec3 vNormal;
      varying float vFogDepth;

      void main() {
        vec3 normal = normalize(vNormal);

        // Snow based on height and slope
        float heightFactor = smoothstep(snowLine * 0.7, snowLine * 1.4, vPosition.y);
        float slopeFactor = max(0.0, normal.y);
        float snowAmount = heightFactor * (slopeFactor * 0.7 + 0.3);

        vec3 baseColor = mix(rockColor, snowColor, snowAmount);

        // Lighting
        float NdotL = max(0.3, dot(normal, sunDirection));
        vec3 color = baseColor * NdotL;

        // Fog
        float fogFactor = smoothstep(fogNear, fogFar, vFogDepth);
        color = mix(color, fogColor, fogFactor);

        gl_FragColor = vec4(color, 1.0);
      }
    `,
    side: THREE.DoubleSide,
  });
}

/**
 * Add noise displacement to mountain geometry
 */
function addMountainNoise(geometry: THREE.BufferGeometry, intensity: number, height: number): void {
  const positions = geometry.attributes.position;

  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);

    // Multi-octave FBM-like noise
    const noise =
      Math.sin(x * 0.4 + y * 0.25) * 0.5 +
      Math.sin(x * 0.9 - z * 0.6) * 0.3 +
      Math.sin(y * 0.6 + z * 0.4) * 0.2;

    const displacement = noise * intensity * (1.0 - y / height);

    positions.setX(i, x + displacement * x * 0.12);
    positions.setZ(i, z + displacement * z * 0.12);
  }

  geometry.computeVertexNormals();
}

/**
 * Create a mountain with LOD
 */
function createMountainLOD(
  position: THREE.Vector3,
  baseWidth: number,
  height: number
): THREE.LOD {
  const lod = new THREE.LOD();

  // High detail
  const highGeom = new THREE.ConeGeometry(baseWidth, height, 48, 12);
  addMountainNoise(highGeom, 0.18, height);
  const highMesh = new THREE.Mesh(highGeom, createMountainMaterial(height));
  highMesh.castShadow = false;

  // Medium detail
  const medGeom = new THREE.ConeGeometry(baseWidth, height, 16, 6);
  addMountainNoise(medGeom, 0.12, height);
  const medMesh = new THREE.Mesh(medGeom, createMountainMaterial(height));

  // Low detail
  const lowGeom = new THREE.ConeGeometry(baseWidth, height, 8, 3);
  const lowMesh = new THREE.Mesh(lowGeom, createMountainMaterial(height));

  lod.addLevel(highMesh, 0);
  lod.addLevel(medMesh, 600);
  lod.addLevel(lowMesh, 1500);

  lod.position.copy(position);

  return lod;
}

/**
 * Create mountain range
 */
export function createLODMountainRange(
  scene: THREE.Scene,
  courseLength: number
): THREE.LOD[] {
  const mountains: THREE.LOD[] = [];

  const configs = [
    // Left distant
    { x: -900, z: courseLength * 0.3, width: 450, height: 700 },
    { x: -750, z: courseLength * 0.55, width: 400, height: 620 },
    { x: -1000, z: courseLength * 0.75, width: 550, height: 800 },

    // Right distant
    { x: 900, z: courseLength * 0.35, width: 420, height: 650 },
    { x: 800, z: courseLength * 0.6, width: 480, height: 720 },
    { x: 950, z: courseLength * 0.45, width: 500, height: 680 },

    // Background
    { x: 0, z: courseLength * 1.1, width: 700, height: 900 },
    { x: -400, z: courseLength * 1.0, width: 550, height: 780 },
    { x: 400, z: courseLength * 1.05, width: 600, height: 850 },
  ];

  configs.forEach((cfg) => {
    const slopeAngle = DEFAULT_TERRAIN_CONFIG.slopeAngle;
    // Use negative Z for slope calculation (skier goes toward -Z)
    const slopeY = -cfg.z * Math.tan(THREE.MathUtils.degToRad(slopeAngle)) * 0.5;
    // Place mountains at negative Z (in front of skier, direction of travel)
    const pos = new THREE.Vector3(cfg.x, slopeY - 100, -cfg.z);

    const lod = createMountainLOD(pos, cfg.width, cfg.height);
    scene.add(lod);
    mountains.push(lod);
  });

  console.log(`🏔️ Created ${mountains.length} LOD mountains`);

  return mountains;
}

// ==================== UPDATE FUNCTIONS ====================

/**
 * Update LOD levels
 */
export function updateLODs(camera: THREE.Camera, lods: THREE.LOD[]): void {
  lods.forEach((lod) => lod.update(camera));
}

/**
 * Update tree shader uniforms
 */
export function updateTreeShader(time: number): void {
  if (treeShaderMaterial) {
    treeShaderMaterial.uniforms.time.value = time;
  }
}

/**
 * Update all environment shaders with lighting info
 */
export function updateEnvironmentLighting(
  sunDirection: THREE.Vector3,
  sunColor: THREE.Color,
  fogColor: THREE.Color,
  fogNear: number,
  fogFar: number
): void {
  if (treeShaderMaterial) {
    treeShaderMaterial.uniforms.sunDirection.value.copy(sunDirection);
    treeShaderMaterial.uniforms.sunColor.value.copy(sunColor);
    treeShaderMaterial.uniforms.fogColor.value.copy(fogColor);
    treeShaderMaterial.uniforms.fogNear.value = fogNear;
    treeShaderMaterial.uniforms.fogFar.value = fogFar;
  }

  if (rockShaderMaterial) {
    rockShaderMaterial.uniforms.sunDirection.value.copy(sunDirection);
    rockShaderMaterial.uniforms.sunColor.value.copy(sunColor);
    rockShaderMaterial.uniforms.fogColor.value.copy(fogColor);
    rockShaderMaterial.uniforms.fogNear.value = fogNear;
    rockShaderMaterial.uniforms.fogFar.value = fogFar;
  }
}

export default {
  createInstancedForest,
  createInstancedRocks,
  createLODMountainRange,
  updateLODs,
  updateTreeShader,
  updateEnvironmentLighting,
  DEFAULT_ENV_CONFIG,
};
