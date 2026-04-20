<%@ Page Language="C#" AutoEventWireup="true" CodeFile="matieres.cs" Inherits="matieres" %>
    <!DOCTYPE html>
    <html lang="fr">

    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Matières — Gestion Scolaire</title>

        <!-- Font Awesome -->
        <link rel="stylesheet" href="css/all.min.css">
        <link rel="stylesheet" href="css/fontawesome.css">
        <link rel="stylesheet" href="css/fontawesome.min.css">
        <link rel="stylesheet" href="../../global.css">
    </head>

    <body class="hold-transition">
        <form id="form1" runat="server">
            <div class="wrapper">

                <!-- ═══ TOPBAR ═══ -->
                <nav class="main-header">
                    <ul class="navbar-nav">
                        <li class="nav-item">
                            <a class="nav-link" id="menuToggle" role="button" aria-label="Ouvrir le menu">
                                <i class="fas fa-bars"></i>
                            </a>
                        </li>
                    </ul>
                    <ul class="navbar-nav">
                        <!-- Notifications -->
                        <li class="nav-item">
                            <a class="nav-link" id="notifToggle" title="Notifications" role="button"
                                aria-haspopup="true" aria-expanded="false">
                                <i class="fas fa-bell"></i>
                                <span class="badge-notif" id="badgeNotif">3</span>
                            </a>
                            <div class="dropdown-menu" id="notifDropdown" role="menu">
                                <span class="dropdown-header">3 notifications</span>
                                <div class="dropdown-divider"></div>
                                <a href="#" class="dropdown-item">
                                    <i class="fas fa-user-plus text-success mr-2"></i> Nouvel élève inscrit
                                    <span style="float:right;color:#6c757d;font-size:11px;">Il y a 23 min</span>
                                </a>
                                <a href="#" class="dropdown-item">
                                    <i class="fas fa-exclamation-circle text-danger mr-2"></i> Absence signalée
                                    <span style="float:right;color:#6c757d;font-size:11px;">Il y a 1h</span>
                                </a>
                                <a href="#" class="dropdown-item">
                                    <i class="fas fa-money-bill text-warning mr-2"></i> Paiement reçu
                                    <span style="float:right;color:#6c757d;font-size:11px;">Il y a 2h</span>
                                </a>
                            </div>
                        </li>
                        <li class="nav-item">
                            <a href="../../../auth/Logout.aspx" class="nav-link" title="Se déconnecter">
                                <i class="fas fa-sign-out-alt"></i>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" id="fullscreenToggle" title="Plein écran" role="button">
                                <i class="fas fa-expand-arrows-alt"></i>
                            </a>
                        </li>
                    </ul>
                </nav>

                <!-- ═══ SIDEBAR ═══ -->
                <aside class="main-sidebar" id="sidebar">
                    <a href="../../accueil/dashboards/index.aspx" class="brand-link">
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
                                        <div style="width:30px;text-align:center;margin-right:10px;">
                                            <i class="fas fa-chalkboard"></i>
                                        </div>
                                        <span>Dashboard</span>
                                    </a>
                                </li>

                                <!-- Modules -->
                                <li class="nav-item">
                                    <div class="nav-section">Modules</div>
                                    <a href="../../modules/eleves/eleves.aspx" class="nav-link">
                                        <div style="width:30px;text-align:center;margin-right:10px;">
                                            <i class="fas fa-users"></i>
                                        </div>
                                        <span>Liste des élèves</span>
                                    </a>
                                </li>
                                <li class="nav-item">
                                    <a href="../../modules/absences/absences.aspx" class="nav-link">
                                        <div style="width:30px;text-align:center;margin-right:10px;">
                                            <i class="fas fa-calendar-times"></i>
                                        </div>
                                        <span>Retards &amp; Absences</span>
                                    </a>
                                </li>
                                <li class="nav-item">
                                    <a href="../../modules/frais/frais.aspx" class="nav-link">
                                        <div style="width:30px;text-align:center;margin-right:10px;">
                                            <i class="fas fa-money-bill-wave"></i>
                                        </div>
                                        <span>Frais scolaires</span>
                                    </a>
                                </li>
                                <li class="nav-item">
                                    <a href="../../modules/bulletins/bulletins.aspx" class="nav-link">
                                        <div style="width:30px;text-align:center;margin-right:10px;">
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
                                    <a href="../../parametres/matieres/matieres.aspx" class="nav-link active">
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
                                        <div style="width:30px;text-align:center;margin-right:10px;">
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

                    <!-- En-tête de page -->
                    <div class="content-header">
                        <div class="container-fluid">
                            <div class="row">
                                <div class="col-lg-6">
                                    <h1 id="dynPageTitle">Matières</h1>
                                </div>
                                <div class="col-lg-6">
                                    <ol class="breadcrumb" style="float:right;">
                                        <li class="breadcrumb-item">Paramètres</li>
                                        <li class="breadcrumb-item active" id="dynBreadcrumb">Matières</li>
                                    </ol>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- ═══ SECTION MATIÈRES ═══ -->
                    <section class="content" id="section-matieres">

                        <div class="dash-card">
                            <div class="dash-card-head">
                                <span class="dash-card-title"><i class="fas fa-book"></i> Matières enseignées</span>
                                <div class="action-buttons">
                                    <button type="button" class="btn btn-success btn-sm"
                                        onclick="openAddMatiereModal()">
                                        <i class="fas fa-plus"></i> Ajouter une matière
                                    </button>
                                    <button type="button" class="btn btn-primary btn-sm" onclick="exportMatieres()">
                                        <i class="fas fa-download"></i> Exporter
                                    </button>
                                </div>
                            </div>

                            <div class="dash-card-body">

                                <!-- Stats -->
                                <div class="absence-stats"
                                    style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr));margin-bottom:20px;"
                                    id="matieresStatsContainer"></div>

                                <!-- Tableau -->
                                <div style="overflow-x:auto;">
                                    <table class="dash-table">
                                        <thead>
                                            <tr>
                                                <th>Matière</th>
                                                <th>Enseignant</th>
                                                <th>Coefficient</th>
                                                <th>Heures/sem.</th>
                                                <th>Niveau</th>
                                                <th>Créé le</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody id="matieresTableBody"></tbody>
                                    </table>
                                </div>

                            </div>
                        </div>

                    </section>

                </div><!-- /.content-wrapper -->

            </div><!-- /.wrapper -->

            <!-- ═══ MODAL MATIÈRE ═══ -->
            <div id="addMatiereModal" class="modal" role="dialog" aria-modal="true" aria-labelledby="matiereModalTitle">
                <div class="modal-content" style="max-width:550px;">
                    <div class="modal-header">
                        <h3 id="matiereModalTitle"><i class="fas fa-book-medical"></i> Ajouter une matière</h3>
                        <button type="button" class="btn-close-modal" onclick="closeAddMatiereModal()"
                            aria-label="Fermer">&times;</button>
                    </div>
                    <div class="modal-body">
                        <input type="hidden" id="matiereEditNom">
                        <div class="form-group">
                            <label for="matiereNom">Nom de la matière *</label>
                            <input type="text" id="matiereNom" class="form-control" placeholder="Ex: Mathématiques"
                                maxlength="100">
                        </div>
                        <div class="form-group">
                            <label for="matiereEnseignant">Enseignant responsable *</label>
                            <input type="text" id="matiereEnseignant" class="form-control" placeholder="Ex: M. RAKOTO"
                                maxlength="100">
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="matiereCoeff">Coefficient</label>
                                    <input type="number" id="matiereCoeff" class="form-control" value="1" step="0.5"
                                        min="0.5" max="10">
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="matiereHeures">Heures / semaine</label>
                                    <input type="number" id="matiereHeures" class="form-control" value="3" min="1"
                                        max="20">
                                </div>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="matiereNiveau">Niveau concerné</label>
                            <select id="matiereNiveau" class="form-control">
                                <option value="">Sélectionnez un niveau...</option>
                            </select>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" onclick="saveMatiere()">
                            <i class="fas fa-save"></i> Enregistrer
                        </button>
                        <button type="button" class="btn btn-danger" onclick="closeAddMatiereModal()">Annuler</button>
                    </div>
                </div>
            </div>

            <!-- ═══ SPINNER ═══ -->
            <div id="spinnerOverlay" aria-hidden="true" style="display:none;visibility:hidden;">
                <div class="spinner"></div>
            </div>

            <!-- ═══ SCRIPTS ═══ -->
            <script src="js/matieres.js"></script>
            <script src="../../../plugins/sweetalert2/sweetalert2.all.min.js"></script>

        </form>
    </body>

    </html>