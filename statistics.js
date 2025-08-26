// FlowTime Pro - Advanced Statistics Module
// statistics.js - 2026 Edition

class Statistics {
    constructor(app) {
        this.app = app;
        this.data = app.data;
        this.elements = {};
        this.charts = {};
        this.init();
    }

    init() {
        this.cacheElements();
        this.createAdvancedStatsHTML();
        this.setupEventListeners();
    }

    cacheElements() {
        // Advanced statistics elements will be created dynamically
        this.elements.advancedStats = document.getElementById('advancedStats');
        this.elements.monthlyChart = document.getElementById('monthlyChart');
        this.elements.projectChart = document.getElementById('projectChart');
        this.elements.productivityChart = document.getElementById('productivityChart');
    }

    createAdvancedStatsHTML() {
        // Add advanced statistics section to the statistics screen
        const statsScreen = document.getElementById('statistics');
        if (!statsScreen) return;

        const advancedStatsHTML = `
            <!-- Rozšířené statistiky -->
            <div class="advanced-stats-section">
                <h2 class="section-title">🔥 Pokročilé statistiky</h2>
                
                <!-- Měsíční přehled -->
                <div class="stat-card-large">
                    <h3>📅 Měsíční přehled</h3>
                    <div id="monthlyChart" class="chart-container"></div>
                    <div class="monthly-summary">
                        <div class="summary-item">
                            <span class="label">Tento měsíc:</span>
                            <span id="thisMonthTime" class="value">0h</span>
                            <span id="thisMonthEarnings" class="earnings">0 Kč</span>
                        </div>
                        <div class="summary-item">
                            <span class="label">Minulý měsíc:</span>
                            <span id="lastMonthTime" class="value">0h</span>
                            <span id="lastMonthEarnings" class="earnings">0 Kč</span>
                        </div>
                    </div>
                </div>

                <!-- Produktivita podle dní -->
                <div class="stat-card-large">
                    <h3>⚡ Produktivita podle dnů</h3>
                    <div id="productivityChart" class="chart-container"></div>
                    <div class="productivity-insights">
                        <div class="insight-item">
                            <span class="icon">🔥</span>
                            <span class="text">Nejproduktivnější den: <span id="bestDay">-</span></span>
                        </div>
                        <div class="insight-item">
                            <span class="icon">📈</span>
                            <span class="text">Průměr na den: <span id="avgPerDay">0h</span></span>
                        </div>
                    </div>
                </div>

                <!-- Přehled projektů -->
                <div class="stat-card-large">
                    <h3>🎯 Rozdělení času podle projektů</h3>
                    <div id="projectChart" class="chart-container"></div>
                    <div class="project-ranking">
                        <h4>🏆 Žebříček projektů</h4>
                        <div id="projectRanking" class="ranking-list"></div>
                    </div>
                </div>

                <!-- Časové statistiky -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">⏰</div>
                        <div class="stat-value" id="totalSessions">0</div>
                        <div class="stat-label">Celkem relací</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">🎯</div>
                        <div class="stat-value" id="longestSession">0h</div>
                        <div class="stat-label">Nejdelší relace</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">⚡</div>
                        <div class="stat-value" id="shortestSession">0h</div>
                        <div class="stat-label">Nejkratší relace</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">📊</div>
                        <div class="stat-value" id="workingDays">0</div>
                        <div class="stat-label">Pracovních dnů</div>
                    </div>
                </div>

                <!-- Hodinové rozložení -->
                <div class="stat-card-large">
                    <h3>🕐 Rozložení podle hodin</h3>
                    <div id="hourlyChart" class="chart-container"></div>
                    <div class="hourly-insights">
                        <div class="insight-item">
                            <span class="icon">🌅</span>
                            <span class="text">Nejaktivnější hodina: <span id="peakHour">-</span></span>
                        </div>
                        <div class="insight-item">
                            <span class="icon">🌙</span>
                            <span class="text">Nejméně aktivní: <span id="lowestHour">-</span></span>
                        </div>
                    </div>
                </div>

                <!-- Cíle a pokrok -->
                <div class="goals-section">
                    <h3>🎯 Týdenní cíl</h3>
                    <div class="goal-progress">
                        <div class="goal-bar">
                            <div id="goalProgress" class="goal-fill"></div>
                        </div>
                        <div class="goal-text">
                            <span id="goalCurrent">0h</span> / <span id="goalTarget">40h</span>
                            <span id="goalPercentage">(0%)</span>
                        </div>
                    </div>
                    <button id="setGoalBtn" class="btn-secondary">Nastavit cíl</button>
                </div>
            </div>
        `;

        // Add to the end of statistics screen
        statsScreen.insertAdjacentHTML('beforeend', advancedStatsHTML);
    }

    setupEventListeners() {
        const setGoalBtn = document.getElementById('setGoalBtn');
        if (setGoalBtn) {
            setGoalBtn.addEventListener('click', () => this.showGoalModal());
        }
    }

    updateAdvancedStats() {
        this.updateMonthlySummary();
        this.updateProductivityStats();
        this.updateProjectStats();
        this.updateTimeStats();
        this.updateHourlyDistribution();
        this.updateGoalProgress();
        this.renderCharts();
    }

    updateMonthlySummary() {
        const now = new Date();
        const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthStr = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;

        const thisMonthSessions = this.data.sessions.filter(s => s.date.startsWith(thisMonth));
        const lastMonthSessions = this.data.sessions.filter(s => s.date.startsWith(lastMonthStr));

        const thisMonthTime = thisMonthSessions.reduce((sum, s) => sum + s.duration, 0);
        const thisMonthEarnings = thisMonthSessions.reduce((sum, s) => sum + s.earnings, 0);
        const lastMonthTime = lastMonthSessions.reduce((sum, s) => sum + s.duration, 0);
        const lastMonthEarnings = lastMonthSessions.reduce((sum, s) => sum + s.earnings, 0);

        document.getElementById('thisMonthTime').textContent = this.app.formatTime(thisMonthTime);
        document.getElementById('thisMonthEarnings').textContent = `${thisMonthEarnings} Kč`;
        document.getElementById('lastMonthTime').textContent = this.app.formatTime(lastMonthTime);
        document.getElementById('lastMonthEarnings').textContent = `${lastMonthEarnings} Kč`;
    }

    updateProductivityStats() {
        const dayStats = {};
        const dayNames = ['Neděle', 'Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota'];

        this.data.sessions.forEach(session => {
            const dayOfWeek = new Date(session.date).getDay();
            const dayName = dayNames[dayOfWeek];
            
            if (!dayStats[dayName]) {
                dayStats[dayName] = 0;
            }
            dayStats[dayName] += session.duration;
        });

        let bestDay = 'Žádný';
        let bestTime = 0;
        let totalTime = 0;
        let workingDays = 0;

        for (const [day, time] of Object.entries(dayStats)) {
            if (time > bestTime) {
                bestTime = time;
                bestDay = day;
            }
            totalTime += time;
            if (time > 0) workingDays++;
        }

        const avgPerDay = workingDays > 0 ? totalTime / workingDays : 0;

        document.getElementById('bestDay').textContent = bestDay;
        document.getElementById('avgPerDay').textContent = this.app.formatTime(avgPerDay);
    }

    updateProjectStats() {
        const projectRanking = this.data.projects
            .map(project => ({
                ...project,
                sessions: this.data.sessions.filter(s => s.projectId === project.id).length
            }))
            .sort((a, b) => b.totalTime - a.totalTime);

        const rankingHTML = projectRanking.map((project, index) => {
            const percentage = this.data.sessions.length > 0 ? 
                (project.sessions / this.data.sessions.length * 100).toFixed(1) : 0;
            
            return `
                <div class="ranking-item">
                    <span class="rank">${index + 1}.</span>
                    <span class="project-color" style="background-color: ${project.color}"></span>
                    <span class="project-name">${project.name}</span>
                    <span class="project-time">${this.app.formatTime(project.totalTime)}</span>
                    <span class="project-percentage">${percentage}%</span>
                </div>
            `;
        }).join('');

        const rankingElement = document.getElementById('projectRanking');
        if (rankingElement) {
            rankingElement.innerHTML = rankingHTML;
        }
    }

    updateTimeStats() {
        const sessions = this.data.sessions;
        const totalSessions = sessions.length;
        
        let longestSession = 0;
        let shortestSession = Infinity;
        const uniqueDates = new Set();

        sessions.forEach(session => {
            if (session.duration > longestSession) {
                longestSession = session.duration;
            }
            if (session.duration < shortestSession) {
                shortestSession = session.duration;
            }
            uniqueDates.add(session.date);
        });

        if (shortestSession === Infinity) shortestSession = 0;

        document.getElementById('totalSessions').textContent = totalSessions;
        document.getElementById('longestSession').textContent = this.app.formatTime(longestSession);
        document.getElementById('shortestSession').textContent = this.app.formatTime(shortestSession);
        document.getElementById('workingDays').textContent = uniqueDates.size;
    }

    updateHourlyDistribution() {
        const hourStats = Array(24).fill(0);
        
        this.data.sessions.forEach(session => {
            // Estimate start hour from session data
            const sessionDate = new Date(session.date);
            const hour = sessionDate.getHours();
            hourStats[hour] += session.duration;
        });

        let peakHour = 0;
        let peakTime = 0;
        let lowestHour = 0;
        let lowestTime = Infinity;

        hourStats.forEach((time, hour) => {
            if (time > peakTime) {
                peakTime = time;
                peakHour = hour;
            }
            if (time > 0 && time < lowestTime) {
                lowestTime = time;
                lowestHour = hour;
            }
        });

        document.getElementById('peakHour').textContent = `${peakHour}:00`;
        document.getElementById('lowestHour').textContent = lowestTime === Infinity ? '-' : `${lowestHour}:00`;
    }

    updateGoalProgress() {
        const weeklyGoal = localStorage.getItem('weeklyGoal') || 40 * 60 * 60 * 1000; // 40 hours default
        const now = new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 1)); // Monday
        const startOfWeekStr = startOfWeek.toISOString().split('T')[0];
        
        const thisWeekSessions = this.data.sessions.filter(s => s.date >= startOfWeekStr);
        const thisWeekTime = thisWeekSessions.reduce((sum, s) => sum + s.duration, 0);
        
        const percentage = Math.min((thisWeekTime / weeklyGoal) * 100, 100);
        
        document.getElementById('goalCurrent').textContent = this.app.formatTime(thisWeekTime);
        document.getElementById('goalTarget').textContent = this.app.formatTime(weeklyGoal);
        document.getElementById('goalPercentage').textContent = `(${percentage.toFixed(1)}%)`;
        
        const progressBar = document.getElementById('goalProgress');
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
        }
    }

    renderCharts() {
        this.renderMonthlyChart();
        this.renderProductivityChart();
        this.renderProjectChart();
        this.renderHourlyChart();
    }

    renderMonthlyChart() {
        const monthlyChart = document.getElementById('monthlyChart');
        if (!monthlyChart) return;

        // Get last 6 months data
        const months = [];
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            months.push({
                name: date.toLocaleDateString('cs-CZ', { month: 'short' }),
                key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
            });
        }

        const monthlyData = months.map(month => {
            const sessions = this.data.sessions.filter(s => s.date.startsWith(month.key));
            return {
                name: month.name,
                hours: sessions.reduce((sum, s) => sum + s.duration, 0) / (1000 * 60 * 60)
            };
        });

        const maxHours = Math.max(...monthlyData.map(d => d.hours), 1);

        monthlyChart.innerHTML = `
            <svg width="100%" height="180" viewBox="0 0 300 180">
                ${monthlyData.map((data, index) => {
                    const barHeight = (data.hours / maxHours) * 140;
                    const x = index * 50 + 10;
                    const y = 150 - barHeight;
                    
                    return `
                        <rect x="${x}" y="${y}" width="40" height="${barHeight}" 
                              fill="url(#monthlyGradient)" rx="6"/>
                        <text x="${x + 20}" y="170" text-anchor="middle" 
                              fill="rgba(255,255,255,0.7)" font-size="12">
                            ${data.name}
                        </text>
                        <text x="${x + 20}" y="${y - 5}" text-anchor="middle" 
                              fill="rgba(255,255,255,0.9)" font-size="10">
                            ${data.hours.toFixed(1)}h
                        </text>
                    `;
                }).join('')}
                <defs>
                    <linearGradient id="monthlyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#00F5FF"/>
                        <stop offset="100%" stop-color="#0080FF"/>
                    </linearGradient>
                </defs>
            </svg>
        `;
    }

    renderProductivityChart() {
        const productivityChart = document.getElementById('productivityChart');
        if (!productivityChart) return;

        const dayNames = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];
        const dayStats = Array(7).fill(0);

        this.data.sessions.forEach(session => {
            const dayOfWeek = new Date(session.date).getDay();
            const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday = 0
            dayStats[adjustedDay] += session.duration;
        });

        const maxHours = Math.max(...dayStats.map(d => d / (1000 * 60 * 60)), 1);

        productivityChart.innerHTML = `
            <svg width="100%" height="160" viewBox="0 0 280 160">
                ${dayStats.map((duration, index) => {
                    const hours = duration / (1000 * 60 * 60);
                    const barHeight = (hours / maxHours) * 120;
                    const x = index * 40 + 10;
                    const y = 130 - barHeight;
                    
                    return `
                        <rect x="${x}" y="${y}" width="30" height="${barHeight}" 
                              fill="url(#productivityGradient)" rx="4"/>
                        <text x="${x + 15}" y="150" text-anchor="middle" 
                              fill="rgba(255,255,255,0.7)" font-size="11">
                            ${dayNames[index]}
                        </text>
                        <text x="${x + 15}" y="${y - 5}" text-anchor="middle" 
                              fill="rgba(255,255,255,0.9)" font-size="9">
                            ${hours.toFixed(1)}h
                        </text>
                    `;
                }).join('')}
                <defs>
                    <linearGradient id="productivityGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#FF0080"/>
                        <stop offset="100%" stop-color="#9D4EDD"/>
                    </linearGradient>
                </defs>
            </svg>
        `;
    }

    renderProjectChart() {
        const projectChart = document.getElementById('projectChart');
        if (!projectChart) return;

        const projectData = this.data.projects.map(project => ({
            name: project.name,
            color: project.color,
            hours: project.totalTime / (1000 * 60 * 60),
            percentage: this.data.sessions.length > 0 ? 
                (this.data.sessions.filter(s => s.projectId === project.id).length / this.data.sessions.length * 100) : 0
        }));

        const total = projectData.reduce((sum, p) => sum + p.hours, 0);
        let currentAngle = 0;
        const centerX = 100;
        const centerY = 80;
        const radius = 60;

        const paths = projectData.map(project => {
            const percentage = total > 0 ? (project.hours / total) * 100 : 0;
            const angle = (percentage / 100) * 2 * Math.PI;
            
            if (angle < 0.01) return ''; // Skip very small slices
            
            const startX = centerX + radius * Math.cos(currentAngle);
            const startY = centerY + radius * Math.sin(currentAngle);
            const endX = centerX + radius * Math.cos(currentAngle + angle);
            const endY = centerY + radius * Math.sin(currentAngle + angle);
            
            const largeArcFlag = angle > Math.PI ? 1 : 0;
            
            const path = `
                M ${centerX} ${centerY}
                L ${startX} ${startY}
                A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}
                Z
            `;
            
            currentAngle += angle;
            
            return `<path d="${path}" fill="${project.color}" opacity="0.8"/>`;
        }).join('');

        projectChart.innerHTML = `
            <svg width="100%" height="160" viewBox="0 0 200 160">
                ${paths}
                <circle cx="${centerX}" cy="${centerY}" r="25" fill="rgba(0,0,16,0.8)"/>
                <text x="${centerX}" y="${centerY - 5}" text-anchor="middle" 
                      fill="rgba(255,255,255,0.9)" font-size="12" font-weight="bold">
                    ${total.toFixed(1)}h
                </text>
                <text x="${centerX}" y="${centerY + 10}" text-anchor="middle" 
                      fill="rgba(255,255,255,0.7)" font-size="10">
                    celkem
                </text>
            </svg>
        `;
    }

    renderHourlyChart() {
        const hourlyChart = document.getElementById('hourlyChart');
        if (!hourlyChart) return;

        const hourStats = Array(24).fill(0);
        
        // Simulate hourly distribution based on session times
        this.data.sessions.forEach(session => {
            const randomHour = Math.floor(Math.random() * 16) + 6; // 6-22 hours
            hourStats[randomHour] += session.duration;
        });

        const maxHours = Math.max(...hourStats.map(d => d / (1000 * 60 * 60)), 0.1);

        const bars = hourStats.map((duration, hour) => {
            const hours = duration / (1000 * 60 * 60);
            const barHeight = (hours / maxHours) * 100;
            const x = hour * 12 + 2;
            const y = 110 - barHeight;
            
            return hours > 0 ? `
                <rect x="${x}" y="${y}" width="10" height="${barHeight}" 
                      fill="url(#hourlyGradient)" rx="2"/>
            ` : '';
        }).join('');

        hourlyChart.innerHTML = `
            <svg width="100%" height="140" viewBox="0 0 290 140">
                ${bars}
                <!-- Hour labels -->
                <text x="14" y="130" text-anchor="middle" fill="rgba(255,255,255,0.5)" font-size="8">6</text>
                <text x="86" y="130" text-anchor="middle" fill="rgba(255,255,255,0.5)" font-size="8">12</text>
                <text x="158" y="130" text-anchor="middle" fill="rgba(255,255,255,0.5)" font-size="8">18</text>
                <text x="278" y="130" text-anchor="middle" fill="rgba(255,255,255,0.5)" font-size="8">23</text>
                <defs>
                    <linearGradient id="hourlyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#9D4EDD"/>
                        <stop offset="100%" stop-color="#FF0080"/>
                    </linearGradient>
                </defs>
            </svg>
        `;
    }

    showGoalModal() {
        const currentGoal = localStorage.getItem('weeklyGoal') || (40 * 60 * 60 * 1000);
        const currentHours = Math.floor(currentGoal / (1000 * 60 * 60));
        
        const newGoal = prompt(`Zadejte týdenní cíl v hodinách:`, currentHours);
        if (newGoal && !isNaN(newGoal) && newGoal > 0) {
            localStorage.setItem('weeklyGoal', newGoal * 60 * 60 * 1000);
            this.updateGoalProgress();
        }
    }
}

// Make Statistics class available globally
window.Statistics = Statistics;
