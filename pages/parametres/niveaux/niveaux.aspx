<%@ Page Language="C#" AutoEventWireup="true" CodeFile="niveaux.cs" Inherits="niveaux" %>
<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Niveaux — Gestion Scolaire</title>
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
                    <li class="nav-item">
                        <a class="nav-link" id="notifToggle" title="Notifications" role="button" aria-haspopup="true" aria-expanded="false">
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
                    <div class="user-panel">
                        <i class="fas fa-user-tie"></i>
                        <span id="navbarUsername">Admin Système</span>
                    </div>
                    <nav>
                        <ul class="nav-pills">
                            <li class="nav-item">
                                <div class="nav-section">Accueil</div>
                                <a href="../../accueil/dashboards/index.aspx" class="nav-link">
                                    <div style="width:30px;text-align:center;margin-right:10px;"><i class="fas fa-chalkboard"></i></div>
                                    <span>Dashboard</span>
                                </a>
                            </li>
                            <li class="nav-item">
                                <div class="nav-section">Modules</div>
                                <a href="../../modules/eleves/eleves.aspx" class="nav-link">
                                    <div style="width:30px;text-align:center;margin-right:10px;"><i class="fas fa-users"></i></div>
                                    <span>Liste des élèves</span>
                                </a>
                            </li>
                            <li class="nav-item">
                                <a href="../../modules/absences/absences.aspx" class="nav-link">
                                    <div style="width:30px;text-align:center;margin-right:10px;"><i class="fas fa-calendar-times"></i></div>
                                    <span>Retards &amp; Absences</span>
                                </a>
                            </li>
                            <li class="nav-item">
                                <a href="../../modules/frais/frais.aspx" class="nav-link">
                                    <div style="width:30px;text-align:center;margin-right:10px;"><i class="fas fa-money-bill-wave"></i></div>
                                    <span>Frais scolaires</span>
                                </a>
                            </li>
                            <li class="nav-item">
                                <a href="../../modules/bulletins/bulletins.aspx" class="nav-link">
                                    <div style="width:30px;text-align:center;margin-right:10px;"><i class="fas fa-file-alt"></i></div>
                                    <span>Bulletins</span>
                                </a>
                            </li>
                            <!-- Paramètres -->
                            <li class="nav-item">
                                <div class="nav-section">Paramètres</div>
                                <a href="niveaux.aspx" class="nav-link active">
                                    <div style="width:30px;text-align:center;margin-right:10px;"><i class="fas fa-layer-group"></i></div>
                                    <span>Niveau</span>
                                </a>
                            </li>
                            <li class="nav-item">
                                <a href="../../parametres/salles/salles.aspx" class="nav-link">
                                    <div style="width:30px;text-align:center;margin-right:10px;"><i class="fas fa-door-open"></i></div>
                                    <span>Salle</span>
                                </a>
                            </li>
                            <li class="nav-item">
                                <a href="../../parametres/classes/classes.aspx" class="nav-link">
                                    <div style="width:30px;text-align:center;margin-right:10px;"><i class="fas fa-folder"></i></div>
                                    <span>Classes</span>
                                </a>
                            </li>
                            <li class="nav-item">
                                <a href="../../parametres/matieres/matieres.aspx" class="nav-link">
                                    <div style="width:30px;text-align:center;margin-right:10px;"><i class="fas fa-book"></i></div>
                                    <span>Matières</span>
                                </a>
                            </li>
                            <!-- Identifiant -->
                            <li class="nav-item">
                                <div class="nav-section">Identifiant</div>
                                <a href="../../administrations/utilisateur/utilisateur.aspx" class="nav-link">
                                    <div style="width:30px;text-align:center;margin-right:10px;"><i class="fas fa-user"></i></div>
                                    <span>Utilisateur</span>
                                </a>
                            </li>
                        </ul>
                    </nav>
                </div>
            </aside>

            <!-- ═══ CONTENT WRAPPER ═══ -->
            <div class="content-wrapper" id="contentWrapper">

                <div class="content-header">
                    <div class="container-fluid">
                        <div class="row">
                            <div class="col-lg-6">
                                <h1>Niveaux</h1>
                            </div>
                            <div class="col-lg-6">
                                <ol class="breadcrumb" style="float:right;">
                                    <li class="breadcrumb-item">Paramètres</li>
                                    <li class="breadcrumb-item active">Niveaux</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ═══ SECTION NIVEAUX ═══ -->
                <section class="content" id="section-niveaux">

                    <div class="dash-card">
                        <div class="dash-card-head">
                            <span class="dash-card-title"><i class="fas fa-layer-group"></i> Liste des niveaux</span>
                            <div class="action-buttons">
                                <button type="button" class="btn btn-success btn-sm" onclick="openAddNiveauModal()">
                                    <i class="fas fa-plus"></i> Ajouter un niveau
                                </button>
                                <button type="button" class="btn btn-primary btn-sm" onclick="exportNiveaux()">
                                    <i class="fas fa-download"></i> Exporter
                                </button>
                            </div>
                        </div>

                        <div class="dash-card-body">

                            <!-- Stats -->
                            <div class="absence-stats"
                                style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr));margin-bottom:20px;"
                                id="niveauxStatsContainer"></div>

                            <!-- Tableau -->
                            <div style="overflow-x:auto;">
                                <table class="dash-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Nom du niveau</th>
                                            <th>Ordre</th>
                                            <th>Statut</th>
                                            <th>Créé le</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody id="niveauxTableBody"></tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                </section>
            </div><!-- /.content-wrapper -->
        </div><!-- /.wrapper -->

        <!-- ═══ MODAL NIVEAU ═══ -->
        <div id="addNiveauModal" class="modal" role="dialog" aria-modal="true" aria-labelledby="niveauModalTitle">
            <div class="modal-content" style="max-width:450px;">
                <div class="modal-header">
                    <h3 id="niveauModalTitle"><i class="fas fa-layer-group"></i> Ajouter un niveau</h3>
                    <button type="button" class="btn-close-modal" onclick="closeAddNiveauModal()" aria-label="Fermer">&times;</button>
                </div>
                <div class="modal-body">
                    <input type="hidden" id="niveauEditId">
                    <div class="form-group">
                        <label for="niveauNom">Nom du niveau *</label>
                        <input type="text" id="niveauNom" class="form-control" placeholder="Ex : 6ème, Terminale…" maxlength="50">
                    </div>
                    <div class="form-group">
                        <label for="niveauOrdre">Ordre d'affichage</label>
                        <input type="number" id="niveauOrdre" class="form-control" value="0" min="0" max="99"
                               title="0 = premier dans la liste">
                    </div>
                    <div class="form-group">
                        <label for="niveauStatut">Statut</label>
                        <select id="niveauStatut" class="form-control">
                            <option value="1">Actif</option>
                            <option value="0">Inactif</option>
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" onclick="saveNiveau()">
                        <i class="fas fa-save"></i> Enregistrer
                    </button>
                    <button type="button" class="btn btn-danger" onclick="closeAddNiveauModal()">Annuler</button>
                </div>
            </div>
        </div>

        <!-- ═══ SPINNER ═══ -->
        <div id="spinnerOverlay" aria-hidden="true" style="display:none;visibility:hidden;">
            <div class="spinner"></div>
        </div>

        <!-- ═══ SCRIPTS ═══ -->
        <script src="js/niveaux.js"></script>
        <script src="../../../plugins/sweetalert2/sweetalert2.all.min.js"></script>

    </form>
</body>
</html>
