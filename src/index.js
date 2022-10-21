"use strict";

import * as THREE from "../libs/three.module.js";
import ThreeMeshUI from '../libs/three-mesh-ui.module.js'
import { GUI } from '../libs/dat.gui.module.js'
import { VRButton } from "../libs/webxr/VRButton.js";

import TextureSplattingMaterial from "./materials/TextureSplattingMaterial.js";
import TerrainGeometry from "./geometry/TerrainGeometry.js";
import { OrbitControls } from "../libs/controls/OrbitControls.js";
import SkyBox from "./objects/SkyBox.js";
import LightSphere from "./objects/LightSphere.js";

const canvas = document.querySelector("canvas");
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});

const white = new THREE.Color(THREE.Color.NAMES.white);
renderer.setClearColor(white, 1.0);

renderer.xr.enabled = true;

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
const controls = new OrbitControls( camera, renderer.domElement );

camera.position.z += 10;
camera.position.x += 10;
camera.position.y += 10;

camera.lookAt(0, 0, 0);

controls.update();

scene.add(camera);

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
scene.add(new LightSphere(0.25, THREE.Color.NAMES.white, 1, 10, 3, 5, 3));
scene.add(new LightSphere(0.25, THREE.Color.NAMES.red, 5, 15, -3, 2, -3));
scene.add(new LightSphere(0.25, THREE.Color.NAMES.blue, 10, 3, 4.75, 2, -3));


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

function loop() {
  updateRendererSize();

  controls.update();

  ThreeMeshUI.update();

  renderer.render(scene, camera);
}

document.body.append(VRButton.createButton(renderer))
renderer.setAnimationLoop(loop);
