"use strict";

import * as THREE from "../../../libs/three.module.js";

export default class LightSphere extends THREE.Mesh{

    constructor(radius, color, lightIntensity, lightDistanse, xpos, ypos, zpos) {
        const geometry = new THREE.SphereGeometry( radius, 32, 16 );
        const material = new THREE.MeshBasicMaterial( { color: color } );
        const light = new THREE.PointLight( color, lightIntensity, lightDistanse );
        super( geometry, material );
        this.add(light);
        this.position.set( xpos, ypos, zpos);
    }
}