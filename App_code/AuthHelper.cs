using System;
using System.Configuration;
using System.Data.SqlClient;
using System.Web;
using System.Web.UI;

public static class AuthHelper
{
    // Récupération de la chaîne de connexion depuis le Web.config
    private static readonly string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;

    /// <summary>
    /// Centralise la vérification de session et de token
    /// </summary>
    public static void VerifySession(Page page)
    {
        HttpContext context = HttpContext.Current;

        // 1. Vérification de l'authentification
        if (context.Session["authenticated"] == null || !(bool)context.Session["authenticated"])
        {
            ForceLogout(page, false);
            return;
        }

        // 2. Vérification du token unique
        if (!IsTokenValid()) 
        {
            ForceLogout(page, true);
            return;
        }

        // 3. Mise à jour du nom dans la navbar si ce n'est pas un retour de formulaire
        if (!page.IsPostBack)
        {
            SetUsername(page);
        }
    }

    private static bool IsTokenValid()
    {
        var session = HttpContext.Current.Session;
        if (session["IDUSER"] == null || session["SESSION_TOKEN"] == null)
            return false;

        int idUser = (int)session["IDUSER"];
        string tokenSession = session["SESSION_TOKEN"].ToString();

        using (SqlConnection conn = new SqlConnection(connStr))
        {
            SqlCommand cmd = new SqlCommand(
                "SELECT SESSION_TOKEN FROM USERS WHERE IDUSER=@id", conn);
            cmd.Parameters.AddWithValue("@id", idUser);

            conn.Open();
            object tokenDb = cmd.ExecuteScalar();
            return tokenDb != null && tokenDb.ToString() == tokenSession;
        }
    }

    private static void SetUsername(Page page)
    {
        if (HttpContext.Current.Session["username"] == null) return;

        // Échappement pour éviter les erreurs JS si le nom contient une apostrophe
        string username = HttpContext.Current.Session["username"].ToString().Replace("'", "\\'");

        string script =
            "var el=document.getElementById('navbarUsername');" +
            "if(el){el.innerText='" + username + "';}";

        // Enregistre le script sur l'instance de la page fournie
        page.ClientScript.RegisterStartupScript(page.GetType(), "username", script, true);
    }

    private static void ForceLogout(Page page, bool otherPc)
    {
        HttpContext.Current.Session.Clear();
        HttpContext.Current.Session.Abandon();

        string url = otherPc ? "~/auth/Login.aspx?msg=other_pc" : "~/auth/Login.aspx";
        page.Response.Redirect(url, true);
    }
}