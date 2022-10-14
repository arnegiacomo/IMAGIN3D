"use strict";

import * as THREE from "./three.module.js";

import { getHeightmapData } from "./utils.js";
import TextureSplattingMaterial from "./TextureSplattingMaterial.js";

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("canvas"),
  antialias: true,
});

const white = new THREE.Color(THREE.Color.NAMES.white);
renderer.setClearColor(white, 1.0);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
camera.position.z += 10;
camera.position.x += 10;
camera.position.y += 10;

camera.lookAt(0, 0, 0);

scene.add(camera);

const axesHelper = new THREE.AxesHelper(1);
scene.add(axesHelper);

const sun = new THREE.DirectionalLight(white, 1.0);
scene.add(sun);

class TerrainGeometry extends THREE.PlaneGeometry {
  constructor(size, resolution, height, image) {
    super(size, size, resolution - 1, resolution - 1);

    this.rotateX((Math.PI / 180) * -90);

    const data = getHeightmapData(image, resolution);

    for (let i = 0; i < data.length; i++) {
      this.attributes.position.setY(i, data[i] * height);
    }
  }
}

const terrainImage = new Image();
terrainImage.onload = () => {

  const size = 128;
  const height = 5;

  const geometry = new TerrainGeometry(20, 128, 5, terrainImage);

  const grass = new THREE.TextureLoader().load('images/grass.png');
  const rock = new THREE.TextureLoader().load('images/rock.png');
  const alphaMap = new THREE.TextureLoader().load('images/terrain.png');

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

};

terrainImage.src = 'images/terrain.png';


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
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(loop);
