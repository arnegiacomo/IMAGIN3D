"use strict";

import * as THREE from "../../libs/three.module.js";
import { XRControllerModelFactory } from '../../libs/webxr/XRControllerModelFactory.js';
import { OrbitControls } from "../../libs/controls/OrbitControls.js";
import {Vector3} from "../../libs/three.module.js";
import {calculateVertexIndex} from "../utils.js";

// This class has ownership over camera (vr and non-vr, non-vr controls and vr-controls)
export default class Controls {

    constructor(scene, renderer) {
        this.scene = scene;
        this.renderer = renderer;

        // Create camera
        this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        // Create mousecontrols
        this.controls = new OrbitControls( this.camera, renderer.domElement );

        // Configure camera
        this.camera.position.z += 10;
        this.camera.position.x += 10;
        this.camera.position.y += 10;

        this.camera.lookAt(0, 0, 0);

        this.controls.update();

        this.scene.add(this.camera);

        // Enable VR
        renderer.xr.enabled = true;

        // Get controllers
        this.controller1 = renderer.xr.getController( 0 );
        this.controller1.addEventListener( 'selectstart', onSelectStart );
        this.controller1.addEventListener( 'selectend', onSelectEnd );
        this.controller1.addEventListener( 'connected', function ( event ) {

            this.ray = buildController( event.data );
            this.add( this.ray );

        } );
        this.controller1.addEventListener( 'disconnected', function () {

            this.remove( this.children[ 0 ] );

        } );

        this.controller2 = renderer.xr.getController( 1 );
        this.controller2.addEventListener( 'selectstart', onSelectStart );
        this.controller2.addEventListener( 'selectend', onSelectEnd );
        this.controller2.addEventListener( 'connected', function ( event ) {

            this.ray = buildController( event.data );
            this.add( this.ray );

        } );
        this.controller2.addEventListener( 'disconnected', function () {

            this.remove( this.children[ 0 ] );

        } );


        // Create raycaster for picking
        this.raycaster = new THREE.Raycaster();

        // The XRControllerModelFactory will automatically fetch controller models
        // that match what the user is holding as closely as possible. The models
        // should be attached to the object returned from getControllerGrip in
        // order to match the orientation of the held device.

        const controllerModelFactory = new XRControllerModelFactory();

        this.controllerGrip1 = renderer.xr.getControllerGrip( 0 );
        this.controllerGrip1.add( controllerModelFactory.createControllerModel( this.controllerGrip1 ) );

        this.controllerGrip2 = renderer.xr.getControllerGrip( 1 );
        this.controllerGrip2.add( controllerModelFactory.createControllerModel( this.controllerGrip2 ) );

        // Dolly and camera for VR movement
        this.dolly = new THREE.Object3D();
        this.dolly.add(this.camera);
        scene.add(this.dolly);

        this.dolly.add(this.controller1);
        this.dolly.add(this.controller2);
        this.dolly.add(this.controllerGrip1);
        this.dolly.add(this.controllerGrip2);

    }

    update(dt) {

        if(!this.renderer.xr.isPresenting) {
            this.controls.update();
        } else {
            this.handleController1(dt);
            this.handleController2(dt);

            const direction = new THREE.Vector3();
            this.controller1.ray.getWorldDirection(direction);
            direction.multiply(new Vector3(-1, -1, -1))
            const position = new THREE.Vector3();
            this.controller1.ray.getWorldPosition(position)
            this.raycaster.set( position, direction);

            const intersects = this.raycaster.intersectObjects( this.scene.children );

            for ( let i = 0; i < intersects.length; i ++ ) {

                const obj = intersects[i].object;
                if(obj instanceof THREE.Mesh) {
                    if(intersects[i].object.isTerrain) {
                        obj.updateMatrixWorld();
                        const point = intersects[i].uv;
                        const idx = calculateVertexIndex(point.x, point.y, obj.size);
                        console.log(obj.size);
                        obj.geometry.attributes.position.setY(idx, obj.geometry.attributes.position.getY(idx) + dt);
                        obj.geometry.attributes.position.needsUpdate = true;
                    }

                }
            }
        }


    }

    handleController1( dt ) {

        if ( this.controller1.userData.isSelecting ) {
            const speed = 2;
            const quaternion = this.dolly.quaternion.clone();
            this.camera.getWorldQuaternion(this.dolly.quaternion);
            this.dolly.translateZ(-dt * speed);
            this.dolly.position.y = 0;
            this.dolly.quaternion.copy( quaternion );
        }

    }

    handleController2( dt ) {

        if ( this.controller2.userData.isSelecting ) {
            const speed = -2;
            const quaternion = this.dolly.quaternion.clone();
            this.camera.getWorldQuaternion(this.dolly.quaternion);
            this.dolly.translateZ(-dt * speed);
            this.dolly.position.y = 0;
            this.dolly.quaternion.copy( quaternion );
        }

    }
}

function buildController( data ) {

    let geometry, material;

    switch ( data.targetRayMode ) {

        case 'tracked-pointer':

            geometry = new THREE.BufferGeometry();
            geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( [ 0, 0, 0, 0, 0, - 1 ], 3 ) );
            geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( [ 0.5, 0.5, 0.5, 0, 0, 0 ], 3 ) );

            material = new THREE.LineBasicMaterial( { vertexColors: true, blending: THREE.AdditiveBlending } );

            return new THREE.Line( geometry, material );

        case 'gaze':

            geometry = new THREE.RingGeometry( 0.02, 0.04, 32 ).translate( 0, 0, - 1 );
            material = new THREE.MeshBasicMaterial( { opacity: 0.5, transparent: true } );
            return new THREE.Mesh( geometry, material );

    }

}

function onSelectStart() {

    this.userData.isSelecting = true;

}

function onSelectEnd() {

    this.userData.isSelecting = false;

}

