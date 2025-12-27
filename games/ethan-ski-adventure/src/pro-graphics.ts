import * as THREE from 'three';

// ==================== SKI CHALLENGE STYLE GRAPHICS ====================
// Professional alpine visuals matching mobile game quality

// Color palette - Ski Challenge style
const COLORS = {
  // Sky gradient
  SKY_TOP: new THREE.Color(0x1a5fb4),      // Deep blue
  SKY_MID: new THREE.Color(0x4a9eda),      // Azure
  SKY_HORIZON: new THREE.Color(0x8ecae6),  // Light blue

  // Mountains
  MOUNTAIN_FAR: new THREE.Color(0x7ba3c9),    // Distant blue
  MOUNTAIN_MID: new THREE.Color(0x9eb8d1),    // Mid range
  MOUNTAIN_NEAR: new THREE.Color(0xc5d5e4),   // Closer
  MOUNTAIN_SNOW: new THREE.Color(0xffffff),   // Snow caps

  // Forest
  TREE_DARK: new THREE.Color(0x1a4d2e),    // Dark pine
  TREE_MID: new THREE.Color(0x2d6a4f),     // Mid pine
  TREE_LIGHT: new THREE.Color(0x40916c),   // Light pine
  TREE_SNOW: new THREE.Color(0xe8f4f8),    // Snow on trees

  // Snow/Piste
  SNOW_BRIGHT: new THREE.Color(0xffffff),
  SNOW_SHADOW: new THREE.Color(0xb8d4e8),  // Blue shadows
  SNOW_TRACK: new THREE.Color(0x7eb8db),   // Ski track blue

  // Course elements
  NET_ORANGE: new THREE.Color(0xff6b35),
  MARKER_BLUE: new THREE.Color(0x0077b6),
  GATE_RED: new THREE.Color(0xe63946),
  GATE_BLUE: new THREE.Color(0x1d3557),

  // Valley/Town
  VALLEY_GREEN: new THREE.Color(0x6b9080),
  BUILDING_WARM: new THREE.Color(0xd4a373),
  BUILDING_WHITE: new THREE.Color(0xfaf9f6),
};

let cloudTexture: THREE.Texture;

// ==================== VOLUMETRIC SKY ====================
export function createProSky(scene: THREE.Scene): THREE.Mesh {
  const skyGeo = new THREE.SphereGeometry(2000, 64, 64);

  const skyMat = new THREE.ShaderMaterial({
    uniforms: {
      topColor: { value: COLORS.SKY_TOP },
      midColor: { value: COLORS.SKY_MID },
      horizonColor: { value: COLORS.SKY_HORIZON },
      sunPosition: { value: new THREE.Vector3(0.4, 0.5, -0.5).normalize() },
      time: { value: 0 },
    },
    vertexShader: `
      varying vec3 vWorldPosition;
      varying vec3 vPosition;

      void main() {
        vPosition = position;
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPos.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 midColor;
      uniform vec3 horizonColor;
      uniform vec3 sunPosition;
      uniform float time;

      varying vec3 vWorldPosition;
      varying vec3 vPosition;

      // Noise functions for clouds
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
          mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
          f.y
        );
      }

      float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        for (int i = 0; i < 6; i++) {
          value += amplitude * noise(p);
          p *= 2.0;
          amplitude *= 0.5;
        }
        return value;
      }

      void main() {
        vec3 dir = normalize(vPosition);
        float y = dir.y;

        // Sky gradient - 3 zones
        vec3 skyColor;
        if (y > 0.4) {
          skyColor = mix(midColor, topColor, smoothstep(0.4, 0.9, y));
        } else if (y > 0.0) {
          skyColor = mix(horizonColor, midColor, smoothstep(0.0, 0.4, y));
        } else {
          skyColor = horizonColor * 0.9;
        }

        // Sun glow
        float sunDot = max(dot(dir, sunPosition), 0.0);
        vec3 sunGlow = vec3(1.0, 0.95, 0.85) * pow(sunDot, 8.0) * 0.5;
        vec3 sunCore = vec3(1.0, 1.0, 0.95) * pow(sunDot, 64.0) * 1.5;
        skyColor += sunGlow + sunCore;

        // Volumetric clouds - only above horizon
        if (y > 0.05) {
          vec2 cloudUV = dir.xz / (y + 0.2) * 1.5;
          cloudUV += time * 0.005;

          float cloud = fbm(cloudUV * 0.8);
          cloud = smoothstep(0.35, 0.65, cloud);

          // Cloud shadows and highlights
          float cloudLight = fbm(cloudUV * 0.8 + vec2(0.1, 0.05));
          vec3 cloudColor = mix(vec3(0.85, 0.88, 0.92), vec3(1.0), cloudLight);

          // Fade clouds near horizon
          float cloudFade = smoothstep(0.05, 0.25, y);
          cloud *= cloudFade * 0.7;

          skyColor = mix(skyColor, cloudColor, cloud);
        }

        // Atmospheric haze at horizon
        float haze = 1.0 - smoothstep(0.0, 0.15, y);
        skyColor = mix(skyColor, horizonColor * 1.1, haze * 0.4);

        gl_FragColor = vec4(skyColor, 1.0);
      }
    `,
    side: THREE.BackSide,
  });

  const sky = new THREE.Mesh(skyGeo, skyMat);
  scene.add(sky);

  return sky;
}

// ==================== DETAILED MOUNTAINS ====================
export function createProMountains(scene: THREE.Scene, courseLength: number): THREE.Group {
  const mountains = new THREE.Group();

  // Background mountain range (far)
  createMountainRange(mountains, {
    distance: 1200,
    count: 8,
    minHeight: 300,
    maxHeight: 600,
    color: COLORS.MOUNTAIN_FAR,
    snowLine: 0.4,
  });

  // Mid-range mountains
  createMountainRange(mountains, {
    distance: 800,
    count: 12,
    minHeight: 200,
    maxHeight: 450,
    color: COLORS.MOUNTAIN_MID,
    snowLine: 0.5,
  });

  // Near mountains (left and right)
  createMountainRange(mountains, {
    distance: 400,
    count: 6,
    minHeight: 150,
    maxHeight: 300,
    color: COLORS.MOUNTAIN_NEAR,
    snowLine: 0.6,
    sides: true,
  });

  scene.add(mountains);
  return mountains;
}

interface MountainConfig {
  distance: number;
  count: number;
  minHeight: number;
  maxHeight: number;
  color: THREE.Color;
  snowLine: number;
  sides?: boolean;
}

function createMountainRange(group: THREE.Group, config: MountainConfig) {
  const { distance, count, minHeight, maxHeight, color, snowLine, sides } = config;

  for (let i = 0; i < count; i++) {
    const height = minHeight + Math.random() * (maxHeight - minHeight);
    const width = height * (1.5 + Math.random() * 1.0);

    // Create mountain shape
    const shape = new THREE.Shape();
    const segments = 12;

    // Generate jagged peak profile
    const points: {x: number, y: number}[] = [];
    for (let j = 0; j <= segments; j++) {
      const t = j / segments;
      const x = (t - 0.5) * width;
      let y = 0;

      if (t < 0.5) {
        y = t * 2 * height;
      } else {
        y = (1 - t) * 2 * height;
      }

      // Add jagged variations
      if (j > 0 && j < segments) {
        y *= 0.85 + Math.random() * 0.3;
        y += Math.random() * height * 0.1;
      }

      points.push({ x, y });
    }

    shape.moveTo(points[0].x, points[0].y);
    for (let j = 1; j < points.length; j++) {
      shape.lineTo(points[j].x, points[j].y);
    }
    shape.lineTo(points[0].x, points[0].y);

    const geo = new THREE.ShapeGeometry(shape);

    // Create gradient material (rock to snow)
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        baseColor: { value: color },
        snowColor: { value: COLORS.MOUNTAIN_SNOW },
        snowLine: { value: snowLine },
        height: { value: height },
      },
      vertexShader: `
        varying vec2 vUv;
        varying float vY;
        void main() {
          vUv = uv;
          vY = position.y;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 baseColor;
        uniform vec3 snowColor;
        uniform float snowLine;
        uniform float height;
        varying float vY;

        void main() {
          float t = vY / height;
          float snow = smoothstep(snowLine - 0.1, snowLine + 0.1, t);
          vec3 color = mix(baseColor, snowColor, snow);

          // Add slight variation
          color *= 0.95 + 0.1 * fract(sin(vY * 0.1) * 43758.5453);

          gl_FragColor = vec4(color, 1.0);
        }
      `,
      side: THREE.DoubleSide,
    });

    const mountain = new THREE.Mesh(geo, mat);

    // Position
    if (sides) {
      // Mountains on sides
      const side = i % 2 === 0 ? -1 : 1;
      mountain.position.set(
        side * (distance + Math.random() * 200),
        -50,
        -Math.random() * 2000
      );
    } else {
      // Background mountains
      const angle = (i / count) * Math.PI - Math.PI / 2;
      mountain.position.set(
        Math.sin(angle) * distance,
        -50,
        -500 + Math.cos(angle) * distance * 0.5 - Math.random() * 500
      );
    }

    group.add(mountain);
  }
}

// ==================== VALLEY WITH TOWN ====================
export function createValley(scene: THREE.Scene): THREE.Group {
  const valley = new THREE.Group();

  // Valley floor (green meadows)
  const valleyGeo = new THREE.PlaneGeometry(3000, 2000, 50, 50);

  // Add some terrain variation
  const positions = valleyGeo.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = Math.sin(x * 0.01) * 10 + Math.cos(y * 0.01) * 10 + Math.random() * 5;
    positions.setZ(i, z);
  }
  valleyGeo.computeVertexNormals();

  const valleyMat = new THREE.MeshLambertMaterial({
    color: COLORS.VALLEY_GREEN,
  });

  const valleyMesh = new THREE.Mesh(valleyGeo, valleyMat);
  valleyMesh.rotation.x = -Math.PI / 2;
  valleyMesh.position.set(0, -200, -1500);
  valley.add(valleyMesh);

  // Town buildings
  const buildingCount = 40;
  for (let i = 0; i < buildingCount; i++) {
    const width = 15 + Math.random() * 20;
    const height = 20 + Math.random() * 30;
    const depth = 15 + Math.random() * 20;

    const buildingGeo = new THREE.BoxGeometry(width, height, depth);
    const buildingMat = new THREE.MeshLambertMaterial({
      color: Math.random() > 0.5 ? COLORS.BUILDING_WARM : COLORS.BUILDING_WHITE,
    });

    const building = new THREE.Mesh(buildingGeo, buildingMat);
    building.position.set(
      (Math.random() - 0.5) * 800,
      -180 + height / 2,
      -1200 - Math.random() * 600
    );
    building.rotation.y = Math.random() * Math.PI * 2;

    valley.add(building);

    // Roof
    const roofGeo = new THREE.ConeGeometry(width * 0.7, height * 0.3, 4);
    const roofMat = new THREE.MeshLambertMaterial({
      color: Math.random() > 0.5 ? 0x8b4513 : 0x654321,
    });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.copy(building.position);
    roof.position.y += height / 2 + height * 0.15;
    roof.rotation.y = Math.PI / 4;
    valley.add(roof);
  }

  scene.add(valley);
  return valley;
}

// ==================== DENSE PINE FOREST ====================
export function createPineForest(scene: THREE.Scene, courseLength: number, courseWidth: number): THREE.Group {
  const forest = new THREE.Group();

  // Create instanced trees for performance
  const treeCount = 1500;

  // Tree geometry - stylized pine shape
  const trunkGeo = new THREE.CylinderGeometry(0.3, 0.5, 3, 6);
  const trunkMat = new THREE.MeshLambertMaterial({ color: 0x4a3728 });

  // Create multiple tree variations
  const treeVariations = [
    createPineTree(8, 3, COLORS.TREE_DARK),
    createPineTree(10, 4, COLORS.TREE_MID),
    createPineTree(6, 2.5, COLORS.TREE_LIGHT),
    createPineTree(12, 4, COLORS.TREE_DARK),
  ];

  for (let i = 0; i < treeCount; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const distFromCenter = courseWidth / 2 + 8 + Math.random() * 300;

    const x = side * distFromCenter;
    const z = -Math.random() * (courseLength + 500);
    const y = z * Math.tan(THREE.MathUtils.degToRad(22)) * 0.5;

    // Pick random tree variation
    const treeGeo = treeVariations[Math.floor(Math.random() * treeVariations.length)];
    const scale = 0.7 + Math.random() * 0.6;

    // Trunk
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.set(x, y + 1.5 * scale, z);
    trunk.scale.setScalar(scale);
    forest.add(trunk);

    // Foliage
    const foliageMat = new THREE.MeshLambertMaterial({
      color: treeGeo.userData.color,
    });
    const foliage = new THREE.Mesh(treeGeo, foliageMat);
    foliage.position.set(x, y + 3 * scale, z);
    foliage.scale.setScalar(scale);
    foliage.rotation.y = Math.random() * Math.PI * 2;
    forest.add(foliage);

    // Snow on tree
    if (Math.random() > 0.3) {
      const snowMat = new THREE.MeshLambertMaterial({ color: COLORS.TREE_SNOW });
      const snowGeo = treeGeo.clone();
      const snow = new THREE.Mesh(snowGeo, snowMat);
      snow.position.copy(foliage.position);
      snow.position.y += 0.5 * scale;
      snow.scale.setScalar(scale * 0.6);
      snow.rotation.y = foliage.rotation.y;
      forest.add(snow);
    }
  }

  scene.add(forest);
  return forest;
}

function createPineTree(height: number, width: number, color: THREE.Color): THREE.ConeGeometry {
  const geo = new THREE.ConeGeometry(width, height, 8);
  geo.userData = { color };
  return geo;
}

// ==================== SAFETY NETS ====================
export function createSafetyNets(scene: THREE.Scene, courseLength: number, courseWidth: number): THREE.Group {
  const nets = new THREE.Group();

  // Orange safety net material
  const netMat = new THREE.MeshLambertMaterial({
    color: COLORS.NET_ORANGE,
    side: THREE.DoubleSide,
  });

  const poleMat = new THREE.MeshLambertMaterial({ color: 0x333333 });

  // Create nets along both sides
  const netSpacing = 30;
  const netHeight = 1.8;
  const netWidth = netSpacing - 2;

  for (let z = 50; z < courseLength - 100; z += netSpacing) {
    const slopeY = z * Math.tan(THREE.MathUtils.degToRad(22)) * 0.5;

    [-1, 1].forEach(side => {
      const x = side * (courseWidth / 2 + 2);

      // Net panel
      const netGeo = new THREE.PlaneGeometry(netWidth, netHeight, 10, 4);

      // Add slight wave to net
      const positions = netGeo.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        const px = positions.getX(i);
        const py = positions.getY(i);
        positions.setZ(i, Math.sin(px * 0.5 + py) * 0.1);
      }

      const net = new THREE.Mesh(netGeo, netMat);
      net.position.set(x, netHeight / 2 - slopeY, -z);
      net.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
      nets.add(net);

      // Support poles
      const poleGeo = new THREE.CylinderGeometry(0.05, 0.05, netHeight + 0.5, 6);

      const pole1 = new THREE.Mesh(poleGeo, poleMat);
      pole1.position.set(x, (netHeight + 0.5) / 2 - slopeY, -z + netWidth / 2);
      nets.add(pole1);

      const pole2 = new THREE.Mesh(poleGeo, poleMat);
      pole2.position.set(x, (netHeight + 0.5) / 2 - slopeY, -z - netWidth / 2);
      nets.add(pole2);
    });
  }

  scene.add(nets);
  return nets;
}

// ==================== COURSE MARKERS ====================
export function createCourseMarkers(scene: THREE.Scene, courseLength: number, courseWidth: number): THREE.Group {
  const markers = new THREE.Group();

  const markerMat = new THREE.MeshLambertMaterial({ color: COLORS.MARKER_BLUE });
  const markerGeo = new THREE.CylinderGeometry(0.08, 0.1, 2.5, 8);

  // Blue course markers
  for (let z = 20; z < courseLength; z += 25) {
    const slopeY = z * Math.tan(THREE.MathUtils.degToRad(22)) * 0.5;

    [-1, 1].forEach(side => {
      const marker = new THREE.Mesh(markerGeo, markerMat);
      marker.position.set(
        side * (courseWidth / 2 - 1),
        1.25 - slopeY,
        -z
      );
      markers.add(marker);
    });
  }

  scene.add(markers);
  return markers;
}

// ==================== ENHANCED SNOW SHADER ====================
export const ProSnowShader = {
  uniforms: {
    sunDirection: { value: new THREE.Vector3(0.4, 0.6, 0.3).normalize() },
    time: { value: 0 },
    trackIntensity: { value: 0.6 },
  },
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vWorldPos;
    varying vec2 vUv;
    varying vec3 vViewDir;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPos = worldPos.xyz;
      vViewDir = normalize(cameraPosition - worldPos.xyz);
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `,
  fragmentShader: `
    uniform vec3 sunDirection;
    uniform float time;
    uniform float trackIntensity;

    varying vec3 vNormal;
    varying vec3 vWorldPos;
    varying vec2 vUv;
    varying vec3 vViewDir;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
        mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
        f.y
      );
    }

    void main() {
      // Base snow color - bright white
      vec3 snowWhite = vec3(1.0, 1.0, 1.0);
      vec3 snowShadow = vec3(0.7, 0.82, 0.92); // Blue shadow
      vec3 trackBlue = vec3(0.5, 0.7, 0.85);   // Ski track blue

      // Lighting
      float NdotL = max(dot(vNormal, sunDirection), 0.0);
      float shadow = smoothstep(0.0, 0.5, NdotL);

      vec3 color = mix(snowShadow, snowWhite, shadow);

      // Ski tracks - multiple parallel grooves
      float pisteWidth = 30.0;
      float onPiste = smoothstep(pisteWidth, pisteWidth - 5.0, abs(vWorldPos.x));

      // Main track grooves
      float trackPattern = 0.0;
      for (float i = -3.0; i <= 3.0; i += 1.0) {
        float trackX = vWorldPos.x - i * 2.0;
        float groove = exp(-trackX * trackX * 2.0);
        trackPattern += groove;
      }
      trackPattern = clamp(trackPattern * 0.3, 0.0, 1.0);

      // Apply track coloring
      color = mix(color, trackBlue, trackPattern * onPiste * trackIntensity * (1.0 - shadow * 0.5));

      // Fine snow texture
      float snowNoise = noise(vWorldPos.xz * 2.0) * 0.04;
      color += snowNoise;

      // Sparkles
      float sparkle = noise(vWorldPos.xz * 100.0 + time * 0.5);
      sparkle = pow(sparkle, 30.0) * shadow * 0.6;
      color += vec3(sparkle);

      // Fresnel rim
      float fresnel = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 4.0);
      color += vec3(0.9, 0.95, 1.0) * fresnel * 0.1;

      // Subsurface scattering simulation
      float subsurface = pow(max(dot(vViewDir, -sunDirection), 0.0), 4.0) * 0.15;
      color += vec3(0.9, 0.95, 1.0) * subsurface;

      gl_FragColor = vec4(color, 1.0);
    }
  `,
};

// ==================== ATMOSPHERIC FOG ====================
export function setupAtmosphere(scene: THREE.Scene) {
  // Exponential fog for depth
  scene.fog = new THREE.FogExp2(0xc5dff0, 0.0008);
}

// ==================== UPDATE FUNCTION ====================
export function updateProGraphics(sky: THREE.Mesh, deltaTime: number) {
  if (sky.material instanceof THREE.ShaderMaterial) {
    sky.material.uniforms.time.value += deltaTime;
  }
}
