/**
 * TERRAIN SHADER - Advanced FBM Terrain with Splat Texturing
 * Professional-grade snow terrain with ski tracks
 */

import * as THREE from 'three';

// ==================== FBM NOISE FUNCTIONS ====================

/**
 * Advanced terrain shader with FBM noise and splat texturing
 */
export const AdvancedTerrainShader = {
  uniforms: {
    time: { value: 0 },

    // Colors - Enhanced alpine palette
    snowColor: { value: new THREE.Color(0xfcfcff) },
    snowShadowColor: { value: new THREE.Color(0x8eb0d8) },
    iceColor: { value: new THREE.Color(0xd0f0f8) },
    rockColor: { value: new THREE.Color(0x4a3f30) },
    trackColor: { value: new THREE.Color(0xe0f0ff) },

    // Lighting - Golden hour alpine sun
    sunDirection: { value: new THREE.Vector3(0.4, 0.7, 0.5).normalize() },
    sunColor: { value: new THREE.Color(0xfff8e8) },
    ambientColor: { value: new THREE.Color(0x7ab8e0) },

    // Fog
    fogColor: { value: new THREE.Color(0xc8e0f8) },
    fogNear: { value: 100 },
    fogFar: { value: 600 },

    // Terrain parameters
    courseWidth: { value: 60 },
    sparkleIntensity: { value: 0.8 },

    // Ski tracks (dynamic)
    trackTexture: { value: null },
    hasTrackTexture: { value: false },

    // Camera for fresnel
    cameraPosition: { value: new THREE.Vector3() },
  },

  vertexShader: `
    varying vec3 vPosition;
    varying vec3 vWorldPosition;
    varying vec3 vNormal;
    varying vec2 vUv;
    varying float vFogDepth;
    varying float vSlope;

    void main() {
      vPosition = position;
      vNormal = normalize(normalMatrix * normal);
      vUv = uv;

      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;

      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vFogDepth = -mvPosition.z;

      // Calculate slope angle
      vSlope = 1.0 - abs(dot(vNormal, vec3(0.0, 1.0, 0.0)));

      gl_Position = projectionMatrix * mvPosition;
    }
  `,

  fragmentShader: `
    uniform float time;

    uniform vec3 snowColor;
    uniform vec3 snowShadowColor;
    uniform vec3 iceColor;
    uniform vec3 rockColor;
    uniform vec3 trackColor;

    uniform vec3 sunDirection;
    uniform vec3 sunColor;
    uniform vec3 ambientColor;

    uniform vec3 fogColor;
    uniform float fogNear;
    uniform float fogFar;

    uniform float courseWidth;
    uniform float sparkleIntensity;

    uniform sampler2D trackTexture;
    uniform bool hasTrackTexture;

    uniform vec3 cameraPosition;

    // Enhanced SSS parameters
    const float SSS_DISTORTION = 0.2;
    const float SSS_POWER = 2.0;
    const float SSS_SCALE = 0.4;
    const float SSS_AMBIENT = 0.1;

    varying vec3 vPosition;
    varying vec3 vWorldPosition;
    varying vec3 vNormal;
    varying vec2 vUv;
    varying float vFogDepth;
    varying float vSlope;

    // ===== FBM Noise =====
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
      float frequency = 1.0;

      // Reduced to 3 iterations max for GPU compatibility
      for (int i = 0; i < 3; i++) {
        if (i >= octaves) break;
        value += amplitude * snoise(p * frequency);
        frequency *= 2.0;
        amplitude *= 0.5;
      }

      return value;
    }

    // ===== Main Shader =====
    void main() {
      vec3 worldPos = vWorldPosition;
      vec3 normal = normalize(vNormal);

      // ===== Snow Surface Detail =====
      float snowNoise = fbm(worldPos * 0.1, 4) * 0.5 + 0.5;
      float microNoise = fbm(worldPos * 0.5, 2) * 0.5 + 0.5;

      // ===== Course Detection =====
      float distFromCenter = abs(worldPos.x);
      float onCourse = smoothstep(courseWidth * 0.6, courseWidth * 0.4, distFromCenter);

      // ===== Splat Texturing =====
      // Snow on flat areas, rock on steep slopes, ice in groomed areas
      float rockFactor = smoothstep(0.3, 0.6, vSlope);
      float iceFactor = onCourse * (1.0 - snowNoise * 0.3);

      // ===== Base Color =====
      vec3 baseSnow = mix(snowColor, snowShadowColor, snowNoise * 0.3);
      vec3 baseColor = baseSnow;

      // Mix in rock on steep slopes
      baseColor = mix(baseColor, rockColor, rockFactor * 0.8);

      // Mix in ice on course
      vec3 iceBlend = mix(baseColor, iceColor, iceFactor * 0.15);
      baseColor = iceBlend;

      // ===== Ski Track Grooves =====
      // Simulated parallel grooves on course
      float trackPattern = sin(worldPos.x * 2.0) * 0.5 + 0.5;
      trackPattern *= onCourse;
      baseColor = mix(baseColor, trackColor, trackPattern * 0.1);

      // ===== View Direction =====
      vec3 viewDir = normalize(cameraPosition - worldPos);
      vec3 halfDir = normalize(sunDirection + viewDir);
      float NdotH = max(0.0, dot(normal, halfDir));
      float NdotV = max(0.0, dot(normal, viewDir));

      // ===== Enhanced Lighting =====
      // Diffuse with wrap lighting for softer shadows
      float NdotL = dot(normal, sunDirection);
      float wrapDiffuse = max(0.0, (NdotL + 0.5) / 1.5);
      vec3 diffuse = sunColor * wrapDiffuse;

      // ===== Advanced Subsurface Scattering =====
      // Translucency - light passing through snow
      vec3 scatterDir = normalize(sunDirection + normal * SSS_DISTORTION);
      float VdotS = pow(clamp(dot(viewDir, -scatterDir), 0.0, 1.0), SSS_POWER) * SSS_SCALE;

      // Back-lighting SSS (light from behind)
      float backSSS = pow(max(0.0, dot(-viewDir, sunDirection)), 3.0) * 0.15;

      // Forward SSS (light scattering toward viewer)
      float forwardSSS = pow(max(0.0, dot(viewDir, sunDirection) * 0.5 + 0.5), 2.0) * 0.1;

      // Combine SSS
      vec3 sssColor = snowShadowColor * 1.2;
      vec3 subsurface = sssColor * (VdotS + backSSS + forwardSSS + SSS_AMBIENT);
      subsurface *= (1.0 - rockFactor); // No SSS on rock

      // Ambient with hemisphere lighting
      float hemiBlend = normal.y * 0.5 + 0.5;
      vec3 ambient = mix(snowShadowColor * 0.3, ambientColor * 0.5, hemiBlend);

      // ===== Enhanced Specular / Sparkles =====
      // Broad specular for ice/packed snow
      float spec = pow(NdotH, 128.0) * iceFactor * 0.5;
      spec += pow(NdotH, 32.0) * 0.2; // Softer highlight layer

      // Multi-frequency sparkle effect for crystalline snow
      float sparkleNoise1 = snoise(worldPos * 50.0 + time * 0.3);
      float sparkleNoise2 = snoise(worldPos * 100.0 - time * 0.2);
      float sparkleNoise3 = snoise(worldPos * 200.0 + time * 0.1);

      // Combine sparkle frequencies
      float sparkleBase = sparkleNoise1 * 0.5 + sparkleNoise2 * 0.3 + sparkleNoise3 * 0.2;

      // View-angle dependent sparkles (more visible at grazing angles)
      float viewSparkle = pow(1.0 - NdotV, 2.0) * 0.3 + 0.7;

      // Final sparkle calculation
      float sparkle = pow(max(0.0, sparkleBase * NdotH), 16.0) * sparkleIntensity * viewSparkle;
      sparkle *= (1.0 - rockFactor);
      sparkle *= wrapDiffuse; // Only sparkle in lit areas

      // ===== Enhanced Fresnel / Rim Lighting =====
      float fresnel = pow(1.0 - NdotV, 4.0);
      // Blue-tinted rim for cold alpine feel
      vec3 fresnelColor = mix(vec3(0.7, 0.85, 1.0), snowShadowColor, 0.5) * fresnel * 0.4;

      // ===== Combine =====
      vec3 color = baseColor * (ambient + diffuse + subsurface);
      color += vec3(spec * 0.3);
      color += vec3(sparkle) * sunColor;
      color += fresnelColor;

      // ===== Fog =====
      float fogFactor = smoothstep(fogNear, fogFar, vFogDepth);
      color = mix(color, fogColor, fogFactor);

      // ===== Output =====
      gl_FragColor = vec4(color, 1.0);
    }
  `,
};

// ==================== SKI TRACKS SYSTEM ====================

/**
 * Create render target for dynamic ski tracks
 */
export function createTrackRenderTarget(size: number = 2048): THREE.WebGLRenderTarget {
  return new THREE.WebGLRenderTarget(size, size, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
    type: THREE.FloatType,
  });
}

/**
 * Shader for drawing ski tracks
 */
export const TrackDrawShader = {
  uniforms: {
    previousFrame: { value: null },
    skierPosition: { value: new THREE.Vector2(0.5, 0.5) },
    skierVelocity: { value: 0.0 },
    trackWidth: { value: 0.005 },
    fadeSpeed: { value: 0.001 },
    courseLength: { value: 8000 },
    courseWidth: { value: 60 },
  },

  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform sampler2D previousFrame;
    uniform vec2 skierPosition;
    uniform float skierVelocity;
    uniform float trackWidth;
    uniform float fadeSpeed;
    uniform float courseLength;
    uniform float courseWidth;

    varying vec2 vUv;

    void main() {
      // Read previous frame
      vec4 prevColor = texture2D(previousFrame, vUv);

      // Fade existing tracks
      prevColor.a = max(0.0, prevColor.a - fadeSpeed);

      // Convert UV to world space
      vec2 worldPos = vec2(
        (vUv.x - 0.5) * courseWidth,
        vUv.y * courseLength
      );

      // Distance to skier
      float dist = length(worldPos - skierPosition);

      // Draw new track
      float newTrack = smoothstep(trackWidth, trackWidth * 0.5, dist);
      newTrack *= skierVelocity;

      // Combine
      float track = max(prevColor.a, newTrack);

      gl_FragColor = vec4(0.8, 0.85, 0.9, track);
    }
  `,
};

// ==================== TERRAIN GEOMETRY GENERATOR ====================

/**
 * Generate terrain geometry with FBM displacement
 */
export function generateFBMTerrain(
  width: number,
  length: number,
  segmentsX: number,
  segmentsZ: number,
  slopeAngle: number,
  courseWidth: number
): THREE.PlaneGeometry {
  const geometry = new THREE.PlaneGeometry(width, length, segmentsX, segmentsZ);
  const positions = geometry.attributes.position;

  // Simple noise function for geometry
  const noise = (x: number, z: number, scale: number): number => {
    return Math.sin(x * scale * 12.9898 + z * scale * 78.233) * 0.5 + 0.5;
  };

  const fbm = (x: number, z: number, octaves: number): number => {
    let value = 0;
    let amplitude = 1;
    let frequency = 0.02;

    for (let i = 0; i < octaves; i++) {
      value += amplitude * noise(x, z, frequency);
      frequency *= 2;
      amplitude *= 0.5;
    }

    return value;
  };

  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const z = positions.getZ(i);

    // Main slope
    const slopeY = z * Math.tan(THREE.MathUtils.degToRad(slopeAngle)) * 0.5;

    // FBM noise for terrain variation
    const terrainNoise = fbm(x, z, 5) * 8;

    // Course corridor (groomed, smoother)
    const distFromCenter = Math.abs(x);
    const onCourse = Math.max(0, 1 - distFromCenter / (courseWidth * 0.5));
    const courseSmoothing = onCourse * 0.7;

    // Side mountains
    const mountainHeight = distFromCenter > courseWidth
      ? Math.pow((distFromCenter - courseWidth) * 0.015, 2.5)
      : 0;

    // Combine
    const y = slopeY + terrainNoise * (1 - courseSmoothing) + mountainHeight;

    positions.setY(i, y);
  }

  geometry.computeVertexNormals();

  return geometry;
}

// ==================== TERRAIN MATERIAL FACTORY ====================

/**
 * Create advanced terrain material
 */
export function createAdvancedTerrainMaterial(
  courseWidth: number = 60
): THREE.ShaderMaterial {
  const material = new THREE.ShaderMaterial({
    uniforms: { ...AdvancedTerrainShader.uniforms },
    vertexShader: AdvancedTerrainShader.vertexShader,
    fragmentShader: AdvancedTerrainShader.fragmentShader,
    side: THREE.FrontSide,
  });

  material.uniforms.courseWidth.value = courseWidth;

  return material;
}

/**
 * Update terrain shader uniforms
 */
export function updateTerrainShader(
  material: THREE.ShaderMaterial,
  time: number,
  cameraPosition: THREE.Vector3
): void {
  material.uniforms.time.value = time;
  material.uniforms.cameraPosition.value.copy(cameraPosition);
}
