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
        this.currentEditSessionId = null;

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
                    name: "Adršpach",
                    color: "#00F5FF",
                    hourlyRate: 200,
                    totalTime: 0,
                    totalEarnings: 0
                },
                {
                    id: 2,
                    name: "Burger fest",
                    color: "#FF0080",
                    hourlyRate: 200,
                    totalTime: 0,
                    totalEarnings: 0
                },
                {
                    id: 3,
                    name: "Pivo",
                    color: "#9D4EDD",
                    hourlyRate: 200,
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
        this.elements.addManualBtn = document.getElementById('addManualBtn');
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

        // Session modal elements
        this.elements.sessionModal = document.getElementById('sessionModal');
        this.elements.sessionForm = document.getElementById('sessionForm');
        this.elements.sessionModalTitle = document.getElementById('sessionModalTitle');
        this.elements.sessionProject = document.getElementById('sessionProject');
        this.elements.sessionDate = document.getElementById('sessionDate');
        this.elements.sessionStartTime = document.getElementById('sessionStartTime');
        this.elements.sessionEndTime = document.getElementById('sessionEndTime');
        this.elements.sessionDuration = document.getElementById('sessionDuration');
        this.elements.sessionNotes = document.getElementById('sessionNotes');
        this.elements.cancelSession = document.getElementById('cancelSession');

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
        this.elements.addManualBtn?.addEventListener('click', () => this.showSessionModal());

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

        // Sessions
        this.elements.sessionForm?.addEventListener('submit', (e) => this.saveSession(e));
        this.elements.cancelSession?.addEventListener('click', () => this.hideSessionModal());

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

        // Modal backdrop clicks
        this.elements.projectModal?.addEventListener('click', (e) => {
            if (e.target === this.elements.projectModal) {
                this.hideProjectModal();
            }
        });

        this.elements.sessionModal?.addEventListener('click', (e) => {
            if (e.target === this.elements.sessionModal) {
                this.hideSessionModal();
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

        // Auto-calculate duration in session modal
        this.elements.sessionStartTime?.addEventListener('change', () => this.calculateSessionDuration());
        this.elements.sessionEndTime?.addEventListener('change', () => this.calculateSessionDuration());
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
            this.saveTimerSession(sessionTime);
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
        this.updateTodayStats();
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

        const time = this.formatTimeForDisplay(this.timer.currentSession);
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
        const circumference = 628.32; // 2 * π * 100 (větší radius pro větší časovač)
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
                this.elements.progressCircle.style.strokeDashoffset = '628.32';
            }
        }
    }

    saveTimerSession(duration) {
        const session = {
            id: Date.now(),
            projectId: this.timer.currentProjectId,
            date: new Date().toISOString().split('T')[0],
            duration: duration,
            earnings: this.calculateEarnings(duration),
            notes: '',
            type: 'timer'
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

        this.updateTodayStats();
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

    // Session Management
    showSessionModal(sessionId = null) {
        this.currentEditSessionId = sessionId;
        const now = new Date();

        if (sessionId) {
            const session = this.data.sessions.find(s => s.id === sessionId);
            if (session) {
                this.elements.sessionModalTitle.textContent = 'Upravit relaci';
                this.elements.sessionProject.value = session.projectId;
                this.elements.sessionDate.value = session.date;
                this.elements.sessionNotes.value = session.notes || '';
                
                // Calculate start and end times from duration
                const sessionDate = new Date(session.date);
                const endTime = new Date(sessionDate.getTime() + session.duration);
                
                this.elements.sessionStartTime.value = this.formatTimeForInput(sessionDate);
                this.elements.sessionEndTime.value = this.formatTimeForInput(endTime);
                this.elements.sessionDuration.value = Math.round(session.duration / (1000 * 60)); // minutes
            }
        } else {
            this.elements.sessionModalTitle.textContent = 'Přidat relaci ručně';
            this.elements.sessionProject.value = this.timer.currentProjectId;
            this.elements.sessionDate.value = now.toISOString().split('T')[0];
            this.elements.sessionStartTime.value = this.formatTimeForInput(new Date(now.getTime() - 60 * 60 * 1000)); // 1 hour ago
            this.elements.sessionEndTime.value = this.formatTimeForInput(now);
            this.elements.sessionDuration.value = '60'; // 1 hour default
            this.elements.sessionNotes.value = '';
        }

        this.updateSessionProjectOptions();
        this.calculateSessionDuration();
        this.elements.sessionModal.classList.remove('hidden');
    }

    hideSessionModal() {
        this.elements.sessionModal.classList.add('hidden');
        this.currentEditSessionId = null;
    }

    updateSessionProjectOptions() {
        if (!this.elements.sessionProject) return;

        this.elements.sessionProject.innerHTML = this.data.projects.map(project => `
            <option value="${project.id}">${project.name} (${project.hourlyRate} Kč/h)</option>
        `).join('');
    }

    calculateSessionDuration() {
        const startTime = this.elements.sessionStartTime?.value;
        const endTime = this.elements.sessionEndTime?.value;
        
        if (startTime && endTime) {
            const start = new Date(`2000-01-01T${startTime}`);
            const end = new Date(`2000-01-01T${endTime}`);
            const duration = (end - start) / (1000 * 60); // minutes
            
            if (duration > 0) {
                this.elements.sessionDuration.value = Math.round(duration);
            }
        }
    }

    saveSession(e) {
        e.preventDefault();

        const projectId = parseInt(this.elements.sessionProject.value);
        const date = this.elements.sessionDate.value;
        const duration = parseInt(this.elements.sessionDuration.value) * 60 * 1000; // convert to milliseconds
        const notes = this.elements.sessionNotes.value.trim();

        if (!projectId || !date || !duration || duration <= 0) {
            alert('Prosím vyplňte všechna povinná pole');
            return;
        }

        const project = this.data.projects.find(p => p.id === projectId);
        const earnings = Math.round((duration / (1000 * 60 * 60)) * project.hourlyRate);

        if (this.currentEditSessionId) {
            // Edit existing session
            const sessionIndex = this.data.sessions.findIndex(s => s.id === this.currentEditSessionId);
            if (sessionIndex !== -1) {
                const oldSession = this.data.sessions[sessionIndex];
                const oldProject = this.data.projects.find(p => p.id === oldSession.projectId);
                
                // Remove old values from project totals
                if (oldProject) {
                    oldProject.totalTime -= oldSession.duration;
                    oldProject.totalEarnings -= oldSession.earnings;
                }

                // Update session
                this.data.sessions[sessionIndex] = {
                    ...oldSession,
                    projectId: projectId,
                    date: date,
                    duration: duration,
                    earnings: earnings,
                    notes: notes,
                    type: 'manual'
                };

                // Add new values to project totals
                if (project) {
                    project.totalTime += duration;
                    project.totalEarnings += earnings;
                }
            }
        } else {
            // Add new session
            const session = {
                id: Date.now(),
                projectId: projectId,
                date: date,
                duration: duration,
                earnings: earnings,
                notes: notes,
                type: 'manual'
            };

            this.data.sessions.push(session);

            // Update project totals
            if (project) {
                project.totalTime += duration;
                project.totalEarnings += earnings;
            }
        }

        this.saveData();
        this.updateUI();
        this.hideSessionModal();
        this.hapticFeedback();
        
        this.showNotification(this.currentEditSessionId ? 'Relace upravena' : 'Relace přidána');
    }

    deleteSession(sessionId) {
        if (!confirm('Opravdu chcete smazat tuto relaci?')) return;

        const sessionIndex = this.data.sessions.findIndex(s => s.id === sessionId);
        if (sessionIndex !== -1) {
            const session = this.data.sessions[sessionIndex];
            const project = this.data.projects.find(p => p.id === session.projectId);

            // Remove from project totals
            if (project) {
                project.totalTime -= session.duration;
                project.totalEarnings -= session.earnings;
            }

            // Remove session
            this.data.sessions.splice(sessionIndex, 1);

            this.saveData();
            this.updateUI();
            this.showNotification('Relace smazána');
        }
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
        // Load statistics module if available
        if (window.Statistics) {
            this.statistics = new window.Statistics(this);
            this.statistics.updateAdvancedStats();
        }
    }

    updateProjectsList() {
        if (!this.elements.projectsList) return;

        this.elements.projectsList.innerHTML = this.data.projects.map(project => `
            <div class="project-card">
                <div class="project-info">
                    <div class="project-color" style="color: ${project.color}"></div>
                    <div class="project-details">
                        <h3>${project.name}</h3>
                        <p>${project.hourlyRate} Kč/h • ${this.formatTime(project.totalTime)}</p>
                    </div>
                </div>
                <div class="project-actions">
                    <button class="action-btn" onclick="window.app.showProjectModal(${project.id})">✏</button>
                    <button class="action-btn" onclick="window.app.deleteProject(${project.id})">🗑</button>
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
        const totalTime = this.data.projects.reduce((sum, p) => sum + p.totalTime, 0);
        const totalEarnings = this.data.projects.reduce((sum, p) => sum + p.totalEarnings, 0);
        const avgSession = this.data.sessions.length > 0 ? 
            totalTime / this.data.sessions.length : 0;

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
        this.updateWeeklyChart();
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

    updateSessionsList() {
        if (!this.elements.sessionsList) return;

        const recentSessions = this.data.sessions.slice(-10).reverse();
        
        this.elements.sessionsList.innerHTML = recentSessions.map(session => {
            const project = this.data.projects.find(p => p.id === session.projectId);
            const typeIcon = session.type === 'manual' ? '✏️' : '⏱️';
            
            return `
                <div class="session-item">
                    <div class="session-info-left">
                        <div class="session-project">
                            ${typeIcon} ${project ? project.name : 'Neznámý projekt'}
                        </div>
                        <div class="session-date">${this.formatDate(session.date)}</div>
                        ${session.notes ? `<div class="session-notes">${session.notes}</div>` : ''}
                    </div>
                    <div class="session-stats">
                        <div class="session-duration">${this.formatTime(session.duration)}</div>
                        <div class="session-earnings">${session.earnings} Kč</div>
                        <div class="session-actions">
                            <button class="action-btn-small" onclick="window.app.showSessionModal(${session.id})">✏</button>
                            <button class="action-btn-small" onclick="window.app.deleteSession(${session.id})">🗑</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    updateWeeklyChart() {
        if (!this.elements.weeklyChart) return;

        // Simple bar chart for weekly overview
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            last7Days.push(date.toISOString().split('T')[0]);
        }

        const weeklyData = last7Days.map(date => {
            const daySessions = this.data.sessions.filter(s => s.date === date);
            return daySessions.reduce((sum, s) => sum + s.duration, 0) / (1000 * 60 * 60); // Convert to hours
        });

        const maxHours = Math.max(...weeklyData, 1);
        
        this.elements.weeklyChart.innerHTML = `
            <svg width="100%" height="120" viewBox="0 0 280 120">
                ${weeklyData.map((hours, index) => {
                    const barHeight = (hours / maxHours) * 100;
                    const x = index * 40 + 10;
                    const y = 110 - barHeight;
                    
                    return `
                        <rect x="${x}" y="${y}" width="30" height="${barHeight}" 
                              fill="url(#gradient)" rx="4"/>
                        <text x="${x + 15}" y="125" text-anchor="middle" 
                              fill="rgba(255,255,255,0.7)" font-size="10">
                            ${['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'][index]}
                        </text>
                    `;
                }).join('')}
                <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#00F5FF"/>
                        <stop offset="100%" stop-color="#9D4EDD"/>
                    </linearGradient>
                </defs>
            </svg>
        `;
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
        // Hide all screens
        this.elements.screens?.forEach(screen => {
            screen.classList.remove('active');
        });

        // Show selected screen
        const targetScreen = document.getElementById(screenName);
        if (targetScreen) {
            targetScreen.classList.add('active');
        }

        // Update nav buttons
        this.elements.navBtns?.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.screen === screenName) {
                btn.classList.add('active');
            }
        });

        // Update statistics when switching to stats screen
        if (screenName === 'statistics') {
            this.updateStatistics();
            // Update advanced statistics if module is loaded
            if (this.statistics) {
                this.statistics.updateAdvancedStats();
            }
        }
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

    // Utility Functions
    formatTime(milliseconds) {
        if (!milliseconds || milliseconds < 0) return '0 min';
        
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else if (minutes > 0) {
            return `${minutes} min`;
        } else {
            return `${seconds}s`;
        }
    }

    formatTimeForDisplay(milliseconds) {
        if (!milliseconds || milliseconds < 0) return '00:00:00';
        
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    formatTimeForInput(date) {
        return date.toTimeString().slice(0, 5); // HH:MM format
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (dateString === today.toISOString().split('T')[0]) {
            return 'Dnes';
        } else if (dateString === yesterday.toISOString().split('T')[0]) {
            return 'Včera';
        } else {
            return date.toLocaleDateString('cs-CZ');
        }
    }

    showNotification(message) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('FlowTime Pro', { body: message });
        }
        
        // Also show in-app notification
        console.log('Notification:', message);
    }

    hapticFeedback() {
        if ('vibrate' in navigator && this.data.settings.hapticFeedback) {
            navigator.vibrate(50);
        }
    }

    async requestWakeLock() {
        if ('wakeLock' in navigator) {
            try {
                this.wakeLock = await navigator.wakeLock.request('screen');
                console.log('Wake lock acquired');
            } catch (e) {
                console.log('Wake lock failed:', e);
            }
        }
    }

    releaseWakeLock() {
        if (this.wakeLock) {
            this.wakeLock.release();
            this.wakeLock = null;
            console.log('Wake lock released');
        }
    }

    exportData() {
        const dataBlob = new Blob([JSON.stringify(this.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `flowtime-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }

    clearAllData() {
        if (confirm('Opravdu chcete vymazat všechna data? Tato akce je nevratná.')) {
            localStorage.removeItem('flowtime-data');
            location.reload();
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new FlowTimeApp();
});

// Handle app visibility changes
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
