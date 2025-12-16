import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useStore } from '../store';
import { Text } from '@react-three/drei';

const Cursor = () => {
    const meshRef = useRef();
    const position = useStore((state) => state.cursorPosition);
    const handPresent = useStore((state) => state.handPresent);

    useFrame(() => {
        if (meshRef.current) {
            // Smooth interpolation could go here
            meshRef.current.position.set(position[0], position[1], position[2]);
        }
    });

    if (!handPresent) return null;

    return (
        <mesh ref={meshRef} position={position}>
            <sphereGeometry args={[0.1, 32, 32]} />
            <meshStandardMaterial
                color="#00ffff"
                emissive="#00ffff"
                emissiveIntensity={2}
                transparent
                opacity={0.8}
            />
            <pointLight distance={3} intensity={2} color="#00ffff" />
        </mesh>
    );
};

export default Cursor;
