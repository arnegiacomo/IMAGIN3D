"use strict";

import * as THREE from "../../../libs/three.module.js";

export default class SkyBox extends THREE.CubeTexture {

    constructor() {
        const loader = new THREE.CubeTextureLoader();
        const texture = loader.load([
            '../../assets/images/skybox/right.png',
            '../../assets/images/skybox/left.png',
            '../../assets/images/skybox/top.png',
            '../../assets/images/skybox/bottom.png',
            '../../assets/images/skybox/front.png',
            '../../assets/images/skybox/back.png',
        ]);
        super(texture);
    }
}