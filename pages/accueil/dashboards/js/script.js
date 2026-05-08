// ════════════════════════════════════════════════════════════════
// INITIALISATION
// ════════════════════════════════════════════════════════════════
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.getElementById('preloader').classList.add('hide');
    }, 800);

    initializeApp();
    loadDashboard();
});

function initializeApp() {
    // Menu toggle
    document.getElementById('menuToggle').addEventListener('click', () => {
        const sidebar = document.getElementById('sidebar');
        const wrapper = document.getElementById('contentWrapper');
        sidebar.classList.toggle('collapsed');
        wrapper.classList.toggle('expanded');
    });

    // Notifications
    document.getElementById('notifToggle').addEventListener('click', (e) => {
        e.stopPropagation();
        document.getElementById('notifDropdown').classList.toggle('show');
    });

    document.addEventListener('click', () => {
        document.getElementById('notifDropdown').classList.remove('show');
    });

    // Fullscreen
    document.getElementById('fullscreenToggle').addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    });
}

// ════════════════════════════════════════════════════════════════
// CHARGEMENT DU DASHBOARD
// ════════════════════════════════════════════════════════════════
function loadDashboard() {
    document.querySelectorAll('.sidebar .nav-link').forEach(link => {
        link.classList.remove('active');
    });
    const dashboardLink = document.querySelector('.sidebar .nav-link[onclick="loadDashboard()"]');
    if (dashboardLink) dashboardLink.classList.add('active');

    document.getElementById('dynPageTitle').textContent = 'Tableau de bord';
    document.getElementById('dynBreadcrumb').textContent = 'Tableau de bord';

    showSpinner();
    setTimeout(() => {
        document.getElementById('pageContent').innerHTML = getDashboardHTML();
        loadDashboardData();
        hideSpinner();
    }, 300);
}

function getDashboardHTML() {
    return `
                <section class="content">
                    <div class="container-fluid">
                        <div class="kpi-row">
                            <div class="kpi-card" onclick="showKPIDetail('eleves')">
                                <div class="kpi-accent" style="background:var(--primary)"></div>
                                <div class="kpi-label">Total élèves</div>
                                <div class="kpi-val" id="valEleves">—</div>
                                <div class="kpi-sub"><span class="pill pill-up" id="pillEleves">+0</span><span>depuis la rentrée</span></div>
                            </div>
                            <div class="kpi-card" onclick="showKPIDetail('classes')">
                                <div class="kpi-accent" style="background:var(--success)"></div>
                                <div class="kpi-label">Classes actives</div>
                                <div class="kpi-val" id="valClasses">—</div>
                                <div class="kpi-sub"><span class="pill pill-neu" id="pillClasses">Moy. — élèves</span></div>
                            </div>
                            <div class="kpi-card" onclick="showKPIDetail('presence')">
                                <div class="kpi-accent" style="background:var(--warning)"></div>
                                <div class="kpi-label">Taux de présence</div>
                                <div class="kpi-val"><span id="valPresence">—</span><span class="kpi-unit">%</span></div>
                                <div class="kpi-sub"><span class="pill pill-up" id="pillPresence">+0%</span><span>ce mois</span></div>
                            </div>
                            <div class="kpi-card" onclick="showKPIDetail('impayes')">
                                <div class="kpi-accent" style="background:var(--danger)"></div>
                                <div class="kpi-label">Frais impayés</div>
                                <div class="kpi-val" id="valImpayes">—</div>
                                <div class="kpi-sub"><span class="pill pill-dn" id="pillImpayes">0</span><span>vs mois dernier</span></div>
                            </div>
                        </div>
                        <div class="row mt-1">
                            <div class="col-lg-8">
                                <div class="dash-card">
                                    <div class="dash-card-head">
                                        <span class="dash-card-title"><span class="dot-terra"></span>Présences — 7 derniers jours</span>
                                        <span class="dash-card-meta" id="lblMoisPresence"></span>
                                    </div>
                                    <div class="dash-card-body">
                                        <div class="chart-legend mb-2">
                                            <span class="leg-item"><span class="leg-sq" style="background:var(--forest)"></span>Présents</span>
                                            <span class="leg-item"><span class="leg-sq" style="background:var(--terra)"></span>Absents</span>
                                        </div>
                                        <div style="position:relative; height:200px;"><canvas id="chartPresence"></canvas></div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-lg-4">
                                <div class="dash-card">
                                    <div class="dash-card-head"><span class="dash-card-title"><span class="dot-terra"></span>Répartition par niveau</span></div>
                                    <div class="dash-card-body">
                                        <div class="donut-wrap">
                                            <canvas id="chartDonut" width="130" height="130"></canvas>
                                            <div class="donut-legend" id="donutLegend"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="row mt-1">
                            <div class="col-lg-4">
                                <div class="dash-card">
                                    <div class="dash-card-head"><span class="dash-card-title"><span class="dot-terra"></span>Taux de réussite par classe</span></div>
                                    <div class="dash-card-body" id="reussiteContainer"></div>
                                </div>
                            </div>
                            <div class="col-lg-4">
                                <div class="dash-card">
                                    <div class="dash-card-head"><span class="dash-card-title"><span class="dot-terra"></span>Frais scolaires mensuels</span></div>
                                    <div class="dash-card-body">
                                        <div class="chart-legend mb-2">
                                            <span class="leg-item"><span class="leg-sq" style="background:var(--forest-light)"></span>Payé</span>
                                            <span class="leg-item"><span class="leg-sq" style="background:#f0d4c8"></span>Impayé</span>
                                        </div>
                                        <div style="position:relative; height:180px;"><canvas id="chartFrais"></canvas></div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-lg-4">
                                <div class="dash-card">
                                    <div class="dash-card-head"><span class="dash-card-title"><span class="dot-terra"></span>Indicateurs clés</span></div>
                                    <div class="dash-card-body">
                                        <div class="gauge-row" id="gaugeContainer"></div>
                                        <div class="divider-line mt-3 mb-3"></div>
                                        <div class="prog-item"><div class="prog-head"><span class="prog-name">Garçons</span><span class="prog-pct" id="pctGarcons">—%</span></div><div class="prog-track"><div class="prog-fill" id="fillGarcons" style="background:var(--forest)"></div></div></div>
                                        <div class="prog-item"><div class="prog-head"><span class="prog-name">Filles</span><span class="prog-pct" id="pctFilles">—%</span></div><div class="prog-track"><div class="prog-fill" id="fillFilles" style="background:var(--terra)"></div></div></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="row mt-1">
                            <div class="col-lg-6">
                                <div class="dash-card">
                                    <div class="dash-card-head"><span class="dash-card-title"><span class="dot-terra"></span>Élèves — absences fréquentes</span><span class="dash-card-meta">Ce mois</span></div>
                                    <div class="dash-card-body p-0">
                                        <table class="dash-table"><thead><tr><th>Élève</th><th>Classe</th><th>Absences</th><th>Statut</th></tr></thead><tbody id="tbodyAbsences"></tbody></table>
                                    </div>
                                </div>
                            </div>
                            <div class="col-lg-6">
                                <div class="dash-card">
                                    <div class="dash-card-head"><span class="dash-card-title"><span class="dot-terra"></span>Activité récente</span></div>
                                    <div class="dash-card-body" id="activityFeed"></div>
                                </div>
                            </div>
                        </div>
                        <div class="row mt-1">
                            <div class="col-12">
                                <div class="dash-card">
                                    <div class="dash-card-head"><span class="dash-card-title"><span class="dot-terra"></span>Agenda scolaire</span><div class="cal-legend"><span class="leg-item"><span class="leg-sq" style="background:var(--forest)"></span>Aujourd'hui</span><span class="leg-item"><span class="leg-sq" style="background:var(--terra)"></span>Événement</span></div></div>
                                    <div class="dash-card-body" style="display:flex; gap:30px; align-items:flex-start; flex-wrap:wrap;">
                                        <div style="flex:0 0 260px; max-width:260px;"><div id="calendarGrid" class="mini-cal" style="gap:4px;"></div></div>
                                        <div style="flex:1; min-width:200px;"><div class="event-list" id="eventList"></div></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            `;
}

function loadDashboardData() {
    // KPI
    document.getElementById('valEleves').textContent = mockData.kpi.eleves.toLocaleString();
    document.getElementById('pillEleves').textContent = `+${mockData.kpi.elevesVariation}`;
    document.getElementById('valClasses').textContent = mockData.kpi.classes;
    document.getElementById('pillClasses').textContent = `Moy. ${mockData.kpi.moyenneEleves} élèves`;
    document.getElementById('valPresence').textContent = mockData.kpi.presence;
    document.getElementById('pillPresence').textContent = `+${mockData.kpi.presenceVariation}%`;
    document.getElementById('valImpayes').textContent = (mockData.kpi.impayes / 1000).toFixed(0) + 'k Ar';
    document.getElementById('pillImpayes').textContent = mockData.kpi.impayesVariation;

    // Date du mois
    const mois = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    document.getElementById('lblMoisPresence').textContent = mois[new Date().getMonth()] + ' ' + new Date().getFullYear();

    // Charts
    createPresenceChart();
    createDonutChart();
    createReussiteChart();
    createFraisChart();
    createGauges();
    loadGenreData();
    loadAbsencesTable();
    loadActivityFeed();
    createCalendar();
}

function createPresenceChart() {
    const ctx = document.getElementById('chartPresence').getContext('2d');
    if (charts.presence) charts.presence.destroy();
    charts.presence = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: mockData.presences.labels,
            datasets: [
                { label: 'Présents', data: mockData.presences.presents, backgroundColor: '#2d6a4f', borderRadius: 4 },
                { label: 'Absents', data: mockData.presences.absents, backgroundColor: '#d4a373', borderRadius: 4 }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { stacked: true, grid: { display: false } }, y: { stacked: true, beginAtZero: true } } }
    });
}

function createDonutChart() {
    const ctx = document.getElementById('chartDonut').getContext('2d');
    const colors = ['#2d6a4f', '#52b788', '#74c69d', '#95d5b2', '#b7e4c7', '#d8f3dc', '#f1faee'];
    if (charts.donut) charts.donut.destroy();
    charts.donut = new Chart(ctx, {
        type: 'doughnut',
        data: { labels: mockData.repartition.labels, datasets: [{ data: mockData.repartition.values, backgroundColor: colors, borderWidth: 2, borderColor: '#fff' }] },
        options: { responsive: false, plugins: { legend: { display: false } } }
    });

    const legend = document.getElementById('donutLegend');
    let html = '';
    mockData.repartition.labels.forEach((label, i) => {
        html += `<div class="leg-item"><span class="leg-sq" style="background:${colors[i]}"></span>${label} (${mockData.repartition.values[i]})</div>`;
    });
    legend.innerHTML = html;
}

function createReussiteChart() {
    const container = document.getElementById('reussiteContainer');
    let html = '';
    mockData.reussite.forEach(item => {
        html += `<div class="success-bar"><div class="success-label">${item.classe}</div><div class="success-track"><div class="success-fill" style="width:${item.taux}%">${item.taux}%</div></div></div>`;
    });
    container.innerHTML = html;
}

function createFraisChart() {
    const ctx = document.getElementById('chartFrais').getContext('2d');
    if (charts.frais) charts.frais.destroy();
    charts.frais = new Chart(ctx, {
        type: 'line',
        data: {
            labels: mockData.frais.labels,
            datasets: [
                { label: 'Payé', data: mockData.frais.payes, borderColor: '#52b788', backgroundColor: 'rgba(82, 183, 136, 0.1)', fill: true, tension: 0.4 },
                { label: 'Impayé', data: mockData.frais.impayes, borderColor: '#d4a373', backgroundColor: 'rgba(212, 163, 115, 0.1)', fill: true, tension: 0.4 }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    });
}

function createGauges() {
    const container = document.getElementById('gaugeContainer');
    const gauges = [
        { label: 'Assiduité', value: mockData.indicateurs.assiduite },
        { label: 'Paiements', value: mockData.indicateurs.paiements },
        { label: 'Réussite', value: mockData.indicateurs.reussite }
    ];
    let html = '';
    gauges.forEach(gauge => {
        html += `<div class="gauge-item"><div class="gauge-circle" style="--pct:${gauge.value}"><div class="gauge-val">${gauge.value}%</div></div><div class="gauge-label">${gauge.label}</div></div>`;
    });
    container.innerHTML = html;
}

function loadGenreData() {
    document.getElementById('pctGarcons').textContent = mockData.genre.garcons + '%';
    document.getElementById('fillGarcons').style.width = mockData.genre.garcons + '%';
    document.getElementById('pctFilles').textContent = mockData.genre.filles + '%';
    document.getElementById('fillFilles').style.width = mockData.genre.filles + '%';
}

function loadAbsencesTable() {
    const tbody = document.getElementById('tbodyAbsences');
    let html = '';
    mockData.absences.forEach(item => {
        const badgeClass = item.statut === 'Critique' ? 'badge-danger' : 'badge-warning';
        html += `<tr onclick="showStudentDetail('${item.nom}')"><td>${item.nom}</td><td>${item.classe}</td><td>${item.absences}</td><td><span class="badge ${badgeClass}">${item.statut}</span></td></tr>`;
    });
    tbody.innerHTML = html;
}

function loadActivityFeed() {
    const feed = document.getElementById('activityFeed');
    let html = '';
    mockData.activites.forEach(item => {
        html += `<div class="activity-item"><div class="activity-icon ${item.color}"><i class="fas ${item.icon}"></i></div><div class="activity-content"><div class="activity-text">${item.text}</div><div class="activity-time">${item.time}</div></div></div>`;
    });
    feed.innerHTML = html;
}

function createCalendar() {
    const grid = document.getElementById('calendarGrid');
    const eventList = document.getElementById('eventList');
    const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
    const eventDays = [5, 12, 20, 28];
    const today = 25;
    let html = '';
    days.forEach(day => { html += `<div class="cal-day header">${day}</div>`; });
    for (let i = 1; i <= 30; i++) {
        const classes = ['cal-day'];
        if (i === today) classes.push('today');
        if (eventDays.includes(i)) classes.push('event');
        html += `<div class="${classes.join(' ')}" onclick="selectDate(${i})">${i}</div>`;
    }
    grid.innerHTML = html;

    let eventsHtml = '';
    mockData.evenements.forEach(event => {
        eventsHtml += `<div class="event-item"><div class="event-date">${event.date}</div><div class="event-desc">${event.desc}</div></div>`;
    });
    eventList.innerHTML = eventsHtml;
}