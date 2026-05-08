<%@ Page Language="C#" AutoEventWireup="true" %>
<%@ Import Namespace="System" %>
<%@ Import Namespace="System.Data" %>
<%@ Import Namespace="System.Data.SqlClient" %>

<script runat="server">
    protected string expirationDateString = "";
    protected void Page_Load(object sender, EventArgs e)
    {
        // Récupération sécurisée de la date d'expiration
        DateTime expirationDate = GetLicenceExpirationDate();
        expirationDateString = expirationDate != DateTime.MinValue ? expirationDate.ToString("dd/MM/yyyy") : "Date inconnue";
        if (Session["authenticated"] == null || !(bool)Session["authenticated"])
        {
            Response.Cache.SetCacheability(HttpCacheability.NoCache);
            Response.Cache.SetNoStore();
            Response.AppendHeader("Pragma", "no-cache");
            Response.AppendHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            Response.Redirect("auth/Login.aspx");
            return;
        }
        if (Session["username"] != null)
        {
            string username = Session["username"].ToString();
            string script =
                "document.addEventListener('DOMContentLoaded', function() {" +
                "document.getElementById('navbarUsername').innerText = '" + username + "';" +
                "});";

            ClientScript.RegisterStartupScript(this.GetType(), "setUsername", script, true);
        }
    }

    // Ajoute cette méthode dans le même script runat=server
    private DateTime GetLicenceExpirationDate()
    {
        try
        {
            string licencePath = Server.MapPath("~/bin/licence.key");
            if (!System.IO.File.Exists(licencePath))
                return DateTime.MinValue;
            string[] lines = System.IO.File.ReadAllLines(licencePath);
            foreach (string line in lines)
            {
                if (line.StartsWith("EXPIRATION="))
                {
                    string expirationStr = line.Replace("EXPIRATION=", "").Trim();
                    DateTime expirationDate;
                      if (DateTime.TryParse(expirationStr, out expirationDate))
                        return expirationDate;
                          else
                            return DateTime.MinValue;
                }
            }
            return DateTime.MinValue;
        }
        catch
        {
            return DateTime.MinValue;
        }
    }

    private int GetMaxUsers()
{
    try
    {
        string licencePath = Server.MapPath("~/bin/licence.key");
        if (!System.IO.File.Exists(licencePath))
            return 0;

        foreach (string line in System.IO.File.ReadAllLines(licencePath))
        {
            if (line.StartsWith("MAX_USERS="))
            {
                int max;
                if (int.TryParse(line.Replace("MAX_USERS=", "").Trim(), out max))
                    return max;
            }
        }
        return 0;
    }
    catch
    {
        return 0;
    }
}

private int GetConnectedUsersCount()
{
    int count = 0;
    using (SqlConnection conn = new SqlConnection(connStr))
    {
        conn.Open();
        SqlCommand cmd = new SqlCommand(
            "SELECT COUNT(*) FROM Users WHERE IsConnected = 1", conn);
        count = (int)cmd.ExecuteScalar();
    }
    return count;
}

int maxUsers = GetMaxUsers();
int connectedUsers = GetConnectedUsersCount();

if (maxUsers > 0 && connectedUsers >= maxUsers)
{
    Response.Write("<h3 style='color:red;text-align:center'>Nombre maximum d'utilisateurs atteint</h3>");
    Response.End();
}


</script>

<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Acceuil</title>

  <!-- Google Font: Source Sans Pro -->
  <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,400i,700&display=fallback" />
  <!-- Font Awesome -->
  <link rel="stylesheet" href="plugins/fontawesome-free/css/all.min.css" />
  <!-- Ionicons -->
  <link rel="stylesheet" href="https://code.ionicframework.com/ionicons/2.0.1/css/ionicons.min.css" />
  <!-- Tempusdominus Bootstrap 4 -->
  <link rel="stylesheet" href="plugins/tempusdominus-bootstrap-4/css/tempusdominus-bootstrap-4.min.css" />
  <!-- iCheck -->
  <link rel="stylesheet" href="plugins/icheck-bootstrap/icheck-bootstrap.min.css" />
  <!-- JQVMap -->
  <link rel="stylesheet" href="plugins/jqvmap/jqvmap.min.css"/>
  <!-- Theme style -->
  <link rel="stylesheet" href="dist/css/adminlte.min.css" />
  <!-- overlayScrollbars -->
  <link rel="stylesheet" href="plugins/overlayScrollbars/css/OverlayScrollbars.min.css" />
  <!-- Daterange picker -->
  <link rel="stylesheet" href="plugins/daterangepicker/daterangepicker.css" />
  <!-- summernote -->
  <link rel="stylesheet" href="plugins/summernote/summernote-bs4.min.css" />
  <!-- paramètres -->
  <script src="scriptparam.js"></script>
</head>
<body class="hold-transition sidebar-mini layout-fixed">
  
<form id="form1" runat="server">
  <div class="wrapper">
    <!-- Preloader -->
    <div class="preloader flex-column justify-content-center align-items-center">
      <img class="animation__shake" src="dist/img/AdminLTELogo.png" alt="AdminLTELogo" height="60" width="60">
    </div>

    <!-- Navbar -->
    <nav class="main-header navbar navbar-expand navbar-white navbar-light">
      <!-- Left navbar links -->
      <ul class="navbar-nav">
        <li class="nav-item">
          <a class="nav-link" data-widget="pushmenu" href="#" role="button"><i class="fas fa-bars"></i></a>
        </li>
        <li class="nav-item d-none d-sm-inline-block">
          <a href="main.aspx" class="nav-link active">Accueil</a>
        </li>
        <li class="nav-item d-none d-sm-inline-block">
          <a href="pages/_parametre/paramTypeOp.aspx" class="nav-link">Paramètres</a>
        </li>
        <li class="nav-item d-none d-sm-inline-block"  id="menuIdentification">
          <a href="pages/_identification/identification.aspx" class="nav-link">Identification</a>
        </li>
      </ul>
      <ul class="navbar-nav ml-auto">
        <li class="nav-item">
          <a href="auth/Logout.aspx" class="nav-link" role="button" title="Se déconnecter">
            <i class="fas fa-sign-out-alt"></i>
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" data-widget="fullscreen" href="#" role="button" title="Agrandir">
            <i class="fas fa-expand-arrows-alt"></i>
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" data-widget="control-sidebar" data-slide="true" href="#" role="button">
            <i class="fas fa-th-large"></i>
          </a>
        </li>
      </ul>
    </nav>
    <!-- /.navbar -->

    <!-- Main Sidebar Container -->
    <aside class="main-sidebar sidebar-dark-primary elevation-4">
      <!-- Brand Logo -->
      <a href="main.aspx" class="brand-link">
        <img src="dist/img/AdminLTELogo.png" alt="AdminLTE Logo" class="brand-image img-circle elevation-3" style="opacity: .8">
        <span class="brand-text font-weight-light">REGISTRE</span>
      </a>

      <!-- Sidebar -->
      <div class="sidebar">
        <!-- Sidebar user panel (optional) -->
        <div class="user-panel mt-3 pb-3 mb-3 d-flex justify-content-center">
          <div class="info text-center">
              <i class="text-primary mb-2"></i><br>
              <span id="navbarUsername" class="font-weight-bold text-white">
              </span>
          </div>
        </div>

        <!-- Sidebar Menu -->
        <nav class="mt-2">
          <ul class="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu" data-accordion="false">
            <!-- Add icons to the links using the .nav-icon class
                with font-awesome or any other icon font library -->
            <li class="nav-item menu-open">
              <a href="#" class="nav-link active">
                <i class="nav-icon fas fa-tachometer-alt"></i>
                <p>
                  Tableau de bord
                  <i class="right fas fa-angle-left"></i>
                </p>
              </a>
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
              <h1 class="m-0">Solde des Opérateurs</h1>
            </div><!-- /.col -->
            <div class="col-sm-6">
              <ol class="breadcrumb float-sm-right">
                <li class="breadcrumb-item">Accueil</li>
                <li class="breadcrumb-item active">Board</li>
              </ol>
            </div><!-- /.col -->
          </div><!-- /.row -->
        </div><!-- /.container-fluid -->
      </div>
      <!-- /.content-header -->

      <!-- Main content -->
      <section class="content">
        <div class="container-fluid">
          <!-- Small boxes (Stat box) -->
          <div class="row">
            <div class="col-lg-3 col-6">
              <!-- small box -->
              <div class="small-box bg-info">
                <div class="inner">
                  <h3>
                    <asp:Label ID="lblSoldeTotal" runat="server" /><sup>MGA</sup>
                  </h3>
                  <p>SOLDE TOTAL</p>
                </div>
                <div class="icon">
                  <i class="ion ion-bag"></i>
                </div>
                <a class="small-box-footer"><img src="dist/img/community-logo-free-vector.jpg" alt="Solde" style="height:80px; margin-left:10px;"></a>
              </div>
            </div>
            <!-- ./col -->
            <div class="col-lg-3 col-6">
              <!-- small box -->
              <div class="small-box bg-success">
                <div class="inner">
                  <h3>
                    <asp:Label ID="lblSoldeMvola" runat="server" /><sup>MGA</sup>
                  </h3>
                  <p>SOLDE Mvola</p>
                </div>
                <div class="icon">
                  <i class="ion ion-stats-bars"></i>
                </div>
                <a href="pages/mvola/lot.aspx" class="small-box-footer"><img src="dist/img/mvola2.png" alt="Orange Money" style="height:80px; margin-left:10px;"></a>
              </div>
            </div>
            <!-- ./col -->
            <div class="col-lg-3 col-6">
              <!-- small box -->
              <div class="small-box bg-warning">
                <div class="inner">
                  <h3>
                  <asp:Label ID="lblSoldeOrangeMoney" runat="server" /><sup>MGA</sup>
                  </h3>
                  <p>SOLDE Orange money</p>
                </div>
                <div class="icon">
                  <i class="ion ion-stats-bars"></i>
                </div>
                <a href="pages/orangemoney/lot.aspx" class="small-box-footer"><img src="dist/img/orange_money.jpg" alt="Orange Money" style="height:80px; margin-left:10px;"></a>
              </div>
            </div>
            <!-- ./col -->
            <div class="col-lg-3 col-6">
              <!-- small box -->
              <div class="small-box bg-danger">
                <div class="inner">
                  <h3>
                  <asp:Label ID="lblSoldeAirtelMoney" runat="server" /><sup>MGA</sup>
                  </h3>
                  <p>SOLDE Airtel money</p>
                </div>
                <div class="icon">
                  <i class="ion ion-stats-bars"></i>
                </div>
                <a href="pages/airtelmoney/lot.aspx" class="small-box-footer"><img src="dist/img/airtel_money.jpg" alt="Orange Money" style="height:80px; margin-left:10px;"></a>
              </div>
            </div>
            <!-- ./col -->
          </div>
          <!-- /.row -->
        </div><!-- /.container-fluid -->
      </section>
      <!-- /.content -->
    </div>

    <!-- Control Sidebar -->
    <aside class="control-sidebar control-sidebar-dark">
      <div class="p-3">
        <h5>Paramètres</h5>
        <hr />
        <div class="d-flex justify-content-between align-items-center mb-2">
          <span>Mode sombre</span>
          <label class="switch">
            <input type="checkbox" id="toggleDarkMode" />
            <span class="slider round"></span>
          </label>
        </div>
        <hr style="border: 1px solid white;" />
        <div id="licenceExpirationInfo" class="mb-2" style="color: lightgray; font-size: 0.9em;">
          Date d'expiration de la licence : <strong><%= expirationDateString %></strong>
        </div>
        <hr style="border: 1px solid white;" />
        <div class="float-right d-none d-sm-inline-block">
          <b>Version</b> 1.0.0
        </div>
      </div>
    </aside>
    <!-- /.control-sidebar -->
  </div>
</form>
<!-- ./wrapper -->

<!-- jQuery -->
<script>
  document.addEventListener("DOMContentLoaded", () => {
    if (userRole !== 0) {  // Si pas superadmin
      const menu = document.getElementById("menuIdentification");
      if (menu) {
        menu.style.display = "none";  // cache le menu
      }
    }
  });
</script>
<script src="plugins/jquery/jquery.min.js"></script>
<!-- jQuery UI 1.11.4 -->
<script src="plugins/jquery-ui/jquery-ui.min.js"></script>
<!-- Resolve conflict in jQuery UI tooltip with Bootstrap tooltip -->
<script>
  $.widget.bridge('uibutton', $.ui.button)
</script>
<!-- Bootstrap 4 -->
<script src="plugins/bootstrap/js/bootstrap.bundle.min.js"></script>
<!-- ChartJS -->
<script src="plugins/chart.js/Chart.min.js"></script>
<!-- Sparkline -->
<script src="plugins/sparklines/sparkline.js"></script>
<!-- JQVMap -->
<script src="plugins/jqvmap/jquery.vmap.min.js"></script>
<script src="plugins/jqvmap/maps/jquery.vmap.usa.js"></script>
<!-- jQuery Knob Chart -->
<script src="plugins/jquery-knob/jquery.knob.min.js"></script>
<!-- daterangepicker -->
<script src="plugins/moment/moment.min.js"></script>
<script src="plugins/daterangepicker/daterangepicker.js"></script>
<!-- Tempusdominus Bootstrap 4 -->
<script src="plugins/tempusdominus-bootstrap-4/js/tempusdominus-bootstrap-4.min.js"></script>
<!-- Summernote -->
<script src="plugins/summernote/summernote-bs4.min.js"></script>
<!-- overlayScrollbars -->
<script src="plugins/overlayScrollbars/js/jquery.overlayScrollbars.min.js"></script>
<!-- AdminLTE App -->
<script src="dist/js/adminlte.js"></script>
<!-- AdminLTE dashboard demo (This is only for demo purposes) -->
<script src="dist/js/pages/dashboard.js"></script>
<script src="pages/mode.js"></script>
</body>
</html>
