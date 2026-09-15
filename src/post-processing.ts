/**
 * POST-PROCESSING - Advanced Effects Pipeline
 * SSAO, Motion Blur, DOF, Color Grading
 */

import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { SSAOPass } from 'three/examples/jsm/postprocessing/SSAOPass.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';

// ==================== CUSTOM SHADERS ====================

/**
 * Motion blur shader for speed effect
 */
const MotionBlurShader = {
  uniforms: {
    tDiffuse: { value: null },
    velocity: { value: 0.0 },
    direction: { value: new THREE.Vector2(0, 1) },
    samples: { value: 16 },
  },

  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float velocity;
    uniform vec2 direction;
    uniform int samples;

    varying vec2 vUv;

    void main() {
      vec2 texCoord = vUv;
      vec4 color = texture2D(tDiffuse, texCoord);

      if (velocity > 0.01) {
        vec2 blurVector = direction * velocity * 0.01;

        for (int i = 1; i < 16; i++) {
          if (i >= samples) break;
          float t = float(i) / float(samples);
          color += texture2D(tDiffuse, texCoord + blurVector * t);
          color += texture2D(tDiffuse, texCoord - blurVector * t);
        }

        color /= float(samples * 2 - 1);
      }

      gl_FragColor = color;
    }
  `,
};

/**
 * Radial blur for speed lines effect
 */
const RadialBlurShader = {
  uniforms: {
    tDiffuse: { value: null },
    center: { value: new THREE.Vector2(0.5, 0.5) },
    strength: { value: 0.0 },
    samples: { value: 32 },
  },

  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec2 center;
    uniform float strength;
    uniform int samples;

    varying vec2 vUv;

    void main() {
      vec2 texCoord = vUv;
      vec2 dir = center - texCoord;
      float dist = length(dir);
      dir = normalize(dir);

      vec4 color = texture2D(tDiffuse, texCoord);

      if (strength > 0.001) {
        float blurAmount = strength * dist * 0.5;

        for (int i = 1; i < 32; i++) {
          if (i >= samples) break;
          float t = float(i) / float(samples);
          vec2 offset = dir * blurAmount * t;
          color += texture2D(tDiffuse, texCoord + offset);
        }

        color /= float(samples);
      }

      gl_FragColor = color;
    }
  `,
};

/**
 * Color grading shader for cinematic look
 */
const ColorGradingShader = {
  uniforms: {
    tDiffuse: { value: null },
    brightness: { value: 0.0 },
    contrast: { value: 1.0 },
    saturation: { value: 1.0 },
    temperature: { value: 0.0 }, // -1 = cool, +1 = warm
    vignette: { value: 0.3 },
    vignetteOffset: { value: 1.0 },
  },

  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float brightness;
    uniform float contrast;
    uniform float saturation;
    uniform float temperature;
    uniform float vignette;
    uniform float vignetteOffset;

    varying vec2 vUv;

    vec3 adjustSaturation(vec3 color, float sat) {
      float grey = dot(color, vec3(0.2126, 0.7152, 0.0722));
      return mix(vec3(grey), color, sat);
    }

    void main() {
      vec4 texel = texture2D(tDiffuse, vUv);
      vec3 color = texel.rgb;

      // Brightness
      color += brightness;

      // Contrast
      color = (color - 0.5) * contrast + 0.5;

      // Saturation
      color = adjustSaturation(color, saturation);

      // Temperature
      color.r += temperature * 0.1;
      color.b -= temperature * 0.1;

      // Vignette
      vec2 uv = vUv * (1.0 - vUv);
      float vig = uv.x * uv.y * 15.0;
      vig = pow(vig, vignette);
      vig = clamp(vig, 0.0, 1.0);
      color = mix(color * 0.3, color, vig * vignetteOffset);

      // Ensure valid range
      color = clamp(color, 0.0, 1.0);

      gl_FragColor = vec4(color, texel.a);
    }
  `,
};

/**
 * Film grain shader for cinematic feel
 */
const FilmGrainShader = {
  uniforms: {
    tDiffuse: { value: null },
    time: { value: 0.0 },
    intensity: { value: 0.05 },
  },

  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float time;
    uniform float intensity;

    varying vec2 vUv;

    float random(vec2 co) {
      return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      vec4 color = texture2D(tDiffuse, vUv);

      float grain = random(vUv + time) * intensity;
      color.rgb += grain - intensity * 0.5;

      gl_FragColor = color;
    }
  `,
};

// ==================== COMPOSER SETUP ====================

export interface ProPostProcessing {
  composer: EffectComposer;
  ssaoPass: SSAOPass;
  bloomPass: UnrealBloomPass;
  motionBlurPass: ShaderPass;
  radialBlurPass: ShaderPass;
  colorGradingPass: ShaderPass;
  filmGrainPass: ShaderPass;
  bokehPass: BokehPass;
}

/**
 * Create professional post-processing pipeline
 */
export function createProPostProcessing(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera
): ProPostProcessing {
  const width = window.innerWidth;
  const height = window.innerHeight;

  const composer = new EffectComposer(renderer);

  // 1. Render pass (base scene)
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  // 2. SSAO - Screen Space Ambient Occlusion (Enhanced for alpine)
  const ssaoPass = new SSAOPass(scene, camera, width, height);
  ssaoPass.kernelRadius = 24;  // Increased for more visible AO
  ssaoPass.minDistance = 0.003;
  ssaoPass.maxDistance = 0.15;
  ssaoPass.output = SSAOPass.OUTPUT.Default;
  composer.addPass(ssaoPass);

  // 3. Bloom - Glow effect (Reduced for color accuracy)
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(width, height),
    0.25,  // strength - réduit pour fidélité couleurs
    0.4,   // radius
    0.92   // threshold - plus élevé pour moins de bloom
  );
  composer.addPass(bloomPass);

  // 4. Motion blur
  const motionBlurPass = new ShaderPass(MotionBlurShader);
  motionBlurPass.enabled = true;
  composer.addPass(motionBlurPass);

  // 5. Radial blur (speed effect)
  const radialBlurPass = new ShaderPass(RadialBlurShader);
  radialBlurPass.enabled = true;
  composer.addPass(radialBlurPass);

  // 6. Color grading (Cold alpine atmosphere)
  const colorGradingPass = new ShaderPass(ColorGradingShader);
  colorGradingPass.uniforms.brightness.value = 0.02;    // Slight brightness boost
  colorGradingPass.uniforms.contrast.value = 1.15;      // More contrast for depth
  colorGradingPass.uniforms.saturation.value = 1.12;    // Slightly saturated
  colorGradingPass.uniforms.temperature.value = 0.0;  // Neutre pour fidélité couleurs
  colorGradingPass.uniforms.vignette.value = 0.28;      // Subtle vignette
  colorGradingPass.uniforms.vignetteOffset.value = 1.1; // Softer vignette edge
  composer.addPass(colorGradingPass);

  // 7. Film grain (subtle)
  const filmGrainPass = new ShaderPass(FilmGrainShader);
  filmGrainPass.uniforms.intensity.value = 0.03;
  composer.addPass(filmGrainPass);

  // 8. Depth of field (optional - can be heavy)
  const bokehPass = new BokehPass(scene, camera, {
    focus: 50,
    aperture: 0.00002,
    maxblur: 0.005,
  });
  bokehPass.enabled = false; // Disable by default, enable during replays
  composer.addPass(bokehPass);

  // 9. Anti-aliasing (SMAA in r152+ doesn't take constructor args)
  const smaaPass = new SMAAPass();
  composer.addPass(smaaPass);

  // 10. Output (tone mapping already in renderer)
  composer.addPass(new OutputPass());

  console.log('🎬 Created professional post-processing pipeline');

  return {
    composer,
    ssaoPass,
    bloomPass,
    motionBlurPass,
    radialBlurPass,
    colorGradingPass,
    filmGrainPass,
    bokehPass,
  };
}

/**
 * Update post-processing based on game state
 */
export function updatePostProcessing(
  postProcess: ProPostProcessing,
  speed: number,
  maxSpeed: number,
  deltaTime: number
): void {
  // Speed-based effects
  const speedRatio = speed / maxSpeed;

  // Motion blur increases with speed
  postProcess.motionBlurPass.uniforms.velocity.value = speedRatio * 0.3;

  // Radial blur (tunnel vision at high speed)
  const radialStrength = Math.max(0, (speedRatio - 0.6) * 0.4);
  postProcess.radialBlurPass.uniforms.strength.value = radialStrength;

  // Update film grain time
  postProcess.filmGrainPass.uniforms.time.value += deltaTime;

  // Slight increase in contrast at high speed
  postProcess.colorGradingPass.uniforms.contrast.value = 1.1 + speedRatio * 0.05;
}

/**
 * Resize post-processing
 */
export function resizePostProcessing(
  postProcess: ProPostProcessing,
  width: number,
  height: number
): void {
  postProcess.composer.setSize(width, height);
  postProcess.ssaoPass.setSize(width, height);
}

/**
 * Enable cinematic mode (for replays/finish)
 */
export function enableCinematicMode(postProcess: ProPostProcessing): void {
  postProcess.bokehPass.enabled = true;
  postProcess.colorGradingPass.uniforms.vignette.value = 0.4;
  postProcess.filmGrainPass.uniforms.intensity.value = 0.05;
}

/**
 * Disable cinematic mode (for gameplay)
 */
export function disableCinematicMode(postProcess: ProPostProcessing): void {
  postProcess.bokehPass.enabled = false;
  postProcess.colorGradingPass.uniforms.vignette.value = 0.25;
  postProcess.filmGrainPass.uniforms.intensity.value = 0.03;
}
