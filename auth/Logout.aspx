<%@ Page Language="C#" AutoEventWireup="true" %>

<script runat="server">
    protected void Page_Load(object sender, EventArgs e)
    {
        // 1) Détruire la session
        Session.Clear();
        Session.Abandon();

        // 2) Supprimer le cookie de session ASP.NET
        if (Request.Cookies["ASP.NET_SessionId"] != null)
        {
            var sessionCookie = new HttpCookie("ASP.NET_SessionId");
            sessionCookie.Expires = DateTime.Now.AddDays(-1);
            Response.Cookies.Add(sessionCookie);
        }

        // 3) Si tu utilises FormsAuthentication (ou cookie d'auth), forcer la suppression
        try
        {
            System.Web.Security.FormsAuthentication.SignOut();
            var authName = System.Web.Security.FormsAuthentication.FormsCookieName;
            if (Request.Cookies[authName] != null)
            {
                var authCookie = new HttpCookie(authName);
                authCookie.Expires = DateTime.Now.AddDays(-1);
                Response.Cookies.Add(authCookie);
            }
        }
        catch { /* ok si tu n'utilises pas FormsAuth */ }

        // 4) En-têtes anti-cache (important)
        Response.Cache.SetCacheability(System.Web.HttpCacheability.NoCache);
        Response.Cache.SetNoStore();
        Response.Cache.SetExpires(DateTime.UtcNow.AddYears(-1));
        Response.AppendHeader("Pragma", "no-cache");
        Response.AppendHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        Response.AppendHeader("Expires", "0");

        // 5) Redirection vers la page de login
        Response.Redirect("Login.aspx", true);
    }
</script>

<!DOCTYPE html>
<html>
<head runat="server">
    <title>Déconnexion...</title>
</head>
<body>
    <form id="form1" runat="server">
        <div>Déconnexion en cours... </div>
    </form>
</body>
</html>
