<%@ Page Language="C#" AutoEventWireup="true" CodeFile="dashboard.cs" Inherits="dashboard" %>
<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Tableau de bord — Gestion Scolaire</title>

    <!-- Google Fonts -->
    <link rel="stylesheet" href="../../dist/css/family.css" />
    <!-- Font Awesome -->
    <link rel="stylesheet" href="../../plugins/fontawesome-free/css/all.min.css" />
    <!-- Ionicons (local) -->
    <link rel="stylesheet" href="../../dist/css/ionicons.css" />
    <!-- AdminLTE theme -->
    <link rel="stylesheet" href="../../dist/css/adminlte.min.css" />
    <!-- Plugins -->
    <link rel="stylesheet" href="../../plugins/overlayScrollbars/css/OverlayScrollbars.min.css" />
    <link rel="stylesheet" href="../../plugins/tempusdominus-bootstrap-4/css/tempusdominus-bootstrap-4.min.css" />
    <link rel="stylesheet" href="../../plugins/icheck-bootstrap/icheck-bootstrap.min.css" />
    <link rel="stylesheet" href="../../plugins/jqvmap/jqvmap.min.css" />
    <link rel="stylesheet" href="../../plugins/daterangepicker/daterangepicker.css" />
    <link rel="stylesheet" href="../../plugins/summernote/summernote-bs4.min.css" />
    <!-- SweetAlert2 -->
    <link rel="stylesheet" href="../../dist/css/sweetalert2.min.css" />
    <!-- Styles locaux -->
    <link rel="stylesheet" href="../css/style.css" />
    <link rel="stylesheet" href="css/dashboard.css" />
    <link rel="stylesheet" href="css/style.css" />

    <link rel="icon" href="data:,">

    <style>
        /* Zone de contenu dynamique — transition fluide */
        #pageContent {
            transition: opacity 0.18s ease;
        }
        #pageContent.loading {
            opacity: 0.35;
            pointer-events: none;
        }
    </style>
</head>

<body class="hold-transition sidebar-mini layout-fixed">
    <div class="wrapper">

        <!-- ═══ PRELOADER ═══════════════════════════════════════ -->
        <div class="preloader flex-column justify-content-center align-items-center">
            <img class="animation__shake" src="../../dist/img/AdminLTELogo.png"
                 alt="Logo" height="60" width="60">
        </div>

        <!-- ═══ TOPBAR ══════════════════════════════════════════ -->
        <nav class="main-header navbar navbar-expand navbar-white navbar-light">
            <ul class="navbar-nav">
                <li class="nav-item">
                    <a class="nav-link" data-widget="pushmenu" href="#" role="button">
                        <i class="fas fa-bars"></i>
                    </a>
                </li>
            </ul>
            <ul class="navbar-nav ml-auto">
                <!-- Notifications -->
                <li class="nav-item dropdown">
                    <a class="nav-link" data-toggle="dropdown" href="#" title="Notifications">
                        <i class="fas fa-bell"></i>
                        <span class="badge badge-notif" id="badgeNotif">3</span>
                    </a>
                    <div class="dropdown-menu dropdown-menu-right dropdown-notif">
                        <span class="dropdown-header">3 notifications</span>
                        <div class="dropdown-divider"></div>
                        <a href="#" class="dropdown-item">
                            <i class="fas fa-user-plus text-success mr-2"></i> Nouvel élève inscrit
                            <span class="float-right text-muted text-sm">Il y a 23 min</span>
                        </a>
                        <a href="#" class="dropdown-item">
                            <i class="fas fa-exclamation-circle text-danger mr-2"></i> Absence signalée
                            <span class="float-right text-muted text-sm">Il y a 1h</span>
                        </a>
                        <a href="#" class="dropdown-item">
                            <i class="fas fa-money-bill text-warning mr-2"></i> Paiement reçu
                            <span class="float-right text-muted text-sm">Il y a 2h</span>
                        </a>
                    </div>
                </li>
                <li class="nav-item">
                    <a href="../../auth/Login.aspx" class="nav-link" title="Se déconnecter">
                        <i class="fas fa-sign-out-alt"></i>
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" data-widget="fullscreen" href="#" title="Agrandir">
                        <i class="fas fa-expand-arrows-alt"></i>
                    </a>
                </li>
            </ul>
        </nav>

        <!-- ═══ SIDEBAR ═════════════════════════════════════════ -->
        <aside class="main-sidebar sidebar-dark-primary elevation-4">
            <a href="#" class="brand-link"
               data-page="pages/dashboard/dashboard.aspx"
               data-title="Tableau de bord"
               data-breadcrumb="Accueil">
                <img src="../../dist/img/AdminLTELogo.png" alt="Logo"
                     class="brand-image img-square elevation-3" style="opacity:.8">
                <span class="brand-text font-weight-light">Gestion Scolaire</span>
            </a>

            <div class="sidebar">
                <!-- Utilisateur -->
                <div class="user-panel mt-3 pb-3 mb-3 d-flex justify-content-center">
                    <div class="info text-center">
                        <i class="fas fa-user-tie fa-3x text-light mb-2"></i><br>
                        <span id="navbarUsername" class="font-weight-bold text-white"></span>
                    </div>
                </div>

                <!-- Navigation -->
                <nav class="mt-2">
                    <ul class="nav nav-pills nav-sidebar flex-column"
                        data-widget="treeview" role="menu" data-accordion="false">

                        <!-- Accueil -->
                        <li class="nav-item menu-open">
                            <div class="nav-section">Accueil</div>
                            <ul class="nav nav-treeview">
                                <li class="nav-item">
                                    <a href="#" class="nav-link active d-flex align-items-center"
                                       data-page="pages/dashboard/dashboard-content.aspx"
                                       data-title="Tableau de bord"
                                       data-breadcrumb="Accueil"
                                       data-scripts='["/pages/dashboard/js/dashboard.js"]'>
                                        <div style="width:30px;display:flex;justify-content:center;margin-right:10px;">
                                            <i class="fas fa-chalkboard"></i>
                                        </div>
                                        <p class="mb-0">Dashboard</p>
                                    </a>
                                </li>
                            </ul>
                        </li>

                        <!-- Modules -->
                        <li class="nav-item menu-open">
                            <div class="nav-section">Modules</div>
                            <ul class="nav nav-treeview">
                                <li class="nav-item">
                                    <a href="#" class="nav-link d-flex align-items-center"
                                       data-page="pages/application/jsgrid.aspx"
                                       data-title="Liste des élèves"
                                       data-breadcrumb="Élèves"
                                       data-scripts='["/pages/application/js/liste.js","/pages/application/js/suppeleves.js","/pages/application/js/classe.js"]'>
                                        <div style="width:30px;display:flex;justify-content:center;margin-right:10px;">
                                            <i class="fas fa-user-graduate"></i>
                                        </div>
                                        <p class="mb-0">Élèves</p>
                                    </a>
                                </li>
                                <li class="nav-item">
                                    <a href="#" class="nav-link d-flex align-items-center"
                                       data-page="#" data-title="Bulletins" data-breadcrumb="Bulletins">
                                        <div style="width:30px;display:flex;justify-content:center;margin-right:10px;">
                                            <i class="fas fa-file-invoice"></i>
                                        </div>
                                        <p class="mb-0">Bulletins</p>
                                    </a>
                                </li>
                                <li class="nav-item">
                                    <a href="#" class="nav-link d-flex align-items-center"
                                       data-page="#" data-title="Retards &amp; Absences" data-breadcrumb="Absences">
                                        <div style="width:30px;display:flex;justify-content:center;margin-right:10px;">
                                            <i class="fas fa-calendar-times"></i>
                                        </div>
                                        <p class="mb-0">Retards &amp; Absences</p>
                                    </a>
                                </li>
                                <li class="nav-item">
                                    <a href="#" class="nav-link d-flex align-items-center"
                                       data-page="#" data-title="Frais scolaires" data-breadcrumb="Frais scolaires">
                                        <div style="width:30px;display:flex;justify-content:center;margin-right:10px;">
                                            <i class="fas fa-money-bill-wave"></i>
                                        </div>
                                        <p class="mb-0">Frais scolaires</p>
                                    </a>
                                </li>
                            </ul>
                        </li>

                        <!-- Paramètres -->
                        <li class="nav-item menu-open">
                            <div class="nav-section">Paramètres</div>
                            <ul class="nav nav-treeview">
                                <li class="nav-item">
                                    <a href="#" class="nav-link d-flex align-items-center"
                                       data-page="pages/_parametre/paramclasse.aspx"
                                       data-title="Classes"
                                       data-breadcrumb="Paramètres"
                                       data-scripts='[]'>
                                        <div style="width:30px;display:flex;justify-content:center;margin-right:10px;">
                                            <i class="fas fa-folder"></i>
                                        </div>
                                        <p class="mb-0">Classes</p>
                                    </a>
                                </li>
                                <li class="nav-item">
                                    <a href="#" class="nav-link d-flex align-items-center"
                                       data-page="pages/_parametre/parammatiere.aspx"
                                       data-title="Matière"
                                       data-breadcrumb="Paramètres"
                                       data-scripts='[]'>
                                        <div style="width:30px;display:flex;justify-content:center;margin-right:10px;">
                                            <i class="fas fa-info"></i>
                                        </div>
                                        <p class="mb-0">Matière</p>
                                    </a>
                                </li>
                            </ul>
                        </li>

                        <!-- Identifiant -->
                        <li class="nav-item menu-open">
                            <div class="nav-section">Identifiant</div>
                            <ul class="nav nav-treeview">
                                <li class="nav-item">
                                    <a href="#" class="nav-link d-flex align-items-center"
                                       data-page="pages/_identification/identification.aspx"
                                       data-title="Utilisateur"
                                       data-breadcrumb="Identifiant"
                                       data-scripts='[]'>
                                        <div style="width:30px;display:flex;justify-content:center;margin-right:10px;">
                                            <i class="fas fa-user"></i>
                                        </div>
                                        <p class="mb-0">Utilisateur</p>
                                    </a>
                                </li>
                            </ul>
                        </li>

                    </ul>
                </nav>
            </div>
        </aside>

        <!-- ═══ CONTENT WRAPPER ══════════════════════════════════ -->
        <div class="content-wrapper">

            <!-- En-tête dynamique -->
            <div class="content-header">
                <div class="container-fluid">
                    <div class="row mb-1">
                        <div class="col-sm-6">
                            <h1 class="m-0" id="dynPageTitle">Tableau de bord</h1>
                        </div>
                        <div class="col-sm-6">
                            <ol class="breadcrumb float-sm-right">
                                <li class="breadcrumb-item">Application</li>
                                <li class="breadcrumb-item active" id="dynBreadcrumb">Tableau de bord</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ═══ ZONE DE CONTENU DYNAMIQUE ════════════════════ -->
            <div id="pageContent">
                <%-- Le contenu initial du dashboard est injecté ici au Page_Load --%>
                <asp:Literal ID="litPageContent" runat="server" />
            </div>

        </div><!-- /.content-wrapper -->

        <!-- Control Sidebar -->
        <aside class="control-sidebar control-sidebar-dark">
            <div class="p-3">
                <h5>Paramètres</h5>
                <hr />
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span>Mode sombre</span>
                    <label class="switch">
                        <input type="checkbox" id="toggleDarkMode">
                        <span class="slider round"></span>
                    </label>
                </div>
                <hr />
                <div class="float-right d-none d-sm-inline-block"><b>Version</b> 1.0.0</div>
            </div>
        </aside>

        <!-- ═══ SPINNER ══════════════════════════════════════════ -->
        <div id="spinnerOverlay">
            <div class="spinner"></div>
        </div>

    </div><!-- /.wrapper -->

    <!-- ═══ SCRIPTS ═════════════════════════════════════════════ -->
    <!-- Noyau -->
    <script src="../../plugins/jquery/jquery.min.js"></script>
    <script src="../../plugins/bootstrap/js/bootstrap.bundle.min.js"></script>
    <script src="../../dist/js/adminlte.min.js"></script>
    <!-- Utilitaires -->
    <script src="../../plugins/sweetalert2/sweetalert2.all.js"></script>
    <script src="js/chart.umd.js"></script>
    <script src="../mode.js"></script>
    <!-- DataTables -->
    <script src="../../plugins/datatables/jquery.dataTables.min.js"></script>
    <script src="../../plugins/datatables-bs4/js/dataTables.bootstrap4.min.js"></script>
    <script src="../../plugins/datatables-responsive/js/dataTables.responsive.min.js"></script>
    <script src="../../plugins/datatables-buttons/js/dataTables.buttons.min.js"></script>
    <script src="../../plugins/datatables-buttons/js/buttons.bootstrap4.min.js"></script>
    <script src="../../plugins/datatables-buttons/js/buttons.html5.min.js"></script>
    <script src="../../plugins/datatables-buttons/js/buttons.print.min.js"></script>
    <script src="../../plugins/jszip/jszip.min.js"></script>
    <script src="../../dist/js/jquery.inputmask.min.js"></script>
    <!-- Navigation SPA -->
    <script src="js/spa-nav.js"></script>
    <!-- Dashboard -->
    <script src="js/dashboard.js"></script>

</body>
</html>
