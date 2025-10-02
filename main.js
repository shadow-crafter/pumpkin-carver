import * as THREE from "three";

const showHelpers = true;

const rotateSpeed = 0.05;
const smoothing = 0.085;
let targetRot = 0;

let scene, camera, renderer;
let pumpkinSphere;

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

  /* Add pumpkin */
  const pumpkinGeometry = new THREE.SphereGeometry(10, 16, 12);
  const pumpkinMaterial = new THREE.MeshStandardMaterial({ color: 0xff7518 });
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
}

function animate() {
  pumpkinSphere.rotation.y += (targetRot - pumpkinSphere.rotation.x) * rotateSpeed;
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
