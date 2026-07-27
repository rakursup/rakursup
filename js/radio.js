// ============================================================
// ОНЛАЙН-РАДИО — аудиоплеер с 5 станциями
// ============================================================

// Список радиостанций
const RADIO_STATIONS = [
    { name: 'Relax FM', url: 'http://23.105.238.4/gpm-relaxfm495.aacp' },
    { name: 'Record Chill', url: 'https://radiorecord.hostingradio.ru/chil96.aacp' },
    { name: 'Monte Carlo', url: 'https://montecarlo.hostingradio.ru/montecarlo128.mp3' },
    { name: 'Jazz FM', url: 'http://nashe1.hostingradio.ru/jazz-128.mp3' },
    { name: 'Chillout Radio', url: 'https://stream.zeno.fm/f3wvbbqmdg8uv' }
];

let currentStation = 0, isPlaying = false, errorRetryTimer = null, consecutiveErrors = 0;

// DOM-элементы плеера
const audioEl = document.getElementById('radio-audio');
const playBtn = document.getElementById('radio-play');
const playIcon = document.getElementById('radio-play-icon');
const prevBtn = document.getElementById('radio-prev');
const nextBtn = document.getElementById('radio-next');
const volumeSlider = document.getElementById('radio-volume');
const stationName = document.getElementById('radio-name');
const equalizer = document.getElementById('radio-eq');
const errorEl = document.getElementById('radio-error');

// SVG-пути для иконок Play/Pause
const PLAY_PATH = 'M8 5v14l11-7z';
const PAUSE_PATH = 'M6 19h4V5H6v14zm8-14v14h4V5h-4z';

// Загружает сохранённую станцию и громкость
function loadRadioState() {
    try {
        const saved = JSON.parse(localStorage.getItem(RADIO_STORAGE_KEY));
        if (saved) {
            currentStation = Math.min(saved.station || 0, RADIO_STATIONS.length - 1);
            volumeSlider.value = saved.volume ?? 50;
            audioEl.volume = (saved.volume ?? 50) / 100;
        }
    } catch (e) {}
    stationName.textContent = RADIO_STATIONS[currentStation].name;
}

// Сохраняет состояние с задержкой (чтобы не писать в localStorage слишком часто)
const debouncedSaveRadio = debounce(() => {
    safeSetItem(RADIO_STORAGE_KEY, JSON.stringify({ station: currentStation, volume: parseInt(volumeSlider.value) }));
}, 300);

function saveRadioState() { debouncedSaveRadio(); }

// Меняет иконку Play/Pause и анимацию эквалайзера
function updatePlayButton() {
    playIcon.innerHTML = `<path d="${isPlaying ? PAUSE_PATH : PLAY_PATH}"/>`;
    playBtn.classList.toggle('playing', isPlaying);
    equalizer.classList.toggle('active', isPlaying);
}

function showError(msg) {
    errorEl.textContent = msg;
    errorEl.style.display = 'block';
    equalizer.classList.remove('active');
}

function hideError() { errorEl.style.display = 'none'; errorEl.textContent = ''; }

// Останавливает радио
function stopRadio() {
    clearTimeout(errorRetryTimer);
    audioEl.pause();
    audioEl.removeAttribute('src');
    audioEl.load();
    isPlaying = false;
    updatePlayButton();
}

// Запускает текущую станцию
function playCurrentStation() {
    clearTimeout(errorRetryTimer);
    hideError();
    stationName.textContent = RADIO_STATIONS[currentStation].name;
    audioEl.src = RADIO_STATIONS[currentStation].url;
    audioEl.load();
    const playPromise = audioEl.play();
    if (playPromise) {
        equalizer.classList.add('active');
        playPromise.then(() => {
            isPlaying = true;
            consecutiveErrors = 0;
            updatePlayButton();
        }).catch(err => {
            if (err.name === 'NotAllowedError') {
                equalizer.classList.remove('active');
                isPlaying = false;
                updatePlayButton();
            } else {
                handleStreamError();
            }
        });
    }
    saveRadioState();
}

// Обработчик ошибок потока: переключает на следующую станцию
function handleStreamError() {
    consecutiveErrors++;
    if (consecutiveErrors >= RADIO_STATIONS.length) {
        showError('Все станции недоступны');
        stopRadio();
        return;
    }
    showError(`Ошибка потока. Переключение... (${consecutiveErrors}/${RADIO_STATIONS.length})`);
    errorRetryTimer = setTimeout(() => {
        currentStation = (currentStation + 1) % RADIO_STATIONS.length;
        playCurrentStation();
    }, 3000);
}

function togglePlay() {
    if (isPlaying) stopRadio();
    else { consecutiveErrors = 0; playCurrentStation(); }
}

function switchStation(delta) {
    clearTimeout(errorRetryTimer);
    consecutiveErrors = 0;
    currentStation = ((currentStation + delta) % RADIO_STATIONS.length + RADIO_STATIONS.length) % RADIO_STATIONS.length;
    stationName.textContent = RADIO_STATIONS[currentStation].name;
    saveRadioState();
    if (isPlaying) playCurrentStation();
    else hideError();
}

// Привязываем обработчики к кнопкам
playBtn.addEventListener('click', togglePlay);
prevBtn.addEventListener('click', () => switchStation(-1));
nextBtn.addEventListener('click', () => switchStation(1));
volumeSlider.addEventListener('input', function() { audioEl.volume = this.value / 100; saveRadioState(); });
audioEl.addEventListener('error', handleStreamError);
audioEl.addEventListener('stalled', () => { if (isPlaying) equalizer.classList.add('active'); });
audioEl.addEventListener('waiting', () => { if (isPlaying) equalizer.classList.add('active'); });
audioEl.addEventListener('playing', () => { hideError(); isPlaying = true; consecutiveErrors = 0; updatePlayButton(); });
loadRadioState();