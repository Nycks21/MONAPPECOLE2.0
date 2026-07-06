﻿<%@ Page Language="C#" AutoEventWireup="true" CodeFile="frais.cs" Inherits="frais" %>
    <!DOCTYPE html>
    <html lang="fr">

    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Frais scolaires — Gestion Scolaire</title>

        <link rel="stylesheet" href="../../_assets/css/all.min.css?v=<%=AuthHelper.Version %>">
        <link rel="stylesheet" href="../../_assets/css/fontawesome.css?v=<%=AuthHelper.Version %>">
        <link rel="stylesheet" href="../../_assets/css/fontawesome.min.css?v=<%=AuthHelper.Version %>">
        <link rel="stylesheet" href="../../_assets/css/global.css?v=<%=AuthHelper.Version %>">
        <link rel="stylesheet" href="css/style.css?v=<%=AuthHelper.Version %>">
        <style>
            /* Styles généraux */
            .frais-stats {
                display: flex;
                gap: 20px;
                margin-bottom: 20px;
                flex-wrap: wrap;
            }

            .stat-card {
                flex: 1;
                background: #f8f9fa;
                border-radius: 10px;
                padding: 15px;
                text-align: center;
                border: 1px solid #dee2e6;
            }

            .stat-icon {
                font-size: 24px;
                margin-bottom: 10px;
            }

            .stat-value {
                font-size: 28px;
                font-weight: bold;
                color: #007bff;
            }

            .stat-label {
                font-size: 12px;
                color: #6c757d;
                margin-top: 5px;
            }

            .frais-filters {
                display: flex;
                gap: 15px;
                margin-bottom: 20px;
                flex-wrap: wrap;
                align-items: center;
            }

            .search-box {
                position: relative;
                flex: 1;
                min-width: 200px;
            }

            .search-box i {
                position: absolute;
                left: 12px;
                top: 50%;
                transform: translateY(-50%);
                color: #6c757d;
            }

            .search-box input {
                padding-left: 35px;
            }

            .payment-detail {
                background: #e8f4fd;
                padding: 12px;
                border-radius: 8px;
                margin-bottom: 15px;
            }

            .payment-detail p {
                margin: 5px 0;
            }

            /* Styles des filtres */
            .frais-filters .form-control {
                border-radius: 8px;
                border: 1px solid #dee2e6;
                padding: 8px 12px;
                font-size: 14px;
                transition: all 0.2s;
            }

            .frais-filters .form-control:focus {
                border-color: #007bff;
                box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
                outline: none;
            }

            /* Styles des boutons d'action */
            .action-buttons .btn {
                border-radius: 8px;
                padding: 8px 16px;
                font-size: 13px;
                font-weight: 500;
                transition: all 0.2s;
                margin-left: 8px;
                border: none;
            }

            .action-buttons .btn-sm {
                padding: 6px 12px;
                font-size: 12px;
            }

            .action-buttons .btn-success {
                background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%);
                color: white;
            }

            .action-buttons .btn-success:hover {
                background: linear-gradient(135deg, #1e7e34 0%, #155d27 100%);
                transform: translateY(-1px);
                box-shadow: 0 4px 10px rgba(40, 167, 69, 0.3);
            }

            .action-buttons .btn-primary {
                background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
                color: white;
            }

            .action-buttons .btn-primary:hover {
                background: linear-gradient(135deg, #0056b3 0%, #004099 100%);
                transform: translateY(-1px);
                box-shadow: 0 4px 10px rgba(0, 123, 255, 0.3);
            }

            .action-buttons .btn-secondary {
                background: linear-gradient(135deg, #6c757d 0%, #545b62 100%);
                color: white;
            }

            .action-buttons .btn-secondary:hover {
                background: linear-gradient(135deg, #545b62 0%, #3e444a 100%);
                transform: translateY(-1px);
                box-shadow: 0 4px 10px rgba(108, 117, 125, 0.3);
            }

            /* Styles des boutons de pagination */
            #prevPageBtn,
            #nextPageBtn,
            #prevTarifPageBtn,
            #nextTarifPageBtn {
                border-radius: 8px;
                padding: 6px 14px;
                font-size: 13px;
                transition: all 0.2s;
                border: 1px solid #dee2e6;
                background: white;
                color: #007bff;
            }

            #prevPageBtn:hover:not(:disabled),
            #nextPageBtn:hover:not(:disabled),
            #prevTarifPageBtn:hover:not(:disabled),
            #nextTarifPageBtn:hover:not(:disabled) {
                background: #007bff;
                color: white;
                border-color: #007bff;
                transform: translateY(-1px);
            }

            #prevPageBtn:disabled,
            #nextPageBtn:disabled,
            #prevTarifPageBtn:disabled,
            #nextTarifPageBtn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

            /* Styles des selects de filtres */
            #fraisFilterStatut,
            #fraisFilterClasse,
            #tarifAnneeFilter,
            #tarifClasseFilter {
                border-radius: 8px;
                border: 1px solid #dee2e6;
                padding: 8px 12px;
                background-color: white;
                cursor: pointer;
                min-width: 160px;
            }

            #fraisFilterStatut:hover,
            #fraisFilterClasse:hover,
            #tarifAnneeFilter:hover,
            #tarifClasseFilter:hover {
                border-color: #007bff;
            }

            /* Styles de la search box */
            .search-box {
                position: relative;
                flex: 1;
                min-width: 250px;
            }

            .search-box i {
                position: absolute;
                left: 12px;
                top: 50%;
                transform: translateY(-50%);
                color: #6c757d;
                z-index: 1;
            }

            .search-box input {
                padding-left: 35px;
                border-radius: 8px;
                border: 1px solid #dee2e6;
                height: 38px;
                width: 100%;
            }

            .search-box input:focus {
                border-color: #007bff;
                outline: none;
                box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
            }

            /* Styles pour les badges */
            .badge-justified {
                background: #28a745;
                color: #fff;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 11px;
                font-weight: 600;
                display: inline-block;
                white-space: nowrap;
            }

            .badge-not-justified {
                background: #dc3545;
                color: #fff;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 11px;
                font-weight: 600;
                display: inline-block;
                white-space: nowrap;
            }

            /* Styles pour les boutons d'action dans l'historique */
            .btn-history-edit,
            .btn-history-delete {
                padding: 5px 10px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 12px;
                transition: all 0.2s;
            }

            .btn-history-edit {
                background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
                color: white;
            }

            .btn-history-edit:hover {
                background: linear-gradient(135deg, #0056b3 0%, #004099 100%);
                transform: scale(1.05);
            }

            .btn-history-delete {
                background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
                color: white;
            }

            .btn-history-delete:hover {
                background: linear-gradient(135deg, #c82333 0%, #a71d2a 100%);
                transform: scale(1.05);
            }

            /* Styles pour les onglets de frais */
            .frais-tab-container {
                display: flex;
                gap: 0;
                margin-bottom: 20px;
                border-bottom: 2px solid #dee2e6;
            }

            .frais-tab-btn {
                padding: 12px 24px;
                background: #f8f9fa;
                border: none;
                border-radius: 8px 8px 0 0;
                cursor: pointer;
                font-weight: 600;
                font-size: 14px;
                transition: all 0.2s;
                margin-right: 2px;
            }

            .frais-tab-btn.active {
                background: #007bff;
                color: white;
            }

            .frais-tab-btn:hover:not(.active) {
                background: #e9ecef;
            }

            .frais-tab-content {
                display: none;
            }

            .frais-tab-content.active {
                display: block;
            }

            /* Styles pour la gestion des tarifs */
            .tarif-card {
                background: #f8f9fa;
                border: 1px solid #dee2e6;
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 15px;
                transition: all 0.2s;
            }

            .tarif-card:hover {
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }

            /* Gestion des z-index pour modals */
            .modal {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                z-index: 9999;
                justify-content: center;
                align-items: center;
            }

            .modal-content {
                background-color: #fff;
                border-radius: 10px;
                box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
                max-width: 90%;
                max-height: 90%;
                overflow-y: auto;
                position: relative;
                z-index: 10000;
            }

            .swal2-container {
                z-index: 99999 !important;
            }

            .swal2-popup {
                z-index: 100000 !important;
            }

            #editHistoriqueModal {
                z-index: 999999 !important;
            }

            #editHistoriqueModal .modal-content {
                z-index: 999999 !important;
            }

            #paymentModal {
                z-index: 9999 !important;
            }

            #paymentModal .modal-content {
                z-index: 10000 !important;
            }

            #spinnerOverlay {
                z-index: 9998 !important;
            }
        </style>
    </head>

    <body class="hold-transition" data-version="<%=AuthHelper.Version %>">
        <form id="form1" runat="server">
            <div class="wrapper">

                <!-- TOPBAR -->
                <%= AuthHelper.RenderTopBarHTML() %>

                    <!-- SIDEBAR -->
                    <aside class="main-sidebar" id="sidebar">
                        <a href="#" class="brand-link" onclick="loadDashboard()">
                            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='33' height='33' viewBox='0 0 33 33'%3E%3Ccircle cx='16.5' cy='16.5' r='16.5' fill='%23007bff'/%3E%3Ctext x='16.5' y='22' font-size='16' font-weight='bold' text-anchor='middle' fill='white'%3EGS%3C/text%3E%3C/svg%3E"
                                alt="Logo" class="brand-image">
                            <span class="brand-text">Gestion Scolaire</span>
                        </a>
                        <div class="sidebar">
                            <div class="user-profile-nav">
                                <div class="user-avatar"><i class="fas fa-user-tie"></i><span
                                        class="status-indicator"></span></div>
                                <div class="user-info">
                                    <span id="profilUsername" class="user-role">Profile :</span>
                                    <span id="navbarUsername" class="user-name">-</span>
                                </div>
                            </div>
                            <%= AuthHelper.RenderMenuHTML() %>
                        </div>
                    </aside>

                    <!-- ═══ CONTROL SIDEBAR ═══ -->
                    <%= AuthHelper.RenderControlSidebarHTML() %>

                        <!-- CONTENT WRAPPER -->
                        <div class="content-wrapper" id="contentWrapper">
                            <div class="content-header">
                                <div class="container-fluid">
                                    <div class="row">
                                        <div class="col-lg-6">
                                            <h1 id="dynPageTitle">Frais scolaires</h1>
                                        </div>
                                        <div class="col-lg-6">
                                            <ol class="breadcrumb" style="float: right;">
                                                <li class="breadcrumb-item">Modules</li>
                                                <li class="breadcrumb-item active">Frais scolaires</li>
                                            </ol>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <section class="content" id="section-frais">
                                <!-- Onglets -->
                                <div class="frais-tab-container">
                                    <button type="button" class="frais-tab-btn active"
                                        onclick="switchFraisTab('paiements')">💰
                                        Paiements</button>
                                    <button type="button" class="frais-tab-btn" onclick="switchFraisTab('tarifs')">📋
                                        Tarifs
                                        écolage</button>
                                </div>

                                <!-- SECTION PAIEMENTS -->
                                <div id="frais-tab-paiements" class="frais-tab-content active">
                                    <div class="dash-card">
                                        <div class="dash-card-head">
                                            <span class="dash-card-title"><i class="fas fa-money-bill-wave"></i> Gestion
                                                des
                                                paiements</span>
                                            <div class="action-buttons">
                                                <button type="button" class="btn btn-success btn-sm"
                                                    onclick="openAddPaymentModal()"><i class="fas fa-plus"></i>
                                                    Enregistrer un
                                                    paiement</button>
                                                <button type="button" class="btn btn-info btn-sm"
                                                    onclick="updateAllFrais()"><i class="fas fa-database"></i> Mettre à
                                                    jour les frais</button>
                                                <button type="button" class="btn btn-warning btn-sm"
                                                    onclick="recalculerFrais()"><i class="fas fa-sync-alt"></i>
                                                    Recalculer
                                                    frais</button>
                                                <button type="button" class="btn btn-primary btn-sm"
                                                    onclick="exportFraisToExcel()"><i class="fas fa-download"></i>
                                                    Exporter</button>
                                                <button type="button" class="btn btn-secondary btn-sm"
                                                    onclick="printFraisReport()"><i class="fas fa-print"></i>
                                                    Imprimer</button>
                                            </div>
                                        </div>

                                        <div class="dash-card-body">
                                            <!-- Stats -->
                                            <div class="frais-stats" id="fraisStatsContainer">
                                                <div class="stat-card">
                                                    <div class="stat-icon">💰</div>
                                                    <div class="stat-value" id="statTotalFrais">—</div>
                                                    <div class="stat-label">Total attendu</div>
                                                </div>
                                                <div class="stat-card">
                                                    <div class="stat-icon" style="color:#28a745">✅</div>
                                                    <div class="stat-value" id="statTotalPaye" style="color:#28a745">—
                                                    </div>
                                                    <div class="stat-label">Total payé</div>
                                                </div>
                                                <div class="stat-card">
                                                    <div class="stat-icon" style="color:#dc3545">⚠️</div>
                                                    <div class="stat-value" id="statTotalReste" style="color:#dc3545">—
                                                    </div>
                                                    <div class="stat-label">Total impayé</div>
                                                </div>
                                                <div class="stat-card">
                                                    <div class="stat-icon">📊</div>
                                                    <div class="stat-value" id="statTauxRecouvrement">—</div>
                                                    <div class="stat-label">Taux recouvrement</div>
                                                </div>
                                            </div>
                                            <div id="frais-filter-container"></div>
                                            <!-- Tableau -->
                                            <div
                                                style="overflow-x: auto; width: 100%; border: 1px solid #dee2e6; border-radius: 8px;">
                                                <table class="dash-table"
                                                    style="min-width: 1000px; width: 100%; border-collapse: collapse;">
                                                    <thead>
                                                        <tr style="background-color: #f8f9fa;">
                                                            <th style="cursor: pointer;text-align: left;width: 80px;"
                                                                onclick="sortBy('MATRICULE')">Matricule
                                                                <i class="fas fa-sort"></i>
                                                            </th>
                                                            <th style="cursor: pointer;text-align: left;width: 200px;"
                                                                onclick="sortBy('NOM')">Nom <i class="fas fa-sort"></i>
                                                            </th>
                                                            <th style="cursor: pointer;text-align: left;width: 70px;"
                                                                onclick="sortBy('CLASSE_NOM')">Classe
                                                                <i class="fas fa-sort"></i>
                                                            </th>
                                                            <th style="cursor: pointer;text-align: right;width: 100px;"
                                                                onclick="sortBy('TOTAL')">Total <i
                                                                    class="fas fa-sort"></i></th>
                                                            <th style="cursor: pointer;text-align: right;width: 100px;"
                                                                onclick="sortBy('PAYE')">Payé <i
                                                                    class="fas fa-sort"></i></th>
                                                            <th style="cursor: pointer;text-align: right;width: 100px;"
                                                                onclick="sortBy('RESTE')">Reste <i
                                                                    class="fas fa-sort"></i></th>
                                                            <th style="width: 150px;">Progression</th>
                                                            <th style="cursor: pointer;text-align: left;width: 70px;"
                                                                onclick="sortBy('STATUT')">Statut <i
                                                                    class="fas fa-sort"></i></th>
                                                            <th style="cursor: pointer;text-align: left;width: 80px;">
                                                                Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody id="fraisTableBody"></tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- SECTION TARIFS -->
                                <div id="frais-tab-tarifs" class="frais-tab-content">
                                    <div class="dash-card">
                                        <div class="dash-card-head">
                                            <span class="dash-card-title"><i class="fas fa-tags"></i> Tarifs d'écolage
                                                par
                                                classe</span>
                                            <div class="action-buttons">
                                                <button type="button" class="btn btn-success btn-sm"
                                                    onclick="openTarifModal()">
                                                    <i class="fas fa-plus"></i> Ajouter un tarif
                                                </button>
                                            </div>
                                        </div>
                                        <div class="dash-card-body">
                                            <!-- Filtres -->
                                            <div class="frais-filters">
                                                <select class="form-control" id="tarifAnneeFilter"
                                                    style="max-width:200px;">
                                                    <option value="">Toutes les années</option>
                                                </select>
                                                <select class="form-control" id="tarifClasseFilter"
                                                    style="max-width:200px;">
                                                    <option value="">Toutes les classes</option>
                                                </select>
                                                <button type="button" class="btn btn-secondary btn-sm"
                                                    onclick="filterTarifs()"><i class="fas fa-filter"></i>
                                                    Filtrer</button>
                                                <button type="button" class="btn btn-secondary btn-sm"
                                                    onclick="resetTarifFilters()"><i class="fas fa-undo-alt"></i>
                                                    Réinitialiser</button>
                                            </div>

                                            <!-- Tableau des tarifs -->
                                            <div
                                                style="overflow-x: auto; width: 100%; border: 1px solid #dee2e6; border-radius: 8px;">
                                                <table class="dash-table"
                                                    style="min-width: 600px; width: 100%; border-collapse: collapse;">
                                                    <thead>
                                                        <tr style="background-color: #f8f9fa; text-align: center;">
                                                            <th>Année scolaire</th>
                                                            <th>Classe</th>
                                                            <th>Montant (MGA)</th>
                                                            <th>Description</th>
                                                            <th>Statut</th>
                                                            <th>Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody id="tarifsTableBody"></tbody>
                                                </table>
                                            </div>

                                            <!-- Pagination -->
                                            <div
                                                style="display:flex;justify-content:space-between;align-items:center;margin-top:15px;flex-wrap:wrap;gap:10px;">
                                                <span id="tarifsPaginationInfo"
                                                    style="color:#6c757d;font-size:13px;"></span>
                                                <div class="action-buttons">
                                                    <button type="button" class="btn btn-sm btn-secondary"
                                                        id="prevTarifPageBtn" disabled><i
                                                            class="fas fa-chevron-left"></i> Précédent</button>
                                                    <button type="button" class="btn btn-sm btn-secondary"
                                                        id="nextTarifPageBtn">Suivant <i
                                                            class="fas fa-chevron-right"></i></button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>

                        <div id="spinnerOverlay">
                            <div class="spinner"></div>
                        </div>
            </div>

            <!-- MODAL PAIEMENT -->
            <div id="paymentModal" class="modal">
                <div class="modal-content" style="max-width:500px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-money-bill-wave"></i> Enregistrer un paiement</h3>
                        <button type="button" onclick="closePaymentModal()"
                            style="background:none; border:none; font-size:24px; cursor:pointer;">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label>Élève <span style="color: red;">*</span></label>
                            <select id="paymentStudent" class="form-control" onchange="updatePaymentInfo()">
                                <option value="">-- Sélectionner un élève --</option>
                            </select>
                        </div>
                        <div id="paymentInfo" class="payment-detail" style="display: none;">
                            <p><strong>Informations du compte :</strong></p>
                            <p>Montant total: <span id="infoTotal">0</span> MGA</p>
                            <p>Déjà payé: <span id="infoPaye">0</span> MGA</p>
                            <p>Reste à payer: <span id="infoReste" style="font-weight: bold;">0</span> MGA</p>
                        </div>
                        <div class="form-group">
                            <label>Montant du paiement (MGA) <span style="color: red;">*</span></label>
                            <input type="number" id="paymentAmount" class="form-control" placeholder="Saisir le montant"
                                step="1000" min="0">
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label>Ecolage mois de <span style="color: red;">*</span></label>
                                    <select id="paymentMonth" class="form-control" required>
                                        <option value="">-- Sélectionner le mois --</option>
                                        <option value="Janvier">Janvier</option>
                                        <option value="Février">Février</option>
                                        <option value="Mars">Mars</option>
                                        <option value="Avril">Avril</option>
                                        <option value="Mai">Mai</option>
                                        <option value="Juin">Juin</option>
                                        <option value="Juillet">Juillet</option>
                                        <option value="Aout">Aout</option>
                                        <option value="Septembre">Septembre</option>
                                        <option value="Octobre">Octobre</option>
                                        <option value="Novembre">Novembre</option>
                                        <option value="Décembre">Décembre</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label>Année <span style="color: red;">*</span></label>
                                    <input type="text" id="paymentYear" class="form-control" placeholder="Année"
                                        required>
                                </div>
                            </div>

                        </div>
                        <div class="form-group">
                            <label>Date du paiement <span style="color: red;">*</span></label>
                            <input type="date" id="paymentDate" class="form-control">
                        </div>
                        <div class="form-group">
                            <label>Mode de paiement <span style="color: red;">*</span></label>
                            <select id="paymentMethod" class="form-control" required>
                                <option value=""></option>
                                <option value="Especes">Espèces</option>
                                <option value="Cheque">Chèque</option>
                                <option value="Virement">Virement bancaire</option>
                                <option value="MobileMoney">Mobile Money</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Référence / Numéro de reçu</label>
                            <input type="text" id="paymentRef" class="form-control" placeholder="Optionnel">
                        </div>
                        <div class="form-group">
                            <label>Commentaire</label>
                            <textarea id="paymentComment" class="form-control" rows="2"
                                placeholder="Commentaire..."></textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" onclick="savePayment()"><i
                                class="fas fa-save"></i>
                            Enregistrer</button>
                        <button type="button" class="btn btn-danger" onclick="closePaymentModal()"><i
                                class="fas fa-times"></i> Annuler</button>
                    </div>
                </div>
            </div>

            <!-- MODAL MODIFIER HISTORIQUE PAIEMENT -->
            <div id="editHistoriqueModal" class="modal">
                <div class="modal-content" style="max-width:500px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-edit"></i> Modifier le paiement</h3>
                        <button type="button" onclick="closeEditHistoriqueModal()"
                            style="background:none; border:none; font-size:24px; cursor:pointer;">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label>Élève</label>
                            <input type="text" id="editStudentName" class="form-control" readonly
                                style="background:#e9ecef;">
                        </div>
                        <div class="form-group">
                            <label>Montant (MGA) <span style="color: red;">*</span></label>
                            <input type="number" id="editMontant" class="form-control" step="1000" min="0">
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label>Ecolage mois de <span style="color: red;">*</span></label>
                                    <select id="editPaymentMonth" class="form-control">
                                        <option value="">-- Sélectionner le mois --</option>
                                        <option value="Janvier">Janvier</option>
                                        <option value="Février">Février</option>
                                        <option value="Mars">Mars</option>
                                        <option value="Avril">Avril</option>
                                        <option value="Mai">Mai</option>
                                        <option value="Juin">Juin</option>
                                        <option value="Juillet">Juillet</option>
                                        <option value="Aout">Aout</option>
                                        <option value="Septembre">Septembre</option>
                                        <option value="Octobre">Octobre</option>
                                        <option value="Novembre">Novembre</option>
                                        <option value="Décembre">Décembre</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label>Année <span style="color: red;">*</span></label>
                                    <input type="text" id="editPaymentYear" class="form-control" placeholder="Année">
                                </div>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Date du paiement <span style="color: red;">*</span></label>
                            <input type="datetime-local" id="editDatePaiement" class="form-control">
                        </div>
                        <div class="form-group">
                            <label>Mode de paiement <span style="color: red;">*</span></label>
                            <select id="editModePaiement" class="form-control">
                                <option value="Especes">Espèces</option>
                                <option value="Cheque">Chèque</option>
                                <option value="Virement">Virement bancaire</option>
                                <option value="MobileMoney">Mobile Money</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Référence</label>
                            <input type="text" id="editReference" class="form-control" placeholder="Optionnel">
                        </div>
                        <div class="form-group">
                            <label>Commentaire</label>
                            <textarea id="editCommentaire" class="form-control" rows="2"
                                placeholder="Commentaire..."></textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" onclick="confirmEditHistorique()"><i
                                class="fas fa-save"></i> Enregistrer</button>
                        <button type="button" class="btn btn-danger" onclick="closeEditHistoriqueModal()"><i
                                class="fas fa-times"></i> Annuler</button>
                    </div>
                </div>
            </div>

            <!-- MODAL TARIF ECOLOGNE -->
            <div id="tarifModal" class="modal">
                <div class="modal-content" style="max-width:500px;">
                    <div class="modal-header">
                        <h3 id="tarifModalTitle"><i class="fas fa-plus-circle"></i> Ajouter un tarif</h3>
                        <button type="button" onclick="closeTarifModal()"
                            style="background:none; border:none; font-size:24px; cursor:pointer;">&times;</button>
                    </div>
                    <div class="modal-body">
                        <input type="hidden" id="tarifEditId">
                        <div class="form-group">
                            <label>Année scolaire *</label>
                            <select id="tarifAnnee" class="form-control">
                                <option value="">-- Sélectionner une année --</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Classe *</label>
                            <select id="tarifClasse" class="form-control">
                                <option value="">-- Sélectionner une classe --</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Montant (MGA) *</label>
                            <input type="number" id="tarifMontant" class="form-control" placeholder="Saisir le montant"
                                step="1000" min="0">
                        </div>
                        <div class="form-group">
                            <label>Description</label>
                            <textarea id="tarifDescription" class="form-control" rows="3"
                                placeholder="Description optionnelle..."></textarea>
                        </div>
                        <div class="form-group">
                            <label>Statut</label>
                            <select id="tarifStatut" class="form-control">
                                <option value="1">Actif</option>
                                <option value="0">Inactif</option>
                            </select>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" onclick="saveTarif()"><i class="fas fa-save"></i>
                            Enregistrer</button>
                        <button type="button" class="btn btn-danger" onclick="closeTarifModal()">Annuler</button>
                    </div>
                </div>
            </div>

            <script src="../../_assets/js/jquery-3.6.0.min.js?v=<%=AuthHelper.Version %>"></script>
            <script src="../../_assets/js/sweetalert2@11.js?v=<%=AuthHelper.Version %>"></script>
            <script src="../../_assets/js/global.js?v=<%=AuthHelper.Version %>"></script>
            <script src="js/frais.js?v=<%=AuthHelper.Version %>"></script>
        </form>
    </body>

    </html>