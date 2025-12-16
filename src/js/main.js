import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

import { appState } from './State.js';
import { Gallery } from './Gallery.js';
import { Cursor } from './Cursor.js';
import { HandTracker } from './HandTracker.js';
import { UIManager } from './UIManager.js';

class App {
    constructor() {
        this.setupThree();
        this.setupScene();
        this.setupPostProcessing();

        this.gallery = new Gallery(this.scene, this.camera);
        this.cursor = new Cursor(this.scene);
        this.handTracker = new HandTracker();
        this.uiManager = new UIManager();
        this.raycaster = new THREE.Raycaster(); // Init Raycaster

        this.clock = new THREE.Clock();
        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
    }

    setupThree() {
        this.canvas = document.createElement('canvas');
        document.getElementById('app').appendChild(this.canvas);

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: false,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
        this.camera.position.z = 10;
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x050505);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const spotLight = new THREE.SpotLight(0xffffff, 1);
        spotLight.position.set(10, 10, 10);
        spotLight.angle = 0.15;
        spotLight.penumbra = 1;
        this.scene.add(spotLight);

        const pointLight = new THREE.PointLight(0x00ffff, 0.5);
        pointLight.position.set(-10, -10, -10);
        this.scene.add(pointLight);
    }

    setupPostProcessing() {
        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(new RenderPass(this.scene, this.camera));

        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            1.5, 0.4, 0.85
        );
        bloomPass.threshold = 0.4;
        bloomPass.strength = 1.5;
        bloomPass.radius = 0.9;
        this.composer.addPass(bloomPass);
    }

    resize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.composer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(this.animate);

        const delta = this.clock.getDelta();
        const time = this.clock.getElapsedTime();

        // Updates
        // Updates
        this.gallery.update(delta, time);
        this.cursor.update();

        // --- Raycasting for Hover ---
        const cursorActive = appState.get('cursorActive');
        if (cursorActive) {
            const ndc = appState.get('cursorNDC');
            if (ndc) {
                this.raycaster.setFromCamera(ndc, this.camera);

                // Collect meshes
                const photoMeshes = [];
                this.gallery.photos.forEach(p => photoMeshes.push(p.mesh));

                const intersects = this.raycaster.intersectObjects(photoMeshes, false);

                if (intersects.length > 0) {
                    const hit = intersects[0];
                    if (hit.object.userData.isPhoto) {
                        const index = hit.object.userData.index;
                        const currentHover = appState.get('hoveredPhoto');
                        if (currentHover !== index) {
                            appState.set('hoveredPhoto', index);
                            // Audio handled in Photo.js or we can do it here. 
                            // Photo.js did it on internal check. We rely on Photo.js to read state?
                            // No, Photo.js sets state loops. We need to prevent fighting.
                            // Photo.js logic for SETTING hover should be removed if we do it here.
                            // For now, let's update state, and Photo.js READS state.
                        }
                    }
                } else {
                    appState.set('hoveredPhoto', null);
                }
            }
        } else {
            appState.set('hoveredPhoto', null);
        }

        // Global Camera Zoom interpolation
        const targetZoom = appState.get('selectedPhoto') !== null ? 2 : appState.get('zoom');
        this.camera.position.z = THREE.MathUtils.lerp(this.camera.position.z, targetZoom, 0.1);

        this.composer.render();
    }
}

// Start App
new App();
