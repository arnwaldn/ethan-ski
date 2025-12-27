import * as THREE from 'three';

// ==================== ENVIRONMENT CONFIGURATION ====================
export const ENV_CONFIG = {
  // Forest settings
  TREE_COUNT: 800,
  TREE_VARIETY: 5,
  FOREST_START_X: 35, // Distance from center where forest starts
  FOREST_DENSITY_NEAR: 0.8,
  FOREST_DENSITY_FAR: 0.4,

  // Chalets
  CHALET_COUNT: 12,

  // Ski lift
  LIFT_PYLON_COUNT: 25,
  LIFT_PYLON_SPACING: 80,
  LIFT_CHAIR_COUNT: 40,

  // Rocks
  ROCK_CLUSTER_COUNT: 35,

  // Spectators
  SPECTATOR_GROUPS: 8,
  SPECTATORS_PER_GROUP: 15,

  // Finish area
  FINISH_DISTANCE: 7900,
};

// ==================== MATERIAL DEFINITIONS ====================
const materials = {
  // Tree materials
  treeTrunk: new THREE.MeshStandardMaterial({
    color: 0x4a3728,
    roughness: 0.9,
  }),
  treeTrunkSnowy: new THREE.MeshStandardMaterial({
    color: 0x5c4a3d,
    roughness: 0.85,
  }),
  treeNeedles: new THREE.MeshStandardMaterial({
    color: 0x1a472a,
    roughness: 0.8,
  }),
  treeNeedlesDark: new THREE.MeshStandardMaterial({
    color: 0x0d2818,
    roughness: 0.85,
  }),
  treeNeedlesLight: new THREE.MeshStandardMaterial({
    color: 0x2d5a3f,
    roughness: 0.75,
  }),
  treeSnow: new THREE.MeshStandardMaterial({
    color: 0xf5f8ff,
    roughness: 0.6,
  }),

  // Chalet materials
  chaletWood: new THREE.MeshStandardMaterial({
    color: 0x8b6914,
    roughness: 0.8,
  }),
  chaletWoodDark: new THREE.MeshStandardMaterial({
    color: 0x5c4a1a,
    roughness: 0.85,
  }),
  chaletRoof: new THREE.MeshStandardMaterial({
    color: 0x3d2817,
    roughness: 0.7,
  }),
  chaletRoofSnow: new THREE.MeshStandardMaterial({
    color: 0xf0f4f8,
    roughness: 0.5,
  }),
  chaletWindow: new THREE.MeshStandardMaterial({
    color: 0x87ceeb,
    roughness: 0.1,
    metalness: 0.3,
    emissive: 0xffd700,
    emissiveIntensity: 0.15,
  }),
  chaletChimney: new THREE.MeshStandardMaterial({
    color: 0x8b7355,
    roughness: 0.9,
  }),

  // Lift materials
  liftMetal: new THREE.MeshStandardMaterial({
    color: 0x4a4a4a,
    roughness: 0.3,
    metalness: 0.8,
  }),
  liftCable: new THREE.MeshStandardMaterial({
    color: 0x2a2a2a,
    roughness: 0.4,
    metalness: 0.6,
  }),
  liftSeat: new THREE.MeshStandardMaterial({
    color: 0x1565c0,
    roughness: 0.6,
  }),
  liftBar: new THREE.MeshStandardMaterial({
    color: 0xff8f00,
    roughness: 0.5,
    metalness: 0.4,
  }),

  // Rock materials
  rock: new THREE.MeshStandardMaterial({
    color: 0x5a5a5a,
    roughness: 0.95,
    flatShading: true,
  }),
  rockDark: new THREE.MeshStandardMaterial({
    color: 0x3d3d3d,
    roughness: 0.9,
    flatShading: true,
  }),
  rockSnow: new THREE.MeshStandardMaterial({
    color: 0xe8eef5,
    roughness: 0.7,
  }),

  // Safety materials
  safetyNet: new THREE.MeshStandardMaterial({
    color: 0xff6600,
    roughness: 0.8,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.85,
  }),
  safetyPole: new THREE.MeshStandardMaterial({
    color: 0xff4400,
    roughness: 0.5,
  }),
  mattress: new THREE.MeshStandardMaterial({
    color: 0x0066cc,
    roughness: 0.9,
  }),

  // Finish area materials
  finishArch: new THREE.MeshStandardMaterial({
    color: 0xe53935,
    roughness: 0.4,
    metalness: 0.2,
  }),
  finishArchWhite: new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.5,
  }),
  sponsor: new THREE.MeshStandardMaterial({
    color: 0xffd700,
    roughness: 0.3,
    emissive: 0xffd700,
    emissiveIntensity: 0.1,
  }),
  timing: new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    roughness: 0.2,
    metalness: 0.5,
  }),

  // Spectator materials
  jacket1: new THREE.MeshStandardMaterial({ color: 0xe53935, roughness: 0.7 }),
  jacket2: new THREE.MeshStandardMaterial({ color: 0x1e88e5, roughness: 0.7 }),
  jacket3: new THREE.MeshStandardMaterial({ color: 0x43a047, roughness: 0.7 }),
  jacket4: new THREE.MeshStandardMaterial({ color: 0xfdd835, roughness: 0.7 }),
  jacket5: new THREE.MeshStandardMaterial({ color: 0x8e24aa, roughness: 0.7 }),
  pants: new THREE.MeshStandardMaterial({ color: 0x212121, roughness: 0.8 }),
  skin: new THREE.MeshStandardMaterial({ color: 0xffcba4, roughness: 0.9 }),

  // Banner materials
  banner: new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.7,
    side: THREE.DoubleSide,
  }),
  bannerRope: new THREE.MeshStandardMaterial({
    color: 0x333333,
    roughness: 0.8,
  }),
};

// ==================== PROCEDURAL TREE GENERATOR ====================
function createPineTree(variant: number, scale: number = 1): THREE.Group {
  const tree = new THREE.Group();

  // Different tree variants for variety
  const configs = [
    { layers: 5, baseRadius: 2.5, height: 12, snowAmount: 0.4 },
    { layers: 4, baseRadius: 2.0, height: 9, snowAmount: 0.6 },
    { layers: 6, baseRadius: 3.0, height: 15, snowAmount: 0.3 },
    { layers: 4, baseRadius: 1.8, height: 7, snowAmount: 0.7 },
    { layers: 5, baseRadius: 2.2, height: 10, snowAmount: 0.5 },
  ];

  const config = configs[variant % configs.length];
  const needleMats = [materials.treeNeedles, materials.treeNeedlesDark, materials.treeNeedlesLight];
  const needleMat = needleMats[variant % needleMats.length];

  // Trunk
  const trunkHeight = config.height * 0.15;
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15 * scale, 0.25 * scale, trunkHeight * scale, 8),
    variant % 2 === 0 ? materials.treeTrunk : materials.treeTrunkSnowy
  );
  trunk.position.y = trunkHeight * scale * 0.5;
  trunk.castShadow = true;
  tree.add(trunk);

  // Foliage layers (cones)
  const layerHeight = (config.height - trunkHeight) / config.layers;
  let currentY = trunkHeight * scale;

  for (let i = 0; i < config.layers; i++) {
    const layerScale = 1 - (i / config.layers) * 0.7;
    const radius = config.baseRadius * layerScale * scale;
    const height = layerHeight * scale * 1.4;

    // Main foliage cone
    const foliage = new THREE.Mesh(
      new THREE.ConeGeometry(radius, height, 8),
      needleMat
    );
    foliage.position.y = currentY + height * 0.4;
    foliage.castShadow = true;
    foliage.receiveShadow = true;
    tree.add(foliage);

    // Snow on top of each layer
    if (config.snowAmount > 0 && Math.random() < config.snowAmount) {
      const snowCone = new THREE.Mesh(
        new THREE.ConeGeometry(radius * 0.85, height * 0.3, 8),
        materials.treeSnow
      );
      snowCone.position.y = currentY + height * 0.65;
      snowCone.castShadow = true;
      tree.add(snowCone);
    }

    currentY += layerHeight * scale * 0.75;
  }

  // Top snow cap
  const topSnow = new THREE.Mesh(
    new THREE.SphereGeometry(0.3 * scale, 8, 6),
    materials.treeSnow
  );
  topSnow.position.y = currentY + 0.2 * scale;
  tree.add(topSnow);

  return tree;
}

// ==================== FOREST CREATION ====================
export function createForest(scene: THREE.Scene, courseLength: number, slopeAngle: number): void {
  const treePool: THREE.Group[] = [];

  // Pre-create tree variants
  for (let v = 0; v < ENV_CONFIG.TREE_VARIETY; v++) {
    for (let s = 0; s < 3; s++) {
      treePool.push(createPineTree(v, 0.7 + s * 0.3));
    }
  }

  // Place trees along the course
  for (let i = 0; i < ENV_CONFIG.TREE_COUNT; i++) {
    const z = -Math.random() * courseLength * 1.1;
    const distanceRatio = Math.abs(z) / courseLength;

    // Side of the course (left or right)
    const side = Math.random() > 0.5 ? 1 : -1;

    // Distance from course center
    const minDist = ENV_CONFIG.FOREST_START_X + Math.random() * 20;
    const maxDist = minDist + 60 + Math.random() * 100;
    const x = side * (minDist + Math.random() * (maxDist - minDist));

    // Calculate Y based on slope
    const slopeY = z * Math.tan(THREE.MathUtils.degToRad(slopeAngle)) * 0.5;

    // Add some terrain variation
    const terrainY = Math.sin(x * 0.05) * 2 + Math.cos(z * 0.03) * 1.5;

    // Clone a random tree from pool
    const treeIndex = Math.floor(Math.random() * treePool.length);
    const tree = treePool[treeIndex].clone();

    // Random rotation and slight scale variation
    tree.rotation.y = Math.random() * Math.PI * 2;
    const scaleVar = 0.8 + Math.random() * 0.5;
    tree.scale.multiplyScalar(scaleVar);

    tree.position.set(x, slopeY + terrainY, z);
    scene.add(tree);
  }
}

// ==================== ALPINE CHALET ====================
function createChalet(size: 'small' | 'medium' | 'large' = 'medium'): THREE.Group {
  const chalet = new THREE.Group();

  const sizes = {
    small: { width: 6, depth: 5, height: 4, roofHeight: 3 },
    medium: { width: 10, depth: 8, height: 5, roofHeight: 4 },
    large: { width: 14, depth: 10, height: 6, roofHeight: 5 },
  };

  const s = sizes[size];

  // Main building body
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(s.width, s.height, s.depth),
    materials.chaletWood
  );
  body.position.y = s.height / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  chalet.add(body);

  // Second floor darker wood accent
  const accent = new THREE.Mesh(
    new THREE.BoxGeometry(s.width + 0.1, s.height * 0.35, s.depth + 0.1),
    materials.chaletWoodDark
  );
  accent.position.y = s.height * 0.7;
  chalet.add(accent);

  // Roof
  const roofShape = new THREE.Shape();
  roofShape.moveTo(-s.width / 2 - 1, 0);
  roofShape.lineTo(0, s.roofHeight);
  roofShape.lineTo(s.width / 2 + 1, 0);
  roofShape.lineTo(-s.width / 2 - 1, 0);

  const roofGeo = new THREE.ExtrudeGeometry(roofShape, {
    depth: s.depth + 1.5,
    bevelEnabled: false,
  });

  const roof = new THREE.Mesh(roofGeo, materials.chaletRoof);
  roof.rotation.x = -Math.PI / 2;
  roof.position.set(0, s.height, -s.depth / 2 - 0.75);
  roof.castShadow = true;
  chalet.add(roof);

  // Snow on roof
  const snowRoof = new THREE.Mesh(
    new THREE.BoxGeometry(s.width + 1.5, 0.25, s.depth + 1),
    materials.chaletRoofSnow
  );
  snowRoof.position.y = s.height + s.roofHeight * 0.5;
  snowRoof.rotation.x = Math.atan2(s.roofHeight, s.width / 2) * 0.3;
  chalet.add(snowRoof);

  // Windows
  const windowPositions = [
    { x: -s.width * 0.3, y: s.height * 0.6, z: s.depth / 2 + 0.01 },
    { x: s.width * 0.3, y: s.height * 0.6, z: s.depth / 2 + 0.01 },
    { x: 0, y: s.height * 0.35, z: s.depth / 2 + 0.01 },
  ];

  windowPositions.forEach(pos => {
    const window = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 1.4, 0.1),
      materials.chaletWindow
    );
    window.position.set(pos.x, pos.y, pos.z);
    chalet.add(window);

    // Window frame
    const frameH = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.1, 0.15),
      materials.chaletWoodDark
    );
    frameH.position.set(pos.x, pos.y + 0.7, pos.z);
    chalet.add(frameH);

    const frameH2 = frameH.clone();
    frameH2.position.y = pos.y - 0.7;
    chalet.add(frameH2);
  });

  // Door
  const door = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 2.2, 0.15),
    materials.chaletWoodDark
  );
  door.position.set(0, 1.1, s.depth / 2 + 0.05);
  chalet.add(door);

  // Chimney
  const chimney = new THREE.Mesh(
    new THREE.BoxGeometry(1, 2.5, 1),
    materials.chaletChimney
  );
  chimney.position.set(s.width * 0.25, s.height + s.roofHeight * 0.7, 0);
  chimney.castShadow = true;
  chalet.add(chimney);

  // Chimney cap
  const chimneyTop = new THREE.Mesh(
    new THREE.BoxGeometry(1.3, 0.2, 1.3),
    materials.chaletChimney
  );
  chimneyTop.position.set(s.width * 0.25, s.height + s.roofHeight * 0.7 + 1.35, 0);
  chalet.add(chimneyTop);

  // Balcony for medium and large chalets
  if (size !== 'small') {
    const balconyFloor = new THREE.Mesh(
      new THREE.BoxGeometry(s.width * 0.6, 0.15, 1.5),
      materials.chaletWoodDark
    );
    balconyFloor.position.set(0, s.height * 0.5, s.depth / 2 + 0.75);
    chalet.add(balconyFloor);

    // Balcony railing
    const railingMat = materials.chaletWoodDark;
    for (let i = -3; i <= 3; i++) {
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 0.8, 6),
        railingMat
      );
      post.position.set(i * (s.width * 0.08), s.height * 0.5 + 0.4, s.depth / 2 + 1.4);
      chalet.add(post);
    }

    const topRail = new THREE.Mesh(
      new THREE.BoxGeometry(s.width * 0.6, 0.08, 0.08),
      railingMat
    );
    topRail.position.set(0, s.height * 0.5 + 0.8, s.depth / 2 + 1.4);
    chalet.add(topRail);
  }

  return chalet;
}

export function createChalets(scene: THREE.Scene, courseLength: number, slopeAngle: number): void {
  const positions = [
    { z: -200, x: -70, size: 'medium' as const, rot: 0.3 },
    { z: -600, x: 85, size: 'large' as const, rot: -0.2 },
    { z: -1200, x: -95, size: 'small' as const, rot: 0.5 },
    { z: -1800, x: 75, size: 'medium' as const, rot: -0.4 },
    { z: -2500, x: -80, size: 'large' as const, rot: 0.2 },
    { z: -3200, x: 90, size: 'small' as const, rot: -0.3 },
    { z: -4000, x: -100, size: 'medium' as const, rot: 0.4 },
    { z: -4800, x: 70, size: 'small' as const, rot: -0.5 },
    { z: -5500, x: -85, size: 'large' as const, rot: 0.1 },
    { z: -6300, x: 95, size: 'medium' as const, rot: -0.2 },
    { z: -7000, x: -75, size: 'small' as const, rot: 0.3 },
    { z: -7600, x: 80, size: 'medium' as const, rot: -0.4 },
  ];

  positions.forEach(pos => {
    const chalet = createChalet(pos.size);
    const slopeY = pos.z * Math.tan(THREE.MathUtils.degToRad(slopeAngle)) * 0.5;
    chalet.position.set(pos.x, slopeY, pos.z);
    chalet.rotation.y = pos.rot;
    scene.add(chalet);
  });
}

// ==================== SKI LIFT SYSTEM ====================
function createLiftPylon(height: number = 15): THREE.Group {
  const pylon = new THREE.Group();

  // Main support pole
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.6, height, 8),
    materials.liftMetal
  );
  pole.position.y = height / 2;
  pole.castShadow = true;
  pylon.add(pole);

  // Cross beam at top
  const crossBeam = new THREE.Mesh(
    new THREE.BoxGeometry(6, 0.5, 0.5),
    materials.liftMetal
  );
  crossBeam.position.y = height - 0.5;
  crossBeam.castShadow = true;
  pylon.add(crossBeam);

  // Pulleys/wheels at each end
  [-2.5, 2.5].forEach(x => {
    const wheel = new THREE.Mesh(
      new THREE.TorusGeometry(0.4, 0.1, 8, 16),
      materials.liftMetal
    );
    wheel.position.set(x, height - 0.5, 0);
    wheel.rotation.y = Math.PI / 2;
    pylon.add(wheel);
  });

  // Support struts
  [-1, 1].forEach(side => {
    const strut = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.15, height * 0.7, 6),
      materials.liftMetal
    );
    strut.position.set(side * 1.5, height * 0.4, side * 0.8);
    strut.rotation.z = side * 0.2;
    strut.rotation.x = -0.15;
    strut.castShadow = true;
    pylon.add(strut);
  });

  // Base concrete
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(1.2, 1.5, 0.8, 8),
    new THREE.MeshStandardMaterial({ color: 0x808080, roughness: 0.95 })
  );
  base.position.y = 0.4;
  pylon.add(base);

  return pylon;
}

function createChairlift(): THREE.Group {
  const chair = new THREE.Group();

  // Hanger bar
  const hanger = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 3, 6),
    materials.liftMetal
  );
  hanger.position.y = 1.5;
  chair.add(hanger);

  // Connection to cable
  const connector = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.4, 0.2),
    materials.liftMetal
  );
  connector.position.y = 3;
  chair.add(connector);

  // Seat frame
  const seatFrame = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 0.15, 0.6),
    materials.liftMetal
  );
  seatFrame.position.y = 0.3;
  chair.add(seatFrame);

  // Seat cushions (4-seater)
  for (let i = -1.5; i <= 1.5; i += 1) {
    const seat = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.1, 0.5),
      materials.liftSeat
    );
    seat.position.set(i * 0.5, 0.4, 0);
    chair.add(seat);

    // Backrest
    const back = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.8, 0.1),
      materials.liftSeat
    );
    back.position.set(i * 0.5, 0.75, -0.25);
    chair.add(back);
  }

  // Safety bar
  const safetyBar = new THREE.Mesh(
    new THREE.TorusGeometry(0.8, 0.04, 8, 16, Math.PI),
    materials.liftBar
  );
  safetyBar.position.set(0, 0.6, 0.3);
  safetyBar.rotation.x = Math.PI / 2;
  safetyBar.rotation.z = Math.PI;
  chair.add(safetyBar);

  // Footrest
  const footrest = new THREE.Mesh(
    new THREE.BoxGeometry(2, 0.08, 0.3),
    materials.liftMetal
  );
  footrest.position.set(0, -0.5, 0.4);
  chair.add(footrest);

  return chair;
}

export function createSkiLift(scene: THREE.Scene, courseLength: number, slopeAngle: number): void {
  // Lift runs parallel to the course on the right side
  const liftOffsetX = 55;
  const liftStartZ = 50;
  const liftEndZ = -courseLength + 200;
  const liftLength = Math.abs(liftEndZ - liftStartZ);

  // Create pylons
  for (let i = 0; i < ENV_CONFIG.LIFT_PYLON_COUNT; i++) {
    const z = liftStartZ - (i / (ENV_CONFIG.LIFT_PYLON_COUNT - 1)) * liftLength;
    const slopeY = z * Math.tan(THREE.MathUtils.degToRad(slopeAngle)) * 0.5;

    // Vary pylon height slightly
    const heightVar = 12 + Math.random() * 6;
    const pylon = createLiftPylon(heightVar);
    pylon.position.set(liftOffsetX, slopeY, z);
    scene.add(pylon);
  }

  // Create cable (as a thick line)
  const cablePoints: THREE.Vector3[] = [];
  for (let i = 0; i <= 100; i++) {
    const t = i / 100;
    const z = liftStartZ - t * liftLength;
    const slopeY = z * Math.tan(THREE.MathUtils.degToRad(slopeAngle)) * 0.5;
    const cableY = slopeY + 14 + Math.sin(t * Math.PI * ENV_CONFIG.LIFT_PYLON_COUNT) * 0.5;

    // Up cable
    cablePoints.push(new THREE.Vector3(liftOffsetX - 2.5, cableY, z));
  }

  const cableGeo = new THREE.BufferGeometry().setFromPoints(cablePoints);
  const cableLine = new THREE.Line(cableGeo, new THREE.LineBasicMaterial({ color: 0x1a1a1a, linewidth: 2 }));
  scene.add(cableLine);

  // Down cable
  const cablePoints2 = cablePoints.map(p => new THREE.Vector3(liftOffsetX + 2.5, p.y, p.z));
  const cableGeo2 = new THREE.BufferGeometry().setFromPoints(cablePoints2);
  const cableLine2 = new THREE.Line(cableGeo2, new THREE.LineBasicMaterial({ color: 0x1a1a1a, linewidth: 2 }));
  scene.add(cableLine2);

  // Create chairlifts along the cable
  for (let i = 0; i < ENV_CONFIG.LIFT_CHAIR_COUNT; i++) {
    const t = i / ENV_CONFIG.LIFT_CHAIR_COUNT;
    const z = liftStartZ - t * liftLength;
    const slopeY = z * Math.tan(THREE.MathUtils.degToRad(slopeAngle)) * 0.5;
    const chairY = slopeY + 14 + Math.sin(t * Math.PI * ENV_CONFIG.LIFT_PYLON_COUNT) * 0.5;

    // Alternate between up and down cables
    const isGoingUp = i % 2 === 0;
    const chairX = isGoingUp ? liftOffsetX - 2.5 : liftOffsetX + 2.5;

    const chair = createChairlift();
    chair.position.set(chairX, chairY - 3, z);
    chair.rotation.y = isGoingUp ? 0 : Math.PI;
    scene.add(chair);
  }
}

// ==================== ROCK FORMATIONS ====================
function createRockCluster(size: number = 1): THREE.Group {
  const cluster = new THREE.Group();
  const rockCount = 3 + Math.floor(Math.random() * 5);

  for (let i = 0; i < rockCount; i++) {
    // Create irregular rock shape using dodecahedron with noise
    const baseGeo = new THREE.DodecahedronGeometry(size * (0.5 + Math.random() * 1.5), 1);
    const positions = baseGeo.attributes.position;

    for (let j = 0; j < positions.count; j++) {
      const noise = 0.7 + Math.random() * 0.6;
      positions.setX(j, positions.getX(j) * noise);
      positions.setY(j, positions.getY(j) * (0.6 + Math.random() * 0.8));
      positions.setZ(j, positions.getZ(j) * noise);
    }

    baseGeo.computeVertexNormals();

    const rockMat = Math.random() > 0.5 ? materials.rock : materials.rockDark;
    const rock = new THREE.Mesh(baseGeo, rockMat);

    rock.position.set(
      (Math.random() - 0.5) * size * 3,
      Math.random() * size * 0.5,
      (Math.random() - 0.5) * size * 3
    );
    rock.rotation.set(
      Math.random() * 0.5,
      Math.random() * Math.PI * 2,
      Math.random() * 0.5
    );
    rock.castShadow = true;
    rock.receiveShadow = true;
    cluster.add(rock);

    // Add snow patches on top
    if (Math.random() > 0.4) {
      const snowPatch = new THREE.Mesh(
        new THREE.SphereGeometry(size * 0.4 * Math.random() + 0.2, 6, 4, 0, Math.PI * 2, 0, Math.PI * 0.5),
        materials.rockSnow
      );
      snowPatch.position.copy(rock.position);
      snowPatch.position.y += size * 0.5;
      cluster.add(snowPatch);
    }
  }

  return cluster;
}

export function createRocks(scene: THREE.Scene, courseLength: number, slopeAngle: number, courseWidth: number): void {
  for (let i = 0; i < ENV_CONFIG.ROCK_CLUSTER_COUNT; i++) {
    const z = -100 - Math.random() * (courseLength - 300);
    const side = Math.random() > 0.5 ? 1 : -1;
    const x = side * (courseWidth / 2 + 5 + Math.random() * 40);
    const slopeY = z * Math.tan(THREE.MathUtils.degToRad(slopeAngle)) * 0.5;

    const size = 1 + Math.random() * 2;
    const cluster = createRockCluster(size);
    cluster.position.set(x, slopeY, z);
    scene.add(cluster);
  }
}

// ==================== FINISH AREA ====================
export function createFinishArea(scene: THREE.Scene, finishZ: number, slopeAngle: number): void {
  const slopeY = finishZ * Math.tan(THREE.MathUtils.degToRad(slopeAngle)) * 0.5;
  const finishGroup = new THREE.Group();

  // Main finish arch
  const archWidth = 14;
  const archHeight = 8;

  // Left pillar
  const leftPillar = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, archHeight, 1.2),
    materials.finishArch
  );
  leftPillar.position.set(-archWidth / 2, archHeight / 2, 0);
  leftPillar.castShadow = true;
  finishGroup.add(leftPillar);

  // Right pillar
  const rightPillar = leftPillar.clone();
  rightPillar.position.x = archWidth / 2;
  finishGroup.add(rightPillar);

  // Top beam
  const topBeam = new THREE.Mesh(
    new THREE.BoxGeometry(archWidth + 1.2, 1.5, 1.5),
    materials.finishArch
  );
  topBeam.position.y = archHeight + 0.75;
  topBeam.castShadow = true;
  finishGroup.add(topBeam);

  // "FINISH" text panel (white background)
  const textPanel = new THREE.Mesh(
    new THREE.BoxGeometry(archWidth - 2, 1.8, 0.2),
    materials.finishArchWhite
  );
  textPanel.position.set(0, archHeight + 0.75, 0.85);
  finishGroup.add(textPanel);

  // Timing display boards
  [-archWidth / 2 - 3, archWidth / 2 + 3].forEach((x, idx) => {
    const timingBoard = new THREE.Mesh(
      new THREE.BoxGeometry(4, 3, 0.3),
      materials.timing
    );
    timingBoard.position.set(x, 4, 2);
    timingBoard.castShadow = true;
    finishGroup.add(timingBoard);

    // Screen glow
    const screen = new THREE.Mesh(
      new THREE.BoxGeometry(3.6, 2.5, 0.1),
      new THREE.MeshStandardMaterial({
        color: 0x00ff00,
        emissive: 0x00ff00,
        emissiveIntensity: 0.3,
      })
    );
    screen.position.set(x, 4, 2.2);
    finishGroup.add(screen);

    // Stand
    const stand = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.2, 2.5, 8),
      materials.liftMetal
    );
    stand.position.set(x, 1.25, 2);
    finishGroup.add(stand);
  });

  // Sponsor banners on sides
  const createSponsorBanner = (x: number, width: number, height: number): void => {
    const banner = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      materials.banner
    );
    banner.position.set(x, height / 2 + 0.5, 4);
    banner.rotation.y = x > 0 ? -0.3 : 0.3;
    finishGroup.add(banner);

    // Banner poles
    [-width / 2, width / 2].forEach(offset => {
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, height + 1, 6),
        materials.liftMetal
      );
      pole.position.set(x + offset * Math.cos(x > 0 ? -0.3 : 0.3), (height + 1) / 2, 4);
      finishGroup.add(pole);
    });
  };

  createSponsorBanner(-12, 5, 3);
  createSponsorBanner(12, 5, 3);

  // Finish line on ground
  const finishLine = new THREE.Mesh(
    new THREE.PlaneGeometry(archWidth, 0.5),
    new THREE.MeshStandardMaterial({ color: 0xff0000 })
  );
  finishLine.rotation.x = -Math.PI / 2;
  finishLine.position.y = 0.01;
  finishGroup.add(finishLine);

  // Checkered pattern before finish
  for (let i = 0; i < 20; i++) {
    for (let j = 0; j < 4; j++) {
      const isBlack = (i + j) % 2 === 0;
      const checker = new THREE.Mesh(
        new THREE.PlaneGeometry(0.7, 0.7),
        new THREE.MeshStandardMaterial({ color: isBlack ? 0x000000 : 0xffffff })
      );
      checker.rotation.x = -Math.PI / 2;
      checker.position.set(-7 + i * 0.7 + 0.35, 0.01, 1 + j * 0.7);
      finishGroup.add(checker);
    }
  }

  finishGroup.position.set(0, slopeY, finishZ);
  scene.add(finishGroup);
}

// ==================== SPECTATOR GROUPS ====================
function createSpectator(): THREE.Group {
  const spectator = new THREE.Group();
  const jackets = [materials.jacket1, materials.jacket2, materials.jacket3, materials.jacket4, materials.jacket5];
  const jacketMat = jackets[Math.floor(Math.random() * jackets.length)];

  // Body
  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.25, 0.5, 4, 8),
    jacketMat
  );
  body.position.y = 1.0;
  body.castShadow = true;
  spectator.add(body);

  // Head
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.15, 8, 6),
    materials.skin
  );
  head.position.y = 1.55;
  spectator.add(head);

  // Hat/beanie
  const hat = new THREE.Mesh(
    new THREE.SphereGeometry(0.17, 8, 4, 0, Math.PI * 2, 0, Math.PI * 0.6),
    jacketMat
  );
  hat.position.y = 1.65;
  spectator.add(hat);

  // Legs
  [-0.1, 0.1].forEach(x => {
    const leg = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.08, 0.4, 4, 6),
      materials.pants
    );
    leg.position.set(x, 0.35, 0);
    spectator.add(leg);
  });

  // Arms raised (cheering)
  if (Math.random() > 0.5) {
    [-0.3, 0.3].forEach(x => {
      const arm = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.06, 0.3, 4, 6),
        jacketMat
      );
      arm.position.set(x, 1.4, 0);
      arm.rotation.z = x > 0 ? -0.8 : 0.8;
      spectator.add(arm);
    });
  }

  return spectator;
}

export function createSpectators(scene: THREE.Scene, courseLength: number, slopeAngle: number, courseWidth: number): void {
  // Strategic positions for spectator groups
  const groupPositions = [
    { z: -500, side: -1 },
    { z: -1500, side: 1 },
    { z: -2500, side: -1 },
    { z: -3500, side: 1 },
    { z: -5000, side: -1 },
    { z: -6000, side: 1 },
    { z: -7200, side: -1 },
    { z: -7800, side: 1 },
  ];

  groupPositions.forEach(pos => {
    const groupX = pos.side * (courseWidth / 2 + 3 + Math.random() * 5);
    const slopeY = pos.z * Math.tan(THREE.MathUtils.degToRad(slopeAngle)) * 0.5;

    // Create crowd barrier
    const barrier = new THREE.Mesh(
      new THREE.BoxGeometry(8, 1, 0.3),
      materials.safetyNet
    );
    barrier.position.set(groupX, slopeY + 0.5, pos.z);
    barrier.rotation.y = pos.side > 0 ? -0.1 : 0.1;
    scene.add(barrier);

    // Place spectators behind barrier
    for (let i = 0; i < ENV_CONFIG.SPECTATORS_PER_GROUP; i++) {
      const spectator = createSpectator();
      const offsetX = (Math.random() - 0.5) * 7;
      const offsetZ = Math.random() * 3;
      const rowOffset = pos.side * (1.5 + offsetZ * 0.3);

      spectator.position.set(
        groupX + rowOffset + offsetX * 0.2,
        slopeY,
        pos.z + offsetX
      );
      spectator.rotation.y = pos.side > 0 ? -Math.PI / 2 + (Math.random() - 0.5) * 0.4 : Math.PI / 2 + (Math.random() - 0.5) * 0.4;

      // Random scale for variety
      const scale = 0.85 + Math.random() * 0.3;
      spectator.scale.setScalar(scale);

      scene.add(spectator);
    }
  });
}

// ==================== SAFETY EQUIPMENT ====================
export function createSafetyEquipment(scene: THREE.Scene, courseLength: number, slopeAngle: number, courseWidth: number): void {
  // Safety nets at curves/dangerous sections
  const netPositions = [
    { z: -800, side: 1, length: 30 },
    { z: -1600, side: -1, length: 25 },
    { z: -2400, side: 1, length: 35 },
    { z: -3300, side: -1, length: 20 },
    { z: -4200, side: 1, length: 30 },
    { z: -5100, side: -1, length: 25 },
    { z: -6000, side: 1, length: 35 },
    { z: -7000, side: -1, length: 40 },
  ];

  netPositions.forEach(pos => {
    const slopeY = pos.z * Math.tan(THREE.MathUtils.degToRad(slopeAngle)) * 0.5;
    const netX = pos.side * (courseWidth / 2 + 1);

    // Net mesh
    const net = new THREE.Mesh(
      new THREE.PlaneGeometry(pos.length, 2),
      materials.safetyNet
    );
    net.position.set(netX, slopeY + 1, pos.z - pos.length / 2);
    net.rotation.y = pos.side > 0 ? -Math.PI / 2 : Math.PI / 2;
    scene.add(net);

    // Support poles
    for (let i = 0; i <= pos.length; i += 5) {
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.08, 2.5, 6),
        materials.safetyPole
      );
      pole.position.set(netX, slopeY + 1.25, pos.z - i);
      scene.add(pole);
    }
  });

  // Crash mats at key locations
  const matPositions = [
    { z: -400, x: -25 },
    { z: -1200, x: 28 },
    { z: -2000, x: -30 },
    { z: -3000, x: 25 },
    { z: -4500, x: -28 },
    { z: -5800, x: 30 },
    { z: -6800, x: -26 },
  ];

  matPositions.forEach(pos => {
    const slopeY = pos.z * Math.tan(THREE.MathUtils.degToRad(slopeAngle)) * 0.5;

    const mat = new THREE.Mesh(
      new THREE.BoxGeometry(3, 2, 0.5),
      materials.mattress
    );
    mat.position.set(pos.x, slopeY + 1, pos.z);
    mat.rotation.y = pos.x > 0 ? 0.3 : -0.3;
    mat.castShadow = true;
    scene.add(mat);
  });
}

// ==================== IMPROVED MOUNTAINS ====================
export function createDetailedMountains(scene: THREE.Scene, courseLength: number): void {
  const mountainData = [
    // Far background mountains
    { x: -800, z: -2000, height: 400, radius: 200, snowLine: 0.5 },
    { x: 700, z: -2500, height: 500, radius: 250, snowLine: 0.45 },
    { x: -500, z: -3500, height: 450, radius: 220, snowLine: 0.5 },
    { x: 900, z: -4000, height: 550, radius: 280, snowLine: 0.4 },
    { x: -900, z: -4500, height: 380, radius: 180, snowLine: 0.55 },
    { x: 600, z: -5500, height: 480, radius: 240, snowLine: 0.48 },

    // Mid-distance mountains
    { x: -400, z: -1000, height: 200, radius: 120, snowLine: 0.6 },
    { x: 500, z: -1500, height: 250, radius: 140, snowLine: 0.55 },
    { x: -600, z: -2800, height: 280, radius: 150, snowLine: 0.5 },
    { x: 450, z: -3200, height: 220, radius: 130, snowLine: 0.58 },

    // Nearby peaks
    { x: -300, z: -500, height: 120, radius: 80, snowLine: 0.7 },
    { x: 350, z: -800, height: 150, radius: 90, snowLine: 0.65 },
  ];

  mountainData.forEach(m => {
    const mountainGroup = new THREE.Group();

    // Main rock mass
    const rockGeo = new THREE.ConeGeometry(m.radius, m.height, 8, 4);
    const positions = rockGeo.attributes.position;

    // Add noise to make it look natural
    for (let i = 0; i < positions.count; i++) {
      const y = positions.getY(i);
      if (y > -m.height / 2) { // Don't modify base
        const noise = 1 + (Math.random() - 0.5) * 0.3;
        positions.setX(i, positions.getX(i) * noise);
        positions.setZ(i, positions.getZ(i) * noise);
      }
    }
    rockGeo.computeVertexNormals();

    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x4a4a4a,
      roughness: 0.95,
      flatShading: true,
    });

    const rock = new THREE.Mesh(rockGeo, rockMat);
    rock.position.y = m.height / 2;
    mountainGroup.add(rock);

    // Snow cap
    const snowHeight = m.height * (1 - m.snowLine);
    const snowRadius = m.radius * m.snowLine;
    const snowGeo = new THREE.ConeGeometry(snowRadius, snowHeight, 8, 2);

    // Add noise to snow
    const snowPos = snowGeo.attributes.position;
    for (let i = 0; i < snowPos.count; i++) {
      const noise = 1 + (Math.random() - 0.5) * 0.2;
      snowPos.setX(i, snowPos.getX(i) * noise);
      snowPos.setZ(i, snowPos.getZ(i) * noise);
    }
    snowGeo.computeVertexNormals();

    const snowMat = new THREE.MeshStandardMaterial({
      color: 0xf8fcff,
      roughness: 0.7,
    });

    const snow = new THREE.Mesh(snowGeo, snowMat);
    snow.position.y = m.height - snowHeight / 2;
    mountainGroup.add(snow);

    // Secondary peaks
    if (m.height > 300) {
      for (let i = 0; i < 3; i++) {
        const angle = (i / 3) * Math.PI * 2 + Math.random() * 0.5;
        const dist = m.radius * 0.6;
        const peakHeight = m.height * (0.4 + Math.random() * 0.3);
        const peakRadius = m.radius * 0.3;

        const peakGeo = new THREE.ConeGeometry(peakRadius, peakHeight, 6, 2);
        const peak = new THREE.Mesh(peakGeo, rockMat);
        peak.position.set(
          Math.cos(angle) * dist,
          peakHeight / 2,
          Math.sin(angle) * dist
        );
        mountainGroup.add(peak);

        // Snow on secondary peaks
        const peakSnowHeight = peakHeight * 0.4;
        const peakSnow = new THREE.Mesh(
          new THREE.ConeGeometry(peakRadius * 0.5, peakSnowHeight, 6, 1),
          snowMat
        );
        peakSnow.position.set(
          Math.cos(angle) * dist,
          peakHeight - peakSnowHeight / 2,
          Math.sin(angle) * dist
        );
        mountainGroup.add(peakSnow);
      }
    }

    mountainGroup.position.set(m.x, -50, m.z);
    scene.add(mountainGroup);
  });
}

// ==================== COURSE BANNERS ====================
export function createCourseBanners(scene: THREE.Scene, courseLength: number, slopeAngle: number): void {
  const bannerPositions = [
    -300, -700, -1100, -1700, -2300, -2900, -3600, -4200, -4900, -5600, -6300, -7100
  ];

  bannerPositions.forEach((z, index) => {
    const slopeY = z * Math.tan(THREE.MathUtils.degToRad(slopeAngle)) * 0.5;
    const side = index % 2 === 0 ? -1 : 1;
    const x = side * 32;

    // Banner poles
    const poleHeight = 5;
    [-2.5, 2.5].forEach(offset => {
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.1, poleHeight, 6),
        materials.liftMetal
      );
      pole.position.set(x + offset, slopeY + poleHeight / 2, z);
      pole.castShadow = true;
      scene.add(pole);
    });

    // Banner fabric
    const bannerColors = [0xe53935, 0x1e88e5, 0x43a047, 0xfdd835, 0x8e24aa, 0xff6f00];
    const bannerMat = new THREE.MeshStandardMaterial({
      color: bannerColors[index % bannerColors.length],
      roughness: 0.8,
      side: THREE.DoubleSide,
    });

    const banner = new THREE.Mesh(
      new THREE.PlaneGeometry(4.5, 2),
      bannerMat
    );
    banner.position.set(x, slopeY + 3.5, z);
    banner.rotation.y = side > 0 ? Math.PI / 2 : -Math.PI / 2;
    scene.add(banner);

    // Add slight wave animation data
    banner.userData.wavePhase = Math.random() * Math.PI * 2;
  });
}

// ==================== MAIN ENVIRONMENT SETUP ====================
export function setupEnvironment(
  scene: THREE.Scene,
  courseLength: number,
  courseWidth: number,
  slopeAngle: number
): void {
  console.log('🏔️ Creating professional alpine environment...');

  // Create all environment elements
  createForest(scene, courseLength, slopeAngle);
  console.log('🌲 Forest created');

  createChalets(scene, courseLength, slopeAngle);
  console.log('🏠 Chalets created');

  createSkiLift(scene, courseLength, slopeAngle);
  console.log('🚡 Ski lift created');

  createRocks(scene, courseLength, slopeAngle, courseWidth);
  console.log('🪨 Rock formations created');

  createDetailedMountains(scene, courseLength);
  console.log('⛰️ Mountains created');

  createSpectators(scene, courseLength, slopeAngle, courseWidth);
  console.log('👥 Spectators created');

  createSafetyEquipment(scene, courseLength, slopeAngle, courseWidth);
  console.log('🦺 Safety equipment created');

  createFinishArea(scene, -ENV_CONFIG.FINISH_DISTANCE, slopeAngle);
  console.log('🏁 Finish area created');

  createCourseBanners(scene, courseLength, slopeAngle);
  console.log('🎌 Course banners created');

  console.log('✅ Environment setup complete!');
}
