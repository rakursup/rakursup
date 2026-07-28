// ============================================================
// КАЛЕНДАРЬ — показывает текущий месяц с навигацией
// ============================================================

const calGrid = document.getElementById('cal-grid');
const calMonthYear = document.getElementById('cal-current-month-year');
const calPrevBtn = document.getElementById('cal-prev-month');
const calNextBtn = document.getElementById('cal-next-month');
let currentCalDate = new Date(); // Текущий отображаемый месяц

// Отрисовывает календарь на указанную дату
function renderCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay(); // День недели первого числа
    const lastDate = new Date(year, month + 1, 0).getDate(); // Кол-во дней в месяце
    const today = new Date();

    calMonthYear.textContent = date.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
    calGrid.innerHTML = '';

    // Добавляем "пустые" дни предыдущего месяца
    for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
        const dayCell = document.createElement('div');
        dayCell.className = 'calendar-day other-month';
        dayCell.textContent = new Date(year, month, i - (firstDay === 0 ? 6 : firstDay - 1) + 1).getDate();
        calGrid.appendChild(dayCell);
    }

    // Добавляем дни текущего месяца
    for (let i = 1; i <= lastDate; i++) {
        const dayCell = document.createElement('div');
        dayCell.className = 'calendar-day';
        dayCell.textContent = i;
        // Подсвечиваем сегодняшний день
        if (today.getFullYear() === year && today.getMonth() === month && today.getDate() === i) {
            dayCell.classList.add('today');
        }
        calGrid.appendChild(dayCell);
    }
}

// Кнопки навигации: предыдущий/следующий месяц
calPrevBtn.addEventListener('click', () => {
    currentCalDate.setDate(1); // ✔ защита: 31-е число не переполнит короткий месяц
    currentCalDate.setMonth(currentCalDate.getMonth() - 1);
    renderCalendar(currentCalDate);
});

calNextBtn.addEventListener('click', () => {
    currentCalDate.setDate(1);
    currentCalDate.setMonth(currentCalDate.getMonth() + 1);
    renderCalendar(currentCalDate);
});

renderCalendar(currentCalDate);