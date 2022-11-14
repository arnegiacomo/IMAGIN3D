"use strict";

import * as THREE from "../../../libs/three.module.js";
import { Water } from '../../../libs/Water.js';



export default class Ocean {

    constructor(scene) {
        const waterGeometry = new THREE.PlaneGeometry( 10000, 10000 );

        this.water = new Water(
            waterGeometry,
            {
                textureWidth: 512,
                textureHeight: 512,
                waterNormals: new THREE.TextureLoader().load( '../../../assets/images/waternormals.jpg', function ( texture ) {

                    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

                } ),
                sunDirection: new THREE.Vector3(),
                sunColor: 0xffffff,
                waterColor: 0x001e0f,
                distortionScale: 3.7,
                fog: scene.fog !== undefined
            }
        );
        this.water.isOcean = true;

        this.water.rotation.x = - Math.PI / 2;
        this.water.position.y += 0.1;

        scene.add( this.water );
    }

    update(dt) {

        this.water.material.uniforms[ 'time' ].value += dt / 5;

    }

}
