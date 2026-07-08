/* ══════════════════════════════════════════════════════
   3D Interior Scene Engine
   Built with Three.js
   ══════════════════════════════════════════════════════ */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/* ── Room Data ────────────────────────────────── */

const ROOMS = {
  living: {
    name: '客厅',
    desc: '以浅色橡木地板和艺术涂料墙面营造温润基调，整面落地窗将城市天际线引入室内。',
    wall: '#e8e0d4',
    floor: '#c4b49c',
    ceiling: '#f0ece4',
    accent: '#8a7a6a',
    window: true,
    furniture: [
      { type: 'sofa', x: 0, z: -2, color: '#b8a894' },
      { type: 'table', x: 0, z: 1.5, color: '#8a7a6a' },
      { type: 'lamp', x: -2.2, z: -1.5, color: '#d4c9b5' },
      { type: 'rug', x: 0, z: 0, color: '#c8b8a0' },
      { type: 'shelf', x: -2.5, z: 1.8, color: '#a09080' },
    ],
    size: { w: 6, d: 5, h: 3.2 }
  },
  bedroom: {
    name: '主卧',
    desc: '微水泥墙面与木质背板结合，内嵌灯带营造悬浮感。步入式衣帽间采用通透玻璃隔断。',
    wall: '#d8d0c4',
    floor: '#b8a890',
    ceiling: '#e8e4dc',
    accent: '#7a6a5a',
    window: true,
    furniture: [
      { type: 'bed', x: 0, z: -1, color: '#c8b8a4' },
      { type: 'nightstand', x: -1.8, z: -0.8, color: '#9a8a7a' },
      { type: 'nightstand', x: 1.8, z: -0.8, color: '#9a8a7a' },
      { type: 'wardrobe', x: 2.5, z: 1.5, color: '#a89888' },
      { type: 'lamp', x: 0, z: 1.5, color: '#d4c9b5' },
    ],
    size: { w: 5, d: 4.5, h: 3 }
  },
  kitchen: {
    name: '厨房',
    desc: 'U 型布局搭配岩板岛台，隐藏式收纳系统让所有器具有序归位。防眩射灯配合感应灯带。',
    wall: '#e0dcd4',
    floor: '#585448',
    ceiling: '#e8e4dc',
    accent: '#4a3a2a',
    window: true,
    furniture: [
      { type: 'counter', x: -2, z: 0, color: '#3a3a3a' },
      { type: 'island', x: 0.5, z: 0, color: '#5a4a3a' },
      { type: 'table', x: 1.5, z: 1.5, color: '#8a7a6a' },
      { type: 'shelf', x: -2.5, z: 1.8, color: '#6a5a4a' },
    ],
    size: { w: 5, d: 4, h: 3 }
  },
  study: {
    name: '书房',
    desc: '整面书墙采用悬浮层板，可调节角度。百叶帘将自然光切割成温柔的光影线条。',
    wall: '#e4ded4',
    floor: '#b8a894',
    ceiling: '#ece8e0',
    accent: '#6a5a4a',
    window: true,
    furniture: [
      { type: 'desk', x: 0, z: -1, color: '#8a7a6a' },
      { type: 'chair', x: 0, z: 0.8, color: '#6a5a4a' },
      { type: 'bookshelf', x: -2.5, z: 0, color: '#a09080' },
      { type: 'lamp', x: -1, z: -0.8, color: '#d4c9b5' },
      { type: 'rug', x: 0, z: 0, color: '#c8b8a0' },
    ],
    size: { w: 5, d: 4, h: 3 }
  }
};

/* ── Module State ─────────────────────────────── */

let currentRoom = 'living';
let scene, camera, renderer, controls;
let roomGroup = new THREE.Group();
let animFrameId = null;
let ready = false;

/* ── Furniture Builders ───────────────────────── */

function createSofa(x, z, color) {
  const group = new THREE.Group();
  const main = new THREE.Mesh(
    new THREE.BoxGeometry(2.0, 0.6, 0.9),
    new THREE.MeshStandardMaterial({ color, roughness: 0.8 })
  );
  main.position.y = 0.3;
  main.castShadow = true;
  group.add(main);
  const back = new THREE.Mesh(
    new THREE.BoxGeometry(2.0, 0.5, 0.2),
    new THREE.MeshStandardMaterial({ color: '#7a6a5a', roughness: 0.7 })
  );
  back.position.set(0, 0.65, -0.45);
  group.add(back);
  group.position.set(x, 0, z);
  return group;
}

function createTable(x, z, color) {
  const g = new THREE.Group();
  const top = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.08, 0.8),
    new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.1 })
  );
  top.position.y = 0.6;
  top.castShadow = true;
  g.add(top);
  for (let dx of [-0.5, 0.5]) {
    for (let dz of [-0.35, 0.35]) {
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 0.55),
        new THREE.MeshStandardMaterial({ color: '#5a4a3a', metalness: 0.3 })
      );
      leg.position.set(dx, 0.275, dz);
      g.add(leg);
    }
  }
  g.position.set(x, 0, z);
  return g;
}

function createBed(x, z, color) {
  const g = new THREE.Group();
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 0.35, 2.2),
    new THREE.MeshStandardMaterial({ color, roughness: 0.9 })
  );
  base.position.y = 0.175;
  base.castShadow = true;
  g.add(base);
  const mattress = new THREE.Mesh(
    new THREE.BoxGeometry(1.7, 0.2, 2.0),
    new THREE.MeshStandardMaterial({ color: '#e8e0d4', roughness: 0.95 })
  );
  mattress.position.y = 0.45;
  g.add(mattress);
  const pillow = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.15, 0.4),
    new THREE.MeshStandardMaterial({ color: '#f0ece4', roughness: 0.95 })
  );
  pillow.position.set(0, 0.6, 0.65);
  g.add(pillow);
  g.position.set(x, 0, z);
  return g;
}

function createNightstand(x, z, color) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.5, 0.45),
    new THREE.MeshStandardMaterial({ color, roughness: 0.6 })
  );
  body.position.y = 0.25;
  body.castShadow = true;
  g.add(body);
  g.position.set(x, 0, z);
  return g;
}

function createWardrobe(x, z, color) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 2.0, 0.6),
    new THREE.MeshStandardMaterial({ color, roughness: 0.5 })
  );
  body.position.y = 1.0;
  body.castShadow = true;
  g.add(body);
  g.position.set(x, 0, z);
  return g;
}

function createLamp(x, z, color) {
  const g = new THREE.Group();
  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.06, 1.2),
    new THREE.MeshStandardMaterial({ color: '#4a3a2a', metalness: 0.5 })
  );
  stem.position.y = 0.6;
  g.add(stem);
  const shade = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.35, 0.3),
    new THREE.MeshStandardMaterial({ color, roughness: 0.7 })
  );
  shade.position.y = 1.3;
  g.add(shade);
  g.position.set(x, 0, z);
  return g;
}

function createShelf(x, z, color) {
  const g = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const shelf = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.04, 0.4),
      new THREE.MeshStandardMaterial({ color, roughness: 0.5 })
    );
    shelf.position.set(0, 0.4 + i * 0.5, 0);
    shelf.castShadow = true;
    g.add(shelf);
  }
  g.position.set(x, 0, z);
  return g;
}

function createRug(x, z, color) {
  const rug = new THREE.Mesh(
    new THREE.PlaneGeometry(2.5, 2),
    new THREE.MeshStandardMaterial({ color, roughness: 0.95, side: THREE.DoubleSide })
  );
  rug.rotation.x = -Math.PI / 2;
  rug.position.set(x, 0.01, z);
  rug.receiveShadow = true;
  return rug;
}

function createCounter(x, z, color) {
  const g = new THREE.Group();
  const top = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.06, 2.5),
    new THREE.MeshStandardMaterial({ color: '#3a3a3a', roughness: 0.3, metalness: 0.2 })
  );
  top.position.y = 0.85;
  top.castShadow = true;
  g.add(top);
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.8, 2.4),
    new THREE.MeshStandardMaterial({ color, roughness: 0.6 })
  );
  base.position.y = 0.4;
  g.add(base);
  g.position.set(x, 0, z);
  return g;
}

function createIsland(x, z, color) {
  const g = new THREE.Group();
  const top = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 0.06, 1.0),
    new THREE.MeshStandardMaterial({ color: '#4a3a2a', roughness: 0.3, metalness: 0.1 })
  );
  top.position.y = 0.85;
  top.castShadow = true;
  g.add(top);
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(1.7, 0.8, 0.9),
    new THREE.MeshStandardMaterial({ color, roughness: 0.6 })
  );
  base.position.y = 0.4;
  g.add(base);
  g.position.set(x, 0, z);
  return g;
}

function createDesk(x, z, color) {
  const g = new THREE.Group();
  const top = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 0.06, 0.7),
    new THREE.MeshStandardMaterial({ color, roughness: 0.4 })
  );
  top.position.y = 0.7;
  top.castShadow = true;
  g.add(top);
  for (let dx of [-0.6, 0.6]) {
    const leg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 0.67),
      new THREE.MeshStandardMaterial({ color: '#5a4a3a', metalness: 0.3 })
    );
    leg.position.set(dx, 0.335, 0);
    g.add(leg);
  }
  g.position.set(x, 0, z);
  return g;
}

function createChair(x, z, color) {
  const g = new THREE.Group();
  const seat = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.08, 0.5),
    new THREE.MeshStandardMaterial({ color, roughness: 0.7 })
  );
  seat.position.y = 0.4;
  g.add(seat);
  const back = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.5, 0.05),
    new THREE.MeshStandardMaterial({ color, roughness: 0.7 })
  );
  back.position.set(0, 0.65, -0.25);
  g.add(back);
  for (let lr of [-1, 1]) {
    const leg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 0.38),
      new THREE.MeshStandardMaterial({ color: '#5a4a3a', metalness: 0.3 })
    );
    leg.position.set(lr * 0.18, 0.19, lr * 0.18);
    g.add(leg);
  }
  g.position.set(x, 0, z);
  return g;
}

function createBookshelf(x, z, color) {
  const g = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    const shelf = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.04, 0.35),
      new THREE.MeshStandardMaterial({ color, roughness: 0.5 })
    );
    shelf.position.set(0, 0.4 + i * 0.45, 0);
    shelf.castShadow = true;
    g.add(shelf);
    // books on shelf
    for (let j = 0; j < 3; j++) {
      const book = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.25, 0.15),
        new THREE.MeshStandardMaterial({
          color: ['#8a7a6a','#c4b8a8','#5a4a3a','#a09080'][j % 4],
          roughness: 0.8
        })
      );
      book.position.set(-0.3 + j * 0.25, 0.4 + i * 0.45 + 0.15, -0.1);
      g.add(book);
    }
  }
  g.position.set(x, 0, z);
  return g;
}

/* ── Furniture Factory ────────────────────────── */

const furnitureBuilders = {
  sofa: createSofa,
  table: createTable,
  bed: createBed,
  nightstand: createNightstand,
  wardrobe: createWardrobe,
  lamp: createLamp,
  shelf: createShelf,
  rug: createRug,
  counter: createCounter,
  island: createIsland,
  desk: createDesk,
  chair: createChair,
  bookshelf: createBookshelf,
};

/* ── Room Builder ─────────────────────────────── */

function buildRoom(roomKey) {
  const cfg = ROOMS[roomKey];
  if (!cfg) return;
  const { w, d, h } = cfg.size;

  const group = new THREE.Group();

  // Floor
  const floorMat = new THREE.MeshStandardMaterial({
    color: cfg.floor, roughness: 0.8, side: THREE.DoubleSide
  });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(w, d), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0, 0);
  floor.receiveShadow = true;
  group.add(floor);

  // Ceiling
  const ceilMat = new THREE.MeshStandardMaterial({
    color: cfg.ceiling, roughness: 0.9, side: THREE.DoubleSide
  });
  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(w, d), ceilMat);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(0, h, 0);
  group.add(ceiling);

  // Walls
  const wallMat = new THREE.MeshStandardMaterial({
    color: cfg.wall, roughness: 0.9, side: THREE.DoubleSide
  });
  const wallPositions = [
    { pos: [0, h / 2, -d / 2], size: [w, h, 0.05] },          // back
    { pos: [0, h / 2, d / 2], size: [w, h, 0.05] },           // front
    { pos: [-w / 2, h / 2, 0], size: [0.05, h, d] },          // left
  ];
  // Right wall - with or without window
  if (cfg.window) {
    wallPositions.push(
      { pos: [w / 2, h * 0.8, -d * 0.2], size: [0.05, h * 0.6, d * 0.35] },
      { pos: [w / 2, h * 0.8, d * 0.2], size: [0.05, h * 0.6, d * 0.35] },
      { pos: [w / 2, h * 0.25, 0], size: [0.05, h * 0.4, d * 0.95] }
    );
  } else {
    wallPositions.push({ pos: [w / 2, h / 2, 0], size: [0.05, h, d] });
  }

  for (const wp of wallPositions) {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(...wp.size), wallMat);
    wall.position.set(...wp.pos);
    wall.castShadow = true;
    wall.receiveShadow = true;
    group.add(wall);
  }

  // Window opening (glass)
  if (cfg.window) {
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: '#a0c0d8',
      transparent: true,
      opacity: 0.25,
      roughness: 0,
      metalness: 0,
      envMapIntensity: 0.5,
    });
    const glass = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, h * 0.55, d * 0.35),
      glassMat
    );
    glass.position.set(w / 2, h * 0.78, 0);
    group.add(glass);
  }

  // Baseboard trim (subtle)
  const trimMat = new THREE.MeshStandardMaterial({
    color: '#a09080', roughness: 0.6
  });
  for (let side of [
    { pos: [0, 0.06, -d / 2 + 0.02], size: [w, 0.1, 0.04] },
    { pos: [-w / 2 + 0.02, 0.06, 0], size: [0.04, 0.1, d] },
  ]) {
    const trim = new THREE.Mesh(new THREE.BoxGeometry(...side.size), trimMat);
    trim.position.set(...side.pos);
    group.add(trim);
  }

  // Furniture
  for (const f of cfg.furniture) {
    const builder = furnitureBuilders[f.type];
    if (builder) {
      const obj = builder(f.x, f.z, f.color);
      group.add(obj);
    }
  }

  return group;
}

/* ── Lighting ─────────────────────────────────── */

function createLights() {
  const lights = new THREE.Group();

  // Ambient
  const ambient = new THREE.AmbientLight(0xffffff, 0.5);
  lights.add(ambient);

  // Main directional (sun through window)
  const directional = new THREE.DirectionalLight(0xfff0e0, 1.2);
  directional.position.set(4, 6, 2);
  directional.castShadow = true;
  directional.shadow.mapSize.width = 1024;
  directional.shadow.mapSize.height = 1024;
  lights.add(directional);

  // Warm fill from opposite side
  const fill = new THREE.DirectionalLight(0xffe0c0, 0.4);
  fill.position.set(-3, 2, -4);
  lights.add(fill);

  // Ceiling warm glow
  const ceilingLight = new THREE.PointLight(0xffe0b0, 0.3, 8);
  ceilingLight.position.set(0, 3.2, 0);
  lights.add(ceilingLight);

  return lights;
}

/* ── Init ─────────────────────────────────────── */

export function initScene(container) {
  const rect = container.getBoundingClientRect();
  const width = rect.width || window.innerWidth;
  const height = rect.height || 600;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a1a);

  // Camera
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 50);
  camera.position.set(5, 4, 6);
  camera.lookAt(0, 1, 0);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  container.appendChild(renderer.domElement);

  // Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 1.2, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 2;
  controls.maxDistance = 12;
  controls.maxPolarAngle = Math.PI / 2.1;
  controls.minPolarAngle = Math.PI / 6;
  controls.update();

  // Lights
  const lights = createLights();
  scene.add(lights);

  // Room group
  scene.add(roomGroup);

  // Build initial room
  roomGroup.add(buildRoom('living'));

  ready = true;

  // Resize handler
  const resizeObserver = new ResizeObserver(() => {
    const r = container.getBoundingClientRect();
    camera.aspect = r.width / r.height;
    camera.updateProjectionMatrix();
    renderer.setSize(r.width, r.height);
  });
  resizeObserver.observe(container);

  // Start animation
  animate();

  return { room: currentRoom };
}

/* ── Room Switching ───────────────────────────── */

export function switchRoom(roomKey) {
  if (!ready || !ROOMS[roomKey] || roomKey === currentRoom) return;

  // Clear old room
  while (roomGroup.children.length > 0) {
    roomGroup.remove(roomGroup.children[0]);
  }

  // Build new room
  const newRoom = buildRoom(roomKey);
  roomGroup.add(newRoom);
  currentRoom = roomKey;

  // Return room info for UI
  return ROOMS[roomKey];
}

/* ── Animation Loop ───────────────────────────── */

function animate() {
  animFrameId = requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

/* ── Cleanup ──────────────────────────────────── */

export function disposeScene() {
  if (animFrameId) cancelAnimationFrame(animFrameId);
  renderer?.dispose();
  scene?.clear();
}

/* ── Exports ──────────────────────────────────── */

export function getRoomData(roomKey) {
  return ROOMS[roomKey] || null;
}

export function getCurrentRoom() {
  return currentRoom;
}
*** End of File
