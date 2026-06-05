<%@ Page Language="C#" AutoEventWireup="true" CodeFile="absences.cs" Inherits="absences" %>
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
                        <a class="nav-link" id="menuToggle" role="button">
                            <i class="fas fa-bars"></i>
                        </a>
                    </li>
                </ul>
                <ul class="navbar-nav">
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

            <!-- SIDEBAR -->
            <aside class="main-sidebar" id="sidebar">
                <a href="#" class="brand-link" onclick="loadDashboard()">
                    <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='33' height='33' viewBox='0 0 33 33'%3E%3Ccircle cx='16.5' cy='16.5' r='16.5' fill='%23007bff'/%3E%3Ctext x='16.5' y='22' font-size='16' font-weight='bold' text-anchor='middle' fill='white'%3EGS%3C/text%3E%3C/svg%3E"
                        alt="Logo" class="brand-image">
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
                                    
                                    <!-- Table Absences responsive -->
                                    <div class="table-responsive">
                                        <table class="dash-table">
                                            <thead>
                                                <tr>
                                                    <th style="min-width: 100px;">Élève</th>
                                                    <th style="min-width: 80px;">Classe</th>
                                                    <th style="min-width: 100px;">Date début</th>
                                                    <th style="min-width: 100px;">Date fin</th>
                                                    <th style="min-width: 60px;">Durée</th>
                                                    <th style="min-width: 80px;">Justifiée</th>
                                                    <th style="min-width: 150px;">Motif</th>
                                                    <th style="min-width: 100px;">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody id="absencesTableBody"></tbody>
                                        </table>
                                    </div>
                                    <div id="abs-pagination" style="margin-top: 20px;"></div>
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
                                    
                                    <!-- Table Retards responsive -->
                                    <div class="table-responsive">
                                        <table class="dash-table">
                                            <thead>
                                                <tr>
                                                    <th style="min-width: 100px;">Élève</th>
                                                    <th style="min-width: 80px;">Classe</th>
                                                    <th style="min-width: 100px;">Date</th>
                                                    <th style="min-width: 90px;">Heure arrivée</th>
                                                    <th style="min-width: 90px;">Heure prévue</th>
                                                    <th style="min-width: 60px;">Durée</th>
                                                    <th style="min-width: 80px;">Justifié</th>
                                                    <th style="min-width: 150px;">Motif</th>
                                                    <th style="min-width: 100px;">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody id="retardsTableBody"></tbody>
                                        </table>
                                    </div>
                                    <div id="retard-pagination" style="margin-top: 20px;"></div>
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

        <script src="../../_assets/js/jquery-3.6.0.min.js?v=<%=AuthHelper.Version %>"></script>
        <script src="../../_assets/js/sweetalert2@11.js?v=<%=AuthHelper.Version %>"></script>
        <script src="../../_assets/js/global.js?v=<%=AuthHelper.Version %>"></script>
        <script src="js/absences.js?v=<%=AuthHelper.Version %>"></script>
    </form>
</body>

</html>