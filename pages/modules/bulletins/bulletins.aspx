<%@ Page Language="C#" AutoEventWireup="true" CodeFile="bulletins.cs" Inherits="bulletins" %>
    <!DOCTYPE html>
    <html lang="fr">

    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bulletins — Gestion Scolaire</title>

        <!-- Font Awesome -->
        <link rel="stylesheet" href="../../_assets/css/all.min.css">
        <link rel="stylesheet" href="../../_assets/css/fontawesome.css">
        <link rel="stylesheet" href="../../_assets/css/fontawesome.min.css">
        <link rel="stylesheet" href="../../_assets/css/global.css">

    </head>

    <body class="hold-transition">
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
                                    <a href="../eleves/eleves.aspx" class="nav-link active">
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
                                    <a href="bulletins.aspx" class="nav-link">
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

                                <!-- Identifiant -->
                                <li class="nav-item">
                                    <div class="nav-section">Identifiant</div>
                                    <a href="../../administrations/utilisateur/utilisateur.aspx" class="nav-link">
                                        <div style="width:30px; text-align:center; margin-right:10px;">
                                            <i class="fas fa-user"></i>
                                        </div>
                                        <span>Utilisateur</span>
                                    </a>
                                </li>
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
                pages/bulletins.html  —  Section Bulletins de notes
                ═══════════════════════════════════════════════════════════ -->
                    <section class="content" id="section-bulletins">

                        <div class="dash-card">
                            <div class="dash-card-head">
                                <span class="dash-card-title"><i class="fas fa-file-alt"></i> Bulletins de notes</span>
                                <div class="action-buttons">
                                    <button class="btn btn-success btn-sm" onclick="openAddBulletinModal()">
                                        <i class="fas fa-plus"></i> + Bulletin
                                    </button>
                                    <div class="file-input-wrapper">
                                        <button class="btn btn-info btn-sm"><i class="fas fa-file-excel"></i> Importer
                                            Excel</button>
                                        <input type="file" id="excelImport" accept=".xlsx,.xls,.csv"
                                            onchange="importExcel(this)">
                                    </div>
                                    <button class="btn btn-primary btn-sm" onclick="exportBulletins()">
                                        <i class="fas fa-download"></i> Exporter
                                    </button>
                                </div>
                            </div>

                            <div class="dash-card-body">
                                <div style="overflow-x:auto;">
                                    <table class="dash-table">
                                        <thead>
                                            <tr>
                                                <th>Matricule</th>
                                                <th>Élève</th>
                                                <th>Classe</th>
                                                <th>Matière</th>
                                                <th>Enseignant</th>
                                                <th>Note</th>
                                                <th>Coeff</th>
                                                <th>Période</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody id="bulletinsTableBody"></tbody>
                                    </table>
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

            <!-- ═══ SCRIPTS ═══ -->
            <script src="js/bulletins.js"></script>
            <script src="js/script.js"></script>
            <script src="../../_assets/js/global.js"></script>
        </form>
    </body>

    </html>