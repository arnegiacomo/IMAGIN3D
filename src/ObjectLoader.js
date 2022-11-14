"use strict"

import * as THREE from "../libs/three.module.js";
import {OBJLoader} from "../libs/OBJLoader.js";

export default class ObjectLoader {

    // Class that loads all objects from models to scene
    init(terrain) {

        const loader = new OBJLoader();

        const trees = new Array(4);
        // load a resource
        loader.load(
            // resource URL
            '../assets/models/tree.obj',
            // called when resource is loaded
            function (object) {

                createTree(object,0.5, 3.5, 0);
                terrain.add(object);
                trees[0] = object.mesh;

            },
            // called when loading is in progresses
            function (xhr) {

                console.log((xhr.loaded / xhr.total * 100) + '% loaded');

            },
            // called when loading has errors
            function (error) {

                console.log('An error happened' + error);

            }
        );

        loader.load(
            // resource URL
            '../assets/models/tree.obj',
            // called when resource is loaded
            function (object) {

                createTree(object,5, 4.8, 5);
                object.rotateY((Math.PI / 180) * 210);
                terrain.add(object);
                trees[1] = object.mesh;

            },
            // called when loading is in progresses
            function (xhr) {

                console.log((xhr.loaded / xhr.total * 100) + '% loaded');

            },
            // called when loading has errors
            function (error) {

                console.log('An error happened' + error);

            }
        );

        loader.load(
            // resource URL
            '../assets/models/tree.obj',
            // called when resource is loaded
            function (object) {

                createTree(object,-7, 2.7, -0.45);
                object.rotateY((Math.PI / 180) * 45);
                terrain.add(object);
                trees[2] = object.mesh;

            },
            // called when loading is in progresses
            function (xhr) {

                console.log((xhr.loaded / xhr.total * 100) + '% loaded');

            },
            // called when loading has errors
            function (error) {

                console.log('An error happened' + error);

            }
        );

        loader.load(
            // resource URL
            '../assets/models/tree.obj',
            // called when resource is loaded
            function (object) {

                createTree(object, 5.7, 4.3, -4.75);
                object.rotateY((Math.PI / 180) * 90);
                terrain.add(object);
                trees[3] = object.mesh;

            },
            // called when loading is in progresses
            function (xhr) {

                console.log((xhr.loaded / xhr.total * 100) + '% loaded');

            },
            // called when loading has errors
            function (error) {

                console.log('An error happened' + error);

            }
        );

        return trees;
    }
}

const spritemap = new THREE.TextureLoader().load( '../assets/images/canopy.png');
const spritematerial = new THREE.SpriteMaterial( { map: spritemap, color: 0xffffff } );

function createTree(object, x, y, z) {
    object.mesh.material =  new THREE.MeshPhongMaterial( { color: THREE.Color.NAMES.sandybrown, side: THREE.DoubleSide } );
    object.position.set(x, y, z);
    object.scale.set(1.5, 1.5, 1.5);
    object.mesh.castShadow = true;
    object.mesh.receiveShadow = false;
    object.mesh.isTree = true;

    let sprite = new THREE.Sprite( spritematerial );
    sprite.translateY(0.9);
    sprite.scale.set(0.75, 0.75, 0.75)
    object.mesh.add( sprite );

    sprite = new THREE.Sprite( spritematerial );
    sprite.translateY(0.75);
    sprite.translateZ(0.4)
    sprite.scale.set(0.75, 0.75, 0.75)
    object.mesh.add( sprite );

    sprite = new THREE.Sprite( spritematerial );
    sprite.translateY(0.75);
    sprite.translateZ(-0.4)
    sprite.scale.set(0.75, 0.75, 0.75)
    object.mesh.add( sprite );

    sprite = new THREE.Sprite( spritematerial );
    sprite.translateY(0.75);
    sprite.translateX(0.6)
    sprite.scale.set(0.75, 0.75, 0.75)
    object.mesh.add( sprite );

    sprite = new THREE.Sprite( spritematerial );
    sprite.translateY(0.75);
    sprite.translateX(-0.4)
    sprite.scale.set(0.75, 0.75, 0.75)
    object.mesh.add( sprite );
}