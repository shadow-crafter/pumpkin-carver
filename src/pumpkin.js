import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { Modes } from "./modes";

export class Pumpkin {
  static RADIUS = 10;
  static TEXTURE_SIZE = 512;
  constructor(scene) {
    this.scene = scene;

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
    this.scene.add(mesh);
    return mesh;
  }

  addStem() {
    const loader = new GLTFLoader();
    const stemMaterial = new THREE.MeshStandardMaterial({ color: 0x964b00 });
    loader.load(
      "resources\\models\\pumpkin_stem.glb",
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
    this.mesh.add(inner);
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

  carveAtUV(uv, mode) {
    const x = uv.x * Pumpkin.TEXTURE_SIZE;
    const y = (1 - uv.y) * Pumpkin.TEXTURE_SIZE;

    this.ctx.fillStyle = "white";
    this.ctx.strokeStyle = "white";
    this.ctx.globalCompositeOperation = "destination-out";
    this.ctx.beginPath();
    switch (mode) {
      case Modes.CARVE:
        this.ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        break;
      case Modes.KNIFE:
        this.ctx.arc(x, y, 2, 0, Math.PI);
        break;
      default:
        console.error("Mode not found!");
    }
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.globalCompositeOperation = "source-over";

    this.texture.needsUpdate = true;
  }
}
