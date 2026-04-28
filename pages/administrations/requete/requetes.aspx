<%@ Page Language="C#" AutoEventWireup="true" CodeFile="requetes.cs" Inherits="requetes" %>
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
                                                <a href="../utilisateur/utilisateur.aspx" class="nav-link">
                                                    <div style="width:30px; text-align:center; margin-right:10px;">
                                                        <i class="fas fa-user"></i>
                                                    </div>
                                                    <span>Utilisateur</span>
                                                </a>
                                            </li>

                                            <% } %>

                                                <% if (AuthHelper.IsSuperAdmin()) { %>
                                                    <li class="nav-item">
                                                        <a href="requetes.aspx" class="nav-link active"
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
                                    <h1 id="dynPageTitle">Requetes SQL</h1>
                                </div>
                                <div class="col-lg-6">
                                    <ol class="breadcrumb" style="float: right;">
                                        <li class="breadcrumb-item">Administration</li>
                                        <li class="breadcrumb-item active" id="dynBreadcrumb">Requetes</li>
                                    </ol>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- ═══════════════════════════════════════════════════════════
                    pages/utilisateur.html  —  Section Gestion des utilisateurs
                    ═══════════════════════════════════════════════════════════ -->
                    <section class="content" id="section-requetes">
                        <div class="dash-card">
                            <div class="dash-card-head">
                                <span class="dash-card-title"><i class="fas fa-terminal"></i> Console SQL</span>
                            </div>
                            <div class="dash-card-body">
                                <div class="alert alert-warning">
                                    <i class="fas fa-exclamation-triangle"></i> <strong>Attention :</strong> Toute
                                    commande
                                    validée impactera directement la base de données.
                                </div>
                                <br />
                                <button type="button" class="btn btn-danger" onclick="executeCustomSQL()"
                                    style="margin-bottom: 10px;">
                                    <i class="fas fa-play"></i> Exécuter la requête
                                </button>
                                <br />
                                <!-- ── Textarea : resize vertical uniquement ── -->
                                <textarea id="sqlConsole" class="form-control" rows="8"
                                    placeholder="Écrivez votre requête ici (Ex: SELECT * FROM USERS)" style="font-family:'Consolas',monospace;background:#1e1e1e;color:#d4d4d4;
                                       padding:15px;resize:vertical;min-height:120px;width:100%;
                                       box-sizing:border-box;">
                            </textarea>

                                <div style="margin-top:12px;display:flex;align-items:center;
                                        justify-content:space-between;flex-wrap:wrap;gap:8px;">
                                    <span style="font-size:12px;color:#6c757d;">
                                        <i class="fas fa-keyboard"></i> Ctrl+Entrée pour exécuter
                                    </span>
                                </div>

                                <!-- ── Zone résultat ── -->
                                <div class="view">
                                    <div class="wrapper">
                                        <table class="table">
                                            <div id="sqlExecutionResult"
                                                style="margin-top:20px; width:100%; max-width:100%; max-height: 100%; overflow-x:auto !important; border:1px solid #dee2e6; border-radius:4px; background:#eeecec;">
                                                <div id="sqlExecutionResult">
                                                    <div style="text-align:center; color:#6c757d; padding:20px;">
                                                        <i class="fas fa-info-circle"></i> Les résultats de vos requêtes
                                                        s'afficheront
                                                        ici.
                                                    </div>
                                                </div>
                                            </div>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <!-- ═══ SPINNER ═══ -->
                    <div id="spinnerOverlay" aria-hidden="true" style="display:none;visibility:hidden;">
                        <div class="spinner"></div>
                    </div>

                    <!-- ═══ SCRIPTS ═══ -->
                    <script src="../../_assets/js/jquery-3.6.0.min.js?v=<%=AuthHelper.Version %>"></script>
                    <script src="../../_assets/js/sweetalert2@11.js?v=<%=AuthHelper.Version %>"></script>
                    <script src="js/script.js?v=<%=AuthHelper.Version %>"></script>
                    <div id="toastContainer"></div>
        </form>
    </body>

    </html>