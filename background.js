import * as THREE from "three";
import { OrbitControls } from "OrbitControls";

// setup //
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    10000
);

camera.position.set(500, 500, 500);
const controls = new OrbitControls(camera, renderer.domElement);
controls.update();
renderer.render(scene, camera);

/// lighting ///

const light = new THREE.AmbientLight(0xffaaff);
light.position.set(10, 10, 10);
scene.add(light);

/// geometry ///

const boxGeometry = new THREE.Mesh(
    new THREE.BoxGeometry(100, 100, 100),
    new THREE.MeshBasicMaterial({ color: 0xff0000 })
);
scene.add(boxGeometry);

console.log(scene);
animate();

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
