// ============================================================
// БЫСТРЫЕ ЗАМЕТКИ — сохраняются автоматически при наборе
// ============================================================

const notesInput = document.getElementById('notes-input');
const notesStatus = document.getElementById('notes-status');
const notesClearBtn = document.getElementById('notes-clear');

// Сохраняет заметки с задержкой 500мс (чтобы не писать при каждом нажатии клавиши)
const debouncedSaveNotes = debounce(() => {
    safeSetItem(NOTES_KEY, notesInput.value);
    notesStatus.textContent = 'Сохранено';
    notesStatus.classList.remove('saving');
}, 500);

// Загружает заметки при открытии страницы
function loadNotes() {
    const saved = localStorage.getItem(NOTES_KEY);
    if (saved !== null) notesInput.value = saved;
}

// При вводе текста — показываем "Сохранение..." и запускаем отложенное сохранение
notesInput.addEventListener('input', () => {
    notesStatus.textContent = 'Сохранение...';
    notesStatus.classList.add('saving');
    debouncedSaveNotes();
});

// Кнопка очистки заметок (с подтверждением)
notesClearBtn.addEventListener('click', () => {
    if (notesInput.value.trim() === '') return;
    if (confirm('Очистить все заметки?')) {
        notesInput.value = '';
        localStorage.removeItem(NOTES_KEY);
        notesStatus.textContent = 'Очищено';
        notesStatus.classList.remove('saving');
        setTimeout(() => { notesStatus.textContent = 'Сохранено'; }, 1500);
    }
});

loadNotes();