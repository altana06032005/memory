import React, { Suspense } from 'react';
import ThreeCanvas from './components/ThreeCanvas';
import HandTracker from './components/HandTracker';
import { Loader } from '@react-three/drei';

function App() {
    return (
        <>
            <Suspense fallback={null}>
                <ThreeCanvas />
                <HandTracker />
            </Suspense>

            <Loader />

            <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '20px',
                color: 'rgba(255,255,255,0.5)',
                pointerEvents: 'none',
                fontSize: '12px',
                zIndex: 10
            }}>
                <p>RIGHT HAND SWIPE: Scroll/Rotate</p>
                <p>TWO HANDS DISTANCE: Zoom</p>
                <p>TWO HANDS CLENCH: Transform Shape</p>
                <p>INDEX FINGER: Cursor</p>
                <p>INDEX + THUMB: Select</p>
            </div>
        </>
    );
}

export default App;
