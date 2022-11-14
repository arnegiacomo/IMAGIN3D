"use strict";

import ThreeMeshUI from "../../libs/three-mesh-ui.module.js";

export default class GUI {

    constructor(scene) {
        this.scene = scene;

        // TODO: VR gui using https://github.com/felixmariotto/three-mesh-ui

        // this.makeTextPanel();

        // TODO: Non-VR gui using https://sbcode.net/threejs/dat-gui/

        // const gui = new GUI()
        // const meshFolder = gui.addFolder('Mesh')
        // meshFolder.add(mesh.rotation, 'x', 0, Math.PI * 2)
        // meshFolder.add(mesh.rotation, 'y', 0, Math.PI * 2)
        // meshFolder.add(mesh.rotation, 'z', 0, Math.PI * 2)
        // meshFolder.open()

    }

    update(dt) {
        ThreeMeshUI.update();
    }

    makeTextPanel() {

        const container = new ThreeMeshUI.Block( {
            width: 2.4,
            height: 1.0,
            padding: 0.05,
            justifyContent: 'center',
            textAlign: 'left',
            fontFamily: '../../assets/three-mesh-ui/Roboto-msdf.json',
            fontTexture: '../../assets/three-mesh-ui/Roboto-msdf.png'
        } );

        container.position.set( 0, 4, -2.8 );
        container.rotation.x = -0.55;
        this.scene.add( container );

        //

        container.add(
            new ThreeMeshUI.Text( {
                content: 'This library supports line-break-friendly-characters,',
                fontSize: 0.055
            } ),

            new ThreeMeshUI.Text( {
                content: ' As well as multi-font-size lines with consistent vertical spacing.',
                fontSize: 0.08
            } )
        );

    }
}

