// FlowTime Pro - Ultra-Modern PWA Time Tracking App
// JavaScript Module - 2026 Edition

class FlowTimeApp {
    constructor() {
        this.timer = {
            isRunning: false,
            isPaused: false,
            startTime: null,
            pausedTime: 0,
            currentSession: 0,
            currentProjectId: 1,
            intervalId: null
        };

        this.data = {
            projects: [],
            sessions: [],
            settings: {
                defaultHourlyRate: 200,
                notifications: true,
                hapticFeedback: true,
                autoSave: true,
                theme: 'dark'
            }
        };

        this.elements = {};
        this.charts = {};
        this.installPromptEvent = null;
        this.currentEditProjectId = null;

        this.init();
    }

    init() {
        console.log('Initializing FlowTime Pro...');
        this.loadData();
        this.cacheElements();
        this.setupEventListeners();
        this.setupPWA();
        this.updateUI();
        
        // Show install prompt after delay
        setTimeout(() => this.showInstallPrompt(), 3000);
        console.log('FlowTime Pro initialized successfully');
    }

    loadData() {
        // Load data from localStorage or use defaults
        const savedData = localStorage.getItem('flowtime-data');
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                this.data = { ...this.data, ...parsed };
            } catch (e) {
                console.warn('Failed to parse saved data, using defaults');
            }
        }
        
        // Ensure we have default projects if none exist
        if (this.data.projects.length === 0) {
            this.data.projects = [
                {
                    id: 1,
                    name: "Web Development",
                    color: "#00F5FF",
                    hourlyRate: 250,
                    totalTime: 0,
                    totalEarnings: 0
                },
                {
                    id: 2,
                    name: "Consultation",
                    color: "#FF0080", 
                    hourlyRate: 200,
                    totalTime: 0,
                    totalEarnings: 0
                },
                {
                    id: 3,
                    name: "Database Design",
                    color: "#9D4EDD",
                    hourlyRate: 300,
                    totalTime: 0,
                    totalEarnings: 0
                }
            ];
            this.saveData();
        }
    }

    saveData() {
        try {
            localStorage.setItem('flowtime-data', JSON.stringify(this.data));
        } catch (e) {
            console.error('Failed to save ', e);
        }
    }

    cacheElements() {
        // Timer elements
        this.elements.timerDisplay = document.getElementById('timerDisplay');
        this.elements.earningsDisplay = document.getElementById('earningsDisplay');
        this.elements.progressCircle = document.getElementById('progressCircle');
        this.elements.currentProject = document.getElementById('currentProject');
        this.elements.startBtn = document.getElementById('startBtn');
        this.elements.pauseBtn = document.getElementById('pauseBtn');
        this.elements.stopBtn = document.getElementById('stopBtn');
        this.elements.todayTime = document.getElementById('todayTime');
        this.elements.todayEarnings = document.getElementById('todayEarnings');

        // Statistics elements
        this.elements.totalTime = document.getElementById('totalTime');
        this.elements.totalEarnings = document.getElementById('totalEarnings');
        this.elements.avgSession = document.getElementById('avgSession');
        this.elements.sessionsList = document.getElementById('sessionsList');
        this.elements.weeklyChart = document.getElementById('weeklyChart');

        // Projects elements
        this.elements.projectsList = document.getElementById('projectsList');
        this.elements.addProjectBtn = document.getElementById('addProjectBtn');
        this.elements.projectModal = document.getElementById('projectModal');
        this.elements.projectForm = document.getElementById('projectForm');
        this.elements.modalTitle = document.getElementById('modalTitle');
        this.elements.projectName = document.getElementById('projectName');
        this.elements.projectRate = document.getElementById('projectRate');
        this.elements.projectColor = document.getElementById('projectColor');
        this.elements.cancelProject = document.getElementById('cancelProject');

        // Settings elements
        this.elements.defaultRate = document.getElementById('defaultRate');
        this.elements.autoSave = document.getElementById('autoSave');
        this.elements.notifications = document.getElementById('notifications');
        this.elements.exportData = document.getElementById('exportData');
        this.elements.clearData = document.getElementById('clearData');

        // Navigation elements
        this.elements.navBtns = document.querySelectorAll('.nav-btn');
        this.elements.screens = document.querySelectorAll('.screen');

        // PWA elements
        this.elements.installPrompt = document.getElementById('installPrompt');
        this.elements.installBtn = document.getElementById('installBtn');
        this.elements.dismissInstall = document.getElementById('dismissInstall');
        this.elements.statusIndicator = document.getElementById('statusIndicator');
    }

    setupEventListeners() {
        // Timer controls
        this.elements.startBtn?.addEventListener('click', () => this.startTimer());
        this.elements.pauseBtn?.addEventListener('click', () => this.pauseTimer());
        this.elements.stopBtn?.addEventListener('click', () => this.stopTimer());

        // Navigation
        this.elements.navBtns?.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const screen = e.currentTarget.dataset.screen;
                this.switchScreen(screen);
            });
        });

        // Projects
        this.elements.addProjectBtn?.addEventListener('click', () => this.showProjectModal());
        this.elements.projectForm?.addEventListener('submit', (e) => this.saveProject(e));
        this.elements.cancelProject?.addEventListener('click', () => this.hideProjectModal());

        // Settings
        this.elements.defaultRate?.addEventListener('change', (e) => {
            this.data.settings.defaultHourlyRate = parseInt(e.target.value) || 200;
            this.saveData();
        });

        this.elements.autoSave?.addEventListener('change', (e) => {
            this.data.settings.autoSave = e.target.checked;
            this.saveData();
        });

        this.elements.notifications?.addEventListener('change', (e) => {
            this.data.settings.notifications = e.target.checked;
            this.saveData();
        });

        this.elements.exportData?.addEventListener('click', () => this.exportData());
        this.elements.clearData?.addEventListener('click', () => this.clearAllData());

        // PWA install
        this.elements.installBtn?.addEventListener('click', () => this.installApp());
        this.elements.dismissInstall?.addEventListener('click', () => this.dismissInstallPrompt());

        // Modal backdrop click
        this.elements.projectModal?.addEventListener('click', (e) => {
            if (e.target === this.elements.projectModal) {
                this.hideProjectModal();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !e.target.matches('input, textarea, select')) {
                e.preventDefault();
                if (this.timer.isRunning) {
                    this.pauseTimer();
                } else {
                    this.startTimer();
                }
            }
        });
    }

    setupPWA() {
        // Check for service worker support
        if ('serviceWorker' in navigator) {
            this.registerServiceWorker();
        }

        // Handle install prompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.installPromptEvent = e;
        });

        // Handle app installed
        window.addEventListener('appinstalled', () => {
            console.log('FlowTime Pro was installed');
            this.dismissInstallPrompt();
        });

        // Handle online/offline status
        window.addEventListener('online', () => this.updateConnectionStatus(true));
        window.addEventListener('offline', () => this.updateConnectionStatus(false));
    }

    async registerServiceWorker() {
        try {
            const registration = await navigator.serviceWorker.register('service-worker.js');
            console.log('Service Worker registered:', registration);
        } catch (error) {
            console.log('Service Worker registration failed:', error);
        }
    }

    updateConnectionStatus(isOnline) {
        const indicator = this.elements.statusIndicator;
        if (!indicator) return;

        if (isOnline) {
            indicator.classList.add('hidden');
        } else {
            indicator.classList.remove('hidden');
            indicator.querySelector('.status-text').textContent = 'Offline';
        }
    }

    // Timer Functions
    startTimer() {
        if (this.timer.isPaused) {
            // Resume from pause
            this.timer.startTime = Date.now() - this.timer.pausedTime;
            this.timer.isPaused = false;
        } else {
            // Start new session
            this.timer.startTime = Date.now();
            this.timer.currentSession = 0;
            this.timer.pausedTime = 0;
        }

        this.timer.isRunning = true;
        this.timer.intervalId = setInterval(() => this.updateTimer(), 100);
        
        this.updateTimerUI();
        this.hapticFeedback();

        // Request wake lock to prevent screen from sleeping
        this.requestWakeLock();
    }

    pauseTimer() {
        if (!this.timer.isRunning) return;

        this.timer.isRunning = false;
        this.timer.isPaused = true;
        this.timer.pausedTime = Date.now() - this.timer.startTime;
        
        if (this.timer.intervalId) {
            clearInterval(this.timer.intervalId);
            this.timer.intervalId = null;
        }

        this.updateTimerUI();
        this.hapticFeedback();
        this.releaseWakeLock();
    }

    stopTimer() {
        if (!this.timer.isRunning && !this.timer.isPaused) return;

        const sessionTime = this.timer.isPaused ? this.timer.pausedTime : Date.now() - this.timer.startTime;
        
        if (sessionTime > 5000) { // Only save sessions longer than 5 seconds
            this.saveSession(sessionTime);
        }

        // Reset timer
        this.timer.isRunning = false;
        this.timer.isPaused = false;
        this.timer.startTime = null;
        this.timer.currentSession = 0;
        this.timer.pausedTime = 0;

        if (this.timer.intervalId) {
            clearInterval(this.timer.intervalId);
            this.timer.intervalId = null;
        }

        this.updateTimerUI();
        this.updateStatistics();
        this.hapticFeedback();
        this.releaseWakeLock();
    }

    updateTimer() {
        if (!this.timer.isRunning) return;

        this.timer.currentSession = Date.now() - this.timer.startTime;
        this.updateTimerDisplay();
        this.updateProgress();
    }

    updateTimerDisplay() {
        if (!this.elements.timerDisplay) return;

        const time = this.formatTime(this.timer.currentSession);
        this.elements.timerDisplay.textContent = time;

        // Update earnings
        const currentProject = this.getCurrentProject();
        const hours = this.timer.currentSession / (1000 * 60 * 60);
        const earnings = hours * currentProject.hourlyRate;
        
        if (this.elements.earningsDisplay) {
            this.elements.earningsDisplay.textContent = `${Math.round(earnings)} Kč`;
        }
    }

    updateProgress() {
        if (!this.elements.progressCircle) return;

        // Update progress circle based on session time (max 4 hours = full circle)
        const maxTime = 4 * 60 * 60 * 1000; // 4 hours in milliseconds
        const progress = Math.min(this.timer.currentSession / maxTime, 1);
        const circumference = 565.48; // 2 * π * 90
        const offset = circumference - (progress * circumference);
        
        this.elements.progressCircle.style.strokeDashoffset = offset;
    }

    updateTimerUI() {
        const isRunning = this.timer.isRunning;
        const isPaused = this.timer.isPaused;

        // Update button visibility
        if (this.elements.startBtn) {
            this.elements.startBtn.classList.toggle('hidden', isRunning);
        }
        if (this.elements.pauseBtn) {
            this.elements.pauseBtn.classList.toggle('hidden', !isRunning);
        }
        if (this.elements.stopBtn) {
            this.elements.stopBtn.classList.toggle('hidden', !isRunning && !isPaused);
        }

        // Update timer display if stopped
        if (!isRunning && !isPaused) {
            if (this.elements.timerDisplay) {
                this.elements.timerDisplay.textContent = '00:00:00';
            }
            if (this.elements.earningsDisplay) {
                this.elements.earningsDisplay.textContent = '0 Kč';
            }
            if (this.elements.progressCircle) {
                this.elements.progressCircle.style.strokeDashoffset = '565.48';
            }
        }
    }

    saveSession(duration) {
        const session = {
            id: Date.now(),
            projectId: this.timer.currentProjectId,
            date: new Date().toISOString().split('T')[0],
            duration: duration,
            earnings: this.calculateEarnings(duration),
            notes: ''
        };

        this.data.sessions.push(session);
        
        // Update project totals
        const project = this.data.projects.find(p => p.id === session.projectId);
        if (project) {
            project.totalTime += duration;
            project.totalEarnings += session.earnings;
        }

        if (this.data.settings.autoSave) {
            this.saveData();
        }

        this.showNotification(`Relace uložena: ${this.formatTime(duration)}`);
    }

    calculateEarnings(duration) {
        const currentProject = this.getCurrentProject();
        const hours = duration / (1000 * 60 * 60);
        return Math.round(hours * currentProject.hourlyRate);
    }

    getCurrentProject() {
        return this.data.projects.find(p => p.id === this.timer.currentProjectId) || this.data.projects[0];
    }

    // Project Management
    showProjectModal(projectId = null) {
        this.currentEditProjectId = projectId;
        
        if (projectId) {
            const project = this.data.projects.find(p => p.id === projectId);
            if (project) {
                this.elements.modalTitle.textContent = 'Upravit projekt';
                this.elements.projectName.value = project.name;
                this.elements.projectRate.value = project.hourlyRate;
                this.elements.projectColor.value = project.color;
            }
        } else {
            this.elements.modalTitle.textContent = 'Nový projekt';
            this.elements.projectForm.reset();
            this.elements.projectColor.value = '#00F5FF';
        }

        this.elements.projectModal.classList.remove('hidden');
    }

    hideProjectModal() {
        this.elements.projectModal.classList.add('hidden');
        this.currentEditProjectId = null;
    }

    saveProject(e) {
        e.preventDefault();

        const name = this.elements.projectName.value.trim();
        const rate = parseInt(this.elements.projectRate.value);
        const color = this.elements.projectColor.value;

        if (!name || !rate) return;

        if (this.currentEditProjectId) {
            // Edit existing project
            const project = this.data.projects.find(p => p.id === this.currentEditProjectId);
            if (project) {
                project.name = name;
                project.hourlyRate = rate;
                project.color = color;
            }
        } else {
            // Add new project
            const newProject = {
                id: Date.now(),
                name: name,
                hourlyRate: rate,
                color: color,
                totalTime: 0,
                totalEarnings: 0
            };
            this.data.projects.push(newProject);
        }

        this.saveData();
        this.updateUI();
        this.hideProjectModal();
        this.hapticFeedback();
    }

    deleteProject(projectId) {
        if (this.data.projects.length <= 1) {
            this.showNotification('Nemůžete smazat poslední projekt');
            return;
        }

        if (confirm('Opravdu chcete smazat tento projekt?')) {
            this.data.projects = this.data.projects.filter(p => p.id !== projectId);
            
            // Update current project if deleted
            if (this.timer.currentProjectId === projectId) {
                this.timer.currentProjectId = this.data.projects[0].id;
            }

            // Remove sessions for this project
            this.data.sessions = this.data.sessions.filter(s => s.projectId !== projectId);

            this.saveData();
            this.updateUI();
            this.hapticFeedback();
        }
    }

    // UI Updates
    updateUI() {
        this.updateProjectsList();
        this.updateProjectSelector();
        this.updateStatistics();
        this.updateSettings();
        this.updateTodayStats();
    }

    updateProjectsList() {
        if (!this.elements.projectsList) return;

        this.elements.projectsList.innerHTML = this.data.projects.map(project => `
            <div class="project-card">
                <div class="project-info">
                    <div class="project-color" style="background-color: ${project.color}"></div>
                    <div class="project-details">
                        <h3>${project.name}</h3>
                        <p>${project.hourlyRate} Kč/h • ${this.formatTime(project.totalTime)}</p>
                    </div>
                </div>
                <div class="project-actions">
                    <button class="action-btn" onclick="app.showProjectModal(${project.id})" title="Upravit">
                        ✏️
                    </button>
                    <button class="action-btn" onclick="app.deleteProject(${project.id})" title="Smazat">
                        🗑️
                    </button>
                </div>
            </div>
        `).join('');
    }

    updateProjectSelector() {
        if (!this.elements.currentProject) return;

        this.elements.currentProject.innerHTML = this.data.projects.map(project => `
            <option value="${project.id}" ${project.id === this.timer.currentProjectId ? 'selected' : ''}>
                ${project.name}
            </option>
        `).join('');

        this.elements.currentProject.addEventListener('change', (e) => {
            this.timer.currentProjectId = parseInt(e.target.value);
        });
    }

    updateStatistics() {
        // Calculate totals
        const totalTime = this.data.projects.reduce((sum, p) => sum + p.totalTime, 0);
        const totalEarnings = this.data.projects.reduce((sum, p) => sum + p.totalEarnings, 0);
        const avgSession = this.data.sessions.length > 0 
            ? this.data.sessions.reduce((sum, s) => sum + s.duration, 0) / this.data.sessions.length 
            : 0;

        // Update UI
        if (this.elements.totalTime) {
            this.elements.totalTime.textContent = this.formatTime(totalTime);
        }
        if (this.elements.totalEarnings) {
            this.elements.totalEarnings.textContent = `${totalEarnings} Kč`;
        }
        if (this.elements.avgSession) {
            this.elements.avgSession.textContent = this.formatTime(avgSession);
        }

        this.updateSessionsList();
        this.updateChart();
    }

    updateSessionsList() {
        if (!this.elements.sessionsList) return;

        const recentSessions = this.data.sessions
            .slice(-10)
            .reverse();

        this.elements.sessionsList.innerHTML = recentSessions.map(session => {
            const project = this.data.projects.find(p => p.id === session.projectId);
            return `
                <div class="session-item">
                    <div class="session-info-left">
                        <div class="session-project">${project ? project.name : 'Neznámý projekt'}</div>
                        <div class="session-date">${this.formatDate(session.date)}</div>
                    </div>
                    <div class="session-stats">
                        <div class="session-duration">${this.formatTime(session.duration)}</div>
                        <div class="session-earnings">${session.earnings} Kč</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    updateChart() {
        if (!this.elements.weeklyChart) return;

        const canvas = this.elements.weeklyChart;
        const ctx = canvas.getContext('2d');
        
        // Simple bar chart for weekly data
        const weeklyData = this.getWeeklyData();
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw bars
        const barWidth = canvas.width / 7;
        const maxValue = Math.max(...weeklyData.map(d => d.duration)) || 1;
        
        weeklyData.forEach((data, index) => {
            const barHeight = (data.duration / maxValue) * (canvas.height - 40);
            const x = index * barWidth;
            const y = canvas.height - barHeight - 20;
            
            // Create gradient
            const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
            gradient.addColorStop(0, '#00F5FF');
            gradient.addColorStop(0.5, '#9D4EDD');
            gradient.addColorStop(1, '#FF0080');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(x + 5, y, barWidth - 10, barHeight);
            
            // Day label
            ctx.fillStyle = '#fff';
            ctx.font = '12px SF Pro Text';
            ctx.textAlign = 'center';
            ctx.fillText(data.day, x + barWidth/2, canvas.height - 5);
        });
    }

    getWeeklyData() {
        const days = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];
        const today = new Date();
        const weekData = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            const daySession = this.data.sessions
                .filter(s => s.date === dateStr)
                .reduce((sum, s) => sum + s.duration, 0);
            
            weekData.push({
                day: days[date.getDay() === 0 ? 6 : date.getDay() - 1],
                duration: daySession
            });
        }
        
        return weekData;
    }

    updateTodayStats() {
        const today = new Date().toISOString().split('T')[0];
        const todaySessions = this.data.sessions.filter(s => s.date === today);
        
        const todayTime = todaySessions.reduce((sum, s) => sum + s.duration, 0);
        const todayEarnings = todaySessions.reduce((sum, s) => sum + s.earnings, 0);
        
        if (this.elements.todayTime) {
            this.elements.todayTime.textContent = this.formatTime(todayTime);
        }
        if (this.elements.todayEarnings) {
            this.elements.todayEarnings.textContent = `${todayEarnings} Kč`;
        }
    }

    updateSettings() {
        if (this.elements.defaultRate) {
            this.elements.defaultRate.value = this.data.settings.defaultHourlyRate;
        }
        if (this.elements.autoSave) {
            this.elements.autoSave.checked = this.data.settings.autoSave;
        }
        if (this.elements.notifications) {
            this.elements.notifications.checked = this.data.settings.notifications;
        }
    }

    // Navigation
    switchScreen(screenName) {
        // Update navigation
        this.elements.navBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.screen === screenName);
        });

        // Update screens
        this.elements.screens.forEach(screen => {
            screen.classList.toggle('active', screen.id === screenName);
        });

        this.hapticFeedback();
    }

    // Utility Functions
    formatTime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Dnes';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Včera';
        } else {
            return date.toLocaleDateString('cs-CZ');
        }
    }

    hapticFeedback() {
        if (this.data.settings.hapticFeedback && 'vibrate' in navigator) {
            navigator.vibrate(50);
        }
    }

    showNotification(message) {
        if (this.data.settings.notifications && 'Notification' in window) {
            if (Notification.permission === 'granted') {
                new Notification('FlowTime Pro', {
                    body: message,
                    icon: 'image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIuMCA1MTIuMCI+PC9zdmc+'
                });
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        this.showNotification(message);
                    }
                });
            }
        }
        console.log('Notification:', message);
    }

    // PWA Functions
    showInstallPrompt() {
        if (this.installPromptEvent && this.elements.installPrompt) {
            this.elements.installPrompt.classList.remove('hidden');
        }
    }

    dismissInstallPrompt() {
        if (this.elements.installPrompt) {
            this.elements.installPrompt.classList.add('hidden');
        }
    }

    async installApp() {
        if (!this.installPromptEvent) return;

        const result = await this.installPromptEvent.prompt();
        console.log('Install prompt result:', result);

        this.installPromptEvent = null;
        this.dismissInstallPrompt();
    }

    // Wake Lock API
    async requestWakeLock() {
        try {
            if ('wakeLock' in navigator) {
                this.wakeLock = await navigator.wakeLock.request('screen');
                console.log('Wake lock acquired');
            }
        } catch (error) {
            console.log('Wake lock failed:', error);
        }
    }

    releaseWakeLock() {
        if (this.wakeLock) {
            this.wakeLock.release();
            this.wakeLock = null;
            console.log('Wake lock released');
        }
    }

    // Data Management
    exportData() {
        const dataToExport = {
            projects: this.data.projects,
            sessions: this.data.sessions,
            settings: this.data.settings,
            exportDate: new Date().toISOString()
        };

        const dataStr = JSON.stringify(dataToExport, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});

        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `flowtime-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();

        this.showNotification('Data exportována');
    }

    clearAllData() {
        if (confirm('POZOR: Tato akce smaže všechna data včetně projektů, relací a nastavení. Chcete pokračovat?')) {
            if (confirm('Jste si opravdu jisti? Tato akce se nedá vrátit zpět.')) {
                localStorage.removeItem('flowtime-data');
                location.reload();
            }
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new FlowTimeApp();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden && window.app?.timer.isRunning) {
        // App is hidden and timer is running
        console.log('App hidden, timer continues in background');
    } else if (!document.hidden && window.app?.timer.isRunning) {
        // App is visible again and timer is running
        console.log('App visible, syncing timer');
        window.app.updateTimer();
    }
});

// Prevent accidental page refresh when timer is running
window.addEventListener('beforeunload', (e) => {
    if (window.app?.timer.isRunning) {
        e.preventDefault();
        e.returnValue = 'Časovač běží. Opravdu chcete opustit stránku?';
        return e.returnValue;
    }
});
