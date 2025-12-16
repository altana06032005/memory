import React, { useEffect, useRef } from 'react';
import { gestureManager } from '../managers/GestureManager';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { useStore } from '../store';

const HandTracker = () => {
    const videoRef = useRef(null);
    const { setHandPresent } = useStore();

    useEffect(() => {
        let handLandmarker = null;
        let intervalId = null;

        const setup = async () => {
            const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm");
            handLandmarker = await HandLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
                    delegate: "GPU"
                },
                runningMode: "VIDEO",
                numHands: 2
            });

            if (navigator.mediaDevices?.getUserMedia) {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play();

                    // Throttle ~15 FPS
                    intervalId = setInterval(async () => {
                        if (!videoRef.current || !handLandmarker) return;
                        const results = await handLandmarker.detectForVideo(videoRef.current, performance.now());
                        if (results.landmarks?.length > 0) {
                            setHandPresent(true);
                            gestureManager.process(results.landmarks);
                        } else setHandPresent(false);
                    }, 66);
                }
            }
        };

        setup();

        return () => {
            if (videoRef.current?.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
            if (intervalId) clearInterval(intervalId);
            if (handLandmarker) handLandmarker.close();
        };
    }, [setHandPresent]);

    return <video ref={videoRef} autoPlay playsInline style={{ display: 'none' }} />;
};

export default HandTracker;


