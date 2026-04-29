<%@ Page Language="C#" AutoEventWireup="true" CodeFile="frais.cs" Inherits="frais" %>
    <!DOCTYPE html>
    <html lang="fr">

    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Frais — Gestion Scolaire</title>

        <!-- Font Awesome -->
        <link rel="stylesheet" href="../../_assets/css/all.min.css?v=<%=AuthHelper.Version %>">
        <link rel="stylesheet" href="../../_assets/css/fontawesome.css?v=<%=AuthHelper.Version %>">
        <link rel="stylesheet" href="../../_assets/css/fontawesome.min.css?v=<%=AuthHelper.Version %>">
        <link rel="stylesheet" href="../../_assets/css/global.css?v=<%=AuthHelper.Version %>">
    </head>

    <body class="hold-transition" data-version="<%=AuthHelper.Version %>">
        <form id="form1" runat="server">
            <div class="wrapper">

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
                        <div class="user-panel">
                            <i class="fas fa-user-tie"></i>
                            <span id="navbarUsername">Admin Système</span>
                        </div>

                        <!-- Navigation -->
                        <nav>
                            <ul class="nav-pills">
                                <!-- Accueil -->
                                <li class="nav-item">
                                    <div class="nav-section">Accueil</div>
                                    <a href="../../accueil/dashboards/index.aspx" class="nav-link">
                                        <div style="width:30px; text-align:center; margin-right:10px;">
                                            <i class="fas fa-chalkboard"></i>
                                        </div>
                                        <span>Dashboard</span>
                                    </a>
                                </li>

                                <!-- Modules -->
                                <li class="nav-item">
                                    <div class="nav-section">Modules</div>
                                    <a href="../eleves/eleves.aspx" class="nav-link">
                                        <div style="width:30px; text-align:center; margin-right:10px;">
                                            <i class="fas fa-users"></i>
                                        </div>
                                        <span>Liste des élèves</span>
                                    </a>
                                </li>
                                <li class="nav-item">
                                    <a href="../absences/absences.aspx" class="nav-link">
                                        <div style="width:30px; text-align:center; margin-right:10px;">
                                            <i class="fas fa-calendar-times"></i>
                                        </div>
                                        <span>Retards & Absences</span>
                                    </a>
                                </li>
                                <li class="nav-item">
                                    <a href="frais.aspx" class="nav-link active">
                                        <div style="width:30px; text-align:center; margin-right:10px;">
                                            <i class="fas fa-money-bill-wave"></i>
                                        </div>
                                        <span>Frais scolaires</span>
                                    </a>
                                </li>
                                <li class="nav-item">
                                    <a href="../bulletins/bulletins.aspx" class="nav-link">
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

                    <!-- ═══════════════════════════════════════════════════════════
                pages/frais.html  —  Section Frais scolaires
                ═══════════════════════════════════════════════════════════ -->
                    <section class="content" id="section-frais">

                        <div class="dash-card">
                            <div class="dash-card-head">
                                <span class="dash-card-title"><i class="fas fa-money-bill-wave"></i> Frais
                                    scolaires</span>
                                <div class="action-buttons">
                                    <button class="btn btn-success btn-sm" onclick="openAddPaymentModal()">
                                        <i class="fas fa-plus"></i> Enregistrer un paiement
                                    </button>
                                    <button class="btn btn-primary btn-sm" onclick="exportFraisToExcel()">
                                        <i class="fas fa-download"></i> Exporter
                                    </button>
                                    <button class="btn btn-secondary btn-sm" onclick="printFraisReport()">
                                        <i class="fas fa-print"></i> Imprimer
                                    </button>
                                </div>
                            </div>

                            <div class="dash-card-body">

                                <!-- Stats frais -->
                                <div class="frais-stats" id="fraisStatsContainer">
                                    <div class="stat-card">
                                        <div class="stat-icon">💰</div>
                                        <div class="stat-value" id="statTotalFrais">—</div>
                                        <div class="stat-label">Total attendu</div>
                                    </div>
                                    <div class="stat-card">
                                        <div class="stat-icon" style="color:var(--success)">✅</div>
                                        <div class="stat-value" id="statTotalPaye" style="color:var(--success)">—</div>
                                        <div class="stat-label">Total payé</div>
                                    </div>
                                    <div class="stat-card">
                                        <div class="stat-icon" style="color:var(--danger)">⚠️</div>
                                        <div class="stat-value" id="statTotalReste" style="color:var(--danger)">—</div>
                                        <div class="stat-label">Total impayé</div>
                                    </div>
                                    <div class="stat-card">
                                        <div class="stat-icon">📊</div>
                                        <div class="stat-value" id="statTauxRecouvrement">—</div>
                                        <div class="stat-label">Taux recouvrement</div>
                                    </div>
                                </div>

                                <!-- Filtres -->
                                <div class="frais-filters">
                                    <select class="form-control" id="fraisFilterStatut" onchange="filterFraisTable()"
                                        style="max-width:160px;">
                                        <option value="">Tous les statuts</option>
                                        <option value="Payé">Payé</option>
                                        <option value="Partiel">Partiel</option>
                                        <option value="En retard">En retard</option>
                                        <option value="Impayé">Impayé</option>
                                    </select>
                                    <select class="form-control" id="fraisFilterClasse" onchange="filterFraisTable()"
                                        style="max-width:160px;">
                                        <option value="">Toutes les classes</option>
                                    </select>
                                    <div class="search-box">
                                        <i class="fas fa-search"></i>
                                        <input type="text" class="form-control" id="fraisSearch"
                                            placeholder="Rechercher élève, matricule..." oninput="filterFraisTable()">
                                    </div>
                                </div>

                                <!-- Tableau -->
                                <div style="overflow-x:auto;">
                                    <table class="dash-table">
                                        <thead>
                                            <tr>
                                                <th>Matricule</th>
                                                <th>Nom</th>
                                                <th>Classe</th>
                                                <th>Total</th>
                                                <th>Payé</th>
                                                <th>Reste</th>
                                                <th>Progression</th>
                                                <th>Statut</th>
                                                <th>Dernier paiement</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody id="fraisTableBody"></tbody>
                                    </table>
                                </div>

                                <!-- Pagination -->
                                <div
                                    style="display:flex;justify-content:space-between;align-items:center;margin-top:15px;flex-wrap:wrap;gap:10px;">
                                    <span id="fraisPaginationInfo" style="color:#6c757d;font-size:13px;"></span>
                                    <div class="action-buttons">
                                        <button class="btn btn-sm btn-secondary" id="prevPageBtn"
                                            onclick="previousFraisPage()" disabled>
                                            <i class="fas fa-chevron-left"></i> Précédent
                                        </button>
                                        <button class="btn btn-sm btn-secondary" id="nextPageBtn"
                                            onclick="nextFraisPage()">
                                            Suivant <i class="fas fa-chevron-right"></i>
                                        </button>
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

            <!-- ═══ SCRIPTS ═══ -->
            <script src="js/frais.js?v=<%=AuthHelper.Version %>"></script>
            <script src="js/script.js?v=<%=AuthHelper.Version %>"></script>
            <script src="../../_assets/js/global.js?v=<%=AuthHelper.Version %>"></script>
        </form>
    </body>

    </html>