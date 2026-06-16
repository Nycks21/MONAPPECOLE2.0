<%@ Page Language="C#" AutoEventWireup="true" CodeFile="niveaux.cs" Inherits="niveaux" %>
    <!DOCTYPE html>
    <html lang="fr">

    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Niveaux — Gestion Scolaire</title>
        <link rel="stylesheet" href="../../_assets/css/all.min.css?v=<%=AuthHelper.Version %>">
        <link rel="stylesheet" href="../../_assets/css/fontawesome.css?v=<%=AuthHelper.Version %>">
        <link rel="stylesheet" href="../../_assets/css/fontawesome.min.css?v=<%=AuthHelper.Version %>">
        <link rel="stylesheet" href="../../_assets/css/global.css?v=<%=AuthHelper.Version %>">
    </head>

    <body class="hold-transition" data-version="<%=AuthHelper.Version %>">
        <form id="form1" runat="server">
            <div class="wrapper">

                <!-- ═══ TOPBAR ═══ -->
                <%= AuthHelper.RenderTopBarHTML() %>

                <!-- ═══ SIDEBAR ═══ -->
                <aside class="main-sidebar" id="sidebar">
                    <a href="../../accueil/dashboards/index.aspx" class="brand-link">
                        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='33' height='33' viewBox='0 0 33 33'%3E%3Ccircle cx='16.5' cy='16.5' r='16.5' fill='%23007bff'/%3E%3Ctext x='16.5' y='22' font-size='16' font-weight='bold' text-anchor='middle' fill='white'%3EGS%3C/text%3E%3C/svg%3E"
                            alt="Logo" class="brand-image">
                        <span class="brand-text">Gestion Scolaire</span>
                    </a>
                    <div class="sidebar">
                        <div class="user-profile-nav">
                            <div class="user-avatar">
                                <i class="fas fa-user-tie"></i>
                                <span class="status-indicator"></span>
                            </div>
                            <div class="user-info">
                            <span id="profilUsername" class="user-role">Profile :</span>
                            <span id="navbarUsername" class="user-name">-</span>
                        </div>
                        </div>
                        
                        <!-- GÉNÉRATION AUTOMATIQUE DES MENUS -->
                        <%= AuthHelper.RenderMenuHTML() %>
                    </div>
                </aside>

                <!-- ═══ CONTROL SIDEBAR ═══ -->
                <%= AuthHelper.RenderControlSidebarHTML() %>

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
                                <span class="dash-card-title"><i class="fas fa-layer-group"></i> Liste des
                                    niveaux</span>
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
                                <div
                                    style="overflow-x: auto; width: 100%; border: 1px solid #dee2e6; border-radius: 8px;">
                                    <table class="dash-table"
                                        style="table-layout: fixed; width: 1200px; min-width: 100%; border-collapse: collapse;">
                                        <thead>
                                            <tr style="background-color: #f8f9fa; text-align: center;">
                                                <th style="width: 20px;">#</th>
                                                <th style="width: 120px;">Nom du niveau</th>
                                                <th style="width: 120px;">Ordre</th>
                                                <th style="width: 120px;">Statut</th>
                                                <th style="width: 120px;">Créé le</th>
                                                <th style="width: 120px;">Actions</th>
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
                        <button type="button" class="btn-close-modal" onclick="closeAddNiveauModal()"
                            aria-label="Fermer">&times;</button>
                    </div>
                    <div class="modal-body">
                        <input type="hidden" id="niveauEditId">
                        <div class="form-group">
                            <label for="niveauNom">Nom du niveau *</label>
                            <input type="text" id="niveauNom" class="form-control" placeholder="Ex : 6ème, Terminale…"
                                maxlength="50">
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
            <script src="js/niveaux.js?v=<%=AuthHelper.Version %>"></script>
            <script src="../../_assets/js/sweetalert2.all.min.js?v=<%=AuthHelper.Version %>"></script>
            <script src="../../_assets/js/global.js?v=<%=AuthHelper.Version %>"></script>

        </form>
    </body>

    </html>