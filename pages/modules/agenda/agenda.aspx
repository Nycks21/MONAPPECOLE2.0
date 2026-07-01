<%@ Page Language="C#" AutoEventWireup="true" CodeFile="agenda.cs" Inherits="agenda" %>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Agenda — Gestion Scolaire</title>
    
    <link rel="stylesheet" href="../../_assets/css/all.min.css?v=<%=AuthHelper.Version %>">
    <link rel="stylesheet" href="../../_assets/css/fontawesome.min.css?v=<%=AuthHelper.Version %>">
    <link rel="stylesheet" href="../../_assets/css/global.css?v=<%=AuthHelper.Version %>">
    
    <!-- FullCalendar CSS -->
    <link rel="stylesheet" href="css/main.min.css?v=<%=AuthHelper.Version %>">
    <link rel="stylesheet" href="css/agenda.css?v=<%=AuthHelper.Version %>">
</head>
<body class="hold-transition" data-version="<%=AuthHelper.Version %>">
    <form id="form1" runat="server">
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
                                <h1 id="dynPageTitle">📆 Agenda</h1>
                            </div>
                            <div class="col-lg-6">
                                <ol class="breadcrumb" style="float: right;">
                                    <li class="breadcrumb-item">Modules</li>
                                    <li class="breadcrumb-item active" id="dynBreadcrumb">Agenda</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>

                <section class="content" id="section-agenda">
                    <div class="row">
                        <div class="col-md-3">
                            <div class="sticky-top mb-3">
                                <!-- ✅ Événements externes (Draggable) -->
                                <div class="card">
                                    <div class="card-header">
                                        <h4 class="card-title"><i class="fas fa-arrows-alt"></i> Événements rapides</h4>
                                    </div>
                                    <div class="card-body">
                                        <div id="external-events">
                                            <div class="external-event" style="background-color:#dc3545; border-color:#dc3545; color:#fff;" data-type="examen">Examen</div>
                                            <div class="external-event" style="background-color:#17a2b8; border-color:#17a2b8; color:#fff;" data-type="reunion">Réunion</div>
                                            <div class="external-event" style="background-color:#6f42c1; border-color:#6f42c1; color:#fff;" data-type="reunion_parents">Réunion Parents</div>
                                            <div class="external-event" style="background-color:#ffc107; border-color:#ffc107; color:#212529;" data-type="vacances">Vacances</div>
                                            <div class="external-event" style="background-color:#fd7e14; border-color:#fd7e14; color:#fff;" data-type="ferie">Jour férié</div>
                                        </div>
                                        <div class="form-check mt-2">
                                            <input type="checkbox" class="form-check-input" id="drop-remove">
                                            <label class="form-check-label" for="drop-remove">Supprimer après dépôt</label>
                                        </div>
                                    </div>
                                </div>

                                <!-- ✅ Créer un événement rapide -->
                                <div class="card">
                                    <div class="card-header">
                                        <h4 class="card-title"><i class="fas fa-plus-circle"></i> Créer un événement</h4>
                                    </div>
                                    <div class="card-body">
                                        <div class="btn-group" style="width: 100%; margin-bottom: 10px;">
                                            <ul class="fc-color-picker" id="color-chooser" style="display:flex; gap:8px; list-style:none; padding:0; margin:0;">
                                                <li><a class="text-primary" href="#" style="color:#28a745 !important; font-size:20px;"><i class="fas fa-square"></i></a></li>
                                                <li><a class="text-danger" href="#" style="color:#dc3545 !important; font-size:20px;"><i class="fas fa-square"></i></a></li>
                                                <li><a class="text-info" href="#" style="color:#17a2b8 !important; font-size:20px;"><i class="fas fa-square"></i></a></li>
                                                <li><a class="text-warning" href="#" style="color:#ffc107 !important; font-size:20px;"><i class="fas fa-square"></i></a></li>
                                                <li><a class="text-secondary" href="#" style="color:#6f42c1 !important; font-size:20px;"><i class="fas fa-square"></i></a></li>
                                                <li><a class="text-muted" href="#" style="color:#fd7e14 !important; font-size:20px;"><i class="fas fa-square"></i></a></li>
                                            </ul>
                                        </div>
                                        <div class="input-group">
                                            <input id="new-event" type="text" class="form-control" placeholder="Titre de l'événement">
                                            <div class="input-group-append">
                                                <button id="add-new-event" type="button" class="btn btn-primary" style="background-color:#28a745; border-color:#28a745;">
                                                    <i class="fas fa-plus"></i> Ajouter
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Événements à venir -->
                                <div class="card">
                                    <div class="card-header">
                                        <h4 class="card-title"><i class="fas fa-clock"></i> À venir</h4>
                                    </div>
                                    <div class="card-body" id="upcomingEvents" style="max-height:200px; overflow-y:auto;">
                                        <div class="text-center text-muted">Chargement...</div>
                                    </div>
                                </div>

                            </div>
                        </div>
                        <!-- /.col -->

                        <div class="col-md-9">
                            <div class="card card-primary">
                                <div class="card-header">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <h3 class="card-title"><i class="fas fa-calendar-alt"></i> Calendrier</h3>
                                        <div>
                                            <button class="btn btn-success btn-sm" id="btnAddEvent">
                                                <i class="fas fa-plus"></i> Ajouter
                                            </button>
                                            <button class="btn btn-outline-light btn-sm" id="btnRefresh">
                                                <i class="fas fa-sync-alt"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div class="card-body p-0">
                                    <div id="calendar"></div>
                                </div>
                            </div>
                        </div>
                        <!-- /.col -->
                    </div>
                </section>
            </div>

            <div id="spinnerOverlay">
                <div class="spinner"></div>
            </div>

        </div>

        <!-- ═══ MODAL AJOUT/MODIFICATION ═══ -->
        <div id="eventModal" class="modal-overlay" style="display:none;">
            <div class="modal-container modal-lg">
                <div class="modal-header">
                    <h3 id="eventModalTitle">Ajouter un événement</h3>
                    <button class="modal-close" onclick="closeEventModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="eventForm">
                        <input type="hidden" id="eventId" value="">
                        <div class="form-row">
                            <div class="form-group col-8">
                                <label>Titre *</label>
                                <input type="text" id="eventTitle" class="form-control" required placeholder="Titre de l'événement">
                            </div>
                            <div class="form-group col-4">
                                <label>Type *</label>
                                <select id="eventType" class="form-control" required>
                                    <option value="cours">📚 Cours</option>
                                    <option value="examen">📝 Examens</option>
                                    <option value="reunion">🤝 Réunions</option>
                                    <option value="reunion_parents">👨‍👩‍👦 Réunions Parents</option>
                                    <option value="vacances">🏖️ Vacances</option>
                                    <option value="ferie">🎉 Jours fériés</option>
                                    <option value="autre">📌 Autre</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group col-6">
                                <label>Date début *</label>
                                <input type="datetime-local" id="eventStart" class="form-control" required>
                            </div>
                            <div class="form-group col-6">
                                <label>Date fin</label>
                                <input type="datetime-local" id="eventEnd" class="form-control">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Description</label>
                            <textarea id="eventDescription" class="form-control" rows="3" placeholder="Description de l'événement"></textarea>
                        </div>
                        <div class="form-row">
                            <div class="form-group col-4">
                                <label>Couleur</label>
                                <input type="color" id="eventColor" class="form-control" value="#1e3a2f" style="height:40px; padding:2px;">
                            </div>
                            <div class="form-group col-4">
                                <label>Lieu</label>
                                <input type="text" id="eventLocation" class="form-control" placeholder="Lieu de l'événement">
                            </div>
                            <div class="form-group col-4">
                                <label>Public</label>
                                <select id="eventAudience" class="form-control">
                                    <option value="all">Tous</option>
                                    <option value="eleves">Élèves</option>
                                    <option value="parents">Parents</option>
                                    <option value="enseignants">Enseignants</option>
                                    <option value="personnel">Personnel</option>
                                </select>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeEventModal()">Annuler</button>
                    <button class="btn btn-danger" id="btnDeleteEvent" style="display:none;" onclick="deleteEvent()">
                        <i class="fas fa-trash"></i> Supprimer
                    </button>
                    <button class="btn btn-primary" id="btnSaveEvent" onclick="saveEvent()">
                        <i class="fas fa-save"></i> Enregistrer
                    </button>
                </div>
            </div>
        </div>

        <!-- ═══ MODAL DÉTAILS ═══ -->
        <div id="detailModal" class="modal-overlay" style="display:none;">
            <div class="modal-container">
                <div class="modal-header">
                    <h3 id="detailTitle">Détails de l'événement</h3>
                    <button class="modal-close" onclick="closeDetailModal()">&times;</button>
                </div>
                <div class="modal-body" id="detailBody"></div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeDetailModal()">Fermer</button>
                    <button class="btn btn-primary" id="btnEditDetail" onclick="editDetail()">
                        <i class="fas fa-edit"></i> Modifier
                    </button>
                </div>
            </div>
        </div>

        <div id="toastContainer" style="position:fixed; bottom:24px; right:24px; display:flex; flex-direction:column; gap:10px; z-index:9999;"></div>

        <!-- ═══ SCRIPTS ═══ -->
        <script src="../../_assets/js/jquery.min.js?v=<%=AuthHelper.Version %>"></script>
        <script src="../../_assets/js/bootstrap.bundle.min.js?v=<%=AuthHelper.Version %>"></script>
        <script src="../../_assets/js/jquery-ui.min.js?v=<%=AuthHelper.Version %>"></script>
        <script src="js/main.min.js?v=<%=AuthHelper.Version %>"></script>
        <script src="js/locales/fr.js?v=<%=AuthHelper.Version %>"></script>
        <script src="js/agenda.js?v=<%=AuthHelper.Version %>"></script>
        <script src="../../_assets/js/global.js?v=<%=AuthHelper.Version %>"></script>
    </form>
</body>
</html>