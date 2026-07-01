﻿<%@ Page Language="C#" AutoEventWireup="true" CodeFile="agenda.cs" Inherits="agenda" %>
    <!DOCTYPE html>
    <html lang="fr">

    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Agenda — Gestion Scolaire</title>
        <link rel="stylesheet" href="../../_assets/css/all.min.css?v=<%=AuthHelper.Version %>">
        <link rel="stylesheet" href="../../_assets/css/fontawesome.css?v=<%=AuthHelper.Version %>">
        <link rel="stylesheet" href="../../_assets/css/fontawesome.min.css?v=<%=AuthHelper.Version %>">
        <link rel="stylesheet" href="../../_assets/css/global.css?v=<%=AuthHelper.Version %>">
        <link rel="stylesheet" href="../../_assets/css/page_construction.css?v=<%=AuthHelper.Version %>">
        <link rel="stylesheet" href="css/style.css?v=<%=AuthHelper.Version %>">
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
                                            <h1 id="dynPageTitle">📆 Agenda</h1>
                                        </div>
                                        <div class="col-lg-6">
                                            <ol class="breadcrumb" style="float: right;">
                                                <li class="breadcrumb-item">Modules</li>
                                                <li class="breadcrumb-item active">Agenda</li>
                                            </ol>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <!-- CONTENT AGENDA -->
                            <div class="construction-banner">
                                <div class="construction-content">
                                    <img src="../../_assets/images/excavatrice.png" alt="Page en construction"
                                        class="construction-icon">
                                    <h2 class="construction-title">🚧 Page en cours de construction 🚧</h2>
                                    <p class="construction-text">Nous travaillons actuellement sur cette
                                        section.<br>Revenez bientôt pour découvrir les nouvelles fonctionnalités.</p>
                                    <div class="construction-progress">
                                        <div class="progress-bar">
                                            <div class="progress-fill" style="width: 25%;"></div>
                                        </div>
                                        <span class="progress-label">Progression : 25%</span>
                                    </div>
                                    <div class="construction-estimate">
                                        <i class="fas fa-clock"></i> Mise en ligne prévue :
                                        <strong class="gradient-text">Prochainement</strong>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- SPINNER -->
                        <div id="spinnerOverlay">
                            <div class="spinner"></div>
                        </div>
            </div>

            <!-- SCRIPTS -->
            <script src="../../_assets/js/jquery-3.6.0.min.js?v=<%=AuthHelper.Version %>"></script>
            <script src="../../_assets/js/sweetalert2@11.js?v=<%=AuthHelper.Version %>"></script>
            <script src="../../_assets/js/global.js?v=<%=AuthHelper.Version %>"></script>
            <script src="js/agenda.js?v=<%=AuthHelper.Version %>"></script>
        </form>
    </body>

    </html>