<%@ Page Language="C#" AutoEventWireup="true" CodeFile="Error500.aspx.cs" Inherits="Error500" %>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8" />
    <title>Erreur Serveur</title>
    <link rel="stylesheet" href="../../dist/css/adminlte.min.css" />
    <link rel="stylesheet" href="../../plugins/fontawesome-free/css/all.min.css" />
</head>
<body class="hold-transition layout-top-nav">
    <div class="wrapper">
        <div class="content-wrapper">
            <div class="content-header text-center mt-5">
                <h1 class="text-danger">RELOAD PAGE</h1>
                <p>En mode développement</p>
            </div>

            <form id="form1" runat="server" class="text-center mt-4">
                <!-- 🔥 Bouton DEV -->
                <button type="button"
                        id="btnDevReload"
                        class="btn btn-warning btn-sm">
                    ⏸ Stop Live Reload
                </button>
            </form>
        </div>
    </div>

    <script src="../../plugins/jquery/jquery.min.js"></script>
    <script src="../../plugins/bootstrap/js/bootstrap.bundle.min.js"></script>

    <!-- 🔁 Script unique -->
    <script src="../../dist/js/devReload.js"></script>

</body>
</html>
