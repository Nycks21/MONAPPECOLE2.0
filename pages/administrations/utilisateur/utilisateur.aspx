<%@ Page Language="C#" AutoEventWireup="true" CodeFile="utilisateurs.cs" Inherits="utilisateurs" %>
    <!DOCTYPE html>
    <html lang="fr">

    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Utilisateur — Gestion Scolaire</title>

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
                        <li class="nav-item">
                            <a class="nav-link" title="Langue">
                                <select id="langSelect" onchange="loadLang(this.value)"><i
                                        class="fas fa-expand-arrows-alt"></i>
                                    <option value="fr">🇫🇷 Français</option>
                                    <option value="en">🇬🇧 English</option>
                                    <option value="mg">🇲🇬 Malagasy</option>
                                </select>
                            </a>
                        </li>
                    </ul>
                </nav>

                <!-- ═══ SIDEBAR ═══ -->
                <aside class="main-sidebar" id="sidebar">
                    <a href="#" class="brand-link">
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
                                    <a href="../../modules/eleves/eleves.aspx" class="nav-link">
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
                                    <a href="../frais/frais.aspx" class="nav-link">
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
                                        <a href="../utilitaires/utilitaires.aspx" class="nav-link">
                                            <div style="width:30px; text-align:center; margin-right:10px;">
                                                <i class="fas fa-cogs"></i>
                                            </div>
                                            <span>Utilitaires</span>
                                        </a>
                                    </li>
                                <% } %>
                                <% if (AuthHelper.IsAdmin() || AuthHelper.IsSuperAdmin()) { %>
                                    <li class="nav-item">
                                        <a href="../annee/annee.aspx" class="nav-link">
                                            <div style="width:30px; text-align:center; margin-right:10px;">
                                                <i class="fas fa-calendar-alt"></i>
                                            </div>
                                            <span>Années</span>
                                        </a>
                                    </li>
                                    <% } %>
                                        <% if (AuthHelper.IsAdmin() || AuthHelper.IsSuperAdmin()) { %>
                                            <li class="nav-item">
                                                <a href="utilisateur.aspx" class="nav-link active">
                                                    <div style="width:30px; text-align:center; margin-right:10px;">
                                                        <i class="fas fa-user"></i>
                                                    </div>
                                                    <span>Utilisateur</span>
                                                </a>
                                            </li>
                                            <% } %>

                                                <% if (AuthHelper.IsSuperAdmin()) { %>
                                                    <li class="nav-item">
                                                        <a href="../requete/requetes.aspx" class="nav-link"
                                                            style="display: flex; align-items: center;">
                                                            <div
                                                                style="width:30px; text-align:center; margin-right:10px;">
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
                                    <h1 id="dynPageTitle">Liste des utilisateurs</h1>
                                </div>
                                <div class="col-lg-6">
                                    <ol class="breadcrumb" style="float: right;">
                                        <li class="breadcrumb-item">Administration</li>
                                        <li class="breadcrumb-item active" id="dynBreadcrumb">Utilisateur</li>
                                    </ol>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- ═══════════════════════════════════════════════════════════
                    pages/utilisateur.html  —  Section Gestion des utilisateurs
                    ═══════════════════════════════════════════════════════════ -->
                    <section class="content" id="section-utilisateur">

                        <div class="dash-card">
                            <div class="dash-card-head">
                                <span class="dash-card-title"><i class="fas fa-users-cog"></i> Gestion des
                                    utilisateurs</span>
                                <div class="action-buttons">
                                    <button class="btn btn-success btn-sm" onclick="openAddUserModal()"
                                        data-i18n="common.ajouter">
                                        <i class="fas fa-plus"></i> Ajouter
                                    </button>
                                    <button class="btn btn-primary btn-sm" onclick="exportUsers()">
                                        <i class="fas fa-download"></i> Exporter
                                    </button>
                                    <button class="btn btn-success btn-sm" onclick="exportUsersToExcelOnly()">
                                        <i class="fas fa-file-excel"></i> Excel
                                    </button>
                                    <button class="btn btn-info btn-sm" onclick="exportUsersToCsvOnly()">
                                        <i class="fas fa-file-csv"></i> CSV
                                    </button>
                                </div>
                            </div>

                            <div class="dash-card-body">
                                <!-- Tableau -->
                                <div style="overflow-x:auto;">
                                    <table class="dash-table" id="dash-tables">
                                        <thead>
                                            <tr>
                                                <th>Nom d'utilisateur</th>
                                                <th>Nom complet</th>
                                                <th>Email</th>
                                                <th>Rôle</th>
                                                <th>Téléphone</th>
                                                <th>Date de création</th>
                                                <th>Statut</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody id="usersTableBody"></tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            <!-- MODAL UTILISATEUR -->
            <div id="addUserModal" class="modal">
                <div class="modal-content" style="max-width:550px;">
                    <div class="modal-header">
                        <h3 id="userModalTitle"><i class="fas fa-user-plus"></i> Ajouter un utilisateur</h3>
                    </div>
                    <div class="modal-body">
                        <input type="hidden" id="userEditEmail">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label>Nom d'utilisateur *</label>
                                    <input type="text" id="username" class="form-control"
                                        placeholder="Nom d'utilisateur">
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label>Nom complet *</label>
                                    <input type="text" id="Nom" class="form-control" placeholder="Nom et prénom">
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
                                        placeholder="Mot de passe">
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


            <!-- ═══ SPINNER ═══ -->
            <div id="spinnerOverlay" aria-hidden="true" style="display:none;visibility:hidden;">
                <div class="spinner"></div>
            </div>

            <!-- ═══ SCRIPTS ═══ -->
            <script src="../../_assets/js/jquery-3.6.0.min.js?v=<%=AuthHelper.Version %>"></script>
            <script src="../../_assets/js/sweetalert2@11.js?v=<%=AuthHelper.Version %>"></script>
            <script src="../../_assets/js/jszip.min.js?v=<%=AuthHelper.Version %>"></script>
            <script src="../../_assets/js/pdfmake.min.js?v=<%=AuthHelper.Version %>"></script>
            <script src="../../_assets/js/vfs_fonts.js?v=<%=AuthHelper.Version %>"></script>
            <script src="../../_assets/js/global.js?v=<%=AuthHelper.Version %>"></script>
            <script src="js/users.js?v=<%=AuthHelper.Version %>"></script>
            <div id="toastContainer"></div>
        </form>
    </body>

    </html>