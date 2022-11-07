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
