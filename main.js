import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/Addons.js";

const SHOW_HELPERS = false;
const ROTATE_SPEED = 0.05;
const SMOOTHING = 0.085;

let scene, camera, renderer, raycaster, mouse;
let pumpkin;
let targetRotation = 0;
let isDrawing = false;

//put pumpkin-specific constants in here?
class Pumpkin {
  static RADIUS = 10;
  static TEXTURE_SIZE = 512;
  constructor() {
    this.canvas = document.createElement("canvas");
    this.canvas.width = Pumpkin.TEXTURE_SIZE;
    this.canvas.height = Pumpkin.TEXTURE_SIZE;
    this.ctx = this.canvas.getContext("2d");
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.fillPumpkinTexture();

    this.mesh = this.createPumpkinMesh();
    this.addStem();
    this.addInnerSphere();
  }

  createPumpkinMesh() {
    const material = new THREE.MeshStandardMaterial({
      color: 0xff7518,
      map: this.texture,
      transparent: true,
      opacity: 1,
      side: THREE.DoubleSide,
    });
    const geometry = new THREE.SphereGeometry(Pumpkin.RADIUS, 25, 25);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.y = (Math.PI * 3) / 2;
    scene.add(mesh);
    return mesh;
  }

  addStem() {
    const loader = new GLTFLoader();
    const stemMaterial = new THREE.MeshStandardMaterial({ color: 0x964b00 });
    loader.load(
      "models\\pumpkin_stem.glb",
      (gltf) => {
        gltf.scene.traverse((child) => {
          if (child.isMesh) {
            child.material = stemMaterial;
          }
        });
        this.mesh.add(gltf.scene);
      },
      undefined,
      (error) => console.error(error)
    );
  }

  addInnerSphere() {
    const geometry = new THREE.SphereGeometry(Pumpkin.RADIUS - 0.5, 25, 25);
    const material = new THREE.MeshStandardMaterial({
      color: 0x000000,
      side: THREE.DoubleSide,
    });
    const inner = new THREE.Mesh(geometry, material);
    scene.add(inner);
  }

  fillPumpkinTexture() {
    this.ctx.fillStyle = "#FF7518";
    this.ctx.fillRect(0, 0, Pumpkin.TEXTURE_SIZE, Pumpkin.TEXTURE_SIZE);

    const scale = Pumpkin.TEXTURE_SIZE / (2 * Pumpkin.RADIUS);
    const lineCount = 8;
    const offset = Pumpkin.TEXTURE_SIZE / lineCount;
    const centerY = Pumpkin.TEXTURE_SIZE / 2;

    this.ctx.strokeStyle = "#96450fff";
    this.ctx.lineWidth = 2;
    for (let i = 0; i < lineCount; i++) {
      const x = i * offset + offset / 2;
      const startY = centerY - Pumpkin.RADIUS * scale;
      const endY = centerY + Pumpkin.RADIUS * scale;

      this.ctx.beginPath();
      this.ctx.moveTo(x, startY);
      this.ctx.lineTo(x, endY);
      this.ctx.stroke();
    }
  }

  carveAtUV(uv) {
    const x = uv.x * Pumpkin.TEXTURE_SIZE;
    const y = (1 - uv.y) * Pumpkin.TEXTURE_SIZE;

    this.ctx.fillStyle = "white";
    this.ctx.strokeStyle = "white";
    this.ctx.globalCompositeOperation = "destination-out";
    this.ctx.beginPath();
    this.ctx.arc(x, y, 2.5, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.globalCompositeOperation = "source-over";

    this.texture.needsUpdate = true;
  }
}

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 25;

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animate);
  document.body.appendChild(renderer.domElement);

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  pumpkin = new Pumpkin();

  addLights();
  addEventListeners();
}

function addLights() {
  const pointLight = new THREE.PointLight(0xffffff, 250);
  pointLight.position.set(2, 9, 15);
  scene.add(pointLight);

  if (SHOW_HELPERS) {
    scene.add(new THREE.PointLightHelper(pointLight));
    scene.add(new THREE.GridHelper(200, 50));
  }

  scene.add(new THREE.AmbientLight(0xffffff, 0.2));
}

function addEventListeners() {
  window.addEventListener("wheel", onScrollWheel, false);
  window.addEventListener("mousedown", onMouseDown, false);
  window.addEventListener("mouseup", onMouseUp, false);
  window.addEventListener("mousemove", onMouseMove, false);
}

function animate() {
  if (pumpkin && pumpkin.mesh) {
    pumpkin.mesh.rotation.y +=
      (targetRotation - pumpkin.mesh.rotation.x) * ROTATE_SPEED;
    if (Math.abs(targetRotation) < SMOOTHING) {
      targetRotation = 0;
    } else {
      targetRotation += targetRotation > 0 ? -SMOOTHING : SMOOTHING;
    }
  }
  renderer.render(scene, camera);
}

function onScrollWheel(event) {
  targetRotation += event.deltaY * 0.01;
  targetRotation = Math.max(
    -Math.PI / 2,
    Math.min(Math.PI / 2, targetRotation)
  );
}

function onMouseDown(event) {
  isDrawing = true;
  updateMousePos(event);
  drawOnPumpkin();
}

function onMouseUp() {
  isDrawing = false;
}

function onMouseMove(event) {
  if (isDrawing) {
    updateMousePos(event);
    drawOnPumpkin();
  }
}

function updateMousePos(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

function drawOnPumpkin() {
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(pumpkin.mesh);

  if (intersects.length > 0) {
    pumpkin.carveAtUV(intersects[0].uv);
  }
}

init();
