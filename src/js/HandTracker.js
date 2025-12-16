import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { appState } from './State.js';
import { GestureManager } from './GestureManager.js';

export class HandTracker {
    constructor() {
        this.video = document.createElement('video');
        this.gestureManager = new GestureManager();
        this.lastVideoTime = -1;
        this.setup();
    }

    async setup() {
        const vision = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.9/wasm"
        );
        this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
                delegate: "GPU"
            },
            runningMode: "VIDEO",
            numHands: 2
        });

        this.startWebcam();
    }

    async startWebcam() {
        if (!navigator.mediaDevices?.getUserMedia) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            this.video.srcObject = stream;
            this.video.addEventListener('loadeddata', () => {
                this.video.play();
                this.predict();
            });
        } catch (e) {
            console.error(e);
        }
    }

    predict() {
        requestAnimationFrame(() => this.predict());

        if (this.handLandmarker && this.video.currentTime !== this.lastVideoTime) {
            this.lastVideoTime = this.video.currentTime;
            const results = this.handLandmarker.detectForVideo(this.video, performance.now());

            if (results.landmarks && results.landmarks.length > 0) {
                appState.set('handPresent', true);
                this.gestureManager.process(results.landmarks);
            } else {
                appState.set('handPresent', false);
            }
        }
    }
}
