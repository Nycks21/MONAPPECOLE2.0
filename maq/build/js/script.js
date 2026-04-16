// ════════════════════════════════════════════════════════════════
// DONNÉES SIMULÉES
// ════════════════════════════════════════════════════════════════
const mockData = {
    kpi: {
        eleves: 1247,
        elevesVariation: 42,
        classes: 18,
        moyenneEleves: 69,
        presence: 94.2,
        presenceVariation: 2.1,
        impayes: 24850,
        impayesVariation: -5
    },
    presences: {
        labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
        presents: [1180, 1195, 1172, 1203, 1189, 245, 0],
        absents: [67, 52, 75, 44, 58, 12, 0]
    },
    repartition: {
        labels: ['6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Tle'],
        values: [234, 198, 186, 172, 165, 152, 140]
    },
    reussite: [
        { classe: '6ème A', taux: 87 },
        { classe: '5ème B', taux: 92 },
        { classe: '4ème C', taux: 78 },
        { classe: '3ème A', taux: 95 },
        { classe: '2nde B', taux: 84 }
    ],
    frais: {
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
        payes: [45000, 48000, 52000, 49000, 51000, 53000],
        impayes: [8000, 7500, 6800, 7200, 6500, 5900]
    },
    indicateurs: {
        assiduite: 89,
        paiements: 76,
        reussite: 85
    },
    genre: {
        garcons: 54,
        filles: 46
    },
    absences: [
        { nom: 'Jean RAKOTO', classe: '3ème A', absences: 12, statut: 'Critique' },
        { nom: 'Marie RABE', classe: '5ème B', absences: 8, statut: 'Attention' },
        { nom: 'Paul ANDRIA', classe: '2nde A', absences: 7, statut: 'Attention' },
        { nom: 'Sophie RAVO', classe: '4ème C', absences: 6, statut: 'Attention' },
        { nom: 'Luc RADO', classe: '6ème B', absences: 5, statut: 'Attention' }
    ],
    activites: [
        { icon: 'fa-user-plus', color: 'success', text: 'Nouvel élève inscrit : Sandra RAHARI', time: 'Il y a 23 min' },
        { icon: 'fa-exclamation-circle', color: 'danger', text: 'Absence signalée pour Jean RAKOTO', time: 'Il y a 1h' },
        { icon: 'fa-money-bill', color: 'warning', text: 'Paiement reçu : 150 000 Ar', time: 'Il y a 2h' },
        { icon: 'fa-calendar-check', color: 'success', text: 'Examen programmé en Mathématiques', time: 'Il y a 3h' },
        { icon: 'fa-bell', color: 'warning', text: 'Réunion parents-professeurs confirmée', time: 'Il y a 5h' }
    ],
    evenements: [
        { date: '28 Mar', desc: 'Réunion pédagogique - Salle 101' },
        { date: '02 Avr', desc: 'Examen blanc - Toutes classes' },
        { date: '05 Avr', desc: 'Conseil de classe - 3ème' }
    ]
};

// Données pour les pages modules
const studentsData = [
    { id: 1, matricule: '2024001', nom: 'Jean RAKOTO', classe: '3ème A', email: 'jean@ecole.com', telephone: '0321234567' },
    { id: 2, matricule: '2024002', nom: 'Marie RABE', classe: '5ème B', email: 'marie@ecole.com', telephone: '0321234568' },
    { id: 3, matricule: '2024003', nom: 'Paul ANDRIA', classe: '2nde A', email: 'paul@ecole.com', telephone: '0321234569' },
    { id: 4, matricule: '2024004', nom: 'Sophie RAVO', classe: '4ème C', email: 'sophie@ecole.com', telephone: '0321234570' },
    { id: 5, matricule: '2024005', nom: 'Luc RADO', classe: '6ème B', email: 'luc@ecole.com', telephone: '0321234571' }
];

// Données absences enrichies (avec matricule et détails) - depuis maquette _3
let absencesData = [
    { id: 1, matricule: '2024001', nom: 'Jean RAKOTO', classe: '3ème A', absences: 12, retards: 3, statut: 'Critique', justifie: false, details: [{ date: '2024-03-10', type: 'absence', duree: 1, motif: 'Maladie' }] },
    { id: 2, matricule: '2024002', nom: 'Marie RABE', classe: '5ème B', absences: 8, retards: 2, statut: 'Attention', justifie: true, details: [] },
    { id: 3, matricule: '2024003', nom: 'Paul ANDRIA', classe: '2nde A', absences: 7, retards: 1, statut: 'Attention', justifie: false, details: [] },
    { id: 4, matricule: '2024004', nom: 'Sophie RAVO', classe: '4ème C', absences: 6, retards: 2, statut: 'Attention', justifie: true, details: [] },
    { id: 5, matricule: '2024005', nom: 'Luc RADO', classe: '6ème B', absences: 5, retards: 0, statut: 'Normal', justifie: true, details: [] }
];

// Données des matières et enseignants - depuis maquette _3
const matieresData = [
    { id: 1, nom: 'Mathématiques', enseignant: 'M. RAKOTO', coefficient: 5, heures: 5, niveau: 'Tous niveaux' },
    { id: 2, nom: 'Français', enseignant: 'Mme RABE', coefficient: 4, heures: 4, niveau: 'Tous niveaux' },
    { id: 3, nom: 'Anglais', enseignant: 'M. ANDRIA', coefficient: 3, heures: 3, niveau: 'Tous niveaux' },
    { id: 4, nom: 'Physique-Chimie', enseignant: 'Mme RAVELO', coefficient: 4, heures: 4, niveau: 'Lycée' },
    { id: 5, nom: 'SVT', enseignant: 'M. RANDRIAN', coefficient: 4, heures: 3, niveau: 'Tous niveaux' },
    { id: 6, nom: 'Histoire-Géo', enseignant: 'Mme RALISON', coefficient: 3, heures: 3, niveau: 'Tous niveaux' }
];

// Données des classes
let classesData = [
    { id: 1, nom: '6ème A', niveau: '6ème', effectif: 32, titulaire: 'Mme RABE', salle: 'Salle 101', statut: 'Active' },
    { id: 2, nom: '6ème B', niveau: '6ème', effectif: 30, titulaire: 'M. RAKOTO', salle: 'Salle 102', statut: 'Active' },
    { id: 3, nom: '5ème A', niveau: '5ème', effectif: 28, titulaire: 'Mme RAVELO', salle: 'Salle 201', statut: 'Active' },
    { id: 4, nom: '5ème B', niveau: '5ème', effectif: 29, titulaire: 'M. ANDRIA', salle: 'Salle 202', statut: 'Active' },
    { id: 5, nom: '4ème A', niveau: '4ème', effectif: 27, titulaire: 'Mme RALISON', salle: 'Salle 203', statut: 'Active' },
    { id: 6, nom: '3ème A', niveau: '3ème', effectif: 25, titulaire: 'M. RANDRIAN', salle: 'Salle 301', statut: 'Active' },
    { id: 7, nom: '2nde A', niveau: '2nde', effectif: 35, titulaire: 'Mme RABE', salle: 'Salle 401', statut: 'Active' },
    { id: 8, nom: '1ère A', niveau: '1ère', effectif: 30, titulaire: 'M. RAKOTO', salle: 'Salle 402', statut: 'Active' },
    { id: 9, nom: 'Tle C', niveau: 'Terminale', effectif: 28, titulaire: 'Mme RAVELO', salle: 'Salle 403', statut: 'Active' },
    { id: 10, nom: 'Tle D', niveau: 'Terminale', effectif: 26, titulaire: 'M. ANDRIA', salle: 'Salle 404', statut: 'Active' }
];

// Données des utilisateurs
let usersData = [
    { id: 1, nom: 'Admin Système', email: 'admin@ecole.com', role: 'Administrateur', telephone: '0321234500', statut: 'Actif', derniereConnexion: '25/03/2026' },
    { id: 2, nom: 'Prof. RAKOTO', email: 'prof.rakoto@ecole.com', role: 'Professeur', telephone: '0321234501', statut: 'Actif', derniereConnexion: '25/03/2026' },
    { id: 3, nom: 'Mme RABE', email: 'secretaire@ecole.com', role: 'Secrétaire', telephone: '0321234502', statut: 'Actif', derniereConnexion: '24/03/2026' },
    { id: 4, nom: 'M. ANDRIA', email: 'comptable@ecole.com', role: 'Comptable', telephone: '0321234503', statut: 'Actif', derniereConnexion: '23/03/2026' },
    { id: 5, nom: 'Mme RAVELO', email: 'cpe@ecole.com', role: 'CPE', telephone: '0321234504', statut: 'Inactif', derniereConnexion: '20/03/2026' }
];

// Données détaillées des frais scolaires
let fraisData = [
    { id: 1, matricule: '2024001', nom: 'Jean RAKOTO', classe: '3ème A', montantTotal: 250000, paye: 150000, reste: 100000, dernierPaiement: '2024-03-15', statut: 'Partiel' },
    { id: 2, matricule: '2024002', nom: 'Marie RABE', classe: '5ème B', montantTotal: 250000, paye: 250000, reste: 0, dernierPaiement: '2024-03-20', statut: 'Payé' },
    { id: 3, matricule: '2024003', nom: 'Paul ANDRIA', classe: '2nde A', montantTotal: 250000, paye: 80000, reste: 170000, dernierPaiement: '2024-02-10', statut: 'En retard' },
    { id: 4, matricule: '2024004', nom: 'Sophie RAVO', classe: '4ème C', montantTotal: 250000, paye: 200000, reste: 50000, dernierPaiement: '2024-03-10', statut: 'Partiel' },
    { id: 5, matricule: '2024005', nom: 'Luc RADO', classe: '6ème B', montantTotal: 250000, paye: 250000, reste: 0, dernierPaiement: '2024-03-18', statut: 'Payé' },
    { id: 6, matricule: '2024006', nom: 'Sarah RANDRIAN', classe: '3ème B', montantTotal: 250000, paye: 0, reste: 250000, dernierPaiement: null, statut: 'Impayé' },
    { id: 7, matricule: '2024007', nom: 'Mickael RAKOTOARIMANANA', classe: '1ère A', montantTotal: 250000, paye: 100000, reste: 150000, dernierPaiement: '2024-03-05', statut: 'Partiel' },
    { id: 8, matricule: '2024008', nom: 'Liana RABEARISON', classe: 'Tle C', montantTotal: 250000, paye: 250000, reste: 0, dernierPaiement: '2024-03-22', statut: 'Payé' },
    { id: 9, matricule: '2024009', nom: 'Hery ANDRIANANTENAINA', classe: '4ème B', montantTotal: 250000, paye: 50000, reste: 200000, dernierPaiement: '2024-02-28', statut: 'En retard' },
    { id: 10, matricule: '2024010', nom: 'Fitiavana RAKOTONIAINA', classe: '2nde B', montantTotal: 250000, paye: 180000, reste: 70000, dernierPaiement: '2024-03-12', statut: 'Partiel' }
];

// Données des élèves pour la page Liste des élèves
let elevesData = [
    { id: 1, matricule: '2024001', nom: 'Jean RAKOTO', classe: '3ème A', email: 'jean.rakoto@ecole.com', telephone: '0321234567', statut: 'actif', dateInscription: '2024-01-15', dateNaissance: '2010-05-12', genre: 'M', adresse: 'Antananarivo', parent: 'M. RAKOTO' },
    { id: 2, matricule: '2024002', nom: 'Marie RABE', classe: '5ème B', email: 'marie.rabe@ecole.com', telephone: '0321234568', statut: 'actif', dateInscription: '2024-01-15', dateNaissance: '2009-08-23', genre: 'F', adresse: 'Antananarivo', parent: 'Mme RABE' },
    { id: 3, matricule: '2024003', nom: 'Paul ANDRIA', classe: '2nde A', email: 'paul.andria@ecole.com', telephone: '0321234569', statut: 'actif', dateInscription: '2024-01-16', dateNaissance: '2008-11-05', genre: 'M', adresse: 'Antsirabe', parent: 'M. ANDRIA' },
    { id: 4, matricule: '2024004', nom: 'Sophie RAVO', classe: '4ème C', email: 'sophie.ravo@ecole.com', telephone: '0321234570', statut: 'inactif', dateInscription: '2024-01-14', dateNaissance: '2009-02-18', genre: 'F', adresse: 'Fianarantsoa', parent: 'Mme RAVO' },
    { id: 5, matricule: '2024005', nom: 'Luc RADO', classe: '6ème B', email: 'luc.rado@ecole.com', telephone: '0321234571', statut: 'actif', dateInscription: '2024-01-17', dateNaissance: '2011-07-30', genre: 'M', adresse: 'Toamasina', parent: 'M. RADO' },
    { id: 6, matricule: '2024006', nom: 'Sarah RANDRIAN', classe: '3ème B', email: 'sarah.randrian@ecole.com', telephone: '0321234572', statut: 'actif', dateInscription: '2024-02-01', dateNaissance: '2010-03-14', genre: 'F', adresse: 'Antananarivo', parent: 'Mme RANDRIAN' },
    { id: 7, matricule: '2024007', nom: 'Mickael RAKOTOARIMANANA', classe: '1ère A', email: 'mickael.rakoto@ecole.com', telephone: '0321234573', statut: 'suspendu', dateInscription: '2024-01-20', dateNaissance: '2007-09-22', genre: 'M', adresse: 'Mahajanga', parent: 'M. RAKOTOARIMANANA' },
    { id: 8, matricule: '2024008', nom: 'Liana RABEARISON', classe: 'Tle C', email: 'liana.rabearison@ecole.com', telephone: '0321234574', statut: 'actif', dateInscription: '2024-01-18', dateNaissance: '2006-12-08', genre: 'F', adresse: 'Antananarivo', parent: 'Mme RABEARISON' },
    { id: 9, matricule: '2024009', nom: 'Hery ANDRIANANTENAINA', classe: '4ème B', email: 'hery.andria@ecole.com', telephone: '0321234575', statut: 'actif', dateInscription: '2024-01-19', dateNaissance: '2009-06-17', genre: 'M', adresse: 'Toliara', parent: 'M. ANDRIANANTENAINA' },
    { id: 10, matricule: '2024010', nom: 'Fitiavana RAKOTONIAINA', classe: '2nde B', email: 'fitiavana.rakoto@ecole.com', telephone: '0321234576', statut: 'actif', dateInscription: '2024-03-01', dateNaissance: '2008-04-25', genre: 'M', adresse: 'Antananarivo', parent: 'Mme RAKOTONIAINA' }
];

// Données des bulletins étendues (par matière et enseignant) - depuis maquette _3
let bulletinsData = [
    { eleveMatricule: '2024001', eleveNom: 'Jean RAKOTO', matiere: 'Mathématiques', enseignant: 'M. RAKOTO', note: 15, coefficient: 5, periode: 'T1', commentaire: '' },
    { eleveMatricule: '2024001', eleveNom: 'Jean RAKOTO', matiere: 'Français', enseignant: 'Mme RABE', note: 14, coefficient: 4, periode: 'T1', commentaire: '' },
    { eleveMatricule: '2024002', eleveNom: 'Marie RABE', matiere: 'Mathématiques', enseignant: 'M. RAKOTO', note: 17, coefficient: 5, periode: 'T1', commentaire: '' },
    { eleveMatricule: '2024002', eleveNom: 'Marie RABE', matiere: 'Français', enseignant: 'Mme RABE', note: 16, coefficient: 4, periode: 'T1', commentaire: '' }
];

// Conserver aussi l'ancien format bulletins pour compatibilité
let bulletins = {
    'Jean RAKOTO': { mathematiques: 15, francais: 14, anglais: 16, physique: 13, svt: 14, moyenne: 14.4 },
    'Marie RABE': { mathematiques: 17, francais: 16, anglais: 18, physique: 15, svt: 16, moyenne: 16.4 },
    'Paul ANDRIA': { mathematiques: 12, francais: 11, anglais: 13, physique: 10, svt: 12, moyenne: 11.6 },
    'Sophie RAVO': { mathematiques: 14, francais: 15, anglais: 14, physique: 13, svt: 14, moyenne: 14.0 },
    'Luc RADO': { mathematiques: 16, francais: 14, anglais: 15, physique: 14, svt: 15, moyenne: 14.8 }
};

let currentBulletinStudent = null;
let currentJustifyMatricule = null;
let charts = {};

// Variables pour la gestion des frais
let currentFraisPage = 1;
let rowsPerPage = 5;
let filteredFraisData = [...fraisData];

// Variables pour la gestion des élèves
let currentEleveId = null;
let currentElevesPage = 1;
let elevesRowsPerPage = 5;
let filteredElevesData = [...elevesData];
let currentStatutFilter = 'all';
let deleteEleveId = null;

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

// ════════════════════════════════════════════════════════════════
// PAGE LISTE DES ÉLÈVES (fusionnée)
// ════════════════════════════════════════════════════════════════
function renderElevesPage() {
    return `
                <div class="dash-card">
                    <div class="dash-card-head">
                        <span class="dash-card-title">
                            <i class="fas fa-users"></i> Liste des élèves
                        </span>
                        <button class="btn btn-success btn-sm" onclick="openEleveModal()">
                            <i class="fas fa-plus"></i> Nouvel élève
                        </button>
                    </div>
                    <div class="dash-card-body">
                        
                        <div class="eleves-stats">
                            <div class="stat-card-eleve" onclick="filterByStatut('all')">
                                <div class="stat-icon"><i class="fas fa-user-graduate" style="color: var(--primary);"></i></div>
                                <div class="stat-value" id="totalElevesStat">0</div>
                                <div class="stat-label">Total élèves</div>
                            </div>
                            <div class="stat-card-eleve" onclick="filterByStatut('actif')">
                                <div class="stat-icon"><i class="fas fa-check-circle" style="color: var(--success);"></i></div>
                                <div class="stat-value" id="elevesActifsStat">0</div>
                                <div class="stat-label">Élèves actifs</div>
                            </div>
                            <div class="stat-card-eleve" onclick="filterByStatut('inactif')">
                                <div class="stat-icon"><i class="fas fa-user-slash" style="color: var(--danger);"></i></div>
                                <div class="stat-value" id="elevesInactifsStat">0</div>
                                <div class="stat-label">Élèves inactifs</div>
                            </div>
                            <div class="stat-card-eleve" onclick="filterByStatut('nouveaux')">
                                <div class="stat-icon"><i class="fas fa-star" style="color: var(--warning);"></i></div>
                                <div class="stat-value" id="nouveauxElevesStat">0</div>
                                <div class="stat-label">Nouveaux (30j)</div>
                            </div>
                        </div>
                        
                        <div class="eleves-filters">
                            <div class="search-box-eleve">
                                <i class="fas fa-search"></i>
                                <input type="text" id="searchEleve" placeholder="Rechercher par nom, matricule ou classe..." onkeyup="filterElevesTable()">
                            </div>
                            <select id="filterClasseEleve" onchange="filterElevesTable()">
                                <option value="">Toutes les classes</option>
                                <option value="6ème">6ème</option><option value="5ème">5ème</option><option value="4ème">4ème</option>
                                <option value="3ème">3ème</option><option value="2nde">2nde</option><option value="1ère">1ère</option><option value="Tle">Tle</option>
                            </select>
                            <select id="filterStatutEleve" onchange="filterElevesTable()">
                                <option value="">Tous les statuts</option>
                                <option value="actif">Actif</option>
                                <option value="inactif">Inactif</option>
                                <option value="suspendu">Suspendu</option>
                            </select>
                            <div class="btn-group-eleve">
                                <button class="btn-icon" onclick="exportElevesToExcel()" title="Exporter en Excel"><i class="fas fa-file-excel" style="color: #28a745;"></i></button>
                                <button class="btn-icon" onclick="printElevesList()" title="Imprimer la liste"><i class="fas fa-print"></i></button>
                                <button class="btn-icon" onclick="sendBulkSMS()" title="Envoyer SMS groupé"><i class="fas fa-envelope"></i></button>
                            </div>
                        </div>
                        
                        <div style="overflow-x: auto;">
                            <table class="dash-table" id="elevesTable">
                                <thead><tr><th style="width: 50px;">Avatar</th><th>Matricule</th><th>Nom complet</th><th>Classe</th><th>Email</th><th>Téléphone</th><th>Statut</th><th>Date inscription</th><th>Actions</th></tr></thead>
                                <tbody id="elevesTableBody"></tbody>
                            </table>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 20px; padding: 10px;">
                            <div><span id="elevesPaginationInfo">Affichage 1-5 sur 0</span></div>
                            <div class="action-buttons">
                                <button class="btn-icon" onclick="previousElevesPage()" id="prevElevePageBtn" disabled><i class="fas fa-chevron-left"></i> Précédent</button>
                                <button class="btn-icon" onclick="nextElevesPage()" id="nextElevePageBtn">Suivant <i class="fas fa-chevron-right"></i></button>
                            </div>
                        </div>
                        
                    </div>
                </div>
            `;
}

function loadElevesPage() {
    updateElevesStats();
    renderElevesTable();
}

function updateElevesStats() {
    const total = elevesData.length;
    const actifs = elevesData.filter(e => e.statut === 'actif').length;
    const inactifs = elevesData.filter(e => e.statut === 'inactif').length;
    const today = new Date();
    const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));
    const nouveaux = elevesData.filter(e => new Date(e.dateInscription) >= thirtyDaysAgo).length;

    document.getElementById('totalElevesStat').textContent = total;
    document.getElementById('elevesActifsStat').textContent = actifs;
    document.getElementById('elevesInactifsStat').textContent = inactifs;
    document.getElementById('nouveauxElevesStat').textContent = nouveaux;
}

function filterByStatut(statut) {
    currentStatutFilter = statut;
    const statutSelect = document.getElementById('filterStatutEleve');
    if (statutSelect) {
        if (statut === 'all') statutSelect.value = '';
        else if (statut === 'actif') statutSelect.value = 'actif';
        else if (statut === 'inactif') statutSelect.value = 'inactif';
        else if (statut === 'nouveaux') statutSelect.value = '';
    }
    filterElevesTable();
}

function filterElevesTable() {
    const searchTerm = document.getElementById('searchEleve')?.value.toLowerCase() || '';
    const filterClasse = document.getElementById('filterClasseEleve')?.value || '';
    const filterStatut = document.getElementById('filterStatutEleve')?.value || '';

    filteredElevesData = elevesData.filter(e => {
        const matchSearch = e.nom.toLowerCase().includes(searchTerm) || e.matricule.toLowerCase().includes(searchTerm) || e.classe.toLowerCase().includes(searchTerm);
        const matchClasse = !filterClasse || e.classe.includes(filterClasse);
        const matchStatut = !filterStatut || e.statut === filterStatut;
        if (currentStatutFilter === 'nouveaux') {
            const today = new Date();
            const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));
            return matchSearch && matchClasse && (new Date(e.dateInscription) >= thirtyDaysAgo);
        }
        return matchSearch && matchClasse && matchStatut;
    });
    currentElevesPage = 1;
    renderElevesTable();
}

function renderElevesTable() {
    const tbody = document.getElementById('elevesTableBody');
    if (!tbody) return;
    const start = (currentElevesPage - 1) * elevesRowsPerPage;
    const end = start + elevesRowsPerPage;
    const pageData = filteredElevesData.slice(start, end);

    if (pageData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="text-center p-3">Aucun élève trouvé</td></tr>';
        const paginationInfo = document.getElementById('elevesPaginationInfo');
        if (paginationInfo) paginationInfo.textContent = 'Affichage 0-0 sur 0';
        return;
    }

    tbody.innerHTML = pageData.map(e => {
        const initials = e.nom.split(' ').map(n => n[0]).join('').substring(0, 2);
        let statusClass = '', statusText = '';
        switch (e.statut) {
            case 'actif': statusClass = 'status-active'; statusText = 'Actif'; break;
            case 'inactif': statusClass = 'status-inactive'; statusText = 'Inactif'; break;
            case 'suspendu': statusClass = 'status-suspendu'; statusText = 'Suspendu'; break;
            default: statusClass = 'status-active'; statusText = 'Actif';
        }
        const dateInscription = new Date(e.dateInscription).toLocaleDateString('fr-FR');
        return `
                    <tr>
                        <td><div class="avatar-eleve">${initials}</div></td>
                        <td><strong>${e.matricule}</strong></td>
                        <td>${e.nom}</td>
                        <td>${e.classe}</td>
                        <td>${e.email || '—'}</td>
                        <td>${e.telephone || '—'}</td>
                        <td><span class="status-badge-eleve ${statusClass}">${statusText}</span></td>
                        <td>${dateInscription}</td>
                        <td class="action-buttons">
                            <button class="btn-small btn-primary" onclick="editEleve(${e.id})" title="Modifier"><i class="fas fa-edit"></i></button>
                            <button class="btn-small btn-danger" onclick="deleteEleve(${e.id})" title="Supprimer"><i class="fas fa-trash"></i></button>
                            <button class="btn-small btn-info" onclick="viewEleveDetails(${e.id})" title="Détails"><i class="fas fa-eye"></i></button>
                        </td>
                    </tr>
                `;
    }).join('');

    const total = filteredElevesData.length;
    const startIndex = (currentElevesPage - 1) * elevesRowsPerPage + 1;
    const endIndex = Math.min(currentElevesPage * elevesRowsPerPage, total);
    const paginationInfo = document.getElementById('elevesPaginationInfo');
    if (paginationInfo) paginationInfo.textContent = `Affichage ${startIndex}-${endIndex} sur ${total}`;

    const prevBtn = document.getElementById('prevElevePageBtn');
    const nextBtn = document.getElementById('nextElevePageBtn');
    if (prevBtn) prevBtn.disabled = currentElevesPage === 1;
    if (nextBtn) nextBtn.disabled = endIndex >= total;
}

function previousElevesPage() { if (currentElevesPage > 1) { currentElevesPage--; renderElevesTable(); } }
function nextElevesPage() { const totalPages = Math.ceil(filteredElevesData.length / elevesRowsPerPage); if (currentElevesPage < totalPages) { currentElevesPage++; renderElevesTable(); } }

function openEleveModal() {
    currentEleveId = null;
    document.getElementById('eleveModalTitle').innerHTML = '<i class="fas fa-user-plus"></i> Ajouter un élève';
    document.getElementById('eleveForm').reset();
    const nextId = elevesData.length + 1;
    const year = new Date().getFullYear();
    document.getElementById('eleveMatricule').value = `${year}${String(nextId).padStart(4, '0')}`;
    document.getElementById('eleveModal').classList.add('show');
}

function editEleve(id) {
    const eleve = elevesData.find(e => e.id === id);
    if (!eleve) return;
    currentEleveId = id;
    document.getElementById('eleveModalTitle').innerHTML = '<i class="fas fa-user-edit"></i> Modifier l\'élève';
    document.getElementById('eleveMatricule').value = eleve.matricule;
    document.getElementById('eleveNom').value = eleve.nom;
    document.getElementById('eleveClasse').value = eleve.classe;
    document.getElementById('eleveStatut').value = eleve.statut;
    document.getElementById('eleveEmail').value = eleve.email || '';
    document.getElementById('eleveTelephone').value = eleve.telephone || '';
    document.getElementById('eleveDateNaiss').value = eleve.dateNaissance || '';
    document.getElementById('eleveGenre').value = eleve.genre || 'M';
    document.getElementById('eleveAdresse').value = eleve.adresse || '';
    document.getElementById('eleveParent').value = eleve.parent || '';
    document.getElementById('eleveModal').classList.add('show');
}

function saveEleve() {
    const matricule = document.getElementById('eleveMatricule').value;
    const nom = document.getElementById('eleveNom').value;
    const classe = document.getElementById('eleveClasse').value;
    const statut = document.getElementById('eleveStatut').value;
    const email = document.getElementById('eleveEmail').value;
    const telephone = document.getElementById('eleveTelephone').value;
    const dateNaissance = document.getElementById('eleveDateNaiss').value;
    const genre = document.getElementById('eleveGenre').value;
    const adresse = document.getElementById('eleveAdresse').value;
    const parent = document.getElementById('eleveParent').value;

    if (!matricule || !nom || !classe) {
        alert('Veuillez remplir tous les champs obligatoires (Matricule, Nom, Classe)');
        return;
    }

    const dateInscription = new Date().toISOString().split('T')[0];

    if (currentEleveId) {
        const index = elevesData.findIndex(e => e.id === currentEleveId);
        if (index !== -1) {
            elevesData[index] = { ...elevesData[index], matricule, nom, classe, statut, email, telephone, dateNaissance, genre, adresse, parent };
            alert(`Élève "${nom}" modifié avec succès !`);
        }
    } else {
        const newId = Math.max(...elevesData.map(e => e.id), 0) + 1;
        elevesData.push({ id: newId, matricule, nom, classe, statut, email, telephone, dateInscription, dateNaissance, genre, adresse, parent });
        alert(`Élève "${nom}" ajouté avec succès !`);
    }

    closeEleveModal();
    updateElevesStats();
    filterElevesTable();
}

function deleteEleve(id) {
    const eleve = elevesData.find(e => e.id === id);
    if (eleve) {
        deleteEleveId = id;
        document.getElementById('deleteEleveName').textContent = eleve.nom;
        document.getElementById('confirmDeleteModal').classList.add('show');
    }
}

function confirmDeleteEleve() {
    if (deleteEleveId) {
        const index = elevesData.findIndex(e => e.id === deleteEleveId);
        if (index !== -1) {
            const deletedEleve = elevesData[index];
            elevesData.splice(index, 1);
            alert(`Élève "${deletedEleve.nom}" supprimé avec succès !`);
        }
        deleteEleveId = null;
        closeConfirmModal();
        updateElevesStats();
        filterElevesTable();
    }
}

function closeConfirmModal() { document.getElementById('confirmDeleteModal').classList.remove('show'); deleteEleveId = null; }
function closeEleveModal() { document.getElementById('eleveModal').classList.remove('show'); currentEleveId = null; }

function viewEleveDetails(id) {
    const eleve = elevesData.find(e => e.id === id);
    if (eleve) {
        alert(`=== FICHE ÉLÈVE ===\nMatricule: ${eleve.matricule}\nNom: ${eleve.nom}\nClasse: ${eleve.classe}\nStatut: ${eleve.statut}\nEmail: ${eleve.email || 'Non renseigné'}\nTéléphone: ${eleve.telephone || 'Non renseigné'}\nDate de naissance: ${eleve.dateNaissance || 'Non renseigné'}\nGenre: ${eleve.genre === 'M' ? 'Masculin' : 'Féminin'}\nAdresse: ${eleve.adresse || 'Non renseigné'}\nParent/Tuteur: ${eleve.parent || 'Non renseigné'}\nDate inscription: ${new Date(eleve.dateInscription).toLocaleDateString('fr-FR')}`);
    }
}

function exportElevesToExcel() {
    let csv = "Matricule,Nom,Classe,Email,Téléphone,Statut,Date inscription,Date naissance,Genre,Adresse,Parent\n";
    filteredElevesData.forEach(e => {
        csv += `"${e.matricule}","${e.nom}","${e.classe}","${e.email || ''}","${e.telephone || ''}","${e.statut}","${e.dateInscription}","${e.dateNaissance || ''}","${e.genre || ''}","${e.adresse || ''}","${e.parent || ''}"\n`;
    });
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', 'liste_eleves.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function printElevesList() {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
                <html><head><title>Liste des élèves</title>
                <style>body{font-family:Arial,sans-serif;margin:20px;}table{border-collapse:collapse;width:100%;}th,td{border:1px solid #ddd;padding:8px;text-align:left;}th{background-color:#f2f2f2;}h1{color:#333;}.header{text-align:center;margin-bottom:20px;}</style>
                </head><body>
                <div class="header"><h1>Liste des élèves</h1><p>Date d'édition: ${new Date().toLocaleDateString('fr-FR')}</p><p>Total: ${filteredElevesData.length} élèves</p></div>
                <table><thead><tr><th>Matricule</th><th>Nom</th><th>Classe</th><th>Email</th><th>Téléphone</th><th>Statut</th></tr></thead>
                <tbody>${filteredElevesData.map(e => `<tr><td>${e.matricule}</td><td>${e.nom}</td><td>${e.classe}</td><td>${e.email || '—'}</td><td>${e.telephone || '—'}</td><td>${e.statut}</td></tr>`).join('')}</tbody></table>
                </body></html>
            `);
    printWindow.document.close();
    printWindow.print();
}

function sendBulkSMS() {
    const actifs = elevesData.filter(e => e.statut === 'actif' && e.telephone);
    if (actifs.length === 0) { alert('Aucun élève actif avec numéro de téléphone'); return; }
    alert(`Envoi de SMS à ${actifs.length} parents d'élèves (simulation)\n\nMessage: "Réunion parents-professeurs le 15 Avril à 14h00 dans la salle polyvalente."`);
}

// ════════════════════════════════════════════════════════════════
// PAGE FRAIS SCOLAIRES
// ════════════════════════════════════════════════════════════════
function renderFraisPage() {
    return `
                <div class="dash-card">
                    <div class="dash-card-head">
                        <span class="dash-card-title"><i class="fas fa-money-bill-wave"></i> Gestion des frais scolaires</span>
                        <button class="btn btn-success btn-sm" onclick="openAddPaymentModal()"><i class="fas fa-plus"></i> Nouveau paiement</button>
                    </div>
                    <div class="dash-card-body">
                        <div class="frais-stats">
                            <div class="stat-card"><div class="stat-icon"><i class="fas fa-users" style="color: var(--primary);"></i></div><div class="stat-value" id="totalElevesFrais">0</div><div class="stat-label">Total élèves</div></div>
                            <div class="stat-card"><div class="stat-icon"><i class="fas fa-check-circle" style="color: var(--success);"></i></div><div class="stat-value" id="totalPaye">0 Ar</div><div class="stat-label">Total payé</div></div>
                            <div class="stat-card"><div class="stat-icon"><i class="fas fa-clock" style="color: var(--warning);"></i></div><div class="stat-value" id="totalReste">0 Ar</div><div class="stat-label">Reste à payer</div></div>
                            <div class="stat-card"><div class="stat-icon"><i class="fas fa-percent" style="color: var(--forest);"></i></div><div class="stat-value" id="tauxRecouvrement">0%</div><div class="stat-label">Taux de recouvrement</div></div>
                        </div>
                        <div class="frais-filters">
                            <div class="search-box"><i class="fas fa-search"></i><input type="text" id="searchFrais" placeholder="Rechercher un élève..." onkeyup="filterFraisTable()"></div>
                            <select id="filterClasse" onchange="filterFraisTable()"><option value="">Toutes les classes</option><option value="6ème">6ème</option><option value="5ème">5ème</option><option value="4ème">4ème</option><option value="3ème">3ème</option><option value="2nde">2nde</option><option value="1ère">1ère</option><option value="Tle">Tle</option></select>
                            <select id="filterStatut" onchange="filterFraisTable()"><option value="">Tous les statuts</option><option value="Payé">Payé</option><option value="Partiel">Partiel</option><option value="En retard">En retard</option><option value="Impayé">Impayé</option></select>
                            <button class="btn-icon" onclick="exportFraisToExcel()" title="Exporter en Excel"><i class="fas fa-file-excel" style="color: #28a745;"></i> Exporter</button>
                            <button class="btn-icon" onclick="printFraisReport()" title="Imprimer le rapport"><i class="fas fa-print"></i> Imprimer</button>
                        </div>
                        <div style="overflow-x: auto;">
                            <table class="dash-table" id="fraisTable"><thead><tr><th>Matricule</th><th>Élève</th><th>Classe</th><th>Montant total</th><th>Payé</th><th>Reste</th><th>Progression</th><th>Statut</th><th>Dernier paiement</th><th>Actions</th></tr></thead><tbody id="fraisTableBody"></tbody></table>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 20px; padding: 10px;">
                            <div><span id="fraisPaginationInfo">Affichage 1-5 sur 10</span></div>
                            <div class="action-buttons">
                                <button class="btn-icon" onclick="previousFraisPage()" id="prevPageBtn" disabled><i class="fas fa-chevron-left"></i> Précédent</button>
                                <button class="btn-icon" onclick="nextFraisPage()" id="nextPageBtn">Suivant <i class="fas fa-chevron-right"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
}

function updateFraisStats() {
    const totalEleves = fraisData.length;
    const totalPaye = fraisData.reduce((sum, f) => sum + f.paye, 0);
    const totalReste = fraisData.reduce((sum, f) => sum + f.reste, 0);
    const totalAttendu = totalPaye + totalReste;
    const tauxRecouvrement = totalAttendu > 0 ? ((totalPaye / totalAttendu) * 100).toFixed(1) : 0;
    const totalElevesElem = document.getElementById('totalElevesFrais');
    const totalPayeElem = document.getElementById('totalPaye');
    const totalResteElem = document.getElementById('totalReste');
    const tauxRecouvrementElem = document.getElementById('tauxRecouvrement');
    if (totalElevesElem) totalElevesElem.textContent = totalEleves;
    if (totalPayeElem) totalPayeElem.textContent = totalPaye.toLocaleString() + ' Ar';
    if (totalResteElem) totalResteElem.textContent = totalReste.toLocaleString() + ' Ar';
    if (tauxRecouvrementElem) tauxRecouvrementElem.textContent = tauxRecouvrement + '%';
}

function populateStudentSelect() {
    const select = document.getElementById('paymentStudent');
    if (select) {
        select.innerHTML = '<option value="">Sélectionner un élève</option>' +
            fraisData.map(f => `<option value="${f.id}" data-reste="${f.reste}" data-paye="${f.paye}" data-total="${f.montantTotal}">${f.nom} (${f.classe}) - Reste: ${f.reste.toLocaleString()} Ar</option>`).join('');
    }
}

function updatePaymentInfo() {
    const select = document.getElementById('paymentStudent');
    if (!select) return;
    const selectedOption = select.options[select.selectedIndex];
    const paymentInfo = document.getElementById('paymentInfo');
    const paymentAmount = document.getElementById('paymentAmount');
    if (select.value) {
        const reste = parseInt(selectedOption.dataset.reste);
        const paye = parseInt(selectedOption.dataset.paye);
        const total = parseInt(selectedOption.dataset.total);
        const infoTotal = document.getElementById('infoTotal');
        const infoPaye = document.getElementById('infoPaye');
        const infoReste = document.getElementById('infoReste');
        if (infoTotal) infoTotal.textContent = total.toLocaleString();
        if (infoPaye) infoPaye.textContent = paye.toLocaleString();
        if (infoReste) infoReste.textContent = reste.toLocaleString();
        if (paymentInfo) paymentInfo.style.display = 'block';
        if (paymentAmount) { paymentAmount.max = reste; paymentAmount.placeholder = `Montant (max: ${reste.toLocaleString()} Ar)`; }
    } else {
        if (paymentInfo) paymentInfo.style.display = 'none';
        if (paymentAmount) paymentAmount.placeholder = 'Saisir le montant';
    }
}

function savePayment() {
    const studentId = document.getElementById('paymentStudent').value;
    const amount = parseFloat(document.getElementById('paymentAmount').value);
    const paymentDate = document.getElementById('paymentDate').value;
    if (!studentId) { alert('Veuillez sélectionner un élève'); return; }
    if (!amount || amount <= 0) { alert('Veuillez saisir un montant valide'); return; }
    if (!paymentDate) { alert('Veuillez saisir la date du paiement'); return; }
    const student = fraisData.find(f => f.id == studentId);
    if (amount > student.reste) { alert(`Le montant saisi (${amount.toLocaleString()} Ar) dépasse le reste à payer (${student.reste.toLocaleString()} Ar)`); return; }
    student.paye += amount;
    student.reste -= amount;
    student.dernierPaiement = paymentDate;
    if (student.reste === 0) { student.statut = 'Payé'; } else {
        const lastPayment = new Date(student.dernierPaiement);
        const today = new Date();
        const daysDiff = Math.floor((today - lastPayment) / (1000 * 60 * 60 * 24));
        student.statut = daysDiff > 30 ? 'En retard' : 'Partiel';
    }
    updateFraisStats();
    filterFraisTable();
    populateStudentSelect();
    closePaymentModal();
    document.getElementById('paymentForm').reset();
    const paymentInfo = document.getElementById('paymentInfo');
    if (paymentInfo) paymentInfo.style.display = 'none';
    alert(`Paiement de ${amount.toLocaleString()} Ar enregistré avec succès pour ${student.nom}`);
}

function filterFraisTable() {
    const searchTerm = document.getElementById('searchFrais') ? document.getElementById('searchFrais').value.toLowerCase() : '';
    const filterClasse = document.getElementById('filterClasse') ? document.getElementById('filterClasse').value : '';
    const filterStatut = document.getElementById('filterStatut') ? document.getElementById('filterStatut').value : '';
    filteredFraisData = fraisData.filter(f => {
        const matchSearch = f.nom.toLowerCase().includes(searchTerm) || f.matricule.toLowerCase().includes(searchTerm);
        const matchClasse = !filterClasse || f.classe.includes(filterClasse);
        const matchStatut = !filterStatut || f.statut === filterStatut;
        return matchSearch && matchClasse && matchStatut;
    });
    currentFraisPage = 1;
    renderFraisTable();
}

function renderFraisTable() {
    const tbody = document.getElementById('fraisTableBody');
    if (!tbody) return;
    const start = (currentFraisPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const pageData = filteredFraisData.slice(start, end);
    if (pageData.length === 0) { tbody.innerHTML = '<tr><td colspan="10" class="text-center p-3">Aucun résultat trouvé</td></tr>'; return; }
    tbody.innerHTML = pageData.map(f => {
        const pourcentage = (f.paye / f.montantTotal * 100).toFixed(1);
        let statusClass = '';
        if (f.statut === 'Payé') statusClass = 'status-paid';
        else if (f.statut === 'En retard') statusClass = 'status-late';
        else if (f.statut === 'Partiel') statusClass = 'status-partial';
        else statusClass = 'status-pending';
        return `<tr><td>${f.matricule}</td><td><strong>${f.nom}</strong></td><td>${f.classe}</td><td>${f.montantTotal.toLocaleString()} Ar</td><td style="color: var(--success); font-weight: bold;">${f.paye.toLocaleString()} Ar</td><td style="color: ${f.reste > 0 ? 'var(--danger)' : 'var(--success)'};">${f.reste.toLocaleString()} Ar</td><td style="width: 120px;"><div class="progress-frais"><div class="progress-frais-bar" style="width: ${pourcentage}%"></div></div><small>${pourcentage}%</small></td><td><span class="status-badge ${statusClass}">${f.statut}</span></td><td>${f.dernierPaiement ? new Date(f.dernierPaiement).toLocaleDateString('fr-FR') : '—'}</td><td class="action-buttons"><button class="btn-small btn-success" onclick="quickPayment(${f.id})" title="Enregistrer paiement"><i class="fas fa-money-bill"></i></button><button class="btn-small btn-primary" onclick="viewPaymentHistory(${f.id})" title="Historique"><i class="fas fa-history"></i></button><button class="btn-small btn-info" onclick="generateReceipt(${f.id})" title="Générer reçu"><i class="fas fa-receipt"></i></button></td></tr>`;
    }).join('');
    const total = filteredFraisData.length;
    const startIndex = (currentFraisPage - 1) * rowsPerPage + 1;
    const endIndex = Math.min(currentFraisPage * rowsPerPage, total);
    const paginationInfo = document.getElementById('fraisPaginationInfo');
    if (paginationInfo) paginationInfo.textContent = `Affichage ${startIndex}-${endIndex} sur ${total}`;
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    if (prevBtn) prevBtn.disabled = currentFraisPage === 1;
    if (nextBtn) nextBtn.disabled = endIndex >= total;
}

function previousFraisPage() { if (currentFraisPage > 1) { currentFraisPage--; renderFraisTable(); } }
function nextFraisPage() { const totalPages = Math.ceil(filteredFraisData.length / rowsPerPage); if (currentFraisPage < totalPages) { currentFraisPage++; renderFraisTable(); } }
function openAddPaymentModal() { const modal = document.getElementById('paymentModal'); if (modal) { modal.classList.add('show'); const dateInput = document.getElementById('paymentDate'); if (dateInput) dateInput.valueAsDate = new Date(); } }
function closePaymentModal() { const modal = document.getElementById('paymentModal'); if (modal) { modal.classList.remove('show'); const form = document.getElementById('paymentForm'); if (form) form.reset(); const paymentInfo = document.getElementById('paymentInfo'); if (paymentInfo) paymentInfo.style.display = 'none'; } }
function quickPayment(studentId) { const student = fraisData.find(f => f.id == studentId); if (student) { const select = document.getElementById('paymentStudent'); if (select) { select.value = studentId; updatePaymentInfo(); openAddPaymentModal(); } } }
function viewPaymentHistory(studentId) { const student = fraisData.find(f => f.id == studentId); if (student) { alert(`Historique des paiements pour ${student.nom}:\n\nMontant total: ${student.montantTotal.toLocaleString()} Ar\nTotal payé: ${student.paye.toLocaleString()} Ar\nReste: ${student.reste.toLocaleString()} Ar\nDernier paiement: ${student.dernierPaiement || 'Aucun'}\nStatut: ${student.statut}`); } }
function generateReceipt(studentId) { const student = fraisData.find(f => f.id == studentId); if (student) { alert(`====================================\n     ECOLE DE GESTION SCOLAIRE\n====================================\n\nREÇU DE PAIEMENT N°: ${Date.now()}\nDate: ${new Date().toLocaleDateString('fr-FR')}\n\nÉlève: ${student.nom}\nMatricule: ${student.matricule}\nClasse: ${student.classe}\n\nMontant total: ${student.montantTotal.toLocaleString()} Ar\nMontant payé: ${student.paye.toLocaleString()} Ar\nReste à payer: ${student.reste.toLocaleString()} Ar\n\nStatut: ${student.statut}\n\n====================================\nMerci de votre confiance`); } }
function exportFraisToExcel() { let csv = "Matricule,Nom,Classe,Montant total,Payé,Reste,Statut,Dernier paiement\n"; filteredFraisData.forEach(f => { csv += `"${f.matricule}","${f.nom}","${f.classe}",${f.montantTotal},${f.paye},${f.reste},"${f.statut}","${f.dernierPaiement || ''}"\n`; }); const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' }); const link = document.createElement('a'); const url = URL.createObjectURL(blob); link.href = url; link.setAttribute('download', 'frais_scolaires.csv'); document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url); }
function printFraisReport() { const printWindow = window.open('', '_blank'); printWindow.document.write(`<html><head><title>Rapport des frais scolaires</title><style>body{font-family:Arial,sans-serif;margin:20px;}table{border-collapse:collapse;width:100%;}th,td{border:1px solid #ddd;padding:8px;text-align:left;}th{background-color:#f2f2f2;}h1{color:#333;}.summary{margin-bottom:20px;padding:10px;background:#f9f9f9;}</style></head><body><h1>Rapport des frais scolaires</h1><div class="summary"><p><strong>Date d'édition:</strong> ${new Date().toLocaleDateString('fr-FR')}</p><p><strong>Total élèves:</strong> ${filteredFraisData.length}</p><p><strong>Total payé:</strong> ${filteredFraisData.reduce((s, f) => s + f.paye, 0).toLocaleString()} Ar</p><p><strong>Total impayé:</strong> ${filteredFraisData.reduce((s, f) => s + f.reste, 0).toLocaleString()} Ar</p></div><table><thead><tr><th>Matricule</th><th>Nom</th><th>Classe</th><th>Total</th><th>Payé</th><th>Reste</th><th>Statut</th></tr></thead><tbody>${filteredFraisData.map(f => `<tr><td>${f.matricule}</td><td>${f.nom}</td><td>${f.classe}</td><td>${f.montantTotal.toLocaleString()} Ar</td><td>${f.paye.toLocaleString()} Ar</td><td>${f.reste.toLocaleString()} Ar</td><td>${f.statut}</td></tr>`).join('')}</tbody></table></body></html>`); printWindow.document.close(); printWindow.print(); }

// ════════════════════════════════════════════════════════════════
// AUTRES PAGES MODULES
// ════════════════════════════════════════════════════════════════

// Fonctions helper (depuis maquette _3)
function getElevesSelectOptions() {
    return elevesData.map(e => `<option value="${e.matricule}" data-nom="${e.nom}" data-classe="${e.classe}">${e.matricule} - ${e.nom} (${e.classe})</option>`).join('');
}

function getMatieresSelectOptions() {
    return matieresData.map(m => `<option value="${m.nom}" data-enseignant="${m.enseignant}" data-coeff="${m.coefficient}">${m.nom} (coeff ${m.coefficient})</option>`).join('');
}

function getEnseignantsSelectOptions() {
    const enseignants = [...new Set(matieresData.map(m => m.enseignant))];
    return enseignants.map(e => `<option value="${e}">${e}</option>`).join('');
}

// Page Absences enrichie (depuis maquette _3)
function renderAbsencesPage() {
    const totalAbsences = absencesData.reduce((sum, a) => sum + a.absences, 0);
    const totalRetards = absencesData.reduce((sum, a) => sum + a.retards, 0);
    const critiques = absencesData.filter(a => a.statut === 'Critique').length;

    return `
                <div class="dash-card">
                    <div class="dash-card-head">
                        <span class="dash-card-title"><i class="fas fa-calendar-times"></i> Retards & Absences</span>
                        <button class="btn btn-success btn-sm" onclick="openSignalModal()"><i class="fas fa-plus"></i> Signaler absence/retard</button>
                    </div>
                    <div class="dash-card-body">
                        <div class="absence-stats">
                            <div class="absence-card">
                                <div class="stat-icon"><i class="fas fa-calendar-times" style="color: var(--danger);"></i></div>
                                <div class="stat-value">${totalAbsences}</div>
                                <div class="stat-label">Total absences</div>
                            </div>
                            <div class="absence-card">
                                <div class="stat-icon"><i class="fas fa-clock" style="color: var(--warning);"></i></div>
                                <div class="stat-value">${totalRetards}</div>
                                <div class="stat-label">Total retards</div>
                            </div>
                            <div class="absence-card">
                                <div class="stat-icon"><i class="fas fa-exclamation-triangle" style="color: var(--danger);"></i></div>
                                <div class="stat-value">${critiques}</div>
                                <div class="stat-label">Élèves critiques</div>
                            </div>
                        </div>
                        <div style="overflow-x: auto;">
                            <table class="dash-table">
                                <thead>
                                    <tr><th>Matricule</th><th>Élève</th><th>Classe</th><th>Absences</th><th>Retards</th><th>Statut</th><th>Justifiée</th><th>Actions</th></tr>
                                </thead>
                                <tbody>
                                    ${absencesData.map(a => `
                                        <tr>
                                            <td><strong>${a.matricule}</strong></td>
                                            <td>${a.nom}</td>
                                            <td>${a.classe}</td>
                                            <td>${a.absences}</td>
                                            <td>${a.retards}</td>
                                            <td><span class="badge ${a.statut === 'Critique' ? 'badge-danger' : a.statut === 'Attention' ? 'badge-warning' : 'badge-success'}">${a.statut}</span></td>
                                            <td>${a.justifie ? '<span class="badge badge-success">Justifiée</span>' : '<span class="badge badge-danger">Non justifiée</span>'}</td>
                                            <td class="action-buttons">
                                                <button class="btn-small btn-info" onclick="viewAbsenceDetails('${a.matricule}')"><i class="fas fa-eye"></i></button>
                                                ${!a.justifie ? `<button class="btn-small btn-success" onclick="openJustifyModal('${a.matricule}', '${a.nom}')"><i class="fas fa-check"></i> Justifier</button>` : ''}
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
}

// Fonctions absences (depuis maquette _3)
function openSignalModal() {
    const select = document.getElementById('absenceStudent');
    if (select) select.innerHTML = '<option value="">Sélectionner un élève (par matricule ou nom)</option>' + getElevesSelectOptions();
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('absenceDate');
    if (dateInput) dateInput.value = today;
    document.getElementById('signalAbsenceModal').classList.add('show');
}

function closeSignalModal() {
    document.getElementById('signalAbsenceModal').classList.remove('show');
    document.getElementById('absenceForm').reset();
}

function saveAbsence() {
    const matricule = document.getElementById('absenceStudent').value;
    const type = document.getElementById('absenceType').value;
    const date = document.getElementById('absenceDate').value;
    const duree = parseFloat(document.getElementById('absenceDuration').value) || 1;
    const motif = document.getElementById('absenceReason').value;
    const justifie = document.getElementById('absenceJustified').value === 'oui';

    if (!matricule) { alert('Veuillez sélectionner un élève'); return; }
    if (!date) { alert('Veuillez saisir une date'); return; }

    const student = elevesData.find(e => e.matricule === matricule);
    if (!student) { alert('Élève non trouvé'); return; }

    let absenceRecord = absencesData.find(a => a.matricule === matricule);
    if (!absenceRecord) {
        absenceRecord = { id: absencesData.length + 1, matricule, nom: student.nom, classe: student.classe, absences: 0, retards: 0, statut: 'Normal', justifie: justifie, details: [] };
        absencesData.push(absenceRecord);
    }

    if (type === 'absence') { absenceRecord.absences += duree; } else { absenceRecord.retards += 1; }
    absenceRecord.details.push({ date, type, duree, motif, justifie });

    if (absenceRecord.absences >= 10) absenceRecord.statut = 'Critique';
    else if (absenceRecord.absences >= 5) absenceRecord.statut = 'Attention';
    else absenceRecord.statut = 'Normal';
    absenceRecord.justifie = justifie;

    alert(`${type === 'absence' ? 'Absence' : 'Retard'} enregistré(e) pour ${student.nom} (${matricule})`);
    closeSignalModal();
    loadPage('absences');
}

function viewAbsenceDetails(matricule) {
    const student = absencesData.find(a => a.matricule === matricule);
    if (student) {
        let detailsHtml = student.details.map(d => `${d.date} - ${d.type === 'absence' ? 'Absence' : 'Retard'} (${d.duree}h) : ${d.motif || 'Sans motif'}`).join('\n');
        alert(`=== Détails des absences/retards ===\nÉlève: ${student.nom} (${matricule})\nClasse: ${student.classe}\nAbsences: ${student.absences}\nRetards: ${student.retards}\nStatut: ${student.statut}\n\nHistorique:\n${detailsHtml || 'Aucun détail'}`);
    }
}

function openJustifyModal(matricule, nom) {
    currentJustifyMatricule = matricule;
    document.getElementById('justifyStudentName').textContent = `${nom} (${matricule})`;
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('justifyDate').value = today;
    document.getElementById('justifyModal').classList.add('show');
}

function closeJustifyModal() {
    document.getElementById('justifyModal').classList.remove('show');
    document.getElementById('justifyReason').value = '';
    document.getElementById('justifyFile').value = '';
    currentJustifyMatricule = null;
}

function confirmJustify() {
    if (!currentJustifyMatricule) return;
    const reason = document.getElementById('justifyReason').value;
    if (!reason) { alert('Veuillez indiquer le motif de justification'); return; }

    const absenceRecord = absencesData.find(a => a.matricule === currentJustifyMatricule);
    if (absenceRecord) {
        absenceRecord.justifie = true;
        alert(`Absence de ${absenceRecord.nom} justifiée avec succès !\nMotif: ${reason}`);
    }
    closeJustifyModal();
    loadPage('absences');
}

// Page Bulletins enrichie (depuis maquette _3)
function renderBulletinsPage() {
    return `
                <div class="dash-card">
                    <div class="dash-card-head">
                        <span class="dash-card-title"><i class="fas fa-file-alt"></i> Bulletins de notes</span>
                        <div class="action-buttons">
                            <button class="btn btn-success btn-sm" onclick="openAddBulletinModal()"><i class="fas fa-plus"></i> + Bulletin</button>
                            <div class="file-input-wrapper">
                                <button class="btn btn-info btn-sm"><i class="fas fa-file-excel"></i> Importer Excel</button>
                                <input type="file" id="excelImport" accept=".xlsx, .xls, .csv" onchange="importExcel(this)">
                            </div>
                            <button class="btn btn-primary btn-sm" onclick="exportBulletins()"><i class="fas fa-download"></i> Exporter</button>
                        </div>
                    </div>
                    <div class="dash-card-body">
                        <div style="overflow-x: auto;">
                            <table class="dash-table">
                                <thead>
                                    <tr><th>Matricule</th><th>Élève</th><th>Classe</th><th>Matière</th><th>Enseignant</th><th>Note</th><th>Coeff</th><th>Période</th><th>Actions</th></tr>
                                </thead>
                                <tbody>
                                    ${bulletinsData.map(b => `
                                        <tr>
                                            <td><strong>${b.eleveMatricule}</strong></td>
                                            <td>${b.eleveNom}</td>
                                            <td>${elevesData.find(e => e.matricule === b.eleveMatricule)?.classe || '-'}</td>
                                            <td><i class="fas fa-book-open" style="color:var(--terra);"></i> ${b.matiere}</td>
                                            <td>${b.enseignant}</td>
                                            <td><strong>${b.note}/20</strong></td>
                                            <td>${b.coefficient}</td>
                                            <td>${b.periode}</td>
                                            <td class="action-buttons">
                                                <button class="btn-small btn-primary" onclick="editBulletin('${b.eleveMatricule}', '${b.matiere}')"><i class="fas fa-edit"></i></button>
                                                <button class="btn-small btn-danger" onclick="deleteBulletin('${b.eleveMatricule}', '${b.matiere}')"><i class="fas fa-trash"></i></button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                    ${bulletinsData.length === 0 ? '<tr><td colspan="9" class="text-center p-3">Aucun bulletin enregistré. Cliquez sur "+ Bulletin" pour ajouter.</td></tr>' : ''}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
}

// Fonctions bulletins (depuis maquette _3)
function openAddBulletinModal() {
    const studentSelect = document.getElementById('bulletinStudent');
    const subjectSelect = document.getElementById('bulletinSubject');
    const teacherSelect = document.getElementById('bulletinTeacher');
    if (studentSelect) studentSelect.innerHTML = '<option value="">Sélectionner un élève</option>' + getElevesSelectOptions();
    if (subjectSelect) subjectSelect.innerHTML = '<option value="">Sélectionner une matière</option>' + getMatieresSelectOptions();
    if (teacherSelect) teacherSelect.innerHTML = '<option value="">Sélectionner un enseignant</option>' + getEnseignantsSelectOptions();
    document.getElementById('addBulletinModal').classList.add('show');
}

function closeAddBulletinModal() {
    document.getElementById('addBulletinModal').classList.remove('show');
    document.getElementById('addBulletinForm').reset();
}

function saveNewBulletin() {
    const matricule = document.getElementById('bulletinStudent').value;
    const matiere = document.getElementById('bulletinSubject').value;
    const enseignant = document.getElementById('bulletinTeacher').value;
    const note = parseFloat(document.getElementById('bulletinGrade').value);
    const coefficient = parseFloat(document.getElementById('bulletinCoeff').value);
    const periode = document.getElementById('bulletinPeriod').value;
    const commentaire = document.getElementById('bulletinComment').value;

    if (!matricule || !matiere || !enseignant || isNaN(note)) { alert('Veuillez remplir tous les champs obligatoires'); return; }
    if (note < 0 || note > 20) { alert('La note doit être comprise entre 0 et 20'); return; }

    const student = elevesData.find(e => e.matricule === matricule);
    if (!student) { alert('Élève non trouvé'); return; }

    const existingIndex = bulletinsData.findIndex(b => b.eleveMatricule === matricule && b.matiere === matiere && b.periode === periode);
    if (existingIndex !== -1) {
        if (confirm('Un bulletin existe déjà pour cette matière et cette période. Voulez-vous le remplacer ?')) {
            bulletinsData[existingIndex] = { eleveMatricule: matricule, eleveNom: student.nom, matiere, enseignant, note, coefficient, periode, commentaire };
            alert(`Bulletin modifié pour ${student.nom} en ${matiere}`);
        } else return;
    } else {
        bulletinsData.push({ eleveMatricule: matricule, eleveNom: student.nom, matiere, enseignant, note, coefficient, periode, commentaire });
        alert(`Bulletin ajouté pour ${student.nom} en ${matiere}`);
    }

    closeAddBulletinModal();
    loadPage('bulletins');
}

function editBulletin(matricule, matiere) {
    const bulletin = bulletinsData.find(b => b.eleveMatricule === matricule && b.matiere === matiere);
    if (bulletin) {
        const studentSelect = document.getElementById('bulletinStudent');
        const subjectSelect = document.getElementById('bulletinSubject');
        const teacherSelect = document.getElementById('bulletinTeacher');
        if (studentSelect) { studentSelect.innerHTML = '<option value="">Sélectionner un élève</option>' + getElevesSelectOptions(); studentSelect.value = matricule; }
        if (subjectSelect) { subjectSelect.innerHTML = '<option value="">Sélectionner une matière</option>' + getMatieresSelectOptions(); subjectSelect.value = matiere; }
        if (teacherSelect) { teacherSelect.innerHTML = '<option value="">Sélectionner un enseignant</option>' + getEnseignantsSelectOptions(); teacherSelect.value = bulletin.enseignant; }
        document.getElementById('bulletinGrade').value = bulletin.note;
        document.getElementById('bulletinCoeff').value = bulletin.coefficient;
        document.getElementById('bulletinPeriod').value = bulletin.periode;
        document.getElementById('bulletinComment').value = bulletin.commentaire || '';
        document.getElementById('addBulletinModal').classList.add('show');
    }
}

function deleteBulletin(matricule, matiere) {
    if (confirm(`Supprimer ce bulletin pour l'élève ${matricule} en ${matiere} ?`)) {
        const index = bulletinsData.findIndex(b => b.eleveMatricule === matricule && b.matiere === matiere);
        if (index !== -1) {
            bulletinsData.splice(index, 1);
            alert('Bulletin supprimé');
            loadPage('bulletins');
        }
    }
}

function getAverageForStudent(matricule) {
    const studentBulletins = bulletinsData.filter(b => b.eleveMatricule === matricule);
    if (studentBulletins.length === 0) return 0;
    let totalPoints = 0, totalCoeff = 0;
    studentBulletins.forEach(b => { totalPoints += b.note * b.coefficient; totalCoeff += b.coefficient; });
    return totalCoeff > 0 ? (totalPoints / totalCoeff).toFixed(1) : 0;
}

function renderClassesPage() {
    return `
                <div class="dash-card">
                    <div class="dash-card-head">
                        <span class="dash-card-title"><i class="fas fa-folder"></i> Gestion des classes</span>
                        <div class="action-buttons">
                            <button class="btn btn-success btn-sm" onclick="openAddClasseModal()"><i class="fas fa-plus"></i> Ajouter une classe</button>
                            <button class="btn btn-primary btn-sm" onclick="exportClasses()"><i class="fas fa-download"></i> Exporter</button>
                        </div>
                    </div>
                    <div class="dash-card-body">
                        <div class="absence-stats" style="grid-template-columns: repeat(auto-fit, minmax(150px,1fr)); margin-bottom:20px;">
                            <div class="absence-card"><div class="stat-icon"><i class="fas fa-folder" style="color:var(--primary);"></i></div><div class="stat-value">${classesData.length}</div><div class="stat-label">Total classes</div></div>
                            <div class="absence-card"><div class="stat-icon"><i class="fas fa-users" style="color:var(--success);"></i></div><div class="stat-value">${classesData.reduce((s, c) => s + c.effectif, 0)}</div><div class="stat-label">Total élèves</div></div>
                            <div class="absence-card"><div class="stat-icon"><i class="fas fa-chalkboard-teacher" style="color:var(--warning);"></i></div><div class="stat-value">${[...new Set(classesData.map(c => c.niveau))].length}</div><div class="stat-label">Niveaux</div></div>
                        </div>
                        <div style="overflow-x:auto;">
                            <table class="dash-table">
                                <thead><tr><th>Classe</th><th>Niveau</th><th>Effectif</th><th>Titulaire</th><th>Salle</th><th>Statut</th><th>Actions</th></tr></thead>
                                <tbody>
                                    ${classesData.map(c => `
                                        <tr>
                                            <td><strong><i class="fas fa-chalkboard" style="color:var(--primary); margin-right:6px;"></i>${c.nom}</strong></td>
                                            <td>${c.niveau}</td>
                                            <td><span class="badge badge-success">${c.effectif} élèves</span></td>
                                            <td>${c.titulaire}</td>
                                            <td>${c.salle}</td>
                                            <td><span class="badge ${c.statut === 'Active' ? 'badge-success' : 'badge-warning'}">${c.statut}</span></td>
                                            <td class="action-buttons">
                                                <button class="btn-small btn-info" onclick="viewClasseDetail('${c.nom}')"><i class="fas fa-eye"></i></button>
                                                <button class="btn-small btn-primary" onclick="editClasse('${c.nom}')"><i class="fas fa-edit"></i></button>
                                                <button class="btn-small btn-danger" onclick="deleteClasse('${c.nom}')"><i class="fas fa-trash"></i></button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                    ${classesData.length === 0 ? '<tr><td colspan="7" class="text-center p-3">Aucune classe enregistrée.</td></tr>' : ''}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
}

function renderMatieresPage() {
    return `
                <div class="dash-card">
                    <div class="dash-card-head">
                        <span class="dash-card-title"><i class="fas fa-book"></i> Matières enseignées</span>
                        <div class="action-buttons">
                            <button class="btn btn-success btn-sm" onclick="openAddMatiereModal()"><i class="fas fa-plus"></i> Ajouter une matière</button>
                            <button class="btn btn-primary btn-sm" onclick="exportMatieres()"><i class="fas fa-download"></i> Exporter</button>
                        </div>
                    </div>
                    <div class="dash-card-body">
                        <div class="absence-stats" style="grid-template-columns: repeat(auto-fit, minmax(150px,1fr)); margin-bottom:20px;">
                            <div class="absence-card"><div class="stat-icon"><i class="fas fa-book" style="color:var(--terra);"></i></div><div class="stat-value">${matieresData.length}</div><div class="stat-label">Total matières</div></div>
                            <div class="absence-card"><div class="stat-icon"><i class="fas fa-chalkboard-teacher" style="color:var(--primary);"></i></div><div class="stat-value">${[...new Set(matieresData.map(m => m.enseignant))].length}</div><div class="stat-label">Enseignants</div></div>
                            <div class="absence-card"><div class="stat-icon"><i class="fas fa-star" style="color:var(--warning);"></i></div><div class="stat-value">${Math.max(...matieresData.map(m => m.coefficient))}</div><div class="stat-label">Coeff. max</div></div>
                        </div>
                        <div style="overflow-x:auto;">
                            <table class="dash-table">
                                <thead><tr><th>Matière</th><th>Enseignant</th><th>Coefficient</th><th>Heures/sem.</th><th>Niveau</th><th>Actions</th></tr></thead>
                                <tbody>
                                    ${matieresData.map(m => `
                                        <tr>
                                            <td><strong><i class="fas fa-book-open" style="color:var(--terra); margin-right:6px;"></i>${m.nom}</strong></td>
                                            <td>${m.enseignant}</td>
                                            <td><span class="badge badge-success">Coeff. ${m.coefficient}</span></td>
                                            <td>${m.heures || 3}h</td>
                                            <td>${m.niveau || 'Tous niveaux'}</td>
                                            <td class="action-buttons">
                                                <button class="btn-small btn-primary" onclick="editMatiereItem('${m.nom}')"><i class="fas fa-edit"></i></button>
                                                <button class="btn-small btn-danger" onclick="deleteMatiereItem('${m.nom}')"><i class="fas fa-trash"></i></button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                    ${matieresData.length === 0 ? '<tr><td colspan="6" class="text-center p-3">Aucune matière enregistrée.</td></tr>' : ''}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
}

function renderUtilisateurPage() {
    return `
                <div class="dash-card">
                    <div class="dash-card-head">
                        <span class="dash-card-title"><i class="fas fa-users-cog"></i> Gestion des utilisateurs</span>
                        <div class="action-buttons">
                            <button class="btn btn-success btn-sm" onclick="openAddUserModal()"><i class="fas fa-plus"></i> Ajouter un utilisateur</button>
                            <button class="btn btn-primary btn-sm" onclick="exportUsers()"><i class="fas fa-download"></i> Exporter</button>
                        </div>
                    </div>
                    <div class="dash-card-body">
                        <div class="absence-stats" style="grid-template-columns: repeat(auto-fit, minmax(150px,1fr)); margin-bottom:20px;">
                            <div class="absence-card"><div class="stat-icon"><i class="fas fa-users" style="color:var(--primary);"></i></div><div class="stat-value">${usersData.length}</div><div class="stat-label">Total utilisateurs</div></div>
                            <div class="absence-card"><div class="stat-icon"><i class="fas fa-user-check" style="color:var(--success);"></i></div><div class="stat-value">${usersData.filter(u => u.statut === 'Actif').length}</div><div class="stat-label">Actifs</div></div>
                            <div class="absence-card"><div class="stat-icon"><i class="fas fa-user-lock" style="color:var(--danger);"></i></div><div class="stat-value">${usersData.filter(u => u.statut !== 'Actif').length}</div><div class="stat-label">Inactifs</div></div>
                        </div>
                        <div style="overflow-x:auto;">
                            <table class="dash-table">
                                <thead><tr><th>Nom</th><th>Email</th><th>Rôle</th><th>Téléphone</th><th>Dernière connexion</th><th>Statut</th><th>Actions</th></tr></thead>
                                <tbody>
                                    ${usersData.map(u => `
                                        <tr>
                                            <td><div style="display:flex;align-items:center;gap:10px;"><div class="avatar-eleve" style="width:32px;height:32px;font-size:13px;">${u.nom.charAt(0)}</div><strong>${u.nom}</strong></div></td>
                                            <td>${u.email}</td>
                                            <td><span class="badge ${u.role === 'Administrateur' ? 'badge-danger' : u.role === 'Professeur' ? 'badge-success' : 'badge-warning'}">${u.role}</span></td>
                                            <td>${u.telephone || '—'}</td>
                                            <td>${u.derniereConnexion || '—'}</td>
                                            <td><span class="badge ${u.statut === 'Actif' ? 'badge-success' : 'badge-warning'}">${u.statut}</span></td>
                                            <td class="action-buttons">
                                                <button class="btn-small btn-primary" onclick="editUserItem('${u.email}')"><i class="fas fa-edit"></i></button>
                                                <button class="btn-small btn-danger" onclick="deleteUserItem('${u.email}')"><i class="fas fa-trash"></i></button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                    ${usersData.length === 0 ? '<tr><td colspan="7" class="text-center p-3">Aucun utilisateur enregistré.</td></tr>' : ''}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
}

function loadPage(page) {
    const titles = { 'eleves': 'Liste des élèves', 'absences': 'Retards & Absences', 'frais': 'Frais scolaires', 'bulletins': 'Bulletins de notes', 'classes': 'Gestion des classes', 'matieres': 'Gestion des matières', 'utilisateur': 'Gestion des utilisateurs' };
    document.getElementById('dynPageTitle').textContent = titles[page] || 'Page';
    document.getElementById('dynBreadcrumb').textContent = titles[page] || 'Page';
    document.querySelectorAll('.sidebar .nav-link').forEach(link => { link.classList.remove('active'); });
    if (event && event.target) { const clickedLink = event.target.closest('.nav-link'); if (clickedLink) clickedLink.classList.add('active'); }
    showSpinner();
    setTimeout(() => {
        let content = '';
        switch (page) {
            case 'eleves': content = renderElevesPage(); break;
            case 'absences': content = renderAbsencesPage(); break;
            case 'frais': content = renderFraisPage(); break;
            case 'bulletins': content = renderBulletinsPage(); break;
            case 'classes': content = renderClassesPage(); break;
            case 'matieres': content = renderMatieresPage(); break;
            case 'utilisateur': content = renderUtilisateurPage(); break;
            default: content = '<div class="dash-card"><div class="dash-card-body text-center"><p>Page en construction</p></div></div>';
        }
        document.getElementById('pageContent').innerHTML = content;
        if (page === 'eleves') { loadElevesPage(); }
        if (page === 'frais') { updateFraisStats(); populateStudentSelect(); filterFraisTable(); }
        hideSpinner();
    }, 300);
}

// ════════════════════════════════════════════════════════════════
// FONCTIONS UTILITAIRES
// ════════════════════════════════════════════════════════════════
function openBulletinModal(nom) {
    currentBulletinStudent = nom;
    const b = bulletins[nom] || { mathematiques: 0, francais: 0, anglais: 0, physique: 0, svt: 0, moyenne: 0 };
    document.getElementById('bulletinModalBody').innerHTML = `<form id="bulletinForm"><div class="row"><div class="col-md-6"><div class="form-group"><label>Mathématiques</label><input type="number" class="form-control" id="maths" value="${b.mathematiques}" step="0.5" min="0" max="20"></div></div><div class="col-md-6"><div class="form-group"><label>Français</label><input type="number" class="form-control" id="francais" value="${b.francais}" step="0.5" min="0" max="20"></div></div><div class="col-md-6"><div class="form-group"><label>Anglais</label><input type="number" class="form-control" id="anglais" value="${b.anglais}" step="0.5" min="0" max="20"></div></div><div class="col-md-6"><div class="form-group"><label>Physique-Chimie</label><input type="number" class="form-control" id="physique" value="${b.physique}" step="0.5" min="0" max="20"></div></div><div class="col-md-6"><div class="form-group"><label>SVT</label><input type="number" class="form-control" id="svt" value="${b.svt}" step="0.5" min="0" max="20"></div></div></div></form><div class="alert alert-info" style="padding:10px; background:#e7f3ff; border-radius:4px;">Moyenne calculée automatiquement</div>`;
    document.getElementById('bulletinModal').classList.add('show');
}

function saveBulletin() {
    const maths = parseFloat(document.getElementById('maths').value) || 0;
    const francais = parseFloat(document.getElementById('francais').value) || 0;
    const anglais = parseFloat(document.getElementById('anglais').value) || 0;
    const physique = parseFloat(document.getElementById('physique').value) || 0;
    const svt = parseFloat(document.getElementById('svt').value) || 0;
    const moyenne = ((maths + francais + anglais + physique + svt) / 5).toFixed(1);
    bulletins[currentBulletinStudent] = { mathematiques: maths, francais: francais, anglais: anglais, physique: physique, svt: svt, moyenne: parseFloat(moyenne) };
    closeModal();
    loadPage('bulletins');
    alert(`Bulletin de ${currentBulletinStudent} enregistré avec succès !`);
}

function closeModal() { document.getElementById('bulletinModal').classList.remove('show'); currentBulletinStudent = null; }
function importExcel(input) { if (input.files.length) { alert(`Fichier "${input.files[0].name}" importé avec succès!\nLes bulletins ont été mis à jour.`); input.value = ''; loadPage('bulletins'); } }
function exportBulletins() {
    let csv = "Matricule,Élève,Classe,Matière,Enseignant,Note,Coefficient,Période,Commentaire\n";
    bulletinsData.forEach(b => {
        const student = elevesData.find(e => e.matricule === b.eleveMatricule);
        csv += `"${b.eleveMatricule}","${b.eleveNom}","${student?.classe || '-'}","${b.matiere}","${b.enseignant}",${b.note},${b.coefficient},"${b.periode}","${b.commentaire || ''}"\n`;
    });
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'bulletins_complets.csv';
    link.click();
    URL.revokeObjectURL(link.href);
}
function showSpinner() { document.getElementById('spinnerOverlay').classList.add('show'); }
function hideSpinner() { document.getElementById('spinnerOverlay').classList.remove('show'); }
function showKPIDetail(type) { alert(`Détails KPI: ${type}`); }
function showStudentDetail(nom) { alert(`Détails de l'élève: ${nom}`); }
function selectDate(day) { alert(`Date sélectionnée: ${day} Mars 2026`); }
function handleLogout() { if (confirm('Voulez-vous vraiment vous déconnecter ?')) alert('Déconnexion réussie !'); }
function addStudent() { alert("Formulaire d'ajout d'élève (simulation)"); }
function editStudent(id) { alert(`Édition de l'élève ID: ${id}`); }
function signalAbsence() { openSignalModal(); }
function justifierAbsence(nom) { const a = absencesData.find(x => x.nom === nom); if (a) openJustifyModal(a.matricule, a.nom); }
function addClass() { openAddClasseModal(); }
function viewClass(className) { viewClasseDetail(className); }
function editClass(className) { editClasse(className); }
function addMatiere() { openAddMatiereModal(); }
function editMatiere(matiere) { editMatiereItem(matiere); }
function addUser() { openAddUserModal(); }
function editUser(nom) { const u = usersData.find(x => x.nom === nom); if (u) editUserItem(u.email); }

// ════ CLASSES CRUD ════
function openAddClasseModal(editNom = null) {
    const c = editNom ? classesData.find(x => x.nom === editNom) : null;
    document.getElementById('classeModalTitle').textContent = c ? '✏️ Modifier la classe' : '➕ Ajouter une classe';
    document.getElementById('classeEditNom').value = editNom || '';
    document.getElementById('classeNom').value = c ? c.nom : '';
    document.getElementById('classeNiveau').value = c ? c.niveau : '';
    document.getElementById('classeEffectif').value = c ? c.effectif : '';
    document.getElementById('classeTitulaire').value = c ? c.titulaire : '';
    document.getElementById('classeSalle').value = c ? c.salle : '';
    document.getElementById('classeStatut').value = c ? c.statut : 'Active';
    document.getElementById('addClasseModal').classList.add('show');
}
function closeAddClasseModal() { document.getElementById('addClasseModal').classList.remove('show'); }
function saveClasse() {
    const editNom = document.getElementById('classeEditNom').value;
    const nom = document.getElementById('classeNom').value.trim();
    const niveau = document.getElementById('classeNiveau').value.trim();
    const effectif = parseInt(document.getElementById('classeEffectif').value) || 0;
    const titulaire = document.getElementById('classeTitulaire').value.trim();
    const salle = document.getElementById('classeSalle').value.trim();
    const statut = document.getElementById('classeStatut').value;
    if (!nom || !niveau) { alert('Veuillez remplir les champs obligatoires (Nom, Niveau)'); return; }
    if (editNom) {
        const idx = classesData.findIndex(c => c.nom === editNom);
        if (idx !== -1) { classesData[idx] = { ...classesData[idx], nom, niveau, effectif, titulaire, salle, statut }; alert(`Classe "${nom}" modifiée avec succès !`); }
    } else {
        if (classesData.find(c => c.nom === nom)) { alert('Une classe avec ce nom existe déjà'); return; }
        classesData.push({ id: classesData.length + 1, nom, niveau, effectif, titulaire, salle, statut });
        alert(`Classe "${nom}" ajoutée avec succès !`);
    }
    closeAddClasseModal(); loadPage('classes');
}
function viewClasseDetail(nom) { const c = classesData.find(x => x.nom === nom); if (c) alert(`📋 Détails de la classe ${c.nom}\n\nNiveau: ${c.niveau}\nEffectif: ${c.effectif} élèves\nTitulaire: ${c.titulaire}\nSalle: ${c.salle}\nStatut: ${c.statut}`); }
function editClasse(nom) { openAddClasseModal(nom); }
function deleteClasse(nom) { if (confirm(`Supprimer la classe "${nom}" ?`)) { classesData = classesData.filter(c => c.nom !== nom); alert(`Classe "${nom}" supprimée.`); loadPage('classes'); } }
function exportClasses() { let csv = "Classe,Niveau,Effectif,Titulaire,Salle,Statut\n"; classesData.forEach(c => { csv += `"${c.nom}","${c.niveau}",${c.effectif},"${c.titulaire}","${c.salle}","${c.statut}"\n`; }); const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' }); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'classes.csv'; link.click(); }

// ════ MATIÈRES CRUD ════
function openAddMatiereModal(editNom = null) {
    const m = editNom ? matieresData.find(x => x.nom === editNom) : null;
    document.getElementById('matiereModalTitle').textContent = m ? '✏️ Modifier la matière' : '➕ Ajouter une matière';
    document.getElementById('matiereEditNom').value = editNom || '';
    document.getElementById('matiereNom').value = m ? m.nom : '';
    document.getElementById('matiereEnseignant').value = m ? m.enseignant : '';
    document.getElementById('matiereCoeff').value = m ? m.coefficient : 1;
    document.getElementById('matiereHeures').value = m ? (m.heures || 3) : 3;
    document.getElementById('matiereNiveau').value = m ? (m.niveau || '') : '';
    document.getElementById('addMatiereModal').classList.add('show');
}
function closeAddMatiereModal() { document.getElementById('addMatiereModal').classList.remove('show'); }
function saveMatiere() {
    const editNom = document.getElementById('matiereEditNom').value;
    const nom = document.getElementById('matiereNom').value.trim();
    const enseignant = document.getElementById('matiereEnseignant').value.trim();
    const coefficient = parseFloat(document.getElementById('matiereCoeff').value) || 1;
    const heures = parseInt(document.getElementById('matiereHeures').value) || 3;
    const niveau = document.getElementById('matiereNiveau').value.trim();
    if (!nom || !enseignant) { alert('Veuillez remplir les champs obligatoires (Nom, Enseignant)'); return; }
    if (editNom) {
        const idx = matieresData.findIndex(m => m.nom === editNom);
        if (idx !== -1) { matieresData[idx] = { ...matieresData[idx], nom, enseignant, coefficient, heures, niveau }; alert(`Matière "${nom}" modifiée avec succès !`); }
    } else {
        if (matieresData.find(m => m.nom === nom)) { alert('Une matière avec ce nom existe déjà'); return; }
        matieresData.push({ id: matieresData.length + 1, nom, enseignant, coefficient, heures, niveau });
        alert(`Matière "${nom}" ajoutée avec succès !`);
    }
    closeAddMatiereModal(); loadPage('matieres');
}
function editMatiereItem(nom) { openAddMatiereModal(nom); }
function deleteMatiereItem(nom) { if (confirm(`Supprimer la matière "${nom}" ?`)) { const idx = matieresData.findIndex(m => m.nom === nom); if (idx !== -1) { matieresData.splice(idx, 1); alert(`Matière "${nom}" supprimée.`); loadPage('matieres'); } } }
function exportMatieres() { let csv = "Matière,Enseignant,Coefficient,Heures/sem,Niveau\n"; matieresData.forEach(m => { csv += `"${m.nom}","${m.enseignant}",${m.coefficient},${m.heures || 3},"${m.niveau || ''}"\n`; }); const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' }); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'matieres.csv'; link.click(); }

// ════ UTILISATEURS CRUD ════
function openAddUserModal(editEmail = null) {
    const u = editEmail ? usersData.find(x => x.email === editEmail) : null;
    document.getElementById('userModalTitle').textContent = u ? '✏️ Modifier l\'utilisateur' : '➕ Ajouter un utilisateur';
    document.getElementById('userEditEmail').value = editEmail || '';
    document.getElementById('userName').value = u ? u.nom : '';
    document.getElementById('userEmail').value = u ? u.email : '';
    document.getElementById('userRole').value = u ? u.role : 'Professeur';
    document.getElementById('userTelephone').value = u ? (u.telephone || '') : '';
    document.getElementById('userStatut').value = u ? u.statut : 'Actif';
    document.getElementById('userPassword').value = '';
    document.getElementById('addUserModal').classList.add('show');
}
function closeAddUserModal() { document.getElementById('addUserModal').classList.remove('show'); }
function saveUser() {
    const editEmail = document.getElementById('userEditEmail').value;
    const nom = document.getElementById('userName').value.trim();
    const email = document.getElementById('userEmail').value.trim();
    const role = document.getElementById('userRole').value;
    const telephone = document.getElementById('userTelephone').value.trim();
    const statut = document.getElementById('userStatut').value;
    if (!nom || !email) { alert('Veuillez remplir les champs obligatoires (Nom, Email)'); return; }
    if (editEmail) {
        const idx = usersData.findIndex(u => u.email === editEmail);
        if (idx !== -1) { usersData[idx] = { ...usersData[idx], nom, email, role, telephone, statut }; alert(`Utilisateur "${nom}" modifié avec succès !`); }
    } else {
        if (usersData.find(u => u.email === email)) { alert('Un utilisateur avec cet email existe déjà'); return; }
        usersData.push({ id: usersData.length + 1, nom, email, role, telephone, statut, derniereConnexion: '—' });
        alert(`Utilisateur "${nom}" ajouté avec succès !`);
    }
    closeAddUserModal(); loadPage('utilisateur');
}
function editUserItem(email) { openAddUserModal(email); }
function deleteUserItem(email) { const u = usersData.find(x => x.email === email); if (u && confirm(`Supprimer l'utilisateur "${u.nom}" ?`)) { usersData = usersData.filter(x => x.email !== email); alert(`Utilisateur supprimé.`); loadPage('utilisateur'); } }
function exportUsers() { let csv = "Nom,Email,Rôle,Téléphone,Statut\n"; usersData.forEach(u => { csv += `"${u.nom}","${u.email}","${u.role}","${u.telephone || ''}","${u.statut}"\n`; }); const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' }); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'utilisateurs.csv'; link.click(); }