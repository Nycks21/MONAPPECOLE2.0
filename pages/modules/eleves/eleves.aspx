<%@ Page Language="C#" AutoEventWireup="true" CodeFile="eleves.cs" Inherits="eleves" %>
    <!DOCTYPE html>
    <html lang="fr">

    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Eleves — Gestion Scolaire</title>

        <!-- Font Awesome -->
        <link rel="stylesheet" href="../../_assets/css/all.min.css?v=<%=AuthHelper.Version %>">
        <link rel="stylesheet" href="../../_assets/css/fontawesome.css?v=<%=AuthHelper.Version %>">
        <link rel="stylesheet" href="../../_assets/css/fontawesome.min.css?v=<%=AuthHelper.Version %>">
        <link rel="stylesheet" href="../../_assets/css/global.css?v=<%=AuthHelper.Version %>">
    </head>

    <body class="hold-transition" data-version="<%=AuthHelper.Version %>">
        <form id="eleveForm" runat="server">
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
                                    <a href="eleves.aspx" class="nav-link active">
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
                                                                <a href="../../administrations/requete/requetes.aspx"
                                                                    class="nav-link"
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
                                    <h1 id="dynPageTitle">Eleves</h1>
                                </div>
                                <div class="col-lg-6">
                                    <ol class="breadcrumb" style="float: right;">
                                        <li class="breadcrumb-item">Application</li>
                                        <li class="breadcrumb-item active" id="dynBreadcrumb">Eleves</li>
                                    </ol>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- ═══════════════════════════════════════════════════════════
                pages/eleves.html  —  Section Liste des élèves
                ═══════════════════════════════════════════════════════════ -->
                    <section class="content" id="section-eleves">

                        <div class="dash-card">
                            <div class="dash-card-head">
                                <span class="dash-card-title"><i class="fas fa-users-cog"></i> Gestion des
                                    élèves</span>
                                <div class="action-buttons">
                                    <button type="button" class="btn btn-info" onclick="showInitialFilterModal()">
                                        <i class="fas fa-search"></i> Rechercher
                                    </button>
                                    <button class="btn btn-success btn-sm" onclick="openAddEleveModal(event)"
                                        data-i18n="common.ajouter">
                                        <i class="fas fa-plus"></i> Ajouter
                                    </button>
                                    <button class="btn btn-primary btn-sm" onclick="exportEleves()">
                                        <i class="fas fa-download"></i> Imprimer
                                    </button>
                                    <button class="btn btn-outline-success btn-sm" onclick="exportElevesToExcelOnly()">
                                        <i class="fas fa-file-excel"></i> Excel
                                    </button>
                                </div>
                            </div>

                            <div class="dash-card-body">
                                <!-- Tableau -->
                                <div
                                    style="overflow-x: auto; width: 100%; border: 1px solid #dee2e6; border-radius: 8px;">
                                    <table class="dash-table"
                                        style="table-layout: fixed; width: 1200px; min-width: 100%; border-collapse: collapse;">
                                        <thead>
                                            <tr style="background-color: #f8f9fa; text-align: center;">
                                                <th onclick="sortData('MATRICULE')" style="cursor:pointer; width: 100px;">MATRICULE <i
                                                        class="fas fa-sort ml-1"></i></th>
                                                <th onclick="sortData('ANNEE_TEXTE')" style="cursor:pointer; width: 80px;">ANNÉE <i
                                                        class="fas fa-sort ml-1"></i></th>
                                                <th onclick="sortData('NOM')" style="cursor:pointer; width: 150px;">NOM <i
                                                        class="fas fa-sort ml-1"></i></th>
                                                <th onclick="sortData('CLASSE_NOM')" style="cursor:pointer; width: 120px;">CLASSE <i
                                                        class="fas fa-sort ml-1"></i></th>
                                                <th onclick="sortData('EMAIL')" style="cursor:pointer; width: 150px;">EMAIL <i
                                                        class="fas fa-sort ml-1"></i></th>
                                                <th onclick="sortData('TELEPHONE')" style="cursor:pointer; width: 100px;">TÉLÉPHONE <i
                                                        class="fas fa-sort ml-1"></i></th>
                                                <th onclick="sortData('STATUT')" style="cursor:pointer; width: 80px;">STATUT <i
                                                        class="fas fa-sort ml-1"></i></th>
                                                <th style="width: 120px;">ACTIONS</th>
                                            </tr>
                                        </thead>
                                        <tbody id="elevesTableBody"></tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            <!-- MODAL AJOUT / MODIFICATION ÉLÈVE -->
            <div id="eleveModal" class="modal">
                <div class="modal-content modal-eleve" style="max-width:700px;">
                    <div class="modal-header">
                        <h3 id="modalTitle"><i class="fas fa-users"></i> Ajouter un élève</h3>
                        <span class="close" onclick="closeEleveModal()">&times;</span>
                    </div>

                    <div class="modal-body">
                        <div classe="form-row">
                            <label><span class="text-danger">* Champ obligatoire</span></label>
                        </div>
                        <br />

                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label>Année scolaire <span class="text-danger">*</span></label>
                                    <select id="eleveAnnee" class="form-control" required>
                                        <option value="">-- Sélectionner une année --</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label>Matricule <span class="text-danger">*</span></label>
                                    <input type="text" id="eleveMatricule" class="form-control"
                                        placeholder="Ex: 2024001" required>
                                </div>
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label>Nom complet <span class="text-danger">*</span></label>
                                <input type="text" id="eleveNom" class="form-control" placeholder="Nom et prénom"
                                    required>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label>Classe <span class="text-danger">*</span></label>
                                    <!-- Peuplé dynamiquement depuis GetClasse.ashx -->
                                    <select id="EleveClasse" class="form-control" required>
                                        <option value="">-- Sélectionner une classe --</option>
                                    </select>
                                </div>
                            </div>

                            <div class="col-md-6">
                                <div class="form-group">
                                    <label>Email</label>
                                    <input type="email" id="eleveEmail" class="form-control"
                                        placeholder="email@exemple.com">
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group" required>
                                    <label>Date de naissance <span class="text-danger">*</span></label>
                                    <input type="date" id="eleveDateNaiss" class="form-control">
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group" required>
                                    <label>Genre <span class="text-danger">*</span></label>
                                    <select id="eleveGenre" class="form-control">
                                        <option value="M">Masculin</option>
                                        <option value="F">Féminin</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div class="form-group" required>
                            <label>Adresse <span class="text-danger">*</span></label>
                            <textarea id="eleveAdresse" class="form-control" rows="2" placeholder="Adresse complète"
                                style="resize:vertical;min-height:120px;width:100%;
                                       box-sizing:border-box;"></textarea>
                        </div>
                        <div class="form-group" required>
                            <label>Parent / Tuteur <span class="text-danger">*</span></label>
                            <input type="text" id="eleveParent" class="form-control" placeholder="Nom du parent/tuteur">
                        </div>

                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label>Téléphone parent</label>
                                    <input type="tel" id="eleveTelephone" class="form-control"
                                        placeholder="032 12 345 67">
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group" required>
                                    <label>Statut <span class="text-danger">*</span></label>
                                    <select id="eleveStatut" class="form-control">
                                        <option value="actif">Actif</option>
                                        <option value="inactif">Inactif</option>
                                        <option value="suspendu">Suspendu</option>
                                    </select>
                                </div>
                            </div>
                        </div>
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

                <!-- MODAL IMPORTATION -->
                <div id="modalImport" class="modal">
                    <div class="modal-content" style="max-width: 600px;">
                        <div class="modal-header">
                            <h3>Importations élèves</h3>
                            <span class="close" onclick="closeModal('modalImport')">&times;</span>
                        </div>
                        <div class="modal-body">
                            <div class="form-group">
                                <label>Modèle N°</label>
                                <select id="importModele" class="form-control">
                                    <option value="01">01 - IMPORTATIONS ÉLÈVES</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Source</label>
                                <div style="display: flex; gap: 10px;">
                                    <input type="text" id="fileNameDisplay" class="form-control" readonly
                                        placeholder="Aucun fichier choisi">
                                    <input type="file" id="excelFile" style="display:none" accept=".xlsx, .xls"
                                        onchange="updateFileName()">
                                    <button type="button" class="btn btn-light border"
                                        onclick="document.getElementById('excelFile').click()">
                                        <i class="fas fa-folder-open"></i> Parcourir
                                    </button>
                                </div>
                            </div>

                            <div class="modal-body">
                                <div class="row">
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer" style="background: #f4f4f4; justify-content: space-between;">
                            <button class="btn btn-light border" onclick="openModal('modalMapping')">
                                <i class="fas fa-cog"></i> Voir paramétrage
                            </button>
                            <div style="display: flex; gap: 10px;">
                                <button class="btn btn-success" id="btnLaunchImport" onclick="launchImport()" disabled>
                                    <i class="fas fa-check"></i> Lancer l'import
                                </button>
                                <button class="btn btn-light border" onclick="closeModal('modalImport')">
                                    <i class="fas fa-history"></i> Historique
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- MODAL MAPPAGE -->
                <div id="modalMapping" class="modal" style="z-index: 1100;">
                    <div class="modal-content" style="max-width: 500px;">
                        <div class="modal-header">
                            <h3>Paramétrage des colonnes</h3>
                            <span class="close" onclick="closeModal('modalMapping')">&times;</span>
                        </div>
                        <div class="modal-body">
                            <table class="table table-sm">
                                <thead>
                                    <tr>
                                        <th>Champ Logiciel</th>
                                        <th>Colonne Excel</th>
                                    </tr>
                                </thead>
                                <tbody id="mappingTableBody">
                                    <tr>
                                        <td>Matricule</td>
                                        <td><input type="text" class="form-control sm" data-field="MATRICULE" value="A">
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Nom Complet</td>
                                        <td><input type="text" class="form-control sm" data-field="NOM" value="B">
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Classe</td>
                                        <td><input type="text" class="form-control sm" data-field="CLASSE" value="C">
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-primary" onclick="saveMapping()">Enregistrer le modèle</button>
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
                <script src="../../_assets/js/jspdf.umd.min.js?v=<%=AuthHelper.Version %>"></script>
                <script src="../../_assets/js/jspdf.plugin.autotable.min.js?v=<%=AuthHelper.Version %>"></script>
                <script src="../../_assets/js/xlsx.full.min.js?v=<%=AuthHelper.Version %>"></script>
                <script src="../../_assets/js/vfs_fonts.js?v=<%=AuthHelper.Version %>"></script>
                <script src="../../_assets/js/global.js?v=<%=AuthHelper.Version %>"></script>
                <script src="js/eleves.js?v=<%=AuthHelper.Version %>"></script>
                <div id="toastContainer"></div>
        </form>
    </body>

    </html>