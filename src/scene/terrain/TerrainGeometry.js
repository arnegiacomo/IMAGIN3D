"use strict";

import * as THREE from "../../../libs/three.module.js";
import {getHeightmapData} from "../../utils.js";

export default class TerrainGeometry extends THREE.PlaneGeometry {

    constructor(size, resolution, height, image) {
        super(size, size, resolution - 1, resolution - 1);

        this.rotateX((Math.PI / 180) * -90);

        this.data = getHeightmapData(image, resolution);

        for (let i = 0; i < this.data.length; i++) {
            this.attributes.position.setY(i, this.data[i] * height);
        }
    }
}




