"use strict";

import * as THREE from "../../../libs/three.module.js";



export default class Fog {

    constructor(scene) {
        this.fog = new THREE.FogExp2( 0xffffff, 0.005 )
        scene.fog = this.fog;
    }

    update(dt) {

    }

}
