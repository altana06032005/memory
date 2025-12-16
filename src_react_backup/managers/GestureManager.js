import { useStore } from '../store';
import { AudioFeedback } from './AudioFeedback';
import * as THREE from 'three';

class GestureManager {
    constructor() {
        this.store = useStore;
        this.prevCursor = null;
        this.isPinching = false;
        this.lastTransform = 0;
        this.tmpVec = new THREE.Vector3();
    }

    process(landmarks) {
        const state = this.store.getState();
        const { setCursorPosition, setScroll, layout, setLayout, setZoom, zoom, scroll } = state;

        if (!landmarks[0]) return;

        const rightHand = landmarks[0];
        const indexTip = rightHand[8];

        // --- CURSOR ---
        const cursorX = (0.5 - indexTip.x) * 15;
        const cursorY = (0.5 - indexTip.y) * 10;

        // --- SCROLL ---
        if (this.prevCursor) {
            // Calculate delta in the SAME units (Mapped Space)
            // prevCursor is [cursorX, cursorY] from previous frame
            const deltaX = cursorX - this.prevCursor[0];
            const sensitivity = 0.5; // Reduced sensitivity since we work in mapped space now
            if (Math.abs(deltaX) > 0.1) { // Threshold
                setScroll(scroll + deltaX * sensitivity);
            }
        }

        // Update prevCursor ALWAYS
        this.prevCursor = [cursorX, cursorY];

        // --- ZOOM & TRANSFORM ---
        if (landmarks.length > 1) {
            const leftHand = landmarks[1];
            const dist = Math.hypot(leftHand[9].x - rightHand[9].x, leftHand[9].y - rightHand[9].y);
            const targetZoom = Math.max(2, Math.min(20, 18 - dist * 20));
            setZoom(targetZoom);

            const isFist = (hand) => Math.hypot(hand[0].x - hand[12].x, hand[0].y - hand[12].y) < 0.1;
            if (isFist(leftHand) && isFist(rightHand) && Date.now() - this.lastTransform > 1000) {
                const layouts = ['sphere', 'cube', 'spiral'];
                setLayout(layouts[(layouts.indexOf(layout) + 1) % layouts.length]);
                this.lastTransform = Date.now();
                AudioFeedback.transform();
            }
        }

        // --- PINCH SELECTION ---
        const pinchDist = Math.hypot(rightHand[4].x - rightHand[8].x, rightHand[4].y - rightHand[8].y);
        const { hoveredPhoto, selectedPhoto } = state;

        if (pinchDist < 0.05) {
            if (!this.isPinching) {
                this.isPinching = true;
                if (selectedPhoto !== null) {
                    this.store.getState().setSelectedPhoto(null);
                    AudioFeedback.select();
                } else if (hoveredPhoto !== null) {
                    this.store.getState().setSelectedPhoto(hoveredPhoto);
                    AudioFeedback.select();
                }
            }
        } else this.isPinching = false;
    }
}

export const gestureManager = new GestureManager();
