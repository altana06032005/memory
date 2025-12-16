import * as THREE from 'three';
import { appState } from './State.js';
import { AudioFeedback } from './AudioFeedback.js';



export class Photo {
    constructor(url, index, scene) {
        this.index = index;
        this.url = url;
        this.scene = scene;
        this.hovered = false;
        this.targetPos = new THREE.Vector3();
        this.targetScale = new THREE.Vector3(1, 1, 1);


        this.mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(1, 1.5), // Aspect ratio 2:3
            new THREE.MeshStandardMaterial({
                color: 0xffffff,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.0,
                roughness: 0.4,
                metalness: 0.1,
                emissiveIntensity: 0.0
            })
        );
        this.mesh.userData = { index: this.index, isPhoto: true };

        // Load Texture
        new THREE.TextureLoader().load(url, (tex) => {
            this.mesh.material.map = tex;
            this.mesh.material.needsUpdate = true;

            // Fade in animation
            this.mesh.material.opacity = 0.9;
        });

        this.group = new THREE.Group();
        this.group.add(this.mesh);
        this.scene.add(this.group);
    }

    update(layoutPos, camera) {
        // State checks
        const selectedIndex = appState.get('selectedPhoto');
        const isSelected = selectedIndex === this.index;

        // Target calculation
        let scale = 1;
        if (isSelected) {
            this.targetPos.set(0, 0, 0); // Center
            scale = 3;
        } else {
            this.targetPos.copy(layoutPos);
            if (this.hovered) scale = 1.2;
        }

        this.targetScale.set(scale, scale, scale);

        // Smooth Lerp
        this.group.position.lerp(this.targetPos, 0.1);
        this.group.scale.lerp(this.targetScale, 0.1);

        // Look at camera
        this.group.lookAt(camera.position);

        // Hover logic
        const hoveredIndex = appState.get('hoveredPhoto');
        if (!isSelected && hoveredIndex === this.index) {
            if (!this.hovered) {
                this.hovered = true;
                AudioFeedback.hover();
            }
        } else {
            this.hovered = false;
        }
    }

    destroy() {
        this.scene.remove(this.group);
    }
}
