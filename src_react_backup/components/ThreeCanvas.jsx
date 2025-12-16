import React from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom, DepthOfField, Vignette } from '@react-three/postprocessing';
import { PerspectiveCamera, Stars } from '@react-three/drei';
import Gallery from './Gallery/Gallery';
import Cursor from './Cursor';

const ThreeCanvas = () => (
    <Canvas dpr={[1, 2]} gl={{ antialias: false, alpha: false }}>
        <color attach="background" args={['#050505']} />
        <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={50} />

        <Gallery />
        <Cursor />

        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="cyan" />

        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

        <EffectComposer disableNormalPass>
            <Bloom luminanceThreshold={0.4} luminanceSmoothing={0.9} intensity={1.5} />
            <DepthOfField focusDistance={0} focalLength={0.02} bokehScale={2} height={480} />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>
    </Canvas>
);

export default ThreeCanvas;

