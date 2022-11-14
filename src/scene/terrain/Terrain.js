"use strict";

import * as THREE from "../../../libs/three.module.js";
import TextureSplattingMaterial from "../../materials/TextureSplattingMaterial.js";
import TerrainGeometry from "./TerrainGeometry.js";
import ObjectLoader from "../../ObjectLoader.js";

export default class Terrain {

    loaded = false;

    constructor(scene) {
        const terrainImage = new Image();
        terrainImage.onload = () => {

            this.size = 128;
            this.heightwidth = 20;
            this.height = 5;

            this.geometry = new TerrainGeometry(this.heightwidth, this.size, this.height, terrainImage);

            const grass = new THREE.TextureLoader().load('../../assets/images/grass.png');
            const rock = new THREE.TextureLoader().load('../../assets/images/rock.png');
            const alphaMap = new THREE.TextureLoader().load('../../assets/images/terrain.png');

            grass.wrapS = THREE.RepeatWrapping;
            grass.wrapT = THREE.RepeatWrapping;

            grass.repeat.multiplyScalar(this.size / 8);

            rock.wrapS = THREE.RepeatWrapping;
            rock.wrapT = THREE.RepeatWrapping;

            rock.repeat.multiplyScalar(this.size / 8);

            this.material = new TextureSplattingMaterial({
                color: THREE.Color.NAMES.white,
                colorMaps: [grass, rock],
                alphaMaps: [alphaMap]
            });

            this.mesh = new THREE.Mesh(this.geometry, this.material);
            this.mesh.isTerrain = true;
            this.mesh.size = this.size;
            this.mesh.receiveShadow = true;

            scene.add(this.mesh);
            this.loaded = true;

            // Grass

            const map = new THREE.TextureLoader().load( '../../assets/images/GrassSprite.png');
            const material = new THREE.SpriteMaterial( { map: map, color: 0xffffff } );
            const stepsize = 4;
            this.mesh.grassSize = 32;
            let index = 0;
            this.mesh.stepsize = stepsize;

            this.mesh.grassArray = new Array(this.mesh.grassSize * this.mesh.grassSize);
            for (let i = 0; i < this.size; i += stepsize) {
                for (let j = 0; j < this.size; j += stepsize) {

                    const sprite = new THREE.Sprite( material );

                    sprite.scale.set(0.25, 0.25, 0.25)
                    let y = this.mesh.geometry.data[i*this.size + j];
                    sprite.translateX((j /this.size)*this.heightwidth  - this.heightwidth/2)
                    sprite.translateZ((i /this.size)*this.heightwidth- this.heightwidth/2)
                    sprite.translateY(y * this.height + 0.1);
                    this.mesh.add( sprite );

                    sprite.visible = !(sprite.position.y < 0.2 || sprite.position.y > 3);

                    this.mesh.grassArray[index] = sprite;
                    index ++;
                }
            }

        };
        terrainImage.src = '../assets/images/terrain.png';

        // Load all objects into scene
        const loader = new ObjectLoader();
        loader.init(scene);
    }

    update(dt) {

        if (this.loaded) {
           // TODO: update texture after change in mesh?
        }

    }

}



