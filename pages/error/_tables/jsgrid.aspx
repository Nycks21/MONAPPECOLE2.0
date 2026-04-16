<%@ Page Language="C#" AutoEventWireup="true" ResponseEncoding="utf-8" Culture="fr-FR" UICulture="fr" %>

<script runat="server">
  protected void Page_Load(object sender, EventArgs e)
  {
      // Vérification de session côté serveur
      if (Session["authenticated"] == null || !(bool)Session["authenticated"])
      {
        // Empêcher cache et rediriger
        Response.Cache.SetCacheability(HttpCacheability.NoCache);
        Response.Cache.SetNoStore();
        Response.AppendHeader("Pragma","no-cache");
        Response.AppendHeader("Cache-Control","no-cache, no-store, must-revalidate");
        Response.Redirect("pages/Login/Login.aspx");
      }

      // Affichage du nom de l'utilisateur dans la navbar
      if (Session["username"] != null)
      {
          string username = Session["username"].ToString();
          string script = "document.addEventListener('DOMContentLoaded', function() {" +
                          "document.getElementById('navbarUsername').innerText = '" + username + "';" +
                          "});";
          ClientScript.RegisterStartupScript(this.GetType(), "setUsername", script, true);
      }
  }
</script>

<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>Exploitation</title>
  
  <!-- Google Font: Source Sans Pro -->
  <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,400i,700&display=fallback" />
  <!-- Font Awesome -->
  <link rel="stylesheet" href="../../plugins/fontawesome-free/css/all.min.css" />
  <!-- Ionicons -->
  <link rel="stylesheet" href="https://code.ionicframework.com/ionicons/2.0.1/css/ionicons.min.css" />
  <!-- Tempusdominus Bootstrap 4 -->
  <link rel="stylesheet" href="../../plugins/tempusdominus-bootstrap-4/css/tempusdominus-bootstrap-4.min.css" />
  <!-- iCheck -->
  <link rel="stylesheet" href="../../plugins/icheck-bootstrap/icheck-bootstrap.min.css" />
  <!-- JQVMap -->
  <link rel="stylesheet" href="../../plugins/jqvmap/jqvmap.min.css" />
  <!-- Theme style -->
  <link rel="stylesheet" href="../../dist/css/adminlte.min.css" />
  <!-- overlayScrollbars -->
  <link rel="stylesheet" href="../../plugins/overlayScrollbars/css/OverlayScrollbars.min.css" />
  <!-- Daterange picker -->
  <link rel="stylesheet" href="../../plugins/daterangepicker/daterangepicker.css" />
  <!-- summernote -->
  <link rel="stylesheet" href="../../plugins/summernote/summernote-bs4.min.css" />
  <!-- Custom styles -->
  <link rel="stylesheet" href="../../style.css" />
  <link rel="stylesheet" href="../style.css" />
  <link rel="icon" href="data:,">

  
</head>
<body class="hold-transition sidebar-mini layout-fixed">
  <div class="wrapper">

    <!-- Preloader -->
    <div class="preloader flex-column justify-content-center align-items-center">
      <img class="animation__shake" src="../../dist/img/AdminLTELogo.png" alt="AdminLTELogo" height="60" width="60">
    </div>
  
    <!-- Navbar -->
    <nav class="main-header navbar navbar-expand navbar-white navbar-light">
      <!-- Left navbar links -->
      <ul class="navbar-nav">
        <li class="nav-item">
          <a class="nav-link" data-widget="pushmenu" href="#" role="button"><i class="fas fa-bars"></i></a>
        </li>
        <li class="nav-item d-none d-sm-inline-block">
          <a href="../../main.aspx" class="nav-link">Accueil</a>
        </li>
        <li class="nav-item d-none d-sm-inline-block">
          <a href="../Application/index.aspx" class="nav-link">Application</a>
        </li>
        <li class="nav-item d-none d-sm-inline-block">
          <a href="#" class="nav-link">Paramètres</a>
        </li>
        <li class="nav-item d-none d-sm-inline-block">
          <a href="../Administrations/administrations.aspx" class="nav-link">Administrations</a>
        </li>
        <li class="nav-item d-none d-sm-inline-block">
          <a href="../identification/identification.aspx" class="nav-link">Identification</a>
        </li>
      </ul>

        <!-- Dropdown Menu -->
<ul class="navbar-nav ml-auto">
  <li class="nav-item d-flex align-items-center mr-3">
      <i class="fas fa-user-circle fa-lg mr-1 text-primary"></i>
      <span id="navbarUsername" class="font-weight-bold text-dark">
          <%= (Session["username"] != null ? Session["username"].ToString() : "") %>
      </span>
  </li>
  <li class="nav-item">
      <a href="../../auth/Login.aspx" class="nav-link" role="button" title="Se déconnecter">
          <i class="fas fa-sign-out-alt"></i>
      </a>
  </li>
  <li class="nav-item">
      <a class="nav-link" data-widget="fullscreen" href="#" role="button" title="Agrandir">
          <i class="fas fa-expand-arrows-alt"></i>
      </a>
  </li>
</ul>

    </nav>
    <!-- /.navbar -->
  
    <!-- Main Sidebar Container -->
    <aside class="main-sidebar sidebar-dark-primary elevation-4">
      <!-- Brand Logo -->
      <a href="../Application/index.aspx" class="brand-link">
        <img src="../../dist/img/AdminLTELogo.png" alt="AdminLTE Logo" class="brand-image img-circle elevation-3" style="opacity: .8">
        <span class="brand-text font-weight-light">Transaction Mobile Money 3.0</span>
      </a>
  
      <!-- Sidebar -->
      <div class="sidebar">
        <!-- Sidebar user panel (optional) -->
        <div class="user-panel mt-3 pb-3 mb-3 d-flex">
          <div class="image">
            <img src="../../dist/img/user2-160x160.jpg" class="img-circle elevation-2" alt="User Image">
          </div>
          <div class="info">
            <a href="#" class="d-block">Admin</a>
          </div>
        </div>
  
        <!-- Sidebar Menu -->
        <nav class="mt-2">
          <ul class="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu" data-accordion="false">
            <!-- Add icons to the links using the .nav-icon class
                 with font-awesome or any other icon font library -->
            <li class="nav-item menu-open">
              <a href="#" class="nav-link">
                <i class="nav-icon fas fa-edit"></i>
                <p>
                  Saisie
                  <i class="right fas fa-angle-left"></i>
                </p>
              </a>
              <ul class="nav nav-treeview">
                <li class="nav-item">
                  <a href="../Application/index.aspx" class="nav-link">
                    <i class="nav-icon far fa-plus-square"></i>
                    <p>Nouveau</p>
                  </a>
                </li>
              </ul>
            </li>

            <li class="nav-item menu-open">
              <a href="#" class="nav-link active">
                <i class="nav-icon fas fa-tachometer-alt"></i>
                <p>
                  Tableau de bord
                  <i class="right fas fa-angle-left"></i>
                </p>
              </a>
              <ul class="nav nav-treeview">
                <li class="nav-item">
                  <a href="#" class="nav-link active">
                    <i class="nav-icon fas fa-file"></i>
                    <p>Liste</p>
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </nav>
        <!-- /.sidebar-menu -->
      </div>
      <!-- /.sidebar -->
    </aside>
  
    <!-- Content Wrapper. Contains page content -->
    <div class="content-wrapper">
      <!-- Content Header (Page header) -->
      <div class="content-header">
        <div class="container-fluid">
          <div class="row mb-2">
            <div class="col-sm-6">
              <h1 class="m-0">Editions</h1>
            </div><!-- /.col -->
            <div class="col-sm-6">
              <ol class="breadcrumb float-sm-right">
                <li class="breadcrumb-item"><a href="../../main.aspx">Accueil</a></li>
                <li class="breadcrumb-item">Tableau de bord</li>
                <li class="breadcrumb-item active">Liste</li>
              </ol>
            </div><!-- /.col -->
          </div><!-- /.row -->
        </div><!-- /.container-fluid -->
      </div>
      <!-- /.content-header -->

      <section class="content">
        <div class="container-fluid">
          <div class="row">
            <div class="col-md-12">
              <div class="card card-info">
                <div class="card-header">
                  <h3 class="card-title">Liste des Contacts</h3>
                </div>
                <div class="card-body">          
                  <table id="contactsTable" class="table table-bordered table-hover">
                    <thead>
                      <tr>
                        <th>Id</th>
                        <th>Civilité</th>
                        <th>Nom</th>
                        <th>Prénom</th>
                        <th>Marié(e)</th>
                        <th>Téléphone</th>
                        <th>Facebook</th>
                        <th>Adresse</th>
                      </tr>
                    </thead>
                    <tbody></tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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
    </div>
  </aside>

  <!-- Scripts -->
  <!-- jQuery -->
  <script src="../../plugins/jquery/jquery.min.js"></script>
  <!-- Bootstrap 4 -->
  <script src="../../plugins/bootstrap/js/bootstrap.bundle.min.js"></script>
  <!-- DataTables & Plugins -->
  <script src="../../plugins/datatables/jquery.dataTables.min.js"></script>
  <script src="../../plugins/datatables-bs4/js/dataTables.bootstrap4.min.js"></script>
  <script src="../../plugins/datatables-responsive/js/dataTables.responsive.min.js"></script>
  <script src="../../plugins/datatables-responsive/js/responsive.bootstrap4.min.js"></script>
  <script src="../../plugins/datatables-buttons/js/dataTables.buttons.min.js"></script>
  <script src="../../plugins/datatables-buttons/js/buttons.bootstrap4.min.js"></script>
  <script src="../../plugins/jszip/jszip.min.js"></script>
  <script src="../../plugins/pdfmake/pdfmake.min.js"></script>
  <script src="../../plugins/pdfmake/vfs_fonts.js"></script>
  <script src="../../plugins/datatables-buttons/js/buttons.html5.min.js"></script>
  <script src="../../plugins/datatables-buttons/js/buttons.print.min.js"></script>
  <script src="../../plugins/datatables-buttons/js/buttons.colVis.min.js"></script>
  <script src="../../dist/js/adminlte.min.js"></script>
  <script src="../mode.js"></script>
  <script src="../mode.js"></script>

  <script>
    let table;

    async function safeJson(res) {
        try {
            return await res.json();
        } catch (e) {
            console.error("Erreur parsing JSON", e);
            return [];
        }
    }

    function chargerContacts() {
        fetch("../Application/api/Contacts.aspx") // URL relative à la page jsgrid.aspx
            .then(async res => {
                if (!res.ok) throw new Error("HTTP " + res.status);
                return await safeJson(res);
            })
            .then(data => {
                if (!Array.isArray(data)) data = [];
                if (table) {
                    table.clear().rows.add(data).draw();
                } else {
                    table = $('#contactsTable').DataTable({
                        data: data,
                        responsive: true,
                        lengthChange: true,
                        autoWidth: false,
                        paging: true,
                        searching: true,
                        ordering: true,
                        info: true,
                        pageLength: 10,
                        lengthMenu: [[10, 20, 50, -1], [10, 20, 50, "Tous"]],
                        columns: [
                            { data: 'IdContacts', className: 'text-left' },
                            { data: 'Civilite', className: 'text-left' },
                            { data: 'Nom', className: 'text-left' },
                            { data: 'Prenom', className: 'text-left' },
                            { data: 'Marie', className: 'text-left' },
                            { data: 'Telephone', className: 'text-left' },
                            { data: 'Facebook', className: 'text-left' },
                            { data: 'Adresse', className: 'text-left' },
                        ],
                        dom: '<"top"fB>rt<"bottom d-flex justify-content-between align-items-center"l i p><"clear">',
                        buttons: ["copy", "csv", "excel", "pdf", "print"],
                        language: {
                        zeroRecords: "Aucun enregistrement trouvé",
                        search: " ",
                        searchPlaceholder: "Tapez pour rechercher...",
                        lengthMenu: "Afficher _MENU_ lignes",
                        info: "Affichage de _START_ à _END_ sur _TOTAL_ contacts",
                        infoEmpty: "Affichage de 0 à 0 sur 0 enregistrements",
                        infoFiltered: "(filtrés depuis un total de _MAX_ contacts)"
                    }
                    });
                }
            })
            .catch(err => console.error("Erreur lors du chargement des contacts :", err));
    }

    document.addEventListener('DOMContentLoaded', chargerContacts);

</script>

</body>
</html>
