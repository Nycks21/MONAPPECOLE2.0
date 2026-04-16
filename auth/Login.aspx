<%@ Page Language="C#" AutoEventWireup="true" CodeFile="Login.aspx.cs" Inherits="Login" %>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
    <meta http-equiv="Pragma" content="no-cache" />
    <meta http-equiv="Expires" content="0" />
    <title>Connexion</title>

    <!-- Google Font: Source Sans Pro -->
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,400i,700&display=fallback"
    />
    <!-- Font Awesome -->
    <link rel="stylesheet" href="../../plugins/fontawesome-free/css/all.min.css" />
    <!-- icheck bootstrap -->
    <link rel="stylesheet" href="../../plugins/icheck-bootstrap/icheck-bootstrap.min.css" />
    <!-- Theme style -->
    <link rel="stylesheet" href="../../dist/css/adminlte.min.css" />
    <link rel="stylesheet" href="style.css" />
</head>
<body class="hold-transition login-page">
    <div class="login-box">
        <div class="card card-outline card-primary">
            <div class="card-header text-center">
                <a class="h2"><b>Gestion Scolaire</b></a>
            </div>
            <div class="card-body">
                <p class="login-box-msg">Connexion</p>
                <form id="form1" runat="server">
                    <asp:Label ID="lblLicenceInfo" runat="server" ForeColor="Red" CssClass="mb-2 d-block" Font-Bold="true"></asp:Label>
                    <asp:Label ID="lblUserLimitInfo" runat="server" ForeColor="Red" CssClass="mb-2 d-block" Font-Bold="true"></asp:Label>
                    <asp:Label ID="lblMessage" runat="server" ForeColor="Red" CssClass="mb-2 d-block"></asp:Label>
                    <asp:Panel ID="pnlErreur" runat="server" Visible="false" CssClass="error-box">
                        <asp:Label ID="lblErreur" runat="server"></asp:Label>
                    </asp:Panel>
                    <div class="input-group mb-3">
                        <asp:TextBox ID="txtUsername" CssClass="form-control" runat="server" Placeholder="Nom d'utilisateur"></asp:TextBox>
                        <div class="input-group-append">
                            <div class="input-group-text">
                                <span class="fas fa-user"></span>
                            </div>
                        </div>
                    </div>
                    <div class="input-group mb-3">
                        <asp:TextBox ID="txtPassword" CssClass="form-control" runat="server" TextMode="Password" Placeholder="Mot de passe"></asp:TextBox>
                        <div class="input-group-append">
                            <div class="input-group-text">
                                <span class="fas fa-lock"></span>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-12">
                            <asp:Button ID="btnLogin" CssClass="btn btn-primary btn-block" runat="server" Text="Valide" OnClick="btnLogin_Click" />
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- jQuery -->
    <script src="../plugins/jquery/jquery.min.js"></script>
    <!-- Bootstrap 4 -->
    <script src="../plugins/bootstrap/js/bootstrap.bundle.min.js"></script>
    <!-- AdminLTE App -->
    <script src="../dist/js/adminlte.min.js"></script>
    <script src="../dist/js/sweetalert2@11.js"></script>
    <script>
        (function () {
            // empêche le retour vers les pages protégées (après logout)
            history.pushState(null, document.title, location.href);
            window.addEventListener('popstate', function (event) {
                history.pushState(null, document.title, location.href);
                location.replace('/auth/Login.aspx');
            }, false);
        })();
    </script>
</body>
</html>
