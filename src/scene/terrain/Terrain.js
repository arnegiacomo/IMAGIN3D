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

                    sprite.scale.set(0.6, 0.4, 0.4)
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

            // Load all objects into scene
            const loader = new ObjectLoader();
            this.trees = loader.init(this.mesh);

            this.loaded = true;

        };
        terrainImage.src = '../assets/images/terrain.png';


    }

    num = 0;

    update(dt) {

        if(!this.loaded) return;

        for(let i = 0; i < this.trees.length; i++) {
            const tree = this.trees[i];
            if(tree === undefined) return;
            for(let i = 0; i < tree.children.length; i++) {
                const leaf = tree.children[i];

                leaf.material.rotation += dt * Math.sin(this.num) / 100;
                this.num += dt;
                leaf.material.needsUpdate = true;
            }

        }
    }

}



