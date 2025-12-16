import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Image } from '@react-three/drei';
import { useStore } from '../../store';
import * as THREE from 'three';

const Photo = ({ url, index, layoutPosition, isSelected }) => {
    const ref = useRef();
    const [hovered, setHover] = useState(false);

    // REMOVED hook subscription to cursorPosition to prevent re-renders
    // const cursorPosition = useStore(s => s.cursorPosition); 

    // каждый фото имеет свой target Vector3
    const targetPosVec = useRef(new THREE.Vector3());
    const targetScaleVec = useRef(new THREE.Vector3(1, 1, 1));

    useFrame(state => {
        if (!ref.current) return;

        // Read directly from store (transient update)
        const cursorPosition = useStore.getState().cursorPosition;
        if (!cursorPosition) return;

        targetPosVec.current.copy(layoutPosition);
        let scale = hovered ? 1.2 : 1;

        if (isSelected) {
            targetPosVec.current.set(0, 0, 0); // центр для выбранного фото
            scale = 3;
        }

        targetScaleVec.current.set(scale, scale, scale);

        // плавная интерполяция
        ref.current.position.lerp(targetPosVec.current, 0.1);
        ref.current.scale.lerp(targetScaleVec.current, 0.1);

        // Hover logic
        const worldPos = new THREE.Vector3();
        ref.current.getWorldPosition(worldPos);
        const dist = worldPos.distanceTo(new THREE.Vector3(...cursorPosition));

        if (!isSelected && dist < 1) {
            if (!hovered) {
                setHover(true);
                useStore.getState().setHoveredPhoto(index);
            }
        } else {
            if (hovered) {
                setHover(false);
                if (useStore.getState().hoveredPhoto === index)
                    useStore.getState().setHoveredPhoto(null);
            }
        }

        // всегда смотрим на камеру
        ref.current.lookAt(state.camera.position);
    });

    return <Image ref={ref} url={url} transparent opacity={0.9} side={THREE.DoubleSide} />;
};

export default Photo;
