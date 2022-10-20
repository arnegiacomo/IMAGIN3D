"use strict";

import * as THREE from "../../libs/three.module.js";

export default class SkyBox extends THREE.CubeTexture {

    constructor() {
        const loader = new THREE.CubeTextureLoader();
        const texture = loader.load([
            '../../public/assets/images/skybox/right.png',
            '../../public/assets/images/skybox/left.png',
            '../../public/assets/images/skybox/top.png',
            '../../public/assets/images/skybox/bottom.png',
            '../../public/assets/images/skybox/front.png',
            '../../public/assets/images/skybox/back.png',
        ]);
        super(texture);
    }
}