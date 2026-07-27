// ============================================================
// КУРСЫ ВАЛЮТ — показывает курсы THB, USD, EUR к RUB
// ============================================================

const CURRENCY_UPDATE_INTERVAL = 60 * 60 * 1000; // Обновление раз в час

// Какие валюты показывать
const CURRENCY_PAIRS = [
    { from: 'THB', to: 'RUB', flag: '🇹🇭', label: 'THB → RUB' },
    { from: 'USD', to: 'RUB', flag: '🇺🇸', label: 'USD → RUB' },
    { from: 'EUR', to: 'RUB', flag: '🇪🇺', label: 'EUR → RUB' }
];

// Запрашивает курсы с API exchangerate-api.com (бесплатно)
async function fetchCurrencies() {
    const container = document.getElementById('currency-list'), dateEl = document.getElementById('currency-date');
    try {
        const res = await fetch('https://api.exchangerate-api.com/v4/latest/RUB');
        const data = await res.json();
        let html = '';
        CURRENCY_PAIRS.forEach(pair => {
            const r = data.rates[pair.from];
            html += `<div class="currency-row"><div class="currency-pair"><span class="currency-flag">${pair.flag}</span><span>${pair.label}</span></div><div><span class="currency-rate">${r ? (1 / r).toFixed(2) : '--'} ₽</span></div></div>`;
        });
        container.innerHTML = html;
        dateEl.textContent = `Обновлено: ${new Date(data.date).toLocaleDateString('ru-RU')}`;
    } catch (e) {
        container.innerHTML = '<div class="currency-loading">Не удалось загрузить курсы</div>';
        dateEl.textContent = '';
    }
}

fetchCurrencies();
setInterval(fetchCurrencies, CURRENCY_UPDATE_INTERVAL);