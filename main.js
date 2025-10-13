import * as THREE from "three";
import { Pumpkin } from "./src/pumpkin";

const ROTATE_SPEED = 0.05;
const SMOOTHING = 0.085;

let scene, camera, renderer, raycaster, mouse;
let pointLight, pointLightHelper;
let gridHelper;
let pumpkin;

let isDrawing = false;
let showHelpers = false;
let targetRotation = 0;

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 25;
  camera.position.y = 10;
  camera.rotation.x = -Math.PI / 8;

  const canvas = document.getElementById("c");

  renderer = new THREE.WebGLRenderer({ canvas: canvas });
  renderer.setPixelRatio(window.devicePixelRatio);
  onWindowResize();
  renderer.setAnimationLoop(animate);

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  pumpkin = new Pumpkin(scene);
  pumpkin.mesh.position.y = -2.5;

  addLights();
  addEventListeners();
}

function addLights() {
  pointLight = new THREE.PointLight(0xffffff, 250);
  pointLight.position.set(2, 9, 15);
  scene.add(pointLight);

  scene.add(new THREE.AmbientLight(0xffffff, 0.2));
}

function updateHelpers() {
  if (showHelpers) {
    pointLightHelper = new THREE.PointLightHelper(pointLight);
    gridHelper = new THREE.GridHelper(200, 50);
    scene.add(pointLightHelper);
    scene.add(gridHelper);
  } else {
    scene.remove(pointLightHelper, gridHelper);
  }
}

function addEventListeners() {
  window.addEventListener("resize", onWindowResize, false);
  window.addEventListener("wheel", onScrollWheel, false);
  window.addEventListener("mousedown", onMouseDown, false);
  window.addEventListener("mouseup", onMouseUp, false);
  window.addEventListener("mousemove", onMouseMove, false);
  window.addEventListener("keypress", onKeyPress, false);
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

function onWindowResize() {
  const titleCard = document.getElementById("title-card");
  const canvas = renderer.domElement;
  const height = window.innerHeight - titleCard.offsetHeight;
  camera.aspect = window.innerWidth / height;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, height);
  canvas.style.height = height + "px";
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

function onKeyPress(event) {
  if (event.key === "`") {
    showHelpers = !showHelpers;
    updateHelpers();
  }
}

function drawOnPumpkin() {
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(pumpkin.mesh);

  if (intersects.length > 0) {
    pumpkin.carveAtUV(intersects[0].uv);
  }
}

init();
