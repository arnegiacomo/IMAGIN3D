"use strict";

import * as THREE from "../libs/three.module.js";

/**
 * Loads heightmap data from an image.
 * The image should be loaded before using this method.
 * @param  {HTMLImageElement} image Image to load.
 * @param size Dimensions of image (assume it's a square)
 * @return {Float32Array} A Float32Array containing the heightmap data.
 *
 * Example 4x4 image:
 * 00 05 17 00
 * 02 03 54 00
 * 09 00 79 00
 * 08 00 23 00
 *
 * Output (rounded):
 * [0.0, 0.02, 0.07, 0.0, 0.01, 0.01, 0.21, 0.0, 0.04, 0.0, 0.31, 0.0, 0.03, 0.0, 0.09, 0.0]
 */
export function getHeightmapData(image, size) {
  const canvas = document.createElement("canvas");

  // Assume the image is square:
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext("2d");
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";

  context.drawImage(image, 0, 0, size, size);

  const imageData = context.getImageData(0, 0, size, size).data;

  const data = new Float32Array(size * size);
  for (let i = 0; i < imageData.length; i += 4) {
    data[i / 4] = imageData[i] / 255;
  }

  return data;
}


export function updateRendererSize(renderer, camera) {
  const {x: currentWidth, y: currentHeight} = renderer.getSize(
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

/**
 * Calculates the index in the 'position' attribute for a mesh, given x & y in uv-coords, and size of 'position' array
 * @param x
 * @param y
 * @param size
 * @returns {number}
 */
export function calculateVertexIndex(x, y, size) {
  const xval = Math.round(x * size);
  let yval = Math.round((1-y) * size * size);
  const divs = Math.floor(yval / size);
  yval = divs * size;
  return xval + yval;
}

/**
 * Changes the terrain/mesh at a given point, positive strength increases y-value/height, negative decreases.
 *
 * @param point Intersect point / uv coords of where to change terrain height
 * @param size Size of "brush", amount of vertices to increase value of from point // TODO: implement this?
 * @param strength Brush strength, positive increases terrain height, negative decreases
 * @param dt DT from update loop
 * @param mesh Mesh to be brushed
 */
export function terrainBrush(point, size, strength, dt, mesh) {
  // Calculate corresponding vertex location from uv coords at intersect point
  const idx = calculateVertexIndex(point.x, point.y, mesh.size);

  // for (let i = 0; i < size; i++) {
  //   mesh.geometry.attributes.position.setY(idx+i, mesh.geometry.attributes.position.getY(idx+i) + dt * strength);
  //   mesh.geometry.attributes.position.setY(idx-i, mesh.geometry.attributes.position.getY(idx-i) + dt * strength);
  //   mesh.geometry.attributes.position.setY(idx-(mesh.size*i), mesh.geometry.attributes.position.getY(idx-(mesh.size*i)) + dt * strength);
  //   mesh.geometry.attributes.position.setY(idx+(mesh.size*i), mesh.geometry.attributes.position.getY(idx+(mesh.size*i)) + dt * strength);
  // }

  // TODO: Has constant brush size of 3. Fix this? Tip: recursion or clever algorithm
  // Size 1
  mesh.geometry.attributes.position.setY(idx, mesh.geometry.attributes.position.getY(idx) + dt * strength);

  // Size 2
  mesh.geometry.attributes.position.setY(idx, mesh.geometry.attributes.position.getY(idx) + dt * strength);
  if (idx >= 1) mesh.geometry.attributes.position.setY(idx-1, mesh.geometry.attributes.position.getY(idx-1) + dt * strength);
  if (idx < mesh.size*mesh.size) mesh.geometry.attributes.position.setY(idx+1, mesh.geometry.attributes.position.getY(idx+1) + dt * strength);
  if (idx >= 128) mesh.geometry.attributes.position.setY(idx-128, mesh.geometry.attributes.position.getY(idx-128) + dt * strength);
  if (idx <= mesh.size*mesh.size - 128) mesh.geometry.attributes.position.setY(idx+128, mesh.geometry.attributes.position.getY(idx+128) + dt * strength);

  // Size 3
  mesh.geometry.attributes.position.setY(idx, mesh.geometry.attributes.position.getY(idx) + dt * strength);
  if (idx >= 1) mesh.geometry.attributes.position.setY(idx-1, mesh.geometry.attributes.position.getY(idx-1) + dt * strength);
  if (idx >= 2) mesh.geometry.attributes.position.setY(idx-2, mesh.geometry.attributes.position.getY(idx-2) + dt * strength);
  if (idx < mesh.size*mesh.size) mesh.geometry.attributes.position.setY(idx+1, mesh.geometry.attributes.position.getY(idx+1) + dt * strength);
  if (idx < mesh.size*mesh.size-1) mesh.geometry.attributes.position.setY(idx+2, mesh.geometry.attributes.position.getY(idx+2) + dt * strength);
  if (idx >= 127) mesh.geometry.attributes.position.setY(idx-127, mesh.geometry.attributes.position.getY(idx-127) + dt * strength);
  if (idx >= 128) mesh.geometry.attributes.position.setY(idx-128, mesh.geometry.attributes.position.getY(idx-128) + dt * strength);
  if (idx >= 129) mesh.geometry.attributes.position.setY(idx-129, mesh.geometry.attributes.position.getY(idx-129) + dt * strength);
  if (idx >= 256) mesh.geometry.attributes.position.setY(idx-256, mesh.geometry.attributes.position.getY(idx-256) + dt * strength);
  if (idx <= mesh.size*mesh.size - 127) mesh.geometry.attributes.position.setY(idx+127, mesh.geometry.attributes.position.getY(idx+127) + dt * strength);
  if (idx <= mesh.size*mesh.size - 128) mesh.geometry.attributes.position.setY(idx+128, mesh.geometry.attributes.position.getY(idx+128) + dt * strength);
  if (idx <= mesh.size*mesh.size - 129) mesh.geometry.attributes.position.setY(idx+129, mesh.geometry.attributes.position.getY(idx+129) + dt * strength);
  if (idx <= mesh.size*mesh.size - 256) mesh.geometry.attributes.position.setY(idx+256, mesh.geometry.attributes.position.getY(idx+256) + dt * strength);

  mesh.geometry.attributes.position.needsUpdate = true;

  // Update grass closest to mesh point
  const grassidx = calculateGrassIndex(point.x, point.y, mesh.grassSize);
  const grass = mesh.grassArray[grassidx];
  grass.translateY(dt*strength);

  grass.visible = !(grass.position.y < 0.2 || grass.position.y > 3);

}

export function calculateGrassIndex(x, y, size) {
  const xval = Math.round(x * size);
  let yval = Math.round( (1-y) * size * size);
  const divs = Math.floor(yval / size);
  yval = divs * size;
  return xval + yval;
}