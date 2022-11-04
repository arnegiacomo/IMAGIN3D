"use strict";

import * as THREE from "../libs/three.module.js";
import ThreeMeshUI from '../libs/three-mesh-ui.module.js'
import { GUI } from '../libs/dat.gui.module.js'
import { VRButton } from "../libs/webxr/VRButton.js";
import {OBJLoader} from "../libs/OBJLoader.js";

import TextureSplattingMaterial from "./materials/TextureSplattingMaterial.js";
import TerrainGeometry from "./geometry/TerrainGeometry.js";
import SkyBox from "./objects/SkyBox.js";
import LightSphere from "./objects/LightSphere.js";
import Controls from "./ui/Controls.js";

const canvas = document.querySelector("canvas");
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});

const white = new THREE.Color(THREE.Color.NAMES.white);
renderer.setClearColor(white, 1.0);

const scene = new THREE.Scene();

const controls = new Controls(scene, renderer);
const camera = controls.camera;

// TODO: Move scene creation and management elsewhere
const skybox = new SkyBox();
scene.background = skybox.images;

const axesHelper = new THREE.AxesHelper(1);
scene.add(axesHelper);

const sun = new THREE.DirectionalLight(white, 1.0);
scene.add(sun);

const terrainImage = new Image();
terrainImage.onload = () => {

  const size = 128;
  const height = 5;

  const geometry = new TerrainGeometry(20, 128, 5, terrainImage);

  const grass = new THREE.TextureLoader().load('../assets/images/grass.png');
  const rock = new THREE.TextureLoader().load('../assets/images/rock.png');
  const alphaMap = new THREE.TextureLoader().load('../assets/images/terrain.png');

  grass.wrapS = THREE.RepeatWrapping;
  grass.wrapT = THREE.RepeatWrapping;

  grass.repeat.multiplyScalar(size / 8);

  rock.wrapS = THREE.RepeatWrapping;
  rock.wrapT = THREE.RepeatWrapping;

  rock.repeat.multiplyScalar(size / 8);

  const material = new TextureSplattingMaterial({
    color: THREE.Color.NAMES.white,
    colorMaps: [grass, rock],
    alphaMaps: [alphaMap]
  });

  const mesh = new THREE.Mesh(geometry, material);

  scene.add(mesh);

  // TODO: Non-VR gui using https://sbcode.net/threejs/dat-gui/

  // const gui = new GUI()
  // const meshFolder = gui.addFolder('Mesh')
  // meshFolder.add(mesh.rotation, 'x', 0, Math.PI * 2)
  // meshFolder.add(mesh.rotation, 'y', 0, Math.PI * 2)
  // meshFolder.add(mesh.rotation, 'z', 0, Math.PI * 2)
  // meshFolder.open()

};

terrainImage.src = '../assets/images/terrain.png';

// TODO: VR gui using https://github.com/felixmariotto/three-mesh-ui

makeTextPanel();

// TODO: there three can be moved elsewhere
scene.add(new LightSphere(0.25, THREE.Color.NAMES.white, 1, 10, 3, 5, 3));
scene.add(new LightSphere(0.25, THREE.Color.NAMES.red, 5, 15, -3, 2, -3));
scene.add(new LightSphere(0.25, THREE.Color.NAMES.blue, 10, 3, 4.75, 2, -3));

// TODO: Move object/model loading elsewhere
// instantiate a loader
const loader = new OBJLoader();

// load a resource
loader.load(
    // resource URL
    '../assets/models/tree.obj',
    // called when resource is loaded
    function ( object ) {

      object.position.set( 0.5, 3.5, 0 );
      scene.add( object );

    },
    // called when loading is in progresses
    function ( xhr ) {

      console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

    },
    // called when loading has errors
    function ( error ) {

      console.log( 'An error happened' + error);

    }
);


// TODO: move ui creation/management elsewhere
function makeTextPanel() {

  const container = new ThreeMeshUI.Block( {
    width: 2.4,
    height: 1.0,
    padding: 0.05,
    justifyContent: 'center',
    textAlign: 'left',
    fontFamily: '../assets/three-mesh-ui/Roboto-msdf.json',
    fontTexture: '../assets/three-mesh-ui/Roboto-msdf.png'
  } );

  container.position.set( 0, 4, -2.8 );
  container.rotation.x = -0.55;
  scene.add( container );

  //

  container.add(
      new ThreeMeshUI.Text( {
        content: 'This library supports line-break-friendly-characters,',
        fontSize: 0.055
      } ),

      new ThreeMeshUI.Text( {
        content: ' As well as multi-font-size lines with consistent vertical spacing.',
        fontSize: 0.08
      } )
  );

}

function updateRendererSize() {
  const { x: currentWidth, y: currentHeight } = renderer.getSize(
    new THREE.Vector2()
  );
  const width = renderer.domElement.clientWidth;
  const height = renderer.domElement.clientHeight;

  if (width !== currentWidth || height !== currentHeight) {
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
}

const clock = new THREE.Clock;
clock.start();

function loop() {

  updateRendererSize();

  controls.update(clock.getDelta());

  ThreeMeshUI.update();

  renderer.render(scene, camera);
}

document.body.append(VRButton.createButton(renderer))
renderer.setAnimationLoop(loop);
