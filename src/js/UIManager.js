// UIManager.js
import { appState } from './State.js';
import { AudioFeedback } from './AudioFeedback.js';

export class UIManager {
    constructor() {
        // --- Загрузка DOM элементов ---
        this.notesUI = document.getElementById('notes-ui');
        this.noteInput = document.getElementById('note-input');
        this.saveNoteBtn = document.getElementById('save-note-btn');

        this.addPhotoBtn = document.getElementById('add-photo-btn');
        this.fileInput = document.getElementById('photo-input');

        // --- Кнопка добавления фото ---
        if (this.addPhotoBtn && this.fileInput) {
            this.addPhotoBtn.addEventListener('click', () => {
                this.fileInput.click();
            });

            this.fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const url = URL.createObjectURL(file);
                    const photos = appState.get('photos');
                    appState.set('photos', [...photos, url]);
                }
                // Сброс инпута для повторного выбора того же файла
                this.fileInput.value = '';
            });
        }

        // --- Кнопка сохранения заметки ---
        if (this.saveNoteBtn) {
            this.saveNoteBtn.addEventListener('click', () => {
                const text = this.noteInput.value;
                const selected = appState.get('selectedPhoto');
                if (selected !== null) {
                    const notes = { ...appState.get('notes') };
                    notes[selected] = text;
                    appState.set('notes', notes);
                    AudioFeedback.select();
                    this.saveNoteBtn.textContent = "Saved!";
                    setTimeout(() => this.saveNoteBtn.textContent = "Save Note", 1000);
                }
            });
        }

        // --- Подписка на выбор фото ---
        appState.subscribe((key, value) => {
            if (key === 'selectedPhoto') {
                if (value !== null) {
                    // Показать заметку
                    this.notesUI.style.display = 'block';
                    const notes = appState.get('notes');
                    this.noteInput.value = notes[value] || '';
                } else {
                    // Скрыть заметку
                    this.notesUI.style.display = 'none';
                    this.noteInput.value = '';
                }
            }

            // Обновление кнопки добавления фото на случай изменения состояния
            if (key === 'photos') {
                if (this.addPhotoBtn) this.addPhotoBtn.style.display = 'block';
            }
        });
    }
}
