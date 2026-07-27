// ============================================================
// ПОМОДОРО ТАЙМЕР — техника продуктивности (25/5/15 минут)
// ============================================================

// Настройки таймера (в минутах)
const POMO_WORK_MIN = 25;              // Время работы
const POMO_SHORT_BREAK_MIN = 5;        // Короткий перерыв
const POMO_LONG_BREAK_MIN = 15;        // Длинный перерыв
const POMO_SESSIONS_BEFORE_LONG = 4;   // После 4 рабочих сессий — длинный перерыв

// DOM-элементы
const pomoModeEl = document.getElementById('pomo-mode');
const pomoTimeEl = document.getElementById('pomo-time');
const pomoBarEl = document.getElementById('pomo-bar');
const pomoStartBtn = document.getElementById('pomo-start');
const pomoResetBtn = document.getElementById('pomo-reset');
const pomoDots = [
    document.getElementById('dot-1'),
    document.getElementById('dot-2'),
    document.getElementById('dot-3'),
    document.getElementById('dot-4')
];

// Текущее состояние таймера
let pomoState = {
    mode: 'work',
    timeLeft: POMO_WORK_MIN * 60,
    totalTime: POMO_WORK_MIN * 60,
    running: false,
    completedSessions: 0
};
let pomoInterval = null;

// Загружает состояние из localStorage
function loadPomoState() {
    try {
        const saved = JSON.parse(localStorage.getItem(POMO_KEY));
        if (saved) {
            pomoState.mode = saved.mode || 'work';
            pomoState.timeLeft = saved.timeLeft ?? POMO_WORK_MIN * 60;
            pomoState.totalTime = saved.totalTime ?? POMO_WORK_MIN * 60;
            pomoState.completedSessions = saved.completedSessions ?? 0;
            pomoState.running = false;
        }
    } catch (e) {}
}

function savePomoState() {
    safeSetItem(POMO_KEY, JSON.stringify({
        mode: pomoState.mode,
        timeLeft: pomoState.timeLeft,
        totalTime: pomoState.totalTime,
        completedSessions: pomoState.completedSessions
    }));
}

// Форматирует секунды в вид "MM:SS"
function formatPomoTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// Обновляет все элементы таймера на экране
function updatePomoDisplay() {
    pomoTimeEl.textContent = formatPomoTime(pomoState.timeLeft);
    const progress = pomoState.totalTime > 0 ? (pomoState.timeLeft / pomoState.totalTime) * 100 : 0;
    pomoBarEl.style.width = `${progress}%`;

    // Меняем режим (работа/перерыв)
    if (pomoState.mode === 'work') {
        pomoModeEl.textContent = 'Фокус';
        pomoBarEl.classList.remove('break-mode');
    } else if (pomoState.mode === 'shortBreak') {
        pomoModeEl.textContent = 'Перерыв';
        pomoBarEl.classList.add('break-mode');
    } else {
        pomoModeEl.textContent = 'Длинный перерыв';
        pomoBarEl.classList.add('break-mode');
    }

    // Меняем текст кнопки
    pomoStartBtn.textContent = pomoState.running ? '⏸ Пауза' : '▶ Старт';
    pomoStartBtn.classList.toggle('running', pomoState.running);

    // Обновляем точки прогресса сессий
    pomoDots.forEach((dot, i) => {
        dot.classList.remove('completed', 'active');
        if (i < pomoState.completedSessions) dot.classList.add('completed');
        if (i === pomoState.completedSessions && pomoState.mode === 'work') dot.classList.add('active');
    });

    // Меняем заголовок вкладки (видно, когда вкладка неактивна)
    if (pomoState.running) {
        document.title = `${formatPomoTime(pomoState.timeLeft)} — ${pomoState.mode === 'work' ? 'Фокус' : 'Перерыв'}`;
    } else {
        document.title = 'Дашборд | Стартовая';
    }
}

// Тикает каждую секунду
function pomoTick() {
    if (pomoState.timeLeft <= 0) {
        clearInterval(pomoInterval);
        pomoInterval = null;
        pomoState.running = false;

        // Играем звуковой сигнал через Web Audio API
        try {
            const actx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = actx.createOscillator();
            const gain = actx.createGain();
            osc.connect(gain);
            gain.connect(actx.destination);
            osc.frequency.value = pomoState.mode === 'work' ? 880 : 660;
            gain.gain.value = 0.3;
            osc.start();
            osc.stop(actx.currentTime + 0.3);
            setTimeout(() => {
                const o2 = actx.createOscillator();
                const g2 = actx.createGain();
                o2.connect(g2);
                g2.connect(actx.destination);
                o2.frequency.value = pomoState.mode === 'work' ? 1100 : 880;
                g2.gain.value = 0.3;
                o2.start();
                o2.stop(actx.currentTime + 0.3);
            }, 350);
        } catch (e) {}

        // Переходим в следующий режим
        if (pomoState.mode === 'work') {
            pomoState.completedSessions++;
            if (pomoState.completedSessions >= POMO_SESSIONS_BEFORE_LONG) {
                pomoState.mode = 'longBreak';
                pomoState.timeLeft = POMO_LONG_BREAK_MIN * 60;
                pomoState.totalTime = POMO_LONG_BREAK_MIN * 60;
                pomoState.completedSessions = 0;
            } else {
                pomoState.mode = 'shortBreak';
                pomoState.timeLeft = POMO_SHORT_BREAK_MIN * 60;
                pomoState.totalTime = POMO_SHORT_BREAK_MIN * 60;
            }
        } else {
            pomoState.mode = 'work';
            pomoState.timeLeft = POMO_WORK_MIN * 60;
            pomoState.totalTime = POMO_WORK_MIN * 60;
        }
        savePomoState();
        updatePomoDisplay();
        return;
    }
    pomoState.timeLeft--;
    savePomoState();
    updatePomoDisplay();
}

// Старт/пауза таймера
function togglePomo() {
    if (pomoState.running) {
        clearInterval(pomoInterval);
        pomoInterval = null;
        pomoState.running = false;
    } else {
        pomoState.running = true;
        pomoInterval = setInterval(pomoTick, 1000);
    }
    savePomoState();
    updatePomoDisplay();
}

// Сброс таймера в исходное состояние
function resetPomo() {
    clearInterval(pomoInterval);
    pomoInterval = null;
    pomoState.running = false;
    pomoState.mode = 'work';
    pomoState.timeLeft = POMO_WORK_MIN * 60;
    pomoState.totalTime = POMO_WORK_MIN * 60;
    pomoState.completedSessions = 0;
    savePomoState();
    updatePomoDisplay();
}

pomoStartBtn.addEventListener('click', togglePomo);
pomoResetBtn.addEventListener('click', resetPomo);
loadPomoState();
updatePomoDisplay();