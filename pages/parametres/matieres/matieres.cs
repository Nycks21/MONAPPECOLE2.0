// matieres.cs — ASP.NET Web Forms / .NET Framework 4.8
// Toutes les dépendances sont natives : pas de NuGet requis.

using System;
using System.Configuration;
using System.Data.SqlClient;
using System.Web;
using System.Web.UI;

public partial class matieres : Page
{
    // ────────────────────────────────────────────
    // Chaîne de connexion depuis web.config
    // ────────────────────────────────────────────
    private readonly string connStr =
        ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;

    // ============================
    // PAGE_LOAD
    // ============================
    protected void Page_Load(object sender, EventArgs e)
    {
        // SÉCURITÉ : SESSION
        if (Session["authenticated"] == null || !(bool)Session["authenticated"])
        {
            ForceLogout(false);
            return;
        }

        // TOKEN (détection connexion depuis un autre poste)
        if (!IsTokenValid())
        {
            ForceLogout(true);
            return;
        }

        if (!IsPostBack)
        {
            SetUsername();
        }
    }

    // ============================
    // VALIDATION DU TOKEN
    // ============================
    private bool IsTokenValid()
    {
        if (Session["IDUSER"] == null || Session["SESSION_TOKEN"] == null)
            return false;

        int    idUser       = (int)Session["IDUSER"];
        string tokenSession = Session["SESSION_TOKEN"].ToString();

        using (SqlConnection conn = new SqlConnection(connStr))
        using (SqlCommand cmd = new SqlCommand(
            "SELECT SESSION_TOKEN FROM USERS WHERE IDUSER = @id", conn))
        {
            cmd.Parameters.AddWithValue("@id", idUser);
            conn.Open();
            object tokenDb = cmd.ExecuteScalar();
            return tokenDb != null && tokenDb.ToString() == tokenSession;
        }
    }

    // ============================
    // INJECTION DU NOM D'UTILISATEUR
    // CORRECTION : Newtonsoft.Json supprimé → HttpUtility.JavaScriptStringEncode
    // natif dans System.Web (disponible sans NuGet sur .NET Framework 4.8)
    // ============================
    private void SetUsername()
    {
        if (Session["username"] == null) return;

        // JavaScriptStringEncode échappe ', ", \, sauts de ligne, etc. → anti-XSS
        string safeUsername = HttpUtility.JavaScriptStringEncode(
            Session["username"].ToString());

        string script =
            "document.addEventListener('DOMContentLoaded', function () {" +
            "  var el = document.getElementById('navbarUsername');" +
            "  if (el) { el.textContent = '" + safeUsername + "'; }" +
            "});";

        ClientScript.RegisterStartupScript(GetType(), "setUsername", script, true);
    }

    // ============================
    // DÉCONNEXION FORCÉE
    // ============================
    private void ForceLogout(bool otherPc)
    {
        Session.Clear();
        Session.Abandon();

        string url = otherPc
            ? "~/auth/Login.aspx?msg=other_pc"
            : "~/auth/Login.aspx";

        Response.Redirect(url, true);
    }
}
