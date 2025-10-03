import * as THREE from "three";
import { ThreeMFLoader } from "three/examples/jsm/Addons.js";
import { context } from "three/tsl";

const showHelpers = true;

const rotateSpeed = 0.05;
const smoothing = 0.085;
let targetRot = 0;
let isDrawing = false;

let scene, camera, renderer, raycaster, mouse;
let pumpkinSphere, pumpkinCanvas, pumpkinContext, pumpkinTexture;

init();

function init() {
  /* Setup */
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

  /* Add pumpkin */
  const pumpkinGeometry = new THREE.SphereGeometry(10, 16, 12);
  pumpkinCanvas = document.createElement("canvas");
  pumpkinContext = pumpkinCanvas.getContext("2d");
  pumpkinCanvas.width = 512;
  pumpkinCanvas.height = 512;
  pumpkinTexture = new THREE.CanvasTexture(pumpkinCanvas);
  //const pumpkinMaterial = new THREE.MeshStandardMaterial({ color: 0xff7518 });
  const pumpkinMaterial = new THREE.MeshStandardMaterial({
    map: pumpkinTexture,
  });
  pumpkinSphere = new THREE.Mesh(pumpkinGeometry, pumpkinMaterial);

  const stemGeometry = new THREE.CylinderGeometry(1.5, 3, 9, 12);
  const stemMaterial = new THREE.MeshStandardMaterial({ color: 0x964b00 });
  const stemCylinder = new THREE.Mesh(stemGeometry, stemMaterial);
  stemCylinder.position.y = 10;
  stemCylinder.rotation.x = Math.PI / 10;
  pumpkinSphere.add(stemCylinder);
  scene.add(pumpkinSphere);

  /* Add light and helpers */
  const pointLight = new THREE.PointLight(0xffffff, 150);
  pointLight.position.set(11, 11, 11);
  scene.add(pointLight);

  if (showHelpers) {
    const lightHelper = new THREE.PointLightHelper(pointLight);
    scene.add(lightHelper);
    const gridHelper = new THREE.GridHelper(200, 50);
    //scene.add(gridHelper);
  }

  const ambientLight = new THREE.AmbientLight(0xffffff);
  scene.add(ambientLight);

  /* Connect event listeners */
  window.addEventListener("wheel", onScrollWheel, false);
  window.addEventListener("mousedown", onMouseDown, false);
  window.addEventListener("mouseup", onMouseUp, false);
  window.addEventListener("mousemove", onMouseMove, false);
}

function animate() {
  pumpkinSphere.rotation.y +=
    (targetRot - pumpkinSphere.rotation.x) * rotateSpeed;
  if (Math.abs(targetRot) < smoothing) {
    targetRot = 0;
  } else {
    targetRot += targetRot > 0 ? -smoothing : smoothing;
  }

  renderer.render(scene, camera);
}

function onScrollWheel(event) {
  targetRot += event.deltaY * 0.01;
  targetRot = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, targetRot));
}

function onMouseDown() {
  isDrawing = true;
  drawOnSphere();
}

function onMouseUp() {
  isDrawing = false;
}

function onMouseMove(event) {
  if (isDrawing) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    drawOnSphere();
  }
}

function drawOnSphere() {
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(pumpkinSphere);

  if (intersects.length > 0) {
    const intersectionPoint = intersects[0].point;
    console.log(
      `Intersection point: (${intersectionPoint.x}, ${intersectionPoint.y})`
    );

    const uv = intersects[0].uv;

    const canvasX = uv.x * pumpkinCanvas.width;
    const canvasY = (1 - uv.y) * pumpkinCanvas.height;

    pumpkinContext.fillStyle = "red";
    pumpkinContext.beginPath();
    pumpkinContext.arc(canvasX, canvasY, 5, 0, Math.PI / 2);
    pumpkinContext.fill();

    pumpkinTexture.needsUpdate = true;
  }
}
