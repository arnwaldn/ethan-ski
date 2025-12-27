/**
 * ATMOSPHERE - Volumetric Clouds, God Rays, and Advanced Fog
 * Professional-grade atmospheric effects
 */

import * as THREE from 'three';

// ==================== VOLUMETRIC SKY SHADER ====================

/**
 * Advanced sky shader with raymarched clouds
 */
export const VolumetricSkyShader = {
  uniforms: {
    time: { value: 0 },

    // Sky colors - Enhanced alpine morning
    topColor: { value: new THREE.Color(0x1a75d0) },      // Deep alpine blue
    horizonColor: { value: new THREE.Color(0x90c8f0) },  // Light horizon
    bottomColor: { value: new THREE.Color(0xd8e8f8) },   // Misty bottom

    // Sun - Golden alpine sun
    sunDirection: { value: new THREE.Vector3(0.4, 0.7, 0.5).normalize() },
    sunColor: { value: new THREE.Color(0xfff0d0) },      // Warm golden
    sunIntensity: { value: 1.8 },                        // Brighter sun
    sunSize: { value: 0.035 },                           // Slightly smaller

    // Clouds - Soft alpine clouds
    cloudColor: { value: new THREE.Color(0xffffff) },
    cloudShadowColor: { value: new THREE.Color(0xa0b8d0) },  // Bluer shadow
    cloudCoverage: { value: 0.35 },                      // Less coverage for clear day
    cloudDensity: { value: 0.35 },                       // Softer clouds
    cloudSpeed: { value: 0.015 },                        // Slower movement
    cloudHeight: { value: 2500 },
    cloudThickness: { value: 600 },

    // Atmosphere - Crisp mountain air
    atmosphereScattering: { value: 0.35 },               // More scattering
  },

  vertexShader: `
    varying vec3 vWorldPosition;
    varying vec3 vDirection;

    void main() {
      vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
      vDirection = normalize(position);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform float time;

    uniform vec3 topColor;
    uniform vec3 horizonColor;
    uniform vec3 bottomColor;

    uniform vec3 sunDirection;
    uniform vec3 sunColor;
    uniform float sunIntensity;
    uniform float sunSize;

    uniform vec3 cloudColor;
    uniform vec3 cloudShadowColor;
    uniform float cloudCoverage;
    uniform float cloudDensity;
    uniform float cloudSpeed;
    uniform float cloudHeight;
    uniform float cloudThickness;

    uniform float atmosphereScattering;

    varying vec3 vWorldPosition;
    varying vec3 vDirection;

    // ===== Noise Functions =====
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

    float snoise(vec3 v) {
      const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

      vec3 i  = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);

      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);

      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;

      i = mod289(i);
      vec4 p = permute(permute(permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0))
              + i.x + vec4(0.0, i1.x, i2.x, 1.0));

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

      vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;

      vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
    }

    float fbm(vec3 p, int octaves) {
      float value = 0.0;
      float amplitude = 0.5;

      for (int i = 0; i < 5; i++) {
        if (i >= octaves) break;
        value += amplitude * snoise(p);
        p *= 2.0;
        amplitude *= 0.5;
      }

      return value;
    }

    // ===== Simple 2D Cloud Layer (GPU-friendly) =====
    float simpleCloudNoise(vec2 p) {
      // Simpler 2D noise for performance
      float noise = snoise(vec3(p.x, 0.0, p.y));
      noise += 0.5 * snoise(vec3(p.x * 2.0, 0.0, p.y * 2.0));
      noise += 0.25 * snoise(vec3(p.x * 4.0, 0.0, p.y * 4.0));
      return noise * 0.5 + 0.5;
    }

    float getCloudDensity(vec3 direction) {
      // Project direction onto cloud plane
      float t = cloudHeight / max(direction.y, 0.001);
      vec2 cloudUV = direction.xz * t * 0.0003;

      // Animate clouds
      cloudUV += vec2(time * cloudSpeed * 0.5, time * cloudSpeed * 0.3);

      float noise = simpleCloudNoise(cloudUV);
      float density = smoothstep(1.0 - cloudCoverage, 1.0 - cloudCoverage + 0.3, noise);

      return density * cloudDensity;
    }

    // ===== Main =====
    void main() {
      vec3 direction = normalize(vDirection);

      // ===== Sky Gradient =====
      float y = direction.y;
      vec3 skyColor;

      if (y > 0.0) {
        skyColor = mix(horizonColor, topColor, pow(y, 0.5));
      } else {
        skyColor = mix(horizonColor, bottomColor, pow(-y, 0.3));
      }

      // ===== Sun =====
      float sunDot = dot(direction, sunDirection);
      float sunDisc = smoothstep(1.0 - sunSize, 1.0, sunDot);
      vec3 sunGlow = sunColor * pow(max(0.0, sunDot), 8.0) * 0.3;
      vec3 sunHalo = sunColor * pow(max(0.0, sunDot), 64.0) * 0.5;

      skyColor += sunGlow + sunHalo;
      skyColor = mix(skyColor, sunColor * sunIntensity, sunDisc);

      // ===== Atmospheric Scattering =====
      float scatter = pow(max(0.0, sunDot), 2.0) * atmosphereScattering;
      vec3 scatterColor = mix(horizonColor, sunColor, 0.5);
      skyColor = mix(skyColor, scatterColor, scatter * (1.0 - y));

      // ===== Simple Clouds (performance optimized) =====
      if (direction.y > 0.05) {
        float cloudDens = getCloudDensity(direction);

        // Simple cloud shading
        float lightFactor = dot(direction, sunDirection) * 0.3 + 0.7;
        vec3 cloudCol = mix(cloudShadowColor, cloudColor, lightFactor);

        // Blend clouds
        skyColor = mix(skyColor, cloudCol, cloudDens * 0.7);
      }

      // ===== Horizon Haze =====
      float horizonHaze = 1.0 - abs(y);
      horizonHaze = pow(horizonHaze, 3.0);
      skyColor = mix(skyColor, horizonColor * 1.1, horizonHaze * 0.3);

      gl_FragColor = vec4(skyColor, 1.0);
    }
  `,
};

// ==================== GOD RAYS (VOLUMETRIC LIGHT SCATTERING) ====================

/**
 * God rays post-processing shader
 */
export const GodRaysShader = {
  uniforms: {
    tDiffuse: { value: null },
    lightPositionOnScreen: { value: new THREE.Vector2(0.5, 0.7) },
    exposure: { value: 0.3 },
    decay: { value: 0.96 },
    density: { value: 0.8 },
    weight: { value: 0.5 },
    samples: { value: 50 },
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
    uniform vec2 lightPositionOnScreen;
    uniform float exposure;
    uniform float decay;
    uniform float density;
    uniform float weight;
    uniform int samples;

    varying vec2 vUv;

    void main() {
      vec2 texCoord = vUv;
      vec2 deltaTexCoord = texCoord - lightPositionOnScreen;
      deltaTexCoord *= 1.0 / float(samples) * density;

      vec4 color = texture2D(tDiffuse, texCoord);
      float illuminationDecay = 1.0;

      for (int i = 0; i < 50; i++) {
        if (i >= samples) break;

        texCoord -= deltaTexCoord;
        vec4 sample = texture2D(tDiffuse, texCoord);

        sample *= illuminationDecay * weight;
        color += sample;
        illuminationDecay *= decay;
      }

      color *= exposure;

      gl_FragColor = color;
    }
  `,
};

// ==================== HEIGHT-BASED FOG ====================

/**
 * Advanced fog with height-based density
 */
export function setupAdvancedFog(scene: THREE.Scene): void {
  // Alpine atmospheric fog - slightly blue-tinted for cold mountain air
  scene.fog = new THREE.FogExp2(0xd0e4f8, 0.0012);  // Lighter and less dense

  console.log('🌫️ Setup alpine atmospheric fog');
}

/**
 * Height fog shader for terrain
 */
export const HeightFogShader = {
  uniforms: {
    fogColor: { value: new THREE.Color(0xd0e4f8) },  // Matching alpine fog
    fogDensity: { value: 0.0015 },                    // Softer density
    fogHeight: { value: 80 },                         // Higher base
    fogFalloff: { value: 0.008 },                     // Gentler falloff
    cameraPosition: { value: new THREE.Vector3() },
  },

  fogFragment: `
    // Height-based fog calculation
    float heightFog(vec3 worldPos, vec3 cameraPos) {
      float fogDist = length(worldPos - cameraPos);
      float heightFactor = exp(-max(0.0, worldPos.y - fogHeight) * fogFalloff);

      return 1.0 - exp(-fogDensity * fogDist * heightFactor);
    }
  `,
};

// ==================== SKY DOME FACTORY ====================

/**
 * Create volumetric sky dome
 */
export function createVolumetricSky(scene: THREE.Scene): THREE.Mesh {
  const geometry = new THREE.SphereGeometry(1500, 64, 32);

  const material = new THREE.ShaderMaterial({
    uniforms: { ...VolumetricSkyShader.uniforms },
    vertexShader: VolumetricSkyShader.vertexShader,
    fragmentShader: VolumetricSkyShader.fragmentShader,
    side: THREE.BackSide,
    depthWrite: false,
  });

  const sky = new THREE.Mesh(geometry, material);
  sky.frustumCulled = false;
  scene.add(sky);

  console.log('☁️ Created volumetric sky with raymarched clouds');

  return sky;
}

/**
 * Update sky shader uniforms
 */
export function updateVolumetricSky(sky: THREE.Mesh, time: number): void {
  const material = sky.material as THREE.ShaderMaterial;
  material.uniforms.time.value = time;
}

// ==================== SNOW WEATHER SYSTEM ====================

interface SnowParticleSystem {
  particles: THREE.Points;
  velocities: Float32Array;
}

/**
 * Create advanced snow particle system
 */
export function createSnowWeather(scene: THREE.Scene): SnowParticleSystem {
  const count = 10000;
  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const opacities = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 200;
    positions[i * 3 + 1] = Math.random() * 80;
    positions[i * 3 + 2] = Math.random() * -200;

    velocities[i * 3] = (Math.random() - 0.5) * 0.02;
    velocities[i * 3 + 1] = -0.1 - Math.random() * 0.15;
    velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;

    sizes[i] = 0.1 + Math.random() * 0.15;
    opacities[i] = 0.4 + Math.random() * 0.4;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));

  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      color: { value: new THREE.Color(0xffffff) },
    },
    vertexShader: `
      attribute float size;
      attribute float opacity;
      varying float vOpacity;

      void main() {
        vOpacity = opacity;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (200.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 color;
      varying float vOpacity;

      void main() {
        float r = length(gl_PointCoord - vec2(0.5));
        if (r > 0.5) discard;

        float alpha = vOpacity * (1.0 - r * 2.0);
        gl_FragColor = vec4(color, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  console.log('❄️ Created advanced snow weather system');

  return { particles, velocities };
}

/**
 * Update snow weather
 */
export function updateSnowWeather(
  system: SnowParticleSystem,
  skierPosition: THREE.Vector3,
  time: number
): void {
  const positions = system.particles.geometry.attributes.position.array as Float32Array;
  const velocities = system.velocities;

  for (let i = 0; i < positions.length / 3; i++) {
    const idx = i * 3;

    // Apply velocity
    positions[idx] += velocities[idx];
    positions[idx + 1] += velocities[idx + 1];
    positions[idx + 2] += velocities[idx + 2];

    // Add wind turbulence
    positions[idx] += Math.sin(time * 2 + i * 0.1) * 0.01;

    // Reset if below ground or too far
    if (positions[idx + 1] < -5) {
      positions[idx] = skierPosition.x + (Math.random() - 0.5) * 150;
      positions[idx + 1] = 70 + Math.random() * 20;
      positions[idx + 2] = skierPosition.z + (Math.random() - 0.5) * 100;
    }
  }

  system.particles.geometry.attributes.position.needsUpdate = true;

  // Update material time
  const material = system.particles.material as THREE.ShaderMaterial;
  material.uniforms.time.value = time;
}

// ==================== COMPLETE ATMOSPHERE SETUP ====================

export interface AtmosphereSystem {
  sky: THREE.Mesh;
  snow: SnowParticleSystem;
}

/**
 * Setup complete atmosphere system
 */
export function setupCompleteAtmosphere(scene: THREE.Scene): AtmosphereSystem {
  setupAdvancedFog(scene);
  const sky = createVolumetricSky(scene);
  const snow = createSnowWeather(scene);

  return { sky, snow };
}

/**
 * Update all atmosphere systems
 */
export function updateAtmosphere(
  atmosphere: AtmosphereSystem,
  skierPosition: THREE.Vector3,
  time: number
): void {
  updateVolumetricSky(atmosphere.sky, time);
  updateSnowWeather(atmosphere.snow, skierPosition, time);
}
