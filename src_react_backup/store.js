import { create } from 'zustand';

export const useStore = create((set) => ({
    layout: 'sphere',
    zoom: 5,
    scroll: 0,
    selectedPhoto: null,
    hoveredPhoto: null,
    cursorPosition: [0, 0, 0],
    handPresent: false,

    setLayout: (layout) => set({ layout }),
    setZoom: (zoom) => set({ zoom }),
    setScroll: (scroll) => set({ scroll }),
    setSelectedPhoto: (photo) => set({ selectedPhoto: photo }),
    setHoveredPhoto: (photo) => set({ hoveredPhoto: photo }),
    setCursorPosition: (pos) => set({ cursorPosition: pos }),
    setHandPresent: (present) => set({ handPresent: present }),
}));
