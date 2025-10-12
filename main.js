import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/Addons.js";

const showHelpers = false;

const rotateSpeed = 0.05;
const smoothing = 0.085;
let targetRot = 0;
let isDrawing = false;

let scene, camera, renderer, raycaster, mouse;
let pumpkinSphere, pumpkinCanvas, pumpkinContext, pumpkinTexture;
let pumpkinStem;

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
  pumpkinCanvas = document.createElement("canvas");
  pumpkinCanvas.width = 512;
  pumpkinCanvas.height = 512;
  pumpkinContext = pumpkinCanvas.getContext("2d");
  fillPumpkin();
  pumpkinTexture = new THREE.CanvasTexture(pumpkinCanvas);
  const pumpkinMaterial = new THREE.MeshStandardMaterial({
    color: 0xff7518,
    map: pumpkinTexture,
    transparent: true,
    opacity: 1,
    side: THREE.DoubleSide,
  });
  const stemMaterial = new THREE.MeshStandardMaterial({
    color: 0x964b00,
  });

  const pumpkinGeometry = new THREE.SphereGeometry(10, 25, 25);
  pumpkinSphere = new THREE.Mesh(
    pumpkinGeometry,
    pumpkinMaterial
  );
  scene.add(pumpkinSphere);

  const loader = new GLTFLoader();
  //load pumpkin stem
  loader.load(
    "models\\pumpkin_stem.glb",
    function (gltf) {
      pumpkinStem = gltf.scene;

      pumpkinStem.traverse((child) => {
        if (child.isMesh) {
          child.material = stemMaterial;
        }
      });

      pumpkinSphere.add(pumpkinStem);
    },
    undefined,
    function (error) {
      console.error(error);
    }
  );

  //add inner sphere
  const innerPumpkinGeometry = new THREE.SphereGeometry(9.5, 16, 12);
  const innerPumpkinMaterial = new THREE.MeshStandardMaterial({
    color: 0x000000,
    side: THREE.DoubleSide,
  });
  const innerPumpkinSphere = new THREE.Mesh(
    innerPumpkinGeometry,
    innerPumpkinMaterial
  );
  scene.add(innerPumpkinSphere);

  /* Add light and helpers */
  const pointLight = new THREE.PointLight(0xffffff, 250);
  pointLight.position.set(2, 9, 15);
  scene.add(pointLight);

  if (showHelpers) {
    const lightHelper = new THREE.PointLightHelper(pointLight);
    scene.add(lightHelper);
    const gridHelper = new THREE.GridHelper(200, 50);
    scene.add(gridHelper);
  }

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
  scene.add(ambientLight);

  /* Connect event listeners */
  window.addEventListener("wheel", onScrollWheel, false);
  window.addEventListener("mousedown", onMouseDown, false);
  window.addEventListener("mouseup", onMouseUp, false);
  window.addEventListener("mousemove", onMouseMove, false);
}

function animate() {
  if (pumpkinSphere) {
    pumpkinSphere.rotation.y +=
      (targetRot - pumpkinSphere.rotation.x) * rotateSpeed;
    if (Math.abs(targetRot) < smoothing) {
      targetRot = 0;
    } else {
      targetRot += targetRot > 0 ? -smoothing : smoothing;
    }
  }
  renderer.render(scene, camera);
}

function fillPumpkin() {
  pumpkinContext.fillStyle = "#FF7518";
  pumpkinContext.fillRect(0, 0, pumpkinCanvas.width, pumpkinCanvas.height);

  const radius = 10;
  const scale = pumpkinCanvas.width / (2 * radius);
  const lineCount = 8;
  const offset = pumpkinCanvas.width / lineCount;
  const centerY = pumpkinCanvas.height / 2;

  pumpkinContext.strokeStyle = "#96450fff";
  pumpkinContext.lineWidth = 2;
  for (let i = 0; i < lineCount; i++) {
    const xCord = i * offset + offset / 2;
    const startY = centerY - radius * scale;
    const endY = centerY + radius * scale;

    pumpkinContext.beginPath();
    pumpkinContext.moveTo(xCord, startY);
    pumpkinContext.lineTo(xCord, endY);
    pumpkinContext.stroke();
  }
}

function onScrollWheel(event) {
  targetRot += event.deltaY * 0.01;
  targetRot = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, targetRot));
}

function onMouseDown(event) {
  isDrawing = true;
  updateMousePos(event);
  drawOnSphere();
}

function onMouseUp() {
  isDrawing = false;
}

function updateMousePos(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

function onMouseMove(event) {
  if (isDrawing) {
    updateMousePos(event);
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

    //pumpkinContext.fillStyle = "black";
    //pumpkinContext.strokeStyle = "black";
    pumpkinContext.fillStyle = "white";
    pumpkinContext.strokeStyle = "white";
    pumpkinContext.globalCompositeOperation = "destination-out";
    pumpkinContext.beginPath();
    pumpkinContext.arc(canvasX, canvasY, 5, 0, Math.PI / 2);
    pumpkinContext.fill();
    pumpkinContext.stroke();
    pumpkinContext.globalCompositeOperation = "source-over";

    pumpkinTexture.needsUpdate = true;
  }
}
