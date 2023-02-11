import * as THREE from "three";
import { OrbitControls } from "OrbitControls";
import { OBJLoader } from "ObjectLoader";
import { Vector2 } from "three";

// Setting: HTML ID's //
const GRAPHIC_VIEW_ID = "graphic_view";
const OBJ_CNT_ID = "obj_count";
const POPUP_PARTS_WINDOW_ID = "parts_popup";
const POPUP_PARTS_NAME_ID = "popup_part_name";
const POPUP_PARTS_DRATE_ID = "popup_part_drate";

// Setting: Model //
const MODEL_LOC = "models/elantra.obj";
const MODEL_SCALE = 1;

// Setting: canvas size //
const HEIGHT = window.innerHeight;
const WIDTH = window.innerWidth;

// Setting: mesh colors //
const COLOR_DEFAULT = 0x000000;
const COLOR_DAMAGED = 0xFF0000;
const COLOR_SELECTED = 0x00AAFF;

// globals // 
var meshes = []; // here, rendered mesh objects will come in
var damaged_parts = [1, 3]; // TODO: receive damaged parts from the device

// setup //
const canvas = document.querySelector("#"+GRAPHIC_VIEW_ID);
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
    MODEL_LOC,
	// called when resource is loaded
	function ( object ) {
        // Color with default color
        object.traverse( function (mesh) {
            if (mesh.isMesh) {       
                mesh.material = new THREE.MeshBasicMaterial();         
                mesh.material.color = new THREE.Color(COLOR_DEFAULT);
                meshes.push(mesh);
            } 
        });
        for (var i of damaged_parts) {
            object.children[i].material.color = new THREE.Color(COLOR_DAMAGED);
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
raycaster.params.Line.threshold = 0.1;
var last_colored_info;

let onMouseMove = function (event) {
    const mouse = {
        x: (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
        y: -(event.clientY / renderer.domElement.clientHeight) * 2 + 1,
    }
    raycaster.setFromCamera( mouse, camera );
    var intersects = raycaster.intersectObjects(meshes);
    if (intersects.length > 1) {
        if (last_colored_info !== undefined) {
            last_colored_info.object.material.color = last_colored_info.color;
        }
        // Backup previous color
        last_colored_info = {};
        last_colored_info.object = intersects[0].object;
        last_colored_info.color = intersects[0].object.material.color;
        // Assign new color
        intersects[0].object.material.color = new THREE.Color(COLOR_SELECTED);
        // Update HTML informations
        document.getElementById(OBJ_CNT_ID).innerHTML = intersects[0].object.name;   
        document.getElementById(POPUP_PARTS_NAME_ID).innerHTML = intersects[0].object.name;
        document.getElementById(POPUP_PARTS_DRATE_ID).innerHTML = (damaged_parts.includes(meshes.indexOf(intersects[0].object)) ? 100 : 0) + "%"; 
        Object.assign(document.getElementById(POPUP_PARTS_WINDOW_ID).style, {
            left: `${event.clientX}px`,
            top:  `${event.clientY}px`,
            display: "block",
        });
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
    // Unselect all
    if (intersects.length == 0) { 
        if (last_colored_info.object !== undefined)
            last_colored_info.object.material.color = last_colored_info.color;
        last_colored_info = undefined;
        document.getElementById(OBJ_CNT_ID).innerHTML = "None"; 
        
    } 
    // Remove popup
    Object.assign(document.getElementById(POPUP_PARTS_WINDOW_ID).style, {
        left: `${event.clientX}px`,
        top:  `${event.clientY}px`,
        display: "none",
    });
}
canvas.addEventListener('mousemove', onMouseMove);
canvas.addEventListener('mousedown', onMouseClick);

// Scene builder
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();
