import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const showHelpers = true;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 25;

const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

const pumpkinGeometry = new THREE.SphereGeometry(10, 16, 12);
const pumpkinMaterial = new THREE.MeshStandardMaterial({ color: 0xff7518 });
const pumpkinSphere = new THREE.Mesh(pumpkinGeometry, pumpkinMaterial);

const stemGeometry = new THREE.CylinderGeometry(1.5, 3, 9, 12);
const stemMaterial = new THREE.MeshStandardMaterial({ color: 0x964b00 });
const stemCylinder = new THREE.Mesh(stemGeometry, stemMaterial);
stemCylinder.position.y = 10;
scene.add(pumpkinSphere, stemCylinder);

const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(2.5, 2.5, 0);
scene.add(pointLight);

if (showHelpers) {
  const lightHelper = new THREE.PointLightHelper(pointLight);
  const gridHelper = new THREE.GridHelper(200, 50);
  scene.add(lightHelper, gridHelper);
}

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(ambientLight);

const controls = new OrbitControls(camera, renderer.domElement);

function animate() {
  pumpkinSphere.rotation.y += 0.01;

  controls.update();
  renderer.render(scene, camera);
}
