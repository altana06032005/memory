import { appState } from './State.js';
import { AudioFeedback } from './AudioFeedback.js';
import * as THREE from 'three';

export class GestureManager {
    constructor() {
        this.prevCursor = null;
        this.prevCursorForSwipe = null;
        this.isPinching = false;
        this.lastTransform = 0;
    }

    process(landmarks) {
        const rightHand = landmarks[0];
        if (!rightHand) {
            appState.set('handPresent', false);
            appState.set('cursorActive', false);
            this.prevCursor = null;
            this.prevCursorForSwipe = null;
            return;
        }
        appState.set('handPresent', true);

        // --- MULTI-HAND MODE (Zoom + Transform) ---
        if (landmarks.length > 1) {
            appState.set('cursorActive', false);

            const leftHand = landmarks[1];

            // Zoom
            const dist = Math.hypot(leftHand[0].x - rightHand[0].x, leftHand[0].y - rightHand[0].y);
            const targetZoom = Math.max(2, Math.min(20, 18 - dist * 20));
            appState.set('zoom', targetZoom);

            // Transform (Fist)
            const isFist = (hand) => Math.hypot(hand[0].x - hand[12].x, hand[0].y - hand[12].y) < 0.1;
            if (isFist(leftHand) && isFist(rightHand)) {
                if (Date.now() - this.lastTransform > 1000) {
                    const layout = appState.get('layout');
                    const layouts = ['sphere', 'cube', 'spiral'];
                    const nextLayout = layouts[(layouts.indexOf(layout) + 1) % layouts.length];

                    appState.set('layout', nextLayout);
                    this.lastTransform = Date.now();
                    AudioFeedback.transform();
                }
            }
            this.prevCursor = null;
            this.prevCursorForSwipe = null;
            return;
        }

        // --- SINGLE HAND MODE ---
        const indexTip = rightHand[8];
        const wrist = rightHand[0];
        const middleTip = rightHand[12];
        const ringTip = rightHand[16];
        const pinkyTip = rightHand[20];

        // Detect pointing: index extended, others curled
        const indexDist = Math.hypot(indexTip.x - wrist.x, indexTip.y - wrist.y);
        const middleDist = Math.hypot(middleTip.x - wrist.x, middleTip.y - wrist.y);
        const isPointing = indexDist > 0.1 && middleDist < indexDist * 0.8;

        // Map index tip to world coordinates (Visual Cursor)
        const cursorX = (0.5 - indexTip.x) * 25;
        const cursorY = (0.5 - indexTip.y) * 18;

        // Map to NDC for Raycasting
        // MP x: 0(L)..1(R), y: 0(T)..1(B)
        // NDC x: -1(L)..1(R), y: 1(T)..-1(B)
        // Note: MP x might be mirrored depending on camera setup. Assuming standard webcam mirror.
        // Usually MP inverts X? Let's assume (1-x) if mirrored.
        // Actually, if cursorX = (0.5 - x) * 25, then x<0.5 is Positive X (Right? No, +X is Right).
        // If x=0(Left), (0.5)*25 = 12.5 (Right). So X is mirrored/inverted.
        // So NDC x should follow visual cursor direction.
        // Visual: Left on screen -> Cursor Left in World?
        // Standard WebGL: -X is Left.
        // if x=0(Left image), visual says 12.5 (Right World).
        // This implies the camera is looking at +Z or something, or X is inverted.
        // Let's rely on standard NDC: (x - 0.5) * 2 is standard L->R.
        // If the visual cursor works, lets trust visual cursor X sign.
        // CursorX > 0 is Right? 
        // If x=0 (Left in MP frame), CursorX = +12.5. 
        // If standard ThreeJS camera, +X is Right. So x=0 maps to Right.
        // This means MP is mirrored.
        // NDC x should be: (1 - x) * 2 - 1 = 1 - 2x. (maps 0->1, 1->-1? No).
        // Let's try: NDC.x = (1 - x) * 2 - 1 => x=0->1, x=1->-1.
        // NDC.y = (1 - y) * 2 - 1 => y=0->1 (Top), y=1->-1 (Bot). Correct.
        const ndcX = (1 - indexTip.x) * 2 - 1;
        const ndcY = (1 - indexTip.y) * 2 - 1;

        if (isPointing) {
            appState.set('cursorActive', true);
            appState.set('cursorPosition', { x: cursorX, y: cursorY, z: 0 });
            appState.set('cursorNDC', { x: ndcX, y: ndcY });

            // --- Pinch (Select / UI Click) ---
            const pinchDist = Math.hypot(rightHand[4].x - rightHand[8].x, rightHand[4].y - rightHand[8].y);
            if (pinchDist < 0.05) {
                if (!this.isPinching) {
                    this.isPinching = true;

                    // 1. Add Photo Button
                    // Use document.elementFromPoint for accuracy regardless of position
                    // Convert MP (0..1) to Client (px)
                    // Assuming MP X mirrored: clientX = (1-x) * W
                    const clientX = (1 - indexTip.x) * window.innerWidth;
                    const clientY = indexTip.y * window.innerHeight;

                    const el = document.elementFromPoint(clientX, clientY);
                    if (el && el.id === 'add-photo-btn') {
                        el.click();
                        AudioFeedback.select();
                        return;
                    }

                    // 2. Photo Selection (Handled via Raycaster in main loop now)
                    const hovered = appState.get('hoveredPhoto');
                    const selected = appState.get('selectedPhoto');

                    if (selected !== null) {
                        appState.set('selectedPhoto', null);
                        AudioFeedback.select();
                    } else if (hovered !== null) {
                        appState.set('selectedPhoto', hovered);
                        AudioFeedback.select();
                    }
                }
            } else {
                this.isPinching = false;
            }

            // --- Swipe Down to Delete Selected Photo ---
            const selected = appState.get('selectedPhoto');
            if (selected !== null) {
                if (this.prevCursorForSwipe) {
                    const deltaY = cursorY - this.prevCursorForSwipe.y;
                    // Lower threshold for better response
                    if (deltaY < -0.3) {
                        const photos = appState.get('photos');
                        if (selected >= 0 && selected < photos.length) {
                            const newPhotos = [...photos];
                            newPhotos.splice(selected, 1);
                            appState.set('photos', newPhotos);
                            appState.set('selectedPhoto', null);
                            AudioFeedback.select();
                            this.prevCursorForSwipe = null; // Reset
                        }
                    }
                }
                this.prevCursorForSwipe = { x: cursorX, y: cursorY };
            } else {
                this.prevCursorForSwipe = null;
            }

            // Disable scroll/zoom while cursor is active
            this.prevCursor = null;

        } else {
            // --- Scroll Mode (Open Hand) ---
            appState.set('cursorActive', false);

            if (this.prevCursor) {
                const deltaX = cursorX - this.prevCursor.x;
                const deltaY = cursorY - this.prevCursor.y;

                const sensitivity = 0.5;
                if (Math.abs(deltaX) > 0.02) {
                    const currentScrollX = appState.get('scrollX');
                    appState.set('scrollX', currentScrollX + deltaX * sensitivity);
                }
                if (Math.abs(deltaY) > 0.02) {
                    const currentScrollY = appState.get('scrollY');
                    appState.set('scrollY', currentScrollY + deltaY * sensitivity);
                }
            }
            this.prevCursor = { x: cursorX, y: cursorY };
            this.prevCursorForSwipe = null;
        }
    }
}
