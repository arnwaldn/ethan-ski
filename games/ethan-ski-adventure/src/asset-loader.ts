/**
 * Asset Loader - GLTF Loading with Procedural Fallback
 * Handles 3D model loading with automatic fallback to procedural generation
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

// Base URL for assets (handles GitHub Pages subpath)
const BASE_URL = import.meta.env.BASE_URL || '/';

// Asset paths configuration
const ASSET_PATHS = {
  trees: [
    `${BASE_URL}models/pine-tree-snow-1.glb`,
    `${BASE_URL}models/pine-tree-snow-2.glb`,
    `${BASE_URL}models/pine-tree-snow-3.glb`,
  ],
  rocks: [
    `${BASE_URL}models/rock-snow-1.glb`,
    `${BASE_URL}models/rock-snow-2.glb`,
  ],
  chalets: [
    `${BASE_URL}models/chalet-1.glb`,
  ],
  skier: `${BASE_URL}models/skier.glb`,
  textures: {
    snowAlbedo: `${BASE_URL}textures/snow_albedo.jpg`,
    snowNormal: `${BASE_URL}textures/snow_normal.jpg`,
    snowRoughness: `${BASE_URL}textures/snow_roughness.jpg`,
    rockAlbedo: `${BASE_URL}textures/rock_albedo.jpg`,
    rockNormal: `${BASE_URL}textures/rock_normal.jpg`,
  },
  hdri: `${BASE_URL}hdri/snowy_hillside.hdr`,
};

export interface GameAssets {
  trees: THREE.Group[];
  rocks: THREE.Group[];
  chalets: THREE.Group[];
  skier: THREE.Group | null;
  textures: {
    snow: {
      albedo: THREE.Texture | null;
      normal: THREE.Texture | null;
      roughness: THREE.Texture | null;
    };
    rock: {
      albedo: THREE.Texture | null;
      normal: THREE.Texture | null;
    };
  };
  hdri: THREE.Texture | null;
  usingProcedural: boolean;
}

// Procedural Tree Generator - Realistic snow-covered pine trees
export function createProceduralTree(variant: number = 0): THREE.Group {
  const tree = new THREE.Group();

  // Randomize based on variant
  const seed = variant * 12345;
  const random = (offset: number = 0) => {
    const x = Math.sin(seed + offset) * 10000;
    return x - Math.floor(x);
  };

  // Tree parameters with variation
  const trunkHeight = 1.5 + random(1) * 0.5;
  const trunkRadius = 0.12 + random(2) * 0.04;
  const layers = 5 + Math.floor(random(3) * 3); // 5-7 layers
  const baseRadius = 1.8 + random(4) * 0.6;
  const treeHeight = 4 + random(5) * 2;

  // Trunk - tapered cylinder with bark texture look
  const trunkGeometry = new THREE.CylinderGeometry(
    trunkRadius * 0.6,
    trunkRadius,
    trunkHeight,
    8,
    3
  );

  // Add slight bend to trunk
  const trunkPositions = trunkGeometry.attributes.position;
  for (let i = 0; i < trunkPositions.count; i++) {
    const y = trunkPositions.getY(i);
    const bendAmount = (y / trunkHeight) * 0.1 * (random(10 + i) - 0.5);
    trunkPositions.setX(i, trunkPositions.getX(i) + bendAmount);
  }
  trunkGeometry.computeVertexNormals();

  const trunkMaterial = new THREE.MeshStandardMaterial({
    color: 0x3d2817,
    roughness: 0.95,
    metalness: 0.0,
  });

  const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
  trunk.position.y = trunkHeight / 2;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  tree.add(trunk);

  // Foliage layers - cone with organic deformation
  const foliageMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a3d1a,
    roughness: 0.8,
    metalness: 0.0,
  });

  const snowMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.3,
    metalness: 0.0,
  });

  for (let i = 0; i < layers; i++) {
    const layerRatio = i / (layers - 1);
    const radius = baseRadius * (1 - layerRatio * 0.7);
    const height = (treeHeight / layers) * (1.2 - layerRatio * 0.4);
    const yPos = trunkHeight + (treeHeight / layers) * i * 0.75;

    // Main foliage cone with more segments for organic look
    const coneGeometry = new THREE.ConeGeometry(
      radius,
      height,
      12 + Math.floor(random(20 + i) * 4),
      3
    );

    // Deform for organic shape
    const positions = coneGeometry.attributes.position;
    for (let j = 0; j < positions.count; j++) {
      const x = positions.getX(j);
      const y = positions.getY(j);
      const z = positions.getZ(j);

      // Add noise-based deformation
      const noise = (random(100 + i * 10 + j) - 0.5) * 0.15;
      const angle = Math.atan2(z, x);
      const dist = Math.sqrt(x * x + z * z);

      positions.setX(j, x + noise * dist * Math.cos(angle + random(200 + j)));
      positions.setZ(j, z + noise * dist * Math.sin(angle + random(300 + j)));
      positions.setY(j, y + (random(400 + j) - 0.5) * 0.1);
    }
    coneGeometry.computeVertexNormals();

    const cone = new THREE.Mesh(coneGeometry, foliageMaterial.clone());
    cone.position.y = yPos + height / 2;
    cone.rotation.y = random(30 + i) * Math.PI * 2;
    cone.castShadow = true;
    cone.receiveShadow = true;
    tree.add(cone);

    // Snow cap on top layers
    if (i < layers - 1 && random(40 + i) > 0.3) {
      const snowCapGeometry = new THREE.ConeGeometry(
        radius * 0.85,
        height * 0.25,
        12,
        1
      );
      const snowCap = new THREE.Mesh(snowCapGeometry, snowMaterial.clone());
      snowCap.position.y = yPos + height * 0.85;
      snowCap.rotation.y = cone.rotation.y;
      snowCap.castShadow = true;
      tree.add(snowCap);
    }
  }

  // Snow patches on branches
  const snowPatchCount = 3 + Math.floor(random(50) * 4);
  for (let i = 0; i < snowPatchCount; i++) {
    const patchGeometry = new THREE.SphereGeometry(
      0.15 + random(60 + i) * 0.15,
      6,
      4
    );
    patchGeometry.scale(1, 0.3, 1);

    const patch = new THREE.Mesh(patchGeometry, snowMaterial.clone());
    const angle = random(70 + i) * Math.PI * 2;
    const dist = 0.5 + random(80 + i) * baseRadius * 0.5;
    const height = trunkHeight + random(90 + i) * treeHeight * 0.7;

    patch.position.set(
      Math.cos(angle) * dist,
      height,
      Math.sin(angle) * dist
    );
    patch.castShadow = true;
    tree.add(patch);
  }

  return tree;
}

// Procedural Rock Generator
export function createProceduralRock(variant: number = 0): THREE.Group {
  const rock = new THREE.Group();

  const seed = variant * 54321;
  const random = (offset: number = 0) => {
    const x = Math.sin(seed + offset) * 10000;
    return x - Math.floor(x);
  };

  // Base rock shape - deformed icosahedron
  const detail = 1 + Math.floor(random(1) * 2);
  const geometry = new THREE.IcosahedronGeometry(1, detail);

  // Deform vertices for organic rock shape
  const positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);

    // Stretch and squash
    const stretchY = 0.5 + random(10 + i) * 0.5;
    const stretchXZ = 0.8 + random(20 + i) * 0.4;

    // Add noise
    const noise = 0.7 + random(30 + i) * 0.6;

    positions.setX(i, x * stretchXZ * noise);
    positions.setY(i, Math.abs(y) * stretchY * noise);
    positions.setZ(i, z * stretchXZ * noise);
  }
  geometry.computeVertexNormals();

  const rockMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0.35 + random(40) * 0.1, 0.33 + random(50) * 0.1, 0.3 + random(60) * 0.1),
    roughness: 0.85 + random(70) * 0.15,
    metalness: 0.0,
  });

  const rockMesh = new THREE.Mesh(geometry, rockMaterial);
  rockMesh.castShadow = true;
  rockMesh.receiveShadow = true;
  rock.add(rockMesh);

  // Snow on top
  const snowGeometry = new THREE.SphereGeometry(0.7 + random(80) * 0.3, 8, 6);
  snowGeometry.scale(1, 0.2, 1);

  // Deform snow cap
  const snowPositions = snowGeometry.attributes.position;
  for (let i = 0; i < snowPositions.count; i++) {
    const y = snowPositions.getY(i);
    if (y > 0) {
      const noise = 0.8 + random(90 + i) * 0.4;
      snowPositions.setX(i, snowPositions.getX(i) * noise);
      snowPositions.setZ(i, snowPositions.getZ(i) * noise);
    }
  }
  snowGeometry.computeVertexNormals();

  const snowMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.3,
    metalness: 0.0,
  });

  const snowCap = new THREE.Mesh(snowGeometry, snowMaterial);
  snowCap.position.y = 0.4;
  snowCap.castShadow = true;
  rock.add(snowCap);

  return rock;
}

// Procedural Chalet Generator
export function createProceduralChalet(variant: number = 0): THREE.Group {
  const chalet = new THREE.Group();

  const seed = variant * 98765;
  const random = (offset: number = 0) => {
    const x = Math.sin(seed + offset) * 10000;
    return x - Math.floor(x);
  };

  // Main building
  const width = 4 + random(1) * 2;
  const depth = 3 + random(2) * 1.5;
  const height = 2.5 + random(3) * 1;

  const buildingGeometry = new THREE.BoxGeometry(width, height, depth);
  const woodMaterial = new THREE.MeshStandardMaterial({
    color: 0x8B4513,
    roughness: 0.9,
    metalness: 0.0,
  });

  const building = new THREE.Mesh(buildingGeometry, woodMaterial);
  building.position.y = height / 2;
  building.castShadow = true;
  building.receiveShadow = true;
  chalet.add(building);

  // Roof
  const roofHeight = 1.5 + random(4) * 0.5;
  const roofGeometry = new THREE.ConeGeometry(
    Math.max(width, depth) * 0.8,
    roofHeight,
    4
  );
  roofGeometry.rotateY(Math.PI / 4);

  const roofMaterial = new THREE.MeshStandardMaterial({
    color: 0x4a3728,
    roughness: 0.85,
    metalness: 0.0,
  });

  const roof = new THREE.Mesh(roofGeometry, roofMaterial);
  roof.position.y = height + roofHeight / 2;
  roof.castShadow = true;
  roof.receiveShadow = true;
  chalet.add(roof);

  // Snow on roof
  const snowRoofGeometry = new THREE.ConeGeometry(
    Math.max(width, depth) * 0.85,
    roofHeight * 0.3,
    4
  );
  snowRoofGeometry.rotateY(Math.PI / 4);

  const snowMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.3,
    metalness: 0.0,
  });

  const snowRoof = new THREE.Mesh(snowRoofGeometry, snowMaterial);
  snowRoof.position.y = height + roofHeight * 0.7;
  snowRoof.castShadow = true;
  chalet.add(snowRoof);

  // Door
  const doorGeometry = new THREE.BoxGeometry(0.8, 1.8, 0.1);
  const doorMaterial = new THREE.MeshStandardMaterial({
    color: 0x2d1810,
    roughness: 0.9,
  });
  const door = new THREE.Mesh(doorGeometry, doorMaterial);
  door.position.set(0, 0.9, depth / 2 + 0.05);
  chalet.add(door);

  // Windows
  const windowMaterial = new THREE.MeshStandardMaterial({
    color: 0x87ceeb,
    roughness: 0.1,
    metalness: 0.3,
    emissive: 0xffaa44,
    emissiveIntensity: 0.3,
  });

  const windowPositions = [
    [-width / 3, height * 0.6, depth / 2 + 0.05],
    [width / 3, height * 0.6, depth / 2 + 0.05],
  ];

  windowPositions.forEach(([x, y, z]) => {
    const windowGeometry = new THREE.BoxGeometry(0.6, 0.6, 0.05);
    const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
    windowMesh.position.set(x, y, z);
    chalet.add(windowMesh);
  });

  // Chimney
  const chimneyGeometry = new THREE.BoxGeometry(0.4, 1.2, 0.4);
  const chimney = new THREE.Mesh(chimneyGeometry, new THREE.MeshStandardMaterial({
    color: 0x8b0000,
    roughness: 0.9,
  }));
  chimney.position.set(width / 4, height + roofHeight * 0.3, 0);
  chimney.castShadow = true;
  chalet.add(chimney);

  return chalet;
}

// Main Asset Loader
export class AssetLoader {
  private gltfLoader: GLTFLoader;
  private dracoLoader: DRACOLoader;
  private textureLoader: THREE.TextureLoader;
  private loadedAssets: GameAssets | null = null;

  constructor() {
    this.gltfLoader = new GLTFLoader();
    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    this.gltfLoader.setDRACOLoader(this.dracoLoader);
    this.textureLoader = new THREE.TextureLoader();
  }

  private async loadModel(path: string): Promise<THREE.Group | null> {
    try {
      const gltf = await this.gltfLoader.loadAsync(path);
      return gltf.scene;
    } catch (error) {
      console.warn(`Failed to load model: ${path}`, error);
      return null;
    }
  }

  private async loadTexture(path: string): Promise<THREE.Texture | null> {
    try {
      const texture = await this.textureLoader.loadAsync(path);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      return texture;
    } catch (error) {
      console.warn(`Failed to load texture: ${path}`, error);
      return null;
    }
  }

  async loadAssets(
    onProgress?: (loaded: number, total: number, item: string) => void
  ): Promise<GameAssets> {
    const totalItems =
      ASSET_PATHS.trees.length +
      ASSET_PATHS.rocks.length +
      ASSET_PATHS.chalets.length +
      1 + // skier
      Object.keys(ASSET_PATHS.textures).length +
      1; // hdri

    let loadedItems = 0;

    const reportProgress = (item: string) => {
      loadedItems++;
      onProgress?.(loadedItems, totalItems, item);
    };

    // Try loading GLTF models
    const trees: THREE.Group[] = [];
    for (let i = 0; i < ASSET_PATHS.trees.length; i++) {
      const model = await this.loadModel(ASSET_PATHS.trees[i]);
      if (model) {
        trees.push(model);
      }
      reportProgress(`Tree ${i + 1}`);
    }

    const rocks: THREE.Group[] = [];
    for (let i = 0; i < ASSET_PATHS.rocks.length; i++) {
      const model = await this.loadModel(ASSET_PATHS.rocks[i]);
      if (model) {
        rocks.push(model);
      }
      reportProgress(`Rock ${i + 1}`);
    }

    const chalets: THREE.Group[] = [];
    for (let i = 0; i < ASSET_PATHS.chalets.length; i++) {
      const model = await this.loadModel(ASSET_PATHS.chalets[i]);
      if (model) {
        chalets.push(model);
      }
      reportProgress(`Chalet ${i + 1}`);
    }

    const skier = await this.loadModel(ASSET_PATHS.skier);
    reportProgress('Skier');

    // Check if we need procedural fallback
    const usingProcedural = trees.length === 0;

    if (usingProcedural) {
      console.log('Using procedural assets as fallback');

      // Generate procedural variants
      for (let i = 0; i < 5; i++) {
        trees.push(createProceduralTree(i));
      }

      for (let i = 0; i < 3; i++) {
        rocks.push(createProceduralRock(i));
      }

      for (let i = 0; i < 2; i++) {
        chalets.push(createProceduralChalet(i));
      }
    }

    // Load textures
    const textures = {
      snow: {
        albedo: await this.loadTexture(ASSET_PATHS.textures.snowAlbedo),
        normal: await this.loadTexture(ASSET_PATHS.textures.snowNormal),
        roughness: await this.loadTexture(ASSET_PATHS.textures.snowRoughness),
      },
      rock: {
        albedo: await this.loadTexture(ASSET_PATHS.textures.rockAlbedo),
        normal: await this.loadTexture(ASSET_PATHS.textures.rockNormal),
      },
    };

    Object.keys(ASSET_PATHS.textures).forEach(key => reportProgress(`Texture: ${key}`));

    // Try loading HDRI
    let hdri: THREE.Texture | null = null;
    try {
      // HDRI loading would need RGBELoader, for now just mark as attempted
      reportProgress('HDRI');
    } catch {
      reportProgress('HDRI (fallback)');
    }

    this.loadedAssets = {
      trees,
      rocks,
      chalets,
      skier,
      textures,
      hdri,
      usingProcedural,
    };

    return this.loadedAssets;
  }

  getAssets(): GameAssets | null {
    return this.loadedAssets;
  }

  dispose(): void {
    this.dracoLoader.dispose();
  }
}

// Singleton instance
let assetLoaderInstance: AssetLoader | null = null;

export function getAssetLoader(): AssetLoader {
  if (!assetLoaderInstance) {
    assetLoaderInstance = new AssetLoader();
  }
  return assetLoaderInstance;
}

export default AssetLoader;
