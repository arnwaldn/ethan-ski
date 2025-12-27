/**
 * MATERIALS - Professional PBR Materials with Procedural Textures
 * Creates high-quality materials without external texture files
 */

import * as THREE from 'three';

// ==================== PROCEDURAL TEXTURE GENERATORS ====================

/**
 * Generate a noise texture on canvas
 */
function generateNoiseTexture(
  width: number,
  height: number,
  scale: number = 1,
  octaves: number = 4
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.createImageData(width, height);

  // Simple FBM noise
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let value = 0;
      let amplitude = 1;
      let frequency = scale;
      let maxValue = 0;

      for (let o = 0; o < octaves; o++) {
        const nx = x * frequency / width;
        const ny = y * frequency / height;

        // Pseudo-random based on position
        const noise = Math.sin(nx * 12.9898 + ny * 78.233) * 43758.5453;
        value += (noise - Math.floor(noise)) * amplitude;

        maxValue += amplitude;
        amplitude *= 0.5;
        frequency *= 2;
      }

      value = value / maxValue;
      const idx = (y * width + x) * 4;
      const gray = Math.floor(value * 255);
      imageData.data[idx] = gray;
      imageData.data[idx + 1] = gray;
      imageData.data[idx + 2] = gray;
      imageData.data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;

  return texture;
}

/**
 * Generate snow normal map
 */
function generateSnowNormalMap(width: number, height: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.createImageData(width, height);

  // Generate height map first
  const heightMap: number[][] = [];
  for (let y = 0; y < height; y++) {
    heightMap[y] = [];
    for (let x = 0; x < width; x++) {
      // Multi-frequency noise for snow texture
      const nx = x / width;
      const ny = y / height;

      const noise1 = Math.sin(nx * 50 + Math.sin(ny * 30)) * 0.5 + 0.5;
      const noise2 = Math.sin(nx * 120 + ny * 80) * 0.25 + 0.25;
      const noise3 = Math.sin(nx * 200 - ny * 150) * 0.125 + 0.125;

      heightMap[y][x] = noise1 + noise2 + noise3;
    }
  }

  // Calculate normals from height map
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const left = heightMap[y][(x - 1 + width) % width];
      const right = heightMap[y][(x + 1) % width];
      const up = heightMap[(y - 1 + height) % height][x];
      const down = heightMap[(y + 1) % height][x];

      const dx = (right - left) * 2;
      const dy = (down - up) * 2;

      // Normal in tangent space
      const nx = -dx;
      const ny = -dy;
      const nz = 1;
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz);

      const idx = (y * width + x) * 4;
      imageData.data[idx] = Math.floor(((nx / len) * 0.5 + 0.5) * 255);
      imageData.data[idx + 1] = Math.floor(((ny / len) * 0.5 + 0.5) * 255);
      imageData.data[idx + 2] = Math.floor(((nz / len) * 0.5 + 0.5) * 255);
      imageData.data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;

  return texture;
}

/**
 * Generate snow diffuse texture with sparkles
 */
function generateSnowDiffuseMap(width: number, height: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Base snow color
  ctx.fillStyle = '#fafcff';
  ctx.fillRect(0, 0, width, height);

  // Add subtle blue shadows
  const imageData = ctx.getImageData(0, 0, width, height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      // Subtle variation
      const noise = Math.sin(x * 0.1 + y * 0.08) * 0.5 + 0.5;
      const variation = noise * 10;

      imageData.data[idx] = Math.min(255, 250 - variation);
      imageData.data[idx + 1] = Math.min(255, 252 - variation * 0.5);
      imageData.data[idx + 2] = 255;

      // Random sparkles
      if (Math.random() < 0.003) {
        imageData.data[idx] = 255;
        imageData.data[idx + 1] = 255;
        imageData.data[idx + 2] = 255;
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;

  return texture;
}

/**
 * Generate snow roughness map
 */
function generateSnowRoughnessMap(width: number, height: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.createImageData(width, height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      // Base roughness with variation
      const noise = Math.sin(x * 0.05 + y * 0.03) * 0.5 + 0.5;
      const roughness = 0.75 + noise * 0.2;

      const value = Math.floor(roughness * 255);
      imageData.data[idx] = value;
      imageData.data[idx + 1] = value;
      imageData.data[idx + 2] = value;
      imageData.data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;

  return texture;
}

// ==================== PBR MATERIALS ====================

/**
 * Create professional snow material with PBR textures
 */
export function createSnowMaterial(): THREE.MeshStandardMaterial {
  const diffuseMap = generateSnowDiffuseMap(512, 512);
  const normalMap = generateSnowNormalMap(512, 512);
  const roughnessMap = generateSnowRoughnessMap(512, 512);

  // Set texture repeats
  const repeat = 40;
  [diffuseMap, normalMap, roughnessMap].forEach(tex => {
    tex.repeat.set(repeat, repeat);
  });

  return new THREE.MeshStandardMaterial({
    map: diffuseMap,
    normalMap: normalMap,
    normalScale: new THREE.Vector2(0.3, 0.3),
    roughnessMap: roughnessMap,
    roughness: 0.85,
    metalness: 0.0,
    envMapIntensity: 0.4,
    color: 0xffffff,
  });
}

/**
 * Create rock material with PBR
 */
export function createRockMaterial(): THREE.MeshStandardMaterial {
  const noiseTexture = generateNoiseTexture(256, 256, 8, 5);
  noiseTexture.repeat.set(10, 10);

  return new THREE.MeshStandardMaterial({
    color: 0x5d4e37,
    roughnessMap: noiseTexture,
    roughness: 0.9,
    metalness: 0.0,
    bumpMap: noiseTexture,
    bumpScale: 0.3,
  });
}

/**
 * Create ice material with reflections
 */
export function createIceMaterial(): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: 0xa8d4e6,
    roughness: 0.1,
    metalness: 0.0,
    transmission: 0.3,
    thickness: 0.5,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    envMapIntensity: 1.0,
  });
}

/**
 * Create pine tree bark material
 */
export function createBarkMaterial(): THREE.MeshStandardMaterial {
  const noiseTexture = generateNoiseTexture(128, 128, 4, 3);
  noiseTexture.repeat.set(1, 4);

  return new THREE.MeshStandardMaterial({
    color: 0x4a3728,
    roughnessMap: noiseTexture,
    roughness: 0.95,
    metalness: 0.0,
    bumpMap: noiseTexture,
    bumpScale: 0.5,
  });
}

/**
 * Create pine foliage material with subsurface approximation
 */
export function createFoliageMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: 0x1a472a,
    roughness: 0.8,
    metalness: 0.0,
    side: THREE.DoubleSide,
  });
}

// ==================== ENVIRONMENT MAP ====================

/**
 * Generate a simple procedural environment map for reflections
 */
export function createProceduralEnvMap(renderer: THREE.WebGLRenderer): THREE.CubeTexture {
  const size = 256;

  // Create cube render target
  const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(size, {
    format: THREE.RGBAFormat,
    generateMipmaps: true,
    minFilter: THREE.LinearMipmapLinearFilter,
  });

  // Create a simple gradient scene for the environment
  const envScene = new THREE.Scene();

  // Sky gradient sphere
  const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
  const skyMaterial = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: {
      topColor: { value: new THREE.Color(0x1e90ff) },
      bottomColor: { value: new THREE.Color(0xc8e0f8) },
      sunColor: { value: new THREE.Color(0xfffaf0) },
      sunDirection: { value: new THREE.Vector3(0.5, 0.7, 0.3).normalize() },
    },
    vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      uniform vec3 sunColor;
      uniform vec3 sunDirection;

      varying vec3 vWorldPosition;

      void main() {
        vec3 viewDirection = normalize(vWorldPosition);
        float y = viewDirection.y * 0.5 + 0.5;

        vec3 color = mix(bottomColor, topColor, pow(y, 0.6));

        // Sun glow
        float sunDot = max(0.0, dot(viewDirection, sunDirection));
        color += sunColor * pow(sunDot, 128.0) * 0.5;
        color += sunColor * pow(sunDot, 16.0) * 0.1;

        gl_FragColor = vec4(color, 1.0);
      }
    `,
  });

  const sky = new THREE.Mesh(skyGeometry, skyMaterial);
  envScene.add(sky);

  // Create cube camera
  const cubeCamera = new THREE.CubeCamera(1, 1000, cubeRenderTarget);
  cubeCamera.update(renderer, envScene);

  // Clean up
  skyGeometry.dispose();
  skyMaterial.dispose();

  return cubeRenderTarget.texture;
}

// ==================== MATERIAL PRESETS ====================

export interface MaterialSet {
  snow: THREE.MeshStandardMaterial;
  rock: THREE.MeshStandardMaterial;
  ice: THREE.MeshPhysicalMaterial;
  bark: THREE.MeshStandardMaterial;
  foliage: THREE.MeshStandardMaterial;
}

/**
 * Create all materials at once
 */
export function createAllMaterials(): MaterialSet {
  return {
    snow: createSnowMaterial(),
    rock: createRockMaterial(),
    ice: createIceMaterial(),
    bark: createBarkMaterial(),
    foliage: createFoliageMaterial(),
  };
}

/**
 * Apply environment map to all materials
 */
export function applyEnvMapToMaterials(
  materials: MaterialSet,
  envMap: THREE.CubeTexture
): void {
  materials.snow.envMap = envMap;
  materials.rock.envMap = envMap;
  materials.ice.envMap = envMap;

  console.log('🌍 Applied environment map to materials');
}
