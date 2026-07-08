<%@ Page Language="C#" AutoEventWireup="true" CodeFile="annee.cs" Inherits="annee" %>
    <!DOCTYPE html>
    <html lang="fr">

    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Année — Gestion Scolaire</title>

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
                <%= AuthHelper.RenderTopBarHTML() %>

                <!-- ═══ SIDEBAR ═══ -->
                <aside class="main-sidebar" id="sidebar">
                    <a href="#" class="brand-link">
                        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='33' height='33' viewBox='0 0 33 33'%3E%3Ccircle cx='16.5' cy='16.5' r='16.5' fill='%23007bff'/%3E%3Ctext x='16.5' y='22' font-size='16' font-weight='bold' text-anchor='middle' fill='white'%3EGS%3C/text%3E%3C/svg%3E"
                            alt="Logo" class="brand-image">
                        <span class="brand-text">Gestion Scolaire</span>
                    </a>

                    <div class="sidebar">
                        <!-- GÉNÉRATION AUTOMATIQUE DES MENUS -->
                        <%= AuthHelper.RenderMenuHTML() %>
                    </div>
                </aside>

                <!-- ═══ CONTROL SIDEBAR ═══ -->
                <%= AuthHelper.RenderControlSidebarHTML() %>

                <!-- ═══ CONTENT WRAPPER ═══ -->
                <div class="content-wrapper" id="contentWrapper">

                    <!-- En-tête dynamique -->
                    <div class="content-header">
                        <div class="container-fluid">
                            <div class="row">
                                <div class="col-lg-6">
                                    <h1 id="dynPageTitle">Année</h1>
                                </div>
                                <div class="col-lg-6">
                                    <ol class="breadcrumb" style="float: right;">
                                        <li class="breadcrumb-item">Paramètres</li>
                                        <li class="breadcrumb-item active" id="dynBreadcrumb">Année</li>
                                    </ol>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- ═══════════════════════════════════════════════════════════
                    pages/utilisateur.html  —  Section Gestion des utilisateurs
                    ═══════════════════════════════════════════════════════════ -->
                    <section class="content" id="section-annee">

                        <div class="dash-card">
                            <div class="dash-card-head">
                                <span class="dash-card-title"><i class="fas fa-users-cog"></i> Paramétrages des
                                    années</span>
                                <div class="action-buttons">
                                    <button class="btn btn-success btn-sm" onclick="openAddAnneeModal()">
                                        <i class="fas fa-plus"></i> Ajouter
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
                                                <th style="width: 20px;">Annee</th>
                                                <th style="width: 120px;">Date début</th>
                                                <th style="width: 120px;">Date fin</th>
                                                <th style="width: 100px;">Cloture</th>
                                                <th style="width: 120px;">Date Cloture</th>
                                                <th style="width: 120px;">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody id="anneeTableBody"></tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            <!-- MODAL UTILISATEUR -->
            <div id="addAnneeModal" class="modal">
                <div class="modal-content" style="max-width:550px;">
                    <div class="modal-header">
                        <h3 id="anneeModalTitle"><i class="fas fa-user-plus"></i> Ajouter année</h3>
                    </div>
                    <div class="modal-body">
                        <input type="hidden" id="anneeEditEmail">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label>Année scolaire *</label>
                                    <input type="text" id="annee" class="form-control" placeholder="Année scolaire">
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label>Date début *</label>
                                    <input type="date" id="DateD" class="form-control" placeholder="Date début">
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label>Date fin *</label>
                                    <input type="date" id="DateF" class="form-control" placeholder="Date fin">
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label>Cloture *</label>
                                    <select id="anneeStatut" class="form-control">
                                        <option value="Actif">Actif</option>
                                        <option value="Inactif">Inactif</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-primary" onclick="saveAnnee()"><i class="fas fa-save"></i>
                            Enregistrer</button>
                        <button class="btn btn-danger" onclick="closeAddAnneeModal()">Annuler</button>
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
            <script src="js/annee.js?v=<%=AuthHelper.Version %>"></script>
            <div id="toastContainer"></div>
        </form>
    </body>

    </html>