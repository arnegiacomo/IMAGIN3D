"use strict";

import * as THREE from "../../libs/three.module.js";
import TextureSplattingMaterial from "../materials/TextureSplattingMaterial.js";
import TerrainGeometry from "./TerrainGeometry.js";

export default class Terrain {

    loaded = false;

    constructor(scene) {
        const terrainImage = new Image();
        terrainImage.onload = () => {

            this.size = 128;
            this.height = 5;

            this.geometry = new TerrainGeometry(20, this.size, this.height, terrainImage);

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

            scene.add(this.mesh);
            this.loaded = true;
        };
        terrainImage.src = '../assets/images/terrain.png';
    }

    update(dt) {


    }

}

