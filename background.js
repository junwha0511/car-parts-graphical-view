import * as THREE from "three";
import { OrbitControls } from "OrbitControls";
import { OBJLoader } from "ObjectLoader";

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

// const boxGeometry = new THREE.Mesh(
//     new THREE.BoxGeometry(100, 100, 100),
//     new THREE.MeshBasicMaterial({ color: 0xff0000 })
// );
// scene.add(boxGeometry);

const loader = new OBJLoader();
loader.load(
	// resource URL
	'models/elantra.obj',
	// called when resource is loaded
	function ( object ) {
        console.log(object.children[0]);
        var meshes = [];
        object.traverse( function (mesh) {
            if (mesh.isMesh) {       
                mesh.material = new THREE.MeshBasicMaterial();         
                mesh.material.color = new THREE.Color(0x000000);
                meshes.push(mesh);
            } 
        });
        // object.children[0].color.set(0xFFB6C1);

        object.scale.set(100, 100, 100);
        scene.add( object );

        function changeColor(n, defaultColor, color, t) {
            meshes[n].material.color = new THREE.Color(color);
            setTimeout(function(){
                meshes[n].material.color = new THREE.Color(defaultColor);
                changeColor((n+1)%(object.children.length-1), defaultColor, color, t);
            }, t);
        }
		
        changeColor(0, 0x000000, 0x00FFFF, 1000);
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

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();
