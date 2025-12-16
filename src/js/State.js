class State {
    constructor() {
        this.data = {
            layout: 'sphere', // 'sphere', 'cube', 'spiral'
            zoom: 5,
            scrollX: 0,
            scrollY: 0,
            selectedPhoto: null, // index
            hoveredPhoto: null, // index
            cursorPosition: { x: 0, y: 0, z: 0 },
            cursorNDC: { x: 0, y: 0 }, // For Raycasting
            handPresent: false,
            cursorActive: false,
            notes: {}, // { index: "note text" }
            photos: [
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
            ]
        };
        this.listeners = new Set();
    }

    get(key) {
        return this.data[key];
    }

    set(key, value) {
        if (this.data[key] !== value) {
            this.data[key] = value;
            this.emit(key, value);
        }
    }

    // Updates multiple properties but emits only once "update" event? 
    // Or just emits per key. Let's emit per key for granular listeners.

    subscribe(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    emit(changedKey, value) {
        for (const listener of this.listeners) {
            listener(changedKey, value, this.data);
        }
    }
}

export const appState = new State();
