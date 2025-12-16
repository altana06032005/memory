import * as THREE from 'three';
import { appState } from './State.js';

export class Cursor {
    constructor(scene) {
        this.mesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.1, 32, 32),
            new THREE.MeshStandardMaterial({
                color: 0x00ffff,
                emissive: 0x00ffff,
                emissiveIntensity: 2,
                transparent: true,
                opacity: 0.8
            })
        );

        const light = new THREE.PointLight(0x00ffff, 2, 3);
        this.mesh.add(light);

        scene.add(this.mesh);

        this.visible = false;
        this.mesh.visible = false;
    }

    update() {
        const handPresent = appState.get('handPresent');
        const cursorActive = appState.get('cursorActive');
        const pos = appState.get('cursorPosition');

        if (handPresent && cursorActive) {
            this.mesh.position.set(pos.x, pos.y, 0); // Z is 0 or based on depth?
            // Actually in React code it was [x, y, 0]
            if (!this.visible) {
                this.visible = true;
                this.mesh.visible = true;
            }
        } else {
            if (this.visible) {
                this.visible = false;
                this.mesh.visible = false;
            }
        }
    }
}
