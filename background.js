import * as THREE from "three";
import { OrbitControls } from "OrbitControls";
import { OBJLoader } from "ObjectLoader";
import { Vector2 } from "three";

const GRAPHIC_VIEW_ID = "#graphic_view";
const HEIGHT = window.innerHeight;
const WIDTH = window.innerWidth;
const MODEL_SCALE = 1;

// globals // 
var meshes = [];
var damaged_parts = [1, 3];
// setup //
const canvas = document.querySelector(GRAPHIC_VIEW_ID);
const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true});
renderer.setSize(WIDTH, HEIGHT);
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    45,
    WIDTH/HEIGHT,
    1,
    10000
);
camera.position.set(10, 10, 10);
const controls = new OrbitControls(camera, renderer.domElement);
controls.update();
renderer.render(scene, camera);

/// lighting ///
const light = new THREE.AmbientLight(0xffaaff);
light.position.set(10, 10, 10);
scene.add(light);

/// geometry ///
const loader = new OBJLoader();
loader.load(
	// resource URL
	'models/elantra.obj',
	// called when resource is loaded
	function ( object ) {
        object.traverse( function (mesh) {
            if (mesh.isMesh) {       
                mesh.material = new THREE.MeshBasicMaterial();         
                mesh.material.color = new THREE.Color(0x000000);
                meshes.push(mesh);
            } 
        });
        for (var i of damaged_parts) {
            object.children[i].material.color = new THREE.Color(0xFF0000);
        }
        object.scale.set(MODEL_SCALE, MODEL_SCALE, MODEL_SCALE);
        scene.add( object );
	},
	// called when loading is in progresses
	function ( xhr ) {
		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
	},
	// called when loading has errors
	function ( error ) {
        console.log(error);
	}
);
// Ray casting
const raycaster = new THREE.Raycaster();
var last_colored_info;

let onMouseMove = function (event) {
    const mouse = {
        x: (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
        y: -(event.clientY / renderer.domElement.clientHeight) * 2 + 1,
    }
    raycaster.setFromCamera( mouse, camera );
    var intersects = raycaster.intersectObjects(meshes);

    if (intersects.length > 1) {
        // console.log(intersects);
        if (last_colored_info !== undefined) {
            last_colored_info.object.material.color = last_colored_info.color;
        }
        last_colored_info = {};
        last_colored_info.object = intersects[0].object;
        last_colored_info.color = intersects[0].object.material.color;
        intersects[0].object.material.color = new THREE.Color(0x00AAFF);
        document.getElementById("obj_count").innerHTML = intersects[0].object.name;   
    }
    renderer.render(scene, camera);
}
let onMouseClick = function (event) {
    const mouse = {
        x: (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
        y: -(event.clientY / renderer.domElement.clientHeight) * 2 + 1,
    }
    raycaster.setFromCamera( mouse, camera );
    var intersects = raycaster.intersectObjects(meshes);
    console.log(intersects);
    console.log(raycaster.far);
    if (intersects.length == 0) {
        last_colored_info.object.material.color = last_colored_info.color;
        last_colored_info = undefined;
        document.getElementById("obj_count").innerHTML = "None";   
    }
}
canvas.addEventListener('mousemove', onMouseMove);
canvas.addEventListener('mousedown', onMouseClick);
// Scene builder
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();
