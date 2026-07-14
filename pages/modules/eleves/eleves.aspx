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
                <%= AuthHelper.RenderTopBarHTML() %>

                    <!-- ═══ SIDEBAR ═══ -->
                    <aside class="main-sidebar" id="sidebar">
                        <a href="#" class="brand-link" onclick="loadDashboard()">
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
                                            <h1 id="dynPageTitle"><i class="fas fa-users" style="color:#007bff;"></i> Eleves</h1>
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
                                            <button type="button" class="btn btn-info"
                                                onclick="showInitialFilterModal()">
                                                <i class="fas fa-search"></i> Rechercher
                                            </button>
                                            <button class="btn btn-success btn-sm" onclick="openAddEleveModal(event)"
                                                data-i18n="common.ajouter">
                                                <i class="fas fa-plus"></i> Ajouter
                                            </button>
                                            <button class="btn btn-primary btn-sm" onclick="exportEleves()">
                                                <i class="fas fa-download"></i> Imprimer
                                            </button>
                                            <button class="btn btn-outline-success btn-sm"
                                                onclick="exportElevesToExcelOnly()">
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
                                                        <th onclick="sortData('MATRICULE')"
                                                            style="cursor:pointer; width: 100px;">MATRICULE <i
                                                                class="fas fa-sort ml-1"></i></th>
                                                        <th onclick="sortData('ANNEE_TEXTE')"
                                                            style="cursor:pointer; width: 80px;">ANNÉE <i
                                                                class="fas fa-sort ml-1"></i></th>
                                                        <th onclick="sortData('NOM')"
                                                            style="cursor:pointer; width: 150px;">NOM <i
                                                                class="fas fa-sort ml-1"></i></th>
                                                        <th onclick="sortData('CLASSE_NOM')"
                                                            style="cursor:pointer; width: 120px;">CLASSE <i
                                                                class="fas fa-sort ml-1"></i></th>
                                                        <th onclick="sortData('EMAIL')"
                                                            style="cursor:pointer; width: 150px;">EMAIL <i
                                                                class="fas fa-sort ml-1"></i></th>
                                                        <th onclick="sortData('TELEPHONE')"
                                                            style="cursor:pointer; width: 100px;">TÉLÉPHONE <i
                                                                class="fas fa-sort ml-1"></i></th>
                                                        <th onclick="sortData('STATUT')"
                                                            style="cursor:pointer; width: 80px;">STATUT <i
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
                <script src="js/config.js?v=<%=AuthHelper.Version %>"></script>
                <script src="js/state.js?v=<%=AuthHelper.Version %>"></script>
                <script src="js/utils.js?v=<%=AuthHelper.Version %>"></script>
                <script src="js/ui.js?v=<%=AuthHelper.Version %>"></script>
                <script src="js/loaders.js?v=<%=AuthHelper.Version %>"></script>
                <script src="js/crud.js?v=<%=AuthHelper.Version %>"></script>
                <script src="js/export.js?v=<%=AuthHelper.Version %>"></script>
                <script src="js/init.js?v=<%=AuthHelper.Version %>"></script>
                <div id="toastContainer"></div>
        </form>
    </body>

    </html>