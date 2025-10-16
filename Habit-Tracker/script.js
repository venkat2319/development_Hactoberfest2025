class HabitTracker {
    constructor() {
        this.habits = JSON.parse(localStorage.getItem('habits')) || [];
        this.habitToDelete = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderHabits();
        this.renderWeekDays();
        this.updateStats();
    }

    bindEvents() {
        // Add habit button
        document.getElementById('addHabitBtn').addEventListener('click', () => this.addHabit());

        // Enter key in input
        document.getElementById('habitInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addHabit();
        });

        // Modal events
        document.getElementById('confirmDelete').addEventListener('click', () => this.deleteHabit());
        document.getElementById('cancelDelete').addEventListener('click', () => this.closeModal());
    }

    addHabit() {
        const input = document.getElementById('habitInput');
        const habitName = input.value.trim();

        if (habitName === '') {
            alert('Please enter a habit name');
            return;
        }

        if (this.habits.some(habit => habit.name.toLowerCase() === habitName.toLowerCase())) {
            alert('This habit already exists!');
            return;
        }

        const newHabit = {
            id: Date.now().toString(),
            name: habitName,
            createdAt: new Date().toISOString(),
            completions: {},
            currentStreak: 0,
            longestStreak: 0
        };

        this.habits.push(newHabit);
        this.saveToLocalStorage();
        this.renderHabits();
        this.updateStats();

        input.value = '';
        input.focus();
    }

    deleteHabit(habitId = null) {
        if (habitId) {
            this.habitToDelete = habitId;
            this.showModal();
        } else if (this.habitToDelete) {
            this.habits = this.habits.filter(habit => habit.id !== this.habitToDelete);
            this.saveToLocalStorage();
            this.renderHabits();
            this.updateStats();
            this.closeModal();
            this.habitToDelete = null;
        }
    }

    toggleHabitCompletion(habitId, date) {
        const habit = this.habits.find(h => h.id === habitId);
        if (!habit) return;

        const dateKey = this.formatDateKey(date);

        if (habit.completions[dateKey]) {
            delete habit.completions[dateKey];
        } else {
            habit.completions[dateKey] = true;
        }

        this.updateStreak(habit);
        this.saveToLocalStorage();
        this.renderHabits();
        this.updateStats();
    }

    updateStreak(habit) {
        let currentStreak = 0;
        let currentDate = new Date();

        while (true) {
            const dateKey = this.formatDateKey(currentDate);
            if (habit.completions[dateKey]) {
                currentStreak++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else {
                break;
            }
        }

        habit.currentStreak = currentStreak;
        habit.longestStreak = Math.max(habit.longestStreak, currentStreak);
    }

    formatDateKey(date) {
        return date.toISOString().split('T')[0];
    }

    getWeekDates() {
        const dates = [];
        const today = new Date();

        // Start from Monday of the current week
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - today.getDay() + 1);

        for (let i = 0; i < 7; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            dates.push(date);
        }

        return dates;
    }

    renderHabits() {
        const container = document.getElementById('habitsContainer');

        if (this.habits.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list fa-3x"></i>
                    <h3>No habits yet</h3>
                    <p>Add your first habit to start tracking!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.habits.map(habit => `
            <div class="habit-card">
                <div class="habit-header">
                    <div class="habit-name">${habit.name}</div>
                    <div class="habit-actions">
                        <button class="btn-icon btn-delete" onclick="tracker.deleteHabit('${habit.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                <div class="habit-progress">
                    <div class="streak-info">
                        <span>Current Streak: <span class="streak-count">${habit.currentStreak} days</span></span>
                        <span>Best: ${habit.longestStreak} days</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${Math.min((habit.currentStreak / 21) * 100, 100)}%"></div>
                    </div>
                </div>
                
                <div class="week-days-grid">
                    ${this.getWeekDates().map(date => {
            const dateKey = this.formatDateKey(date);
            const isCompleted = habit.completions[dateKey];
            const isToday = this.formatDateKey(new Date()) === dateKey;
            const isFuture = date > new Date();

            let className = 'day-cell';
            if (isCompleted) className += ' completed';
            else if (!isFuture && !isCompleted) className += ' missed';

            return `
                            <div class="${className}" 
                                 onclick="${!isFuture ? `tracker.toggleHabitCompletion('${habit.id}', new Date('${date.toISOString()}'))` : ''}">
                                <div class="day-name">${date.toLocaleDateString('en', { weekday: 'short' })}</div>
                                <div class="day-date">${date.getDate()}</div>
                            </div>
                        `;
        }).join('')}
                </div>
            </div>
        `).join('');
    }

    renderWeekDays() {
        const container = document.getElementById('weekDays');
        const weekDates = this.getWeekDates();

        container.innerHTML = `
            <div class="week-days-grid">
                ${weekDates.map(date => `
                    <div class="day-cell ${this.formatDateKey(new Date()) === this.formatDateKey(date) ? 'completed' : ''}">
                        <div class="day-name">${date.toLocaleDateString('en', { weekday: 'short' })}</div>
                        <div class="day-date">${date.getDate()}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    updateStats() {
        const todayKey = this.formatDateKey(new Date());
        const completedToday = this.habits.filter(habit => habit.completions[todayKey]).length;
        const totalCompleted = this.habits.reduce((sum, habit) => sum + Object.keys(habit.completions).length, 0);
        const totalPossible = this.habits.length * 7; // Last 7 days
        const successRate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

        document.getElementById('totalHabits').textContent = this.habits.length;
        document.getElementById('completedToday').textContent = completedToday;
        document.getElementById('currentStreak').textContent = Math.max(...this.habits.map(h => h.currentStreak), 0);
        document.getElementById('successRate').textContent = `${successRate}%`;
    }

    showModal() {
        document.getElementById('confirmationModal').style.display = 'flex';
    }

    closeModal() {
        document.getElementById('confirmationModal').style.display = 'none';
        this.habitToDelete = null;
    }

    saveToLocalStorage() {
        localStorage.setItem('habits', JSON.stringify(this.habits));
    }
}

// Initialize the tracker when the page loads
const tracker = new HabitTracker();

// Close modal when clicking outside
document.getElementById('confirmationModal').addEventListener('click', (e) => {
    if (e.target.id === 'confirmationModal') {
        tracker.closeModal();
    }
});