/**
 * LIGHTING SYSTEM - Professional Alpine Lighting with 4K Shadows
 * Realistic winter mountain illumination
 */

import * as THREE from 'three';

// ==================== LIGHTING CONFIGURATION ====================

export interface LightingConfig {
  // Sun settings
  sunIntensity: number;
  sunColor: THREE.ColorRepresentation;
  sunPosition: THREE.Vector3;

  // Ambient/hemisphere
  skyColor: THREE.ColorRepresentation;
  groundColor: THREE.ColorRepresentation;
  ambientIntensity: number;

  // Shadows
  shadowMapSize: number;
  shadowCameraSize: number;
  shadowBias: number;
  shadowNear: number;
  shadowFar: number;

  // Fog
  fogColor: THREE.ColorRepresentation;
  fogNear: number;
  fogFar: number;

  // Time of day (0-1, 0.5 = noon)
  timeOfDay: number;
}

export const DEFAULT_LIGHTING_CONFIG: LightingConfig = {
  sunIntensity: 2.2,  // Réduit pour meilleure fidélité des couleurs
  sunColor: 0xffffff,  // Blanc neutre au lieu de chaud
  sunPosition: new THREE.Vector3(300, 500, 400),

  skyColor: 0xb8d4f0,
  groundColor: 0x8095a8,
  ambientIntensity: 0.8,

  shadowMapSize: 4096,
  shadowCameraSize: 600,
  shadowBias: -0.0002,
  shadowNear: 10,
  shadowFar: 2500,

  fogColor: 0xd8eaf8,
  fogNear: 150,
  fogFar: 1000,

  timeOfDay: 0.45, // Slightly before noon for nice shadows
};

// ==================== LIGHTING PRESETS ====================

export const LIGHTING_PRESETS = {
  // Bright midday sun
  noon: {
    sunIntensity: 4.0,
    sunColor: 0xffffff,
    sunPosition: new THREE.Vector3(100, 800, 200),
    skyColor: 0xa8c8f0,
    groundColor: 0x607080,
    ambientIntensity: 0.9,
    fogColor: 0xc0d8f0,
    fogNear: 200,
    fogFar: 1200,
    timeOfDay: 0.5,
  },

  // Golden hour morning
  goldenMorning: {
    sunIntensity: 2.8,
    sunColor: 0xffd090,
    sunPosition: new THREE.Vector3(600, 200, 400),
    skyColor: 0xf0d0a0,
    groundColor: 0x707080,
    ambientIntensity: 0.6,
    fogColor: 0xf0e0d0,
    fogNear: 100,
    fogFar: 800,
    timeOfDay: 0.25,
  },

  // Golden hour evening
  goldenEvening: {
    sunIntensity: 2.5,
    sunColor: 0xffc080,
    sunPosition: new THREE.Vector3(-500, 150, 300),
    skyColor: 0xf0b080,
    groundColor: 0x606080,
    ambientIntensity: 0.5,
    fogColor: 0xf0d0c0,
    fogNear: 80,
    fogFar: 700,
    timeOfDay: 0.75,
  },

  // Overcast winter
  overcast: {
    sunIntensity: 1.5,
    sunColor: 0xe0e8f0,
    sunPosition: new THREE.Vector3(200, 300, 300),
    skyColor: 0xc0c8d0,
    groundColor: 0x909098,
    ambientIntensity: 1.2,
    fogColor: 0xd0d8e0,
    fogNear: 50,
    fogFar: 500,
    timeOfDay: 0.5,
  },

  // Blue hour (just before sunrise/after sunset)
  blueHour: {
    sunIntensity: 0.5,
    sunColor: 0xa0c0f0,
    sunPosition: new THREE.Vector3(-100, 50, 500),
    skyColor: 0x405080,
    groundColor: 0x303050,
    ambientIntensity: 0.4,
    fogColor: 0x506080,
    fogNear: 30,
    fogFar: 400,
    timeOfDay: 0.1,
  },
};

// ==================== LIGHTING SYSTEM CLASS ====================

export class LightingSystem {
  private scene: THREE.Scene;
  private config: LightingConfig;

  // Light sources
  public sun: THREE.DirectionalLight;
  public hemisphere: THREE.HemisphereLight;
  public ambient: THREE.AmbientLight;
  public fillLight: THREE.DirectionalLight;

  // Helper for debugging
  private sunHelper: THREE.CameraHelper | null = null;

  constructor(scene: THREE.Scene, config: Partial<LightingConfig> = {}) {
    this.scene = scene;
    this.config = { ...DEFAULT_LIGHTING_CONFIG, ...config };

    // Create lights
    this.sun = this.createSun();
    this.hemisphere = this.createHemisphere();
    this.ambient = this.createAmbient();
    this.fillLight = this.createFillLight();

    // Add to scene
    this.scene.add(this.sun);
    this.scene.add(this.sun.target);
    this.scene.add(this.hemisphere);
    this.scene.add(this.ambient);
    this.scene.add(this.fillLight);

    // Setup fog
    this.setupFog();
  }

  private createSun(): THREE.DirectionalLight {
    const { sunIntensity, sunColor, sunPosition, shadowMapSize, shadowCameraSize, shadowBias, shadowNear, shadowFar } = this.config;

    const sun = new THREE.DirectionalLight(sunColor, sunIntensity);
    sun.position.copy(sunPosition);
    sun.castShadow = true;

    // Shadow camera configuration - large area for outdoor scene
    sun.shadow.camera.left = -shadowCameraSize;
    sun.shadow.camera.right = shadowCameraSize;
    sun.shadow.camera.top = shadowCameraSize;
    sun.shadow.camera.bottom = -shadowCameraSize;
    sun.shadow.camera.near = shadowNear;
    sun.shadow.camera.far = shadowFar;

    // 4K shadow map for crisp shadows
    sun.shadow.mapSize.width = shadowMapSize;
    sun.shadow.mapSize.height = shadowMapSize;

    // Shadow quality settings
    sun.shadow.bias = shadowBias;
    sun.shadow.normalBias = 0.02;
    sun.shadow.radius = 1.5; // Soft shadow edges

    // Target at scene center
    sun.target.position.set(0, 0, 200);

    return sun;
  }

  private createHemisphere(): THREE.HemisphereLight {
    const { skyColor, groundColor, ambientIntensity } = this.config;

    const hemi = new THREE.HemisphereLight(skyColor, groundColor, ambientIntensity * 0.6);
    hemi.position.set(0, 500, 0);

    return hemi;
  }

  private createAmbient(): THREE.AmbientLight {
    const { ambientIntensity } = this.config;

    // Subtle blue-tinted ambient for snow reflection
    return new THREE.AmbientLight(0xe0f0ff, ambientIntensity * 0.3);
  }

  private createFillLight(): THREE.DirectionalLight {
    const { sunIntensity, sunPosition } = this.config;

    // Fill light from opposite direction for softer shadows
    const fill = new THREE.DirectionalLight(0xb0c8e0, sunIntensity * 0.15);
    fill.position.set(-sunPosition.x * 0.5, sunPosition.y * 0.3, -sunPosition.z * 0.5);
    fill.castShadow = false;

    return fill;
  }

  private setupFog(): void {
    const { fogColor, fogNear, fogFar } = this.config;

    // Exponential fog for more natural atmosphere
    this.scene.fog = new THREE.Fog(fogColor, fogNear, fogFar);
    this.scene.background = new THREE.Color(fogColor);
  }

  // ==================== PUBLIC METHODS ====================

  /**
   * Apply a lighting preset
   */
  applyPreset(presetName: keyof typeof LIGHTING_PRESETS): void {
    const preset = LIGHTING_PRESETS[presetName];
    if (!preset) return;

    this.config = { ...this.config, ...preset };

    // Update sun
    this.sun.intensity = this.config.sunIntensity;
    this.sun.color.set(this.config.sunColor);
    this.sun.position.copy(this.config.sunPosition as THREE.Vector3);

    // Update hemisphere
    this.hemisphere.color.set(this.config.skyColor);
    this.hemisphere.groundColor.set(this.config.groundColor);
    this.hemisphere.intensity = this.config.ambientIntensity * 0.6;

    // Update ambient
    this.ambient.intensity = this.config.ambientIntensity * 0.3;

    // Update fill light
    const sunPos = this.config.sunPosition as THREE.Vector3;
    this.fillLight.position.set(-sunPos.x * 0.5, sunPos.y * 0.3, -sunPos.z * 0.5);
    this.fillLight.intensity = this.config.sunIntensity * 0.15;

    // Update fog
    if (this.scene.fog instanceof THREE.Fog) {
      this.scene.fog.color.set(this.config.fogColor);
      this.scene.fog.near = this.config.fogNear;
      this.scene.fog.far = this.config.fogFar;
    }
    (this.scene.background as THREE.Color)?.set(this.config.fogColor);
  }

  /**
   * Update sun position to follow player (for consistent shadows)
   */
  updateSunTarget(targetPosition: THREE.Vector3): void {
    // Keep sun relative to player for consistent shadow coverage
    const offset = this.config.sunPosition as THREE.Vector3;
    this.sun.position.set(
      targetPosition.x + offset.x,
      offset.y,
      targetPosition.z + offset.z * 0.5
    );
    this.sun.target.position.copy(targetPosition);
  }

  /**
   * Set time of day (0-1, affects sun angle and colors)
   */
  setTimeOfDay(time: number): void {
    time = Math.max(0, Math.min(1, time));
    this.config.timeOfDay = time;

    // Calculate sun position based on time
    const angle = (time - 0.5) * Math.PI; // -PI/2 to PI/2
    const height = Math.cos(angle) * 500 + 100;
    const horizontal = Math.sin(angle) * 800;

    this.sun.position.set(horizontal, Math.max(50, height), 400);

    // Adjust colors based on time
    if (time < 0.2 || time > 0.8) {
      // Blue hour
      this.sun.color.set(0xa0c0f0);
      this.sun.intensity = 0.5 + (0.2 - Math.abs(time - (time < 0.5 ? 0 : 1))) * 5;
      this.hemisphere.color.set(0x405080);
    } else if (time < 0.35 || time > 0.65) {
      // Golden hour
      const golden = time < 0.5 ? (time - 0.2) / 0.15 : (0.8 - time) / 0.15;
      this.sun.color.set(new THREE.Color(0xffd090).lerp(new THREE.Color(0xffffff), golden));
      this.sun.intensity = 2.0 + golden * 2;
    } else {
      // Midday
      this.sun.color.set(0xffffff);
      this.sun.intensity = 4.0;
      this.hemisphere.color.set(0xa8c8f0);
    }
  }

  /**
   * Toggle shadow debug helper
   */
  toggleShadowHelper(show: boolean): void {
    if (show && !this.sunHelper) {
      this.sunHelper = new THREE.CameraHelper(this.sun.shadow.camera);
      this.scene.add(this.sunHelper);
    } else if (!show && this.sunHelper) {
      this.scene.remove(this.sunHelper);
      this.sunHelper = null;
    }
  }

  /**
   * Get configuration for shader uniforms
   */
  getShaderUniforms(): Record<string, THREE.IUniform> {
    return {
      sunDirection: { value: this.sun.position.clone().normalize() },
      sunColor: { value: this.sun.color.clone() },
      sunIntensity: { value: this.sun.intensity },
      ambientColor: { value: this.hemisphere.color.clone() },
      fogColor: { value: (this.scene.fog as THREE.Fog)?.color.clone() || new THREE.Color(0xd8eaf8) },
      fogNear: { value: (this.scene.fog as THREE.Fog)?.near || 150 },
      fogFar: { value: (this.scene.fog as THREE.Fog)?.far || 1000 },
    };
  }

  /**
   * Update shader uniforms each frame
   */
  updateShaderUniforms(uniforms: Record<string, THREE.IUniform>): void {
    if (uniforms.sunDirection) uniforms.sunDirection.value.copy(this.sun.position).normalize();
    if (uniforms.sunColor) uniforms.sunColor.value.copy(this.sun.color);
    if (uniforms.sunIntensity) uniforms.sunIntensity.value = this.sun.intensity;
  }

  /**
   * Dispose all light resources
   */
  dispose(): void {
    this.scene.remove(this.sun);
    this.scene.remove(this.sun.target);
    this.scene.remove(this.hemisphere);
    this.scene.remove(this.ambient);
    this.scene.remove(this.fillLight);

    if (this.sunHelper) {
      this.scene.remove(this.sunHelper);
    }

    this.sun.shadow.map?.dispose();
  }
}

// ==================== QUICK SETUP FUNCTIONS ====================

/**
 * Quick setup for alpine ski slope lighting
 */
export function setupAlpineLighting(scene: THREE.Scene): LightingSystem {
  return new LightingSystem(scene, DEFAULT_LIGHTING_CONFIG);
}

/**
 * Setup renderer for best shadow quality
 */
export function configureRendererForShadows(renderer: THREE.WebGLRenderer): void {
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // For even better quality (performance cost)
  // renderer.shadowMap.type = THREE.VSMShadowMap;

  // Tone mapping for HDR-like appearance
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  // Output encoding
  renderer.outputColorSpace = THREE.SRGBColorSpace;
}

export default LightingSystem;
