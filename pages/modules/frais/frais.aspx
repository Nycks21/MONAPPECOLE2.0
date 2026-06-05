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
        /* =====================================================
   STYLES DES FILTRES ET BOUTONS
   ===================================================== */
.frais-filters {
    display: flex;
    gap: 15px;
    margin-bottom: 20px;
    flex-wrap: wrap;
    align-items: center;
}

.frais-filters .form-control {
    border-radius: 8px;
    border: 1px solid #dee2e6;
    padding: 8px 12px;
    font-size: 14px;
    transition: all 0.2s;
}

.frais-filters .form-control:focus {
    border-color: #007bff;
    box-shadow: 0 0 0 0.2rem rgba(0,123,255,0.25);
    outline: none;
}

/* Style des boutons d'action */
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
    box-shadow: 0 4px 10px rgba(40,167,69,0.3);
}

.action-buttons .btn-primary {
    background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
    color: white;
}

.action-buttons .btn-primary:hover {
    background: linear-gradient(135deg, #0056b3 0%, #004099 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 10px rgba(0,123,255,0.3);
}

.action-buttons .btn-secondary {
    background: linear-gradient(135deg, #6c757d 0%, #545b62 100%);
    color: white;
}

.action-buttons .btn-secondary:hover {
    background: linear-gradient(135deg, #545b62 0%, #3e444a 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 10px rgba(108,117,125,0.3);
}

/* Style des boutons de pagination */
#prevPageBtn, #nextPageBtn {
    border-radius: 8px;
    padding: 6px 14px;
    font-size: 13px;
    transition: all 0.2s;
    border: 1px solid #dee2e6;
    background: white;
    color: #007bff;
}

#prevPageBtn:hover:not(:disabled), 
#nextPageBtn:hover:not(:disabled) {
    background: #007bff;
    color: white;
    border-color: #007bff;
    transform: translateY(-1px);
}

#prevPageBtn:disabled, 
#nextPageBtn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Style du select de filtres */
#fraisFilterStatut, #fraisFilterClasse {
    border-radius: 8px;
    border: 1px solid #dee2e6;
    padding: 8px 12px;
    background-color: white;
    cursor: pointer;
    min-width: 160px;
}

#fraisFilterStatut:hover, #fraisFilterClasse:hover {
    border-color: #007bff;
}

/* Style de la search box */
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
    box-shadow: 0 0 0 0.2rem rgba(0,123,255,0.25);
}
    </style>
</head>

<body class="hold-transition" data-version="<%=AuthHelper.Version %>">
    <form id="form1" runat="server">
        <div class="wrapper">

            <!-- TOPBAR -->
            <nav class="main-header">
                <ul class="navbar-nav">
                    <li class="nav-item">
                        <a class="nav-link" id="menuToggle" role="button"><i class="fas fa-bars"></i></a>
                    </li>
                </ul>
                <ul class="navbar-nav">
                    <li class="nav-item">
                        <a class="nav-link" id="notifToggle" title="Notifications"><i class="fas fa-bell"></i><span class="badge-notif" id="badgeNotif">3</span></a>
                        <div class="dropdown-menu" id="notifDropdown">
                            <span class="dropdown-header">3 notifications</span>
                            <div class="dropdown-divider"></div>
                            <a href="#" class="dropdown-item"><i class="fas fa-user-plus text-success mr-2"></i> Nouvel élève inscrit<span style="float: right; color: #6c757d; font-size: 11px;">Il y a 23 min</span></a>
                            <a href="#" class="dropdown-item"><i class="fas fa-exclamation-circle text-danger mr-2"></i> Absence signalée<span style="float: right; color: #6c757d; font-size: 11px;">Il y a 1h</span></a>
                            <a href="#" class="dropdown-item"><i class="fas fa-money-bill text-warning mr-2"></i> Paiement reçu<span style="float: right; color: #6c757d; font-size: 11px;">Il y a 2h</span></a>
                        </div>
                    </li>
                    <li class="nav-item"><a href="../../../auth/Logout.aspx" class="nav-link" title="Se déconnecter"><i class="fas fa-sign-out-alt"></i></a></li>
                    <li class="nav-item"><a class="nav-link" id="fullscreenToggle" title="Plein écran"><i class="fas fa-expand-arrows-alt"></i></a></li>
                </ul>
            </nav>

            <!-- SIDEBAR -->
            <aside class="main-sidebar" id="sidebar">
                <a href="#" class="brand-link" onclick="loadDashboard()">
                    <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='33' height='33' viewBox='0 0 33 33'%3E%3Ccircle cx='16.5' cy='16.5' r='16.5' fill='%23007bff'/%3E%3Ctext x='16.5' y='22' font-size='16' font-weight='bold' text-anchor='middle' fill='white'%3EGS%3C/text%3E%3C/svg%3E" alt="Logo" class="brand-image">
                    <span class="brand-text">Gestion Scolaire</span>
                </a>
                <div class="sidebar">
                    <div class="user-profile-nav">
                        <div class="user-avatar"><i class="fas fa-user-tie"></i><span class="status-indicator"></span></div>
                        <div class="user-info">
                            <span id="profilUsername" class="user-role">Profile :</span>
                            <span id="navbarUsername" class="user-name">-</span>
                        </div>
                    </div>
                    <%= AuthHelper.RenderMenuHTML() %>
                </div>
            </aside>

            <!-- CONTENT WRAPPER -->
            <div class="content-wrapper" id="contentWrapper">
                <div class="content-header">
                    <div class="container-fluid">
                        <div class="row">
                            <div class="col-lg-6"><h1 id="dynPageTitle">Frais scolaires</h1></div>
                            <div class="col-lg-6"><ol class="breadcrumb" style="float: right;"><li class="breadcrumb-item">Modules</li><li class="breadcrumb-item active">Frais scolaires</li></ol></div>
                        </div>
                    </div>
                </div>

                <section class="content" id="section-frais">
                    <div class="dash-card">
                        <div class="dash-card-head">
                            <span class="dash-card-title"><i class="fas fa-money-bill-wave"></i> Frais scolaires</span>
                            <div class="action-buttons">
                                <button type="button" class="btn btn-success btn-sm" onclick="openAddPaymentModal()"><i class="fas fa-plus"></i> Enregistrer un paiement</button>
                                <button type="button" class="btn btn-primary btn-sm" onclick="exportFraisToExcel()"><i class="fas fa-download"></i> Exporter</button>
                                <button type="button" class="btn btn-secondary btn-sm" onclick="printFraisReport()"><i class="fas fa-print"></i> Imprimer</button>
                            </div>
                        </div>

                        <div class="dash-card-body">
                            <!-- Stats -->
                            <div class="frais-stats" id="fraisStatsContainer">
                                <div class="stat-card"><div class="stat-icon">💰</div><div class="stat-value" id="statTotalFrais">—</div><div class="stat-label">Total attendu</div></div>
                                <div class="stat-card"><div class="stat-icon" style="color:#28a745">✅</div><div class="stat-value" id="statTotalPaye" style="color:#28a745">—</div><div class="stat-label">Total payé</div></div>
                                <div class="stat-card"><div class="stat-icon" style="color:#dc3545">⚠️</div><div class="stat-value" id="statTotalReste" style="color:#dc3545">—</div><div class="stat-label">Total impayé</div></div>
                                <div class="stat-card"><div class="stat-icon">📊</div><div class="stat-value" id="statTauxRecouvrement">—</div><div class="stat-label">Taux recouvrement</div></div>
                            </div>

                            <!-- Filtres -->
                            <div class="frais-filters">
                                <select class="form-control" id="fraisFilterStatut" style="max-width:160px; border-style:1px;">
                                    <option value="">Tous les statuts</option>
                                    <option value="Terminé">Terminé</option>
                                    <option value="En cours">En cours</option>
                                    <option value="Non payé">Non payé</option>
                                </select>
                                <select class="form-control" id="fraisFilterClasse" style="max-width:160px;">
                                    <option value="">Toutes les classes</option>
                                </select>
                                <div class="search-box">
                                    
                                    <input type="text" class="form-control" id="fraisSearch" placeholder="Rechercher élève, matricule...">
                                </div>
                                <button type="button" class="btn btn-secondary btn-sm" onclick="resetFilters()"><i class="fas fa-undo-alt"></i> Réinitialiser</button>
                            </div>

                            <!-- Tableau -->
                            <div style="overflow-x: auto; width: 100%; border: 1px solid #dee2e6; border-radius: 8px;">
                                <table class="dash-table" style="min-width: 1000px; width: 100%; border-collapse: collapse;">
                                    <thead>
                                        <tr style="background-color: #f8f9fa; text-align: center;">
                                            <th style="cursor: pointer;" onclick="sortBy('MATRICULE')">Matricule <i class="fas fa-sort"></i></th>
                                            <th style="cursor: pointer;" onclick="sortBy('NOM')">Nom <i class="fas fa-sort"></i></th>
                                            <th style="cursor: pointer;" onclick="sortBy('CLASSE_NOM')">Classe <i class="fas fa-sort"></i></th>
                                            <th style="cursor: pointer;" onclick="sortBy('TOTAL')">Total <i class="fas fa-sort"></i></th>
                                            <th style="cursor: pointer;" onclick="sortBy('PAYE')">Payé <i class="fas fa-sort"></i></th>
                                            <th style="cursor: pointer;" onclick="sortBy('RESTE')">Reste <i class="fas fa-sort"></i></th>
                                            <th>Progression</th>
                                            <th style="cursor: pointer;" onclick="sortBy('STATUT')">Statut <i class="fas fa-sort"></i></th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody id="fraisTableBody"></tbody>
                                </table>
                            </div>

                            <!-- Pagination -->
                            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:15px;flex-wrap:wrap;gap:10px;">
                                <span id="fraisPaginationInfo" style="color:#6c757d;font-size:13px;"></span>
                                <div class="action-buttons">
                                    <button type="button" class="btn btn-sm btn-secondary" id="prevPageBtn" disabled><i class="fas fa-chevron-left"></i> Précédent</button>
                                    <button type="button" class="btn btn-sm btn-secondary" id="nextPageBtn">Suivant <i class="fas fa-chevron-right"></i></button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <div id="spinnerOverlay"><div class="spinner"></div></div>
        </div>

        <!-- MODAL PAIEMENT -->
        <div id="paymentModal" class="modal">
            <div class="modal-content" style="max-width:500px;">
                <div class="modal-header">
                    <h3><i class="fas fa-money-bill-wave"></i> Enregistrer un paiement</h3>
                    <button type="button" onclick="closePaymentModal()" style="background:none; border:none; font-size:24px; cursor:pointer;">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Élève *</label>
                        <select id="paymentStudent" class="form-control" onchange="updatePaymentInfo()">
                            <option value="">-- Sélectionner un élève --</option>
                        </select>
                    </div>
                    <div id="paymentInfo" class="payment-detail" style="display: none;">
                        <p><strong>Informations du compte :</strong></p>
                        <p>Montant total: <span id="infoTotal">0</span> Ar</p>
                        <p>Déjà payé: <span id="infoPaye">0</span> Ar</p>
                        <p>Reste à payer: <span id="infoReste" style="font-weight: bold;">0</span> Ar</p>
                    </div>
                    <div class="form-group">
                        <label>Montant du paiement (Ar) *</label>
                        <input type="number" id="paymentAmount" class="form-control" placeholder="Saisir le montant" step="1000" min="0">
                    </div>
                    <div class="form-group">
                        <label>Date du paiement *</label>
                        <input type="date" id="paymentDate" class="form-control">
                    </div>
                    <div class="form-group">
                        <label>Mode de paiement</label>
                        <select id="paymentMethod" class="form-control">
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
                        <textarea id="paymentComment" class="form-control" rows="2" placeholder="Commentaire..."></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" onclick="savePayment()"><i class="fas fa-save"></i> Enregistrer</button>
                    <button type="button" class="btn btn-danger" onclick="closePaymentModal()"><i class="fas fa-times"></i> Annuler</button>
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