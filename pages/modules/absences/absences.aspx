﻿<%@ Page Language="C#" AutoEventWireup="true" CodeFile="absences.cs" Inherits="absences" %>
<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Absences & Retards — Gestion Scolaire</title>
    <link rel="stylesheet" href="../../_assets/css/all.min.css?v=<%=AuthHelper.Version %>">
    <link rel="stylesheet" href="../../_assets/css/fontawesome.css?v=<%=AuthHelper.Version %>">
    <link rel="stylesheet" href="../../_assets/css/fontawesome.min.css?v=<%=AuthHelper.Version %>">
    <link rel="stylesheet" href="../../_assets/css/global.css?v=<%=AuthHelper.Version %>">
    <link rel="stylesheet" href="css/style.css?v=<%=AuthHelper.Version %>">
    <style>
        /* Styles pour les onglets */
        .tab-container {
            display: flex;
            gap: 0;
            margin-bottom: 20px;
            border-bottom: 2px solid #dee2e6;
        }
        .tab-btn {
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
        .tab-btn.active {
            background: #007bff;
            color: white;
        }
        .tab-btn:hover:not(.active) {
            background: #e9ecef;
        }
        .tab-content {
            display: none;
        }
        .tab-content.active {
            display: block;
        }
        
        /* Styles pour les statistiques */
        .absence-stats {
            display: flex;
            gap: 20px;
            margin-bottom: 20px;
            flex-wrap: wrap;
        }
        .absence-card {
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
        
        /* Styles pour les boutons d'action */
        .action-buttons-group {
            display: flex;
            gap: 5px;
            justify-content: center;
            flex-wrap: nowrap;
        }
        .btn-action-edit, .btn-action-delete, .btn-action-justify {
            padding: 4px 8px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 11px;
            transition: all 0.2s;
        }
        .btn-action-edit {
            background: #007bff;
            color: white;
        }
        .btn-action-edit:hover {
            background: #0056b3;
        }
        .btn-action-delete {
            background: #dc3545;
            color: white;
        }
        .btn-action-delete:hover {
            background: #c82333;
        }
        .btn-action-justify {
            background: #28a745;
            color: white;
        }
        .btn-action-justify:hover {
            background: #1e7e34;
        }
        
        /* Container responsive pour le tableau */
        .table-responsive {
            overflow-x: auto;
            width: 100%;
            border: 1px solid #dee2e6;
            border-radius: 8px;
        }
        
        /* Style du tableau */
        .dash-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
        }
        .dash-table th, .dash-table td {
            padding: 10px 8px;
            vertical-align: middle;
            border-bottom: 1px solid #dee2e6;
        }
        .dash-table th {
            background-color: #f8f9fa;
            font-weight: 600;
            white-space: nowrap;
        }
        .dash-table td {
            word-break: break-word;
        }
        
        /* Cellule motif avec largeur max */
        .motif-cell {
            max-width: 200px;
            white-space: normal;
            word-break: break-word;
        }
        
        /* Filtres */
        .filter-container {
            margin: 0 0 20px;
            padding: 14px 18px;
            background: linear-gradient(135deg, #f8f9fa, #e9ecef);
            border-radius: 10px;
            display: flex;
            gap: 14px;
            flex-wrap: wrap;
            align-items: flex-end;
            box-shadow: 0 2px 8px rgba(0,0,0,.08);
            border: 1px solid #dee2e6;
        }
        .filter-container label {
            display: block;
            margin-bottom: 6px;
            font-weight: 600;
            color: #495057;
            font-size: 13px;
        }
        .filter-container input,
        .filter-container select {
            width: 100%;
            padding: 9px 12px;
            border: 1px solid #ced4da;
            border-radius: 6px;
            font-size: 13px;
        }
        .filter-container .filter-group {
            flex: 2;
            min-width: 200px;
        }
        .filter-container .filter-select {
            min-width: 150px;
        }
        .filter-container .filter-rows {
            min-width: 130px;
        }
        .filter-container .filter-btn {
            padding: 9px 20px;
            background: #6c757d;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
        }
        .filter-container .filter-btn:hover {
            background: #5a6268;
        }
        
        /* Pour mobile */
        @media (max-width: 768px) {
            .dash-table th, .dash-table td {
                padding: 8px 4px;
                font-size: 11px;
            }
            .badge-justified, .badge-not-justified {
                padding: 2px 6px;
                font-size: 9px;
            }
            .btn-action-edit, .btn-action-delete, .btn-action-justify {
                padding: 3px 6px;
                font-size: 10px;
            }
            .filter-container {
                flex-direction: column;
                align-items: stretch;
            }
            .filter-container .filter-group,
            .filter-container .filter-select,
            .filter-container .filter-rows {
                flex: auto;
                min-width: 100%;
            }
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
                                <h1 id="dynPageTitle">Absences & Retards</h1>
                            </div>
                            <div class="col-lg-6">
                                <ol class="breadcrumb" style="float: right;">
                                    <li class="breadcrumb-item">Modules</li>
                                    <li class="breadcrumb-item active">Absences & Retards</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>

                <section class="content">
                    <div class="container-fluid">
                        <!-- Onglets -->
                        <div class="tab-container">
                            <button type="button" class="tab-btn active" onclick="switchTab('absences')">📅 Absences</button>
                            <button type="button" class="tab-btn" onclick="switchTab('retards')">⏰ Retards</button>
                        </div>

                        <!-- SECTION ABSENCES -->
                        <div id="tab-absences" class="tab-content active">
                            <div class="dash-card">
                                <div class="dash-card-head">
                                    <span class="dash-card-title"><i class="fas fa-calendar-times"></i> Gestion des absences</span>
                                    <button type="button" class="btn btn-success btn-sm" onclick="openAbsenceModal()"><i class="fas fa-plus"></i> Signaler une absence</button>
                                </div>
                                <div class="dash-card-body">
                                    <!-- Statistiques Absences -->
                                    <div class="absence-stats" id="absenceStatsContainer">
                                        <div class="absence-card">
                                            <div class="stat-icon"><i class="fas fa-calendar-times" style="color:#dc3545;"></i></div>
                                            <div class="stat-value" id="totalAbsencesVal">—</div>
                                            <div class="stat-label">Total absences</div>
                                        </div>
                                        <div class="absence-card">
                                            <div class="stat-icon"><i class="fas fa-exclamation-triangle" style="color:#ffc107;"></i></div>
                                            <div class="stat-value" id="nonJustifieesVal">—</div>
                                            <div class="stat-label">Non justifiées</div>
                                        </div>
                                        <div class="absence-card">
                                            <div class="stat-icon"><i class="fas fa-check-circle" style="color:#28a745;"></i></div>
                                            <div class="stat-value" id="justifieesVal">—</div>
                                            <div class="stat-label">Justifiées</div>
                                        </div>
                                    </div>
                                    
                                    <!-- ✅ FILTRES ABSENCES -->
                                    <div id="abs-filter-container"></div>
                                    
                                    <!-- Table Absences -->
                                    <div class="table-responsive">
                                        <table class="dash-table">
                                            <thead>
                                                <tr>
                                                    <th style="min-width: 100px; text-align: left;">Élève</th>
                                                    <th style="min-width: 80px; text-align: left;">Classe</th>
                                                    <th style="min-width: 100px; text-align: left;">Date début</th>
                                                    <th style="min-width: 100px; text-align: left;">Date fin</th>
                                                    <th style="min-width: 60px; text-align: left;">Durée</th>
                                                    <th style="min-width: 80px; text-align: left;">Justifiée</th>
                                                    <th style="min-width: 150px; text-align: left;">Motif</th>
                                                    <th style="min-width: 100px; text-align: left;">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody id="absencesTableBody"></tbody>
                                        </table>
                                    </div>
                                    
                                    <!-- ✅ PAGINATION ABSENCES -->
                                    <div id="abs-pagination" style="margin-top: 20px;"></div>
                                    
                                    <!-- ✅ COMPTEUR ABSENCES -->
                                    <div id="abs-record-counter"></div>
                                </div>
                            </div>
                        </div>

                        <!-- SECTION RETARDS -->
                        <div id="tab-retards" class="tab-content">
                            <div class="dash-card">
                                <div class="dash-card-head">
                                    <span class="dash-card-title"><i class="fas fa-clock"></i> Gestion des retards</span>
                                    <button type="button" class="btn btn-success btn-sm" onclick="openRetardModal()"><i class="fas fa-plus"></i> Signaler un retard</button>
                                </div>
                                <div class="dash-card-body">
                                    <!-- Statistiques Retards -->
                                    <div class="absence-stats" id="retardStatsContainer">
                                        <div class="absence-card">
                                            <div class="stat-icon"><i class="fas fa-clock" style="color:#ffc107;"></i></div>
                                            <div class="stat-value" id="totalRetardsVal">—</div>
                                            <div class="stat-label">Total retards</div>
                                        </div>
                                        <div class="absence-card">
                                            <div class="stat-icon"><i class="fas fa-check-circle" style="color:#28a745;"></i></div>
                                            <div class="stat-value" id="retardsJustifiesVal">—</div>
                                            <div class="stat-label">Justifiés</div>
                                        </div>
                                        <div class="absence-card">
                                            <div class="stat-icon"><i class="fas fa-chart-line" style="color:#007bff;"></i></div>
                                            <div class="stat-value" id="moyenneRetardsVal">—</div>
                                            <div class="stat-label">Moy. minutes</div>
                                        </div>
                                    </div>
                                    
                                    <!-- ✅ FILTRES RETARDS -->
                                    <div id="ret-filter-container"></div>
                                    
                                    <!-- Table Retards -->
                                    <div class="table-responsive">
                                        <table class="dash-table">
                                            <thead>
                                                <tr>
                                                    <th style="min-width: 100px; text-align: left;">Élève</th>
                                                    <th style="min-width: 80px; text-align: left;">Classe</th>
                                                    <th style="min-width: 100px; text-align: left;">Date</th>
                                                    <th style="min-width: 90px; text-align: left;">Heure arrivée</th>
                                                    <th style="min-width: 90px; text-align: left;">Heure prévue</th>
                                                    <th style="min-width: 60px; text-align: left;">Durée</th>
                                                    <th style="min-width: 80px; text-align: left;">Justifié</th>
                                                    <th style="min-width: 150px; text-align: left;">Motif</th>
                                                    <th style="min-width: 100px; text-align: left;">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody id="retardsTableBody"></tbody>
                                        </table>
                                    </div>
                                    
                                    <!-- ✅ PAGINATION RETARDS -->
                                    <div id="retard-pagination" style="margin-top: 20px;"></div>
                                    
                                    <!-- ✅ COMPTEUR RETARDS -->
                                    <div id="ret-record-counter"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <!-- SPINNER -->
            <div id="spinnerOverlay">
                <div class="spinner"></div>
            </div>
        </div>

        <!-- MODAL ABSENCE -->
        <div id="absenceModal" class="modal">
            <div class="modal-content" style="max-width:600px;">
                <div class="modal-header">
                    <h3><i class="fas fa-calendar-times"></i> Signaler une absence</h3>
                    <button type="button" onclick="closeAbsenceModal()" style="background:none; border:none; font-size:24px; cursor:pointer;">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Élève *</label>
                        <select id="absenceMatricule" class="form-control">
                            <option value="">-- Sélectionner un élève --</option>
                        </select>
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group"><label>Date début *</label><input type="date" id="absenceDateDebut" class="form-control"></div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group"><label>Date fin *</label><input type="date" id="absenceDateFin" class="form-control"></div>
                        </div>
                    </div>
                    <div class="form-group"><label>Motif</label><textarea id="absenceMotif" class="form-control" rows="3"></textarea></div>
                    <div class="form-group"><label><input type="checkbox" id="absenceJustifie"> Justifiée</label></div>
                    <div id="absenceJustificationGroup" style="display:none;">
                        <div class="form-group"><label>Justification</label><textarea id="absenceJustification" class="form-control" rows="2"></textarea></div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" onclick="saveAbsence()"><i class="fas fa-save"></i> Enregistrer</button>
                    <button type="button" class="btn btn-danger" onclick="closeAbsenceModal()">Annuler</button>
                </div>
            </div>
        </div>

        <!-- MODAL RETARD -->
        <div id="retardModal" class="modal">
            <div class="modal-content" style="max-width:600px;">
                <div class="modal-header">
                    <h3><i class="fas fa-clock"></i> Signaler un retard</h3>
                    <button type="button" onclick="closeRetardModal()" style="background:none; border:none; font-size:24px; cursor:pointer;">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Élève *</label>
                        <select id="retardMatricule" class="form-control">
                            <option value="">-- Sélectionner un élève --</option>
                        </select>
                    </div>
                    <div class="form-group"><label>Date *</label><input type="date" id="retardDate" class="form-control"></div>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group"><label>Heure prévue *</label><input type="time" id="retardHeurePrevue" class="form-control"></div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group"><label>Heure arrivée *</label><input type="time" id="retardHeureArrivee" class="form-control"></div>
                        </div>
                    </div>
                    <div class="form-group"><label>Motif</label><textarea id="retardMotif" class="form-control" rows="3"></textarea></div>
                    <div class="form-group"><label><input type="checkbox" id="retardJustifie"> Justifié</label></div>
                    <div id="retardJustificationGroup" style="display:none;">
                        <div class="form-group"><label>Justification</label><textarea id="retardJustification" class="form-control" rows="2"></textarea></div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" onclick="saveRetard()"><i class="fas fa-save"></i> Enregistrer</button>
                    <button type="button" class="btn btn-danger" onclick="closeRetardModal()">Annuler</button>
                </div>
            </div>
        </div>

        <!-- SCRIPTS -->
        <script src="../../_assets/js/jquery-3.6.0.min.js?v=<%=AuthHelper.Version %>"></script>
        <script src="../../_assets/js/sweetalert2@11.js?v=<%=AuthHelper.Version %>"></script>
        <script src="../../_assets/js/global.js?v=<%=AuthHelper.Version %>"></script>
        <script src="js/absences.js?v=<%=AuthHelper.Version %>"></script>
    </form>
</body>

</html>