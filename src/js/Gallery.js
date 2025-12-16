import * as THREE from 'three';
import { appState } from './State.js';
import { Photo } from './Photo.js';

export class Gallery {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.container = new THREE.Group();
        this.scene.add(this.container);

        this.photos = [];
        this.positions = { sphere: [], cube: [], spiral: [] };

        // Инициализация фото
        const initialPhotos = appState.get('photos');
        initialPhotos.forEach((url, i) => {
            this.photos.push(new Photo(url, i, this.container));
        });

        this.calcPositions();
    }

    calcPositions() {
        const count = this.photos.length;

        // SPHERE
        const phi = Math.PI * (3 - Math.sqrt(5));
        for (let i = 0; i < count; i++) {
            const y = 1 - (i / (count - 1)) * 2;
            const radius = Math.sqrt(1 - y * y);
            const theta = phi * i;
            const r = 4;
            this.positions.sphere.push(
                new THREE.Vector3(Math.cos(theta) * radius * r, y * r, Math.sin(theta) * radius * r)
            );
        }

        // CUBE (Grid)
        const cols = 4;
        for (let i = 0; i < count; i++) {
            const x = (i % cols) - 1.5;
            const y = Math.floor(i / cols) - 1;
            this.positions.cube.push(new THREE.Vector3(x * 2.5, y * 2.5, 0));
        }

        // SPIRAL
        for (let i = 0; i < count; i++) {
            const angle = i * 0.5;
            const y = (i - count / 2) * 0.5;
            const r = 4;
            this.positions.spiral.push(
                new THREE.Vector3(Math.cos(angle) * r, y, Math.sin(angle) * r)
            );
        }
    }

    update(delta, time) {
        const layout = appState.get('layout'); // 'sphere', 'cube', 'spiral'
        const scrollX = appState.get('scrollX');
        const scrollY = appState.get('scrollY');
        const selectedPhoto = appState.get('selectedPhoto');

        // Вращение контейнера, если нет выбранного фото
        if (selectedPhoto === null) {
            this.container.rotation.y = THREE.MathUtils.lerp(this.container.rotation.y, scrollX, 0.1);
            this.container.rotation.x = THREE.MathUtils.lerp(this.container.rotation.x, scrollY, 0.1);
        }

        // Обновление всех фото
        this.photos.forEach((photo, i) => {
            const target = this.positions[layout][i] || new THREE.Vector3();
            photo.update(target, this.camera);
        });
    }
}
