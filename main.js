import * as THREE from "three";
import { Modes } from "./src/modes";
import { Pumpkin } from "./src/pumpkin";

const ROTATE_SPEED = 0.05;
const SMOOTHING = 0.085;

let scene, camera, renderer, raycaster, mouse;
let keyLight, keyLightHelper;
let backLight, backLightHelper;
let gridHelper;
let pumpkin;

let isDrawing = false;
let mode = Modes.CARVE;
let showHelpers = false;
let targetRotation = 0;

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );
  camera.position.z = 25;
  camera.position.y = 10;
  camera.rotation.x = -Math.PI / 8;

  const canvas = document.getElementById("c");

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: canvas,
  });
  renderer.setClearColor(0xb24fe0);
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
  keyLight = new THREE.PointLight(0xffc0a1, 250);
  keyLight.position.set(2, 9, 15);
  scene.add(keyLight);

  backLight = new THREE.DirectionalLight(0xa349a4, 10);
  backLight.position.set(10, 1, -8);
  backLight.target.position.set(0, 0, 5);
  scene.add(backLight);

  scene.add(new THREE.AmbientLight(0xffffff, 0.8));
}

function updateHelpers() {
  if (showHelpers) {
    keyLightHelper = new THREE.PointLightHelper(keyLight);
    backLightHelper = new THREE.DirectionalLightHelper(backLight);
    gridHelper = new THREE.GridHelper(200, 50);
    scene.add(keyLightHelper, backLightHelper);
    scene.add(gridHelper);
  } else {
    scene.remove(keyLightHelper, backLightHelper);
    scene.remove(gridHelper);
  }
}

function addEventListeners() {
  window.addEventListener("resize", onWindowResize, false);
  window.addEventListener("wheel", onScrollWheel, false);
  window.addEventListener("mousedown", onMouseDown, false);
  window.addEventListener("mouseup", onMouseUp, false);
  window.addEventListener("mousemove", onMouseMove, false);
  window.addEventListener("keypress", onKeyPress, false);

  const modeButtons = document
    .getElementById("tools")
    .querySelectorAll("button");
  modeButtons.forEach((button) => {
    console.log(button);
    if (button.id === "screenshot-button") {
      return;
    }
    button.addEventListener("click", onModeButtonClicked.bind(null, button.id));
  });

  const screenshotButton = document.getElementById("screenshot-button");
  screenshotButton.addEventListener("click", onScreenshotClicked);
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
    Math.min(Math.PI / 2, targetRotation),
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
  switch (event.key) {
    case "`":
      showHelpers = !showHelpers;
      updateHelpers();
      break;
    case "1":
      mode = Modes.CARVE;
      break;
    case "2":
      mode = Modes.KNIFE;
      break;
    case "3":
      mode = Modes.FILLER;
      break;
    case "4":
      mode = Modes.ERASER;
      break;
    case "5":
      onScreenshotClicked();
      break;
  }
  updateSelected();
}

function onModeButtonClicked(selected) {
  mode = Modes[selected.toUpperCase()];
  updateSelected();
}

function updateSelected() {
  let selected = document.querySelector(".selected");
  selected.classList.remove("selected");
  selected = document.getElementById(mode);
  selected.classList.add("selected");
}

function onScreenshotClicked() {
  renderer.render(scene, camera);

  const canvas = renderer.domElement;
  const dataURL = canvas.toDataURL("images/png");
  const link = document.createElement("a");
  link.href = dataURL;
  link.download = "pumpkin_screenshot.png";
  link.click();
}

function drawOnPumpkin() {
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(pumpkin.mesh);

  if (intersects.length > 0) {
    pumpkin.carveAtUV(intersects[0].uv, mode);
  }
}

init();
