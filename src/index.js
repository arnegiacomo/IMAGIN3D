"use strict";

import * as THREE from "../libs/three.module.js";
import {VRButton} from "../libs/webxr/VRButton.js";

import TerrainGeometry from "./scene/terrain/Terrain.js";
import SkyBox from "./scene/objects/SkyBox.js";
import LightSphere from "./scene/objects/LightSphere.js";
import Controls from "./ui/Controls.js";
import GUI from './ui/GUI.js'
import {updateRendererSize} from "./utils.js";
import Ocean from "./scene/water/Ocean.js";
import Fog from "./scene/fog/Fog.js";

const canvas = document.querySelector("canvas");
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
});

// Set clear color
const white = new THREE.Color(THREE.Color.NAMES.white);
renderer.setClearColor(white, 1.0);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

// Create scene // TODO: custom scene init
const scene = new THREE.Scene();

// Add sunlight
const light = new THREE.DirectionalLight( 0xffffff, 1.5 );
light.position.set( 0, 100, 0 ); //default; light shining from top
light.castShadow = true; // default false
var side = 10;
light.shadow.camera.top = side;
light.shadow.camera.bottom = -side;
light.shadow.camera.left = side;
light.shadow.camera.right = -side;
scene.add( light );

//Set up shadow properties for the light
light.shadow.mapSize.width = 1024;
light.shadow.mapSize.height = 1024;
light.shadow.camera.near = 0.1;
light.shadow.camera.far = 1000;

// Create controls and gui
const controls = new Controls(scene, renderer);
const camera = controls.camera;
const gui = new GUI(scene);

const skybox = new SkyBox();
scene.background = skybox.images;

const axesHelper = new THREE.AxesHelper(1);
scene.add(axesHelper);

const terrain = new TerrainGeometry(scene);

const ocean = new Ocean(scene);

const fog = new Fog(scene);

// // TODO: there three can be moved elsewhere
// scene.add(new LightSphere(0.25, THREE.Color.NAMES.white, 1, 10, 3, 5, 3));
// scene.add(new LightSphere(0.25, THREE.Color.NAMES.red, 5, 15, -3, 2, -3));
// scene.add(new LightSphere(0.25, THREE.Color.NAMES.blue, 10, 3, 4.75, 2, -3));

const clock = new THREE.Clock;
clock.start();

function loop() {
    const dt = clock.getDelta();
    updateRendererSize(renderer, camera);

    controls.update(dt);
    gui.update(dt);

    terrain.update(dt);
    ocean.update(dt);

    renderer.render(scene, camera);
}

document.body.append(VRButton.createButton(renderer))
renderer.setAnimationLoop(loop);
