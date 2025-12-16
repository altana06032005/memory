import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import Photo from './Photo';
import { useStore } from '../../store';
import * as THREE from 'three';

const PHOTOS = [
    'https://picsum.photos/id/10/400/600',
    'https://picsum.photos/id/11/400/600',
    'https://picsum.photos/id/12/400/600',
    'https://picsum.photos/id/13/400/600',
    'https://picsum.photos/id/14/400/600',
    'https://picsum.photos/id/15/400/600',
    'https://picsum.photos/id/16/400/600',
    'https://picsum.photos/id/17/400/600',
    'https://picsum.photos/id/18/400/600',
    'https://picsum.photos/id/19/400/600',
    'https://picsum.photos/id/20/400/600',
    'https://picsum.photos/id/21/400/600',
];

const Gallery = () => {
    const layout = useStore(s => s.layout);
    const scroll = useStore(s => s.scroll);
    const zoom = useStore(s => s.zoom);
    const selectedPhoto = useStore(s => s.selectedPhoto);
    const groupRef = useRef();

    // расчет позиций для каждого фото
    const positions = useMemo(() => {
        const pos = { sphere: [], cube: [], spiral: [] };
        const count = PHOTOS.length;

        // SPHERE
        const phi = Math.PI * (3 - Math.sqrt(5));
        for (let i = 0; i < count; i++) {
            const y = 1 - (i / (count - 1)) * 2;
            const radius = Math.sqrt(1 - y * y);
            const theta = phi * i;
            const r = 4;
            pos.sphere.push(new THREE.Vector3(Math.cos(theta) * radius * r, y * r, Math.sin(theta) * radius * r));
        }

        // CUBE (simple grid)
        const cols = 4;
        for (let i = 0; i < count; i++) {
            const x = (i % cols) - 1.5;
            const y = Math.floor(i / cols) - 1;
            pos.cube.push(new THREE.Vector3(x * 2.5, y * 2.5, 0));
        }

        // SPIRAL
        for (let i = 0; i < count; i++) {
            const angle = i * 0.5;
            const y = (i - count / 2) * 0.5;
            const r = 4;
            pos.spiral.push(new THREE.Vector3(Math.cos(angle) * r, y, Math.sin(angle) * r));
        }

        return pos;
    }, []);

    useFrame((state, delta) => {
        // плавная анимация камеры zoom
        const targetZ = selectedPhoto !== null ? 2 : zoom;
        state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, 0.1);

        // вращение группы
        if (groupRef.current && selectedPhoto === null) {
            groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, scroll, 0.1);
        }
    });

    return (
        <group ref={groupRef}>
            {PHOTOS.map((url, index) => (
                <Photo
                    key={index}
                    index={index}
                    url={url}
                    layoutPosition={positions[layout][index]}
                    isSelected={selectedPhoto === index}
                />
            ))}
        </group>
    );
};

export default Gallery;

