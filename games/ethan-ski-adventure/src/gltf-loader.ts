/**
 * GLTF ASSET LOADER - Professional Asset Management
 * Loads 3D models, textures, and HDRI for the ski game
 */

import * as THREE from 'three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

// Base URL for assets (handles GitHub Pages subpath)
const BASE_URL = import.meta.env.BASE_URL || '/';

// ==================== TYPES ====================

export interface TreeModel {
  geometry: THREE.BufferGeometry;
  material: THREE.Material | THREE.Material[];
  scale: number;
}

export interface RockModel {
  geometry: THREE.BufferGeometry;
  material: THREE.Material | THREE.Material[];
  scale: number;
}

export interface SnowTextures {
  diffuse: THREE.Texture;
  normal: THREE.Texture;
  roughness: THREE.Texture;
}

export interface GameAssets {
  trees: TreeModel[];
  rocks: RockModel[];
  snowTextures: SnowTextures;
  hdri: THREE.Texture | null;
  loaded: boolean;
}

export interface LoadingProgress {
  total: number;
  loaded: number;
  currentItem: string;
}

// ==================== LOADER CLASS ====================

export class AssetLoader {
  private gltfLoader: GLTFLoader;
  private textureLoader: THREE.TextureLoader;
  private rgbeLoader: RGBELoader;
  private onProgress?: (progress: LoadingProgress) => void;

  constructor(onProgress?: (progress: LoadingProgress) => void) {
    this.onProgress = onProgress;

    // Setup GLTF loader with DRACO compression support
    this.gltfLoader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
    this.gltfLoader.setDRACOLoader(dracoLoader);

    // Standard texture loader
    this.textureLoader = new THREE.TextureLoader();

    // HDRI loader
    this.rgbeLoader = new RGBELoader();
  }

  /**
   * Load all game assets
   */
  async loadAllAssets(): Promise<GameAssets> {
    const totalItems = 9; // 3 trees + 2 rocks + 3 textures + 1 HDRI
    let loadedItems = 0;

    const updateProgress = (item: string) => {
      loadedItems++;
      this.onProgress?.({
        total: totalItems,
        loaded: loadedItems,
        currentItem: item,
      });
    };

    // Load trees in parallel
    const treePromises = [
      this.loadTreeModel(`${BASE_URL}models/pine-tree-1.glb`, 'Pine Tree 1', 8),
      this.loadTreeModel(`${BASE_URL}models/pine-tree-2.glb`, 'Pine Tree 2', 8),
      this.loadTreeModel(`${BASE_URL}models/pine-tree-3.glb`, 'Pine Tree 3', 6),
    ];

    // Load rocks in parallel
    const rockPromises = [
      this.loadRockModel(`${BASE_URL}models/rock-1.glb`, 'Rock 1', 4),
      this.loadRockModel(`${BASE_URL}models/rock-2.glb`, 'Rock 2', 5),
    ];

    // Load textures
    const texturePromises = this.loadSnowTextures();

    // Load HDRI
    const hdriPromise = this.loadHDRI('/hdri/snowy_field_1k.hdr');

    // Wait for all to complete
    const [trees, rocks, snowTextures, hdri] = await Promise.all([
      Promise.all(treePromises).then((t) => {
        t.forEach((_, i) => updateProgress(`Tree ${i + 1}`));
        return t;
      }),
      Promise.all(rockPromises).then((r) => {
        r.forEach((_, i) => updateProgress(`Rock ${i + 1}`));
        return r;
      }),
      texturePromises.then((tex) => {
        updateProgress('Snow Textures');
        return tex;
      }),
      hdriPromise.then((h) => {
        updateProgress('HDRI Skybox');
        return h;
      }),
    ]);

    return {
      trees: trees.filter((t): t is TreeModel => t !== null),
      rocks: rocks.filter((r): r is RockModel => r !== null),
      snowTextures,
      hdri,
      loaded: true,
    };
  }

  /**
   * Load a tree model from GLTF
   */
  private async loadTreeModel(
    path: string,
    name: string,
    scale: number
  ): Promise<TreeModel | null> {
    try {
      const gltf = await this.loadGLTF(path);
      if (!gltf) {
        console.warn(`GLTF not loaded for ${name}`);
        return null;
      }
      const model = this.extractMeshFromGLTF(gltf);

      if (model) {
        // Apply snow tint to tree material
        this.applySnowTint(model.material);

        return {
          geometry: model.geometry,
          material: model.material,
          scale,
        };
      }
    } catch (error) {
      console.warn(`Failed to load tree model ${name}:`, error);
    }
    return null;
  }

  /**
   * Load a rock model from GLTF
   */
  private async loadRockModel(
    path: string,
    name: string,
    scale: number
  ): Promise<RockModel | null> {
    try {
      const gltf = await this.loadGLTF(path);
      if (!gltf) {
        console.warn(`GLTF not loaded for ${name}`);
        return null;
      }
      const model = this.extractMeshFromGLTF(gltf);

      if (model) {
        // Apply snow coverage to rocks
        this.applySnowCoverage(model.material);

        return {
          geometry: model.geometry,
          material: model.material,
          scale,
        };
      }
    } catch (error) {
      console.warn(`Failed to load rock model ${name}:`, error);
    }
    return null;
  }

  /**
   * Load GLTF file with timeout
   */
  private loadGLTF(path: string): Promise<GLTF | null> {
    return new Promise((resolve) => {
      // Timeout after 10 seconds
      const timeout = setTimeout(() => {
        console.warn(`GLTF load timeout: ${path}`);
        resolve(null);
      }, 10000);

      this.gltfLoader.load(
        path,
        (gltf) => {
          clearTimeout(timeout);
          resolve(gltf);
        },
        undefined,
        (error) => {
          clearTimeout(timeout);
          console.warn(`Failed to load GLTF ${path}:`, error);
          resolve(null);
        }
      );
    });
  }

  /**
   * Extract mesh geometry and material from GLTF
   * Handles various GLTF structures and material types
   */
  private extractMeshFromGLTF(
    gltf: GLTF
  ): { geometry: THREE.BufferGeometry; material: THREE.Material | THREE.Material[] } | null {
    const meshes: THREE.Mesh[] = [];

    // Collect all meshes in the scene
    gltf.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        meshes.push(child);
      }
    });

    console.log(`    Found ${meshes.length} meshes in GLTF`);

    if (meshes.length === 0) {
      console.warn('    No meshes found in GLTF scene');
      return null;
    }

    // If multiple meshes, merge them
    if (meshes.length > 1) {
      return this.mergeMeshes(meshes);
    }

    // Single mesh - clone geometry and material
    const mesh = meshes[0];
    console.log(`    Mesh geometry vertices: ${mesh.geometry.attributes.position?.count || 0}`);
    console.log(`    Material type: ${mesh.material.constructor.name}`);

    // Convert material to MeshStandardMaterial if needed
    const material = this.ensureStandardMaterial(mesh.material);

    return {
      geometry: mesh.geometry.clone(),
      material: material,
    };
  }

  /**
   * Merge multiple meshes into one
   */
  private mergeMeshes(meshes: THREE.Mesh[]): { geometry: THREE.BufferGeometry; material: THREE.Material } | null {
    // Use the first mesh's material as base
    const baseMaterial = this.ensureStandardMaterial(meshes[0].material);

    // Collect all geometries
    const geometries: THREE.BufferGeometry[] = [];

    meshes.forEach((mesh) => {
      // Apply mesh's world matrix to geometry
      const clonedGeom = mesh.geometry.clone();
      mesh.updateWorldMatrix(true, false);
      clonedGeom.applyMatrix4(mesh.matrixWorld);
      geometries.push(clonedGeom);
    });

    // Merge using BufferGeometryUtils pattern
    const mergedGeometry = this.mergeBufferGeometries(geometries);

    if (!mergedGeometry) {
      console.warn('    Failed to merge geometries');
      return null;
    }

    console.log(`    Merged ${meshes.length} meshes into one with ${mergedGeometry.attributes.position?.count || 0} vertices`);

    return {
      geometry: mergedGeometry,
      material: baseMaterial,
    };
  }

  /**
   * Simple geometry merge for compatible geometries
   */
  private mergeBufferGeometries(geometries: THREE.BufferGeometry[]): THREE.BufferGeometry | null {
    if (geometries.length === 0) return null;
    if (geometries.length === 1) return geometries[0];

    // Count total vertices
    let totalVertices = 0;
    geometries.forEach(g => {
      totalVertices += g.attributes.position?.count || 0;
    });

    if (totalVertices === 0) return null;

    const positions = new Float32Array(totalVertices * 3);
    const normals = new Float32Array(totalVertices * 3);

    let offset = 0;
    geometries.forEach(geom => {
      const pos = geom.attributes.position;
      const norm = geom.attributes.normal;

      if (pos) {
        for (let i = 0; i < pos.count; i++) {
          positions[offset * 3] = pos.getX(i);
          positions[offset * 3 + 1] = pos.getY(i);
          positions[offset * 3 + 2] = pos.getZ(i);

          if (norm) {
            normals[offset * 3] = norm.getX(i);
            normals[offset * 3 + 1] = norm.getY(i);
            normals[offset * 3 + 2] = norm.getZ(i);
          }
          offset++;
        }
      }
    });

    const merged = new THREE.BufferGeometry();
    merged.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    merged.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    merged.computeBoundingSphere();

    return merged;
  }

  /**
   * Convert any material type to MeshStandardMaterial
   */
  private ensureStandardMaterial(material: THREE.Material | THREE.Material[]): THREE.MeshStandardMaterial {
    const mat = Array.isArray(material) ? material[0] : material;

    // If already MeshStandardMaterial, clone it
    if (mat instanceof THREE.MeshStandardMaterial) {
      return mat.clone();
    }

    // Extract color from any material type
    let color = new THREE.Color(0x4a7c4b); // Default green for trees

    if ('color' in mat && mat.color instanceof THREE.Color) {
      color = mat.color.clone();
    }
    if (mat instanceof THREE.MeshBasicMaterial || mat instanceof THREE.MeshPhongMaterial) {
      color = mat.color.clone();
    }

    console.log(`    Converting ${mat.constructor.name} to MeshStandardMaterial (color: #${color.getHexString()})`);

    // Create new standard material
    return new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.8,
      metalness: 0.0,
      side: THREE.DoubleSide,
    });
  }

  /**
   * Apply snow tint to materials for winter look
   */
  private applySnowTint(material: THREE.Material | THREE.Material[]): void {
    const applyTint = (mat: THREE.Material) => {
      // Works with MeshStandardMaterial (which we now ensure)
      if (mat instanceof THREE.MeshStandardMaterial) {
        // Add white/blue snow tint for wintery look
        mat.color.lerp(new THREE.Color(0xf0f8ff), 0.3);
        mat.roughness = Math.min(mat.roughness + 0.2, 1.0);
      }
    };

    if (Array.isArray(material)) {
      material.forEach(applyTint);
    } else {
      applyTint(material);
    }
  }

  /**
   * Apply snow coverage effect to rock materials
   */
  private applySnowCoverage(material: THREE.Material | THREE.Material[]): void {
    const applySnow = (mat: THREE.Material) => {
      if (mat instanceof THREE.MeshStandardMaterial) {
        // More aggressive snow tint for rocks
        mat.color.lerp(new THREE.Color(0xe8f0f8), 0.5);
        mat.roughness = 0.85;
        mat.metalness = 0.0;
      }
    };

    if (Array.isArray(material)) {
      material.forEach(applySnow);
    } else {
      applySnow(material);
    }
  }

  /**
   * Load PBR snow textures with timeout and error handling
   */
  private async loadSnowTextures(): Promise<SnowTextures> {
    const loadTexture = (path: string): Promise<THREE.Texture | null> => {
      return new Promise((resolve) => {
        // Timeout after 5 seconds
        const timeout = setTimeout(() => {
          console.warn(`Texture load timeout: ${path}`);
          resolve(null);
        }, 5000);

        this.textureLoader.load(
          path,
          (texture) => {
            clearTimeout(timeout);
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(50, 200); // Tile across terrain
            texture.colorSpace = path.includes('diff') ? THREE.SRGBColorSpace : THREE.LinearSRGBColorSpace;
            resolve(texture);
          },
          undefined,
          (error) => {
            clearTimeout(timeout);
            console.warn(`Failed to load texture ${path}:`, error);
            resolve(null);
          }
        );
      });
    };

    const [diffuse, normal, roughness] = await Promise.all([
      loadTexture(`${BASE_URL}textures/snow_diff_2k.jpg`),
      loadTexture(`${BASE_URL}textures/snow_nor_2k.jpg`),
      loadTexture(`${BASE_URL}textures/snow_rough_2k.jpg`),
    ]);

    // Create fallback white texture if any failed
    const createFallback = (): THREE.Texture => {
      const canvas = document.createElement('canvas');
      canvas.width = 4;
      canvas.height = 4;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 4, 4);
      return new THREE.CanvasTexture(canvas);
    };

    return {
      diffuse: diffuse || createFallback(),
      normal: normal || createFallback(),
      roughness: roughness || createFallback(),
    };
  }

  /**
   * Load HDRI environment map with timeout
   */
  private async loadHDRI(path: string): Promise<THREE.Texture | null> {
    return new Promise((resolve) => {
      // Timeout after 8 seconds
      const timeout = setTimeout(() => {
        console.warn(`HDRI load timeout: ${path}`);
        resolve(null);
      }, 8000);

      this.rgbeLoader.load(
        path,
        (texture) => {
          clearTimeout(timeout);
          texture.mapping = THREE.EquirectangularReflectionMapping;
          resolve(texture);
        },
        undefined,
        (error) => {
          clearTimeout(timeout);
          console.warn('Failed to load HDRI:', error);
          resolve(null);
        }
      );
    });
  }
}

// ==================== INSTANCED MESH HELPERS ====================

/**
 * Create instanced meshes from loaded tree models
 */
export function createInstancedTrees(
  trees: TreeModel[],
  positions: Array<{ x: number; y: number; z: number; scale?: number; rotation?: number }>,
  receiveShadow: boolean = true,
  castShadow: boolean = true
): THREE.InstancedMesh[] {
  const instancedMeshes: THREE.InstancedMesh[] = [];

  trees.forEach((tree, treeIndex) => {
    // Filter positions for this tree variant
    const treePositions = positions.filter((_, i) => i % trees.length === treeIndex);

    if (treePositions.length === 0) return;

    const instancedMesh = new THREE.InstancedMesh(
      tree.geometry,
      tree.material,
      treePositions.length
    );

    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const rotation = new THREE.Euler();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();

    treePositions.forEach((pos, i) => {
      position.set(pos.x, pos.y, pos.z);
      rotation.set(0, pos.rotation || Math.random() * Math.PI * 2, 0);
      quaternion.setFromEuler(rotation);

      const s = (pos.scale || 1) * tree.scale;
      scale.set(s, s * (0.8 + Math.random() * 0.4), s); // Vary height

      matrix.compose(position, quaternion, scale);
      instancedMesh.setMatrixAt(i, matrix);
    });

    instancedMesh.instanceMatrix.needsUpdate = true;
    instancedMesh.receiveShadow = receiveShadow;
    instancedMesh.castShadow = castShadow;
    instancedMesh.frustumCulled = true;

    instancedMeshes.push(instancedMesh);
  });

  return instancedMeshes;
}

/**
 * Create instanced meshes from loaded rock models
 */
export function createInstancedRocks(
  rocks: RockModel[],
  positions: Array<{ x: number; y: number; z: number; scale?: number; rotation?: number }>,
  receiveShadow: boolean = true,
  castShadow: boolean = true
): THREE.InstancedMesh[] {
  const instancedMeshes: THREE.InstancedMesh[] = [];

  rocks.forEach((rock, rockIndex) => {
    const rockPositions = positions.filter((_, i) => i % rocks.length === rockIndex);

    if (rockPositions.length === 0) return;

    const instancedMesh = new THREE.InstancedMesh(
      rock.geometry,
      rock.material,
      rockPositions.length
    );

    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const rotation = new THREE.Euler();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();

    rockPositions.forEach((pos, i) => {
      position.set(pos.x, pos.y, pos.z);
      rotation.set(
        Math.random() * 0.3,
        pos.rotation || Math.random() * Math.PI * 2,
        Math.random() * 0.3
      );
      quaternion.setFromEuler(rotation);

      const s = (pos.scale || 1) * rock.scale * (0.5 + Math.random() * 1.0);
      scale.set(s, s * (0.7 + Math.random() * 0.6), s);

      matrix.compose(position, quaternion, scale);
      instancedMesh.setMatrixAt(i, matrix);
    });

    instancedMesh.instanceMatrix.needsUpdate = true;
    instancedMesh.receiveShadow = receiveShadow;
    instancedMesh.castShadow = castShadow;
    instancedMesh.frustumCulled = true;

    instancedMeshes.push(instancedMesh);
  });

  return instancedMeshes;
}

/**
 * Apply HDRI environment to scene
 */
export function applyEnvironment(
  scene: THREE.Scene,
  hdri: THREE.Texture | null,
  intensity: number = 0.8
): void {
  if (hdri) {
    scene.environment = hdri;
    scene.background = hdri;
    scene.backgroundIntensity = intensity;
    scene.environmentIntensity = intensity;
  }
}

/**
 * Create snow material with PBR textures
 */
export function createSnowMaterial(textures: SnowTextures): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    map: textures.diffuse,
    normalMap: textures.normal,
    roughnessMap: textures.roughness,
    roughness: 0.9,
    metalness: 0.0,
    color: 0xffffff,
    envMapIntensity: 0.3,
  });
}

// ==================== SINGLETON LOADER ====================

let assetLoaderInstance: AssetLoader | null = null;
let loadedAssets: GameAssets | null = null;

/**
 * Get or create asset loader singleton
 */
export function getAssetLoader(onProgress?: (progress: LoadingProgress) => void): AssetLoader {
  if (!assetLoaderInstance) {
    assetLoaderInstance = new AssetLoader(onProgress);
  }
  return assetLoaderInstance;
}

/**
 * Load assets if not already loaded
 */
export async function ensureAssetsLoaded(
  onProgress?: (progress: LoadingProgress) => void
): Promise<GameAssets> {
  if (loadedAssets?.loaded) {
    return loadedAssets;
  }

  const loader = getAssetLoader(onProgress);
  loadedAssets = await loader.loadAllAssets();
  return loadedAssets;
}

export default AssetLoader;
