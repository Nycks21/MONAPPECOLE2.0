<%@ Page Language="C#" AutoEventWireup="true" CodeFile="index.cs" Inherits="index" %>
    <!DOCTYPE html>
    <html lang="fr">

    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Tableau de bord — Gestion Scolaire</title>

        <!-- Font Awesome -->
        <link rel="stylesheet" href="../../_assets/css/all.min.css?v=<%=AuthHelper.Version %>">
        <link rel="stylesheet" href="../../_assets/css/fontawesome.css?v=<%=AuthHelper.Version %>">
        <link rel="stylesheet" href="../../_assets/css/fontawesome.min.css?v=<%=AuthHelper.Version %>">
        <link rel="stylesheet" href="css/dashboard.css?v=<%=AuthHelper.Version %>">
        <link rel="stylesheet" href="../../_assets/css/global.css?v=<%=AuthHelper.Version %>">

    </head>

    <body class="hold-transition" data-version="<%=AuthHelper.Version %>">
        <form id="form1" runat="server">
            <div class="wrapper">

                <!-- ═══ PRELOADER ═══ 
                <div class="preloader" id="preloader">
                    <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Crect width='60' height='60' rx='10' fill='%23007bff'/%3E%3Ctext x='30' y='40' font-size='32' font-weight='bold' text-anchor='middle' fill='white'%3EGS%3C/text%3E%3C/svg%3E"
                        alt="Logo">
                </div> -->

                <!-- ═══ TOPBAR ═══ -->
                <nav class="main-header">
                    <ul class="navbar-nav">
                        <li class="nav-item">
                            <a class="nav-link" id="menuToggle" role="button">
                                <i class="fas fa-bars"></i>
                            </a>
                        </li>
                    </ul>
                    <ul class="navbar-nav">
                        <!-- Notifications -->
                        <li class="nav-item">
                            <a class="nav-link" id="notifToggle" title="Notifications">
                                <i class="fas fa-bell"></i>
                                <span class="badge-notif" id="badgeNotif">3</span>
                            </a>
                            <div class="dropdown-menu" id="notifDropdown">
                                <span class="dropdown-header">3 notifications</span>
                                <div class="dropdown-divider"></div>
                                <a href="#" class="dropdown-item">
                                    <i class="fas fa-user-plus text-success mr-2"></i> Nouvel élève inscrit
                                    <span style="float: right; color: #6c757d; font-size: 11px;">Il y a 23 min</span>
                                </a>
                                <a href="#" class="dropdown-item">
                                    <i class="fas fa-exclamation-circle text-danger mr-2"></i> Absence signalée
                                    <span style="float: right; color: #6c757d; font-size: 11px;">Il y a 1h</span>
                                </a>
                                <a href="#" class="dropdown-item">
                                    <i class="fas fa-money-bill text-warning mr-2"></i> Paiement reçu
                                    <span style="float: right; color: #6c757d; font-size: 11px;">Il y a 2h</span>
                                </a>
                            </div>
                        </li>
                        <li class="nav-item">
                            <a href="../../../auth/Logout.aspx" class="nav-link" title="Se déconnecter">
                                <i class="fas fa-sign-out-alt"></i>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" id="fullscreenToggle" title="Plein écran">
                                <i class="fas fa-expand-arrows-alt"></i>
                            </a>
                        </li>
                    </ul>
                </nav>

                <!-- ═══ SIDEBAR ═══ -->
                <aside class="main-sidebar" id="sidebar">
                    <a href="#" class="brand-link" onclick="loadDashboard()">
                        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='33' height='33' viewBox='0 0 33 33'%3E%3Ccircle cx='16.5' cy='16.5' r='16.5' fill='%23007bff'/%3E%3Ctext x='16.5' y='22' font-size='16' font-weight='bold' text-anchor='middle' fill='white'%3EGS%3C/text%3E%3C/svg%3E"
                            alt="Logo" class="brand-image">
                        <span class="brand-text">Gestion Scolaire</span>
                    </a>

                    <div class="sidebar">
                        <!-- Utilisateur -->
                        <div class="user-profile-nav">
                            <div class="user-avatar">
                                <i class="fas fa-user-tie"></i>
                                <span class="status-indicator"></span>
                            </div>
                            <div class="user-info">
                                <span id="profilUsername" class="user-role">Profile :</span>
                                <span id="navbarUsername" class="user-name">Admin Système</span>
                            </div>
                        </div>

                        <!-- Navigation -->
                        <nav>
                            <ul class="nav-pills">
                                <!-- Accueil -->
                                <li class="nav-item">
                                    <div class="nav-section">Accueil</div>
                                    <a href="index.aspx" class="nav-link active">
                                        <div style="width:30px; text-align:center; margin-right:10px;">
                                            <i class="fas fa-chalkboard"></i>
                                        </div>
                                        <span>Dashboard</span>
                                    </a>
                                </li>

                                <!-- Modules -->
                                <% if (AuthHelper.IsAdmin() || AuthHelper.IsSuperAdmin() || AuthHelper.IsSecretaire() || AuthHelper.IsProfessor()) { %>
                                <div class="nav-section">Modules</div>
                                <% } %>

                                <% if (AuthHelper.IsAdmin() || AuthHelper.IsSuperAdmin() || AuthHelper.IsSecretaire()) { %>
                                <li class="nav-item">
                                    <a href="../../modules/eleves/eleves.aspx" class="nav-link">
                                        <div style="width:30px; text-align:center; margin-right:10px;">
                                            <i class="fas fa-users"></i>
                                        </div>
                                        <span>Liste des élèves</span>
                                    </a>
                                </li>
                                <li class="nav-item">
                                    <a href="../../modules/absences/absences.aspx" class="nav-link">
                                        <div style="width:30px; text-align:center; margin-right:10px;">
                                            <i class="fas fa-calendar-times"></i>
                                        </div>
                                        <span>Retards & Absences</span>
                                    </a>
                                </li>
                                <% } %>

                                <% if (AuthHelper.IsAdmin() || AuthHelper.IsSuperAdmin() || AuthHelper.IsProfessor()) { %>
                                <li class="nav-item">
                                    <a href="../../modules/bulletins/bulletins.aspx" class="nav-link">
                                        <div style="width:30px; text-align:center; margin-right:10px;">
                                            <i class="fas fa-file-alt"></i>
                                        </div>
                                        <span>Bulletins</span>
                                    </a>
                                </li>
                                <% } %>

                                <% if (AuthHelper.IsAdmin() || AuthHelper.IsSuperAdmin() || AuthHelper.IsComptable()) { %>
                                <div class="nav-section">Ecolage</div>
                                <li class="nav-item">
                                    <a href="../../modules/frais/frais.aspx" class="nav-link">
                                        <div style="width:30px; text-align:center; margin-right:10px;">
                                            <i class="fas fa-money-bill-wave"></i>
                                        </div>
                                        <span>Frais scolaires</span>
                                    </a>
                                </li>
                                <% } %>
                                
                                <!-- Paramètres -->
                                <% if (AuthHelper.IsAdmin() || AuthHelper.IsSuperAdmin() || AuthHelper.IsProfessor()) { %>
                                <div class="nav-section">Paramètres</div>
                                <% } %>

                                <% if (AuthHelper.IsAdmin() || AuthHelper.IsSuperAdmin() || AuthHelper.IsProfessor()) { %>
                                <li class="nav-item">
                                    <a href="../../parametres/niveaux/niveaux.aspx" class="nav-link">
                                        <div style="width:30px; text-align:center; margin-right:10px;">
                                            <i class="fas fa-layer-group"></i>
                                        </div>
                                        <span>Niveau</span>
                                    </a>
                                </li>
                                <li class="nav-item">
                                    <a href="../../parametres/salles/salles.aspx" class="nav-link">
                                        <div style="width:30px; text-align:center; margin-right:10px;">
                                            <i class="fas fa-door-open"></i>
                                        </div>
                                        <span>Salle</span>
                                    </a>
                                </li>
                                <li class="nav-item">
                                    <a href="../../parametres/classes/classes.aspx" class="nav-link">
                                        <div style="width:30px; text-align:center; margin-right:10px;">
                                            <i class="fas fa-folder"></i>
                                        </div>
                                        <span>Classes</span>
                                    </a>
                                </li>
                                <li class="nav-item">
                                    <a href="../../parametres/matieres/matieres.aspx" class="nav-link">
                                        <div style="width:30px; text-align:center; margin-right:10px;">
                                            <i class="fas fa-book"></i>
                                        </div>
                                        <span>Matières</span>
                                    </a>
                                </li>
                                <% } %>

                                <!-- Administration -->
                                
                                
                                <% if (AuthHelper.IsAdmin() || AuthHelper.IsSuperAdmin()) { %>
                                    <div class="nav-section">utilitaires</div>
                                <% } %>

                                <% if (AuthHelper.IsAdmin() || AuthHelper.IsSuperAdmin()) { %>
                                    <li class="nav-item">
                                        <a href="../../administrations/utilitaires/utilitaires.aspx" class="nav-link">
                                            <div style="width:30px; text-align:center; margin-right:10px;">
                                                <i class="fas fa-cogs"></i>
                                            </div>
                                            <span>Importation élèves</span>
                                        </a>
                                    </li>
                                <% } %>

                                <% if (AuthHelper.IsAdmin() || AuthHelper.IsSuperAdmin()) { %>
                                    <div class="nav-section">Administrations</div>
                                <% } %>
                                
                                <% if (AuthHelper.IsAdmin() || AuthHelper.IsSuperAdmin()) { %>
                                    <li class="nav-item">
                                        <a href="../../administrations/annee/annee.aspx" class="nav-link">
                                            <div style="width:30px; text-align:center; margin-right:10px;">
                                                <i class="fas fa-calendar-alt"></i>
                                            </div>
                                            <span>Années</span>
                                        </a>
                                    </li>        
                                                
                                    <li class="nav-item">
                                        <a href="../../administrations/utilisateur/utilisateur.aspx"
                                            class="nav-link">
                                            <div
                                                style="width:30px; text-align:center; margin-right:10px;">
                                                    <i class="fas fa-user"></i>
                                            </div>
                                                <span>Utilisateur</span>
                                        </a>
                                    </li>
                                <% } %>

                                <% if (AuthHelper.IsSuperAdmin()) { %>
                                    <li class="nav-item">
                                        <a href="../../administrations/requete/requetes.aspx" class="nav-link" style="display: flex; align-items: center;">
                                            <div style="width:30px; text-align:center; margin-right:10px;">
                                                <i class="fas fa-database"></i>
                                            </div>
                                            <span>Requetes SQL</span>
                                        </a>
                                    </li>
                                <% } %>
                            </ul>
                        </nav>
                    </div>
                </aside>

                <!-- ═══ CONTENT WRAPPER ═══ -->
                <div class="content-wrapper" id="contentWrapper">

                    <!-- En-tête dynamique -->
                    <div class="content-header">
                        <div class="container-fluid">
                            <div class="row">
                                <div class="col-lg-6">
                                    <h1 id="dynPageTitle">Tableau de bord</h1>
                                </div>
                                <div class="col-lg-6">
                                    <ol class="breadcrumb" style="float: right;">
                                        <li class="breadcrumb-item">Acceuil</li>
                                        <li class="breadcrumb-item active" id="dynBreadcrumb">Tableau de bord</li>
                                    </ol>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- ═══ ZONE DE CONTENU DYNAMIQUE ═══ -->
                    <section class="content">
                        <div class="container-fluid">

                            <!-- KPI Row -->
                            <div class="kpi-row">
                                <div class="kpi-card" onclick="showKPIDetail('eleves')">
                                    <div class="kpi-accent" style="background:var(--primary)"></div>
                                    <div class="kpi-label">Total élèves</div>
                                    <div class="kpi-val" id="valEleves">—</div>
                                    <div class="kpi-sub"><span class="pill pill-up"
                                            id="pillEleves">+0</span><span>depuis la
                                            rentrée</span></div>
                                </div>
                                <div class="kpi-card" onclick="showKPIDetail('classes')">
                                    <div class="kpi-accent" style="background:var(--success)"></div>
                                    <div class="kpi-label">Classes actives</div>
                                    <div class="kpi-val" id="valClasses">—</div>
                                    <div class="kpi-sub"><span class="pill pill-neu" id="pillClasses">Moy. —
                                            élèves</span>
                                    </div>
                                </div>
                                <div class="kpi-card" onclick="showKPIDetail('presence')">
                                    <div class="kpi-accent" style="background:var(--warning)"></div>
                                    <div class="kpi-label">Taux de présence</div>
                                    <div class="kpi-val"><span id="valPresence">—</span><span class="kpi-unit">%</span>
                                    </div>
                                    <div class="kpi-sub"><span class="pill pill-up" id="pillPresence">+0%</span><span
                                            id="lblMoisPresence">ce mois</span></div>
                                </div>
                                <% if (AuthHelper.IsAdmin() || AuthHelper.IsSuperAdmin() || AuthHelper.IsComptable()) { %>
                                    <div class="kpi-card" onclick="showKPIDetail('impayes')">
                                        <div class="kpi-accent" style="background:var(--danger)"></div>
                                        <div class="kpi-label">Frais impayés</div>
                                        <div class="kpi-val" id="valImpayes">—</div>
                                        <div class="kpi-sub"><span class="pill pill-dn"
                                                id="pillImpayes">0</span><span>vs
                                                mois
                                                dernier</span></div>
                                    </div>
                                    <% } %>
                            </div>

                            <!-- Présences + Répartition -->
                            <div class="row mt-1">
                                <div class="col-lg-10">
                                    <div class="dash-card">
                                        <div class="dash-card-head">
                                            <span class="dash-card-title"><span class="dot-terra"></span>Présences — 7
                                                derniers jours</span>
                                            <span class="dash-card-meta" id="lblMoisPresence2"></span>
                                        </div>
                                        <div class="dash-card-body1">
                                            <div class="chart-legend mb-2">
                                                <span class="leg-item"><span class="leg-sq"
                                                        style="background:var(--forest)"></span>Présents</span>
                                                <span class="leg-item"><span class="leg-sq"
                                                        style="background:var(--terra)"></span>Absents</span>
                                            </div>
                                            <div style="position:relative;height:200px;"><canvas
                                                    id="chartPresence"></canvas></div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-lg-2">
                                    <div class="dash-card">
                                        <div class="dash-card-head"><span class="dash-card-title"><span
                                                    class="dot-terra"></span>Répartition par niveau</span></div>
                                        <div class="dash-card-body1">
                                            <div
                                                style="overflow-y: auto; max-height: 250px; display: flex; justify-content: center; width: 100%;">
                                                <div class="donut-wrap"
                                                    style="display: flex; flex-direction: column; align-items: center; justify-content: center;">

                                                    <canvas id="chartDonut"
                                                        style="display: block; margin: 0 auto;"></canvas>

                                                    <div class="donut-legend" id="donutLegend"
                                                        style="margin-top: 15px; text-align: center;"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Réussite + Frais + Indicateurs -->
                            <div class="row mt-4">
                                <div class="col-lg-4">
                                    <div class="dash-card">
                                        <div class="dash-card-head"><span class="dash-card-title"><span
                                                    class="dot-terra"></span>Taux de réussite par classe</span></div>
                                        <div style="overflow-y: auto; max-height: 250px;">
                                            <div class="dash-card-body1" id="reussiteContainer"></div>
                                        </div>
                                    </div>
                                </div>
                                <% if (AuthHelper.IsAdmin() || AuthHelper.IsSuperAdmin()) { %>
                                    <div class="col-lg-4">
                                        <div class="dash-card">
                                            <div class="dash-card-head"><span class="dash-card-title"><span
                                                        class="dot-terra"></span>Frais scolaires mensuels</span></div>
                                            <div class="dash-card-body1">
                                                <div class="chart-legend mb-2">
                                                    <span class="leg-item"><span class="leg-sq"
                                                            style="background:var(--forest-light)"></span>Payé</span>
                                                    <span class="leg-item"><span class="leg-sq"
                                                            style="background:#f0d4c8"></span>Impayé</span>
                                                </div>
                                                <div style="position:relative;height:180px;"><canvas
                                                        id="chartFrais"></canvas>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <% } %>
                                        <div class="col-lg-4">
                                            <div class="dash-card">
                                                <div class="dash-card-head"><span class="dash-card-title"><span
                                                            class="dot-terra"></span>Indicateurs clés</span></div>
                                                <div class="dash-card-body1">
                                                    <div class="gauge-row" id="gaugeContainer"></div>
                                                    <div class="divider-line mt-3 mb-3"></div>
                                                    <div class="prog-item">
                                                        <div class="prog-head"><span
                                                                class="prog-name">Garçons</span><span class="prog-pct"
                                                                id="pctGarcons">—%</span></div>
                                                        <div class="prog-track">
                                                            <div class="prog-fill" id="fillGarcons"
                                                                style="background: rgb(56, 150, 238)"></div>
                                                        </div>
                                                    </div>
                                                    <div class="prog-item">
                                                        <div class="prog-head"><span
                                                                class="prog-name">Filles</span><span class="prog-pct"
                                                                id="pctFilles">—%</span></div>
                                                        <div class="prog-track">
                                                            <div class="prog-fill" id="fillFilles"
                                                                style="background: rgb(253, 127, 148)">
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                            </div>

                            <!-- Retards & Absences + Activité récente -->
                            <div class="row mt-1">
                                <div class="col-lg-6">
                                    <div class="dash-card">
                                        <div class="dash-card-head">
                                            <span class="dash-card-title"><span class="dot-terra"></span>Élèves —
                                                absences
                                                fréquentes</span>
                                            <span class="dash-card-meta">Ce mois</span>
                                        </div>
                                        <div style="overflow-y: auto; max-height: 250px; border: 1px solid #dee2e6;">
                                            <table class="dash-table"
                                                style="table-layout: fixed; max-width: 200px; min-width: 100%; border-collapse: collapse;">
                                                <thead>
                                                    <tr
                                                        style="background-color: #f8f9fa; text-align: center; position: sticky; top: 0; z-index: 10;">
                                                        <th>Élève</th>
                                                        <th>Classe</th>
                                                        <th>Retards & Absences</th>
                                                        <th>Statut</th>
                                                    </tr>
                                                </thead>
                                                <tbody id="tbodyAbsences"></tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                                <div class="col-lg-6">
                                    <div class="dash-card">
                                        <div class="dash-card-head"><span class="dash-card-title"><span
                                                    class="dot-terra"></span>Activité récente</span></div>
                                        <div style="overflow-y: auto; max-height: 250px;">
                                            <div class="dash-card-body1" id="activityFeed"></div>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            <!-- Agenda scolaire (calendrier compact) -->
                            <div class="row mt-1">
                                <div class="col-12">
                                    <div class="dash-card">
                                        <div class="dash-card-head">
                                            <span class="dash-card-title"><span class="dot-terra"></span>Agenda
                                                scolaire</span>
                                            <div class="cal-legend">
                                                <span class="leg-item"><span class="leg-sq"
                                                        style="background:var(--forest)"></span>Aujourd'hui</span>
                                                <span class="leg-item"><span class="leg-sq"
                                                        style="background:var(--terra)"></span>Événement</span>
                                            </div>
                                        </div>
                                        <div class="dash-card-body1"
                                            style="display:flex;gap:30px;align-items:flex-start;flex-wrap:wrap;">
                                            <div style="flex:0 0 260px;max-width:260px;">
                                                <div id="calendarGrid" class="mini-cal" style="gap:4px;"></div>
                                            </div>
                                            <div style="flex:1;min-width:200px;">
                                                <div class="event-list" id="eventList"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </section>

                </div>

                <!-- ═══ SPINNER ═══ -->
                <div id="spinnerOverlay">
                    <div class="spinner"></div>
                </div>
            </div>
            <!-- ═══ SCRIPTS ═══ -->
            <script>
                document.addEventListener('DOMContentLoaded', function () {
                    loadDashboard();
                });
            </script>
            <script src="../../_assets/js/chart.umd.min.js?v=<%=AuthHelper.Version %>"></script>
            <script src="js/dashboard.js?v=<%=AuthHelper.Version %>"></script>
            <script src="../../_assets/js/global.js?v=<%=AuthHelper.Version %>"></script>
        </form>
    </body>

    </html>