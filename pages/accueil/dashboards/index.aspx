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
        <link rel="stylesheet" href="css/style.css?v=<%=AuthHelper.Version %>">
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
                                <span class="user-role">Profile :</span>
                                <span id="navbarUsername" class="user-name">Admin Système</span>
                            </div>
                        </div>

                        <!-- Navigation -->
                        <nav>
                            <ul class="nav-pills">
                                <!-- Accueil -->
                                <li class="nav-item">
                                    <div class="nav-section">Accueil</div>
                                    <a href="acceuil" class="nav-link active">
                                        <div style="width:30px; text-align:center; margin-right:10px;">
                                            <i class="fas fa-chalkboard"></i>
                                        </div>
                                        <span>Dashboard</span>
                                    </a>
                                </li>

                                <!-- Modules -->
                                <li class="nav-item">
                                    <div class="nav-section">Modules</div>
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
                                <li class="nav-item">
                                    <a href="../../modules/frais/frais.aspx" class="nav-link">
                                        <div style="width:30px; text-align:center; margin-right:10px;">
                                            <i class="fas fa-money-bill-wave"></i>
                                        </div>
                                        <span>Frais scolaires</span>
                                    </a>
                                </li>
                                <li class="nav-item">
                                    <a href="../../modules/bulletins/bulletins.aspx" class="nav-link">
                                        <div style="width:30px; text-align:center; margin-right:10px;">
                                            <i class="fas fa-file-alt"></i>
                                        </div>
                                        <span>Bulletins</span>
                                    </a>
                                </li>

                                <!-- Paramètres -->
                                <li class="nav-item">
                                    <div class="nav-section">Paramètres</div>
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
                                
                                <!-- Administration -->
                                <% if (AuthHelper.IsAdmin() || AuthHelper.IsSuperAdmin()) { %>
                                    <li class="nav-item">
                                        <div class="nav-section">Administrations</div>
                                        <a href="../../administrations/utilitaires/utilitaires.aspx" class="nav-link">
                                            <div style="width:30px; text-align:center; margin-right:10px;">
                                                <i class="fas fa-cogs"></i>
                                            </div>
                                            <span>Utilitaires</span>
                                        </a>
                                    </li>
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
                                <% } %>

                                <% if (AuthHelper.IsAdmin() || AuthHelper.IsSuperAdmin()) { %>
                                    <li class="nav-item">
                                        <a href="../../administrations/utilisateur/utilisateur.aspx" class="nav-link">
                                            <div style="width:30px; text-align:center; margin-right:10px;">
                                                <i class="fas fa-user"></i>
                                            </div>
                                            <span>Utilisateur</span>
                                        </a>
                                    </li>
                                <% } %>

                                <% if (AuthHelper.IsSuperAdmin()) { %>
                                    <li class="nav-item">
                                        <a href="../../administrations/requete/requetes.aspx" class="nav-link"
                                            style="display: flex; align-items: center;">
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
                                        <li class="breadcrumb-item">Application</li>
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
                                <div class="kpi-card" onclick="showKPIDetail('impayes')">
                                    <div class="kpi-accent" style="background:var(--danger)"></div>
                                    <div class="kpi-label">Frais impayés</div>
                                    <div class="kpi-val" id="valImpayes">—</div>
                                    <div class="kpi-sub"><span class="pill pill-dn" id="pillImpayes">0</span><span>vs
                                            mois
                                            dernier</span></div>
                                </div>
                            </div>

                            <!-- Présences + Répartition -->
                            <div class="row mt-1">
                                <div class="col-lg-8">
                                    <div class="dash-card">
                                        <div class="dash-card-head">
                                            <span class="dash-card-title"><span class="dot-terra"></span>Présences — 7
                                                derniers jours</span>
                                            <span class="dash-card-meta" id="lblMoisPresence2"></span>
                                        </div>
                                        <div class="dash-card-body">
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
                                <div class="col-lg-4">
                                    <div class="dash-card">
                                        <div class="dash-card-head"><span class="dash-card-title"><span
                                                    class="dot-terra"></span>Répartition par niveau</span></div>
                                        <div class="dash-card-body">
                                            <div class="donut-wrap">
                                                <canvas id="chartDonut" width="130" height="130"></canvas>
                                                <div class="donut-legend" id="donutLegend"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Réussite + Frais + Indicateurs -->
                            <div class="row mt-1">
                                <div class="col-lg-4">
                                    <div class="dash-card">
                                        <div class="dash-card-head"><span class="dash-card-title"><span
                                                    class="dot-terra"></span>Taux de réussite par classe</span></div>
                                        <div class="dash-card-body" id="reussiteContainer"></div>
                                    </div>
                                </div>
                                <div class="col-lg-4">
                                    <div class="dash-card">
                                        <div class="dash-card-head"><span class="dash-card-title"><span
                                                    class="dot-terra"></span>Frais scolaires mensuels</span></div>
                                        <div class="dash-card-body">
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
                                <div class="col-lg-4">
                                    <div class="dash-card">
                                        <div class="dash-card-head"><span class="dash-card-title"><span
                                                    class="dot-terra"></span>Indicateurs clés</span></div>
                                        <div class="dash-card-body">
                                            <div class="gauge-row" id="gaugeContainer"></div>
                                            <div class="divider-line mt-3 mb-3"></div>
                                            <div class="prog-item">
                                                <div class="prog-head"><span class="prog-name">Garçons</span><span
                                                        class="prog-pct" id="pctGarcons">—%</span></div>
                                                <div class="prog-track">
                                                    <div class="prog-fill" id="fillGarcons"
                                                        style="background:var(--forest)"></div>
                                                </div>
                                            </div>
                                            <div class="prog-item">
                                                <div class="prog-head"><span class="prog-name">Filles</span><span
                                                        class="prog-pct" id="pctFilles">—%</span></div>
                                                <div class="prog-track">
                                                    <div class="prog-fill" id="fillFilles"
                                                        style="background:var(--terra)">
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Absences + Activité récente -->
                            <div class="row mt-1">
                                <div class="col-lg-6">
                                    <div class="dash-card">
                                        <div class="dash-card-head">
                                            <span class="dash-card-title"><span class="dot-terra"></span>Élèves —
                                                absences
                                                fréquentes</span>
                                            <span class="dash-card-meta">Ce mois</span>
                                        </div>
                                        <div class="dash-card-body p-0">
                                            <table class="dash-table">
                                                <thead>
                                                    <tr>
                                                        <th>Élève</th>
                                                        <th>Classe</th>
                                                        <th>Absences</th>
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
                                        <div class="dash-card-body" id="activityFeed"></div>
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
                                        <div class="dash-card-body"
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

            <!-- MODAL BULLETIN -->
            <div id="bulletinModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Éditer le bulletin</h3>
                        <button onclick="closeModal()"
                            style="background:none; border:none; font-size:24px; cursor:pointer;">&times;</button>
                    </div>
                    <div class="modal-body" id="bulletinModalBody"></div>
                    <div class="modal-footer">
                        <button class="btn btn-primary" onclick="saveBulletin()">Enregistrer</button>
                        <button class="btn btn-danger" onclick="closeModal()">Annuler</button>
                    </div>
                </div>
            </div>

            <!-- MODAL PAIEMENT FRAIS SCOLAIRES -->
            <div id="paymentModal" class="modal">
                <div class="modal-content payment-modal">
                    <div class="modal-header">
                        <h3><i class="fas fa-money-bill-wave"></i> Enregistrer un paiement</h3>
                        <button onclick="closePaymentModal()"
                            style="background:none; border:none; font-size:24px; cursor:pointer;">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="paymentForm">
                            <div class="form-group">
                                <label>Élève</label>
                                <select id="paymentStudent" class="form-control" required
                                    onchange="updatePaymentInfo()">
                                    <option value="">Sélectionner un élève</option>
                                </select>
                            </div>
                            <div id="paymentInfo" class="payment-detail" style="display: none;">
                                <p><strong>Informations du compte :</strong></p>
                                <p>Montant total: <span id="infoTotal">0</span> Ar</p>
                                <p>Déjà payé: <span id="infoPaye">0</span> Ar</p>
                                <p>Reste à payer: <span id="infoReste" style="font-weight: bold;">0</span> Ar</p>
                            </div>
                            <div class="form-group">
                                <label>Montant du paiement (Ar)</label>
                                <input type="number" id="paymentAmount" class="form-control"
                                    placeholder="Saisir le montant" step="1000" min="0" required>
                            </div>
                            <div class="form-group">
                                <label>Date du paiement</label>
                                <input type="date" id="paymentDate" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label>Mode de paiement</label>
                                <select id="paymentMethod" class="form-control">
                                    <option value="Espèces">Espèces</option>
                                    <option value="Chèque">Chèque</option>
                                    <option value="Virement bancaire">Virement bancaire</option>
                                    <option value="Mobile Money">Mobile Money</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Référence / Numéro de reçu</label>
                                <input type="text" id="paymentRef" class="form-control" placeholder="Optionnel">
                            </div>
                            <div class="form-group">
                                <label>Commentaire</label>
                                <textarea id="paymentComment" class="form-control" rows="2"
                                    placeholder="Commentaire..."></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-primary" onclick="savePayment()">
                            <i class="fas fa-save"></i> Enregistrer
                        </button>
                        <button class="btn btn-danger" onclick="closePaymentModal()">
                            <i class="fas fa-times"></i> Annuler
                        </button>
                    </div>
                </div>
            </div>

            <!-- MODAL AJOUT / MODIFICATION ÉLÈVE -->
            <div id="eleveModal" class="modal">
                <div class="modal-content modal-eleve">
                    <div class="modal-header">
                        <h3 id="eleveModalTitle"><i class="fas fa-user-plus"></i> Ajouter un élève</h3>
                        <button onclick="closeEleveModal()"
                            style="background:none; border:none; font-size:24px; cursor:pointer;">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="eleveForm">
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Matricule *</label>
                                    <input type="text" id="eleveMatricule" class="form-control"
                                        placeholder="Ex: 2024001" required>
                                </div>
                                <div class="form-group">
                                    <label>Nom complet *</label>
                                    <input type="text" id="eleveNom" class="form-control" placeholder="Nom et prénom"
                                        required>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Classe *</label>
                                    <select id="eleveClasse" class="form-control" required>
                                        <option value="">Sélectionner une classe</option>
                                        <option value="6ème A">6ème A</option>
                                        <option value="6ème B">6ème B</option>
                                        <option value="5ème A">5ème A</option>
                                        <option value="5ème B">5ème B</option>
                                        <option value="4ème A">4ème A</option>
                                        <option value="4ème B">4ème B</option>
                                        <option value="3ème A">3ème A</option>
                                        <option value="3ème B">3ème B</option>
                                        <option value="2nde A">2nde A</option>
                                        <option value="2nde B">2nde B</option>
                                        <option value="1ère A">1ère A</option>
                                        <option value="1ère B">1ère B</option>
                                        <option value="Tle C">Tle C</option>
                                        <option value="Tle D">Tle D</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Statut</label>
                                    <select id="eleveStatut" class="form-control">
                                        <option value="actif">Actif</option>
                                        <option value="inactif">Inactif</option>
                                        <option value="suspendu">Suspendu</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Email</label>
                                    <input type="email" id="eleveEmail" class="form-control"
                                        placeholder="email@exemple.com">
                                </div>
                                <div class="form-group">
                                    <label>Téléphone</label>
                                    <input type="tel" id="eleveTelephone" class="form-control"
                                        placeholder="032 12 345 67">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Date de naissance</label>
                                    <input type="date" id="eleveDateNaiss" class="form-control">
                                </div>
                                <div class="form-group">
                                    <label>Genre</label>
                                    <select id="eleveGenre" class="form-control">
                                        <option value="M">Masculin</option>
                                        <option value="F">Féminin</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Adresse</label>
                                <textarea id="eleveAdresse" class="form-control" rows="2"
                                    placeholder="Adresse complète"></textarea>
                            </div>
                            <div class="form-group">
                                <label>Parent / Tuteur</label>
                                <input type="text" id="eleveParent" class="form-control"
                                    placeholder="Nom du parent/tuteur">
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-primary" onclick="saveEleve()">
                            <i class="fas fa-save"></i> Enregistrer
                        </button>
                        <button class="btn btn-danger" onclick="closeEleveModal()">
                            <i class="fas fa-times"></i> Annuler
                        </button>
                    </div>
                </div>
            </div>

            <!-- MODAL CONFIRMATION SUPPRESSION ÉLÈVE -->
            <div id="confirmDeleteModal" class="modal">
                <div class="modal-content" style="max-width: 400px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-trash-alt" style="color: var(--danger);"></i> Confirmer la suppression</h3>
                        <button onclick="closeConfirmModal()"
                            style="background:none; border:none; font-size:24px; cursor:pointer;">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p>Êtes-vous sûr de vouloir supprimer cet élève ?</p>
                        <p id="deleteEleveName" style="font-weight: bold; margin-top: 10px;"></p>
                        <p class="text-danger" style="font-size: 12px; margin-top: 10px;">Cette action est irréversible.
                        </p>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-danger" onclick="confirmDeleteEleve()">
                            <i class="fas fa-trash"></i> Supprimer
                        </button>
                        <button class="btn btn-secondary" onclick="closeConfirmModal()">
                            <i class="fas fa-times"></i> Annuler
                        </button>
                    </div>
                </div>
            </div>

            <!-- MODAL AJOUT BULLETIN PAR MATIÈRE -->
            <div id="addBulletinModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3><i class="fas fa-plus-circle"></i> Ajouter un bulletin</h3>
                        <button onclick="closeAddBulletinModal()"
                            style="background:none; border:none; font-size:24px; cursor:pointer;">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="addBulletinForm">
                            <div class="form-group">
                                <label>Élève *</label>
                                <select id="bulletinStudent" class="form-control" required>
                                    <option value="">Sélectionner un élève</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Matière *</label>
                                <select id="bulletinSubject" class="form-control" required>
                                    <option value="">Sélectionner une matière</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Enseignant *</label>
                                <select id="bulletinTeacher" class="form-control" required>
                                    <option value="">Sélectionner un enseignant</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Note (0-20) *</label>
                                <input type="number" id="bulletinGrade" class="form-control" step="0.5" min="0" max="20"
                                    required>
                            </div>
                            <div class="form-group">
                                <label>Coefficient</label>
                                <input type="number" id="bulletinCoeff" class="form-control" value="1" step="0.5"
                                    min="0.5">
                            </div>
                            <div class="form-group">
                                <label>Période / Trimestre</label>
                                <select id="bulletinPeriod" class="form-control">
                                    <option value="T1">1er Trimestre</option>
                                    <option value="T2">2ème Trimestre</option>
                                    <option value="T3">3ème Trimestre</option>
                                    <option value="Sem1">1er Semestre</option>
                                    <option value="Sem2">2ème Semestre</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Commentaire</label>
                                <textarea id="bulletinComment" class="form-control" rows="2"
                                    placeholder="Observations..."></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-primary" onclick="saveNewBulletin()"><i class="fas fa-save"></i>
                            Enregistrer</button>
                        <button class="btn btn-danger" onclick="closeAddBulletinModal()">Annuler</button>
                    </div>
                </div>
            </div>

            <!-- MODAL SIGNALER ABSENCE/RETARD -->
            <div id="signalAbsenceModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3><i class="fas fa-exclamation-triangle"></i> Signaler absence / retard</h3>
                        <button onclick="closeSignalModal()"
                            style="background:none; border:none; font-size:24px; cursor:pointer;">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="absenceForm">
                            <div class="form-group">
                                <label>Élève *</label>
                                <select id="absenceStudent" class="form-control" required>
                                    <option value="">Sélectionner un élève (par matricule ou nom)</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Type *</label>
                                <select id="absenceType" class="form-control" required>
                                    <option value="absence">Absence</option>
                                    <option value="retard">Retard</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Date *</label>
                                <input type="date" id="absenceDate" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label>Heure (pour les retards)</label>
                                <input type="time" id="absenceTime" class="form-control">
                            </div>
                            <div class="form-group">
                                <label>Durée (en heures)</label>
                                <input type="number" id="absenceDuration" class="form-control" step="0.5" min="0"
                                    value="1">
                            </div>
                            <div class="form-group">
                                <label>Motif</label>
                                <textarea id="absenceReason" class="form-control" rows="2"
                                    placeholder="Motif de l'absence/retard..."></textarea>
                            </div>
                            <div class="form-group">
                                <label>Justifiée ?</label>
                                <select id="absenceJustified" class="form-control">
                                    <option value="non">Non</option>
                                    <option value="oui">Oui</option>
                                </select>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-primary" onclick="saveAbsence()"><i class="fas fa-save"></i>
                            Enregistrer</button>
                        <button class="btn btn-danger" onclick="closeSignalModal()">Annuler</button>
                    </div>
                </div>
            </div>

            <!-- MODAL JUSTIFIER ABSENCE -->
            <div id="justifyModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3><i class="fas fa-check-circle"></i> Justifier l'absence</h3>
                        <button onclick="closeJustifyModal()"
                            style="background:none; border:none; font-size:24px; cursor:pointer;">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p><strong>Élève:</strong> <span id="justifyStudentName"></span></p>
                        <div class="form-group">
                            <label>Date de l'absence</label>
                            <input type="date" id="justifyDate" class="form-control">
                        </div>
                        <div class="form-group">
                            <label>Justificatif</label>
                            <textarea id="justifyReason" class="form-control" rows="3"
                                placeholder="Motif de justification..."></textarea>
                        </div>
                        <div class="form-group">
                            <label>Pièce jointe (optionnel)</label>
                            <input type="file" id="justifyFile" class="form-control">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-success" onclick="confirmJustify()"><i class="fas fa-check"></i>
                            Justifier</button>
                        <button class="btn btn-danger" onclick="closeJustifyModal()">Annuler</button>
                    </div>
                </div>
            </div>

            <!-- MODAL CLASSE -->
            <div id="addClasseModal" class="modal">
                <div class="modal-content" style="max-width:550px;">
                    <div class="modal-header">
                        <h3 id="classeModalTitle"><i class="fas fa-folder-plus"></i> Ajouter une classe</h3>
                        <button onclick="closeAddClasseModal()"
                            style="background:none;border:none;font-size:24px;cursor:pointer;">&times;</button>
                    </div>
                    <div class="modal-body">
                        <input type="hidden" id="classeEditNom">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label>Nom de la classe *</label>
                                    <input type="text" id="classeNom" class="form-control" placeholder="Ex: 6ème A">
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label>Niveau *</label>
                                    <select id="classeNiveau" class="form-control">
                                        <option value="">Sélectionner</option>
                                        <option value="6ème">6ème</option>
                                        <option value="5ème">5ème</option>
                                        <option value="4ème">4ème</option>
                                        <option value="3ème">3ème</option>
                                        <option value="2nde">2nde</option>
                                        <option value="1ère">1ère</option>
                                        <option value="Terminale">Terminale</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label>Effectif</label>
                                    <input type="number" id="classeEffectif" class="form-control" placeholder="Ex: 30"
                                        min="0">
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label>Salle</label>
                                    <input type="text" id="classeSalle" class="form-control"
                                        placeholder="Ex: Salle 101">
                                </div>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Professeur titulaire</label>
                            <input type="text" id="classeTitulaire" class="form-control"
                                placeholder="Nom du professeur titulaire">
                        </div>
                        <div class="form-group">
                            <label>Statut</label>
                            <select id="classeStatut" class="form-control">
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-primary" onclick="saveClasse()"><i class="fas fa-save"></i>
                            Enregistrer</button>
                        <button class="btn btn-danger" onclick="closeAddClasseModal()">Annuler</button>
                    </div>
                </div>
            </div>

            <!-- MODAL MATIÈRE -->
            <div id="addMatiereModal" class="modal">
                <div class="modal-content" style="max-width:550px;">
                    <div class="modal-header">
                        <h3 id="matiereModalTitle"><i class="fas fa-book-medical"></i> Ajouter une matière</h3>
                        <button onclick="closeAddMatiereModal()"
                            style="background:none;border:none;font-size:24px;cursor:pointer;">&times;</button>
                    </div>
                    <div class="modal-body">
                        <input type="hidden" id="matiereEditNom">
                        <div class="form-group">
                            <label>Nom de la matière *</label>
                            <input type="text" id="matiereNom" class="form-control" placeholder="Ex: Mathématiques">
                        </div>
                        <div class="form-group">
                            <label>Enseignant responsable *</label>
                            <input type="text" id="matiereEnseignant" class="form-control" placeholder="Ex: M. RAKOTO">
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label>Coefficient</label>
                                    <input type="number" id="matiereCoeff" class="form-control" value="1" step="0.5"
                                        min="0.5" max="10">
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label>Heures / semaine</label>
                                    <input type="number" id="matiereHeures" class="form-control" value="3" min="1"
                                        max="20">
                                </div>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Niveau concerné</label>
                            <select id="matiereNiveau" class="form-control">
                                <option value="Tous niveaux">Tous niveaux</option>
                                <option value="Collège">Collège</option>
                                <option value="Lycée">Lycée</option>
                                <option value="6ème">6ème uniquement</option>
                                <option value="Terminale">Terminale uniquement</option>
                            </select>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-primary" onclick="saveMatiere()"><i class="fas fa-save"></i>
                            Enregistrer</button>
                        <button class="btn btn-danger" onclick="closeAddMatiereModal()">Annuler</button>
                    </div>
                </div>
            </div>

            <!-- MODAL UTILISATEUR -->
            <div id="addUserModal" class="modal">
                <div class="modal-content" style="max-width:550px;">
                    <div class="modal-header">
                        <h3 id="userModalTitle"><i class="fas fa-user-plus"></i> Ajouter un utilisateur</h3>
                        <button onclick="closeAddUserModal()"
                            style="background:none;border:none;font-size:24px;cursor:pointer;">&times;</button>
                    </div>
                    <div class="modal-body">
                        <input type="hidden" id="userEditEmail">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label>Nom complet *</label>
                                    <input type="text" id="userName" class="form-control" placeholder="Nom et prénom">
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label>Email *</label>
                                    <input type="email" id="userEmail" class="form-control"
                                        placeholder="email@ecole.com">
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label>Rôle</label>
                                    <select id="userRole" class="form-control">
                                        <option value="Administrateur">Administrateur</option>
                                        <option value="Professeur">Professeur</option>
                                        <option value="Secrétaire">Secrétaire</option>
                                        <option value="Comptable">Comptable</option>
                                        <option value="CPE">CPE</option>
                                        <option value="Parent">Parent</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label>Téléphone</label>
                                    <input type="tel" id="userTelephone" class="form-control"
                                        placeholder="032 12 345 67">
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label>Mot de passe</label>
                                    <input type="password" id="userPassword" class="form-control"
                                        placeholder="Laisser vide pour ne pas modifier">
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label>Statut</label>
                                    <select id="userStatut" class="form-control">
                                        <option value="Actif">Actif</option>
                                        <option value="Inactif">Inactif</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-primary" onclick="saveUser()"><i class="fas fa-save"></i>
                            Enregistrer</button>
                        <button class="btn btn-danger" onclick="closeAddUserModal()">Annuler</button>
                    </div>
                </div>
            </div>

            <!-- ═══ SCRIPTS ═══ -->
            <script src="js/dashboard.js?v=<%=AuthHelper.Version %>"></script>
            <script src="js/script.js?v=<%=AuthHelper.Version %>"></script>
            <script src="../../_assets/js/global.js?v=<%=AuthHelper.Version %>"></script>
        </form>
    </body>

    </html>