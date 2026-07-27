// ============================================================
// БЫСТРЫЕ ЗАМЕТКИ — сохраняются автоматически при наборе
// ============================================================

const notesInput = document.getElementById('notes-input');
const notesStatus = document.getElementById('notes-status');
const notesClearBtn = document.getElementById('notes-clear');
const notesCounter = document.getElementById('notes-counter'); // Счётчик символов

// Максимальное количество символов в заметках
const MAX_NOTES_LENGTH = 1000;

// Обновляет счётчик и меняет цвет при приближении к лимиту
function updateCounter() {
    const current = notesInput.value.length;
    notesCounter.textContent = `${current} / ${MAX_NOTES_LENGTH}`;
    
    // Сбрасываем старые цвета
    notesCounter.classList.remove('warning', 'danger');
    
    // Красный — лимит достигнут
    if (current >= MAX_NOTES_LENGTH) {
        notesCounter.classList.add('danger');
    }
    // Оранжевый — больше 90% лимита
    else if (current >= MAX_NOTES_LENGTH * 0.9) {
        notesCounter.classList.add('warning');
    }
}

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
    updateCounter(); // Показываем актуальный счётчик
}

// При вводе текста — показываем "Сохранение..." и запускаем отложенное сохранение
notesInput.addEventListener('input', () => {
    updateCounter(); // Сразу обновляем счётчик
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
        updateCounter(); // Обнуляем счётчик
        setTimeout(() => { notesStatus.textContent = 'Сохранено'; }, 1500);
    }
});

loadNotes();