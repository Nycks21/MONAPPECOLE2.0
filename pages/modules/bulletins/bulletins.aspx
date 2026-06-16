<%@ Page Language="C#" AutoEventWireup="true" CodeFile="bulletins.cs" Inherits="bulletins" %>
    <!DOCTYPE html>
    <html lang="fr">

    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bulletins — Gestion Scolaire</title>

        <link rel="stylesheet" href="../../_assets/css/all.min.css?v=<%=AuthHelper.Version %>">
        <link rel="stylesheet" href="../../_assets/css/fontawesome.min.css?v=<%=AuthHelper.Version %>">
        <link rel="stylesheet" href="../../_assets/css/global.css?v=<%=AuthHelper.Version %>">
        <link rel="stylesheet" href="css/style.css?v=<%=AuthHelper.Version %>">
    </head>

    <body class="hold-transition" data-version="<%=AuthHelper.Version %>">
        <form id="form1" runat="server">

            <%-- ═══ HIDDEN FIELDS (doivent être dans <form runat=server>) ═══ --%>
                <asp:HiddenField ID="hfUserRole" runat="server" />
                <asp:HiddenField ID="hfUserName" runat="server" />
                <asp:HiddenField ID="hfProfesseurId" runat="server" />
                <asp:HiddenField ID="hfClassesAutorisees" runat="server" />
                <asp:HiddenField ID="hfMatieresAutorisees" runat="server" />

                <div class="wrapper">

                    <!-- ═══ TOPBAR ═══ -->
                    <%= AuthHelper.RenderTopBarHTML() %>

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

                        <!-- En-tête dynamique -->
                        <div class="content-header">
                            <div class="container-fluid">
                                <div class="row">
                                    <div class="col-lg-6">
                                        <h1 id="dynPageTitle">Saisie de Bulletin des Élèves</h1>
                                    </div>
                                    <div class="col-lg-6">
                                        <ol class="breadcrumb" style="float: right;">
                                            <li class="breadcrumb-item">Modules</li>
                                            <li class="breadcrumb-item active" id="dynBreadcrumb">Bulletins</li>
                                        </ol>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- ═══ SECTION SAISIE DES NOTES ═══ -->
                        <section class="content" id="section-bulletins">

                            <!-- BARRE DE FILTRES FILTRÉE PAR RÔLE -->
                            <!-- BARRE DE FILTRES -->
                            <div class="dash-card" style="margin-bottom:16px;">
                                <div class="dash-card-body" style="padding:14px 20px;">
                                    <div style="display:flex; align-items:flex-end; flex-wrap:wrap; gap:14px;">

                                        <div
                                            style="display:flex; flex-direction:column; gap:5px; min-width:180px; flex:1;">
                                            <label
                                                style="font-size:11px; font-weight:600; color:#6c757d;">Matière</label>
                                            <select id="ddlMatiere" class="form-control form-control-sm"
                                                style="height:36px;">
                                                <option value="">-- Sélectionner une matière --</option>
                                            </select>
                                        </div>

                                        <div
                                            style="display:flex; flex-direction:column; gap:5px; min-width:180px; flex:1;">
                                            <label
                                                style="font-size:11px; font-weight:600; color:#6c757d;">Classe</label>
                                            <select id="ddlClasse" class="form-control form-control-sm" disabled
                                                style="height:36px;">
                                                <option value="">-- Choisissez une matière d'abord --</option>
                                            </select>
                                        </div>

                                        <div style="display:flex; flex-direction:column; gap:5px; min-width:160px;">
                                            <label
                                                style="font-size:11px; font-weight:600; color:#6c757d;">Période</label>
                                            <select id="ddlPeriode" class="form-control form-control-sm"
                                                style="height:36px;">
                                                <option value="">-- Sélectionner --</option>
                                                <option value="T1">Trimestre 1</option>
                                                <option value="T2">Trimestre 2</option>
                                                <option value="T3">Trimestre 3</option>
                                            </select>
                                        </div>

                                        <button class="btn btn-primary btn-sm" id="btnAfficherListe"
                                            style="height:36px; padding:0 18px;">
                                            <i class="fas fa-list"></i> Afficher la liste
                                        </button>

                                    </div>

                                    <!-- LIGNE DES COEFFICIENTS GLOBAUX (visible seulement après affichage) -->
                                    <div id="coeffGlobalPanel"
                                        style="display:none; margin-top:15px; padding-top:12px; border-top:1px solid #dee2e6;">
                                        <div style="display:flex; align-items:center; gap:20px; flex-wrap:wrap;">
                                            <span style="font-size:12px; font-weight:600; color:#495057;">
                                                <i class="fas fa-sliders-h"></i> Coefficients globaux :
                                            </span>
                                            <div class="coeff-global-group">
                                                <label class="coeff-global-label">Note 1 :</label>
                                                <input type="number" id="globalCoeff1"
                                                    class="form-control form-control-sm coeff-global-input" value="1"
                                                    step="1" min="0" max="10" style="width:80px;">
                                            </div>
                                            <div class="coeff-global-group">
                                                <label class="coeff-global-label">Note 2 :</label>
                                                <input type="number" id="globalCoeff2"
                                                    class="form-control form-control-sm coeff-global-input" value="1"
                                                    step="1" min="0" max="10" style="width:80px;">
                                            </div>
                                            <div class="coeff-global-group">
                                                <label class="coeff-global-label">Examen :</label>
                                                <input type="number" id="globalCoeffProjet"
                                                    class="form-control form-control-sm coeff-global-input" value="2"
                                                    step="1" min="0" max="10" style="width:80px;">
                                            </div>
                                            <button type="button" id="btnAppliquerCoeffs"
                                                class="btn btn-sm btn-outline-primary">
                                                <i class="fas fa-check"></i> Appliquer à tous
                                            </button>
                                            <span id="coeffMessage" style="font-size:11px; color:#6c757d;"></span>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            <!-- ÉTAT VIDE -->
                            <div id="emptyState"
                                style="text-align:center; padding:60px 20px; color:#6c757d; background:#fff; border:1px dashed #dee2e6; border-radius:8px;">
                                <i class="fas fa-file-alt"
                                    style="font-size:48px; margin-bottom:14px; display:block; color:#ced4da;"></i>
                                <p>Veuillez sélectionner une <strong>classe</strong>, une <strong>matière</strong> et
                                    une <strong>période</strong> puis cliquer sur <strong>Afficher la liste</strong>.
                                </p>
                            </div>

                            <!-- TABLEAU DE SAISIE DES NOTES -->
                            <div id="tableWrapper" class="dash-card" style="display:none;">
                                <div class="dash-card-head">
                                    <span class="dash-card-title">
                                        <span id="tableInfoLabel">Saisie des notes</span>
                                    </span>
                                    <span id="countBadge"
                                        style="background:#e8f4fd; color:#1565c0; font-size:12px; font-weight:600; padding:3px 12px; border-radius:20px; margin-left:10px;"></span>
                                </div>

                                <div class="dash-card-body" style="padding:0;">
                                    <div style="overflow-x:auto;">
                                        <table class="dash-table" id="notesTable"
                                            style="table-layout:fixed; width:100%; min-width:900px; border-collapse:collapse;">
                                            <thead>
                                                <tr style="background:#f8f9fa; text-align:center;">
                                                    <th style="width:180px; text-align:left; padding:10px 14px;">ID /
                                                        Nom</th>
                                                    <th style="width:120px;">
                                                        Note 1<br>
                                                        <span id="dateEval1"
                                                            style="font-size:10px; font-weight:400; color:#aaa;"></span>
                                                    </th>
                                                    <th style="width:120px;">
                                                        Note 2<br>
                                                        <span id="dateEval2"
                                                            style="font-size:10px; font-weight:400; color:#aaa;"></span>
                                                    </th>
                                                    <th style="width:120px;">
                                                        Examen<br>
                                                        <span id="dateEvalP"
                                                            style="font-size:10px; font-weight:400; color:#aaa;"></span>
                                                    </th>
                                                    <th style="width:120px;">Moyenne Période</th>
                                                    <th style="min-width:200px;">Appréciation Générale</th>
                                                    <th style="width:110px;">Statut</th>
                                                </tr>
                                            </thead>
                                            <tbody id="notesTableBody"></tbody>
                                        </table>
                                    </div>
                                </div>

                                <!-- BOUTONS D'ACTION -->
                                <div
                                    style="display:flex; justify-content:flex-end; gap:10px; padding:14px 20px; border-top:1px solid #f0f0f0; background:#fafafa; border-radius:0 0 8px 8px;">
                                    <button class="btn btn-primary btn-sm" id="btnSauvegarder" onclick="sauvegarder()">
                                        <i class="fas fa-save"></i> Sauvegarder
                                    </button>
                                    <button class="btn btn-success btn-sm" id="btnValider"
                                        onclick="validerDefinitivement()">
                                        <i class="fas fa-check-double"></i> Valider Définitivement
                                    </button>
                                    <button class="btn btn-secondary btn-sm" id="btnExporter" onclick="exporter()">
                                        <i class="fas fa-download"></i> Exporter
                                    </button>
                                </div>
                            </div>

                        </section>

                    </div><!-- /.content-wrapper -->

                    <!-- ═══ SPINNER ═══ -->
                    <div id="spinnerOverlay">
                        <div class="spinner"></div>
                    </div>

                </div><!-- /.wrapper -->

                <!-- ═══ MODAL CONFIRMATION ═══ -->
                <div id="bulletinModal" class="modal">
                    <div class="modal-content" style="max-width:420px;">
                        <div class="modal-header">
                            <h3 id="modalTitle">Confirmation</h3>
                            <button onclick="closeModal('bulletinModal')"
                                style="background:none; border:none; font-size:24px; cursor:pointer;">&times;</button>
                        </div>
                        <div class="modal-body">
                            <p id="modalMessage" style="color:#555; line-height:1.6;"></p>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-danger" id="btnConfirm">Confirmer</button>
                            <button class="btn btn-secondary" onclick="closeModal('bulletinModal')">Annuler</button>
                        </div>
                    </div>
                </div>

                <!-- ═══ TOAST ═══ -->
                <div id="toastContainer"
                    style="position:fixed; bottom:24px; right:24px; display:flex; flex-direction:column; gap:10px; z-index:9999;">
                </div>

                <!-- ═══ SCRIPTS ═══ -->
                <script src="js/bulletins.js?v=<%=AuthHelper.Version %>"></script>
                <script src="../../_assets/js/global.js?v=<%=AuthHelper.Version %>"></script>

        </form>
    </body>

    </html>